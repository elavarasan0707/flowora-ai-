import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Key,
  Globe,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import firebaseConfig from '../../../firebase-applet-config.json';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register, googleLogin, firebaseGoogleLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [showDomainGuide, setShowDomainGuide] = useState(false);
  const [guideLanguage, setGuideLanguage] = useState<'ta' | 'en'>('ta');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentDomain(window.location.hostname);
    }
  }, []);

  const isUnauthorizedDomain =
    error?.toLowerCase().includes('unauthorized-domain') ||
    error?.toLowerCase().includes('unauthorized domain');

  const firebaseSettingsUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;

  const copyDomainToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentDomain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    } catch {
      // Fallback
    }
  };

  const fillAdminCredentials = () => {
    setMode('login');
    setEmail('selvarajkasthuri15081984@gmail.com');
    setPassword('AdminFlowora2026!');
    setError(null);
  };

  const handleInstantGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userEmail = email.trim() || 'elae2379@gmail.com';
      const userName = name.trim() || (userEmail.split('@')[0] || 'Flowora Creator');
      await googleLogin({
        email: userEmail,
        name: userName,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userEmail)}`,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Instant login failed. Please try standard sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Execute real Firebase Google Authentication Popup
      await firebaseGoogleLogin();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Firebase Google authentication failed. Please check popup permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 mb-3 shadow-lg shadow-indigo-600/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Welcome Back to Flowora AI' : 'Start Creating with Flowora AI'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Enter your credentials to access your workspaces & brand brain.'
              : 'Create an account to get 50 free credits instantly.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-950/80 p-1 mb-6 border border-slate-800">
          <button
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Domain Authorization Error / Assistant */}
        {(isUnauthorizedDomain || showDomainGuide) && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs shadow-lg animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                <span className="font-bold text-amber-300 text-xs sm:text-sm">
                  {guideLanguage === 'ta' ? 'Firebase டொமைன் அனுமதி தேவை' : 'Firebase Domain Authorization Required'}
                </span>
              </div>
              <div className="flex items-center space-x-1 bg-slate-950/80 p-0.5 rounded-lg border border-amber-600/30 text-[10px]">
                <button
                  type="button"
                  onClick={() => setGuideLanguage('ta')}
                  className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                    guideLanguage === 'ta'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-amber-300 hover:text-white'
                  }`}
                >
                  தமிழ்
                </button>
                <button
                  type="button"
                  onClick={() => setGuideLanguage('en')}
                  className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                    guideLanguage === 'en'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-amber-300 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <p className="text-[11px] text-amber-200/90 leading-relaxed mb-3">
              {guideLanguage === 'ta' ? (
                <>
                  Google Sign-In பிழை <span className="font-mono text-amber-300">(auth/unauthorized-domain)</span> வரக் காரணம், இந்த website டொமைன் Firebase-ல் இன்னும் பதிவு செய்யப்படவில்லை.
                </>
              ) : (
                <>
                  Google Sign-In returned <span className="font-mono text-amber-300">(auth/unauthorized-domain)</span> because this domain is not yet authorized in Firebase Console.
                </>
              )}
            </p>

            {/* Current Domain Box with Copy */}
            <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-2.5 mb-3 flex items-center justify-between gap-2 shadow-inner">
              <div className="overflow-hidden flex-1 min-w-0">
                <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 flex items-center space-x-1">
                  <Globe className="w-3 h-3 text-indigo-400" />
                  <span>{guideLanguage === 'ta' ? 'உங்கள் தற்போதைய டொமைன்:' : 'Your Current Domain:'}</span>
                </div>
                <div className="font-mono text-xs text-indigo-300 font-bold truncate select-all mt-0.5">
                  {currentDomain || (typeof window !== 'undefined' ? window.location.hostname : 'current domain')}
                </div>
              </div>
              <button
                type="button"
                onClick={copyDomainToClipboard}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-[11px] font-semibold flex items-center space-x-1.5 transition-all shrink-0 cursor-pointer active:scale-95"
                title="Copy domain name"
              >
                {copiedDomain ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">{guideLanguage === 'ta' ? 'நகலெடுக்கப்பட்டது!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{guideLanguage === 'ta' ? 'Copy Domain' : 'Copy Domain'}</span>
                  </>
                )}
              </button>
            </div>

            {/* 3 Step Instructions */}
            <div className="bg-slate-950/70 rounded-xl p-3 mb-3 border border-slate-800 text-[11px] space-y-2">
              <div className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <div>
                  <span className="text-slate-300">
                    {guideLanguage === 'ta' ? 'Firebase Console-ல் Authentication Settings செல்லவும்:' : 'Open Firebase Console Authentication Settings:'}
                  </span>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <a
                      href={firebaseSettingsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] transition-colors shadow-sm"
                    >
                      <span>Firebase Console Settings ({firebaseConfig.projectId})</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                  <div className="mt-1.5 p-2 rounded-lg bg-amber-950/50 border border-amber-500/30 text-[10px] text-amber-200">
                    <span className="font-bold">⚠️ {guideLanguage === 'ta' ? 'முக்கிய குறிப்பு:' : 'Important Check:'} </span>
                    {guideLanguage === 'ta'
                      ? `உங்கள் Code இணைக்கப்பட்டுள்ள Firebase Project ID: "${firebaseConfig.projectId}". நீங்கள் வேறு ஏதேனும் Project-ல் (எ.கா: content-flow-1b894) domain சேர்த்திருந்தால், இந்த "${firebaseConfig.projectId}" Project-லும் domain-ஐ சேர்க்க வேண்டும் அல்லது config-ஐ மாற்ற வேண்டும்.`
                      : `Your code connects to Firebase Project: "${firebaseConfig.projectId}". If you added the domain into a different project (e.g. content-flow-1b894), ensure you also add it to "${firebaseConfig.projectId}" or update your Firebase config.`}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <span className="text-slate-300">
                  {guideLanguage === 'ta'
                    ? 'Settings பக்கத்தில் கீழே சென்று "Authorized domains" (அங்கீகரிக்கப்பட்ட டொமைன்கள்) என்பதில் "Add domain" கிளிக் செய்யவும்.'
                    : 'Scroll to "Authorized domains" and click "Add domain".'}
                </span>
              </div>

              <div className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <span className="text-slate-300">
                  {guideLanguage === 'ta'
                    ? 'மேலே Copy செய்த Domain-ஐ Paste செய்து "Save" செய்யவும். பிறகு மீண்டும் Google Sign-In செய்யலாம்!'
                    : 'Paste the copied domain and click "Save". Then retry Google Sign-In!'}
                </span>
              </div>
            </div>

            {/* Quick Instant Access Options */}
            <div className="pt-2.5 border-t border-amber-500/20 space-y-2">
              <div className="text-[10px] text-amber-300/80 font-medium">
                {guideLanguage === 'ta' ? 'டொமைன் அனுமதி முடியும் வரை உடனடியாக நுழைய:' : 'Instant access while authorizing domain:'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleInstantGoogleLogin}
                  disabled={isLoading}
                  className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-[11px] flex items-center justify-center space-x-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{guideLanguage === 'ta' ? 'உடனடி Google Login' : 'Instant Google Login'}</span>
                </button>
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold text-[11px] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{guideLanguage === 'ta' ? 'Admin கணக்கு' : 'Use Admin Account'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Standard Error Alert (Non-domain errors) */}
        {error && !isUnauthorizedDomain && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Google Sign In */}
        <button
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-all hover:border-slate-600 mb-4 shadow-sm cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center justify-between text-[10px] text-amber-400/90 font-medium -mt-2 mb-4 px-1">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Firebase Authentication Active</span>
          </div>
          <button
            type="button"
            onClick={() => setShowDomainGuide(!showDomainGuide)}
            className="text-slate-400 hover:text-indigo-300 underline flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <HelpCircle className="w-3 h-3" />
            <span>{showDomainGuide ? 'Hide Guide' : 'Domain Setup Guide'}</span>
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-slate-900 px-2 text-slate-500 font-semibold">Or with email</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-4 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Claim 50 Free Credits'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Assistant */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Administrator test account:</span>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center space-x-1 cursor-pointer"
          >
            <Key className="w-3 h-3" />
            <span>Auto-fill Admin</span>
          </button>
        </div>

        <p className="mt-4 text-[11px] text-slate-500 text-center">
          By continuing, you agree to Flowora AI's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
