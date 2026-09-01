import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Bell, ChevronLeft } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

export const FloatingPromoWidget: React.FC = () => {
  const { data } = useCMS();
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);

  const playInteractionSound = () => {
    if (!data.general?.notificationSoundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.06); // G5
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (err) {
      // Silently fail
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Removed: Auto-play sound on mount (User request: No notification sound)
    }, 5000); 

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (data.floatingCardItems && data.floatingCardItems.length > 0) {
      const activeItems = data.floatingCardItems.filter(item => item.active);
      if (activeItems.length > 0) {
        const randomItem = activeItems[Math.floor(Math.random() * activeItems.length)];
        setCurrentItem(randomItem);
      }
    }
  }, [data.floatingCardItems]);


  if (!currentItem || !isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[1000] flex flex-col items-start pointer-events-none">
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ x: -100, y: 20, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ x: -100, y: 20, opacity: 0 }}
            className="pointer-events-auto bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-lg p-3.5 flex items-center gap-3 max-w-[210px] relative overflow-visible"
          >
            {/* DP / Profile Header Style */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-zinc-900 flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-primary/10 shadow-inner">
                 {currentItem.logoUrl ? (
                   <img 
                     src={currentItem.logoUrl || null} 
                     alt={currentItem.name} 
                     referrerPolicy="no-referrer" 
                     className="w-full h-full object-cover" 
                   />
                 ) : (
                   <Bell size={15} className="text-primary" />
                 )}
              </div>
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-950 bg-emerald-500 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0 space-y-2 text-left" onClick={playInteractionSound}>
               <p className="text-[10px] font-bold text-slate-800 dark:text-zinc-200 leading-tight truncate uppercase tracking-tight">{currentItem.name}</p>
               
               <a 
                 href={currentItem.buttonLink} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 onClick={playInteractionSound}
                 className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-primary text-white dark:bg-white dark:text-black dark:hover:bg-primary dark:hover:text-white rounded-lg text-[8px] font-bold uppercase tracking-wider transition-all"
               >
                 <span>{currentItem.buttonText}</span>
                 <ChevronRight size={8} strokeWidth={2.5} />
               </a>
            </div>

            <button 
              onClick={() => {
                setIsCollapsed(true);
                playInteractionSound();
              }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white dark:bg-zinc-900 shadow-sm border border-slate-200/50 dark:border-white/5 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-all cursor-pointer"
            >
              <X size={10} strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        layout
        onClick={() => {
          setIsCollapsed(prev => !prev);
          playInteractionSound();
        }}
        className={`pointer-events-auto mt-3 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95
          ${isCollapsed 
            ? 'bg-indigo-600 text-white scale-110 shadow-indigo-500/40' 
            : 'bg-white dark:bg-zinc-900 text-indigo-400 border border-indigo-100 dark:border-indigo-900/30'}`}
      >
        {isCollapsed ? <Bell size={20} className="animate-bounce" /> : <ChevronLeft size={20} />}
      </motion.button>
    </div>
  );
};
