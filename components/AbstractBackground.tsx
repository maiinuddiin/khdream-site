import React, { memo } from 'react';

interface AbstractBackgroundProps {
  variant?: 'lines' | 'grid' | 'waves' | 'circles' | 'geometric' | 'halftone' | 'soft-grid' | 'mesh' | 'topo' | 'noise' | 'refined-grid' | 'map' | 'travel-icons' | 'glass-blobs' | 'modern-triangles' | 'circuit';
  opacity?: string | number;
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'full';
}

const AbstractBackground: React.FC<AbstractBackgroundProps> = memo(({ 
  variant = 'refined-grid', 
  opacity = 0.02,
  className = "",
  position = 'full'
}) => {
  const opacityValue = typeof opacity === 'number' ? opacity : undefined;
  const opacityClass = typeof opacity === 'string' ? opacity : '';

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left': return 'top-0 left-0 w-1/2 h-1/2';
      case 'top-right': return 'top-0 right-0 w-1/2 h-1/2';
      case 'bottom-left': return 'bottom-0 left-0 w-1/2 h-1/2';
      case 'bottom-right': return 'bottom-0 right-0 w-1/2 h-1/2';
      case 'center': return 'top-1/4 left-1/4 w-1/2 h-1/2';
      default: return 'inset-0';
    }
  };

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* 1. LINES */}
      {variant === 'lines' && (
        <div 
          style={opacityValue !== undefined ? { 
            opacity: opacityValue,
            maskImage: 'radial-gradient(circle at center, black 30%, transparent 98%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 98%)'
          } : {}}
          className={`absolute ${getPositionStyles()} bg-line-pattern text-current transition-opacity duration-300`} 
        />
      )}
      
      {/* 2. REFINED GRID */}
      {variant === 'refined-grid' && (
        <div 
          style={opacityValue !== undefined ? { 
            opacity: opacityValue,
            maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 90%)'
          } : {}}
          className={`absolute ${getPositionStyles()} text-current overflow-hidden`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.08]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:200px_200px] opacity-[0.15]" />
        </div>
      )}

      {/* 3. NOISE */}
      {variant === 'noise' && (
        <div 
          style={opacityValue !== undefined ? { opacity: opacityValue } : {}}
          className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
        >
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>
      )}

      {/* 4. TOPO (Optimized: Removed heavy framer-motion path-coordinate animations) */}
      {variant === 'topo' && (
        <div 
          style={opacityValue !== undefined ? { opacity: opacityValue } : {}}
          className="absolute inset-0 opacity-5"
        >
          <svg width="100%" height="100%" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            {[...Array(6)].map((_, i) => (
              <path
                key={i}
                d={`M${-200 + i * 150} 0 C${300 + i * 40} ${400 - i * 20}, ${500 + i * 60} ${600 + i * i}, ${1200 + i * 150} 1000`}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.3"
                opacity={0.6 - i * 0.1}
              />
            ))}
          </svg>
        </div>
      )}

      {/* 5. MESH (Optimized: Static vectors for Zero-overhead scrolling) */}
      {variant === 'mesh' && (
        <div 
          style={opacityValue !== undefined ? { opacity: opacityValue } : {}}
          className={`absolute ${getPositionStyles()} text-current overflow-hidden`}
        >
          <svg className="w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="meshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                <stop offset="50%" stopColor="currentColor" stopOpacity="0.05" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path
              d="M0,50 Q25,0 50,50 T100,50"
              fill="none"
              stroke="url(#meshGrad)"
              strokeWidth="0.2"
            />
            <path
              d="M50,0 Q0,25 50,50 T50,100"
              fill="none"
              stroke="url(#meshGrad)"
              strokeWidth="0.2"
            />
          </svg>
        </div>
      )}

      {/* 6. HALFTONE */}
      {variant === 'halftone' && (
        <div 
          style={opacityValue !== undefined ? { 
            opacity: opacityValue,
            maskImage: 'radial-gradient(circle at center, black 30%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 90%)'
          } : {}}
          className={`absolute ${getPositionStyles()} text-current overflow-hidden`}
        >
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(circle at center, currentColor 1px, transparent 1.5px)',
              backgroundSize: '16px 16px',
              transform: 'scale(2) rotate(15deg) translate(-10%, -10%)',
            }}
          />
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at center, currentColor 1.5px, transparent 2px)',
              backgroundSize: '32px 32px',
              transform: 'scale(1.5) rotate(-10deg) translate(5%, 5%)',
            }}
          />
        </div>
      )}

      {/* 7. SOFT GRID */}
      {variant === 'soft-grid' && (
        <div 
          style={opacityValue !== undefined ? { 
            opacity: opacityValue,
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 90%)'
          } : {}}
          className={`absolute ${getPositionStyles()} text-current`}
        >
          <div 
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px),
                radial-gradient(circle at 2px 2px, currentColor 1.5px, transparent 0)
              `,
              backgroundSize: '40px 40px, 40px 40px, 40px 40px'
            }}
          />
        </div>
      )}
      
      {/* 8. GRID */}
      {variant === 'grid' && (
        <div 
          style={opacityValue !== undefined ? { 
            opacity: opacityValue,
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 98%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 98%)'
          } : {}}
          className={`absolute ${getPositionStyles()} bg-[linear-gradient(to_right,currentColor_0.5px,transparent_0.5px),linear-gradient(to_bottom,currentColor_0.5px,transparent_0.5px)] [background-size:24px_24px] text-current`} 
        />
      )}

      {/* 9. CIRCUIT */}
      {variant === 'circuit' && (
        <div 
          style={opacityValue !== undefined ? { 
            opacity: opacityValue,
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)'
          } : {}}
          className={`absolute ${getPositionStyles()} text-current overflow-hidden`}
        >
          <svg className="w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
             {[...Array(5)].map((_, i) => (
               <path 
                 key={i}
                 d={`M ${15 + i * 16} ${20 + i * i} L ${40 + i * 10} ${30 + i * 8} L ${60 + i * 8} ${80 - i * 5}`}
                 fill="none"
                 stroke="currentColor"
                 strokeWidth="0.1"
               />
             ))}
             <rect width="100" height="100" fill="url(#circuit-grid)" />
             <defs>
               <pattern id="circuit-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                 <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.1" />
                 <circle cx="0" cy="0" r="0.5" fill="currentColor" />
               </pattern>
             </defs>
          </svg>
        </div>
      )}
      
      {/* 10. WAVES */}
      {variant === 'waves' && (
        <div className={`absolute inset-0 ${className}`}>
          <svg 
            style={opacityValue !== undefined ? { opacity: opacityValue } : {}}
            className={`absolute inset-0 w-full h-full ${opacityClass} stroke-current scale-110`} 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[...Array(6)].map((_, i) => (
              <path
                key={i}
                d={`M -100 ${20 + i * 15} Q 0 ${10 + i * 10}, 100 ${20 + i * 15} T 300 ${20 + i * 15}`}
                fill="none"
                strokeWidth={0.3 + i * 0.1}
                stroke="url(#waveGrad)"
                opacity={0.05 + i * 0.02}
              />
            ))}
          </svg>
        </div>
      )}
      
      {/* 11. CIRCLES */}
      {variant === 'circles' && (
        <div 
          style={opacityValue !== undefined ? { opacity: 1 } : {}}
          className={`absolute inset-0 ${opacityClass} text-current`}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                width: `${250 + i * 80}px`,
                height: `${250 + i * 80}px`,
                left: `${15 + i * 20}%`,
                top: `${20 + i * 15}%`,
                opacity: (opacityValue || 0.1) * 0.6,
              }}
              className="absolute border border-current rounded-full -translate-x-1/2 -translate-y-1/2"
            />
          ))}
        </div>
      )}

      {/* 12. MAP */}
      {variant === 'map' && (
        <div 
          style={opacityValue !== undefined ? { 
            opacity: opacityValue,
            maskImage: 'radial-gradient(circle at center, black 50%, transparent 95%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 50%, transparent 95%)'
          } : {}}
          className={`absolute ${getPositionStyles()} text-current overflow-hidden`}
        >
          {/* Latitude/Longitude Lines */}
          <div className="absolute inset-0 opacity-[0.1] bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:120px_120px]" />
          {/* Compass Rose Accent */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 opacity-[0.05] border border-current rounded-full flex items-center justify-center">
             <div className="w-px h-full bg-current" />
             <div className="h-px w-full bg-current" />
          </div>
        </div>
      )}

      {/* 13. TRAVEL ICONS */}
      {variant === 'travel-icons' && (
        <div 
          style={opacityValue !== undefined ? { opacity: opacityValue } : {}}
          className={`absolute ${getPositionStyles()} text-current overflow-hidden flex items-center justify-center`}
        >
          <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-8 gap-20 p-20 opacity-[0.08] rotate-[-15deg] scale-125">
             {[...Array(24)].map((_, i) => (
               <div key={i} className="flex items-center justify-center">
                  {i % 4 === 0 && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4.7 20.3 4c-.7-.7-2-.7-3.5.8L13.3 8.3 5.1 6.5c-1.2-.3-2.4.4-2.6 1.6-.2 1.2.6 2.4 1.8 2.6l7.4 1.6-1.6 1.6-2.5-.5c-.8-.2-1.6.3-1.8 1.1-.2.8.3 1.6 1.1 1.8l3.6.7L11 18.5c-.3 1.2.4 2.4 1.6 2.6 1.2.2 2.4-.6 2.6-1.8l.4-2.2 2.2-.4z"/></svg>}
                  {i % 4 === 1 && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                  {i % 4 === 2 && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg>}
                  {i % 4 === 3 && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
               </div>
             ))}
          </div>
        </div>
      )}

      {/* 14. GLASS BLOBS (Optimized: Removed continuous scale/coordinate loops. Uses clean GPU-friendly layering) */}
      {variant === 'glass-blobs' && (
        <div 
          style={opacityValue !== undefined ? { opacity: 1 } : {}}
          className={`absolute inset-0 ${opacityClass} text-current pointer-events-none`}
        >
          <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-[0.03] bg-slate-400" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-[0.02] bg-slate-300" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] rounded-full blur-[100px] bg-slate-500/5 opacity-[0.02]" />
        </div>
      )}

      {/* 15. MODERN TRIANGLES */}
      {variant === 'modern-triangles' && (
        <div 
          style={opacityValue !== undefined ? { opacity: 1 } : {}}
          className={`absolute inset-0 ${opacityClass} text-current pointer-events-none overflow-hidden`}
        >
          <div 
            className="absolute top-1/4 left-10 w-40 h-40 border-l border-t border-current opacity-[0.05]"
            style={{ transform: 'rotate(-45deg)' }}
          />
          <div 
            className="absolute bottom-1/3 right-20 w-64 h-64 border-r border-b border-current opacity-[0.03]"
            style={{ transform: 'rotate(15deg)' }}
          />
          <div className="absolute top-1/2 left-2/3 w-px h-[40vh] bg-current opacity-[0.05]" />
          <div className="absolute top-1/3 left-1/4 w-[30vh] h-px bg-current opacity-[0.05]" />
        </div>
      )}

      {/* 16. GEOMETRIC */}
      {variant === 'geometric' && (
        <div 
          style={opacityValue !== undefined ? { 
            opacity: 1,
            maskImage: 'radial-gradient(circle at center, black 50%, transparent 95%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 50%, transparent 95%)'
          } : {}}
          className={`absolute inset-0 ${opacityClass} text-current`}
        >
          <div 
            style={{ 
              background: 'radial-gradient(circle, currentColor 0%, transparent 80%)',
              width: '50vw',
              height: '50vw',
              top: '10%',
              left: '-10%',
              borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
            }}
            className="absolute opacity-[0.08] blur-[80px]" 
          />
          <div 
            style={{ 
              background: 'radial-gradient(circle, currentColor 0%, transparent 80%)',
              width: '60vw',
              height: '60vw',
              bottom: '-10%',
              right: '-10%',
              borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%'
            }}
            className="absolute opacity-[0.06] blur-[100px]" 
          />
        </div>
      )}
    </div>
  );
});

export default AbstractBackground;
