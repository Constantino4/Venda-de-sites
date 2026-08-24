import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from './firebase';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<User | null>;
  signInWithGithub: () => Promise<User | null>;
  signInWithEmail: (email: string, pass: string) => Promise<User | null>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<User | null>;
  resetPassword: (email: string) => Promise<boolean>;
  sendPhoneOtp: (phoneNumber: string, containerElementId: string) => Promise<boolean>;
  verifyPhoneOtp: (code: string) => Promise<User | null>;
  logout: () => Promise<void>;
  clearError: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Translates Firebase Auth error codes to user-friendly messages in Portuguese
 */
export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return 'Ocorreu um erro desconhecido na autenticação.';

  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'O processo de login foi cancelado pelo usuário ao fechar a janela.';
    case 'auth/popup-blocked':
      return 'A janela popup foi bloqueada pelo seu navegador. Por favor, permita popups neste site para concluir o login.';
    case 'auth/cancelled-popup-request':
      return 'A solicitação de login popup anterior foi cancelada.';
    case 'auth/account-exists-with-different-credential':
      return 'Já existe uma conta cadastrada com este mesmo endereço de e-mail utilizando outro método de acesso. Por favor, faça login utilizando o provedor original.';
    case 'auth/credential-already-in-use':
      return 'Esta credencial já está associada a outra conta de usuário.';
    case 'auth/network-request-failed':
      return 'Falha de conexão com a rede. Verifique sua conexão com a internet e tente novamente.';
    case 'auth/operation-not-allowed':
      return 'Este método de login (E-mail, Telefone ou Redes Sociais) ainda precisa ser ativado no Firebase Console (Authentication > Sign-in method).';
    case 'auth/unauthorized-domain':
      return 'Domínio não autorizado pelo Firebase. Adicione "run.app" aos Domínios Autorizados no Firebase Console (Authentication > Configurações > Domínios autorizados), ou entre com E-mail e Senha abaixo.';
    case 'auth/user-disabled':
      return 'Esta conta de usuário foi temporariamente desativada.';
    case 'auth/user-not-found':
      return 'Nenhuma conta encontrada com este e-mail. Se for seu primeiro acesso, mude para a aba "Criar Nova Conta".';
    case 'auth/wrong-password':
      return 'Senha incorreta. Verifique a senha digitada ou clique em "Esqueceu a senha?".';
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos, ou a conta ainda não existe. Se for seu primeiro acesso, clique na aba "Criar Nova Conta" acima.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado em nossa base. Faça login ou utilize a recuperação de senha.';
    case 'auth/invalid-email':
      return 'Endereço de e-mail inválido. Digite um e-mail válido (exemplo: usuario@email.com).';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Escolha uma senha segura com pelo menos 6 caracteres.';
    case 'auth/invalid-phone-number':
      return 'Número de telefone inválido. Certifique-se de incluir o código do país (ex: +244 para Angola, +351 para Portugal, +55 para Brasil).';
    case 'auth/missing-phone-number':
      return 'Por favor, insira o número de telefone com código de país.';
    case 'auth/quota-exceeded':
      return 'Limite de SMS atingido para este número. Aguarde alguns minutos antes de solicitar novo código.';
    case 'auth/invalid-verification-code':
      return 'Código de verificação SMS incorreto. Verifique o SMS recebido no celular.';
    case 'auth/code-expired':
      return 'O código SMS expirou. Clique em reenviar código para receber um novo.';
    case 'auth/captcha-check-failed':
      return 'Falha na verificação de segurança reCAPTCHA. Tente novamente.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas consecutivas. Por segurança, tente novamente em alguns instantes.';
    case 'auth/internal-error':
      return 'Ocorreu um erro interno nos servidores do Firebase Auth. Tente novamente.';
    default:
      if (message.includes('popup')) {
        return 'Janela de autenticação fechada ou bloqueada. Tente novamente.';
      }
      return message || 'Ocorreu um erro ao processar o login. Tente novamente.';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Monitor Firebase Authentication state automatically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (authErr) => {
        console.error('[Firebase Auth State Error]:', authErr);
        setError(getFriendlyAuthErrorMessage(authErr));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);
  const openAuthModal = () => {
    setError(null);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => {
    setError(null);
    setIsAuthModalOpen(false);
  };

  /**
   * Sign In with Email and Password
   */
  const signInWithEmail = async (email: string, pass: string): Promise<User | null> => {
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setUser(userCredential.user);
      setIsAuthModalOpen(false);
      return userCredential.user;
    } catch (err: any) {
      console.error('[Email Sign In Error]:', err);
      const friendlyMsg = getFriendlyAuthErrorMessage(err);
      setError(friendlyMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign Up (Register) with Email, Password and Display Name
   */
  const signUpWithEmail = async (email: string, pass: string, name?: string): Promise<User | null> => {
    setError(null);
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name && name.trim()) {
        try {
          await updateProfile(userCredential.user, { displayName: name.trim() });
        } catch (profileErr) {
          console.warn('[Profile update warning]:', profileErr);
        }
      }
      setUser(userCredential.user);
      setIsAuthModalOpen(false);
      return userCredential.user;
    } catch (err: any) {
      console.error('[Email Sign Up Error]:', err);
      const friendlyMsg = getFriendlyAuthErrorMessage(err);
      setError(friendlyMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password via email
   */
  const resetPassword = async (email: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (err: any) {
      console.error('[Reset Password Error]:', err);
      const friendlyMsg = getFriendlyAuthErrorMessage(err);
      setError(friendlyMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send SMS Verification OTP via Phone Number
   */
  const sendPhoneOtp = async (phoneNumber: string, containerElementId: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      // Clear previous verifier if exists
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (e) {
          // ignore
        }
      }

      const verifier = new RecaptchaVerifier(auth, containerElementId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setError('A verificação de segurança reCAPTCHA expirou. Tente novamente.');
        }
      });

      setRecaptchaVerifier(verifier);

      const confirmation = await signInWithPhoneNumber(auth, phoneNumber.trim(), verifier);
      setConfirmationResult(confirmation);
      return true;
    } catch (err: any) {
      console.error('[Phone SMS OTP Error]:', err);
      const friendlyMsg = getFriendlyAuthErrorMessage(err);
      setError(friendlyMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Confirm Phone SMS Verification Code
   */
  const verifyPhoneOtp = async (code: string): Promise<User | null> => {
    if (!confirmationResult) {
      setError('Sessão de SMS expirada. Solicite um novo código.');
      return null;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(code.trim());
      setUser(result.user);
      setIsAuthModalOpen(false);
      setConfirmationResult(null);
      return result.user;
    } catch (err: any) {
      console.error('[Verify Phone OTP Error]:', err);
      const friendlyMsg = getFriendlyAuthErrorMessage(err);
      setError(friendlyMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign In with Google Provider via Firebase SDK
   */
  const signInWithGoogle = async (): Promise<User | null> => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setIsAuthModalOpen(false);
      return result.user;
    } catch (err: any) {
      console.error('[Google Sign In Error]:', err);
      const friendlyMsg = getFriendlyAuthErrorMessage(err);
      setError(friendlyMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign In with GitHub Provider via Firebase SDK
   */
  const signInWithGithub = async (): Promise<User | null> => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      setUser(result.user);
      setIsAuthModalOpen(false);
      return result.user;
    } catch (err: any) {
      console.error('[GitHub Sign In Error]:', err);
      const friendlyMsg = getFriendlyAuthErrorMessage(err);
      setError(friendlyMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign Out via Firebase SDK
   */
  const logout = async (): Promise<void> => {
    setError(null);
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      console.error('[Firebase Sign Out Error]:', err);
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        signInWithGithub,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        sendPhoneOtp,
        verifyPhoneOtp,
        logout,
        clearError,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um <AuthProvider>');
  }
  return context;
};
