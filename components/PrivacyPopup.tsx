import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

const PrivacyPopup: React.FC<{ t: (path: string) => string }> = ({ t }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('ksa_privacy_accepted');
    if (!accepted) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ksa_privacy_accepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-8 right-8 md:right-auto md:left-8 md:w-[450px] z-[1001] animate-in slide-in-from-bottom-10 duration-700">
      <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-3xl shadow-2xl shadow-black/20 flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} className="text-red-600" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Privacy & PDPL Compliance</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-bold">
              In alignment with the Saudi Personal Data Protection Law (PDPL), we process your information to provide luxury concierge services.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleAccept} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 active:scale-95">{t('common.accept')}</button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPopup;
