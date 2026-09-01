import React, { useState } from 'react';
import { MapPin, Phone, ExternalLink, Send, ArrowRight, Mail, MessageCircle, Youtube, Instagram, Facebook, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../context/CMSContext';
import AbstractBackground from './AbstractBackground';

export const Footer: React.FC<{ t: (path: string) => string }> = ({ t }) => {
  const { data } = useCMS();
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activePopup, setActivePopup] = useState<{ title: string; content: string } | null>(null);
  
  const footerData = data.footer || {
    aboutText: t('footer.about'),
    copyright: `© ${new Date().getFullYear()} KH DREAM SERVICES. All rights reserved.`,
    links: [
      { label: "About Us", key: "about" },
      { label: "Services", key: "services" },
      { label: "Contact", key: "contact" },
      { label: "Privacy Policy", key: "privacy" }
    ]
  };

  const handlePopupOpen = (label: string, key: string) => {
    const content = (data.general.footerPopups as any)?.[key] || "Content coming soon...";
    setActivePopup({ title: label, content });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      try {
        const response = await fetch('/api/newsletter-subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() })
        });
        
        if (response.ok) {
          setSubscribeStatus({ type: 'success', message: "Thank you for subscribing!" });
          setEmail('');
          setTimeout(() => setSubscribeStatus(null), 5000);
        } else {
          setSubscribeStatus({ type: 'error', message: "Something went wrong. Please try again." });
        }
      } catch (error) {
        console.error("Subscription error:", error);
        setSubscribeStatus({ type: 'error', message: "Failed to connect to server." });
      }
    }
  };

  return (
    <footer 
      className="relative font-sans overflow-hidden text-white themed-footer"
      style={{ 
        backgroundColor: data.general.footerBgColor || '#030014',
        backgroundImage: data.general.footerBgUrl ? `url(${data.general.footerBgUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{ backgroundColor: data.general.footerOverlayColor || 'rgba(3, 0, 20, 0.9)' }}
      />

      {/* Global Text Shield to prevent inheritance from light mode defaults */}
      <style>{`
        footer.themed-footer p, 
        footer.themed-footer span:not(.text-primary):not(.text-secondary),
        footer.themed-footer a:not(.text-primary):not(.text-secondary) {
          color: rgba(255, 255, 255, 0.7);
        }
        footer.themed-footer h1,
        footer.themed-footer h2,
        footer.themed-footer h3,
        footer.themed-footer h4,
        footer.themed-footer h5 {
          color: white;
        }
      `}</style>

      {/* Popup Modal */}
      <AnimatePresence>
        {activePopup && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-white/5 p-6 sm:p-10 rounded-[2.5rem] max-w-2xl w-full relative shadow-3xl text-slate-800 dark:text-zinc-200"
            >
              <button 
                onClick={() => setActivePopup(null)}
                className="absolute top-5 right-5 p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400 rounded-full transition-all active:scale-90"
                aria-label="Close popup"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
              
              <div className="space-y-4 text-left">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg">
                  Information Gateway
                </span>
                <h3 className="text-3xl font-black tracking-tighter uppercase font-montserrat text-slate-900 dark:text-white pb-4 border-b border-slate-100 dark:border-white/10">
                  {activePopup.title}
                </h3>
              </div>
              
              <div 
                className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm font-bold tracking-tight leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto pr-4 mt-6 text-left scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-800"
                dangerouslySetInnerHTML={{ __html: activePopup.content }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-4 md:py-6">
        {/* Newsletter Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mb-4 pb-4 border-b border-white/10">
          <div className="max-w-xl text-center lg:text-left">
            <h2 className="text-lg md:text-xl font-black tracking-tighter leading-tight text-white mb-0.5">
              Stay in the <span className="text-primary italic">Loop</span>
            </h2>
            <p className="text-zinc-600 text-[8px] md:text-[10px] font-bold uppercase tracking-wider">Subscribe for travel insights</p>
          </div>
          <div className="w-full max-w-sm">
            <form onSubmit={handleSubscribe} className="relative group">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-2 text-[10px] font-bold outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all text-white h-10 md:h-12"
                required
              />
              <button 
                type="submit"
                className="absolute right-1 top-1 bottom-1 bg-gradient-themed text-white px-3 md:px-5 rounded-md text-[9px] font-black tracking-widest hover:brightness-110 transition-all flex items-center gap-2"
              >
                <span>JOIN</span>
                <Send size={10} />
              </button>
            </form>
            {subscribeStatus && (
              <p className={`mt-2 text-center lg:text-left text-[9px] font-bold tracking-widest ${subscribeStatus.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {subscribeStatus.message}
              </p>
            )}
          </div>
        </div>

        {/* Multi-column Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div 
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group cursor-pointer mb-4"
            >
              <div className="flex items-center gap-3 mb-2">
                {data.general.logoUrl && (
                  <img src={data.general.logoUrl || null} alt="Logo" referrerPolicy="no-referrer" className="h-7 w-auto object-contain brightness-0 invert opacity-80" />
                )}
                <h3 className="text-lg font-black tracking-tighter text-white leading-none">
                  KH DREAM
                </h3>
              </div>
              <span className="text-[9px] font-black tracking-[0.2em] text-zinc-700 uppercase">Premier Consultancy</span>
            </div>
            <p className="text-zinc-500 text-[10px] md:text-[11px] font-medium leading-relaxed max-w-xs mb-4" dangerouslySetInnerHTML={{ __html: footerData.aboutText }} />
            <div className="flex items-center gap-5">
              {(() => {
                const getSocialUrl = (platform: string, value: string) => {
                  if (!value) return '#';
                  if (value.startsWith('http://') || value.startsWith('https://')) return value;
                  if (platform === 'facebook') return `https://facebook.com/${value}`;
                  if (platform === 'instagram') return `https://instagram.com/${value}`;
                  if (platform === 'youtube') return `https://youtube.com/${value}`;
                  return value;
                };
                return [
                  { icon: Facebook, url: getSocialUrl('facebook', data.general.facebook) },
                  { icon: Instagram, url: getSocialUrl('instagram', data.general.instagram) },
                  { icon: Youtube, url: getSocialUrl('youtube', data.general.youtube || '') },
                  { icon: MessageCircle, url: data.general.whatsapp ? `https://wa.me/${data.general.whatsapp}` : '#' }
                ].map((social, i) => (
                  <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-white transition-colors">
                    <social.icon size={16} strokeWidth={2} />
                  </a>
                ));
              })()}
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="text-center md:text-left">
            <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-700 mb-4 md:mb-5">Explore</h4>
            <ul className="grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-2">
              {(data.general.footerPopups ? Object.keys(data.general.footerPopups) : ['about', 'services', 'contact', 'privacy']).map((key, i) => (
                <li key={i}>
                  <button 
                    onClick={() => handlePopupOpen(key.charAt(0).toUpperCase() + key.slice(1), key)}
                    className="text-zinc-500 hover:text-white transition-colors text-[10px] md:text-[11px] font-bold uppercase tracking-tight"
                  >
                    {key.replace(/-/g, ' ')}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-700 mb-4 md:mb-5">Connect</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full max-w-sm md:max-w-none md:flex md:flex-col md:space-y-4">
              <div className="flex items-start gap-2 col-span-2 md:col-span-1">
                <MapPin size={12} className="text-primary shrink-0 opacity-40 mt-0.5" />
                <span className="text-[10px] font-medium text-zinc-500 leading-snug text-left">
                  {data.general.address}
                </span>
              </div>
              <div className="flex items-start gap-2 col-span-1">
                <Phone size={12} className="text-primary shrink-0 opacity-40 mt-0.5" />
                <div className="flex flex-col text-[10px] font-bold text-zinc-500 text-left">
                  <a href={`tel:${data.general.phone}`} className="hover:text-white transition-colors">
                    {data.general.phone}
                  </a>
                  <a href={`https://wa.me/${data.general.whatsapp}`} className="hover:text-white transition-colors opacity-40">
                    +{data.general.whatsapp}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2 col-span-1">
                <Mail size={12} className="text-primary shrink-0 opacity-40 mt-0.5" />
                <a href={`mailto:${data.general.email}`} className="text-[10px] font-medium text-zinc-500 hover:text-white transition-colors break-all text-left">
                  {data.general.email}
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Partners */}
          <div className="hidden md:block text-center md:text-left">
            <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-700 mb-4 md:mb-5">
              {(!data.general.footerPartnersTitle || data.general.footerPartnersTitle.toUpperCase() === 'PRNERS' || data.general.footerPartnersTitle.toUpperCase() === 'PARTNERS') 
                ? "Licensed By" 
                : data.general.footerPartnersTitle}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {(data.general.footerPartnerLogos || []).map((item, i) => {
                const logo = typeof item === 'string' ? item : item?.logoUrl;
                const licenseNo = typeof item === 'string' ? '' : item?.licenseNo;
                if (!logo) return null;
                return (
                  <div key={i} className="group flex flex-col items-center justify-center p-2 transition-transform hover:scale-105 duration-300 min-h-[90px]">
                    <div className="h-14 w-full flex items-center justify-center p-0.5">
                      <img 
                        src={logo} 
                        alt="Partner" 
                        className="max-w-full max-h-full object-contain transition-all duration-350 brightness-0 invert opacity-60 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {licenseNo && (
                      <span className="mt-1.5 px-1.5 py-0.5 bg-white/10 text-white border border-white/15 rounded-[4px] font-black text-[7px] uppercase tracking-widest text-center whitespace-nowrap transition-all group-hover:bg-rose-500/20 group-hover:text-rose-500 group-hover:border-rose-500/30">
                        Lic: {licenseNo}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.2em]">
            {footerData.copyright}
          </p>
          
          <div className="flex items-center gap-6 grayscale opacity-10">
             <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" referrerPolicy="no-referrer" className="h-3" alt="Visa" />
             <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" referrerPolicy="no-referrer" className="h-3" alt="Mastercard" />
             <img src="https://cdn-icons-png.flaticon.com/512/196/196565.png" referrerPolicy="no-referrer" className="h-3" alt="PayPal" />
          </div>
        </div>
      </div>
    </footer>
  );
};