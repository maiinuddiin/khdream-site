import React from 'react';
import { motion } from 'framer-motion';
import { useCMS } from '../context/CMSContext';

const LoadingScreen: React.FC = () => {
  const { data } = useCMS();
  const themeColor = data?.general?.themeColor || '#DC2626';

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-zinc-950 text-white select-none pointer-events-none"
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Rounded interactive spinner around Logo */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Subtle Radial Backlight */}
          <div 
            className="absolute inset-[15%] rounded-full opacity-10 blur-xl"
            style={{ backgroundColor: themeColor }}
          />

          {/* Clean minimal circular spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.0, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-zinc-800/80"
            style={{ borderTopColor: themeColor }}
          />

          {/* Logo center display */}
          <div className="relative z-10 p-3 max-w-[80%] max-h-[80%] flex items-center justify-center">
            <img 
              src="/favicon.ico" 
              className="max-h-12 w-auto object-contain drop-shadow-md filter brightness-0 invert"
              alt="Loading"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== data?.general?.logoUrl) {
                  target.src = data?.general?.logoUrl || '';
                }
              }}
            />
          </div>
        </div>

        {/* Quiet English Loading label */}
        <span className="text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase font-sans">
          Loading...
        </span>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
