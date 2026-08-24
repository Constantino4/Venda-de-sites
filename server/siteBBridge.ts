import express, { Request, Response, Router } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import ts from "typescript";

// Workspace root directory
const WORKSPACE_ROOT = process.cwd();

// Target directory strictly restricted to 'src/site-b-ecommerce'
const SITE_B_ROOT = path.join(WORKSPACE_ROOT, "src", "site-b-ecommerce");
const SNAPSHOTS_DIR = path.join(WORKSPACE_ROOT, "storage", "site_b_snapshots");

// Ensure directories exist
fs.mkdirSync(SITE_B_ROOT, { recursive: true });
fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });

// Allowed file extensions
const ALLOWED_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".json", ".css"];

// Blocked patterns for security
const BLOCKED_PATTERNS = [
  /\.env/i,
  /node_modules/i,
  /\.git/i,
  /\.lock/i,
  /firebase.*config/i,
  /\0/
];

export interface SiteBComponentMeta {
  relativePath: string;
  absolutePath: string;
  name: string;
  directory: string;
  sizeBytes: number;
  lineCount: number;
  lastModified: string;
  hash: string;
  isComponent: boolean;
}

export interface SyntaxErrorDetail {
  line: number;
  column: number;
  message: string;
}

export interface SyntaxValidationResult {
  valid: boolean;
  errors: SyntaxErrorDetail[];
  warnings?: string[];
  syntaxEngine: string;
  checkedAt: string;
}

export interface SiteBSnapshot {
  id: string;
  relativePath: string;
  timestamp: string;
  author: string;
  previousHash: string;
  newHash: string;
  backupFilePath: string;
  lineCount: number;
}

// In-memory snapshots registry
const snapshotsRegistry: SiteBSnapshot[] = [];

/**
 * Securely validate and resolve a path to ensure it is strictly confined within 'src/site-b-ecommerce'
 */
export function validateSiteBPath(inputPath: string): {
  valid: boolean;
  absolutePath: string;
  relativePath: string;
  fileName: string;
  reason?: string;
} {
  if (!inputPath || typeof inputPath !== "string") {
    return {
      valid: false,
      absolutePath: "",
      relativePath: "",
      fileName: "",
      reason: "Caminho do arquivo não fornecido ou inválido."
    };
  }

  // Check for blocked characters or null bytes
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(inputPath)) {
      return {
        valid: false,
        absolutePath: "",
        relativePath: "",
        fileName: "",
        reason: `Acesso negado: padrão de segurança violado (${pattern}).`
      };
    }
  }

  // Normalize path & strip any leading slashes or 'src/site-b-ecommerce/' prefix if passed
  let cleaned = inputPath.trim().replace(/\\/g, "/");
  if (cleaned.startsWith("/")) {
    cleaned = cleaned.substring(1);
  }

  if (cleaned.startsWith("src/site-b-ecommerce/")) {
    cleaned = cleaned.replace("src/site-b-ecommerce/", "");
  } else if (cleaned.startsWith("site-b-ecommerce/")) {
    cleaned = cleaned.replace("site-b-ecommerce/", "");
  }

  // Normalize relative path
  const normalizedRelative = path.normalize(cleaned).replace(/^(\.\.[\/\\])+/, "");

  // Resolve absolute path within SITE_B_ROOT
  const absolutePath = path.resolve(SITE_B_ROOT, normalizedRelative);

  // Security check: Must strictly start with SITE_B_ROOT to prevent directory traversal
  if (!absolutePath.startsWith(SITE_B_ROOT)) {
    return {
      valid: false,
      absolutePath: "",
      relativePath: "",
      fileName: "",
      reason: "Tentativa de directory traversal detectada. O acesso é restrito ao diretório 'src/site-b-ecommerce/'."
    };
  }

  // Check file extension
  const ext = path.extname(absolutePath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      absolutePath: "",
      relativePath: "",
      fileName: "",
      reason: `Extensão '${ext}' não permitida. Apenas arquivos [${ALLOWED_EXTENSIONS.join(", ")}] são autorizados.`
    };
  }

  const relativeWithinSiteB = path.relative(SITE_B_ROOT, absolutePath).replace(/\\/g, "/");
  const fullRelative = path.relative(WORKSPACE_ROOT, absolutePath).replace(/\\/g, "/");

  return {
    valid: true,
    absolutePath,
    relativePath: fullRelative,
    fileName: path.basename(absolutePath)
  };
}

/**
 * Basic Syntax Validator
 * Uses TypeScript AST Diagnostic Parser and Transpile Validation for TS/TSX/JS/JSX,
 * Native JSON Parser for JSON, and CSS brace balance checker for CSS.
 */
export function validateSyntax(code: string, fileName = "component.tsx"): SyntaxValidationResult {
  const result: SyntaxValidationResult = {
    valid: true,
    errors: [],
    syntaxEngine: "TypeScript Compiler AST & Diagnostics Engine (TS 5.8)",
    checkedAt: new Date().toISOString()
  };

  if (typeof code !== "string" || code.trim().length === 0) {
    result.valid = false;
    result.errors.push({
      line: 1,
      column: 1,
      message: "O conteúdo do arquivo não pode ser vazio."
    });
    return result;
  }

  const ext = path.extname(fileName).toLowerCase();

  // JSON Validation
  if (ext === ".json") {
    try {
      JSON.parse(code);
      return result;
    } catch (err: any) {
      result.valid = false;
      const match = err.message.match(/position (\d+)/);
      const pos = match ? parseInt(match[1], 10) : 1;
      result.errors.push({
        line: 1,
        column: pos,
        message: `Erro de sintaxe JSON: ${err.message}`
      });
      return result;
    }
  }

  // CSS Validation (Brace balancing & string quotes)
  if (ext === ".css") {
    let openBraces = 0;
    const lines = code.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        if (line[j] === "{") openBraces++;
        if (line[j] === "}") openBraces--;
        if (openBraces < 0) {
          result.valid = false;
          result.errors.push({
            line: i + 1,
            column: j + 1,
            message: "Chave de fechamento '}' inesperada sem abertura correspondente."
          });
          return result;
        }
      }
    }
    if (openBraces !== 0) {
      result.valid = false;
      result.errors.push({
        line: lines.length,
        column: 1,
        message: `Bloco CSS não fechado (${openBraces} chave(s) aberta(s)).`
      });
    }
    return result;
  }

  // TypeScript / TSX / JavaScript / JSX Validation
  const isTsx = ext === ".tsx" || ext === ".jsx";
  const scriptKind = isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS;

  try {
    // 1. AST Creation and Parse Diagnostics
    const sourceFile = ts.createSourceFile(
      fileName,
      code,
      ts.ScriptTarget.Latest,
      true, // setParentNodes
      scriptKind
    );

    const parseDiagnostics = (sourceFile as any).parseDiagnostics || [];

    if (parseDiagnostics.length > 0) {
      result.valid = false;
      for (const diag of parseDiagnostics) {
        let line = 1;
        let column = 1;
        if (diag.file && diag.start !== undefined) {
          const pos = diag.file.getLineAndCharacterOfPosition(diag.start);
          line = pos.line + 1;
          column = pos.character + 1;
        }
        const message = typeof diag.messageText === "string"
          ? diag.messageText
          : diag.messageText.messageText;

        result.errors.push({ line, column, message });
      }
      return result;
    }

    // 2. Transpile Module Verification
    const transpileRes = ts.transpileModule(code, {
      compilerOptions: {
        jsx: isTsx ? ts.JsxEmit.ReactJSX : undefined,
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        noEmitOnError: true,
      },
      reportDiagnostics: true,
      fileName,
    });

    if (transpileRes.diagnostics && transpileRes.diagnostics.length > 0) {
      result.valid = false;
      for (const diag of transpileRes.diagnostics) {
        let line = 1;
        let column = 1;
        if (diag.file && diag.start !== undefined) {
          const pos = diag.file.getLineAndCharacterOfPosition(diag.start);
          line = pos.line + 1;
          column = pos.character + 1;
        }
        const message = typeof diag.messageText === "string"
          ? diag.messageText
          : diag.messageText.messageText;

        result.errors.push({ line, column, message });
      }
      return result;
    }

  } catch (err: any) {
    result.valid = false;
    result.errors.push({
      line: 1,
      column: 1,
      message: `Erro na análise de sintaxe: ${err.message || String(err)}`
    });
  }

  return result;
}

/**
 * List all components and source files inside 'src/site-b-ecommerce'
 */
export function listSiteBComponents(): SiteBComponentMeta[] {
  const components: SiteBComponentMeta[] = [];

  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativeFromRoot = path.relative(WORKSPACE_ROOT, fullPath).replace(/\\/g, "/");

      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== ".git") {
          scanDir(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ALLOWED_EXTENSIONS.includes(ext)) {
          try {
            const stat = fs.statSync(fullPath);
            const content = fs.readFileSync(fullPath, "utf-8");
            const hash = crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);
            const relativeDir = path.relative(SITE_B_ROOT, dir).replace(/\\/g, "/") || "root";

            components.push({
              relativePath: relativeFromRoot,
              absolutePath: fullPath,
              name: entry.name,
              directory: relativeDir,
              sizeBytes: stat.size,
              lineCount: content.split("\n").length,
              lastModified: stat.mtime.toISOString(),
              hash,
              isComponent: ext === ".tsx" || ext === ".jsx"
            });
          } catch (e) {
            // Ignore unreadable
          }
        }
      }
    }
  }

  scanDir(SITE_B_ROOT);
  return components;
}

/**
 * Read a component file safely
 */
export function readSiteBComponent(filePath: string): {
  success: boolean;
  content?: string;
  meta?: SiteBComponentMeta;
  error?: string;
} {
  const check = validateSiteBPath(filePath);
  if (!check.valid) {
    return { success: false, error: check.reason };
  }

  if (!fs.existsSync(check.absolutePath)) {
    return { success: false, error: `Arquivo não encontrado: ${check.relativePath}` };
  }

  try {
    const content = fs.readFileSync(check.absolutePath, "utf-8");
    const stat = fs.statSync(check.absolutePath);
    const hash = crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);
    const ext = path.extname(check.fileName).toLowerCase();

    return {
      success: true,
      content,
      meta: {
        relativePath: check.relativePath,
        absolutePath: check.absolutePath,
        name: check.fileName,
        directory: path.relative(SITE_B_ROOT, path.dirname(check.absolutePath)).replace(/\\/g, "/") || "root",
        sizeBytes: stat.size,
        lineCount: content.split("\n").length,
        lastModified: stat.mtime.toISOString(),
        hash,
        isComponent: ext === ".tsx" || ext === ".jsx"
      }
    };
  } catch (err: any) {
    return { success: false, error: `Erro ao ler arquivo: ${err.message || String(err)}` };
  }
}

/**
 * Write a component file securely with mandatory pre-save syntax validation
 */
export function writeSiteBComponent(params: {
  filePath: string;
  content: string;
  author?: string;
  skipValidation?: boolean;
}): {
  success: boolean;
  validation: SyntaxValidationResult;
  snapshotId?: string;
  newHash?: string;
  previousHash?: string;
  relativePath?: string;
  error?: string;
  diffSummary?: string[];
} {
  const { filePath, content, author = "bridge-api", skipValidation = false } = params;

  // 1. Path Security Validation
  const check = validateSiteBPath(filePath);
  if (!check.valid) {
    return {
      success: false,
      validation: {
        valid: false,
        errors: [{ line: 1, column: 1, message: check.reason || "Caminho inválido." }],
        syntaxEngine: "Site-B Security Guard",
        checkedAt: new Date().toISOString()
      },
      error: check.reason
    };
  }

  // 2. Syntax Validation (Mandatory Verification Step)
  const validation = skipValidation ? {
    valid: true,
    errors: [],
    syntaxEngine: "Bypassed",
    checkedAt: new Date().toISOString()
  } : validateSyntax(content, check.fileName);

  if (!validation.valid) {
    return {
      success: false,
      validation,
      error: `Verificação de sintaxe falhou: ${validation.errors.length} erro(s) encontrado(s). O arquivo NÃO foi gravado para prevenir erros de compilação.`
    };
  }

  try {
    // Ensure parent folder exists
    fs.mkdirSync(path.dirname(check.absolutePath), { recursive: true });

    // 3. Check current file for backup snapshot
    let previousContent = "";
    let previousHash = "initial";
    if (fs.existsSync(check.absolutePath)) {
      previousContent = fs.readFileSync(check.absolutePath, "utf-8");
      previousHash = crypto.createHash("sha256").update(previousContent).digest("hex").slice(0, 12);
    }

    const newHash = crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);

    // If no changes, return early
    if (previousHash === newHash && previousContent.length > 0) {
      return {
        success: true,
        validation,
        newHash,
        previousHash,
        relativePath: check.relativePath,
        diffSummary: ["Conteúdo idêntico. Nenhuma alteração foi necessária."]
      };
    }

    // 4. Create Snapshot Backup
    const snapshotId = `siteb-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const backupFileName = `${snapshotId}-${check.fileName}.bak`;
    const backupFilePath = path.join(SNAPSHOTS_DIR, backupFileName);
    fs.writeFileSync(backupFilePath, previousContent, "utf-8");

    // 5. Atomic Write (Write to temp file -> Flush -> Atomic Rename)
    const tempFilePath = `${check.absolutePath}.tmp.${Date.now()}.${crypto.randomBytes(3).toString("hex")}`;
    fs.writeFileSync(tempFilePath, content, { encoding: "utf-8", mode: 0o644 });
    fs.renameSync(tempFilePath, check.absolutePath);

    // 6. Post-write integrity verification
    const savedContent = fs.readFileSync(check.absolutePath, "utf-8");
    const verifiedHash = crypto.createHash("sha256").update(savedContent).digest("hex").slice(0, 12);

    if (verifiedHash !== newHash) {
      // Revert if corrupted
      fs.writeFileSync(check.absolutePath, previousContent, "utf-8");
      throw new Error("Falha na integridade pós-escrita: hash divergente. O arquivo anterior foi restaurado.");
    }

    // 7. Register Snapshot Record
    const snapshotRecord: SiteBSnapshot = {
      id: snapshotId,
      relativePath: check.relativePath,
      timestamp: new Date().toISOString(),
      author,
      previousHash,
      newHash,
      backupFilePath,
      lineCount: content.split("\n").length
    };

    snapshotsRegistry.unshift(snapshotRecord);
    if (snapshotsRegistry.length > 50) {
      snapshotsRegistry.pop();
    }

    const prevLines = previousContent ? previousContent.split("\n").length : 0;
    const newLines = content.split("\n").length;

    return {
      success: true,
      validation,
      snapshotId,
      newHash,
      previousHash,
      relativePath: check.relativePath,
      diffSummary: [
        `Arquivo salvo com sucesso em 'src/site-b-ecommerce/${path.relative(SITE_B_ROOT, check.absolutePath)}'`,
        `Linhas: ${prevLines} → ${newLines}`,
        `Validação de sintaxe: 100% válida (${validation.syntaxEngine})`
      ]
    };

  } catch (err: any) {
    return {
      success: false,
      validation,
      error: `Erro ao salvar componente: ${err.message || String(err)}`
    };
  }
}

/**
 * Rollback to snapshot
 */
export function rollbackSiteBSnapshot(snapshotId: string): {
  success: boolean;
  restoredPath?: string;
  restoredHash?: string;
  error?: string;
} {
  const snapshot = snapshotsRegistry.find(s => s.id === snapshotId);
  if (!snapshot) {
    return { success: false, error: `Snapshot '${snapshotId}' não encontrado.` };
  }

  if (!fs.existsSync(snapshot.backupFilePath)) {
    return { success: false, error: "Arquivo de backup do snapshot não existe mais em disco." };
  }

  const check = validateSiteBPath(snapshot.relativePath);
  if (!check.valid) {
    return { success: false, error: check.reason };
  }

  try {
    const backupContent = fs.readFileSync(snapshot.backupFilePath, "utf-8");
    const validation = validateSyntax(backupContent, check.fileName);
    if (!validation.valid) {
      return { success: false, error: "Conteúdo do backup falhou na validação de sintaxe." };
    }

    const tempFilePath = `${check.absolutePath}.rollback.${Date.now()}`;
    fs.writeFileSync(tempFilePath, backupContent, "utf-8");
    fs.renameSync(tempFilePath, check.absolutePath);

    const restoredHash = crypto.createHash("sha256").update(backupContent).digest("hex").slice(0, 12);

    return {
      success: true,
      restoredPath: check.relativePath,
      restoredHash
    };
  } catch (err: any) {
    return { success: false, error: `Erro ao restaurar snapshot: ${err.message || String(err)}` };
  }
}

/**
 * Get snapshots list
 */
export function getSiteBSnapshots(filterPath?: string): SiteBSnapshot[] {
  if (filterPath) {
    const check = validateSiteBPath(filterPath);
    if (check.valid) {
      return snapshotsRegistry.filter(s => s.relativePath === check.relativePath);
    }
  }
  return snapshotsRegistry;
}

/**
 * Express Router Factory for Site-B E-commerce Bridge API
 */
export function createSiteBEcommerceBridgeRouter(): Router {
  const router = express.Router();

  // GET /api/site-b-ecommerce/components - List all components
  router.get("/components", (req: Request, res: Response) => {
    try {
      const components = listSiteBComponents();
      res.json({
        success: true,
        rootDirectory: "src/site-b-ecommerce",
        count: components.length,
        components
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: "Erro ao listar componentes.", details: err.message });
    }
  });

  // GET /api/site-b-ecommerce/component - Read component by query ?path=...
  router.get("/component", (req: Request, res: Response) => {
    const targetPath = (req.query.path as string) || (req.query.file as string);
    if (!targetPath) {
      return res.status(400).json({ success: false, error: "Parâmetro query '?path=' é obrigatório." });
    }

    const result = readSiteBComponent(targetPath);
    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  });

  // POST /api/site-b-ecommerce/read - Read component by POST body
  router.post("/read", (req: Request, res: Response) => {
    const targetPath = req.body.relativePath || req.body.path || req.body.filePath;
    if (!targetPath) {
      return res.status(400).json({ success: false, error: "Campo 'relativePath' ou 'path' é obrigatório no corpo da requisição." });
    }

    const result = readSiteBComponent(targetPath);
    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  });

  // POST /api/site-b-ecommerce/validate - Validate code syntax without saving
  router.post("/validate", (req: Request, res: Response) => {
    const { code, fileName, path: filePath } = req.body;
    if (code === undefined || code === null) {
      return res.status(400).json({ success: false, error: "Campo 'code' é obrigatório para validação." });
    }

    const name = fileName || (filePath ? path.basename(filePath) : "component.tsx");
    const validation = validateSyntax(code, name);

    res.json({
      success: true,
      validation
    });
  });

  // POST /api/site-b-ecommerce/component or POST /api/site-b-ecommerce/write - Secure write with syntax validation
  const handleWrite = (req: Request, res: Response) => {
    const targetPath = req.body.relativePath || req.body.path || req.body.filePath;
    const content = req.body.newContent !== undefined ? req.body.newContent : req.body.content;
    const author = req.body.author || "express-bridge-api";

    if (!targetPath) {
      return res.status(400).json({ success: false, error: "Campo 'path' ou 'relativePath' é obrigatório." });
    }

    if (content === undefined || content === null) {
      return res.status(400).json({ success: false, error: "Campo 'content' ou 'newContent' é obrigatório." });
    }

    const result = writeSiteBComponent({
      filePath: targetPath,
      content,
      author
    });

    if (!result.success) {
      return res.status(422).json(result);
    }

    res.json(result);
  };

  router.post("/component", handleWrite);
  router.post("/write", handleWrite);

  // GET /api/site-b-ecommerce/snapshots - List snapshots
  router.get("/snapshots", (req: Request, res: Response) => {
    const filterPath = req.query.path as string | undefined;
    const snapshots = getSiteBSnapshots(filterPath);
    res.json({
      success: true,
      count: snapshots.length,
      snapshots
    });
  });

  // POST /api/site-b-ecommerce/rollback - Rollback snapshot
  router.post("/rollback", (req: Request, res: Response) => {
    const { snapshotId } = req.body;
    if (!snapshotId) {
      return res.status(400).json({ success: false, error: "Campo 'snapshotId' é obrigatório." });
    }

    const result = rollbackSiteBSnapshot(snapshotId);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: "Snapshot restaurado com sucesso!",
      result
    });
  });

  return router;
}
