import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Hourglass, 
  Building2, 
  MapPin, 
  CreditCard, 
  TrendingUp, 
  Flag,
  Navigation,
  Globe,
  Briefcase,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import AbstractBackground from './AbstractBackground';
import ScrollReveal from './ScrollReveal';

import SwipeHint from './SwipeHint';

const ICON_MAP = {
  Hourglass,
  Building2,
  MapPin,
  CreditCard,
  TrendingUp,
  Flag,
  Navigation,
  Globe,
  Briefcase,
  ShieldCheck,
  BarChart3
};

interface WhySaudiArabiaProps {
  data: any;
}

const WhySaudiArabia: React.FC<WhySaudiArabiaProps> = memo(({ data }) => {
  const content = data?.whySaudiArabia;
  if (!content) return null;

  const rawTitle = content.title.replace(/<[^>]*>?/gm, '');

  return (
    <section id="why-saudi-arabia" className="relative py-16 md:py-24 overflow-hidden bg-[#fdfdfd] dark:bg-[#030303]">
      <AbstractBackground variant="refined-grid" opacity={0.02} />
      
      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Visual Side: 3 images composition */}
          <div className="relative order-1 lg:order-1">
            <div className="grid grid-cols-12 grid-rows-12 h-[350px] md:h-[600px] gap-3 md:gap-4">
              {/* Image 1: Main (Big) */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="col-start-1 col-end-9 row-start-1 row-end-11 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative group"
              >
                <img 
                  src={content.mainImageUrl || "https://images.unsplash.com/photo-1551041777-ed07f99b67d8?auto=format&fit=crop&q=80&w=1200"} 
                  alt="Saudi Modern Landmark" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>

              {/* Image 2: Small (Staggered Bottom) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="col-start-7 col-end-12 row-start-6 row-end-12 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl z-20 border-4 md:border-8 border-white dark:border-zinc-950 group"
              >
                <img 
                  src={content.secondaryImageUrl || "https://images.unsplash.com/photo-1586724230411-45b95fdfecf3?auto=format&fit=crop&q=80&w=800"} 
                  alt="Saudi Heritage" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              {/* Image 3: Smallest (Top Right) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="col-start-9 col-end-13 row-start-2 row-end-6 rounded-xl md:rounded-2xl overflow-hidden shadow-xl z-20 group"
              >
                <img 
                  src={content.tertiaryImageUrl || "https://images.unsplash.com/photo-1578330107711-205101f379ae?auto=format&fit=crop&q=80&w=800"} 
                  alt="Saudi Atmosphere" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>

            {/* Decorative Element */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
          </div>

          {/* Content Side */}
          <div className="order-2 lg:order-2 space-y-8">
            <ScrollReveal direction="left">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-[1px] bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                    {content.badge || "Discover The Future"}
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tighter uppercase font-montserrat">
                  {rawTitle.split(' ').map((word, i) => (
                    <span key={i} className={i === 1 ? "text-primary block md:inline" : ""}>{word} </span>
                  ))}
                </h2>
                
                <div className="space-y-6">
                  <p className="text-lg md:text-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed border-l-4 border-primary/20 pl-6">
                    {content.description}
                  </p>
                  
                  <p className="text-sm md:text-base text-slate-500 dark:text-zinc-400 leading-relaxed max-w-lg">
                    {content.extraDescription}
                  </p>
                </div>

                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 gap-4 -mx-6 px-6 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 sm:gap-4">
                  {content.features?.slice(0, 4).map((feature: any) => {
                    const IconComponent = (ICON_MAP as any)[feature.icon] || Globe;
                    return (
                      <div 
                        key={feature.id} 
                        className="flex items-start gap-4 group p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors snap-start shrink-0 w-[240px] sm:w-auto bg-slate-50/50 dark:bg-white/[0.01] sm:bg-transparent border border-slate-100 dark:border-white/5 sm:border-none"
                      >
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                          <IconComponent size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black uppercase tracking-tight text-slate-900 dark:text-white mb-1">{feature.title}</h4>
                          <div className="w-4 h-[2px] bg-primary/20 group-hover:w-8 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
});

export default WhySaudiArabia;
