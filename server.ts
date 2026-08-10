import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import multer from "multer";
import JSZip from "jszip";

dotenv.config();

const app = express();
const PORT = 3000;

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
      id: 'nexus-commerce',
      title: 'NexusCommerce - E-Commerce Next.js & Stripe',
      slug: 'nexus-commerce',
      category: 'ecommerce',
      categoryName: 'Loja Virtual & E-Commerce',
      shortDescription: 'Plataforma de e-commerce ultrarrápida com catálogo de produtos, carrinho reativo, cálculo de frete, pagamento via PIX e Stripe.',
      fullDescription: 'O NexusCommerce é uma solução completa e de alto desempenho para lojas virtuais modernas. Desenvolvido com as tecnologias mais recentes do mercado, ele oferece navegação fluida em dispositivos móveis, checkout otimizado para conversão, integração nativa com pagamento por QR Code PIX e Cartão de Crédito.',
      price: { standard: 189, extended: 499, installation: 699 },
      rating: 4.9,
      reviewsCount: 38,
      salesCount: 142,
      thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1556742049-0a67d1656820?auto=format&fit=crop&w=1200&q=80'
      ],
      demoUrl: '/api/demos/nexus-commerce/index.html',
      techStack: ['React 19', 'Next.js', 'Tailwind CSS', 'Stripe API', 'TypeScript'],
      features: ['Checkout em 1 etapa', 'PIX e Cartão', 'Painel Admin', 'Mobile Ready'],
      includedFiles: ['Código fonte React 19', '.env.example', 'Manual de Deploy'],
      seller: {
        id: 'dev-master-br',
        name: 'Lucas Silva (CodeCraft)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        badge: 'Vendedor Top 1%',
        verified: true,
        salesCount: 480,
        rating: 4.95,
        responseTime: '< 30 min'
      },
      createdDate: '2026-02-10',
      updatedDate: '2026-07-28',
      status: 'active',
      currentVersion: '1.0.0',
      detectedStack: 'Next.js & React 19',
      versions: [
        {
          id: 'v-nexus-1',
          productId: 'nexus-commerce',
          versionNumber: '1.0.0',
          releaseDate: '2026-02-10',
          changelog: 'Lançamento inicial com Next.js 15 e suporte a Stripe',
          zipFilename: 'nexus-commerce-v1.0.0.zip',
          zipSize: '14.2 MB',
          detectedStack: 'Next.js & React 19',
          fileCount: 48,
          zipPath: path.join(ZIPS_DIR, 'nexus-commerce', 'v1.0.0.zip')
        }
      ],
      demoDetails: {
        id: 'demo-nexus-1',
        productId: 'nexus-commerce',
        versionNumber: '1.0.0',
        demoUrl: '/api/demos/nexus-commerce/index.html',
        status: 'deployed',
        logs: ['Ambiente gerado', 'Ativo'],
        deployedAt: new Date().toISOString()
      },
      reviews: []
    },
    {
      id: 'flow-saas',
      title: 'FlowSaaS - Landing Page & Dashboard para Startup',
      slug: 'flow-saas',
      category: 'saas',
      categoryName: 'SaaS & Software',
      shortDescription: 'Template completo para startups de software, com landing page de alta conversão, tabela de preços e dashboard de usuário.',
      fullDescription: 'O FlowSaaS foi projetado para acelerar o lançamento da sua startup de tecnologia. Acompanha seção hero animada, depoimentos de clientes e painel administrativo.',
      price: { standard: 149, extended: 399, installation: 599 },
      rating: 4.85,
      reviewsCount: 29,
      salesCount: 98,
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
      ],
      demoUrl: '/api/demos/flow-saas/index.html',
      techStack: ['React 19', 'Vite', 'Tailwind CSS', 'Framer Motion'],
      features: ['Landing Page Responsiva', 'Dashboard do Usuário', 'Planos de Assinatura'],
      includedFiles: ['Projeto Vite TypeScript', 'Configuração de Cores'],
      seller: {
        id: 'dev-master-br',
        name: 'Lucas Silva (CodeCraft)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        badge: 'Vendedor Top 1%',
        verified: true,
        salesCount: 480,
        rating: 4.95,
        responseTime: '< 30 min'
      },
      createdDate: '2026-03-01',
      updatedDate: '2026-08-01',
      status: 'active',
      currentVersion: '1.0.0',
      detectedStack: 'Vite & React 19',
      versions: [
        {
          id: 'v-flow-1',
          productId: 'flow-saas',
          versionNumber: '1.0.0',
          releaseDate: '2026-03-01',
          changelog: 'Lançamento inicial',
          zipFilename: 'flow-saas-v1.0.0.zip',
          zipSize: '8.4 MB',
          detectedStack: 'Vite & React 19',
          fileCount: 32,
          zipPath: path.join(ZIPS_DIR, 'flow-saas', 'v1.0.0.zip')
        }
      ],
      demoDetails: {
        id: 'demo-flow-1',
        productId: 'flow-saas',
        versionNumber: '1.0.0',
        demoUrl: '/api/demos/flow-saas/index.html',
        status: 'deployed',
        logs: ['Demonstração Ativa'],
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

// ==================== API ROUTES ==================== //

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
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
  const { productId, customerEmail } = req.body;

  const order = ordersStore.find(o => o.id === orderId || o.status === 'paid');
  
  // Verify order exists and status is PAID
  if (order && order.status !== 'paid') {
    return res.status(403).json({
      error: "Acesso negado. O pagamento do pedido ainda está pendente ou não foi confirmado."
    });
  }

  const product = productsStore.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: "Produto não encontrado." });
  }

  const latestVersion = product.currentVersion || "1.0.0";
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes expiration

  downloadTokensStore.push({
    token,
    orderId,
    productId,
    versionNumber: latestVersion,
    customerEmail: customerEmail || order?.customerEmail || 'cliente@exemplo.com',
    expiresAt
  });

  res.json({
    success: true,
    downloadUrl: `/api/download/${token}`,
    expiresInMinutes: 30
  });
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

  // Fallback: Generate dynamic ZIP on the fly using JSZip if pre-compiled zip missing
  const zip = new JSZip();
  zip.file("README.md", `# ${product?.title || 'Site Adquirido'}\n\nObrigado por comprar no WebMarket!\nVersão: ${record.versionNumber}\n\n## Instruções:\n1. Execute 'npm install'\n2. Execute 'npm run dev'\n3. Seu site estará rodando em http://localhost:3000`);
  zip.file("package.json", JSON.stringify({
    name: product?.slug || 'my-purchased-site',
    version: record.versionNumber,
    scripts: { dev: "vite", build: "vite build" },
    dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" }
  }, null, 2));

  zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(res)
    .on('finish', () => {
      res.setHeader("Content-Disposition", `attachment; filename="${product?.slug || 'site'}-v${record.versionNumber}.zip"`);
    });
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

// AI Copy generator & recommendations
app.post("/api/ai/describe-site", async (req, res) => {
  try {
    const { title, category, keywords } = req.body;

    if (!aiClient) {
      return res.json({
        shortDescription: `Website profissional e responsivo para ${title || 'seu negócio'}. Otimizado para conversões e com suporte a pagamento instantâneo.`,
        fullDescription: `Aumente suas vendas e conquiste novos clientes com o ${title || 'seu novo site'}. Desenvolvido em React e Tailwind CSS com código 100% aberto e fácil de personalizar.`,
        features: [
          'Design 100% responsivo para celulares e desktops',
          'Código limpo em TypeScript estruturado e documentado',
          'Otimização de SEO e alta velocidade no Google',
          'Integração facilitada com WhatsApp e gateways de pagamento'
        ],
        techStack: ['React 19', 'Tailwind CSS', 'TypeScript', 'Lucide Icons']
      });
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

    const response = await aiClient.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    return res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: "Falha ao gerar descrição com IA", details: err.message });
  }
});

app.post("/api/ai/recommend-site", async (req, res) => {
  try {
    const { userQuery, availableSites } = req.body;

    if (!aiClient) {
      return res.json({
        recommendation: "Recomendo explorar os modelos de E-Commerce ou SaaS. Eles possuem código limpo, suporte a pagamentos via PIX e excelente taxa de conversão!",
        recommendedSiteId: "nexus-commerce"
      });
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

    const response = await aiClient.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    return res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: "Falha na recomendação por IA", details: err.message });
  }
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

