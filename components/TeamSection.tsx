import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../context/CMSContext';
import AbstractBackground from './AbstractBackground';
import AnimatedHeader from './AnimatedHeader';
import { Facebook, Shield, Sparkles, Globe, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const TeamSection: React.FC<{ t: (path: string) => string }> = ({ t }) => {
  const { data } = useCMS();
  const ORIGINAL_TEAM = data.team || [];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammatic = useRef(false);
  const targetScrollLeft = useRef(0);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  useEffect(() => {
    if (ORIGINAL_TEAM.length === 0) return;
    
    const handleResize = () => {
      updateButtonVisibility();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [ORIGINAL_TEAM]);

  // Autoplay handler
  useEffect(() => {
    if (ORIGINAL_TEAM.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      let nextIndex = (activeIndex + 1) % ORIGINAL_TEAM.length;
      scrollToMember(nextIndex);
    }, 4500);

    return () => clearInterval(interval);
  }, [ORIGINAL_TEAM.length, activeIndex, isHovered]);

  const updateButtonVisibility = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftBtn(scrollLeft > 10);
      setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 10);

      if (isProgrammatic.current) {
        if (Math.abs(scrollLeft - targetScrollLeft.current) < 8) {
          isProgrammatic.current = false;
        }
        return; // Ignore index recalculations during programmatic scrolling to prevent jumpiness
      }

      // Manual scrolling index detection (swiping or trackpad)
      const children = scrollContainerRef.current.children;
      if (children && children.length > 1) {
        const firstChild = children[0] as HTMLElement;
        const secondChild = children[1] as HTMLElement;
        const itemStep = secondChild.offsetLeft - firstChild.offsetLeft;
        if (itemStep > 0) {
          const calcIndex = Math.round(scrollLeft / itemStep);
          if (calcIndex >= 0 && calcIndex < ORIGINAL_TEAM.length && calcIndex !== activeIndex) {
            setActiveIndex(calcIndex);
          }
          return;
        }
      }

      const calcIndex = Math.round(scrollLeft / 284);
      if (calcIndex >= 0 && calcIndex < ORIGINAL_TEAM.length && calcIndex !== activeIndex) {
        setActiveIndex(calcIndex);
      }
    }
  };

  const scrollToMember = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const children = container.children;
      if (children && children[index]) {
        const cardNode = children[index] as HTMLElement;
        if (cardNode) {
          // Alignment to start is much cleaner on all screen sizes
          const scrollValue = cardNode.offsetLeft - 16; // 16px offset match padding
          isProgrammatic.current = true;
          targetScrollLeft.current = Math.max(0, scrollValue);
          container.scrollTo({
            left: targetScrollLeft.current,
            behavior: 'smooth'
          });
          setActiveIndex(index);
        }
      }
    }
  };

  const scrollSide = (direction: 'left' | 'right') => {
    if (ORIGINAL_TEAM.length <= 1) return;
    let nextIndex = activeIndex;
    if (direction === 'left') {
      nextIndex = activeIndex - 1;
      if (nextIndex < 0) nextIndex = ORIGINAL_TEAM.length - 1;
    } else {
      nextIndex = activeIndex + 1;
      if (nextIndex >= ORIGINAL_TEAM.length) nextIndex = 0;
    }
    scrollToMember(nextIndex);
  };

  if (ORIGINAL_TEAM.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-6 bg-slate-50/50 dark:bg-[#030303] transition-colors duration-700 relative overflow-hidden">
      {/* Decorative background grid and blurs */}
      <AbstractBackground variant="refined-grid" opacity={0.03} />
      <div className="absolute top-1/3 left-1/4 w-[40vw] h-[40vw] bg-primary/5 dark:bg-primary/5 blur-[120px] rounded-full pointer-events-none select-none" />
      
      <div className="max-w-7xl mx-auto relative z-10 text-left">
        {(!data.general.sectionTitles?.team || 
          data.general.sectionTitles?.team?.title !== "" || 
          data.general.sectionTitles?.team?.subtitle !== "") && (
          <div className="text-center mb-10 md:mb-16 relative">
            <AnimatedHeader 
              title={data.general.sectionTitles?.team?.title !== undefined ? data.general.sectionTitles?.team?.title : t('team.title')} 
              subtitle={data.general.sectionTitles?.team?.subtitle !== undefined ? data.general.sectionTitles?.team?.subtitle : "MEET OUR SPECIALISTS"}
              align="center"
            />
          </div>
        )}

        {/* Swipeable Carousel Container */}
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          className="relative px-2 group/carousel"
        >
          {/* Navigation over left side */}
          <button
            onClick={() => scrollSide('left')}
            className={cn(
              "absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-20",
              "w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center transition-all bg-white/95 lg:bg-white dark:bg-zinc-900/95 dark:lg:bg-zinc-900 shadow-md hover:bg-primary hover:text-white cursor-pointer active:scale-95",
              ORIGINAL_TEAM.length <= 1 && "hidden"
            )}
            aria-label="Previous member"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Navigation over right side */}
          <button
            onClick={() => scrollSide('right')}
            className={cn(
              "absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-20",
              "w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center transition-all bg-white/95 lg:bg-white dark:bg-zinc-900/95 dark:lg:bg-zinc-900 shadow-md hover:bg-primary hover:text-white cursor-pointer active:scale-95",
              ORIGINAL_TEAM.length <= 1 && "hidden"
            )}
            aria-label="Next member"
          >
            <ChevronRight size={20} />
          </button>

          <div 
            ref={scrollContainerRef}
            onScroll={updateButtonVisibility}
            className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6 px-4 -mx-4 scroll-smooth"
          >
            {ORIGINAL_TEAM.map((member, idx) => {
              const hasLink = !!member.link;
              const isActive = idx === activeIndex;

              return (
                <div
                  key={`team-carousel-${idx}`}
                  className="flex-shrink-0 w-[260px] snap-center py-2"
                >
                  <div
                    className={cn(
                      "group relative w-full bg-white dark:bg-zinc-900/60",
                      "border rounded-2xl p-6 flex flex-col justify-between items-center text-center",
                      "transition-all duration-400 ease-out h-[350px]",
                      isActive 
                        ? "border-primary/40 shadow-xl dark:shadow-2xl ring-2 ring-primary/20 scale-[1.03]" 
                        : "border-slate-100 dark:border-white/5 shadow-xs opacity-60 grayscale"
                    )}
                  >
                    {/* Visual Accent Bar */}
                    <div className={cn(
                      "absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30 rounded-t-2xl transition-opacity duration-400",
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )} />
                    
                    {/* Decorative Elements */}
                    <div className={cn(
                      "absolute top-3 right-3 transition-all",
                      isActive ? "text-primary/70" : "text-slate-200 dark:text-zinc-850 group-hover:text-primary/30"
                    )}>
                      {idx === 0 ? <Shield size={14} /> : <Sparkles size={14} />}
                    </div>

                    {/* Avatar / Portrait container (Larger image) */}
                    <div className="relative mt-2 mb-3">
                      <div className={cn(
                        "absolute -inset-2 bg-gradient-to-tr from-primary to-primary/40 rounded-full blur transition-opacity duration-400",
                        isActive ? "opacity-35" : "opacity-0 group-hover:opacity-10"
                      )} />
                      
                      <div className={cn(
                        "relative w-28 h-28 rounded-full overflow-hidden transition-all duration-300",
                        "border-4 shadow-inner",
                        isActive ? "border-primary/60 scale-102" : "border-slate-100 dark:border-zinc-805"
                      )}>
                        {member.image ? (
                          <img 
                            src={member.image} 
                            alt={member.name} 
                            referrerPolicy="no-referrer"
                            className={cn(
                              "w-full h-full object-cover transition-transform duration-750 ease-out group-hover:scale-105",
                              isActive ? "grayscale-0 opacity-100" : "grayscale opacity-70"
                            )}
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center">
                            <User className={cn(
                              "w-12 h-12 transition-colors",
                              isActive ? "text-primary" : "text-slate-300 dark:text-zinc-650"
                            )} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Typography Information */}
                    <div className="space-y-1 mb-4 flex-grow flex flex-col justify-center">
                      <h3 
                        className={cn(
                          "text-base font-black transition-colors leading-tight",
                          isActive ? "text-primary" : "text-slate-900 dark:text-white"
                        )}
                        dangerouslySetInnerHTML={{ __html: member.name }}
                      />
                      <p 
                        className="text-[9.5px] uppercase tracking-wider font-bold text-slate-450 dark:text-zinc-500"
                        dangerouslySetInnerHTML={{ __html: member.role }}
                      />
                    </div>

                    {/* Interactive Action Tab */}
                    <div className="w-full pt-3 border-t border-slate-100 dark:border-white/5 mt-auto">
                      {hasLink ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(member.link, '_blank');
                          }}
                          className={cn(
                            "w-full py-2 px-3 rounded-xl",
                            isActive ? "bg-gradient-themed text-white" : "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white",
                            "text-[9px] font-bold uppercase tracking-wider",
                            "transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          )}
                        >
                          <Facebook className="w-3 h-3" />
                          <span>Connect Profile</span>
                        </button>
                      ) : (
                        <div className="py-1.5 text-[9px] font-bold text-slate-300 dark:text-zinc-750 uppercase tracking-widest flex items-center justify-center gap-1">
                          <Globe className="w-2.5 h-2.5 text-primary" />
                          <span>KH Dream Team</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center items-center gap-2 mt-4">
          {ORIGINAL_TEAM.map((_, idx) => (
            <button
              key={`team-dot-${idx}`}
              onClick={() => scrollToMember(idx)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                idx === activeIndex 
                  ? "w-6 bg-primary" 
                  : "w-2 bg-slate-200 dark:bg-zinc-800"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
