import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Mail, Check, Copy, Sparkles, Percent, Calendar } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

export const VisitorCouponPopup: React.FC = () => {
  const { data } = useCMS();
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponResult, setCouponResult] = useState<{
    code: string;
    discount: string;
    type: string;
    expiryDays: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Check if coupon system is active
  const couponSettings = data?.couponSettings || {
    active: true,
    code: 'DREAMTOUR10',
    amount: '100',
    type: 'fixed',
    minimumSpend: '500',
    expiryDays: 30
  };

  useEffect(() => {
    if (!couponSettings.active) return;

    // Check if user already claimed a coupon in this session to avoid spamming
    const claimCached = sessionStorage.getItem('dream_coupon_claimed');
    if (claimCached) {
      // Still allow them to see the button if they want to view their code again,
      // but let's load it with smaller delay
      const parsed = JSON.parse(claimCached);
      setCouponResult(parsed);
    }

    // Interactive appearance helper with randomized delay between 2 to 6 seconds
    const randomDelay = Math.floor(Math.random() * 4000) + 2000;
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, randomDelay);

    return () => clearTimeout(timer);
  }, [couponSettings.active]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/claim-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to claim coupon.');
      }

      const result = {
        code: json.code || 'DREAMTOUR10',
        discount: json.discount || '100',
        type: json.type || 'fixed',
        expiryDays: json.expiryDays || 30
      };

      setCouponResult(result);
      sessionStorage.setItem('dream_coupon_claimed', JSON.stringify(result));
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!couponResult) return;
    navigator.clipboard.writeText(couponResult.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!couponSettings.active || !isVisible) return null;

  return (
    <>
      {/* FLOATING ACTION TRIGGER */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              transition: { type: 'spring', stiffness: 260, damping: 20 }
            }}
            exit={{ scale: 0, opacity: 0, y: 50 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            id="floating-coupon-trigger"
            className="fixed bottom-40 right-4 md:bottom-48 md:right-6 z-[1201] p-4 bg-gradient-themed text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer overflow-hidden border border-white/20 group"
          >
            {/* Ambient Pulse overlay ring */}
            <span className="absolute inset-0 bg-white/10 rounded-full scale-100 group-hover:scale-150 transition-all duration-700 animate-ping" />
            <Gift className="w-6 h-6 animate-bounce" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out text-[9px] font-black uppercase tracking-widest pl-0 group-hover:pl-2 whitespace-nowrap">
              Claim SAR {couponSettings.amount} Off
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* POPUP MODAL SUBSCRIPTION SCREEN */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Blur Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Main Modal Box card layout */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-2xl p-8 text-center"
            >
              {/* Confetti element decorations when coupon is claimed successfully */}
              {couponResult && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                  <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-primary animate-ping" />
                  <div className="absolute top-1/2 right-8 w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="absolute bottom-10 left-1/3 w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                </div>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-805 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {!couponResult ? (
                /* STEP 1: SUBSCRIPTION PROMPT FORM */
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Icon illustration */}
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary relative">
                    <span className="absolute inset-0 bg-primary/5 rounded-full scale-125 animate-pulse" />
                    <Gift className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black tracking-widest uppercase rounded-full">
                      🔥 Special Limited Offer
                    </span>
                    <h3 className="text-xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white leading-tight">
                      Subscribe & Unlock<br />Exclusive Savings!
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
                      Join our elite travel newsletter today and receive a voucher worth <span className="text-primary font-black">SAR {couponSettings.amount}</span> instantly to use on your next luxury tour.
                    </p>
                  </div>

                  {/* Pricing / Discount visualization banner */}
                  <div className="bg-slate-50 dark:bg-zinc-850/50 rounded-2xl py-3 px-4 flex items-center justify-between border border-slate-100 dark:border-zinc-800 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <Percent className="w-5 h-5 font-black" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-none">Instant Discount</p>
                        <p className="text-xs font-black uppercase text-slate-800 dark:text-white mt-1">SAR {couponSettings.amount} Off Total</p>
                      </div>
                    </div>
                    {couponSettings.minimumSpend && (
                      <div className="text-right">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 leading-none">Min. Purchase</p>
                        <p className="text-[10px] font-black text-rose-500 uppercase mt-1">SAR {couponSettings.minimumSpend}</p>
                      </div>
                    )}
                  </div>

                  {/* Input form */}
                  <div className="space-y-3 text-left">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. wanderer@khdream.com"
                        className="w-full bg-slate-50 dark:bg-zinc-950 px-11 py-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-850 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider text-left bg-rose-50 dark:bg-rose-950/25 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                      ⚠️ {error}
                    </p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-gradient-themed text-white text-[10px] uppercase font-black tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Generating Coupon...' : 'Get My Coupon Code'}
                  </button>

                  <p className="text-[8px] text-slate-400 uppercase tracking-wider leading-relaxed">
                    * No spam guaranteed. You can unsubscribe anytime at your convenience.
                  </p>
                </form>
              ) : (
                /* STEP 2: CONVERSION SCREEN (CODE SHOWN PRECISELY WITH COPY ACTIONS) */
                <div className="space-y-6">
                  {/* Milestone achieved animation */}
                  <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 relative">
                    <span className="absolute inset-0 bg-emerald-500/20 rounded-full scale-125 animate-ping" />
                    <Check className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-center items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[9px] font-black tracking-widest uppercase">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Congratulations! Code Activated</span>
                    </div>
                    <h3 className="text-xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white leading-tight">
                      Your Coupon code Is Ready!
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Use the promo code below in your booking request or quote submission to receive <span className="font-extrabold text-slate-800 dark:text-white">SAR {couponResult.discount} off</span>.
                    </p>
                  </div>

                  {/* Coupon Promo Board */}
                  <div className="relative border-2 border-dashed border-primary/40 bg-primary/5 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-3 py-0.5 text-[7.5px] font-black uppercase tracking-widest text-primary shadow-sm">
                      Offer Code
                    </div>

                    <p className="text-2xl font-black uppercase tracking-widest text-primary font-mono select-all">
                      {couponResult.code}
                    </p>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-5 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-750 transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expiry / Guidelines card */}
                  <div className="bg-slate-50 dark:bg-zinc-850/50 p-4 rounded-xl flex items-center justify-between text-left text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Valid For: {couponResult.expiryDays} Days</span>
                    </div>
                    <span className="text-emerald-500 font-extrabold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping" />
                      Avail Now
                    </span>
                  </div>

                  {/* Done / Continue CTA */}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 dark:bg-white dark:text-black dark:border-white text-white text-[10px] uppercase font-black tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Alright! Start Planning
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
