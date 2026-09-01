import React from 'react';
import * as LucideIcons from 'lucide-react';
import { motion } from 'framer-motion';
import { useCMS } from '../context/CMSContext';
import SwipeHint from './SwipeHint';

const DEFAULT_FEATURE_DATA = {
  sectionTitle: 'Why Choose Us',
  sectionSubtitle: 'We provide specialized solutions for global mobility and business expansion.',
  items: [
    { iconName: 'Smile', title: 'Customer Delight', description: 'We deliver the best service and experience for our customer.' },
    { iconName: 'Mountain', title: 'Authentic Adventure', description: 'We deliver the real adventure experience for our customer.' },
    { iconName: 'Flag', title: 'Expert Guides', description: 'We deliver only expert tour guides for our customer.' },
    { iconName: 'RefreshCcw', title: 'Time Flexibility', description: 'We welcome time flexibility of traveling for our customer.' }
  ]
};

const Features: React.FC = () => {
  const { data } = useCMS();
  const featuresData = data.features || DEFAULT_FEATURE_DATA;
  const items = featuresData.items || [];

  return (
    <section className="py-16 md:py-24 bg-[#fdfdfd] dark:bg-[#08080a] font-montserrat relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col items-center text-center gap-6 mb-16 md:mb-24">
          <div className="flex items-center gap-4">
            <div className="w-8 h-px bg-primary" />
            <span className="text-primary font-black text-[10px] md:text-xs uppercase tracking-[0.4em]">Why KH Dream</span>
            <div className="w-8 h-px bg-primary" />
          </div>
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] max-w-4xl"
          >
            {featuresData.sectionTitle}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm md:text-lg text-slate-500 dark:text-zinc-400 font-medium max-w-2xl opacity-80 leading-relaxed mx-auto"
          >
            {featuresData.sectionSubtitle}
          </motion.p>
        </div>

        <div className="flex overflow-x-auto pb-8 -mx-6 px-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-x-visible md:pb-0 md:mx-0 md:px-0 gap-8 md:gap-12 snap-x snap-mandatory no-scrollbar">
          {items.map((feature, i) => {
            const IconComponent = (LucideIcons as any)[feature.iconName] || LucideIcons.Zap;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: i * 0.1, 
                  duration: 0.8, 
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="min-w-[280px] w-[280px] md:w-full md:min-w-0 snap-center"
              >
                <div className="group relative h-full flex flex-col items-center text-center p-8 rounded-3xl bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-white/5 hover:border-primary/50 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-500 shadow-xl shadow-black/[0.02]">
                  <div className="mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center border border-slate-100 dark:border-white/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <IconComponent className="w-10 h-10 transition-transform duration-500 group-hover:rotate-6" strokeWidth={1} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed font-medium opacity-80 max-w-[240px]">
                      {feature.description}
                    </p>
                  </div>

                  <div className="absolute top-4 right-8 text-4xl font-black text-slate-100 dark:text-white/[0.03] select-none">
                    0{i + 1}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <SwipeHint />
      </div>

      {/* Bottom border gradient */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
    </section>
  );
};

export default Features;
