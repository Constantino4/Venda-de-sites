import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Sparkles, 
  Send, 
  RotateCcw, 
  Check, 
  X, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  FolderTree, 
  FileCode, 
  History, 
  GitCommit, 
  Copy, 
  CheckCheck, 
  Zap, 
  Layers, 
  Wand2, 
  Play, 
  ArrowRight,
  Eye,
  RefreshCw,
  Terminal,
  Cpu
} from 'lucide-react';

interface ComponentFileMeta {
  relativePath: string;
  absolutePath: string;
  name: string;
  category: string;
  description: string;
  sizeBytes: number;
  lineCount: number;
  lastModified: string;
  hash: string;
}

interface SyntaxError {
  line: number;
  column: number;
  message: string;
}

interface SyntaxValidationResult {
  valid: boolean;
  errors: SyntaxError[];
  syntaxEngine: string;
  checkedAt: string;
}

interface SnapshotRecord {
  id: string;
  relativePath: string;
  timestamp: string;
  author: 'gemini' | 'manual' | 'rollback';
  prompt?: string;
  previousHash: string;
  newHash: string;
  backupFilePath: string;
  diffSummary?: string[];
  lineCount: number;
}

interface GeminiFileBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialComponentPath?: string;
  onApplySuccess?: (filePath: string, newHash: string) => void;
}

export const GeminiFileBridgeModal: React.FC<GeminiFileBridgeModalProps> = ({
  isOpen,
  onClose,
  initialComponentPath = 'src/site-b-ecommerce/components/NovaStoreHero.tsx',
  onApplySuccess
}) => {
  if (!isOpen) return null;

  // Components list & current selection
  const [components, setComponents] = useState<ComponentFileMeta[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>(initialComponentPath);
  const [selectedMeta, setSelectedMeta] = useState<ComponentFileMeta | null>(null);

  // Code state
  const [originalCode, setOriginalCode] = useState<string>('');
  const [currentCode, setCurrentCode] = useState<string>('');
  const [proposedCode, setProposedCode] = useState<string | null>(null);
  
  // UI Tabs & prompt
  const [activeTab, setActiveTab] = useState<'editor' | 'gemini' | 'diff' | 'snapshots'>('gemini');
  const [promptInput, setPromptInput] = useState<string>('');
  const [geminiExplanation, setGeminiExplanation] = useState<string>('');
  const [geminiDiffs, setGeminiDiffs] = useState<string[]>([]);
  
  // Validation state
  const [validation, setValidation] = useState<SyntaxValidationResult>({
    valid: true,
    errors: [],
    syntaxEngine: 'TypeScript Compiler v5.8',
    checkedAt: new Date().toISOString()
  });

  // Snapshots & status
  const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);
  const [isTransforming, setIsTransforming] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isRollingBack, setIsRollingBack] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  // Load allowed components list
  const loadComponents = async () => {
    setIsLoadingFiles(true);
    try {
      const res = await fetch('/api/gemini-bridge/components');
      const data = await res.json();
      if (data.success && data.components) {
        setComponents(data.components);
        const match = data.components.find((c: ComponentFileMeta) => c.relativePath === selectedPath);
        if (match) {
          setSelectedMeta(match);
        } else if (data.components.length > 0) {
          setSelectedPath(data.components[0].relativePath);
          setSelectedMeta(data.components[0]);
        }
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Erro ao listar componentes: ${err.message}` });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Read selected component file
  const loadComponentFile = async (path: string) => {
    setIsReadingFile(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/gemini-bridge/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relativePath: path })
      });
      const data = await res.json();
      if (data.success && data.content) {
        setOriginalCode(data.content);
        setCurrentCode(data.content);
        setProposedCode(null);
        setSelectedMeta(data.meta || null);
        // Run initial syntax validation
        validateCode(data.content, path);
        // Load snapshots
        loadSnapshots(path);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Falha ao ler componente.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Erro de leitura: ${err.message}` });
    } finally {
      setIsReadingFile(false);
    }
  };

  // Validate syntax
  const validateCode = async (codeToValidate: string, fileName?: string) => {
    setIsValidating(true);
    try {
      const res = await fetch('/api/gemini-bridge/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToValidate, fileName: fileName || selectedPath })
      });
      const data = await res.json();
      if (data.success && data.validation) {
        setValidation(data.validation);
      }
    } catch (err: any) {
      console.warn("Validação offline:", err);
    } finally {
      setIsValidating(false);
    }
  };

  // Load history snapshots
  const loadSnapshots = async (path?: string) => {
    try {
      const url = path ? `/api/gemini-bridge/snapshots?relativePath=${encodeURIComponent(path)}` : '/api/gemini-bridge/snapshots';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.snapshots) {
        setSnapshots(data.snapshots);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    loadComponents();
  }, []);

  useEffect(() => {
    if (selectedPath) {
      loadComponentFile(selectedPath);
    }
  }, [selectedPath]);

  // Transform with Gemini
  const handleGeminiTransform = async (customPrompt?: string) => {
    const promptToSend = customPrompt || promptInput.trim();
    if (!promptToSend || isTransforming) return;

    setIsTransforming(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/gemini-bridge/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relativePath: selectedPath,
          prompt: promptToSend
        })
      });

      const data = await res.json();
      if (data.success && data.proposedCode) {
        setProposedCode(data.proposedCode);
        setGeminiExplanation(data.explanation || 'Modificações propostas pelo Gemini.');
        setGeminiDiffs(data.diffSummary || []);
        if (data.validation) {
          setValidation(data.validation);
        }
        setActiveTab('diff');
        setStatusMessage({
          type: 'info',
          text: `Gemini propôs alterações no componente. Verifique o diff e a validação de sintaxe antes de aplicar atomicamente.`
        });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Falha ao transformar componente com Gemini.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Erro na ponte do Gemini: ${err.message}` });
    } finally {
      setIsTransforming(false);
    }
  };

  // Apply Atomic Write
  const handleApplyAtomicWrite = async () => {
    const codeToApply = proposedCode || currentCode;
    if (!codeToApply || isApplying) return;

    // Pre-check syntax
    if (!validation.valid && validation.errors.length > 0) {
      setStatusMessage({
        type: 'error',
        text: `Não é possível aplicar: existem ${validation.errors.length} erro(s) de sintaxe. Corrija o código antes de gravar.`
      });
      return;
    }

    setIsApplying(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/gemini-bridge/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relativePath: selectedPath,
          newContent: codeToApply,
          author: proposedCode ? 'gemini' : 'manual',
          prompt: promptInput || 'Edição direta no componente'
        })
      });

      const data = await res.json();
      if (data.success) {
        setOriginalCode(codeToApply);
        setCurrentCode(codeToApply);
        setProposedCode(null);
        if (data.validation) setValidation(data.validation);
        
        setStatusMessage({
          type: 'success',
          text: `Escrita atômica executada com sucesso! Snapshot gravado (ID: ${data.snapshotId}). Arquivo atualizado em disco.`
        });

        loadSnapshots(selectedPath);
        loadComponents();
        if (onApplySuccess) {
          onApplySuccess(selectedPath, data.newHash);
        }
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Falha na escrita atômica do arquivo.'
        });
        if (data.validation) setValidation(data.validation);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Erro na escrita atômica: ${err.message}` });
    } finally {
      setIsApplying(false);
    }
  };

  // Rollback to snapshot
  const handleRollbackSnapshot = async (snapshotId: string) => {
    if (!window.confirm('Tem certeza que deseja reverter este componente para a versão do snapshot selecionado?')) {
      return;
    }

    setIsRollingBack(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/gemini-bridge/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshotId })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: `Rollback concluído! O componente foi restaurado com sucesso.`
        });
        loadComponentFile(selectedPath);
        loadSnapshots(selectedPath);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Falha ao reverter snapshot.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Erro ao executar rollback: ${err.message}` });
    } finally {
      setIsRollingBack(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  // Quick Preset Prompts
  const PRESET_PROMPTS = [
    {
      label: '🔴 Botão Vermelho & Badge VIP em NovaStoreHero',
      prompt: 'Altere o botão principal para vermelho vibrante (#dc2626) com efeito de hover, e adicione uma badge de "Oferta Relâmpago VIP 24h" no topo do banner.'
    },
    {
      label: '🌿 Tema Esmeralda & Dark Obsidian',
      prompt: 'Ajuste as cores de fundo do banner para Dark Obsidian Profundo (from-black via-zinc-950) e defina o CTA em Esmeralda (#10b981) de alto contraste.'
    },
    {
      label: '⚡ Adicionar Badges de Benefícios & Frete Grátis',
      prompt: 'Adicione badges de valor adicionais: "Frete Grátis acima de R$ 199", "Garantia de 30 Dias" e "Atendimento 24/7" com ícones lucide-react correspondentes.'
    },
    {
      label: '✨ Design Minimalista com Tipografia Suave',
      prompt: 'Refine o layout para um design minimalista de altíssimo padrão, com espaçamento generoso, bordas sutis e tipografia moderna.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-6xl h-[92vh] max-h-[900px] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* ================= MODAL HEADER ================= */}
        <header className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  Gemini File Bridge & Atomic Engine
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Ponte de Arquivos Segura
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Leitura protegida de componentes, transformação com Gemini e escrita atômica com validação de sintaxe.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Fechar ponte"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ================= COMPONENT SELECTOR & FILE INFO BAR ================= */}
        <div className="bg-slate-900/90 px-5 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          
          {/* File Selector Dropdown */}
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <span className="text-slate-400 font-bold text-[11px] flex items-center gap-1 uppercase tracking-wider">
              <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
              Componente:
            </span>
            <select
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 max-w-md w-full"
            >
              {components.map((c) => (
                <option key={c.relativePath} value={c.relativePath}>
                  {c.name} ({c.category}) — {c.lineCount} linhas
                </option>
              ))}
            </select>
          </div>

          {/* Metadata badges */}
          {selectedMeta && (
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-mono">
                {selectedMeta.lineCount} linhas
              </span>
              <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-mono hidden sm:inline">
                {(selectedMeta.sizeBytes / 1024).toFixed(1)} KB
              </span>
              <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-mono text-purple-300">
                Hash: {selectedMeta.hash}
              </span>
            </div>
          )}
        </div>

        {/* Status Toast Banner */}
        {statusMessage && (
          <div className={`px-5 py-2 text-xs font-bold flex items-center justify-between gap-2 shrink-0 animate-in slide-in-from-top duration-150 ${
            statusMessage.type === 'success' ? 'bg-emerald-600 text-white' :
            statusMessage.type === 'error' ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'
          }`}>
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
               statusMessage.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-white hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= MAIN CONTENT SPLIT ================= */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* ================= LEFT / MAIN PANEL: TABS & CODE DISPLAY ================= */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 border-r border-slate-800">
            
            {/* Tab Navigation Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-2 shrink-0 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('gemini')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    activeTab === 'gemini' 
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Co-Piloto Gemini</span>
                </button>

                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    activeTab === 'editor' 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Código Fonte</span>
                </button>

                {proposedCode && (
                  <button
                    onClick={() => setActiveTab('diff')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      activeTab === 'diff' 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                        : 'text-amber-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <GitCommit className="w-3.5 h-3.5" />
                    <span>Diff Proposto</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('snapshots')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    activeTab === 'snapshots' 
                      ? 'bg-slate-800 text-white border border-slate-700' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Snapshots ({snapshots.length})</span>
                </button>
              </div>

              {/* Action: Copy code */}
              <button
                onClick={() => handleCopyCode(proposedCode || currentCode)}
                className="px-2.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                title="Copiar código"
              >
                {copiedNotice ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNotice ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            {/* Tab 1: GEMINI COPILOT PROMPT & INTERACTION */}
            {activeTab === 'gemini' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                
                <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-800/40 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-black text-white">Instrução Direta para o Gemini Bridge</h3>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Escreva o que deseja transformar no componente <strong>{selectedMeta?.name || selectedPath}</strong>. O Gemini lerá o código atual, proporá as alterações exatas em TSX e o validador de sintaxe garantirá integridade total antes da escrita atômica.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Prompt Box */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Prompt / Instrução de Código:</label>
                  <div className="relative">
                    <textarea
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      placeholder="Ex: Altere o botão principal de agendamento/compra para vermelho vibrante com cantos arredondados e adicione badge de oferta..."
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition resize-none"
                    />
                    <button
                      onClick={() => handleGeminiTransform()}
                      disabled={!promptInput.trim() || isTransforming}
                      className="absolute right-3 bottom-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-purple-600/20 transition flex items-center gap-1.5"
                    >
                      {isTransforming ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Processando...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Transformar Componente</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Presets Grid */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    Sugestões Rápidas de Transformação:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRESET_PROMPTS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPromptInput(preset.prompt);
                          handleGeminiTransform(preset.prompt);
                        }}
                        disabled={isTransforming}
                        className="text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition flex flex-col gap-1 group"
                      >
                        <span className="font-bold text-white group-hover:text-purple-300 flex items-center justify-between">
                          <span>{preset.label}</span>
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-0.5" />
                        </span>
                        <span className="text-[11px] text-slate-400 line-clamp-2">{preset.prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gemini Output explanation if available */}
                {geminiExplanation && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Explicação da Proposta do Gemini
                      </span>
                      <button
                        onClick={() => setActiveTab('diff')}
                        className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1"
                      >
                        <span>Ver Diff Completo</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{geminiExplanation}</p>
                    {geminiDiffs.length > 0 && (
                      <ul className="space-y-1 pt-1">
                        {geminiDiffs.map((d, i) => (
                          <li key={i} className="text-[11px] text-emerald-400 flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* Tab 2: RAW CODE EDITOR VIEW */}
            {activeTab === 'editor' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed bg-slate-950">
                  <textarea
                    value={currentCode}
                    onChange={(e) => {
                      setCurrentCode(e.target.value);
                      validateCode(e.target.value, selectedPath);
                    }}
                    className="w-full h-full bg-transparent border-0 outline-none resize-none font-mono text-xs text-slate-200 focus:ring-0 leading-relaxed"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {/* Tab 3: PROPOSED DIFF VIEW */}
            {activeTab === 'diff' && proposedCode && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800 text-xs flex items-center justify-between text-slate-300">
                  <span className="font-bold flex items-center gap-1.5">
                    <GitCommit className="w-3.5 h-3.5 text-blue-400" />
                    Código Proposto pelo Gemini (Pronto para Aplicação Atômica)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {proposedCode.split('\n').length} linhas geradas
                  </span>
                </div>
                <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed bg-slate-950">
                  <pre className="text-emerald-300/90 whitespace-pre-wrap">{proposedCode}</pre>
                </div>
              </div>
            )}

            {/* Tab 4: SNAPSHOTS HISTORY */}
            {activeTab === 'snapshots' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-purple-400" />
                    Histórico de Snapshots & Rollback
                  </h3>
                  <button
                    onClick={() => loadSnapshots(selectedPath)}
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Atualizar</span>
                  </button>
                </div>

                {snapshots.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Nenhum snapshot de alteração gravado para este componente ainda.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {snapshots.map((snap) => (
                      <div
                        key={snap.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-slate-700 transition"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-purple-300">{snap.id}</span>
                            <span className="bg-slate-800 text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full uppercase">
                              {snap.author}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(snap.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          {snap.prompt && (
                            <p className="text-xs text-slate-300 truncate max-w-lg">"{snap.prompt}"</p>
                          )}
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                            <span>Hash: {snap.newHash}</span>
                            <span>•</span>
                            <span>{snap.lineCount} linhas</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRollbackSnapshot(snap.id)}
                          disabled={isRollingBack}
                          className="bg-slate-800 hover:bg-red-950/80 hover:border-red-800 border border-slate-700 text-slate-300 hover:text-red-300 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                          title="Restaurar arquivo para o estado deste snapshot"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reverter</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ================= RIGHT PANEL: SYNTAX VALIDATOR & ATOMIC APPLY GUARD ================= */}
          <div className="w-full md:w-80 bg-slate-900 p-5 flex flex-col justify-between shrink-0 border-t md:border-t-0 border-slate-800 overflow-y-auto">
            
            <div className="space-y-5">
              
              {/* Syntax Validator Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-indigo-400" />
                    Validador de Sintaxe
                  </span>
                  <button
                    onClick={() => validateCode(proposedCode || currentCode, selectedPath)}
                    disabled={isValidating}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-bold"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${isValidating ? 'animate-spin' : ''}`} />
                    <span>Verificar</span>
                  </button>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${
                  validation.valid 
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' 
                    : 'bg-red-950/40 border-red-800/60 text-red-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {validation.valid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-xs font-black text-white">
                        {validation.valid ? 'Sintaxe 100% Válida' : 'Erros de Sintaxe Detectados'}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {validation.valid ? '0 erros de AST / TypeScript' : `${validation.errors.length} erro(s) que impedem gravação`}
                      </p>
                    </div>
                  </div>

                  {!validation.valid && validation.errors.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-red-800/40 space-y-1.5 max-h-36 overflow-y-auto">
                      {validation.errors.map((err, i) => (
                        <div key={i} className="text-[10px] text-red-200 font-mono bg-red-950/80 p-2 rounded-lg border border-red-800/40">
                          <strong>L{err.line}:C{err.column}</strong> — {err.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Atomic Safety Features */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Garantias da Ponte Atômica
                </span>
                <ul className="text-[11px] text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Pre-write Validation:</strong> Validação de sintaxe antes de qualquer toque no disco.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Atomic Write:</strong> Substituição em nível de OS (rename atômico) evitando arquivos corrompidos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Rollback Instantâneo:</strong> Snapshot automático gerado em cada alteração.</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Atomic Apply Button in Footer */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={handleApplyAtomicWrite}
                disabled={isApplying || !validation.valid}
                className={`w-full py-3 px-4 rounded-2xl font-black text-xs transition flex items-center justify-center gap-2 shadow-xl ${
                  !validation.valid
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : proposedCode
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                {isApplying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executando Escrita Atômica...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{proposedCode ? 'Aplicar Alterações Atomicamente (Apply)' : 'Salvar Código Fonte'}</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 px-3 text-slate-400 hover:text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
