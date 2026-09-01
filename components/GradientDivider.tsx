import React from 'react';
import { useCMS } from '../context/CMSContext';

const GradientDivider: React.FC = () => {
  const { data } = useCMS();
  const themeColor = data?.general?.themeColor || '#DC2626';

  return (
    <div className="w-full flex justify-center py-1 md:py-2 bg-transparent relative z-10 overflow-hidden pointer-events-none">
      <div 
        className="h-[0.5px] w-full max-w-5xl opacity-15 dark:opacity-25"
        style={{
          backgroundImage: `linear-gradient(to right, transparent 0%, ${themeColor}bb 50%, transparent 100%)`
        }}
      />
    </div>
  );
};

export default GradientDivider;
