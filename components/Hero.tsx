import React, { useState, useEffect } from 'react';
import { Plane, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../context/CMSContext';
import { toTitleCase, isVideoUrl, getYouTubeId, getVimeoId } from '../lib/utils';

import PromoSlider from './PromoSlider';

interface HeroProps {
  t: (path: string) => any;
  currentLang: string;
}

const getLanguageFontFamily = (text?: string): string | undefined => {
  if (!text) return undefined;
  if (/[\u0980-\u09FF]/.test(text)) {
    return 'var(--font-bangla), sans-serif';
  }
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'var(--font-arabic), sans-serif';
  }
  return undefined;
};

const getLanguageFontClass = (text?: string): string => {
  if (!text) return '';
  if (/[\u0980-\u09FF]/.test(text)) {
    return 'font-bangla';
  }
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'font-arabic';
  }
  return 'font-montserrat';
};

const Hero: React.FC<HeroProps> = ({ t, currentLang }) => {
  const { data } = useCMS();
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const messages = data.hero.length > 0 ? data.hero : t('hero');

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setIsAnimating(false);
      }, 800);
    }, 7000);
    return () => clearInterval(timer);
  }, [messages.length]);

  const globalHeroVideo = data.general?.heroVideo;
  const isGlobalVideo = globalHeroVideo && (globalHeroVideo.match(/\.(mp4|webm|ogg|mov|m4v)$/i) || globalHeroVideo.includes('hero.mp4') || globalHeroVideo.includes('video') || getYouTubeId(globalHeroVideo) || getVimeoId(globalHeroVideo));

  const hexToRgb = (hexStr: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hexStr.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const overlayColor = data.general?.heroVideoOverlayColor || '#020617';
  const overlayOpacityVal = data.general?.heroVideoOverlayOpacity !== undefined ? data.general.heroVideoOverlayOpacity : 85;
  const overlayOpacity = overlayOpacityVal / 100;
  const rgb = hexToRgb(overlayColor) || { r: 2, g: 6, b: 23 };
  const borderOpacity = Math.min(1, overlayOpacity * 1.1);
  const midOpacity = overlayOpacity;

  const overlayStyle = {
    background: `linear-gradient(to bottom, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${borderOpacity}), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${midOpacity}), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${borderOpacity}))`
  };

  return (
    <div className="w-full relative h-[78vh] sm:h-[82vh] md:h-[86vh] lg:h-[90vh] min-h-[500px] sm:min-h-[560px] md:min-h-[640px] lg:min-h-[720px] flex items-center justify-center overflow-hidden font-montserrat antialiased bg-[#020410]">
      {/* GLOBAL BACKGROUND ELEMENTS (Static or Shared) */}
      <div className="absolute inset-0 z-0">
        {/* Persistent Dynamic Dark Screen Overlay */}
        <div 
          className="absolute inset-0 z-20 pointer-events-none" 
          style={overlayStyle}
        />

        {/* Global Video Layer */}
        {isGlobalVideo && (
          <div className="absolute inset-0 z-0">
            {(() => {
              const ytId = getYouTubeId(globalHeroVideo);
              const vimeoId = getVimeoId(globalHeroVideo);
              const isDirect = globalHeroVideo.match(/\.(mp4|webm|ogg|mov|m4v)$/i) || globalHeroVideo.includes('video') || globalHeroVideo.includes('hero.mp4');

              if (ytId) {
                return (
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`}
                      className="w-[300%] h-[100%] ml-[-100%] md:w-full md:h-full md:ml-0 md:scale-[1.35]"
                      allow="autoplay; encrypted-media"
                      frameBorder="0"
                    />
                  </div>
                );
              }
              if (vimeoId) {
                return (
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    <iframe
                      src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&background=1`}
                      className="w-full h-full scale-[1.35]"
                      allow="autoplay; fullscreen"
                      frameBorder="0"
                    />
                  </div>
                );
              }
              if (isDirect) {
                return (
                  <video
                    src={globalHeroVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                );
              }
              return null;
            })()}
          </div>
        )}

        {/* Slide-specific Background Layer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 z-10"
          >
            {(() => {
              const bgUrl = messages[index]?.bgUrl;
              if (!bgUrl || bgUrl === globalHeroVideo) return null;

              const bgIsVideo = bgUrl && (bgUrl.match(/\.(mp4|webm|ogg|mov|m4v)$/i) || bgUrl.includes('hero.mp4') || bgUrl.includes('video'));
              const bgYtId = getYouTubeId(bgUrl);
              const bgVimeoId = getVimeoId(bgUrl);

              if (bgYtId) {
                return (
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    <iframe
                      src={`https://www.youtube.com/embed/${bgYtId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${bgYtId}&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`}
                      className="w-[300%] h-[100%] ml-[-100%] md:w-full md:h-full md:ml-0 md:scale-[1.35]"
                      allow="autoplay; encrypted-media"
                      frameBorder="0"
                    />
                  </div>
                );
              }
              if (bgVimeoId) {
                return (
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                    <iframe
                      src={`https://player.vimeo.com/video/${bgVimeoId}?autoplay=1&muted=1&background=1`}
                      className="w-full h-full scale-[1.35]"
                      allow="autoplay; fullscreen"
                      frameBorder="0"
                    />
                  </div>
                );
              }
              if (bgIsVideo) {
                return (
                  <video
                    src={bgUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                );
              }
              return (
                <img 
                  src={bgUrl || "https://images.unsplash.com/photo-1544013585-446b17208b08?q=80&w=1200&auto=format&fit=crop"} 
                  alt="" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              );
            })()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 w-full relative z-10 pt-16 sm:pt-20 md:pt-24 pb-20 sm:pb-24">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Headline, Subtitle, and CTA unified inside a single AnimatePresence */}
          <div className="relative w-full flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center w-full"
              >
                {/* Pre-Title (Small, letter-spaced topper) */}
                {messages[index]?.preTitle && messages[index].preTitle.trim() !== "" && (
                  <span 
                    className={`text-white text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.15em] sm:tracking-[0.25em] mb-1.5 sm:mb-2 opacity-95 drop-shadow-lg luxury-text-gradient ${getLanguageFontClass(messages[index].preTitle)}`}
                  >
                    {messages[index].preTitle}
                  </span>
                )}

                {/* Main Heading Text */}
                {messages[index]?.title && messages[index].title.trim() !== "" && (
                  <h1 
                    className={`font-extrabold sm:font-black md:font-black text-[clamp(1.8rem,5.5vw,3.2rem)] md:text-[clamp(2.5rem,4.5vw,4.4rem)] leading-[1.1] tracking-tight text-white drop-shadow-[0_15px_45px_rgba(0,0,0,0.45)] max-w-4xl text-center mb-2 md:mb-3 ${getLanguageFontClass(messages[index].title)}`}
                  >
                    {(() => {
                      const title = messages[index].title;
                      const words = title.split(' ');
                      if (words.length <= 1) return title;
                      const lastWord = words[words.length - 1];
                      const remainingWords = words.slice(0, -1).join(' ');
                      const gradient = data.general?.heroTitleLastWordColor || `linear-gradient(to right, var(--primary-color), #f97316)`;
                      return (
                        <span>
                          {remainingWords}{' '}
                          <span 
                            style={{ 
                              backgroundImage: gradient,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                              display: 'inline-block',
                              paddingLeft: '0.04em',
                              paddingRight: '0.22em',
                              paddingBottom: '0.12em',
                              marginRight: '-0.18em',
                              verticalAlign: 'bottom',
                              fontWeight: 950
                            }}
                          >
                            {lastWord}
                          </span>
                        </span>
                      );
                    })()}
                  </h1>
                )}

                {/* Subtitle / Description Text */}
                {(() => {
                  const subText = messages[index]?.subtitle || messages[index]?.description;
                  if (!subText || subText.trim() === '') return null;
                  return (
                    <p 
                      className={`text-xs sm:text-sm md:text-base font-semibold tracking-wide leading-relaxed text-center text-white drop-shadow-md max-w-sm sm:max-w-md md:max-w-2xl px-4 opacity-95 mb-4 sm:mb-5 ${getLanguageFontClass(subText)}`}
                      dangerouslySetInnerHTML={{ __html: subText }}
                    />
                  );
                })()}

                {/* Main Action Call-to-Action Button */}
                {(() => {
                  const isBtnDisabled = data.general.buttonSettings?.hero?.disabled;
                  const activeBtnText = messages[index]?.buttonText !== undefined 
                    ? messages[index]?.buttonText 
                    : (data.general.buttonSettings?.hero?.text || 'Explore Now');

                  if (isBtnDisabled || !activeBtnText || activeBtnText.trim() === '') return null;

                  return (
                    <button 
                      onClick={() => {
                        // Check slide-specific link override first
                        const slideLink = messages[index]?.link;
                        if (slideLink && slideLink.trim() !== '') {
                          if (slideLink.startsWith('http')) {
                            window.open(slideLink, '_blank');
                          } else if (slideLink.startsWith('#')) {
                            const elem = document.getElementById(slideLink.substring(1));
                            if (elem) {
                              elem.scrollIntoView({ behavior: 'smooth' });
                            } else {
                              window.location.hash = slideLink;
                            }
                          } else {
                            window.location.href = slideLink;
                          }
                          return;
                        }

                        // Otherwise fall back to general button settings
                        const settings = data.general.buttonSettings?.hero;
                        if (settings?.type === 'whatsapp') {
                          window.open(`https://wa.me/${settings.whatsapp || data.general.whatsapp}`, '_blank');
                        } else if (settings?.type === 'phone') {
                          window.location.href = `tel:${settings.phone || data.general.phone}`;
                        } else {
                          const link = settings?.link || '#packages';
                          if (link.startsWith('http')) {
                            window.open(link, '_blank');
                          } else if (link.startsWith('#')) {
                            const elem = document.getElementById(link.substring(1));
                            if (elem) {
                              elem.scrollIntoView({ behavior: 'smooth' });
                            } else {
                              window.location.hash = link;
                            }
                          } else {
                            window.location.href = link;
                          }
                        }
                      }}
                      className={`px-6 sm:px-8 md:px-10 py-2.5 sm:py-3.5 md:py-4 btn-themed rounded-md text-[9px] sm:text-[10px] font-bold tracking-[0.2em] flex items-center gap-2 shadow-2xl shadow-black/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mb-4 sm:mb-5 normal-case ${getLanguageFontClass(activeBtnText)}`}
                    >
                      <span>{activeBtnText}</span>
                      <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  );
                })()}
              </motion.div>
            </AnimatePresence>

            {/* Slider Dots Navigation indicators */}
            <div className="flex items-center gap-1.5 z-20">
              {messages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (isAnimating || index === i) return;
                    setIsAnimating(true);
                    setIndex(i);
                    setTimeout(() => setIsAnimating(false), 800);
                  }}
                  className={`h-0.5 rounded-full transition-all duration-500 ${index === i ? 'w-4 bg-white/100 shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'w-1 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
          
      {/* Full Width Promo Slider at bottom of Hero */}
      {data.visibility?.promoSlider !== false && (
        <div className="absolute bottom-12 sm:bottom-16 md:bottom-24 left-0 w-full z-30 pointer-events-auto bg-black/5 backdrop-blur-sm">
          <PromoSlider />
        </div>
      )}
    </div>
  );
};

export default Hero;
