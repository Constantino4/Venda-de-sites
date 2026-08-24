import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { 
  X, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  Mail, 
  Lock, 
  Phone, 
  User as UserIcon, 
  ArrowRight, 
  CheckCircle2, 
  KeyRound, 
  Smartphone,
  ChevronLeft,
  Sparkles,
  Check
} from 'lucide-react';

type AuthMethod = 'email' | 'phone' | 'social';
type EmailMode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    signInWithGoogle, 
    signInWithGithub, 
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    sendPhoneOtp,
    verifyPhoneOtp,
    error, 
    clearError 
  } = useAuth();

  // Tab states
  const [activeMethod, setActiveMethod] = useState<AuthMethod>('email');
  const [emailMode, setEmailMode] = useState<EmailMode>('login');

  // Form states - Email
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Form states - Phone/SMS
  const [countryCode, setCountryCode] = useState('+244'); // Angola default, selectable
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'verify'>('input');

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null);

  if (!isAuthModalOpen) return null;

  // Handle Email & Password login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setResetSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (emailMode === 'login') {
        await signInWithEmail(email, password);
      } else if (emailMode === 'register') {
        await signUpWithEmail(email, password, name);
      } else if (emailMode === 'forgot') {
        const success = await resetPassword(email);
        if (success) {
          setResetSuccessMessage(`Enviamos um link de recuperação para ${email}. Verifique sua caixa de entrada e spam.`);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Phone SMS Step 1: Send OTP
  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);

    const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
    try {
      const ok = await sendPhoneOtp(fullPhone, 'recaptcha-container');
      if (ok) {
        setPhoneStep('verify');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Phone SMS Step 2: Verify OTP
  const handleVerifySms = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);

    try {
      await verifyPhoneOtp(smsCode);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Social logins
  const handleGoogleLogin = async () => {
    clearError();
    setSocialLoading('google');
    try {
      await signInWithGoogle();
    } finally {
      setSocialLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    clearError();
    setSocialLoading('github');
    try {
      await signInWithGithub();
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150 relative max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Hidden reCAPTCHA container for Firebase Phone Auth */}
        <div id="recaptcha-container"></div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Acesse sua Conta
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                SiteForge • Autenticação Segura
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (E-mail, SMS, Redes) */}
        <div className="px-5 sm:px-6 pt-4 shrink-0">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => { setActiveMethod('email'); clearError(); }}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeMethod === 'email'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>E-mail</span>
            </button>

            <button
              onClick={() => { setActiveMethod('phone'); clearError(); }}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeMethod === 'phone'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>SMS / Cel</span>
            </button>

            <button
              onClick={() => { setActiveMethod('social'); clearError(); }}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeMethod === 'social'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Social</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 pt-4 overflow-y-auto space-y-4">
          
          {/* Error Message Alert */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-950 rounded-2xl text-xs flex flex-col gap-2 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-rose-900">Atenção</p>
                  <p className="mt-0.5 text-rose-800 leading-relaxed">{error}</p>
                </div>
                <button 
                  onClick={clearError}
                  className="text-rose-400 hover:text-rose-700 text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>

              {/* Quick contextual action helpers */}
              {activeMethod === 'email' && emailMode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setEmailMode('register');
                    clearError();
                  }}
                  className="mt-1 w-full text-center py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Primeira vez? Clique aqui para Criar sua Conta</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {activeMethod === 'social' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveMethod('email');
                    clearError();
                  }}
                  className="mt-1 w-full text-center py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Usar E-mail e Senha para Entrar</span>
                </button>
              )}
            </div>
          )}

          {/* Reset Password Success Alert */}
          {resetSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-emerald-900">E-mail Enviado com Sucesso</p>
                <p className="mt-0.5 text-emerald-800 leading-relaxed">{resetSuccessMessage}</p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: EMAIL & SENHA                                     */}
          {/* ========================================================= */}
          {activeMethod === 'email' && (
            <div className="space-y-4">
              {/* Sub-modes for Email: Entrar / Cadastrar */}
              <div className="flex border-b border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => { setEmailMode('login'); clearError(); setResetSuccessMessage(null); }}
                  className={`pb-2.5 px-3 font-bold border-b-2 transition ${
                    emailMode === 'login'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Entrar na Conta
                </button>
                <button
                  type="button"
                  onClick={() => { setEmailMode('register'); clearError(); setResetSuccessMessage(null); }}
                  className={`pb-2.5 px-3 font-bold border-b-2 transition ${
                    emailMode === 'register'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Criar Nova Conta
                </button>
                {emailMode === 'forgot' && (
                  <button
                    type="button"
                    className="pb-2.5 px-3 font-bold border-b-2 border-blue-600 text-blue-600"
                  >
                    Recuperar Senha
                  </button>
                )}
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                {/* Nome Completo (Apenas no Cadastro) */}
                {emailMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: João da Silva"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>
                )}

                {/* E-mail */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Endereço de E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Senha */}
                {emailMode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Senha
                      </label>
                      {emailMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => { setEmailMode('forgot'); clearError(); }}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Esqueceu a senha?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Processando...</span>
                    </>
                  ) : emailMode === 'login' ? (
                    <>
                      <span>Entrar com E-mail</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : emailMode === 'register' ? (
                    <>
                      <span>Criar Conta Gratuita</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Enviar Link de Recuperação</span>
                      <Mail className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Back to login button if in forgot mode */}
                {emailMode === 'forgot' && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => { setEmailMode('login'); clearError(); }}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Voltar ao login
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SMS / CELULAR                                      */}
          {/* ========================================================= */}
          {activeMethod === 'phone' && (
            <div className="space-y-4">
              {phoneStep === 'input' ? (
                <form onSubmit={handleSendSms} className="space-y-3.5">
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
                    <Smartphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Digite seu número de celular. Você receberá um código de 6 dígitos via <strong>SMS</strong> para entrar sem senha.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Número de Celular
                    </label>
                    <div className="flex gap-2">
                      {/* Country Code Selector */}
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="+244">🇦🇴 +244 (Angola)</option>
                        <option value="+351">🇵🇹 +351 (Portugal)</option>
                        <option value="+55">🇧🇷 +55 (Brasil)</option>
                        <option value="+258">🇲🇿 +258 (Moçambique)</option>
                        <option value="+238">🇨🇻 +238 (Cabo Verde)</option>
                        <option value="+239">🇸🇹 +239 (São Tomé)</option>
                        <option value="+1">🇺🇸 +1 (EUA/Canadá)</option>
                        <option value="+34">🇪🇸 +34 (Espanha)</option>
                        <option value="+44">🇬🇧 +44 (Reino Unido)</option>
                        <option value="+33">🇫🇷 +33 (França)</option>
                      </select>

                      {/* Phone Input */}
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="923 000 000"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !phoneNumber.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Enviando código SMS...</span>
                      </>
                    ) : (
                      <>
                        <span>Enviar Código por SMS</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Confirm OTP */
                <form onSubmit={handleVerifySms} className="space-y-3.5">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-900 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Código SMS Enviado!</p>
                      <p className="mt-0.5 text-emerald-800">
                        Insira o código de 6 dígitos enviado para <strong>{countryCode} {phoneNumber}</strong>.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Código de Verificação SMS (6 dígitos)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono tracking-widest text-center focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || smsCode.length < 6}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Validando código...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirmar e Entrar</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => { setPhoneStep('input'); clearError(); }}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Alterar número de telefone
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: SOCIAL LOGIN (GOOGLE / GITHUB)                     */}
          {/* ========================================================= */}
          {activeMethod === 'social' && (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-slate-500 font-medium text-center pb-1">
                Conecte-se instantaneamente com suas contas:
              </p>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={socialLoading !== null}
                className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm py-3 px-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition flex items-center justify-center gap-3 disabled:opacity-60 relative"
              >
                {socialLoading === 'google' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span>Conectando com o Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continuar com Google</span>
                  </>
                )}
              </button>

              {/* GitHub Login Button */}
              <button
                type="button"
                onClick={handleGithubLogin}
                disabled={socialLoading !== null}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 px-4 rounded-2xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-3 disabled:opacity-60 relative"
              >
                {socialLoading === 'github' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                    <span>Conectando com o GitHub...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 fill-current shrink-0 text-white" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>Continuar com GitHub</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Benefits Info Box */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 text-[11px] text-slate-600">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Downloads instantâneos de todos os códigos e pacotes .ZIP</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Painel do vendedor para anunciar e vender seus sites</span>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="text-center text-[10px] text-slate-400">
            <p>
              Ao entrar, você concorda com os Termos de Uso e Política de Privacidade.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
