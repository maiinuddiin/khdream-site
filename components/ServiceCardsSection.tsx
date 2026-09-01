import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../context/CMSContext';
import { Check, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import AbstractBackground from './AbstractBackground';

import AnimatedHeader from './AnimatedHeader';

import SwipeHint from './SwipeHint';

const ServiceCardsSection: React.FC = () => {
  const { data } = useCMS();
  const cards = data.serviceCards || [];
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const hasBangla = (text: string | null | undefined): boolean => {
    if (!text) return false;
    return /[\u0980-\u09FF]/.test(text);
  };
  
  // Center algorithms for 1, 2, or 3+ packages
  const defaultIdx = cards.length === 1 ? 0 : cards.length === 2 ? 1 : 1;

  const [centeredIndex, setCenteredIndex] = useState(defaultIdx);
  const [activeMobileIdx, setActiveMobileIdx] = useState(defaultIdx);
  const [isHovered, setIsHovered] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Programmatically deduce highlighting center index
  const getActiveIndex = () => {
    if (cards.length === 1) return 0;
    if (cards.length === 2) return 1; // latest/second is default
    const recIndex = cards.findIndex(c => c.isRecommended);
    if (recIndex !== -1) return recIndex;
    return centeredIndex;
  };

  const activeIndex = getActiveIndex();

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);

      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        const approxCellWidth = clientWidth - 32;
        const newIndex = Math.round(scrollLeft / approxCellWidth);
        if (newIndex >= 0 && newIndex < cards.length && newIndex !== activeMobileIdx) {
          setActiveMobileIdx(newIndex);
        }
      } else {
        const cardWidth = 380 + 40;
        const newIndex = Math.round(scrollLeft / cardWidth);
        if (newIndex >= 0 && newIndex < cards.length && newIndex !== centeredIndex) {
          setCenteredIndex(newIndex);
        }
      }
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [cards]);

  // Scroll to default on load for mobile
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile && scrollRef.current && cards.length > 1) {
      const timer = setTimeout(() => {
        const container = scrollRef.current;
        if (container) {
          const children = container.children;
          if (children && children[defaultIdx]) {
            const cardItem = children[defaultIdx] as HTMLElement;
            const scrollLeftVal = cardItem.offsetLeft - 32;
            container.scrollTo({
              left: scrollLeftVal,
              behavior: 'auto'
            });
            setActiveMobileIdx(defaultIdx);
          }
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [cards, defaultIdx]);

  // Autoplay swipe loop
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (!isMobile || isHovered || cards.length === 0) return;

    const interval = setInterval(() => {
      const nextIdx = (activeMobileIdx + 1) % cards.length;
      setActiveMobileIdx(nextIdx);
      
      if (scrollRef.current) {
        const container = scrollRef.current;
        const children = container.children;
        if (children && children[nextIdx]) {
          const cardItem = children[nextIdx] as HTMLElement;
          if (cardItem) {
            const scrollLeftVal = cardItem.offsetLeft - 32; // Offset for spacing margin
            container.scrollTo({
              left: scrollLeftVal,
              behavior: 'smooth'
            });
          }
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [cards.length, isHovered, activeMobileIdx]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      // On desktop (3 cards), scroll by one card width + gap
      // On mobile, scroll by viewport width
      const isMobile = window.innerWidth < 768;
      const amount = isMobile ? clientWidth : (clientWidth - 80) / 3 + 40;
      
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -amount : amount, 
        behavior: 'smooth' 
      });
    }
  };

  if (cards.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto relative z-10">
      {(!data.general.sectionTitles?.packages || 
        data.general.sectionTitles?.packages?.title !== "" || 
        data.general.sectionTitles?.packages?.subtitle !== "") && (
        <div className="text-center mb-16 md:mb-24">
          <AnimatedHeader 
            {...data.general.sectionTitles?.packages}
            title={data.general.sectionTitles?.packages?.title !== undefined ? data.general.sectionTitles?.packages?.title : 'Our Premium Packages'}
            subtitle={data.general.sectionTitles?.packages?.subtitle !== undefined ? data.general.sectionTitles?.packages?.subtitle : 'CHOOSE YOUR EXPERIENCE'}
            align="center"
          />
        </div>
      )}
        
        {/* Dynamic Mobile Auto-play Carousel Container */}
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative"
        >
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className={cn(
              "flex overflow-x-auto gap-8 md:gap-10 no-scrollbar snap-x snap-mandatory px-4 -mx-4 md:px-0 md:mx-0 pb-6 md:pb-0",
              cards.length === 1 
                ? "md:flex md:justify-center md:max-w-xl md:mx-auto" 
                : cards.length === 2 
                  ? "md:flex md:justify-center md:max-w-4xl md:mx-auto" 
                  : "md:grid md:grid-cols-3"
            )}
          >
            {cards.map((card, index) => {
              const isActuallyCenter = index === activeIndex;
              const isFastScrolling = typeof window !== 'undefined' && (window as any).__isFastScrolling;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: isFastScrolling ? 0 : 0.35, 
                    delay: isFastScrolling ? 0 : index * 0.05 
                  }}
                  viewport={{ once: true, margin: "-10px" }}
                  className={cn(
                    "flex-shrink-0 w-[calc(100vw-48px)] snap-center",
                    cards.length === 1 
                      ? "md:w-[400px]" 
                      : cards.length === 2 
                        ? "md:w-[350px]" 
                        : "md:w-[320px] md:flex-shrink-0",
                    "relative flex flex-col p-5 md:p-6 rounded-xl transition-all duration-300 group/card",
                    isActuallyCenter 
                      ? "bg-white dark:bg-zinc-900 border border-primary/50 shadow-sm z-20 md:scale-[1.02]" 
                      : "bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white border border-slate-100 dark:border-white/5 z-10 hover:bg-white dark:hover:bg-zinc-900"
                  )}
                >

                  <div className="relative z-10 space-y-3 flex flex-col h-full">
                    <div className="space-y-1.5">
                      {isActuallyCenter && (
                         <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded mb-1">
                          <Star size={8} fill="currentColor" /> Recommended
                        </div>
                      )}
                      <h3 
                        className={cn(
                          "text-lg md:text-xl font-bold tracking-tight leading-tight text-slate-900 dark:text-white",
                          hasBangla(card.title) ? "font-bangla" : "font-montserrat"
                        )} 
                        dangerouslySetInnerHTML={{ __html: card.title }} 
                      />
                      <p 
                        className={cn(
                          "text-[10px] font-medium leading-snug",
                          hasBangla(card.description) ? "font-bangla" : "",
                          isActuallyCenter ? "text-slate-600 dark:text-zinc-400" : "text-slate-500 dark:text-zinc-500"
                        )} 
                        dangerouslySetInnerHTML={{ __html: card.description }} 
                      />
                    </div>

                    {card.price && card.price.trim() !== "" && (
                      <div className="flex flex-col py-1 justify-center">
                        <div className="flex items-baseline flex-wrap gap-x-1.5 text-slate-900 dark:text-white">
                          <span className={cn(
                            "font-bold tracking-tight leading-none text-2xl",
                            hasBangla(card.price) ? "font-bangla" : "font-montserrat"
                          )}>
                            {card.price}
                          </span>
                        </div>
                        {card.priceSubtitle && card.priceSubtitle.trim() !== "" && (
                          <span className={cn(
                            "text-[9px] font-medium mt-1 opacity-70",
                            hasBangla(card.priceSubtitle) ? "font-bangla" : "",
                            "text-slate-500"
                          )}>
                            {card.priceSubtitle}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 py-3 border-y border-slate-100 dark:border-white/5 flex-grow">
                      {(card.features || []).slice(0, 6).map((feature, fIdx) => (
                        <div key={`${card.id}-feature-${fIdx}`} className="flex items-start space-x-2">
                           <div className={cn(
                             "mt-0.5 flex-shrink-0 w-3 h-3 rounded flex items-center justify-center",
                             isActuallyCenter ? "bg-primary/20 text-primary" : "bg-slate-200 dark:bg-zinc-800 text-slate-500"
                           )}>
                            <Check size={8} strokeWidth={3} />
                          </div>
                          <span 
                            className={cn(
                              "text-xs font-medium leading-snug text-slate-600 dark:text-zinc-400",
                              hasBangla(feature) ? "font-bangla" : ""
                            )} 
                            dangerouslySetInnerHTML={{ __html: feature }} 
                          />
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => {
                        const settings = data.general.buttonSettings?.packageBook;
                        const phone = settings?.whatsapp || data.general.whatsappBooking || data.general.whatsapp;
                        const msg = `Inquiry for Package: ${card.title}`;
                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className={cn(
                        "w-full py-2.5 rounded-lg text-[11px] font-bold transition-all active:scale-[0.98] mt-1",
                        hasBangla(data.general.buttonSettings?.packageBook?.text || "Request Proposal") ? "font-bangla" : "",
                        isActuallyCenter
                          ? "bg-primary text-white hover:brightness-110" 
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white hover:bg-primary hover:text-white"
                      )}
                    >
                      {data.general.buttonSettings?.packageBook?.text || "Request Proposal"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile Dot Navigation Indicators */}
        <div className="flex md:hidden justify-center items-center gap-3 mt-8">
          {cards.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              onClick={() => {
                setActiveMobileIdx(idx);
                if (scrollRef.current) {
                  const container = scrollRef.current;
                  const cardItem = container.children[idx] as HTMLElement;
                  if (cardItem) {
                    const scrollLeftVal = cardItem.offsetLeft - 32; // Offset for spacing margin
                    container.scrollTo({
                      left: scrollLeftVal,
                      behavior: 'smooth'
                    });
                  }
                }
              }}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                activeMobileIdx === idx 
                  ? "w-8 bg-primary" 
                  : "w-2.5 bg-slate-200 dark:bg-zinc-800"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <SwipeHint />
      </div>
  );
};

export default ServiceCardsSection;
