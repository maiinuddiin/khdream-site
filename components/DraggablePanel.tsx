import React, { useState, useEffect, useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { GripHorizontal, X, Maximize2, Minimize2 } from 'lucide-react';

interface DraggablePanelProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  width?: string;
}

const DraggablePanel: React.FC<DraggablePanelProps> = ({ 
  title, 
  onClose, 
  children, 
  initialPosition = { x: 100, y: 100 },
  width = "w-96"
}) => {
  const dragControls = useDragControls();
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragListener={false}
      initial={{ opacity: 0, scale: 0.9, x: initialPosition.x, y: initialPosition.y }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`fixed top-0 left-0 z-[10005] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden ${width} ${isMinimized ? 'h-auto' : 'max-h-[85vh]'}`}
    >
      {/* Header */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-zinc-800/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 cursor-move"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <h3 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors text-slate-500"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <Maximize2 size={10} /> : <Minimize2 size={10} />}
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 rounded-lg transition-colors text-slate-500"
            title="Close"
          >
            <X size={10} />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-grow overflow-y-auto custom-scrollbar p-3">
          {children}
        </div>
      )}
    </motion.div>
  );
};

export default DraggablePanel;
