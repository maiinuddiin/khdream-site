import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, ExternalLink } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

export const TopBarNotification: React.FC = () => {
  const { data } = useCMS();
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Read potential multiple alerts
  const texts = data.notifications?.topBar?.texts?.filter(Boolean) || [];
  const fallbackText = data.notifications?.topBar?.text || '';
  const alertTexts = React.useMemo(() => {
    const list = texts.length > 0 ? texts : [fallbackText].filter(Boolean);
    return list.length > 0 ? list : ['Emergency Notification System Online'];
  }, [texts, fallbackText]);

  // Typing machine states
  const [alertIndex, setAlertIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(80);

  // Safety boundaries reset
  useEffect(() => {
    if (alertIndex >= alertTexts.length) {
      setAlertIndex(0);
      setDisplayText('');
      setIsDeleting(false);
    }
  }, [alertTexts, alertIndex]);

  // Typing effect loop
  useEffect(() => {
    if (alertTexts.length === 0) return;

    const currentFullText = alertTexts[alertIndex] || '';

    const handleType = () => {
      if (!isDeleting) {
        // Typing letters
        const nextText = currentFullText.substring(0, displayText.length + 1);
        setDisplayText(nextText);
        setTypingSpeed(60); // fast typing speed

        if (nextText === currentFullText) {
          // Finished typing sentence, wait 3 seconds before writing next/backspacing
          setTypingSpeed(4000);
          setIsDeleting(true);
        }
      } else {
        // Deleting letters
        const nextText = currentFullText.substring(0, displayText.length - 1);
        setDisplayText(nextText);
        setTypingSpeed(25); // very fast backspacing speed

        if (nextText === '') {
          setIsDeleting(false);
          // Pick the next alert (randomly from others if there are multiple)
          if (alertTexts.length > 1) {
            let nextIndex = alertIndex;
            while (nextIndex === alertIndex) {
              nextIndex = Math.floor(Math.random() * alertTexts.length);
            }
            setAlertIndex(nextIndex);
          } else {
            setAlertIndex(0);
          }
          setTypingSpeed(600); // short wait after clear before typing again
        }
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, alertIndex, alertTexts, typingSpeed]);

  useEffect(() => {
    const updateHeight = () => {
      if (isVisible && containerRef.current && data.notifications?.topBar?.enabled) {
        document.documentElement.style.setProperty('--top-bar-height', `${containerRef.current.offsetHeight}px`);
      } else {
        document.documentElement.style.setProperty('--top-bar-height', '0px');
      }
    };
    
    updateHeight();
    
    // Use ResizeObserver to catch height changes during animation or window resize
    const observer = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    window.addEventListener('scroll', updateHeight, { passive: true });
    window.addEventListener('resize', updateHeight);
    
    return () => {
      window.removeEventListener('scroll', updateHeight);
      window.removeEventListener('resize', updateHeight);
      observer.disconnect();
      document.documentElement.style.setProperty('--top-bar-height', '0px');
    };
  }, [isVisible, data.notifications?.topBar?.enabled, alertTexts, displayText]);

  if (!data.notifications?.topBar?.enabled || !isVisible) return null;

  const { link, bgColor, textColor } = data.notifications.topBar;
  const isBangla = displayText && /[\u0980-\u09FF]/.test(displayText);

  return (
    <motion.div
      ref={containerRef}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      style={{ backgroundColor: bgColor || '#DC2626', color: textColor || '#ffffff' }}
      className="fixed top-0 left-0 right-0 z-[1000002] overflow-hidden animate-in fade-in"
    >
      <div className="max-w-7xl mx-auto px-4 py-0.5 md:py-1 flex items-center justify-center gap-4 text-center relative min-h-[26px] md:min-h-[28px]">
        <div className="flex items-center justify-center flex-wrap gap-2 pr-8">
          <p 
            style={{ color: textColor || '#ffffff', fontFamily: isBangla ? 'var(--font-bangla)' : undefined }} 
            className="text-[10px] md:text-xs font-black normal-case tracking-widest inline-flex items-center leading-relaxed"
          >
            {displayText}
            <span className="inline-block w-1 h-3 ml-1 bg-current animate-pulse opacity-85" />
          </p>
          {link && (
            <a 
              href={link} 
              style={{ color: textColor || '#ffffff' }}
              className="inline-flex items-center gap-1 text-[10px] md:text-xs font-black normal-case underline decoration-2 underline-offset-4 hover:opacity-80 transition-opacity"
            >
              Details <ExternalLink size={10} style={{ color: textColor || '#ffffff' }} />
            </a>
          )}
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          style={{ color: textColor || '#ffffff' }}
          className="absolute right-4 p-1 hover:bg-black/10 rounded-full transition-colors flex items-center justify-center"
        >
          <X size={14} style={{ color: textColor || '#ffffff' }} />
        </button>
      </div>
    </motion.div>
  );
};

export const PopupNotification: React.FC = () => {
  const { data } = useCMS();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (data.notifications?.popup?.enabled) {
      // Logic to show occasionally: every 3rd visit
      const visitKey = 'emergency_popup_visit_count';
      const count = parseInt(localStorage.getItem(visitKey) || '0');
      const newCount = count + 1;
      localStorage.setItem(visitKey, newCount.toString());

      if (newCount % 3 === 1) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [data.notifications?.popup?.enabled]);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!data.notifications?.popup?.enabled) return null;

  const { title, description, imageUrl, link, buttonText } = data.notifications.popup;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all"
            >
              <X size={20} />
            </button>

            {imageUrl && (
              <div className="w-full md:w-1/2 h-48 md:h-auto relative overflow-hidden">
                <img 
                  src={imageUrl || null} 
                  alt={title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
              </div>
            )}

            <div className={`w-full ${imageUrl ? 'md:w-1/2' : 'w-full'} p-8 md:p-10 flex flex-col justify-center space-y-6`}>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Bell size={16} />
                  <span className="text-[10px] font-black normal-case tracking-[0.2em]">Important Update</span>
                </div>
                <h3 className={`text-2xl md:text-3xl font-black normal-case tracking-tighter leading-none ${title && /[\u0980-\u09FF]/.test(title) ? 'font-bangla' : ''}`}>
                  {title}
                </h3>
              </div>

              <p className={`text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed ${description && /[\u0980-\u09FF]/.test(description) ? 'font-bangla' : ''}`}>
                {description}
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                {link && (
                  <a 
                    href={link}
                    className={`flex-1 px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black normal-case tracking-widest text-center shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95 ${buttonText && /[\u0980-\u09FF]/.test(buttonText) ? 'font-bangla' : ''}`}
                  >
                    {buttonText || 'Learn More'}
                  </a>
                )}
                <button 
                  onClick={handleClose}
                  className="flex-1 px-8 py-4 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black normal-case tracking-widest text-center hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
