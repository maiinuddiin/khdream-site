import React from 'react';

export const SectionLabel: React.FC<{ name: string; className?: string }> = ({ name, className = "" }) => (
  <div className={`absolute pointer-events-none select-none z-10 ${className}`}>
    <div className="flex items-center space-x-2">
      <div className="h-[1px] w-4 bg-primary/30 dark:bg-primary/10" />
      <span className="text-[7px] font-bold text-primary/40 dark:text-primary/40 normal-case tracking-[0.4em] whitespace-nowrap">{name}</span>
    </div>
  </div>
);
