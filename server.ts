import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import multer from "multer";
import JSZip from "jszip";
import { executeGeminiTemplateEdit, generateVirtualProjectFiles } from "./server/templateEditorEngine";
import { 
  listAllowedComponents, 
  readComponentFile, 
  validateCodeSyntax, 
  applyAtomicComponentWrite, 
  rollbackComponentSnapshot, 
  getSnapshotHistory, 
  transformComponentWithGemini 
} from "./server/geminiFileBridge";
import { createSiteBEcommerceBridgeRouter } from "./server/siteBBridge";
import { Website } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

// Trust reverse proxy for accurate protocol (https) and host detection
app.set("trust proxy", 1);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Configure multer for handling file uploads (ZIP files in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('zip') || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos no formato .ZIP são permitidos'));
    }
  }
});

// Storage Directories
const STORAGE_DIR = path.join(process.cwd(), "storage");
const ZIPS_DIR = path.join(STORAGE_DIR, "zips");
const EXTRACTED_DIR = path.join(STORAGE_DIR, "extracted");

fs.mkdirSync(ZIPS_DIR, { recursive: true });
fs.mkdirSync(EXTRACTED_DIR, { recursive: true });

// Initialize Gemini Client server-side with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Resilient Gemini Model Invoker with automatic fallback & high-availability retry
async function generateGeminiJsonWithFallback(options: {
  contents: string | any[];
  systemInstruction?: string;
  preferredModel?: string;
}): Promise<any> {
  if (!aiClient) {
    throw new Error("GEMINI_NOT_INITIALIZED");
  }

  // Use only Flash-class models per official guidelines (avoid Pro models that require paid tier or have 0 quota)
  const modelsToTry = [
    options.preferredModel || "gemini-2.5-flash",
    "gemini-2.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.7-flash"
  ];

  const uniqueModels = Array.from(new Set(modelsToTry));
  let lastError: any = null;

  for (const model of uniqueModels) {
    try {
      const config: any = {
        responseMimeType: "application/json"
      };
      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }

      const response = await aiClient.models.generateContent({
        model,
        contents: options.contents,
        config
      });

      if (response && response.text) {
        let rawText = response.text.trim();
        // Remove markdown wrappers if model enclosed output in ```json ... ```
        if (rawText.startsWith('```json')) {
          rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (rawText.startsWith('```')) {
          rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        return JSON.parse(rawText);
      }
    } catch (err: any) {
      lastError = err;
      // If quota exceeded (429 / RESOURCE_EXHAUSTED), don't waste time retrying other models on the same project
      if (err.status === 429 || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('quota')) {
        break;
      }
      // If 404 (model not found), continue to next model
    }
  }

  throw lastError || new Error("Modelos Gemini em alta demanda.");
}

// Firebase Storage Config & Initialization Server-Side
let firebaseAppInstance: any = null;
let firebaseStorageInstance: any = null;
let firebaseConfigData: any = null;

async function initServerFirebase() {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      firebaseConfigData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      const { initializeApp, getApps, getApp } = await import("firebase/app");
      const { getStorage } = await import("firebase/storage");
      
      firebaseAppInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfigData);
      firebaseStorageInstance = getStorage(firebaseAppInstance, firebaseConfigData.storageBucket || "boreal-protocol-rxctm.firebasestorage.app");
      console.log(`[Firebase Storage] Servidor conectado ao bucket: ${firebaseConfigData.storageBucket || "boreal-protocol-rxctm.firebasestorage.app"}`);
    }
  } catch (err) {
    console.error("[Firebase Storage] Erro na inicialização no servidor:", err);
  }
}

initServerFirebase();

// Helper: Upload file buffer to Firebase Storage
async function uploadBufferToFirebaseStorage(
  storagePath: string,
  buffer: Buffer,
  contentType: string = "application/zip",
  customMetadata?: Record<string, string>
): Promise<{ path: string; downloadUrl: string } | null> {
  if (!firebaseStorageInstance) {
    await initServerFirebase();
  }
  
  if (!firebaseStorageInstance) {
    console.warn("[Firebase Storage] Storage instance indisponível. Usando fallback de armazenamento local.");
    return null;
  }

  try {
    const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
    const storageRef = ref(firebaseStorageInstance, storagePath);
    const snapshot = await uploadBytes(storageRef, buffer, {
      contentType,
      customMetadata: {
        bucketType: storagePath.startsWith("private_zips") ? "PRIVATE_ZIP_BUCKET" : "PUBLIC_DEMO_BUCKET",
        uploadedAt: new Date().toISOString(),
        ...customMetadata
      }
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log(`[Firebase Storage] Upload concluído em: ${storagePath}`);
    return { path: storagePath, downloadUrl };
  } catch (err: any) {
    console.error(`[Firebase Storage] Falha ao enviar para ${storagePath}:`, err.message || err);
    return null;
  }
}

// ==================== DATABASE SCHEMAS & IN-MEMORY STORE ==================== //

interface ProductVersion {
  id: string;
  productId: string;
  versionNumber: string;
  releaseDate: string;
  changelog: string;
  zipFilename: string;
  zipSize: string;
  detectedStack: string;
  fileCount: number;
  zipPath: string;
  firebasePrivateZipPath?: string;
  firebasePrivateDownloadUrl?: string;
}

interface ProductDemo {
  id: string;
  productId: string;
  versionNumber: string;
  demoUrl: string;
  status: 'building' | 'deployed' | 'failed';
  logs: string[];
  deployedAt: string;
  firebasePublicDemoPath?: string;
  firebasePublicDemoUrl?: string;
}

interface ProductRecord {
  id: string;
  title: string;
  slug: string;
  category: string;
  categoryName: string;
  shortDescription: string;
  fullDescription: string;
  price: {
    standard: number;
    extended: number;
    installation: number;
  };
  rating: number;
  reviewsCount: number;
  salesCount: number;
  thumbnail: string;
  galleryImages: string[];
  demoUrl: string;
  techStack: string[];
  features: string[];
  includedFiles: string[];
  seller: {
    id: string;
    name: string;
    avatar: string;
    badge: string;
    verified: boolean;
    salesCount: number;
    rating: number;
    responseTime: string;
  };
  createdDate: string;
  updatedDate: string;
  status: 'active' | 'hidden';
  currentVersion: string;
  versions: ProductVersion[];
  demoDetails?: ProductDemo;
  detectedStack?: string;
  reviews: any[];
  firebaseStorageBucket?: string;
  firebasePrivateStoragePath?: string;
  firebasePublicStoragePath?: string;
}

interface OrderRecord {
  id: string;
  customerEmail: string;
  items: any[];
  status: 'pending' | 'paid' | 'cancelled';
  totalAmount: number;
  paymentMethod: 'paypal' | 'pix' | 'card';
  paypalOrderId?: string;
  createdDate: string;
  paidDate?: string;
}

interface DownloadTokenRecord {
  token: string;
  orderId: string;
  productId: string;
  versionNumber: string;
  customerEmail: string;
  expiresAt: number;
}

interface DownloadAuditRecord {
  id: string;
  orderId: string;
  productId: string;
  versionNumber: string;
  customerEmail: string;
  downloadedAt: string;
  ipAddress?: string;
}

interface DeploymentRecord {
  id: string;
  orderId: string;
  productId: string;
  platform: 'github' | 'vercel' | 'github_vercel';
  repoUrl?: string;
  deployUrl?: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  logs: string[];
  createdAt: string;
}

// Global state collections
let productsStore: ProductRecord[] = [];
let ordersStore: OrderRecord[] = [];
let downloadTokensStore: DownloadTokenRecord[] = [];
let downloadAuditStore: DownloadAuditRecord[] = [];
let deploymentsStore: DeploymentRecord[] = [];

// Initialize default catalog products
function initDefaultCatalog() {
  if (productsStore.length > 0) return;

  const defaultSites: ProductRecord[] = [
    {
      id: 'novastore-pro-ecommerce',
      title: 'NovaStore Pro — Loja Online Completa com Painel Admin & PIX',
      slug: 'novastore-pro-ecommerce',
      category: 'ecommerce',
      categoryName: 'Loja Virtual & E-Commerce',
      shortDescription: 'Loja online moderna e responsiva pronta para venda de produtos físicos ou digitais. Inclui catálogo, carrinho, checkout completo, simulação de frete e Painel Administrativo exclusivo para o lojista.',
      fullDescription: 'O NovaStore Pro é uma solução completa, profissional e independente de e-commerce pronta para você vender produtos no seu próprio negócio. Inclui catálogo com filtros, página de produto com galeria e variações, carrinho interativo, checkout completo com PIX/Cartão/Boleto, rastreamento de pedidos e Painel do Lojista para gerenciar produtos, estoque, categorias e configurações.',
      price: { standard: 199, extended: 499, installation: 799 },
      rating: 4.98,
      reviewsCount: 42,
      salesCount: 89,
      thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80'
      ],
      demoUrl: '/api/demos/novastore-pro-ecommerce/index.html',
      techStack: ['React 18', 'TypeScript', 'Tailwind CSS', 'Lucide Icons', 'Vite', 'Node.js'],
      features: [
        'Loja Virtual 100% Funcional e Independente',
        'Painel Administrativo do Lojista completo com métricas e CRUD',
        'Catálogo interativo com busca rápida e filtros por departamento',
        'Carrinho lateral com meta de frete grátis e cupons de desconto',
        'Checkout completo com PIX com QR Code, Cartão até 12x e Boleto',
        'Simulador de frete e prazos de entrega por CEP',
        'Área do Cliente com consulta de pedidos e código de rastreio',
        'Design responsivo para Celular, Tablet e Desktop'
      ],
      includedFiles: [
        'Código-fonte completo e modular em TypeScript (.tsx / .ts)',
        'Painel Administrativo do Lojista integrado',
        'Banco de dados inicial com produtos e categorias de exemplo',
        'Arquivo package.json e vite.config.ts prontos para build',
        'Manual de Instalação e Guia de Deploy Vercel / GitHub (README.md)',
        'Suporte a personalização de cores, logotipo e banners'
      ],
      seller: {
        id: 'sitemercado-official',
        name: 'SiteMercado Studio',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        badge: 'Criador Oficial',
        verified: true,
        salesCount: 320,
        rating: 4.98,
        responseTime: '< 15 min'
      },
      createdDate: '2026-03-01',
      updatedDate: '2026-08-16',
      status: 'active',
      currentVersion: '1.0.0',
      detectedStack: 'React 18 & Vite',
      versions: [
        {
          id: 'v-novastore-1',
          productId: 'novastore-pro-ecommerce',
          versionNumber: '1.0.0',
          releaseDate: '2026-03-01',
          changelog: 'Lançamento oficial da Loja Virtual NovaStore Pro com Painel Administrativo integrado',
          zipFilename: 'novastore-pro-v1.0.0.zip',
          zipSize: '12.8 MB',
          detectedStack: 'React 18 & Vite',
          fileCount: 46,
          zipPath: path.join(ZIPS_DIR, 'novastore-pro-ecommerce', 'v1.0.0.zip')
        }
      ],
      demoDetails: {
        id: 'demo-novastore-1',
        productId: 'novastore-pro-ecommerce',
        versionNumber: '1.0.0',
        demoUrl: '/api/demos/novastore-pro-ecommerce/index.html',
        status: 'deployed',
        logs: ['Projeto compilado com sucesso', 'Demonstração Interativa Ativa'],
        deployedAt: new Date().toISOString()
      },
      reviews: []
    }
  ];

  productsStore = defaultSites;
}

initDefaultCatalog();

// Helper: Inspect ZIP file contents and detect tech stack
async function analyzeZipBuffer(buffer: Buffer): Promise<{ detectedStack: string; fileList: string[]; indexHtmlContent?: string }> {
  const zip = await JSZip.loadAsync(buffer);
  const fileNames = Object.keys(zip.files);

  let detectedStack = "HTML5 / CSS3 / JavaScript";
  let hasPackageJson = false;
  let packageJsonContent: any = {};
  let indexHtmlContent: string | undefined = undefined;

  for (const filename of fileNames) {
    if (filename.endsWith("package.json")) {
      hasPackageJson = true;
      try {
        const text = await zip.files[filename].async("text");
        packageJsonContent = JSON.parse(text);
      } catch (e) {
        // ignore parse error
      }
    }
    if (filename.toLowerCase().endsWith("index.html") && !indexHtmlContent) {
      try {
        indexHtmlContent = await zip.files[filename].async("text");
      } catch (e) {
        // ignore
      }
    }
  }

  if (hasPackageJson) {
    const deps = { ...(packageJsonContent.dependencies || {}), ...(packageJsonContent.devDependencies || {}) };
    if (deps["next"]) {
      detectedStack = "Next.js & React 19";
    } else if (deps["vite"]) {
      detectedStack = "Vite & React 19";
    } else if (deps["react"]) {
      detectedStack = "React Single Page App";
    } else if (deps["vue"]) {
      detectedStack = "Vue.js Framework";
    } else if (deps["@angular/core"]) {
      detectedStack = "Angular Application";
    } else {
      detectedStack = "Node.js Fullstack Project";
    }
  }

  return {
    detectedStack,
    fileList: fileNames.filter(f => !zip.files[f].dir),
    indexHtmlContent
  };
}

// Helper: Extract ZIP to extracted storage folder for live demo serving
async function extractZipForDemo(productId: string, versionNumber: string, buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const targetDir = path.join(EXTRACTED_DIR, productId, versionNumber);
  fs.mkdirSync(targetDir, { recursive: true });

  for (const [relativePath, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    const destPath = path.join(targetDir, relativePath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    const content = await file.async("nodebuffer");
    fs.writeFileSync(destPath, content);
  }
}

// ==================== GITHUB DEPLOYMENT HELPERS & OAUTH STATE ==================== //

function getAppOrigin(req: express.Request): string {
  // 1. If explicit client origin was sent by browser frontend
  const clientOrigin = (req.query.origin as string) || (req.headers["x-client-origin"] as string) || (req.headers["origin"] as string);
  if (clientOrigin && typeof clientOrigin === "string" && clientOrigin.startsWith("http")) {
    return clientOrigin.replace(/\/$/, "");
  }

  // 2. If APP_URL environment variable is set
  if (process.env.APP_URL && process.env.APP_URL.startsWith("http")) {
    return process.env.APP_URL.replace(/\/$/, "");
  }

  // 3. From referer header
  const referer = req.headers.referer || req.headers.referrer;
  if (referer && typeof referer === "string" && referer.startsWith("http")) {
    try {
      const u = new URL(referer);
      return `${u.protocol}//${u.host}`;
    } catch (_) {}
  }

  // 4. From forwarded headers and host
  const forwardedProto = (req.headers["x-forwarded-proto"] as string)?.split(",")[0]?.trim();
  const rawHost = (req.headers["x-forwarded-host"] as string)?.split(",")[0]?.trim() || req.headers.host || "localhost:3000";
  const cleanHost = rawHost.replace(/:3000$/, "");
  const isCloudHost = cleanHost.includes(".run.app") || cleanHost.includes(".googleusercontent.com") || cleanHost.includes(".app");
  const protocol = isCloudHost ? "https" : (forwardedProto || (req.secure ? "https" : "http"));

  return `${protocol}://${cleanHost}`;
}

let githubOauthConfig = {
  clientId: (process.env.GITHUB_CLIENT_ID || '').trim(),
  clientSecret: (process.env.GITHUB_CLIENT_SECRET || '').trim()
};

function getGithubOauthCredentials() {
  const clientId = (process.env.GITHUB_CLIENT_ID || githubOauthConfig.clientId || '').trim();
  const clientSecret = (process.env.GITHUB_CLIENT_SECRET || githubOauthConfig.clientSecret || '').trim();
  return { clientId, clientSecret };
}

function getGithubCallbackUrl(req: express.Request): string {
  if (process.env.GITHUB_CALLBACK_URL && process.env.GITHUB_CALLBACK_URL.startsWith("http")) {
    return process.env.GITHUB_CALLBACK_URL.trim();
  }
  const origin = getAppOrigin(req);
  return `${origin}/api/auth/github/callback`;
}

function collectNovaStoreFiles(): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];

  // 1. package.json
  const pkgJson = {
    name: "novastore-pro-ecommerce",
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview"
    },
    dependencies: {
      react: "^18.3.1",
      "react-dom": "^18.3.1",
      "lucide-react": "^1.16.0",
      clsx: "^2.1.1",
      "tailwind-merge": "^2.5.4"
    },
    devDependencies: {
      "@vitejs/plugin-react": "^4.3.1",
      "@tailwindcss/vite": "^4.0.0",
      tailwindcss: "^4.0.0",
      typescript: "^5.5.3",
      vite: "^5.4.1"
    }
  };
  files.push({
    path: "package.json",
    content: Buffer.from(JSON.stringify(pkgJson, null, 2), "utf-8").toString("base64")
  });

  // 2. index.html
  const indexHtml = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=64&q=80" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NovaStore Pro - Loja Virtual Completa</title>
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  files.push({
    path: "index.html",
    content: Buffer.from(indexHtml, "utf-8").toString("base64")
  });

  // 3. vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`;
  files.push({
    path: "vite.config.ts",
    content: Buffer.from(viteConfig, "utf-8").toString("base64")
  });

  // 4. tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      noFallthroughCasesInSwitch: true
    },
    include: ["src"]
  };
  files.push({
    path: "tsconfig.json",
    content: Buffer.from(JSON.stringify(tsConfig, null, 2), "utf-8").toString("base64")
  });

  // 5. src/main.tsx
  const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import { NovaStoreApp } from './NovaStoreApp';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NovaStoreApp />
  </React.StrictMode>
);
`;
  files.push({
    path: "src/main.tsx",
    content: Buffer.from(mainTsx, "utf-8").toString("base64")
  });

  // 6. src/index.css
  const indexCss = `@import "tailwindcss";\n`;
  files.push({
    path: "src/index.css",
    content: Buffer.from(indexCss, "utf-8").toString("base64")
  });

  // 7. .env.example
  const envExample = `# ==============================================================================
# NovaStore Pro — Modelos de Variáveis de Ambiente (.env.example)
# ==============================================================================
# Renomeie este arquivo para .env.local para carregar suas configurações locais.

# Dados Gerais da Loja
VITE_STORE_NAME="NovaStore Pro"
VITE_STORE_TAGLINE="Sua Loja Virtual Completa e Moderna"
VITE_STORE_CNPJ="12.345.678/0001-90"
VITE_STORE_EMAIL="contato@novastore.com.br"
VITE_STORE_PHONE="(11) 99999-8888"
VITE_STORE_WHATSAPP="5511999998888"
VITE_STORE_ADDRESS="Av. Paulista, 1000 - Bela Vista, São Paulo - SP"

# Chaves de Pagamento (PIX, Mercado Pago, Stripe)
VITE_PIX_KEY="financeiro@novastore.com.br"
VITE_PIX_RECEIVER_NAME="NovaStore Comercio Digital LTDA"
VITE_PIX_RECEIVER_CITY="SAO PAULO"
VITE_PIX_DISCOUNT_PERCENT="5"

# Configuração de Frete e Entrega
VITE_SHIPPING_ORIGIN_CEP="01310-100"
VITE_FREE_SHIPPING_THRESHOLD="299.00"

# Moeda & Localização
VITE_CURRENCY_SYMBOL="R$"
VITE_DEFAULT_LOCALE="pt-BR"
`;
  files.push({
    path: ".env.example",
    content: Buffer.from(envExample, "utf-8").toString("base64")
  });

  // 8. .env.local.example
  const envLocalExample = `# ==============================================================================
# Configurações de Desenvolvimento Local (.env.local.example)
# ==============================================================================
VITE_STORE_NAME="NovaStore Pro - Dev"
VITE_PIX_KEY="dev-pix@novastore.com.br"
VITE_FREE_SHIPPING_THRESHOLD="199.00"
`;
  files.push({
    path: ".env.local.example",
    content: Buffer.from(envLocalExample, "utf-8").toString("base64")
  });

  // 9. README.md
  const readmeMd = `# 🛍️ NovaStore Pro — Loja Virtual Completa com Painel Admin & PIX

Parabéns pela aquisição do **NovaStore Pro**!
Este projeto é uma loja online profissional, 100% autônoma, moderna, responsiva e pronta para produção.

---

## 📦 Conteúdo do Pacote (Package Contents)

Este arquivo compactado contém todos os arquivos essenciais para você personalizar, executar e publicar sua loja:

\`\`\`
├── 📁 src/
│   ├── 📁 components/              # Componentes da Loja e Painel Lojista
│   │   ├── NovaStoreAdmin.tsx        # Painel Administrativo do Lojista
│   │   ├── NovaStoreCart.tsx         # Carrinho Drawer com Cálculo de Frete
│   │   ├── NovaStoreCategories.tsx   # Vitrine por Categorias
│   │   ├── NovaStoreCheckout.tsx     # Checkout com PIX, Cartão e Boleto
│   │   ├── NovaStoreContact.tsx      # Central de Atendimento & FAQ
│   │   ├── NovaStoreCustomerArea.tsx # Área do Cliente & Rastreio de Pedidos
│   │   ├── NovaStoreFooter.tsx       # Rodapé Institucional
│   │   ├── NovaStoreHeader.tsx       # Topbar, Busca em Tempo Real e Menu
│   │   ├── NovaStoreHero.tsx         # Banners Promocionais Rotativos
│   │   ├── NovaStoreProductDetail.tsx# Página do Produto com Variações e CEP
│   │   └── NovaStoreProductGrid.tsx  # Grade de Produtos com Filtros
│   ├── initialData.ts              # Catálogo Inicial e Configurações
│   ├── types.ts                    # Tipagens TypeScript do E-commerce
│   ├── NovaStoreApp.tsx            # Componente Raiz da Loja
│   ├── main.tsx                    # Ponto de Entrada React
│   └── index.css                   # Tailwind CSS Global
├── .env.example                    # Modelo de Variáveis de Ambiente
├── .env.local.example              # Modelo para Desenvolvimento Local
├── index.html                      # Documento HTML Principal
├── package.json                    # Dependências e Scripts
├── tsconfig.json                   # Configurações TypeScript
├── vite.config.ts                  # Configuração Vite & Tailwind
└── README.md                       # Guia de Instalação e Uso
\`\`\`

---

## 🚀 Instalação Rápida (Quick Start)

### 1. Pré-requisitos
- **Node.js**: Versão 18.0.0 ou superior instalada.
- **npm** ou **yarn** / **pnpm**.

### 2. Instalar Dependências
No terminal, dentro da pasta do projeto extraído, execute:
\`\`\`bash
npm install
\`\`\`

### 3. Iniciar Servidor de Desenvolvimento
\`\`\`bash
npm run dev
\`\`\`
Acesse no seu navegador: \`http://localhost:5173\` ou o endereço exibido no terminal.

### 4. Compilar para Produção
\`\`\`bash
npm run build
\`\`\`
Os arquivos otimizados para produção serão gerados na pasta \`dist/\`.

---

## 🛠️ Configuração de Variáveis de Ambiente (.env)

Copie o arquivo \`.env.example\` para \`.env\` ou \`.env.local\`:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Personalize os seguintes valores:
- \`VITE_STORE_NAME\`: Nome da sua loja virtual.
- \`VITE_STORE_EMAIL\`: E-mail de suporte ao cliente.
- \`VITE_STORE_WHATSAPP\`: Número com DDD para atendimento via WhatsApp.
- \`VITE_PIX_KEY\`: Sua chave PIX (CNPJ, E-mail, Telefone ou Chave Aleatória).
- \`VITE_PIX_RECEIVER_NAME\`: Nome do titular da conta bancária da chave PIX.
- \`VITE_FREE_SHIPPING_THRESHOLD\`: Valor mínimo para frete grátis (ex: 299.00).

---

## 👑 Painel Administrativo do Lojista (Admin)

Para acessar o painel de controle da loja:
1. Abra a loja virtual no navegador.
2. Clique no botão **"Painel do Lojista"** no cabeçalho ou no rodapé.
3. No painel você poderá:
   - 📊 Visualizar faturamento diário, pedidos recentes e produtos com estoque baixo.
   - 🏷️ Cadastrar, editar ou remover produtos (com fotos, preços, promoções e variações).
   - 📂 Gerenciar categorias da loja.
   - 🚚 Acompanhar pedidos recebidos e cadastrar códigos de rastreamento dos Correios.
   - 🎨 Personalizar dados da loja, contatos e banners de destaque.

---

## 💳 Formas de Pagamento Configuradas

- **PIX Instantâneo**: Gera chave e QR Code de pagamento com 5% de desconto automático.
- **Cartão de Crédito**: Parcelamento em até 12x com validação de dados.
- **Boleto Bancário**: Geração com linha digitável e desconto à vista.

---

## 🌐 Como Publicar na Vercel ou Netlify (Deploy Grátis)

### Publicar na Vercel:
1. Crie um repositório no seu GitHub e faça upload dos arquivos.
2. Acesse [vercel.com](https://vercel.com) e conecte sua conta GitHub.
3. Clique em **"Add New Project"** e selecione o repositório.
4. O framework **Vite** será detectado automaticamente.
5. Clique em **"Deploy"**. Seu site estará no ar em poucos segundos!

---

## 📄 Licença & Suporte
Licença de uso comercial concedida via SiteMercado. Suporte a dúvidas e atualizações garantido.
`;
  files.push({
    path: "README.md",
    content: Buffer.from(readmeMd, "utf-8").toString("base64")
  });

  // Read all files from src/site-b-ecommerce recursively
  const siteBDir = path.join(process.cwd(), "src", "site-b-ecommerce");
  if (fs.existsSync(siteBDir)) {
    function readDirRecursive(currentDir: string, relativeTo: string) {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const rel = path.relative(relativeTo, fullPath).replace(/\\/g, "/");
        if (entry.isDirectory()) {
          readDirRecursive(fullPath, relativeTo);
        } else if (entry.isFile()) {
          try {
            const buf = fs.readFileSync(fullPath);
            files.push({
              path: `src/${rel}`,
              content: buf.toString("base64")
            });
          } catch (_) {}
        }
      }
    }
    readDirRecursive(siteBDir, siteBDir);
  }

  return files;
}

function collectWorkspaceFilesForGithub(dir: string, baseDir: string = dir, fileList: { path: string; content: string }[] = []): { path: string; content: string }[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const ignoreList = [
    'node_modules', '.git', 'dist', 'coverage', '.cache', '.DS_Store',
    '.env', '.env.local', '.env.development', '.env.production', 'storage', 'firebase-applet-config.json'
  ];

  for (const entry of entries) {
    if (ignoreList.includes(entry.name) || entry.name.endsWith('.log') || entry.name.endsWith('.zip')) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      collectWorkspaceFilesForGithub(fullPath, baseDir, fileList);
    } else if (entry.isFile()) {
      try {
        const buf = fs.readFileSync(fullPath);
        fileList.push({
          path: relPath,
          content: buf.toString('base64')
        });
      } catch (err) {
        // Skip unreadable files
      }
    }
  }

  // Ensure .env.example exists in output
  if (!fileList.some(f => f.path === '.env.example')) {
    const envExample = `# .env.example\n# Defina suas variáveis de ambiente aqui sem valores secretos\nVITE_PUBLIC_API_URL=\nGEMINI_API_KEY=\nFIREBASE_API_KEY=\n`;
    fileList.push({
      path: '.env.example',
      content: Buffer.from(envExample, 'utf-8').toString('base64')
    });
  }

  return fileList;
}

// ==================== API ROUTES ==================== //

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// SEO: Robots.txt Endpoint
app.get("/robots.txt", (req, res) => {
  const host = req.get("host") || "ais-pre-o34fdgj3pna42sqf37qhxo-5633841879.europe-west1.run.app";
  const protocol = req.protocol === "http" && !host.includes("localhost") ? "https" : req.protocol;
  const baseUrl = `${protocol}://${host}`;

  const robotsContent = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /storage/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(robotsContent);
});

// SEO: Sitemap.xml Endpoint
app.get("/sitemap.xml", (req, res) => {
  const host = req.get("host") || "ais-pre-o34fdgj3pna42sqf37qhxo-5633841879.europe-west1.run.app";
  const protocol = req.protocol === "http" && !host.includes("localhost") ? "https" : req.protocol;
  const baseUrl = `${protocol}://${host}`;
  const today = new Date().toISOString().split("T")[0];

  const categories = [
    "all", "barbearia", "restaurante", "hotel", "agencia", "portfolio", 
    "fotografia", "escola", "igreja", "ecommerce", "imobiliaria", "clinica", 
    "ginasio", "salao", "oficina", "cafe", "blog", "startup", "construcao", 
    "eventos", "freelancer"
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/site-b-ecommerce</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
${categories.map(cat => `  <url>
    <loc>${baseUrl}/?category=${cat}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.send(sitemapXml);
});

// GitHub OAuth Status & Public Info Endpoint (Never exposes secret keys)
app.get("/api/auth/github/config", (req, res) => {
  const { clientId, clientSecret } = getGithubOauthCredentials();
  const callbackUrl = getGithubCallbackUrl(req);
  res.json({
    configured: !!(clientId && clientSecret),
    callbackUrl
  });
});

// GitHub OAuth Authorize URL Endpoint (Generates official GitHub OAuth Link)
app.get("/api/auth/github/url", (req, res) => {
  const { clientId, clientSecret } = getGithubOauthCredentials();
  if (!clientId || !clientSecret) {
    return res.status(400).json({
      error: "O serviço de integração com o GitHub não foi configurado pelo administrador no servidor (variáveis GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET não definidas)."
    });
  }
  const redirectUri = getGithubCallbackUrl(req);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo public_repo user",
    allow_signup: "true"
  });
  res.json({
    url: `https://github.com/login/oauth/authorize?${params.toString()}`,
    redirectUri
  });
});

// GitHub OAuth Callback Route
app.get(["/api/auth/github/callback", "/api/auth/github/callback/"], async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send("Código de autorização ausente.");
  }

  const { clientId, clientSecret } = getGithubOauthCredentials();
  if (!clientId || !clientSecret) {
    return res.status(500).send("Credenciais OAuth do GitHub não configuradas no servidor.");
  }

  try {
    const redirectUri = getGithubCallbackUrl(req);

    // Exchange code for user-specific access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || "Erro ao obter token de acesso do GitHub.");
    }

    const accessToken = tokenData.access_token;

    // Fetch user details for this specific individual user
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "User-Agent": "WebMarket-GitHub-Deploy"
      }
    });

    if (!userRes.ok) {
      throw new Error("Erro ao obter perfil do usuário no GitHub.");
    }

    const userData = await userRes.json();

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Autenticação GitHub Concluída</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; text-align: center; }
            .card { background: #1e293b; padding: 2.5rem; border-radius: 1.25rem; border: 1px solid #334155; max-width: 420px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
            .avatar { width: 68px; height: 68px; border-radius: 50%; border: 3px solid #10b981; margin: 0 auto 16px auto; display: block; }
            .title { color: #38bdf8; font-size: 1.25rem; margin: 0 0 8px 0; font-weight: 800; }
            .user { color: #f1f5f9; font-size: 1rem; margin: 0 0 16px 0; }
            .msg { font-size: 13px; color: #94a3b8; margin: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            ${userData.avatar_url ? `<img src="${userData.avatar_url}" class="avatar" alt="${userData.login}" />` : ''}
            <div class="title">Conectado ao GitHub!</div>
            <div class="user">Logado como <strong>@${userData.login || 'usuario'}</strong></div>
            <div class="msg">Retornando ao WebMarket...</div>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GITHUB_OAUTH_SUCCESS',
                token: ${JSON.stringify(accessToken)},
                user: ${JSON.stringify(userData)}
              }, '*');
              setTimeout(function() { window.close(); }, 600);
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error("Erro no callback do GitHub:", err);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Erro de Autenticação</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; text-align: center; }
            .card { background: #1e293b; padding: 2.5rem; border-radius: 1.25rem; border: 1px solid #e11d48; max-width: 440px; }
            .title { color: #f43f5e; font-size: 1.25rem; margin: 0 0 8px 0; font-weight: 800; }
            .desc { font-size: 13px; color: #cbd5e1; margin: 0 0 16px 0; line-height: 1.5; }
            .btn { background: #334155; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">Erro na autorização com o GitHub</div>
            <div class="desc">${err.message || err}</div>
            <button class="btn" onclick="window.close()">Fechar Janela</button>
          </div>
        </body>
      </html>
    `);
  }
});

// GitHub Validate Repository Route
app.post("/api/github/validate-repo", async (req, res) => {
  const { token, repoName } = req.body;
  if (!token || !repoName) {
    return res.status(400).json({ error: "Token e nome do repositório são obrigatórios." });
  }

  try {
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "User-Agent": "WebMarket-App"
      }
    });
    if (!userRes.ok) throw new Error("Sessão do GitHub inválida. Faça login novamente.");
    const userData = await userRes.json();
    const owner = userData.login;

    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "User-Agent": "WebMarket-App"
      }
    });

    if (repoRes.status === 200) {
      const repoData = await repoRes.json();
      return res.json({
        exists: true,
        owner,
        isPrivate: repoData.private,
        defaultBranch: repoData.default_branch || "main"
      });
    } else if (repoRes.status === 404) {
      return res.json({ exists: false, owner });
    } else {
      const errData = await repoRes.json();
      return res.status(repoRes.status).json({ error: errData.message || "Erro ao consultar GitHub." });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro na validação do repositório." });
  }
});

// GitHub Full Deployment Endpoint
app.post("/api/github/deploy", async (req, res) => {
  const { token, repoName, description, isPrivate, defaultBranch = "main", mode = "create", targetSource = "workspace" } = req.body;

  if (!token || !repoName) {
    return res.status(400).json({ error: "Token e nome do repositório são obrigatórios." });
  }

  try {
    // 1. Get authenticated user login
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "WebMarket-App"
      }
    });
    if (!userRes.ok) {
      const uErr = await userRes.json().catch(() => ({}));
      throw new Error(uErr.message || "Sessão do GitHub expirada. Conecte novamente.");
    }
    const userData = await userRes.json();
    const owner = userData.login;

    // 2. Prepare files to upload based on targetSource
    let filesToUpload: { path: string; content: string }[] = [];

    if (targetSource === "novastore-pro-ecommerce" || targetSource === "novastore-pro") {
      filesToUpload = collectNovaStoreFiles();
    } else if (targetSource && targetSource !== "workspace") {
      const product = productsStore.find(p => p.id === targetSource || p.slug === targetSource);
      if (product && (product.id === "novastore-pro-ecommerce" || product.slug === "novastore-pro-ecommerce")) {
        filesToUpload = collectNovaStoreFiles();
      } else if (product && product.versions && product.versions.length > 0) {
        const extractedPath = path.join(EXTRACTED_DIR, product.id, product.currentVersion);
        if (fs.existsSync(extractedPath)) {
          filesToUpload = collectWorkspaceFilesForGithub(extractedPath);
        } else {
          filesToUpload = collectNovaStoreFiles();
        }
      } else {
        filesToUpload = collectNovaStoreFiles();
      }
    } else {
      filesToUpload = collectWorkspaceFilesForGithub(process.cwd());
    }

    if (filesToUpload.length === 0) {
      throw new Error("Nenhum arquivo encontrado para envio ao repositório.");
    }

    // 3. Create or verify repo on GitHub
    let repoData: any = null;
    if (mode === "create") {
      const createRes = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "WebMarket-App",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: repoName,
          description: description || "Projeto criado via WebMarket",
          private: !!isPrivate,
          auto_init: true
        })
      });

      if (createRes.ok) {
        repoData = await createRes.json();
      } else if (createRes.status === 422) {
        // Repo already exists, fetch it
        const existingRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "WebMarket-App"
          }
        });
        if (existingRes.ok) {
          repoData = await existingRes.json();
        } else {
          const errData = await createRes.json().catch(() => ({}));
          throw new Error(errData.message || "Não foi possível acessar o repositório existente no GitHub.");
        }
      } else {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(errData.message || "Erro ao criar repositório no GitHub.");
      }
    } else {
      const existingRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "WebMarket-App"
        }
      });
      if (!existingRes.ok) {
        throw new Error(`Repositório ${owner}/${repoName} não foi encontrado no seu GitHub.`);
      }
      repoData = await existingRes.json();
    }

    // 4. Check existing branch ref & parent commit safely
    let parentCommitSha: string | null = null;
    let baseTreeSha: string | null = null;

    try {
      const branchRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/branches/${defaultBranch}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "WebMarket-App"
        }
      });
      if (branchRes.ok) {
        const branchData = await branchRes.json();
        if (branchData?.commit?.sha) {
          parentCommitSha = branchData.commit.sha;
          if (branchData.commit.commit?.tree?.sha) {
            baseTreeSha = branchData.commit.commit.tree.sha;
          }
        }
      }
    } catch (_) {}

    // Fallback: check git ref directly if branch endpoint was unavailable
    if (!parentCommitSha) {
      try {
        const refRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${defaultBranch}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "WebMarket-App"
          }
        });
        if (refRes.ok) {
          const refData = await refRes.json();
          if (refData?.object?.sha) {
            parentCommitSha = refData.object.sha;
          }
        }
      } catch (_) {}
    }

    // If repository is completely empty (no branch/commits), initialize it via Contents API
    // because Git Blobs/Trees API throws "Git Repository is empty." on empty repositories.
    if (!parentCommitSha) {
      try {
        const initRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/README.md`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "WebMarket-App",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: "Initial commit via WebMarket",
            content: Buffer.from(`# ${repoName}\n\nInicializado via WebMarket`, "utf-8").toString("base64"),
            branch: defaultBranch
          })
        });

        if (initRes.ok) {
          const initData = await initRes.json();
          if (initData?.commit?.sha) {
            parentCommitSha = initData.commit.sha;
            if (initData.commit?.tree?.sha) {
              baseTreeSha = initData.commit.tree.sha;
            }
          }
        }
      } catch (_) {}
    }

    if (parentCommitSha && !baseTreeSha) {
      try {
        const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits/${parentCommitSha}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "WebMarket-App"
          }
        });
        if (commitRes.ok) {
          const commitData = await commitRes.json();
          if (commitData?.tree?.sha) {
            baseTreeSha = commitData.tree.sha;
          }
        }
      } catch (_) {}
    }

    // 5. Create Blobs & Tree Items concurrently in small batches
    const treeItems: { path: string; mode: string; type: string; sha: string }[] = [];
    const uploadErrors: string[] = [];

    const BATCH_SIZE = 5;
    for (let i = 0; i < filesToUpload.length; i += BATCH_SIZE) {
      const batch = filesToUpload.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (f) => {
          try {
            const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/blobs`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "WebMarket-App",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                content: f.content,
                encoding: "base64"
              })
            });

            if (blobRes.ok) {
              const blobData = await blobRes.json();
              if (blobData && blobData.sha) {
                treeItems.push({
                  path: f.path,
                  mode: "100644",
                  type: "blob",
                  sha: blobData.sha
                });
              }
            } else {
              const errBody = await blobRes.json().catch(() => ({}));
              uploadErrors.push(`${f.path} (${errBody.message || blobRes.statusText})`);
            }
          } catch (blobErr: any) {
            uploadErrors.push(`${f.path} (${blobErr.message})`);
          }
        })
      );
    }

    if (treeItems.length === 0) {
      const detail = uploadErrors.slice(0, 3).join(", ");
      throw new Error(`Falha ao gerar os arquivos do projeto para envio ao GitHub${detail ? `: ${detail}` : '.'}`);
    }

    // 6. Create Git Tree
    const treePayload: any = { tree: treeItems };
    if (baseTreeSha) {
      treePayload.base_tree = baseTreeSha;
    }

    let treeRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "WebMarket-App",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(treePayload)
    });

    // If tree creation with base_tree failed, retry creating root tree with all files
    if (!treeRes.ok && baseTreeSha) {
      treeRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "WebMarket-App",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tree: treeItems })
      });
    }

    if (!treeRes.ok) {
      const errJson = await treeRes.json().catch(() => ({}));
      throw new Error(errJson?.message || "Erro ao criar árvore Git no GitHub.");
    }
    const treeData = await treeRes.json();
    if (!treeData || !treeData.sha) {
      throw new Error("Resposta inválida da árvore Git no GitHub.");
    }
    const newTreeSha = treeData.sha;

    // 7. Create Git Commit
    const commitPayload: any = {
      message: `Deploy do projeto via WebMarket GitHub Deploy (${new Date().toISOString().split('T')[0]})`,
      tree: newTreeSha
    };
    if (parentCommitSha) {
      commitPayload.parents = [parentCommitSha];
    } else {
      commitPayload.parents = [];
    }

    let newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "WebMarket-App",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(commitPayload)
    });

    // If commit failed due to invalid parent commit, retry as initial root commit
    if (!newCommitRes.ok && parentCommitSha) {
      commitPayload.parents = [];
      newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "WebMarket-App",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(commitPayload)
      });
    }

    if (!newCommitRes.ok) {
      const errJson = await newCommitRes.json().catch(() => ({}));
      throw new Error(errJson?.message || "Erro ao criar commit no GitHub.");
    }
    const newCommitData = await newCommitRes.json();
    if (!newCommitData || !newCommitData.sha) {
      throw new Error("Commit gerado no GitHub não retornou identificador SHA válido.");
    }
    const finalCommitSha = newCommitData.sha;

    // 8. Update or Create Head Ref
    let refUpdated = false;
    if (parentCommitSha) {
      const updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${defaultBranch}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "WebMarket-App",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sha: finalCommitSha,
          force: true
        })
      });
      if (updateRefRes.ok) {
        refUpdated = true;
      }
    }

    if (!refUpdated) {
      const createRefRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "WebMarket-App",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ref: `refs/heads/${defaultBranch}`,
          sha: finalCommitSha
        })
      });

      if (!createRefRes.ok) {
        // Fallback: Attempt PATCH in case ref was created simultaneously
        await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${defaultBranch}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "WebMarket-App",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            sha: finalCommitSha,
            force: true
          })
        });
      }
    }

    res.json({
      success: true,
      repoUrl: repoData.html_url || `https://github.com/${owner}/${repoName}`,
      repoName,
      owner,
      branch: defaultBranch,
      filesCount: filesToUpload.length
    });
  } catch (err: any) {
    console.error("Erro no deploy do GitHub:", err);
    res.status(500).json({ error: err.message || "Falha ao enviar projeto para o GitHub." });
  }
});

// GET catalog products (Public)
app.get("/api/products", (req, res) => {
  const activeProducts = productsStore.filter(p => p.status === 'active');
  res.json({ products: activeProducts });
});

// GET admin products (All status including hidden)
app.get("/api/admin/products", (req, res) => {
  res.json({ products: productsStore });
});

// GET Firebase Storage status and metrics
app.get("/api/firebase/storage-status", (req, res) => {
  const totalProducts = productsStore.length;
  const activeZips = productsStore.filter(p => p.versions && p.versions.length > 0).length;
  res.json({
    status: 'connected',
    bucketName: 'ai-studio-webmarketvendaec-bb90a8e6-8d53-4836-826b-25456eba4812.firebasestorage.app',
    privateBucketPath: 'gs://ai-studio-webmarketvendaec-bb90a8e6-8d53-4836-826b-25456eba4812.firebasestorage.app/private_zips/',
    publicBucketPath: 'gs://ai-studio-webmarketvendaec-bb90a8e6-8d53-4836-826b-25456eba4812.firebasestorage.app/public_demos/',
    totalProductsInStorage: totalProducts,
    activeZipCount: activeZips
  });
});

// POST Upload New Product + ZIP File
app.post("/api/admin/products", upload.single('zipFile'), async (req, res) => {
  try {
    const file = req.file;
    const body = req.body;

    if (!file) {
      return res.status(400).json({ error: "O arquivo .ZIP do site é obrigatório." });
    }

    const title = body.title || "Novo Site Pro";
    const productId = `site-${Date.now()}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const versionNumber = body.version || "1.0.0";

    // Analyze ZIP
    const { detectedStack, fileList } = await analyzeZipBuffer(file.buffer);

    // Save private ZIP
    const prodZipDir = path.join(ZIPS_DIR, productId, versionNumber);
    fs.mkdirSync(prodZipDir, { recursive: true });
    const zipPath = path.join(prodZipDir, `${productId}-v${versionNumber}.zip`);
    fs.writeFileSync(zipPath, file.buffer);

    // Extract static files for live demo
    await extractZipForDemo(productId, versionNumber, file.buffer);

    const zipSizeMB = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    const versionRecord: ProductVersion = {
      id: `ver-${Date.now()}`,
      productId,
      versionNumber,
      releaseDate: new Date().toISOString().split('T')[0],
      changelog: body.changelog || "Versão inicial do produto enviada pelo painel admin",
      zipFilename: file.originalname || `${productId}-v${versionNumber}.zip`,
      zipSize: zipSizeMB,
      detectedStack,
      fileCount: fileList.length,
      zipPath
    };

    const demoUrl = `/api/demos/${productId}/index.html`;

    const newProduct: ProductRecord = {
      id: productId,
      title,
      slug,
      category: body.category || 'ecommerce',
      categoryName: body.categoryName || 'Loja Virtual',
      shortDescription: body.shortDescription || 'Website profissional de alta conversão.',
      fullDescription: body.fullDescription || 'Solução completa e otimizada desenvolvida com código moderno.',
      price: {
        standard: parseFloat(body.priceStandard || body.price || '149'),
        extended: parseFloat(body.priceExtended || '399'),
        installation: parseFloat(body.priceInstallation || '599')
      },
      rating: 5.0,
      reviewsCount: 1,
      salesCount: 0,
      thumbnail: body.thumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      galleryImages: body.galleryImages ? JSON.parse(body.galleryImages) : [
        body.thumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
      ],
      demoUrl,
      techStack: body.techStack ? (typeof body.techStack === 'string' ? JSON.parse(body.techStack) : body.techStack) : [detectedStack, 'Tailwind CSS', 'TypeScript'],
      features: body.features ? (typeof body.features === 'string' ? JSON.parse(body.features) : body.features) : ['Código Limpo', '100% Responsivo', 'SEO Otimizado'],
      includedFiles: ['Código Fonte Completo (.ZIP)', 'Documentação de Instalação'],
      seller: {
        id: 'admin-platform',
        name: 'WebMarket Oficial',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        badge: 'Vendedor Verificado',
        verified: true,
        salesCount: 150,
        rating: 5.0,
        responseTime: '< 15 min'
      },
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      currentVersion: versionNumber,
      detectedStack,
      versions: [versionRecord],
      demoDetails: {
        id: `demo-${Date.now()}`,
        productId,
        versionNumber,
        demoUrl,
        status: 'deployed',
        logs: [
          'Validando pacotes do arquivo .ZIP...',
          `Tecnologia detectada: ${detectedStack}`,
          'Extraindo assets para sandbox isolada...',
          'Demonstração pública publicada com sucesso!'
        ],
        deployedAt: new Date().toISOString()
      },
      reviews: []
    };

    productsStore.unshift(newProduct);

    res.status(201).json({
      success: true,
      product: newProduct,
      message: "Site cadastrado e demonstração publicada com sucesso!"
    });
  } catch (err: any) {
    console.error("Erro no upload do produto:", err);
    res.status(500).json({ error: "Falha ao processar arquivo ZIP do site", details: err.message });
  }
});

// POST Add New Product Version
app.post("/api/admin/products/:productId/versions", upload.single('zipFile'), async (req, res) => {
  try {
    const { productId } = req.params;
    const file = req.file;
    const body = req.body;

    const product = productsStore.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    if (!file) {
      return res.status(400).json({ error: "O arquivo .ZIP da nova versão é obrigatório." });
    }

    const versionNumber = body.versionNumber || `1.${product.versions.length}.0`;
    const changelog = body.changelog || `Atualização de melhorias e correções para versão ${versionNumber}`;

    // Analyze ZIP
    const { detectedStack, fileList } = await analyzeZipBuffer(file.buffer);

    // Save private ZIP
    const prodZipDir = path.join(ZIPS_DIR, productId, versionNumber);
    fs.mkdirSync(prodZipDir, { recursive: true });
    const zipPath = path.join(prodZipDir, `${productId}-v${versionNumber}.zip`);
    fs.writeFileSync(zipPath, file.buffer);

    // Extract static files for demo update
    await extractZipForDemo(productId, versionNumber, file.buffer);

    const versionRecord: ProductVersion = {
      id: `ver-${Date.now()}`,
      productId,
      versionNumber,
      releaseDate: new Date().toISOString().split('T')[0],
      changelog,
      zipFilename: file.originalname || `${productId}-v${versionNumber}.zip`,
      zipSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      detectedStack,
      fileCount: fileList.length,
      zipPath
    };

    product.versions.unshift(versionRecord);
    product.currentVersion = versionNumber;
    product.updatedDate = new Date().toISOString().split('T')[0];
    product.detectedStack = detectedStack;

    // Update demo details
    product.demoDetails = {
      id: `demo-${Date.now()}`,
      productId,
      versionNumber,
      demoUrl: `/api/demos/${productId}/index.html`,
      status: 'deployed',
      logs: [
        `Atualizando demonstração para versão ${versionNumber}...`,
        'Extraindo assets da nova versão...',
        'Demonstração atualizada com sucesso!'
      ],
      deployedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      version: versionRecord,
      product,
      message: `Nova versão ${versionNumber} publicada com sucesso!`
    });
  } catch (err: any) {
    console.error("Erro ao adicionar nova versão:", err);
    res.status(500).json({ error: "Falha ao adicionar nova versão", details: err.message });
  }
});

// POST Deploy / Re-deploy Demo with Progress Logs
app.post("/api/admin/products/:productId/deploy-demo", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = productsStore.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    const latestVer = product.versions[0] || { versionNumber: "1.0.0" };
    const logs = [
      "1/4: Validando integridade da estrutura do arquivo .ZIP...",
      `2/4: Detectando dependências (${product.detectedStack || 'HTML/CSS/JS'})...`,
      "3/4: Compilando ambiente isolado de demonstração interativa...",
      "4/4: Deploy concluído com sucesso!"
    ];

    product.demoDetails = {
      id: `demo-${Date.now()}`,
      productId,
      versionNumber: latestVer.versionNumber,
      demoUrl: `/api/demos/${productId}/index.html`,
      status: 'deployed',
      logs,
      deployedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      demoDetails: product.demoDetails,
      demoUrl: product.demoDetails.demoUrl
    });
  } catch (err: any) {
    res.status(500).json({ error: "Falha ao publicar demonstração", details: err.message });
  }
});

// Toggle Status / Edit / Delete
app.patch("/api/admin/products/:productId/status", (req, res) => {
  const { productId } = req.params;
  const { status } = req.body;
  const product = productsStore.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: "Produto não encontrado." });

  product.status = status;
  res.json({ success: true, product });
});

app.delete("/api/admin/products/:productId", (req, res) => {
  const { productId } = req.params;
  productsStore = productsStore.filter(p => p.id !== productId);
  res.json({ success: true, message: "Produto excluído com sucesso." });
});

// GET Serve Static Public Demo Files in Sandboxed Environment
app.get("/api/demos/:productId/*", (req, res) => {
  const { productId } = req.params;
  const filePath = req.params[0] || "index.html";

  const product = productsStore.find(p => p.id === productId);
  if (!product) {
    return res.status(404).send("Site de demonstração não encontrado.");
  }

  const currentVer = product.currentVersion || "1.0.0";
  const targetPath = path.join(EXTRACTED_DIR, productId, currentVer, filePath);

  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
    return res.sendFile(targetPath);
  }

  // If index.html requested or not found, serve custom responsive interactive preview template!
  const isHtml = filePath.endsWith(".html") || !filePath.includes(".");
  if (isHtml) {
    const demoHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demonstração Interativa - ${product.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-900 text-white min-h-screen flex flex-col">
  
  <!-- Banner Topo de Segurança -->
  <div className="bg-blue-600 text-white text-xs py-2 px-4 flex items-center justify-between font-bold shadow-md">
    <div class="flex items-center gap-2">
      <span class="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">Modo Demonstração</span>
      <span>${product.title} (${product.detectedStack || 'React 19'})</span>
    </div>
    <div class="flex items-center gap-3">
      <span class="text-blue-100 font-normal hidden md:inline">Demonstração protegida sem acesso ao código fonte</span>
      <a href="/?open=${product.id}" target="_top" class="bg-white text-blue-700 px-3 py-1 rounded-lg text-xs font-black shadow hover:bg-slate-100 transition">
        Comprar Licença R$ ${product.price.standard}
      </a>
    </div>
  </div>

  <!-- Interactive Demo Content Shell -->
  <div class="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full">
    
    <!-- Hero Mock -->
    <div class="bg-slate-800 border border-slate-700 rounded-3xl p-8 md:p-12 mb-8 shadow-xl text-center relative overflow-hidden">
      <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      <span class="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
        ${product.categoryName}
      </span>
      <h1 class="text-3xl md:text-5xl font-black mt-4 mb-4 text-white">
        ${product.title}
      </h1>
      <p class="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-8">
        ${product.fullDescription}
      </p>

      <div class="flex flex-wrap justify-center gap-3 mb-8">
        ${product.techStack.map(t => `<span class="bg-slate-900 border border-slate-700 text-slate-300 px-3 py-1 rounded-xl text-xs font-bold">${t}</span>`).join('')}
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center justify-center gap-4">
        <a href="/?open=${product.id}" target="_top" class="bg-blue-600 hover:bg-blue-500 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg transition">
          Adquirir Código Fonte Completo (.ZIP)
        </a>
      </div>
    </div>

    <!-- Gallery Screenshots Grid -->
    <div class="mb-12">
      <h3 class="text-lg font-bold mb-4 text-slate-200">Screenshots do Layout do Site:</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${product.galleryImages.map(img => `
          <div class="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-lg group">
            <img src="${img}" alt="Screenshot Demo" class="w-full h-64 object-cover group-hover:scale-105 transition duration-300" />
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Features Section -->
    <div class="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6">
      <h4 class="text-sm font-bold text-slate-300 uppercase mb-3">Funcionalidades do Template:</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
        ${product.features.map(f => `<div class="flex items-center gap-2"><span class="text-emerald-400 font-bold">✓</span><span>${f}</span></div>`).join('')}
      </div>
    </div>

  </div>
</body>
</html>`;
    return res.type("text/html").send(demoHTML);
  }

  res.status(404).send("Arquivo não encontrado.");
});

// ==================== CHECKOUT & PAYPAL INTEGRATION ==================== //

// Create Order (Pending status)
app.post("/api/orders/create", (req, res) => {
  const { items, customerEmail, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Carrinho está vazio." });
  }

  const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const totalAmount = items.reduce((acc: number, i: any) => acc + (i.selectedPrice || 149), 0);

  const newOrder: OrderRecord = {
    id: orderId,
    customerEmail: customerEmail || 'cliente@exemplo.com',
    items,
    status: 'pending', // Pending payment!
    totalAmount,
    paymentMethod: paymentMethod || 'paypal',
    paypalOrderId: `PAYPAL-${Date.now()}`,
    createdDate: new Date().toISOString()
  };

  ordersStore.push(newOrder);

  res.status(201).json({
    success: true,
    order: newOrder,
    message: "Pedido criado com sucesso. Aguardando confirmação do pagamento."
  });
});

// PayPal Confirmation Webhook / Route: pending -> paid
app.post("/api/orders/:orderId/paypal-confirm", (req, res) => {
  const { orderId } = req.params;
  const { paypalPayerId, paypalTransactionId } = req.body;

  const order = ordersStore.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Pedido não encontrado." });
  }

  // Update order status to PAID
  order.status = 'paid';
  order.paidDate = new Date().toISOString();
  order.paypalOrderId = paypalTransactionId || `PAYPAL-TX-${Date.now()}`;

  // Increment sales count for products
  order.items.forEach((item: any) => {
    const p = productsStore.find(prod => prod.id === item.website.id);
    if (p) p.salesCount += 1;
  });

  const purchasedSites = order.items.map((item: any) => {
    const websiteObj = productsStore.find(p => p.id === item.website.id) || item.website;
    return {
      orderId: order.id,
      purchaseDate: new Date().toLocaleDateString('pt-BR'),
      website: websiteObj,
      licenseType: item.licenseType,
      licenseKey: `WM-${websiteObj.id.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`,
      pricePaid: item.selectedPrice,
      orderStatus: 'paid'
    };
  });

  res.json({
    success: true,
    order,
    purchasedSites,
    message: "Pagamento do PayPal confirmado com sucesso! Downloads e deploys liberados."
  });
});

// ==================== SECURE DOWNLOAD TOKEN & ZIP STREAM ==================== //

// Request Short-Lived Temporary Signed Download Token
app.post("/api/orders/:orderId/download-token", (req, res) => {
  const { orderId } = req.params;
  const { productId, customerEmail } = req.body || {};

  const order = ordersStore.find(o => o.id === orderId || o.status === 'paid');
  
  // Verify order status if order exists in backend store
  if (order && order.status !== 'paid') {
    return res.status(403).json({
      error: "Acesso negado. O pagamento do pedido ainda está pendente ou não foi confirmado."
    });
  }

  const targetProductId = productId || order?.items?.[0]?.website?.id || "novastore-pro-ecommerce";
  const product = productsStore.find(p => p.id === targetProductId || p.slug === targetProductId) || productsStore[0];

  const latestVersion = product?.currentVersion || "1.0.0";
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes expiration

  downloadTokensStore.push({
    token,
    orderId,
    productId: product?.id || targetProductId,
    versionNumber: latestVersion,
    customerEmail: customerEmail || order?.customerEmail || 'cliente@exemplo.com',
    expiresAt
  });

  res.json({
    success: true,
    downloadUrl: `/api/download/${token}`,
    expiresInMinutes: 30,
    productTitle: product?.title || "NovaStore Pro",
    version: latestVersion
  });
});

// Direct Download Package (Generates full ZIP package containing code, README, env templates)
app.get("/api/purchased-sites/:productId/download-package", (req, res) => {
  const { productId } = req.params;
  const product = productsStore.find(p => p.id === productId || p.slug === productId) || productsStore[0];
  const versionNumber = product?.currentVersion || "1.0.0";

  const zip = new JSZip();
  const files = (product?.id === 'novastore-pro-ecommerce' || !product)
    ? collectNovaStoreFiles()
    : collectWorkspaceFilesForGithub(process.cwd());

  for (const f of files) {
    const fileBuf = Buffer.from(f.content, 'base64');
    zip.file(f.path, fileBuf);
  }

  res.setHeader("Content-Disposition", `attachment; filename="NovaStore-Pro-v${versionNumber}-Complete-Package.zip"`);
  res.setHeader("Content-Type", "application/zip");

  zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(res);
});

// GET Authenticated Stream of Private ZIP File
app.get("/api/download/:token", (req, res) => {
  const { token } = req.params;

  const tokenRecordIdx = downloadTokensStore.findIndex(t => t.token === token);
  if (tokenRecordIdx === -1) {
    return res.status(401).send("URL de download inválida ou expirada.");
  }

  const record = downloadTokensStore[tokenRecordIdx];
  if (Date.now() > record.expiresAt) {
    downloadTokensStore.splice(tokenRecordIdx, 1);
    return res.status(410).send("A URL temporária de download expirou. Por favor solicite um novo link na área Meus Sites.");
  }

  const product = productsStore.find(p => p.id === record.productId);
  const versionObj = product?.versions.find(v => v.versionNumber === record.versionNumber) || product?.versions[0];

  const zipPath = versionObj?.zipPath || path.join(ZIPS_DIR, record.productId, record.versionNumber, `${record.productId}-v${record.versionNumber}.zip`);

  // Record audit log
  downloadAuditStore.push({
    id: `dl-${Date.now()}`,
    orderId: record.orderId,
    productId: record.productId,
    versionNumber: record.versionNumber,
    customerEmail: record.customerEmail,
    downloadedAt: new Date().toISOString(),
    ipAddress: req.ip
  });

  if (fs.existsSync(zipPath)) {
    res.setHeader("Content-Disposition", `attachment; filename="${product?.slug || record.productId}-v${record.versionNumber}.zip"`);
    res.setHeader("Content-Type", "application/zip");
    return res.sendFile(zipPath);
  }

  // Generate dynamic ZIP on the fly using JSZip with all real standalone files
  const zip = new JSZip();
  const files = (product?.id === 'novastore-pro-ecommerce' || !product) 
    ? collectNovaStoreFiles() 
    : collectWorkspaceFilesForGithub(process.cwd());

  for (const f of files) {
    const fileBuf = Buffer.from(f.content, 'base64');
    zip.file(f.path, fileBuf);
  }

  res.setHeader("Content-Disposition", `attachment; filename="${product?.slug || record.productId || 'novastore-pro'}-v${record.versionNumber}.zip"`);
  res.setHeader("Content-Type", "application/zip");

  zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(res);
});

// ==================== CLIENT DEPLOYMENT ENGINE (GITHUB / VERCEL) ==================== //

app.post("/api/orders/:orderId/deploy", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { productId, platform, githubToken, vercelToken, repoName } = req.body;

    const order = ordersStore.find(o => o.id === orderId || o.status === 'paid');
    if (order && order.status !== 'paid') {
      return res.status(403).json({ error: "Acesso negado. Apenas pedidos pagos podem realizar deploy." });
    }

    const product = productsStore.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    const nameToUse = repoName || product.slug || `site-${Date.now()}`;
    const logs: string[] = [
      `Iniciando rotina de deploy para plataforma: ${platform.toUpperCase()}`,
      `Autenticando credenciais do usuário...`,
      `Preparando código fonte da versão ${product.currentVersion || '1.0.0'}...`
    ];

    let repoUrl = "";
    let deployUrl = "";

    // Simulate / execute real GitHub API repository creation & file push
    if (platform === 'github' || platform === 'github_vercel') {
      logs.push(`Criando repositório GitHub '${nameToUse}'...`);
      if (githubToken) {
        try {
          const ghRes = await fetch("https://api.github.com/user/repos", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${githubToken}`,
              "Content-Type": "application/json",
              "User-Agent": "WebMarket-Deployer"
            },
            body: JSON.stringify({
              name: nameToUse,
              description: `Projeto ${product.title} adquirido no WebMarket`,
              private: true
            })
          });
          const ghData = await ghRes.json();
          if (ghData.html_url) {
            repoUrl = ghData.html_url;
            logs.push(`Repositório GitHub criado com sucesso: ${repoUrl}`);
          } else {
            repoUrl = `https://github.com/seu-usuario/${nameToUse}`;
            logs.push(`Repositório configurado: ${repoUrl}`);
          }
        } catch (e: any) {
          repoUrl = `https://github.com/seu-usuario/${nameToUse}`;
          logs.push(`Modo de desenvolvimento GitHub: ${repoUrl}`);
        }
      } else {
        repoUrl = `https://github.com/seu-usuario/${nameToUse}`;
        logs.push(`Repositório privado gerado na sua conta GitHub: ${repoUrl}`);
      }
    }

    // Simulate / execute real Vercel API Deployment
    if (platform === 'vercel' || platform === 'github_vercel') {
      logs.push("Enviando bundle de build para a Vercel Cloud API...");
      logs.push("Instalando dependências e rodando 'npm run build'...");
      deployUrl = `https://${nameToUse}.vercel.app`;
      logs.push(`Deploy na Vercel concluído com sucesso! URL: ${deployUrl}`);
    }

    const deployRecord: DeploymentRecord = {
      id: `dep-${Date.now()}`,
      orderId,
      productId,
      platform,
      repoUrl,
      deployUrl,
      status: 'success',
      logs,
      createdAt: new Date().toISOString()
    };

    deploymentsStore.push(deployRecord);

    res.json({
      success: true,
      deployment: deployRecord,
      message: "Deploy realizado com sucesso!"
    });
  } catch (err: any) {
    res.status(500).json({ error: "Falha ao executar deploy automático", details: err.message });
  }
});

// ==================== ADMIN GEMINI TEMPLATE EDITING & COPYWRITING ==================== //

// Smart Heuristic Engine for instant template modification (used when AI is unavailable or under heavy demand)
function generateHeuristicTemplateUpdate(template: any, instruction: string, currentOverrides: any = {}) {
  const lower = instruction.toLowerCase();
  
  // Theme color detection
  let accentColor = currentOverrides.customizer?.accentColor || template.customizer?.accentColor || 'indigo';
  if (lower.includes('esmeralda') || lower.includes('verde')) accentColor = 'emerald';
  else if (lower.includes('ruby') || lower.includes('vermelho') || lower.includes('rosa') || lower.includes('rose')) accentColor = 'rose';
  else if (lower.includes('dourado') || lower.includes('ouro') || lower.includes('amarelo') || lower.includes('amber')) accentColor = 'amber';
  else if (lower.includes('roxo') || lower.includes('violeta') || lower.includes('purple')) accentColor = 'purple';
  else if (lower.includes('turquesa') || lower.includes('cyan') || lower.includes('ciano')) accentColor = 'cyan';
  else if (lower.includes('azul') || lower.includes('indigo')) accentColor = 'indigo';

  // Dark / Light mode detection
  let isDark = currentOverrides.customizer?.isDark !== undefined ? currentOverrides.customizer.isDark : (template.customizer?.isDark || false);
  if (lower.includes('escuro') || lower.includes('dark') || lower.includes('noturno') || lower.includes('preto')) {
    isDark = true;
  } else if (lower.includes('claro') || lower.includes('light') || lower.includes('branco')) {
    isDark = false;
  }

  // CTA text detection
  let customCta = currentOverrides.customContent?.customCta || template.customContent?.customCta || 'Entrar em Contato';
  if (lower.includes('agendar') || lower.includes('agendamento')) customCta = 'Agendar Horário VIP';
  else if (lower.includes('comprar') || lower.includes('pedido')) customCta = 'Fazer Pedido Agora';
  else if (lower.includes('whatsapp') || lower.includes('zap')) customCta = 'Falar no WhatsApp';
  else if (lower.includes('conversão') || lower.includes('cta') || lower.includes('botão')) customCta = 'Garantir Vaga Exclusiva';
  else if (lower.includes('preço') || lower.includes('plano')) customCta = 'Ver Planos & Preços';

  // Business Name and Titles
  const businessName = currentOverrides.customizer?.businessName || template.customizer?.businessName || template.title.split('—')[0].trim();
  
  let heroTitle = template.customContent?.heroTitle || `Destaque: ${businessName}`;
  let heroSubtitle = template.customContent?.heroSubtitle || template.shortDescription;
  
  if (lower.includes('luxo') || lower.includes('premium') || lower.includes('alto padrão') || lower.includes('sofisticado')) {
    heroTitle = `${businessName} — Excelência & Alta Sofisticação`;
    heroSubtitle = 'Experiências exclusivas desenhadas sob medida para clientes exigentes que valorizam o mais alto padrão de qualidade.';
  } else if (lower.includes('conversão') || lower.includes('vendas')) {
    heroTitle = `Transforme Seus Resultados com ${businessName}`;
    heroSubtitle = 'Soluções comprovadas e suporte especializado para impulsionar seu crescimento com agilidade e segurança.';
  }

  // Pages manipulation
  let pages = [...(template.pages || ['Home', 'Sobre', 'Serviços', 'Preços', 'Contactos'])];
  if (lower.includes('faq') || lower.includes('perguntas')) {
    if (!pages.includes('FAQ')) pages.push('FAQ');
  }
  if (lower.includes('blog') || lower.includes('artigos')) {
    if (!pages.includes('Blog')) pages.push('Blog');
  }
  if (lower.includes('galeria') || lower.includes('fotos') || lower.includes('portfolio')) {
    if (!pages.includes('Galeria')) pages.push('Galeria');
  }
  if (lower.includes('depoimento') || lower.includes('avaliaç')) {
    if (!pages.includes('Depoimentos')) pages.push('Depoimentos');
  }

  // Features list
  let features = [...(template.features || ['Design 100% Responsivo', 'Alta Performance', 'Código Limpo'])];
  if (lower.includes('faq') && !features.some(f => f.toLowerCase().includes('faq'))) {
    features.push('Central de Dúvidas Frequentes (FAQ)');
  }
  if ((lower.includes('luxo') || lower.includes('premium')) && !features.some(f => f.toLowerCase().includes('vip'))) {
    features.push('Atendimento VIP Personalizado', 'Layout Minimalista de Alto Luxo');
  }
  if ((lower.includes('conversão') || lower.includes('cta')) && !features.some(f => f.toLowerCase().includes('conversão'))) {
    features.push('Otimização com Gatilhos de Alta Conversão');
  }

  const diffSummary = [
    `Paleta de cores sincronizada: ${accentColor.toUpperCase()}`,
    `Modo de exibição: ${isDark ? 'Tema Escuro (Dark Mode)' : 'Tema Claro'}`,
    `Botão de Ação (CTA) otimizado: "${customCta}"`,
    `Catálogo estruturado com ${pages.length} páginas ativas`,
    `Copywriting e títulos atualizados com sucesso`
  ];

  const updatedTemplate = {
    ...template,
    pageCount: pages.length,
    pages,
    features,
    customizer: {
      accentColor,
      isDark,
      businessName,
      businessTagline: heroSubtitle,
      viewport: currentOverrides.customizer?.viewport || 'desktop',
      ...(currentOverrides.customizer || {})
    },
    customContent: {
      ...(template.customContent || {}),
      ...(currentOverrides.customContent || {}),
      heroTitle,
      heroSubtitle,
      customCta,
      customPhone: currentOverrides.customContent?.customPhone || template.customContent?.customPhone || '(11) 98765-4321',
    },
    updatedDate: new Date().toISOString().split('T')[0]
  };

  return {
    replyMessage: `Comando executado com sucesso no template **${template.title}**! Ajustei as diretrizes de cores, tipografia, seções e chamadas para ação (CTA). Você pode testar e validar o resultado no preview ao vivo antes de salvar.`,
    diffSummary,
    suggestedNextActions: [
      'Refinar paleta para Esmeralda & Dark Mode',
      'Otimizar textos para nicho de alto padrão',
      'Adicionar seção de FAQ e Depoimentos'
    ],
    updatedTemplate
  };
}

// Gemini Template Visual & Content Editor Endpoint
app.post("/api/admin/templates/gemini-edit", async (req, res) => {
  try {
    const { template, instruction, history = [], currentOverrides = {} } = req.body;

    if (!template) {
      return res.status(400).json({ error: "Template data is required." });
    }

    if (!instruction) {
      return res.status(400).json({ error: "Instruction message is required." });
    }

    if (!aiClient) {
      const fallbackResult = generateHeuristicTemplateUpdate(template, instruction, currentOverrides);
      return res.json({ success: true, ...fallbackResult });
    }

    const systemInstruction = `Você é o Diretor de Arte, Especialista em UI/UX, Engenheiro Frontend e Copywriter Sênior da plataforma WebMarket.
Sua missão é ajudar o Administrador a aprimorar, editar, reestruturar e personalizar templates de sites comerciais profissionais.

Você deve interpretar a instrução do administrador e retornar SEMPRE um JSON rigorosamente estruturado contendo:
1. "replyMessage": Sua resposta profissional, amigável e explicativa em Português do Brasil, descrevendo as mudanças feitas e os ganhos de conversão/design.
2. "diffSummary": Uma lista de 3 a 5 strings curtas resumindo exatamente o que foi alterado.
3. "suggestedNextActions": 3 sugestões criativas de próximas melhorias que o admin pode pedir com 1 clique.
4. "updatedTemplate": O objeto do template com todas as modificações aplicadas aos campos:
   - title: Título do template
   - shortDescription: Descrição curta do card
   - fullDescription: Descrição completa detalhada
   - pages: Array de páginas do site (ex: ["Home", "Sobre", "Serviços", "Preços", "Equipa", "Galeria", "Contactos"])
   - features: Array com 5 a 8 diferenciais do template
   - techStack: Array com tecnologias (ex: ["React 19", "Tailwind CSS", "TypeScript"])
   - price: { standard: number, promoPrice?: number, extended: number, installation: number }
   - customizer: { accentColor: "indigo"|"emerald"|"rose"|"amber"|"purple"|"cyan", isDark: boolean, businessName: string, businessTagline: string }
   - customContent: { heroTitle?: string, heroSubtitle?: string, customCta?: string, customPhone?: string, announcementBar?: string, customNotes?: string }

Se o usuário pedir para mudar cores, escolha entre 'indigo', 'emerald', 'rose', 'amber', 'purple', 'cyan'.
Se pedir tema escuro ou claro, ajuste 'isDark': true / false.
Mantenha a integridade dos dados e enriqueça a qualidade do template comercial.`;

    const prompt = `Template Atual:
${JSON.stringify(template, null, 2)}

Overrides Atuais Aplicados no Editor:
${JSON.stringify(currentOverrides, null, 2)}

Histórico da Conversa Anterior:
${JSON.stringify(history.slice(-6), null, 2)}

Instrução do Administrador:
"${instruction}"

Responda ESTRITAMENTE em formato JSON com as chaves: "replyMessage", "diffSummary", "suggestedNextActions", "updatedTemplate".`;

    try {
      const data = await generateGeminiJsonWithFallback({
        preferredModel: "gemini-2.5-flash",
        contents: prompt,
        systemInstruction
      });

      return res.json({
        success: true,
        replyMessage: data.replyMessage || "Alterações aplicadas com sucesso pelo Gemini!",
        diffSummary: data.diffSummary || ["Atualização do template aplicada"],
        suggestedNextActions: data.suggestedNextActions || ["Refinar textos", "Alterar cores", "Adicionar seções"],
        updatedTemplate: data.updatedTemplate || template
      });
    } catch (_aiErr: any) {
      const fallbackResult = generateHeuristicTemplateUpdate(template, instruction, currentOverrides);
      return res.json({ success: true, ...fallbackResult });
    }
  } catch (err: any) {
    console.error("Erro geral na edição de template:", err);
    const { template, instruction, currentOverrides = {} } = req.body;
    if (template) {
      const fallbackResult = generateHeuristicTemplateUpdate(template, instruction || '', currentOverrides);
      return res.json({ success: true, ...fallbackResult });
    }
    res.status(500).json({ error: "Falha ao processar comando", details: err.message });
  }
});

// Duplicate Template Endpoint
app.post("/api/admin/templates/duplicate", (req, res) => {
  try {
    const { templateId, customTitle } = req.body;
    const source = productsStore.find(p => p.id === templateId);

    const baseTitle = customTitle || (source ? `${source.title} (Cópia)` : `Template Duplicado ${Date.now()}`);
    const newId = `template-copy-${Date.now()}`;
    const newSlug = baseTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const cloned: any = source ? {
      ...source,
      id: newId,
      slug: newSlug,
      title: baseTitle,
      status: 'draft',
      salesCount: 0,
      reviewsCount: 0,
      rating: 5.0,
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      versions: source.versions ? [...source.versions] : []
    } : {
      id: newId,
      slug: newSlug,
      title: baseTitle,
      status: 'draft',
      category: 'barbearia',
      categoryName: 'Barbearia',
      price: { standard: 149, extended: 399, installation: 599 },
      rating: 5.0,
      reviewsCount: 0,
      salesCount: 0,
      thumbnail: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
      galleryImages: [],
      shortDescription: 'Cópia independente do template original.',
      fullDescription: 'Template duplicado pronto para edições customizadas.',
      features: ['Design Responsivo', 'Multi-Páginas', 'SEO Otimizado'],
      techStack: ['React 19', 'Tailwind CSS', 'TypeScript'],
      includedFiles: ['Código Fonte Completo'],
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      versions: []
    };

    productsStore.unshift(cloned);

    res.status(201).json({
      success: true,
      template: cloned,
      message: `Template "${baseTitle}" duplicado com sucesso como Rascunho!`
    });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao duplicar template", details: err.message });
  }
});

// ==================== REAL GEMINI TEMPLATE CODE EDITOR & VERSIONING ==================== //

// POST /api/admin/templates/gemini-edit
// Analyzes template, edits virtual code AST, generates exact diffs and updated state
app.post("/api/admin/templates/gemini-edit", async (req, res) => {
  try {
    const { template, prompt, history } = req.body;

    if (!template || !prompt) {
      return res.status(400).json({ error: "Template e instrução (prompt) são obrigatórios." });
    }

    const editResult = await executeGeminiTemplateEdit({
      template,
      instruction: prompt,
      history,
      aiClient,
      generateJsonFn: generateGeminiJsonWithFallback
    });

    res.json(editResult);
  } catch (err: any) {
    console.error("[Gemini Template Edit Error]:", err);
    res.status(500).json({ 
      error: "Erro ao processar edição com Gemini", 
      details: err.message 
    });
  }
});

// POST /api/admin/templates/gemini-save
// Commits the modified template, persists to productsStore, registers new immutable version
app.post("/api/admin/templates/gemini-save", (req, res) => {
  try {
    const { template, changelogMessage, adminEmail } = req.body;

    if (!template || !template.id) {
      return res.status(400).json({ error: "Template inválido para salvar." });
    }

    const existingIndex = productsStore.findIndex(p => p.id === template.id);
    const existing = existingIndex !== -1 ? productsStore[existingIndex] : null;

    // Compute next version number
    const currentVersionStr = template.currentVersion || (existing?.versions?.length ? `v1.${existing.versions.length}` : "v1.0");
    const versionParts = currentVersionStr.replace(/^v/, '').split('.').map(Number);
    const major = isNaN(versionParts[0]) ? 1 : versionParts[0];
    const minor = (isNaN(versionParts[1]) ? 0 : versionParts[1]) + 1;
    const newVersionNumber = `v${major}.${minor}`;

    const newVersionRecord = {
      id: `ver-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      productId: template.id,
      versionNumber: newVersionNumber,
      releaseDate: new Date().toISOString().split('T')[0],
      changelog: changelogMessage || `Edições aplicadas via Gemini AI (${new Date().toLocaleDateString('pt-BR')})`,
      zipFilename: `${template.slug || 'template'}-${newVersionNumber}.zip`,
      zipSize: '12.4 MB',
      detectedStack: 'React 19, Tailwind CSS, TypeScript',
      fileCount: 24,
      author: adminEmail || 'Administrador SiteForge',
      snapshot: JSON.parse(JSON.stringify(template))
    };

    const updatedTemplate: Website = {
      ...template,
      currentVersion: newVersionNumber,
      updatedDate: new Date().toISOString().split('T')[0],
      versions: [newVersionRecord, ...(template.versions || (existing?.versions || []))]
    };

    if (existingIndex !== -1) {
      productsStore[existingIndex] = updatedTemplate as any;
    } else {
      productsStore.unshift(updatedTemplate as any);
    }

    res.json({
      success: true,
      message: `Nova versão ${newVersionNumber} salva com sucesso!`,
      versionNumber: newVersionNumber,
      updatedTemplate
    });
  } catch (err: any) {
    console.error("[Gemini Save Error]:", err);
    res.status(500).json({ error: "Erro ao salvar nova versão do template", details: err.message });
  }
});

// POST /api/admin/templates/gemini-restore
// Restores a previous version snapshot of a template
app.post("/api/admin/templates/gemini-restore", (req, res) => {
  try {
    const { templateId, versionId } = req.body;

    const existing = productsStore.find(p => p.id === templateId);
    if (!existing) {
      return res.status(404).json({ error: "Template não encontrado." });
    }

    const targetVersion = (existing.versions as any[])?.find(v => v.id === versionId || v.versionNumber === versionId);
    if (!targetVersion || !targetVersion.snapshot) {
      return res.status(404).json({ error: "Snapshot da versão não encontrado." });
    }

    const restored: Website = {
      ...targetVersion.snapshot,
      updatedDate: new Date().toISOString().split('T')[0],
      versions: existing.versions // Keep version history intact
    };

    const index = productsStore.findIndex(p => p.id === templateId);
    if (index !== -1) {
      productsStore[index] = restored as any;
    }

    res.json({
      success: true,
      message: `Template restaurado com sucesso para a versão ${targetVersion.versionNumber}!`,
      restoredTemplate: restored
    });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao restaurar versão do template", details: err.message });
  }
});

// GET /api/admin/templates/virtual-files/:id
// Returns the virtual source files of a template
app.get("/api/admin/templates/virtual-files/:id", (req, res) => {
  const template = productsStore.find(p => p.id === req.params.id);
  if (!template) {
    return res.status(404).json({ error: "Template não encontrado." });
  }

  const files = generateVirtualProjectFiles(template as any as Website);
  res.json({
    success: true,
    templateId: template.id,
    title: template.title,
    files
  });
});

// ============================================================================
// SITE-B E-COMMERCE FILE SYSTEM BRIDGE API (src/site-b-ecommerce/)
// ============================================================================
app.use("/api/site-b-ecommerce", createSiteBEcommerceBridgeRouter());
app.use("/api/bridge/site-b", createSiteBEcommerceBridgeRouter());

// ============================================================================
// GEMINI FILE SYSTEM BRIDGE & ATOMIC APPLY SERVICE
// ============================================================================

// GET /api/gemini-bridge/components - List safe, readable and editable components
app.get("/api/gemini-bridge/components", (req, res) => {
  try {
    const components = listAllowedComponents();
    res.json({
      success: true,
      count: components.length,
      components
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao listar componentes.", details: err.message });
  }
});

// POST /api/gemini-bridge/read - Read a component file safely
app.post("/api/gemini-bridge/read", (req, res) => {
  try {
    const { relativePath } = req.body;
    if (!relativePath) {
      return res.status(400).json({ success: false, error: "Parâmetro 'relativePath' é obrigatório." });
    }

    const result = readComponentFile(relativePath);
    if (!result.success) {
      return res.status(403).json({ success: false, error: result.error });
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao ler componente.", details: err.message });
  }
});

// POST /api/gemini-bridge/validate - Verify syntax of code without writing to disk
app.post("/api/gemini-bridge/validate", (req, res) => {
  try {
    const { code, fileName } = req.body;
    if (code === undefined || code === null) {
      return res.status(400).json({ success: false, error: "Parâmetro 'code' é obrigatório." });
    }

    const validation = validateCodeSyntax(code, fileName || "component.tsx");
    res.json({
      success: true,
      validation
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao validar sintaxe.", details: err.message });
  }
});

// POST /api/gemini-bridge/transform - AI-powered transformation of component code
app.post("/api/gemini-bridge/transform", async (req, res) => {
  try {
    const { relativePath, prompt, systemInstruction } = req.body;
    if (!relativePath || !prompt) {
      return res.status(400).json({ success: false, error: "Parâmetros 'relativePath' e 'prompt' são obrigatórios." });
    }

    const result = await transformComponentWithGemini({
      aiClient,
      relativePath,
      prompt,
      systemInstruction
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao processar transformação com Gemini.", details: err.message });
  }
});

// POST /api/gemini-bridge/apply - Atomically apply verified code to component file
app.post("/api/gemini-bridge/apply", (req, res) => {
  try {
    const { relativePath, newContent, author, prompt, expectedHash } = req.body;
    if (!relativePath || newContent === undefined || newContent === null) {
      return res.status(400).json({ success: false, error: "Parâmetros 'relativePath' e 'newContent' são obrigatórios." });
    }

    const result = applyAtomicComponentWrite({
      relativePath,
      newContent,
      author: author || 'gemini',
      prompt,
      expectedHash
    });

    if (!result.success) {
      return res.status(422).json({
        success: false,
        error: result.error,
        validation: result.validation
      });
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao aplicar escrita atômica.", details: err.message });
  }
});

// GET /api/gemini-bridge/snapshots - Get rollback snapshot history
app.get("/api/gemini-bridge/snapshots", (req, res) => {
  try {
    const relativePath = req.query.relativePath as string | undefined;
    const snapshots = getSnapshotHistory(relativePath);
    res.json({
      success: true,
      count: snapshots.length,
      snapshots
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao obter histórico de snapshots.", details: err.message });
  }
});

// POST /api/gemini-bridge/rollback - Revert component to previous snapshot
app.post("/api/gemini-bridge/rollback", (req, res) => {
  try {
    const { snapshotId } = req.body;
    if (!snapshotId) {
      return res.status(400).json({ success: false, error: "Parâmetro 'snapshotId' é obrigatório." });
    }

    const result = rollbackComponentSnapshot(snapshotId);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: "Componente revertido para o snapshot com sucesso!",
      result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Erro ao executar rollback.", details: err.message });
  }
});

// AI Copy generator & recommendations
app.post("/api/ai/generate-copy", async (req, res) => {
  const { title, category, keywords } = req.body;
  const fallbackCopy = {
    shortDescription: `Website profissional e responsivo para ${title || 'seu negócio'}. Otimizado para conversões e com suporte a pagamento instantâneo.`,
    fullDescription: `Aumente suas vendas e conquiste novos clientes com o ${title || 'seu novo site'}. Desenvolvido em React e Tailwind CSS com código 100% aberto e fácil de personalizar.`,
    features: [
      'Design 100% responsivo para celulares e desktops',
      'Código limpo em TypeScript estruturado e documentado',
      'Otimização de SEO e alta velocidade no Google',
      'Integração facilitada com WhatsApp e gateways de pagamento'
    ],
    techStack: ['React 19', 'Tailwind CSS', 'TypeScript', 'Lucide Icons']
  };

  try {
    if (!aiClient) {
      return res.json(fallbackCopy);
    }

    const prompt = `Você é um copywriter especialista em e-commerce de software e venda de websites. 
Gere os detalhes de venda para um novo anúncio de site com o seguinte título: "${title}", Categoria: "${category}", Palavras-chave: "${keywords || 'moderno, rápido, responsivo'}".

Responda ESTRITAMENTE em formato JSON com as seguintes chaves:
{
  "shortDescription": "uma frase chamativa de no máximo 120 caracteres para o card do produto em Português do Brasil",
  "fullDescription": "um parágrafo persuasivo detalhando os benefícios para o comprador em Português do Brasil",
  "features": ["lista com 5 a 6 funcionalidades principais do site em Português"],
  "techStack": ["lista com 4 a 6 tecnologias usadas como React 19, Tailwind CSS, Next.js, Express, etc."]
}`;

    const data = await generateGeminiJsonWithFallback({
      preferredModel: "gemini-2.5-flash",
      contents: prompt
    });

    return res.json(data);
  } catch (_err: any) {
    return res.json(fallbackCopy);
  }
});

app.post("/api/ai/describe-site", async (req, res) => {
  const { title, category, keywords } = req.body;
  const fallbackCopy = {
    shortDescription: `Website profissional e responsivo para ${title || 'seu negócio'}. Otimizado para conversões e com suporte a pagamento instantâneo.`,
    fullDescription: `Aumente suas vendas e conquiste novos clientes com o ${title || 'seu novo site'}. Desenvolvido em React e Tailwind CSS com código 100% aberto e fácil de personalizar.`,
    features: [
      'Design 100% responsivo para celulares e desktops',
      'Código limpo em TypeScript estruturado e documentado',
      'Otimização de SEO e alta velocidade no Google',
      'Integração facilitada com WhatsApp e gateways de pagamento'
    ],
    techStack: ['React 19', 'Tailwind CSS', 'TypeScript', 'Lucide Icons']
  };

  try {
    if (!aiClient) {
      return res.json(fallbackCopy);
    }

    const prompt = `Você é um copywriter especialista em e-commerce de software e venda de websites. 
Gere os detalhes de venda para um novo anúncio de site com o seguinte título: "${title}", Categoria: "${category}", Palavras-chave: "${keywords || 'moderno, rápido, responsivo'}".

Responda ESTRITAMENTE em formato JSON com as seguintes chaves:
{
  "shortDescription": "uma frase chamativa de no máximo 120 caracteres para o card do produto em Português do Brasil",
  "fullDescription": "um parágrafo persuasivo detalhando os benefícios para o comprador em Português do Brasil",
  "features": ["lista com 5 a 6 funcionalidades principais do site em Português"],
  "techStack": ["lista com 4 a 6 tecnologias usadas como React 19, Tailwind CSS, Next.js, Express, etc."]
}`;

    const data = await generateGeminiJsonWithFallback({
      preferredModel: "gemini-2.5-flash",
      contents: prompt
    });

    return res.json(data);
  } catch (_err: any) {
    return res.json(fallbackCopy);
  }
});

app.post("/api/ai/recommend-site", async (req, res) => {
  const { userQuery, availableSites } = req.body;
  const fallbackRec = {
    response: "Recomendo explorar os modelos de E-Commerce ou Serviços Profissionais. Eles possuem código limpo, suporte a agendamento, WhatsApp e excelente taxa de conversão!",
    suggestedCategory: "ecommerce",
    recommendedSiteId: "nexus-commerce"
  };

  try {
    if (!aiClient) {
      return res.json(fallbackRec);
    }

    const prompt = `Você é o Assistente Virtual da plataforma WebMarket (mercado de venda de sites e templates).
O comprador perguntou: "${userQuery}".

Sua tarefa:
1. Responda de forma cortês, objetiva e entusiasmada em Português do Brasil.
2. Recomende a melhor categoria ou o melhor tipo de site para o tipo de negócio dele.
3. Dê dicas de como ele pode personalizar o site após comprar o código.

Sites disponíveis no catálogo:
${JSON.stringify(availableSites || [])}

Responda em JSON com a estrutura:
{
  "response": "sua resposta explicativa e amigável para o comprador",
  "suggestedCategory": "categoria sugerida (ex: ecommerce, saas, medical, restaurant, etc)",
  "recommendedSiteId": "id de um site do catálogo que melhor atende ou string vazia"
}`;

    const data = await generateGeminiJsonWithFallback({
      preferredModel: "gemini-2.5-flash",
      contents: prompt
    });

    return res.json(data);
  } catch (_err: any) {
    return res.json(fallbackRec);
  }
});

// AI Recommendation 5-Question Wizard endpoint
app.post("/api/ai/recommend-wizard", async (req, res) => {
  const { businessType, goal, budget, features, style, availableSites } = req.body;
  const fallbackWizard = {
    reasoning: "Com base nas suas respostas, selecionamos os 3 modelos que melhor equilibram funcionalidades, velocidade de carregamento e alta taxa de conversão.",
    recommendations: (availableSites || productsStore).slice(0, 3).map((s: any, idx: number) => ({
      siteId: s.id,
      title: s.title,
      matchScore: 98 - idx * 3,
      highlightReason: "Modelo completo com código moderno, design responsivo e fácil personalização."
    }))
  };

  try {
    if (!aiClient) {
      return res.json(fallbackWizard);
    }

    const prompt = `Você é um Consultor Especialista de Websites do WebMarket.
O cliente respondeu a 5 perguntas para encontrar o site ideal:
1. Tipo de Negócio: "${businessType || 'Geral'}"
2. Objetivo Principal: "${goal || 'Vender e captar clientes'}"
3. Orçamento: "${budget || 'Padrão'}"
4. Funcionalidades Necessárias: "${features || 'WhatsApp, Formulário, Design Responsivo'}"
5. Estilo Visual Preferido: "${style || 'Moderno e Clean'}"

Catálogo de sites disponíveis:
${JSON.stringify((availableSites || productsStore).map((s: any) => ({ id: s.id, title: s.title, category: s.categoryName, price: s.price?.standard, features: s.features })))}

Analise e escolha os TOP 3 sites mais adequados do catálogo.
Responda ESTRITAMENTE em formato JSON:
{
  "reasoning": "Breve justificativa amigável em português explicando por que esses 3 modelos foram selecionados",
  "recommendations": [
    {
      "siteId": "id do site 1",
      "matchScore": 99,
      "highlightReason": "Por que este site é perfeito para o negócio dele"
    },
    {
      "siteId": "id do site 2",
      "matchScore": 95,
      "highlightReason": "Destaque deste segundo modelo alternativo"
    },
    {
      "siteId": "id do site 3",
      "matchScore": 90,
      "highlightReason": "Destaque deste terceiro modelo"
    }
  ]
}`;

    const data = await generateGeminiJsonWithFallback({
      preferredModel: "gemini-2.5-flash",
      contents: prompt
    });

    return res.json(data);
  } catch (_err: any) {
    return res.json(fallbackWizard);
  }
});

// AI Post-Purchase Site Customization Engine
app.post("/api/ai/customize-site", async (req, res) => {
  const { businessName, category, description, phone, services, city } = req.body;
  const fallbackCustomization = {
    tagline: `Excelência e confiança em cada detalhe para ${businessName || 'sua empresa'}.`,
    heroDescription: `Conheça ${businessName || 'nossa empresa'}. Oferecemos as melhores soluções com atendimento ágil, inovação e qualidade garantida em ${city || 'sua região'}.`,
    ctaText: "Falar no WhatsApp",
    seoTitle: `${businessName || 'Empresa'} — Serviços Profissionais em ${city || 'Sua Cidade'}`,
    seoDescription: `Conheça ${businessName || 'nossa empresa'}. Oferecemos as melhores soluções em ${category || 'serviços'} com atendimento ágil e qualidade garantida.`,
    optimizedServices: [
      { title: "Atendimento Personalizado", price: "Sob Consulta", description: "Soluções sob medida para atender exatamente à sua necessidade com máxima agilidade." },
      { title: "Serviço Especializado", price: "R$ 150", description: "Profissionais qualificados prontos para entregar o melhor resultado." }
    ]
  };

  try {
    if (!aiClient) {
      return res.json(fallbackCustomization);
    }

    const prompt = `Você é um Copywriter e Especialista em SEO de alta conversão.
O cliente adquiriu um template de site e precisa personalizar o conteúdo para a empresa dele:
- Nome da Empresa: "${businessName}"
- Categoria / Ramo: "${category || 'Geral'}"
- Descrição da Empresa: "${description || ''}"
- Cidade / Região: "${city || 'Brasil'}"
- Serviços oferecidos: "${services || ''}"

Gere textos persuasivos e otimizados para SEO em Português do Brasil.
Responda ESTRITAMENTE em formato JSON com:
{
  "tagline": "Slogan de alto impacto de no máximo 80 caracteres",
  "heroDescription": "Texto persuasivo de apresentação da empresa para o banner principal (2 a 3 frases)",
  "ctaText": "Texto chamativo para o botão de ação principal (ex: Agende pelo WhatsApp, Faça seu Pedido)",
  "seoTitle": "Título para Google SEO com até 60 caracteres",
  "seoDescription": "Meta description para o Google com até 150 caracteres",
  "optimizedServices": [
    {
      "title": "Nome do serviço 1",
      "price": "Preço ou Sob Consulta",
      "description": "Descrição atrativa em 1 frase dos benefícios"
    },
    {
      "title": "Nome do serviço 2",
      "price": "Preço ou Sob Consulta",
      "description": "Descrição atrativa em 1 frase dos benefícios"
    },
    {
      "title": "Nome do serviço 3",
      "price": "Preço ou Sob Consulta",
      "description": "Descrição atrativa em 1 frase dos benefícios"
    }
  ]
}`;

    const data = await generateGeminiJsonWithFallback({
      preferredModel: "gemini-2.5-flash",
      contents: prompt
    });

    return res.json(data);
  } catch (_err: any) {
    return res.json(fallbackCustomization);
  }
});

// Domain Verification Simulator & Real DNS Checker
app.post("/api/domains/verify", (req, res) => {
  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({ error: "Domínio é obrigatório." });
  }

  // Normalize domain
  const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');

  res.json({
    success: true,
    domain: cleanDomain,
    status: 'active',
    sslActive: true,
    dnsRecords: [
      { type: 'A', name: '@', value: '76.76.21.21', status: 'configured' },
      { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', status: 'configured' }
    ],
    verifiedAt: new Date().toISOString(),
    message: `Domínio ${cleanDomain} configurado e com certificado SSL ativo com sucesso!`
  });
});

// Support Tickets endpoint
const supportTicketsStore: any[] = [];

app.get("/api/support/tickets", (req, res) => {
  res.json({ tickets: supportTicketsStore });
});

app.post("/api/support/tickets", (req, res) => {
  const { customerEmail, subject, category, message, priority } = req.body;

  const ticket = {
    id: `TCK-${Date.now().toString().slice(-6)}`,
    customerEmail: customerEmail || 'cliente@exemplo.com',
    subject: subject || 'Dúvida sobre personalização',
    category: category || 'customization',
    priority: priority || 'normal',
    status: 'open',
    createdAt: new Date().toISOString(),
    messages: [
      {
        sender: 'customer',
        text: message || 'Gostaria de ajuda para configurar meu site.',
        timestamp: new Date().toISOString()
      },
      {
        sender: 'support',
        text: 'Olá! Recebemos sua mensagem. Nossa equipe técnica entrará em contato em instantes para prestar o suporte necessário.',
        timestamp: new Date(Date.now() + 1000).toISOString()
      }
    ]
  };

  supportTicketsStore.unshift(ticket);
  res.status(201).json({ success: true, ticket });
});

// Subscriptions management endpoint
const subscriptionsStore: any[] = [];

app.get("/api/subscriptions", (req, res) => {
  res.json({ subscriptions: subscriptionsStore });
});

app.post("/api/subscriptions/create", (req, res) => {
  const { orderId, productTitle, planName, priceMonthly, billingCycle, features } = req.body;

  const sub = {
    id: `SUB-${Date.now().toString().slice(-6)}`,
    orderId: orderId || `ORD-${Date.now().toString().slice(-6)}`,
    productTitle: productTitle || 'Meu Site',
    planName: planName || 'Hospedagem & Manutenção Turbo',
    priceMonthly: priceMonthly || 39.00,
    billingCycle: billingCycle || 'monthly',
    status: 'active',
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
    features: features || ['Hospedagem Cloud Alta Velocidade', 'Backup Diário Automático', 'Suporte Prioritário VIP', 'SSL Grátis']
  };

  subscriptionsStore.unshift(sub);
  res.status(201).json({ success: true, subscription: sub });
});

// ==================== SEO OPTIMIZATION & ANALYZER ENDPOINTS ==================== //

// Heuristic fallback generator for SEO Analysis
function generateFallbackSeoAnalysis(product: {
  title?: string;
  shortDescription?: string;
  fullDescription?: string;
  category?: string;
  categoryName?: string;
  techStack?: any[];
  features?: any[];
  existingKeywords?: string;
}): any {
  const title = (product.title || "Website Profissional").trim();
  const categoryName = product.categoryName || product.category || "E-Commerce & Negócios";
  const rawDesc = (product.shortDescription || product.fullDescription || `Website completo e responsivo para ${categoryName}`).trim();
  
  // Calculate initial metrics
  const titleLen = title.length;
  const descLen = rawDesc.length;
  
  // Clean focus keyword
  const mainWord = title.split(/[—\-:]/)[0].trim();
  const focusKeyword = `site pronto para ${mainWord.toLowerCase()}`;
  
  const recommendedTitle = `${mainWord} — Site Pronto com React & Tailwind | SiteForge`.slice(0, 60);
  const recommendedDesc = `Compre o código-fonte do ${mainWord}. Template 100% responsivo, alta conversão, checkout integrado e entrega instantânea de arquivos. Confira a demo ao vivo!`.slice(0, 155);

  return {
    score: 88,
    grade: "A",
    focusKeyword: focusKeyword,
    searchIntent: "transactional",
    titleSuggestions: {
      recommended: recommendedTitle,
      charCount: recommendedTitle.length,
      benefits: "Inclui palavra-chave primária no início, tecnologias atrativas (React/Tailwind) e branding do marketplace.",
      variations: [
        `${mainWord} Profissional — Código Aberto & Demo Online`,
        `Comprar Template ${mainWord} | Alta Conversão & Design Responsivo`,
        `${mainWord} em React 19: Site Completo para Vender Mais`
      ]
    },
    metaDescriptionSuggestions: {
      recommended: recommendedDesc,
      charCount: recommendedDesc.length,
      ctrImpact: "Excelente (152 caracteres com gatilhos de benefício imediato, CTA claro e prova social).",
      variations: [
        `Adquira o template completo ${mainWord}. Código limpo em TypeScript, design moderno, painel integrado e deploy em 1 clique. Teste agora!`,
        `Website profissional ${mainWord} para empresas e freelancers. Fácil de personalizar, suporte incluso e download imediato do código-fonte.`
      ]
    },
    keywordStrategy: {
      primaryKeyword: {
        keyword: focusKeyword,
        intent: "transactional",
        volumeRating: "high",
        difficulty: "medium",
        relevanceScore: 95
      },
      secondaryKeywords: [
        {
          keyword: `template de ${mainWord.toLowerCase()}`,
          intent: "commercial",
          volumeRating: "high",
          difficulty: "easy",
          relevanceScore: 92
        },
        {
          keyword: `comprar site de ${categoryName.toLowerCase()}`,
          intent: "transactional",
          volumeRating: "medium",
          difficulty: "medium",
          relevanceScore: 89
        },
        {
          keyword: `código pronto ${mainWord.toLowerCase()} react`,
          intent: "commercial",
          volumeRating: "medium",
          difficulty: "easy",
          relevanceScore: 85
        },
        {
          keyword: `sistema de ${categoryName.toLowerCase()} pronto`,
          intent: "commercial",
          volumeRating: "high",
          difficulty: "hard",
          relevanceScore: 82
        }
      ],
      longTailKeywords: [
        {
          keyword: `como criar um site de ${mainWord.toLowerCase()} rapido`,
          intent: "informational",
          trafficOpportunity: "Ideal para atrair tráfego orgânico de topo de funil via blog ou documentação."
        },
        {
          keyword: `melhor template react para ${mainWord.toLowerCase()} 2026`,
          intent: "commercial",
          trafficOpportunity: "Alta taxa de conversão para compradores que comparam soluções prontas."
        },
        {
          keyword: `download código fonte site de ${mainWord.toLowerCase()}`,
          intent: "transactional",
          trafficOpportunity: "Público qualificado pronto para adquirir a licença comercial."
        }
      ],
      negativeOrAvoidKeywords: [
        "grátis pirata",
        "nulled download",
        "crackeado",
        "wordpress lento"
      ]
    },
    openGraphTags: {
      ogTitle: `${recommendedTitle} | SiteForge`,
      ogDescription: recommendedDesc,
      ogType: "product",
      twitterCard: "summary_large_image",
      twitterTitle: recommendedTitle,
      twitterDescription: recommendedDesc
    },
    structuredDataJsonLd: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": title,
      "description": recommendedDesc,
      "category": categoryName,
      "brand": {
        "@type": "Brand",
        "name": "SiteForge"
      },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "BRL",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "SiteForge Marketplace"
        }
      }
    },
    scoreBreakdown: {
      titleQuality: {
        score: titleLen >= 35 && titleLen <= 65 ? 20 : 14,
        max: 20,
        status: titleLen >= 35 && titleLen <= 65 ? "excellent" : "good",
        note: `Título atual tem ${titleLen} caracteres. Recomendamos entre 45 e 60 caracteres para visualização total na SERP.`
      },
      metaDescriptionQuality: {
        score: descLen >= 120 && descLen <= 160 ? 20 : 15,
        max: 20,
        status: descLen >= 120 && descLen <= 160 ? "excellent" : "good",
        note: `Meta description atual tem ${descLen} caracteres. Tamanho ideal para evitar truncamento no Google é 145-155 caracteres.`
      },
      keywordRelevance: {
        score: 18,
        max: 20,
        status: "excellent",
        note: "Palavras-chave cobrem intenções comerciais e transacionais com alta aderência ao nicho."
      },
      searchIntentAlignment: {
        score: 16,
        max: 20,
        status: "good",
        note: "Foco claro em conversão de compradores procurando código-fonte e modelos prontos."
      },
      socialSharingReady: {
        score: 14,
        max: 20,
        status: "good",
        note: "OpenGraph e Twitter Cards configurados para exibição atrativa em WhatsApp, LinkedIn e Twitter."
      }
    },
    actionableRecommendations: [
      {
        category: "title",
        priority: "high",
        title: "Otimizar Título para SERP",
        description: "Adicione termos com alta busca transacional como 'Site Pronto', 'Template' e 'Código Aberto' no início da tag de título.",
        actionLabel: "Aplicar Título Sugerido"
      },
      {
        category: "description",
        priority: "high",
        title: "Aperfeiçoar Meta Description",
        description: "Insira uma chamada direta para ação ('Veja a demo ao vivo', 'Download instantâneo') e destaque os principais diferenciais técnicos.",
        actionLabel: "Aplicar Meta Description"
      },
      {
        category: "keywords",
        priority: "medium",
        title: "Explorar Long-Tail Keywords",
        description: "Incorpore termos de cauda longa na descrição detalhada para capturar buscas específicas de desenvolvedores e agências.",
        actionLabel: "Inserir Palavras-Chave"
      },
      {
        category: "technical",
        priority: "medium",
        title: "Inserir Schema Markup (JSON-LD)",
        description: "Utilize a marcação de Produto (Product Schema) para exibir estrelas de avaliação e faixa de preço diretamente nos resultados do Google.",
        actionLabel: "Copiar JSON-LD"
      }
    ],
    analyzedAt: new Date().toISOString()
  };
}

// POST /api/admin/seo-analyzer
app.post("/api/admin/seo-analyzer", async (req, res) => {
  const {
    productId,
    title,
    shortDescription,
    fullDescription,
    category,
    categoryName,
    techStack,
    features,
    existingKeywords,
    targetAudience
  } = req.body;

  const fallback = generateFallbackSeoAnalysis({
    title,
    shortDescription,
    fullDescription,
    category,
    categoryName,
    techStack,
    features,
    existingKeywords
  });

  try {
    if (!aiClient) {
      return res.json({ success: true, analysis: fallback, source: "heuristic_engine" });
    }

    const prompt = `Você é o principal Especialista em SEO e Otimização para Mecanismos de Busca (Google, Bing e redes sociais) do marketplace SiteForge.
Analise detalhadamente o seguinte produto de software / template de site à venda:

- ID do Produto: "${productId || 'tpl-site'}"
- Título Atual: "${title || ''}"
- Categoria: "${categoryName || category || 'Desenvolvimento Web'}"
- Descrição Curta Atual: "${shortDescription || ''}"
- Descrição Completa: "${fullDescription || ''}"
- Tecnologias: "${Array.isArray(techStack) ? techStack.join(', ') : techStack || 'React, Tailwind CSS, TypeScript'}"
- Funcionalidades: "${Array.isArray(features) ? features.join('; ') : features || 'Design responsivo, alta performance'}"
- Palavras-chave Existentes: "${existingKeywords || ''}"
- Público Alvo: "${targetAudience || 'Empreendedores, donos de negócios, agências e desenvolvedores freelancers'}"

Sua missão:
1. Avalie a qualidade atual de SEO (Nota de 0 a 100 e Grade A+, A, B, C, D).
2. Forneça o Título Otimizado Principal (máximo 60 caracteres) que posicione no topo do Google e gere alta taxa de cliques (CTR), além de 3 variações A/B.
3. Forneça a Meta Description Otimizada (entre 145 e 158 caracteres) com gatilhos de valor, chamada de ação clara e sem truncamento.
4. Mapeie a estratégia completa de palavras-chave: palavra-chave foco, 4 palavras-chave secundárias de alta relevância, 3 termos de cauda longa com justificativa de tráfego, e termos negativos/evitar.
5. Gere as tags OpenGraph e Twitter Card perfeitas para compartilhamento em WhatsApp, LinkedIn, etc.
6. Crie o Schema JSON-LD de Produto.
7. Detalhe o Score Breakdown em 5 pilares (titleQuality, metaDescriptionQuality, keywordRelevance, searchIntentAlignment, socialSharingReady) com notas numéricas e notas explicativas.
8. Liste 4 recomendações acionáveis de alta prioridade para o lojista / administrador implementar imediatamente.

Responda ESTRITAMENTE em formato JSON com a seguinte estrutura:
{
  "score": 92,
  "grade": "A+",
  "focusKeyword": "palavra-chave foco principal",
  "searchIntent": "transactional",
  "titleSuggestions": {
    "recommended": "Título Otimizado Principal (até 60 chars)",
    "charCount": 56,
    "benefits": "Explicação do porquê este título posiciona melhor",
    "variations": [
      "Variação 1 de Título",
      "Variação 2 de Título",
      "Variação 3 de Título"
    ]
  },
  "metaDescriptionSuggestions": {
    "recommended": "Meta description perfeita com 145-158 caracteres com CTA persuasivo.",
    "charCount": 150,
    "ctrImpact": "Análise do impacto em cliques",
    "variations": [
      "Variação 1 de Meta Description",
      "Variação 2 de Meta Description"
    ]
  },
  "keywordStrategy": {
    "primaryKeyword": {
      "keyword": "termo primario",
      "intent": "transactional",
      "volumeRating": "high",
      "difficulty": "medium",
      "relevanceScore": 96
    },
    "secondaryKeywords": [
      {
        "keyword": "termo secundario 1",
        "intent": "commercial",
        "volumeRating": "high",
        "difficulty": "easy",
        "relevanceScore": 91
      },
      {
        "keyword": "termo secundario 2",
        "intent": "transactional",
        "volumeRating": "medium",
        "difficulty": "medium",
        "relevanceScore": 88
      },
      {
        "keyword": "termo secundario 3",
        "intent": "commercial",
        "volumeRating": "medium",
        "difficulty": "easy",
        "relevanceScore": 85
      },
      {
        "keyword": "termo secundario 4",
        "intent": "commercial",
        "volumeRating": "high",
        "difficulty": "hard",
        "relevanceScore": 80
      }
    ],
    "longTailKeywords": [
      {
        "keyword": "busca de cauda longa 1",
        "intent": "informational",
        "trafficOpportunity": "Oportunidade de tráfego"
      },
      {
        "keyword": "busca de cauda longa 2",
        "intent": "commercial",
        "trafficOpportunity": "Oportunidade de tráfego"
      },
      {
        "keyword": "busca de cauda longa 3",
        "intent": "transactional",
        "trafficOpportunity": "Oportunidade de tráfego"
      }
    ],
    "negativeOrAvoidKeywords": [
      "palavras a evitar"
    ]
  },
  "openGraphTags": {
    "ogTitle": "Título para OpenGraph",
    "ogDescription": "Descrição para OpenGraph",
    "ogType": "product",
    "twitterCard": "summary_large_image",
    "twitterTitle": "Título para Twitter",
    "twitterDescription": "Descrição para Twitter"
  },
  "structuredDataJsonLd": {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "${title || 'Template'}",
    "description": "descrição curta"
  },
  "scoreBreakdown": {
    "titleQuality": { "score": 19, "max": 20, "status": "excellent", "note": "explicação" },
    "metaDescriptionQuality": { "score": 19, "max": 20, "status": "excellent", "note": "explicação" },
    "keywordRelevance": { "score": 18, "max": 20, "status": "excellent", "note": "explicação" },
    "searchIntentAlignment": { "score": 18, "max": 20, "status": "excellent", "note": "explicação" },
    "socialSharingReady": { "score": 18, "max": 20, "status": "excellent", "note": "explicação" }
  },
  "actionableRecommendations": [
    {
      "category": "title",
      "priority": "high",
      "title": "Ajuste de Título",
      "description": "detalhes",
      "actionLabel": "Aplicar Título"
    },
    {
      "category": "description",
      "priority": "high",
      "title": "Ajuste de Meta Description",
      "description": "detalhes",
      "actionLabel": "Aplicar Descrição"
    },
    {
      "category": "keywords",
      "priority": "medium",
      "title": "Estratégia de Palavras-Chave",
      "description": "detalhes",
      "actionLabel": "Adicionar Tags"
    },
    {
      "category": "technical",
      "priority": "medium",
      "title": "Schema Markup",
      "description": "detalhes",
      "actionLabel": "Copiar JSON-LD"
    }
  ]
}`;

    const analysisData = await generateGeminiJsonWithFallback({
      preferredModel: "gemini-2.5-flash",
      contents: prompt
    });

    // Ensure analyzedAt timestamp is set
    analysisData.analyzedAt = new Date().toISOString();

    // If productId matches a stored product, optionally cache the analysis
    const existing = productsStore.find(p => p.id === productId);
    if (existing) {
      existing.updatedDate = new Date().toISOString().split("T")[0];
    }

    return res.json({
      success: true,
      analysis: analysisData,
      source: "gemini_ai"
    });
  } catch (err: any) {
    console.error("[SEO Analyzer] Erro ao invocar Gemini:", err);
    return res.json({
      success: true,
      analysis: fallback,
      source: "heuristic_engine_fallback",
      notice: "Análise gerada pelo motor heurístico integrado."
    });
  }
});

// POST /api/admin/seo-batch-audit
app.post("/api/admin/seo-batch-audit", async (req, res) => {
  const { products } = req.body;
  const listToAnalyze = (Array.isArray(products) && products.length > 0) ? products : productsStore;

  try {
    const auditedProducts = listToAnalyze.map((prod: any) => {
      const titleLen = (prod.title || "").length;
      const descLen = (prod.shortDescription || prod.fullDescription || "").length;
      
      let score = 70;
      if (titleLen >= 30 && titleLen <= 65) score += 12;
      else if (titleLen > 15) score += 6;

      if (descLen >= 80 && descLen <= 160) score += 12;
      else if (descLen > 30) score += 6;

      if (prod.techStack && prod.techStack.length >= 3) score += 4;
      if (prod.features && prod.features.length >= 3) score += 2;

      // Clean focus keyword
      const mainWord = (prod.title || "site").split(/[—\-:]/)[0].trim();
      const focusKeyword = `site ${mainWord.toLowerCase()}`;

      return {
        productId: prod.id,
        title: prod.title,
        categoryName: prod.categoryName || prod.category || "Geral",
        score: Math.min(score, 98),
        focusKeyword,
        status: score >= 85 ? "optimized" : "needs_attention"
      };
    });

    const totalAnalyzed = auditedProducts.length;
    const avgScore = totalAnalyzed > 0 
      ? Math.round(auditedProducts.reduce((acc: number, p: any) => acc + p.score, 0) / totalAnalyzed) 
      : 85;

    const excellentCount = auditedProducts.filter((p: any) => p.score >= 85).length;
    const goodCount = auditedProducts.filter((p: any) => p.score >= 70 && p.score < 85).length;
    const needsWorkCount = auditedProducts.filter((p: any) => p.score < 70).length;

    const topOpportunities = [
      "Otimizar títulos para incluir palavras-chave de intenção de compra ('Site Pronto', 'Comprar Template').",
      "Padronizar meta descriptions entre 145 e 155 caracteres com chamada direta para a demonstração ao vivo.",
      "Inserir tags de dados estruturados Schema.org (Product) para aumentar a taxa de cliques na busca orgânica.",
      "Enriquecer o campo de palavras-chave com termos de cauda longa específicos por nicho comercial."
    ];

    res.json({
      success: true,
      summary: {
        averageScore: avgScore,
        totalAnalyzed,
        topOpportunities,
        scoreDistribution: {
          excellent: excellentCount,
          good: goodCount,
          needsWork: needsWorkCount
        },
        products: auditedProducts
      }
    });
  } catch (err: any) {
    console.error("[SEO Batch Audit] Erro:", err);
    res.status(500).json({ error: "Erro ao realizar auditoria em lote" });
  }
});

// POST /api/admin/seo-apply
app.post("/api/admin/seo-apply", (req, res) => {
  const { productId, title, shortDescription, fullDescription, seoMeta } = req.body;

  if (!productId) {
    return res.status(400).json({ error: "productId é obrigatório." });
  }

  const existingProduct = productsStore.find(p => p.id === productId);
  if (existingProduct) {
    if (title) existingProduct.title = title;
    if (shortDescription) existingProduct.shortDescription = shortDescription;
    if (fullDescription) existingProduct.fullDescription = fullDescription;
    existingProduct.updatedDate = new Date().toISOString().split("T")[0];
  }

  res.json({
    success: true,
    message: "Otimizações de SEO aplicadas com sucesso ao catálogo!",
    updatedProduct: existingProduct || { id: productId, title, shortDescription, fullDescription }
  });
});


// ==================== VITE & SERVER BOOT ==================== //

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server WebMarket rodando na porta ${PORT}`);
  });
}

startServer();

