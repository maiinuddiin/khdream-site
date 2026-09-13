import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface AnimatedLoginBackgroundProps {
  theme?: 'light' | 'dark';
}

export const AnimatedLoginBackground: React.FC<AnimatedLoginBackgroundProps> = ({ theme = 'light' }) => {
  // Generate stable random particles for floating effect
  const particles = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: (i * 17) % 100, // percentage across width
      y: (i * 23) % 100,
      size: (i % 3) * 2 + 3, // 3px, 5px, 7px
      duration: 12 + (i % 8) * 3, // 12s - 33s
      delay: (i % 5) * 1.5,
      driftX: (i % 2 === 0 ? 1 : -1) * (15 + (i % 20)),
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Base Layer Gradient */}
      <div 
        className={`absolute inset-0 transition-colors duration-500 ${
          theme === 'dark' 
            ? 'bg-radial-gradient from-zinc-900 via-zinc-950 to-black' 
            : 'bg-radial-gradient from-white via-slate-50 to-slate-100'
        }`}
      />

      {/* 2. Micro Grid & Tech Pattern Layer */}
      <div 
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] transition-opacity duration-500"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 85%)',
        }}
      />

      {/* 3. Subtle Dot Matrix Accent */}
      <div 
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.045]"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* 4. Drifting Luminous Gradient Orbs */}
      {/* Orb 1: Primary Brand Blue / Indigo (Top Left to Center) */}
      <motion.div
        animate={{
          x: ['-10%', '20%', '-5%', '-10%'],
          y: ['-15%', '15%', '-20%', '-15%'],
          scale: [1, 1.25, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute -top-32 -left-32 w-96 sm:w-[32rem] h-96 sm:h-[32rem] rounded-full blur-[100px] sm:blur-[130px] transition-opacity duration-700 ${
          theme === 'dark'
            ? 'bg-blue-600/25'
            : 'bg-blue-500/15'
        }`}
      />

      {/* Orb 2: Deep Purple / Violet (Bottom Right to Center) */}
      <motion.div
        animate={{
          x: ['10%', '-25%', '15%', '10%'],
          y: ['15%', '-15%', '20%', '15%'],
          scale: [1.1, 0.9, 1.2, 1.1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute -bottom-32 -right-32 w-96 sm:w-[34rem] h-96 sm:h-[34rem] rounded-full blur-[110px] sm:blur-[140px] transition-opacity duration-700 ${
          theme === 'dark'
            ? 'bg-indigo-600/20'
            : 'bg-indigo-400/15'
        }`}
      />

      {/* Orb 3: Radiant Cyan / Emerald (Top Right) */}
      <motion.div
        animate={{
          x: ['5%', '-15%', '10%', '5%'],
          y: ['-10%', '25%', '-5%', '-10%'],
          scale: [0.95, 1.2, 1, 0.95],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute -top-20 right-[15%] w-80 sm:w-[28rem] h-80 sm:h-[28rem] rounded-full blur-[90px] sm:blur-[120px] transition-opacity duration-700 ${
          theme === 'dark'
            ? 'bg-cyan-500/20'
            : 'bg-sky-400/12'
        }`}
      />

      {/* Orb 4: Rose / Warm Accent (Bottom Left) */}
      <motion.div
        animate={{
          x: ['-15%', '15%', '-10%', '-15%'],
          y: ['10%', '-20%', '15%', '10%'],
          scale: [1, 0.85, 1.15, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute bottom-[10%] -left-20 w-72 sm:w-[26rem] h-72 sm:h-[26rem] rounded-full blur-[90px] sm:blur-[120px] transition-opacity duration-700 ${
          theme === 'dark'
            ? 'bg-rose-600/15'
            : 'bg-rose-400/10'
        }`}
      />

      {/* 5. Sweeping Diagonal Light Beam */}
      <motion.div
        animate={{
          rotate: [35, 45, 35],
          opacity: theme === 'dark' ? [0.08, 0.16, 0.08] : [0.04, 0.09, 0.04],
          x: ['-20%', '20%', '-20%'],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -inset-full bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-3xl pointer-events-none"
      />

      {/* 6. Floating Luminous Light Specks / Particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{
            opacity: 0,
            x: `${p.x}vw`,
            y: `${p.y}vh`,
          }}
          animate={{
            opacity: [0, theme === 'dark' ? 0.7 : 0.45, 0],
            y: [`${p.y}vh`, `${(p.y - 30 + 100) % 100}vh`],
            x: [`${p.x}vw`, `${p.x + p.driftX}vw`],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
          className={`absolute rounded-full pointer-events-none ${
            theme === 'dark'
              ? 'bg-blue-300 shadow-[0_0_8px_rgba(147,197,253,0.8)]'
              : 'bg-primary shadow-[0_0_6px_rgba(37,99,235,0.4)]'
          }`}
        />
      ))}
    </div>
  );
};

export default React.memo(AnimatedLoginBackground);
