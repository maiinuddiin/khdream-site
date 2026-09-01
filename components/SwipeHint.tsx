import React from 'react';
import { ArrowRight } from 'lucide-react';

const SwipeHint: React.FC = () => {
  return (
    <div className="md:hidden flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mt-2 py-2 animate-pulse pointer-events-none select-none">
      <span>Swipe to explore</span>
      <ArrowRight size={10} className="animate-bounce-x" />
      <style>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default SwipeHint;
