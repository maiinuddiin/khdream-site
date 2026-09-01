import React, { useState } from 'react';
import { X, Lock, User as UserIcon, Loader2, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  initialResetToken?: string | null;
  theme?: 'light' | 'dark';
  setTheme?: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
}

const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  initialResetToken,
  theme: propTheme,
  setTheme: propSetTheme
}) => {
  const { data, setCurrentUser } = useCMS();
  const [mode, setMode] = useState<'login' | 'recover' | 'reset'>(initialResetToken ? 'reset' : 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | boolean>(false);
  const [success, setSuccess] = useState<string | boolean>(false);
  const [loading, setLoading] = useState(false);

  // OTP State additions
  const [requireOtpField, setRequireOtpField] = useState(false);
  const [tempUserToken, setTempUserToken] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [emailMask, setEmailMask] = useState('');

  // Fallback theme hook
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('kh_dream_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const currentTheme = propTheme || localTheme;

  if (!isOpen) return null;

  const toggleTheme = () => {
    if (propSetTheme) {
      // If parent handler exists, call it or let parent manage
      const next = currentTheme === 'dark' ? 'light' : 'dark';
      // Wait, let's check what propSetTheme actually is. It might be a React.Dispatch state updater
      if (typeof propSetTheme === 'function') {
        (propSetTheme as Function)(next);
      }
      localStorage.setItem('kh_dream_theme', next);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setSuccess(false);

    if (requireOtpField) {
      const performOtpVerification = async () => {
        try {
          const response = await fetch('/api/verify-login-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tempUserToken, otpCode }),
          });

          if (response.ok) {
            const result = await response.json();
            setCurrentUser(result.user);
            localStorage.setItem('kh_admin_token', result.token);
            setLoading(false);
            onLoginSuccess();
            onClose();
          } else {
            const errResult = await response.json().catch(() => ({}));
            setError(errResult.error || "Incorrect verification PIN. Please try again.");
            setLoading(false);
          }
        } catch (err) {
          console.error("OTP check failure:", err);
          setError("Verification failed. Please check internet connection.");
          setLoading(false);
        }
      };
      performOtpVerification();
      return;
    }

    if (mode === 'login') {
      const performLogin = async () => {
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
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
              onLoginSuccess();
              onClose();
            }
          } else {
            const resData = await response.json().catch(() => ({}));
            setError(resData.error || "Invalid username or password.");
            setLoading(false);
          }
        } catch (err) {
          console.error("Login error:", err);
          setError("Server connection dropped. Please retry.");
          setLoading(false);
        }
      };
      performLogin();
    } else if (mode === 'recover') {
      const performRecovery = async () => {
        try {
          const response = await fetch('/api/recover-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: recoveryEmail })
          });

          if (response.ok) {
            setSuccess("Recovery Email Sent: Please check your inbox");
            setLoading(false);
            setTimeout(() => {
              setMode('login');
              setSuccess(false);
            }, 3000);
          } else {
            const result = await response.json().catch(() => ({}));
            setError(result.error || "Recovery failed. Registered Email not found");
            setLoading(false);
          }
        } catch (err) {
          console.error("Recovery error:", err);
          setError("Server error. Please try again.");
          setLoading(false);
        }
      };
      performRecovery();
    } else if (mode === 'reset') {
      const performReset = async () => {
        try {
          const response = await fetch('/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: initialResetToken, newPassword })
          });

          if (response.ok) {
            setSuccess("Password Reset Successful: You can now login");
            setLoading(false);
            setTimeout(() => {
              setMode('login');
              setSuccess(false);
            }, 3000);
          } else {
            const result = await response.json().catch(() => ({}));
            setError(result.error || "Reset failed. Invalid or expired token");
            setLoading(false);
          }
        } catch (err) {
          console.error("Reset error:", err);
          setError("Server error response failed.");
          setLoading(false);
        }
      };
      performReset();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 p-8 space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Header toolbar */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Toggle theme"
          >
            {currentTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="text-center space-y-2 mt-2">
          {data?.general?.logoUrl ? (
            <img src={data.general.logoUrl} alt="KH Dream" className="h-10 mx-auto object-contain" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto text-base font-black uppercase">KH</div>
          )}

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-tight">
              {requireOtpField ? 'MFA Verification' : mode === 'login' ? 'Site Sign In' : mode === 'recover' ? 'Password Recovery' : 'Reset Password'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {requireOtpField ? 'Provide 6-digit confirmation code' : mode === 'login' ? 'Enter credentials to authorize' : mode === 'recover' ? 'Enter registered system email' : 'Set a new access key'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {requireOtpField ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-xl text-center space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400 tracking-wider">A code has been sent to:</p>
                <p className="text-xs font-black text-primary tracking-wider">{emailMask || "your mail account"}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest pl-0.5">Verification Code</label>
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
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-center text-lg font-black tracking-[0.3em] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                  />
                </div>
              </div>

              <button 
                type="button"
                onClick={() => {
                  setRequireOtpField(false);
                  setError(false);
                  setOtpCode('');
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 block pl-0.5"
              >
                ← Back to standard login
              </button>
            </div>
          ) : mode === 'login' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest pl-0.5">Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    autoFocus
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest pl-0.5">Password</label>
                  <button 
                    type="button"
                    onClick={() => { setMode('recover'); setError(false); setSuccess(false); }}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
            </div>
          ) : mode === 'recover' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest pl-0.5">Registered Email</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    autoFocus
                    type="email" 
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setMode('login'); setError(false); setSuccess(false); }}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 block pl-0.5"
              >
                ← Back to Login
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest pl-0.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    autoFocus
                    type={showPassword ? "text" : "password"} 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
              <button 
                type="button"
                onClick={() => { setMode('login'); setError(false); setSuccess(false); }}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 block pl-0.5"
              >
                Cancel Reset
              </button>
            </div>
          )}

          {error && (
            <p className="text-xs font-semibold text-rose-500 text-center">
              {error}
            </p>
          )}

          {success && (
            <p className="text-xs font-semibold text-emerald-500 text-center">
              {success}
            </p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-gradient-themed hover:brightness-110 text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <span>
                {requireOtpField ? 'Confirm Code' : mode === 'login' ? 'Sign In' : mode === 'recover' ? 'Send Recovery Link' : 'Confirm New Password'}
              </span>
            )}
          </button>
        </form>

        <button 
          onClick={onClose} 
          className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 uppercase tracking-widest transition-colors py-1 block"
        >
          Cancel access
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
