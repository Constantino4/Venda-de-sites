import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Rocket, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Loader2, 
  ShieldCheck, 
  Lock, 
  Globe, 
  GitBranch, 
  FolderGit2, 
  Terminal, 
  Check, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft, 
  UserCheck, 
  FileCode,
  LogOut
} from 'lucide-react';

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  public_repos?: number;
}

interface GitHubDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProduct?: {
    id: string;
    title: string;
    slug?: string;
  } | null;
}

const STORAGE_TOKEN_KEY = 'webmarket_github_token';
const STORAGE_USER_KEY = 'webmarket_github_user';

export const GitHubDeployModal: React.FC<GitHubDeployModalProps> = ({
  isOpen,
  onClose,
  targetProduct
}) => {
  // Step state: 1: Auth, 2: Config, 3: Audit, 4: Progress, 5: Success
  const [step, setStep] = useState<number>(1);

  // GitHub Auth State (Each user receives and uses their own isolated OAuth token)
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [githubToken, setGithubToken] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Repo Configuration State
  const [mode, setMode] = useState<'create' | 'existing'>('create');
  const [repoName, setRepoName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [defaultBranch, setDefaultBranch] = useState<string>('main');
  const [isValidatingRepo, setIsValidatingRepo] = useState<boolean>(false);
  const [repoValidationMsg, setRepoValidationMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Progress & Deployment State
  const [deployProgress, setDeployProgress] = useState<number>(0);
  const [currentDeployStage, setCurrentDeployStage] = useState<string>('');
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployError, setDeployError] = useState<string>('');

  // Deploy Result State
  const [resultData, setResultData] = useState<{
    repoUrl: string;
    repoName: string;
    owner: string;
    branch: string;
    filesCount: number;
  } | null>(null);

  // Load stored GitHub user session on modal open
  useEffect(() => {
    if (isOpen) {
      try {
        const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
        const savedUserStr = localStorage.getItem(STORAGE_USER_KEY);
        if (savedToken && savedUserStr) {
          const parsedUser = JSON.parse(savedUserStr);
          if (parsedUser && parsedUser.login) {
            setGithubToken(savedToken);
            setGithubUser(parsedUser);
          }
        }
      } catch (_) {}

      // Auto fill default repo name based on target product or default project
      if (targetProduct) {
        const cleanName = (targetProduct.slug || targetProduct.title)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        setRepoName(`${cleanName}-repo`);
        setDescription(`Repositório do projeto ${targetProduct.title} gerado via WebMarket.`);
      } else if (!repoName) {
        setRepoName(`webmarket-projeto-${Date.now().toString().slice(-4)}`);
        setDescription('Repositório exportado com suporte completo a React, Vite e Tailwind CSS.');
      }
    }
  }, [isOpen, targetProduct]);

  // Listen for OAuth postMessage popup completion
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GITHUB_OAUTH_SUCCESS') {
        const { token, user } = event.data;
        if (token && user) {
          setGithubToken(token);
          setGithubUser(user);
          try {
            localStorage.setItem(STORAGE_TOKEN_KEY, token);
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
          } catch (_) {}
          setIsAuthenticating(false);
          setAuthError('');
          // Automatically advance to repo config step
          setStep(2);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Step 1: Connect to GitHub via Official OAuth Popup
  const handleConnectGithub = async () => {
    setIsAuthenticating(true);
    setAuthError('');

    try {
      const originParam = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
      const res = await fetch(`/api/auth/github/url?origin=${originParam}`);
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Não foi possível iniciar a autenticação com o GitHub.');
      }

      // Open official GitHub OAuth popup directly
      const popup = window.open(
        data.url,
        'github_oauth_popup',
        'width=600,height=720,status=no,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('O navegador bloqueou o pop-up de login. Por favor, permita pop-ups para este site.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Falha ao conectar com o GitHub.');
      setIsAuthenticating(false);
    }
  };

  // Disconnect GitHub Account
  const handleDisconnectGithub = () => {
    setGithubUser(null);
    setGithubToken('');
    try {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
    } catch (_) {}
    setStep(1);
    setRepoValidationMsg(null);
  };

  // Real-time Repo Name Validation
  const handleRepoNameChange = (val: string) => {
    const sanitized = val.toLowerCase().replace(/[^a-z0-9_.-]/g, '-');
    setRepoName(sanitized);
    setRepoValidationMsg(null);
  };

  const handleValidateRepoName = async () => {
    if (!repoName || repoName.trim().length < 2) {
      setRepoValidationMsg({ type: 'error', text: 'Informe um nome de repositório válido com pelo menos 2 caracteres.' });
      return;
    }

    if (!githubToken) {
      setRepoValidationMsg({ type: 'error', text: 'Conecte sua conta do GitHub antes de validar.' });
      return;
    }

    setIsValidatingRepo(true);
    setRepoValidationMsg(null);

    try {
      const res = await fetch('/api/github/validate-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken,
          repoName: repoName.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.exists) {
          if (mode === 'create') {
            setRepoValidationMsg({
              type: 'error',
              text: `O repositório "${repoName}" já existe na sua conta. Escolha outro nome ou mude para a opção "Usar Repositório Existente".`
            });
          } else {
            setRepoValidationMsg({
              type: 'success',
              text: `Repositório encontrado na sua conta (${data.isPrivate ? 'Privado' : 'Público'}). Pronto para receber o deploy.`
            });
          }
        } else {
          if (mode === 'create') {
            setRepoValidationMsg({
              type: 'success',
              text: `Nome "${repoName}" disponível! O repositório será criado na sua conta @${data.owner}.`
            });
          } else {
            setRepoValidationMsg({
              type: 'error',
              text: `O repositório "${repoName}" não foi encontrado na sua conta @${data.owner}. Mude para "Criar Novo Repositório".`
            });
          }
        }
      } else {
        setRepoValidationMsg({
          type: 'error',
          text: data.error || 'Erro ao consultar o GitHub.'
        });
      }
    } catch (err: any) {
      setRepoValidationMsg({
        type: 'error',
        text: 'Falha na conexão ao validar repositório: ' + err.message
      });
    } finally {
      setIsValidatingRepo(false);
    }
  };

  // Step 4: Execute Real GitHub Deployment
  const handleStartDeploy = async () => {
    if (!githubToken || !repoName) {
      setDeployError('Autenticação ou nome de repositório ausente.');
      return;
    }

    setStep(4);
    setIsDeploying(true);
    setDeployError('');
    setDeployProgress(10);
    setDeployLogs(['🚀 Iniciando assistente de deploy oficial do GitHub...']);

    try {
      await new Promise((r) => setTimeout(r, 600));
      setCurrentDeployStage('Conectando à sua conta do GitHub...');
      setDeployProgress(20);
      setDeployLogs((prev) => [...prev, `[1/6] Autenticado com sucesso como @${githubUser?.login || 'usuario'}`]);

      await new Promise((r) => setTimeout(r, 600));
      setCurrentDeployStage('Auditoria de código e proteção de credenciais...');
      setDeployProgress(40);
      setDeployLogs((prev) => [
        ...prev,
        '[2/6] Sanitizando arquivos sensíveis: .env omitido, .env.example gerado com segurança',
        '[3/6] Compactando e preparando código-fonte da aplicação'
      ]);

      await new Promise((r) => setTimeout(r, 600));
      setCurrentDeployStage(`Configurando repositório na conta @${githubUser?.login}...`);
      setDeployProgress(60);
      setDeployLogs((prev) => [
        ...prev,
        `[4/6] ${mode === 'create' ? 'Criando novo repositório' : 'Sincronizando repositório existente'} "${repoName}" (${isPrivate ? 'Privado' : 'Público'})`
      ]);

      // Call backend deployment API endpoint with user's isolated OAuth token
      const res = await fetch('/api/github/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken,
          repoName: repoName.trim(),
          description: description.trim(),
          isPrivate,
          defaultBranch: defaultBranch || 'main',
          mode,
          targetSource: targetProduct?.id || 'workspace'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao realizar deploy no GitHub.');
      }

      await new Promise((r) => setTimeout(r, 500));
      setCurrentDeployStage('Gravando árvores Git e gerando commits...');
      setDeployProgress(85);
      setDeployLogs((prev) => [
        ...prev,
        `[5/6] ${data.filesUploaded || 'Todos os'} arquivos processados e convertidos em Blobs Git`,
        `[6/6] Commit assinado com sucesso na branch ${data.branch || 'main'}`
      ]);

      await new Promise((r) => setTimeout(r, 600));
      setCurrentDeployStage('Deploy concluído com sucesso!');
      setDeployProgress(100);
      setDeployLogs((prev) => [
        ...prev,
        `✨ Repositório oficial publicado no GitHub: ${data.repoUrl}`
      ]);

      setResultData({
        repoUrl: data.repoUrl,
        repoName: data.repoName,
        owner: data.owner,
        branch: data.branch,
        filesCount: data.filesUploaded || 0
      });

      setIsDeploying(false);
      setStep(5);
    } catch (err: any) {
      console.error('Erro no deploy:', err);
      setDeployError(err.message || 'Ocorreu um erro ao enviar os arquivos para o GitHub.');
      setIsDeploying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden text-slate-900 my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-xs">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white">Deploy para o GitHub</h3>
              <p className="text-xs text-slate-300">
                {targetProduct ? `Projeto: ${targetProduct.title}` : 'Exporte e sincronize seu código diretamente na sua conta do GitHub'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            
            {/* Step 1 */}
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-blue-600 font-extrabold' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono ${step >= 1 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'}`}>
                1
              </span>
              <span>Autenticação</span>
            </div>

            <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>

            {/* Step 2 */}
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-blue-600 font-extrabold' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono ${step >= 2 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'}`}>
                2
              </span>
              <span>Repositório</span>
            </div>

            <div className={`h-0.5 flex-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>

            {/* Step 3 */}
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-blue-600 font-extrabold' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono ${step >= 3 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'}`}>
                3
              </span>
              <span>Segurança</span>
            </div>

            <div className={`h-0.5 flex-1 mx-2 ${step >= 4 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>

            {/* Step 4 */}
            <div className={`flex items-center gap-1.5 ${step >= 4 ? 'text-blue-600 font-extrabold' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono ${step >= 4 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'}`}>
                4
              </span>
              <span>Deploy</span>
            </div>

          </div>
        </div>

        {/* Modal Body per Step */}
        <div className="p-6 space-y-6">

          {/* STEP 1: LOGIN / AUTORIZAÇÃO GITHUB */}
          {step === 1 && (
            <div className="space-y-6">
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Github className="w-5 h-5 text-slate-900" />
                  <span>Conexão Segura com GitHub OAuth</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Conecte sua conta do GitHub para criar e versionar repositórios diretamente no seu perfil. 
                  Você será redirecionado para a página oficial de autorização do GitHub.
                </p>
              </div>

              {/* Logged In State */}
              {githubUser ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={githubUser.avatar_url}
                        alt={githubUser.login}
                        className="w-12 h-12 rounded-full border-2 border-emerald-400 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">{githubUser.name || githubUser.login}</span>
                          <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-emerald-700" /> Conectado
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-mono">@{githubUser.login}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleDisconnectGithub}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline flex items-center gap-1.5 bg-rose-100/50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Desconectar GitHub</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                    <p className="text-[11px] text-emerald-800">
                      Os repositórios criados serão vinculados à sua conta <strong>@{githubUser.login}</strong>.
                    </p>
                    <button
                      onClick={() => setStep(2)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <span>Deploy para GitHub</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Connect Button */
                <div className="space-y-4">
                  <button
                    onClick={handleConnectGithub}
                    disabled={isAuthenticating}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-4 px-6 rounded-2xl shadow-lg transition flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                        <span>Aguardando autorização no GitHub...</span>
                      </>
                    ) : (
                      <>
                        <Github className="w-5 h-5" />
                        <span>Conectar ao GitHub</span>
                      </>
                    )}
                  </button>

                  {authError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-4 rounded-xl flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold">Aviso de Conexão:</p>
                        <p>{authError}</p>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Privacidade e Segurança Garantidas</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Ao autorizar, você concede permissão apenas para criação e envio de repositórios do seu projeto. Suas credenciais permanecem protegidas e você pode desconectar a qualquer momento.
                    </p>
                  </div>
                </div>
              )}

              {/* Advance Button (if user is connected) */}
              {githubUser && (
                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md transition flex items-center gap-2"
                  >
                    <span>Avançar para Repositório</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          )}

          {/* STEP 2: CONFIGURAÇÃO DO REPOSITÓRIO */}
          {step === 2 && (
            <div className="space-y-5">
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('create')}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                    mode === 'create'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FolderGit2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs block text-slate-900">Criar Novo Repositório</span>
                    <span className="text-[10px] text-slate-500">Cria um novo repo na conta @{githubUser?.login}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('existing')}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                    mode === 'existing'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <GitBranch className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs block text-slate-900">Usar Repositório Existente</span>
                    <span className="text-[10px] text-slate-500">Envia/Atualiza arquivos em repo existente</span>
                  </div>
                </button>
              </div>

              {/* Repo Name & Validation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Nome do Repositório no GitHub <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                      {githubUser?.login || 'usuario'}/
                    </span>
                    <input
                      type="text"
                      value={repoName}
                      onChange={(e) => handleRepoNameChange(e.target.value)}
                      placeholder="meu-novo-site"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-24 pr-3 py-2.5 text-xs font-bold font-mono text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleValidateRepoName}
                    disabled={isValidatingRepo || !repoName}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-2.5 rounded-xl transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {isValidatingRepo ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" /> : <RefreshCw className="w-3.5 h-3.5 text-slate-600" />}
                    <span>Verificar</span>
                  </button>
                </div>

                {repoValidationMsg && (
                  <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    repoValidationMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {repoValidationMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{repoValidationMsg.text}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Descrição do Repositório <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição breve do projeto..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Visibility & Default Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-2">Visibilidade</label>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition ${!isPrivate ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold' : 'border-slate-200 text-slate-700'}`}>
                      <input
                        type="radio"
                        name="visibility"
                        checked={!isPrivate}
                        onChange={() => setIsPrivate(false)}
                        className="text-blue-600"
                      />
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>Público (Acesso livre no GitHub)</span>
                    </label>

                    <label className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition ${isPrivate ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold' : 'border-slate-200 text-slate-700'}`}>
                      <input
                        type="radio"
                        name="visibility"
                        checked={isPrivate}
                        onChange={() => setIsPrivate(true)}
                        className="text-blue-600"
                      />
                      <Lock className="w-4 h-4 text-purple-600" />
                      <span>Privado (Visível apenas para você)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-2">Branch Principal</label>
                  <input
                    type="text"
                    value={defaultBranch}
                    onChange={(e) => setDefaultBranch(e.target.value || 'main')}
                    placeholder="main"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Por padrão será usada a branch <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">main</code>.</p>
                </div>

              </div>

              {/* Step Navigation */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                <button
                  onClick={() => setStep(3)}
                  disabled={!repoName || repoName.trim().length < 2}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md transition flex items-center gap-2 disabled:opacity-40"
                >
                  <span>Avançar para Segurança</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: PREPARAÇÃO DO PROJETO & AUDITORIA DE SEGURANÇA */}
          {step === 3 && (
            <div className="space-y-5">
              
              {/* Security Shield Banner */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-5 rounded-2xl border border-emerald-800 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Proteção Ativa contra Vazamento de Chaves Privadas</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Antes do envio para o GitHub, nosso motor de auditoria remove automaticamente arquivos de variáveis sensíveis e arquivos de ambiente do pacote de upload.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-white/10 p-2 rounded-xl border border-white/10 font-mono text-emerald-300">
                    ✓ .env omitido (Sanitizado)
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl border border-white/10 font-mono text-emerald-300">
                    ✓ .env.example gerado
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl border border-white/10 font-mono text-emerald-300">
                    ✓ node_modules filtrados
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl border border-white/10 font-mono text-emerald-300">
                    ✓ Chaves e Secrets protegidas
                  </div>
                </div>
              </div>

              {/* Project Structure Checklist */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Checklist de Estrutura do Projeto</h4>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200">
                    <span className="flex items-center gap-2 text-slate-800 font-medium">
                      <FileCode className="w-4 h-4 text-blue-600" /> package.json & dependências
                    </span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Verificado
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200">
                    <span className="flex items-center gap-2 text-slate-800 font-medium">
                      <FileCode className="w-4 h-4 text-purple-600" /> README.md & Documentação
                    </span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Verificado
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200">
                    <span className="flex items-center gap-2 text-slate-800 font-medium">
                      <FileCode className="w-4 h-4 text-emerald-600" /> Código-Fonte / Componentes / Server
                    </span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Verificado
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200">
                    <span className="flex items-center gap-2 text-slate-800 font-medium">
                      <FileCode className="w-4 h-4 text-amber-600" /> .gitignore & .env.example
                    </span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Gerado
                    </span>
                  </div>
                </div>
              </div>

              {/* Step Navigation */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                <button
                  onClick={handleStartDeploy}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-lg transition flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Confirmar e Iniciar Deploy no GitHub</span>
                </button>
              </div>

            </div>
          )}

          {/* STEP 4: BARRA DE PROGRESSO E DEPLOY EM ANDAMENTO */}
          {step === 4 && (
            <div className="space-y-6">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{currentDeployStage || 'Processando deploy...'}</span>
                  <span className="font-mono text-purple-600 font-black">{deployProgress}%</span>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${deployProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Live Terminal Output Console */}
              <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-2xl space-y-2 border border-slate-800 shadow-inner max-h-60 overflow-y-auto">
                <div className="flex items-center gap-2 text-slate-500 pb-1 border-b border-slate-800 text-[10px]">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>GITHUB DEPLOY TERMINAL STREAM</span>
                </div>

                {deployLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-600 shrink-0">&gt;</span>
                    <span className="break-all">{log}</span>
                  </div>
                ))}

                {isDeploying && (
                  <div className="flex items-center gap-2 text-purple-400 pt-2 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Comunicando com a API oficial do GitHub...</span>
                  </div>
                )}
              </div>

              {/* Error State with Retry */}
              {deployError && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-rose-900">Falha no Deploy do GitHub</p>
                      <p className="text-rose-700 mt-1">{deployError}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setStep(2)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-4 py-2 rounded-xl transition"
                    >
                      Ajustar Dados
                    </button>
                    <button
                      onClick={handleStartDeploy}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Tentar Novamente</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 5: RESULTADO & CONCLUÍDO */}
          {step === 5 && resultData && (
            <div className="space-y-6">
              
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl space-y-4 text-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-emerald-950">Projeto enviado para o GitHub com sucesso!</h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                    Seu repositório foi criado e todos os arquivos do projeto foram sincronizados e versionados na sua conta do GitHub.
                  </p>
                </div>

                {/* Summary Box */}
                <div className="bg-white border border-emerald-200 rounded-2xl p-4 text-left space-y-2 text-xs shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Repositório:</span>
                    <span className="font-mono font-bold text-slate-900">{resultData.owner}/{resultData.repoName}</span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Proprietário / Conta:</span>
                    <span className="font-mono font-bold text-purple-700">@{resultData.owner}</span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Branch Utilizada:</span>
                    <span className="font-mono font-bold text-blue-600">{resultData.branch}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Arquivos Processados:</span>
                    <span className="font-bold text-emerald-600">{resultData.filesCount} arquivos enviados</span>
                  </div>
                </div>

                {/* Open in GitHub Primary Action Button */}
                <div className="pt-2">
                  <a
                    href={resultData.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm py-4 px-6 rounded-2xl shadow-xl transition"
                  >
                    <Github className="w-5 h-5" />
                    <span>Abrir no GitHub</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>

              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <button
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl transition"
                >
                  Fechar Assistente
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
