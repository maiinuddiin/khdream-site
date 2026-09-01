import React from 'react';
import { motion } from 'framer-motion';
import { useCMS } from '../context/CMSContext';

interface AnimatedHeaderProps {
  title: string;
  className?: string;
  subtitle?: string;
  centered?: boolean;
  titleSize?: string;
  subtitleSize?: string;
  align?: 'left' | 'center' | 'right';
  titleColor?: string;
  subtitleColor?: string;
  rotation?: number;
  animation?: 'none' | 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'zoomOut';
  fontFamily?: string;
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({ 
  title, 
  className = "", 
  subtitle, 
  centered = true,
  titleSize = "text-2xl md:text-5xl",
  subtitleSize = "text-base md:text-lg",
  align,
  titleColor,
  subtitleColor,
  rotation = 0,
  animation = 'none',
  fontFamily
}) => {
  const { data } = useCMS();
  const isFastScrolling = typeof window !== 'undefined' && (window as any).__isFastScrolling;
  
  const toTitleCase = (str: string) => {
    if (!str) return '';
    if (str === str.toUpperCase() && str !== str.toLowerCase()) {
      return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return str;
  };

  const alignment = align || (centered ? 'center' : 'left');

  const getAnimationProps = () => {
    if (isFastScrolling) {
      return {}; // No animation whatsoever during fast scroll / scrollbar drag
    }

    switch (animation) {
      case 'fade': return { initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.3 } };
      case 'slideUp': return { initial: { opacity: 0, y: 15 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };
      case 'slideDown': return { initial: { opacity: 0, y: -15 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };
      case 'slideLeft': return { initial: { opacity: 0, x: 15 }, whileInView: { opacity: 1, x: 0 }, transition: { duration: 0.3 } };
      case 'slideRight': return { initial: { opacity: 0, x: -15 }, whileInView: { opacity: 1, x: 0 }, transition: { duration: 0.3 } };
      case 'zoomIn': return { initial: { opacity: 0, scale: 0.95 }, whileInView: { opacity: 1, scale: 1 }, transition: { duration: 0.3 } };
      case 'zoomOut': return { initial: { opacity: 0, scale: 1.05 }, whileInView: { opacity: 1, scale: 1 }, transition: { duration: 0.3 } };
      default: return {};
    }
  };

  const hasBangla = (text: string | null | undefined): boolean => {
    if (!text) return false;
    return /[\u0980-\u09FF]/.test(text);
  };

  const isBangla = hasBangla(title) || hasBangla(subtitle);
  const resolvedFontFamily = fontFamily || (isBangla ? 'var(--font-bangla)' : 'var(--font-header)');

  return (
    <motion.div 
      {...getAnimationProps()}
      viewport={{ once: true }}
      className={`${alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left'} mb-3 md:mb-6 px-4 ${className} ${isBangla ? 'font-bangla' : ''}`}
      style={{ transform: `rotate(${rotation}deg)`, fontFamily: resolvedFontFamily }}
    >
      <div className={`flex flex-col ${alignment === 'center' ? 'items-center' : alignment === 'right' ? 'items-end' : 'items-start'} gap-1 mb-2`}>
        {subtitle && (
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.5 }}
            transition={{ duration: isFastScrolling ? 0 : 0.25 }}
            className="text-[9px] md:text-[10px] font-bold normal-case tracking-[0.3em] text-primary mb-1 block"
          >
            {toTitleCase(subtitle)}
          </motion.span>
        )}
        <h2 
          className={`${titleSize} font-extrabold tracking-tighter`}
          style={{ color: titleColor || 'inherit' }}
        >
          {(() => {
            const formattedTitle = toTitleCase(title);
            if (formattedTitle.includes('<')) {
              return <span dangerouslySetInnerHTML={{ __html: formattedTitle }} />;
            }
            const words = formattedTitle.trim().split(/\s+/);
            if (words.length <= 1) return formattedTitle;
            const lastWord = words.pop();
            const remainingText = words.join(' ');
            return (
              <>
                <span className="text-slate-900 dark:text-zinc-100">{remainingText} </span>
                <span className="text-gradient font-black">
                  {lastWord}
                </span>
              </>
            );
          })()}
        </h2>
        <div className={`h-[2px] w-8 bg-gradient-themed rounded-full mt-2`} />
      </div>
    </motion.div>
  );
};

export default AnimatedHeader;
