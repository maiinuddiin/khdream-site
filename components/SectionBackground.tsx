import React from 'react';
import { BackgroundConfig } from '../context/CMSContext';
import AbstractBackground from './AbstractBackground';

interface SectionBackgroundProps {
  config?: BackgroundConfig;
  className?: string;
  opacity?: number;
}

const SectionBackground: React.FC<SectionBackgroundProps> = ({ config, className = "", opacity }) => {
  if (!config) {
    return null;
  }

  const finalOpacity = opacity !== undefined ? opacity : 1;
  const enabled = config.enabledLayers || [];

  return (
    <div className={`absolute inset-0 z-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Background container starts here */}

      {enabled.includes('color') && config.color && (
        <div 
          className="absolute inset-0" 
          style={{ backgroundColor: config.color }} 
        />
      )}
      
      {enabled.includes('gradient') && config.gradient && (
        <div 
          className="absolute inset-0" 
          style={{ background: config.gradient }} 
        />
      )}
      
      {enabled.includes('image') && config.image && (
        <div 
          className={`absolute inset-0 bg-center ${config.imageFit === 'contain' ? 'bg-contain bg-no-repeat' : 'bg-cover'}`} 
          style={{ 
            backgroundImage: `url(${config.image})`,
            opacity: (config.imageOpacity ?? 1) * finalOpacity
          }} 
        />
      )}
      
      {enabled.includes('pattern') && config.pattern && config.pattern !== 'none' && (
        <AbstractBackground 
          variant={config.pattern as any}
          opacity={(config.patternOpacity ?? 0.05) * finalOpacity}
        />
      )}
    </div>
  );
};

export default SectionBackground;
