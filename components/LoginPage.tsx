import React, { useState } from 'react';
import { Lock, User as UserIcon, ArrowRight, Loader2, Eye, EyeOff, Sun, Moon, ArrowLeft } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

interface LoginPageProps {
  onBack: () => void;
  theme?: 'light' | 'dark';
  setTheme?: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack, theme: propTheme, setTheme: propSetTheme }) => {
  const { data, setCurrentUser } = useCMS();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | boolean>(false);
  const [loading, setLoading] = useState(false);

  // OTP state additions
  const [requireOtpField, setRequireOtpField] = useState(false);
  const [tempUserToken, setTempUserToken] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [emailMask, setEmailMask] = useState('');

  // Password Recovery State
  const [mode, setMode] = useState<'login' | 'recover'>('login');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState<string | boolean>(false);

  // Theme support local fallback if not passed as prop
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('kh_dream_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const currentTheme = propTheme || localTheme;

  const toggleTheme = () => {
    if (propSetTheme) {
      propSetTheme(prev => {
        const next = prev === 'dark' ? 'light' : 'dark';
        localStorage.setItem('kh_dream_theme', next);
        return next;
        });
    } else {
      const next = currentTheme === 'dark' ? 'light' : 'dark';
      setLocalTheme(next);
      localStorage.setItem('kh_dream_theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.requireOTP) {
          setRequireOtpField(true);
          setTempUserToken(result.tempUserToken);
          setEmailMask(result.emailMask || '');
          setLoading(false);
        } else {
          setCurrentUser(result.user);
          localStorage.setItem('kh_admin_token', result.token);
          setLoading(false);
        }
      } else {
        const resData = await response.json().catch(() => ({}));
        setError(resData.error || "Invalid username or password. Access denied.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to server. Please try again.");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const response = await fetch('/api/verify-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempUserToken, otpCode })
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentUser(result.user);
        localStorage.setItem('kh_admin_token', result.token);
        setLoading(false);
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.error || "Incorrect verification code. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("OTP Verification dropped:", err);
      setError("Verification failed. Please check internet connection.");
      setLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setRecoverySuccess(false);

    try {
      const response = await fetch('/api/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail })
      });

      if (response.ok) {
        setRecoverySuccess("A recovery link has been sent to your registered email.");
        setRecoveryEmail('');
        setTimeout(() => {
          setMode('login');
          setRecoverySuccess(false);
        }, 3000);
      } else {
        const result = await response.json().catch(() => ({}));
        setError(result.error || "Email not found inside the system registration registers.");
      }
    } catch (err) {
      console.error("Email recovery error:", err);
      setError("Unable to send recovery email. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300 relative">
      {/* Top Floating Controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 shadow-sm transition-all"
          title={currentTheme === 'dark' ? "Switch to Light Mode" : "Dark Mode"}
        >
          {currentTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 shadow-sm transition-all"
        >
          <ArrowLeft size={14} />
          <span>Exit</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-8 md:p-10 space-y-6 transition-all duration-300">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-3">
          {data?.general?.logoUrl ? (
            <img 
              src={data.general.logoUrl} 
              alt="KH Dream Logo" 
              className="h-12 mx-auto object-contain dark:brightness-110" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto text-lg font-black tracking-widest uppercase">
              KH
            </div>
          )}
          
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-tight">
              {requireOtpField ? "Verification Required" : mode === 'recover' ? "Recovery Portal" : "Admin Dashboard Sign In"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {requireOtpField 
                ? "Enter your multi-factor verification token" 
                : mode === 'recover' 
                  ? "Restore access to your administrator account" 
                  : "Please provide system details to continue"}
            </p>
          </div>
        </div>

        {requireOtpField ? (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 text-center space-y-1">
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider">
                A verification code was sent to:
              </p>
              <p className="text-xs font-black text-primary uppercase tracking-widest">
                {emailMask || "your mail account"}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                6-Digit Verification PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  autoFocus
                  type="text" 
                  maxLength={6}
                  pattern="\d{6}"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-center text-lg font-black tracking-[0.3em] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-rose-500 text-center">
                {typeof error === 'string' ? error : "Verification Failure"}
              </p>
            )}

            <div className="space-y-3 pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-gradient-themed hover:brightness-110 text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-50 shadow-md shadow-primary/25"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <span>Verify OTP Code</span>}
              </button>

              <button 
                type="button"
                onClick={() => {
                  setRequireOtpField(false);
                  setError(false);
                  setOtpCode('');
                }}
                className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 uppercase tracking-widest transition-colors py-1 block"
              >
                ← Back to standard login
              </button>
            </div>
          </form>
        ) : mode === 'recover' ? (
          <form onSubmit={handleRecovery} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                Registered Email Address
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  autoFocus
                  type="email" 
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="name@khdream.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-rose-500 text-center">
                {typeof error === 'string' ? error : "Recovery Failure"}
              </p>
            )}

            {recoverySuccess && (
              <p className="text-xs font-semibold text-emerald-500 text-center">
                {recoverySuccess}
              </p>
            )}

            <div className="space-y-3 pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-gradient-themed hover:brightness-110 text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <span>Send Recovery Email</span>}
              </button>

              <button 
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(false);
                }}
                className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 uppercase tracking-widest transition-colors py-1 block"
              >
                ← Back to login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                Username / Identity Key
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  autoFocus
                  type="text" 
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                  Password
                </label>
                <button 
                  type="button"
                  onClick={() => {
                    setMode('recover');
                    setError(false);
                  }}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border ${error ? 'border-rose-500' : 'border-slate-200 dark:border-zinc-700'} text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-rose-500 text-center">
                {typeof error === 'string' ? error : "Invalid credentials"}
              </p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-gradient-themed hover:brightness-110 text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.99] shadow-md shadow-primary/25 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <span>Sign In to Admin</span>}
            </button>
          </form>
        )}
      </div>

      <div className="text-center text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
        KH Dream Services Limited &copy; {new Date().getFullYear()} • Secure Administrator Hub
      </div>
    </div>
  );
};

export default LoginPage;
