import React, { memo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCMS } from '../context/CMSContext';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { X, ExternalLink, Info } from 'lucide-react';
import { Magnetic } from './InteractiveAnimations';
import AbstractBackground from './AbstractBackground';

const PromoSlider: React.FC = () => {
  const { data } = useCMS();
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  const PROMOS = data.promoSlider || [];
  const durationMultiplier = data.general?.promoSliderDuration || 60;

  const toTitleCase = (str: string) => {
    if (!str) return '';
    if (str === str.toUpperCase() && str !== str.toLowerCase()) {
      return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return str;
  };

  if (PROMOS.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-2 md:py-3 bg-transparent select-none font-montserrat antialiased">
      <div 
        className="flex gap-2 md:gap-3 w-max relative z-10 animate-marquee will-change-transform transform-gpu hover:[animation-play-state:paused]"
        style={{ 
          ['--marquee-duration' as any]: `${durationMultiplier}s`,
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden'
        }}
      >
        {[...PROMOS, ...PROMOS, ...PROMOS, ...PROMOS].map((promo, idx) => (
          <div 
            key={idx}
            className={`w-[295px] md:w-[320px] lg:w-[420px] shrink-0 ${promo.showPopup !== false ? 'cursor-pointer' : 'cursor-default'} font-montserrat will-change-transform translate-z-0`}
            onClick={() => {
              if (promo.showPopup !== false) {
                setSelectedPromo(promo);
              }
            }}
          >
            <div className="group relative aspect-[16/4] overflow-hidden rounded-md md:rounded-xl border border-black/5 dark:border-white/10 shadow-lg transform-gpu bg-white/5 mx-1 md:mx-0">
              <img 
                src={promo.img || null} 
                alt={promo.title} 
                referrerPolicy="no-referrer"
                loading="eager"
                className="absolute inset-0 w-full h-full object-cover translate-z-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-z-0" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Soft Fade Edges - Hidden on mobile as requested */}
      <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-black via-black/60 to-transparent z-20 pointer-events-none hidden md:block" />
      <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-black via-black/60 to-transparent z-20 pointer-events-none hidden md:block" />

      {/* Details Popup - Rendered via Portal for Full Visibility */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedPromo && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-xl overflow-y-auto">
              <motion.div
                initial={false}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-black/10 dark:border-white/10 my-auto"
              >
                <AbstractBackground variant="noise" opacity={0.05} />
                <AbstractBackground variant="topo" opacity={0.03} position="top-right" />
                
                <button 
                  onClick={() => setSelectedPromo(null)}
                  className="relative z-30 top-6 right-6 p-3 bg-white/90 dark:bg-zinc-800/90 hover:bg-primary hover:text-white text-zinc-900 dark:text-white rounded-full shadow-xl transition-all hover:scale-110 active:scale-95"
                >
                  <X size={20} />
                </button>

                <div className="aspect-video w-full relative z-10">
                  <img 
                    src={selectedPromo.popupImg || selectedPromo.img || null} 
                    alt={selectedPromo.popupTitle || selectedPromo.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight normal-case font-montserrat" dangerouslySetInnerHTML={{ __html: toTitleCase(selectedPromo.popupTitle || selectedPromo.title) }} />
                    <p className="text-xs font-bold text-white/80 normal-case tracking-[0.2em] font-montserrat" dangerouslySetInnerHTML={{ __html: toTitleCase(selectedPromo.popupSubtitle || selectedPromo.subtitle) }} />
                  </div>
                </div>

                <div className="p-8 space-y-6 bg-gradient-to-br from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-950">
                  <div className="space-y-4">
                    {selectedPromo.popupDescription ? (
                      <div 
                        className="text-sm text-slate-600 dark:text-zinc-400 font-medium leading-relaxed rich-text-content prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-li:my-1"
                        dangerouslySetInnerHTML={{ __html: selectedPromo.popupDescription }}
                      />
                    ) : (
                      <p className="text-sm text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
                        Experience the best of {selectedPromo.title}. This exclusive offer is designed to provide you with an unforgettable journey and premium services.
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {['Premium Service', '24/7 Support', 'Expert Guidance'].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black normal-case tracking-widest rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <a 
                      href={`https://wa.me/${selectedPromo?.whatsappNumber || data?.general?.whatsapp || '966537681618'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-grow bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-black normal-case tracking-widest py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20"
                    >
                      <span>WhatsApp: {selectedPromo?.whatsappNumber || data?.general?.whatsapp || '966537681618'}</span>
                      <ExternalLink size={14} />
                    </a>
                    <button 
                      onClick={() => setSelectedPromo(null)}
                      className="px-6 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs font-black normal-case tracking-widest rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default memo(PromoSlider);
