import React from 'react';
import { LandingPage, useCMS } from '../context/CMSContext';
import { isPopupLink, getPopupSlug } from './CustomPopupRenderer';
import { motion } from 'framer-motion';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import { getYouTubeId, getVimeoId, toTitleCase } from '../lib/utils';
import { Star, CheckCircle2, Zap, ArrowRight, MessageCircle, Quote, Image, Type, Camera, Video, Send, Sliders, List, BarChart, Briefcase, MapPin, Users, Phone, FileText, Box, Code } from 'lucide-react';
import AbstractBackground from './AbstractBackground';
import SectionBackground from './SectionBackground';
import Navbar from './Navbar';
import BlockContent from './BlockContent';
import { SEO } from './SEO';

// @ts-ignore
const ResponsiveGridLayout = WidthProvider(Responsive);

const Counter: React.FC<{ value: string; color?: string }> = ({ value, color }) => {
  const [count, setCount] = React.useState(0);
  const target = parseInt(value.replace(/[^0-9]/g, '')) || 0;
  const suffix = value.replace(/[0-9]/g, '');
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (nodeRef.current) {
      observer.observe(nodeRef.current);
    }

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = target;
    if (start === end) return;

    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, isInView]);

  return (
    <div ref={nodeRef} style={{ color }}>
      {count}{suffix}
    </div>
  );
};

const SectionRenderer: React.FC<{ section: any; page: LandingPage }> = ({ section, page }) => {
  const blocks = section.blocks || [];
  
  // Sort blocks by y, then x to maintain logical reader flow and native visual grid placement
  const sortedBlocks = [...blocks].sort((a: any, b: any) => {
    const ay = a.layout?.y ?? 0;
    const ax = a.layout?.x ?? 0;
    const by = b.layout?.y ?? 0;
    const bx = b.layout?.x ?? 0;
    return (ay * 12 + ax) - (by * 12 + bx);
  });

  const getColSpanClass = (w: number) => {
    const rounded = Math.min(12, Math.max(1, Math.round(w)));
    const spans: Record<number, string> = {
      1: 'col-span-12 sm:col-span-6 md:col-span-1',
      2: 'col-span-12 sm:col-span-6 md:col-span-2',
      3: 'col-span-12 sm:col-span-6 md:col-span-3',
      4: 'col-span-12 sm:col-span-6 md:col-span-4',
      5: 'col-span-12 md:col-span-5',
      6: 'col-span-12 md:col-span-6',
      7: 'col-span-12 md:col-span-7',
      8: 'col-span-12 md:col-span-8',
      9: 'col-span-12 md:col-span-9',
      10: 'col-span-12 md:col-span-10',
      11: 'col-span-12 md:col-span-11',
      12: 'col-span-12 md:col-span-12',
    };
    return spans[rounded] || 'col-span-12';
  };

  return (
    <div className="grid grid-cols-12 gap-6 w-full items-start">
      {sortedBlocks.map((block: any) => {
        const spanClass = getColSpanClass(block.layout?.w ?? 12);
        return (
          <div 
            key={block.id} 
            className={`group/block relative w-full h-full ${spanClass}`}
            style={{
              padding: block.styles?.padding,
              borderRadius: block.styles?.borderRadius || '24px',
              backgroundColor: block.styles?.backgroundColor,
              color: block.styles?.textColor,
              fontFamily: block.styles?.fontFamily,
              textAlign: block.styles?.textAlign,
              boxShadow: block.styles?.boxShadow || 'none',
              borderWidth: block.styles?.borderWidth,
              borderColor: block.styles?.borderColor,
              borderStyle: block.styles?.borderWidth ? 'solid' : 'none',
              opacity: block.styles?.opacity,
              zIndex: block.styles?.zIndex,
            }}
          >
            <BlockContent block={block} page={page} />
          </div>
        );
      })}
    </div>
  );
};

interface LandingPageRendererProps {
  page: LandingPage;
  isFullPage?: boolean;
  slot?: string;
  onHomeClick?: () => void;
  onBlogClick?: () => void;
  onOffersClick?: () => void;
  onLandingPageClick?: (slug: string) => void;
  defaultBackground?: any;
}

const LandingPageRenderer: React.FC<LandingPageRendererProps> = ({ 
  page, 
  isFullPage = true, 
  slot,
  onHomeClick,
  onBlogClick,
  onOffersClick,
  onLandingPageClick,
  defaultBackground
}) => {
  const { data } = useCMS();
  
  const handleHomeClick = onHomeClick || (() => window.location.href = '/');
  const handleBlogClick = onBlogClick || (() => window.location.href = '/blog');
  const handleOffersClick = onOffersClick || (() => window.location.href = '/hot-deals');
  const handleLandingPageClick = onLandingPageClick || ((slug: string) => window.location.href = `/${slug}`);

  // Helper to determine if a color is light or dark
  const isLightColor = (color?: string) => {
    if (!color) return true;
    if (color === 'transparent') return true;
    
    // Simple hex to luminance conversion
    const hex = color.replace('#', '');
    if (hex.length !== 6 && hex.length !== 3) return true;
    
    const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
    const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
    
    // Relative luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  // If we have sections, render them
  if (page.sections && page.sections.length > 0 && !slot) {
    const sortedSections = [...page.sections].sort((a, b) => a.order - b.order);
    const firstSection = sortedSections[0];
    
    const sectionBg = firstSection?.settings?.backgroundColor;
    const isFirstSectionLight = isLightColor(sectionBg);

    const navbarTheme = page.settings?.navbarSettings?.theme === 'auto' || !page.settings?.navbarSettings?.theme
      ? (isFirstSectionLight ? 'light' : 'dark')
      : page.settings?.navbarSettings?.theme;

    return (
      <div className="landing-page-renderer w-full min-h-screen overflow-x-hidden">
        <SEO 
          title={page.seo?.title || page.title} 
          description={page.seo?.description} 
          keywords={page.seo?.keywords}
          ogImage={page.seo?.ogImage}
          noIndex={page.seo?.noIndex}
        />
        <div className={isFullPage && !page.settings?.hideNavbar ? 'pt-[60px]' : ''}>
          {sortedSections.map((section, index) => (
            <section 
              key={section.id}
              className={`relative w-full overflow-hidden group/section ${section.settings?.fullWidth ? '' : 'py-12 md:py-20'}`}
              style={{
                color: section.settings?.textColor || 'inherit',
                paddingTop: section.settings?.paddingTop,
                paddingBottom: section.settings?.paddingBottom,
                backdropFilter: section.settings?.glassEffect ? `blur(${section.settings.blurAmount || '12px'})` : 'none',
                WebkitBackdropFilter: section.settings?.glassEffect ? `blur(${section.settings.blurAmount || '12px'})` : 'none',
              }}
            >
              <SectionBackground config={section.settings?.backgroundConfig || defaultBackground} />
              
              {section.settings?.backgroundImage && !section.settings?.backgroundConfig && (
                <div className="absolute inset-0 -z-10">
                  <img 
                    src={section.settings.backgroundImage || null} 
                    referrerPolicy="no-referrer" 
                    className="w-full h-full object-cover opacity-20" 
                    alt="" 
                  />
                </div>
              )}
              {section.settings?.backgroundPattern && section.settings?.backgroundPattern !== 'none' && !section.settings?.backgroundConfig && (
                <AbstractBackground 
                  variant={section.settings.backgroundPattern as any} 
                  position={['top-left', 'top-right', 'bottom-left', 'bottom-right'][index % 4] as any}
                  opacity={section.settings.backgroundPatternOpacity ?? 0.05}
                  className="z-0 opacity-[0.8] dark:opacity-[0.6]"
                />
              )}
              <div className={`relative z-10 mx-auto ${section.settings?.containerWidth || 'max-w-7xl'} ${section.settings?.fullWidth ? 'px-0' : 'px-4 md:px-8'}`}>
                <SectionRenderer section={section} page={page} />
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }

  const filteredBlocks = (slot 
    ? (page.blocks || []).filter(b => b.slot === slot)
    : (page.blocks || [])).filter(b => b && b.layout);

  if (filteredBlocks.length === 0 && slot) return null;

  const pageSettings = page.settings || {};
  const isFullWidth = pageSettings.fullWidth ?? !isFullPage;

  const navbarTheme = pageSettings.navbarSettings?.theme === 'auto' || !pageSettings.navbarSettings?.theme
    ? (isLightColor(pageSettings.backgroundColor) ? 'light' : 'dark')
    : pageSettings.navbarSettings?.theme;

  const getAnimationVariants = (type: string) => {
    switch (type) {
      case 'fade': return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
      case 'slideUp': return { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } };
      case 'slideDown': return { hidden: { opacity: 0, y: -50 }, visible: { opacity: 1, y: 0 } };
      case 'slideLeft': return { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } };
      case 'slideRight': return { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } };
      case 'zoomIn': return { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } };
      case 'zoomOut': return { hidden: { opacity: 0, scale: 1.2 }, visible: { opacity: 1, scale: 1 } };
      default: return { hidden: {}, visible: {} };
    }
  };

  const layouts = React.useMemo(() => ({
    lg: filteredBlocks.map(b => ({ i: b.id, ...b.layout, static: true }))
  }), [filteredBlocks]);

  return (
    <div 
      className={isFullPage ? `landing-page-renderer w-full min-h-screen overflow-x-hidden ${pageSettings.fullWidth ? '' : 'py-12 md:py-20'}` : "w-full"}
      style={{ 
        backgroundColor: pageSettings.backgroundColor || 'transparent',
        color: pageSettings.textColor || 'inherit',
        position: 'relative'
      }}
    >
      <SEO 
        title={page.seo?.title || page.title} 
        description={page.seo?.description} 
        keywords={page.seo?.keywords}
        ogImage={page.seo?.ogImage}
        noIndex={page.seo?.noIndex}
      />

      <SectionBackground config={pageSettings.backgroundConfig || defaultBackground} />

      {pageSettings.backgroundImage && !pageSettings.backgroundConfig && (
        <div className="absolute inset-0 -z-10">
          <img 
            src={pageSettings.backgroundImage || null} 
            referrerPolicy="no-referrer" 
            className="w-full h-full object-cover opacity-20" 
            alt="" 
          />
        </div>
      )}
      {pageSettings.backgroundPattern && pageSettings.backgroundPattern !== 'none' && !pageSettings.backgroundConfig && (
        <AbstractBackground 
          variant={pageSettings.backgroundPattern as any} 
          position="center"
          opacity={pageSettings.backgroundPatternOpacity ?? 0.05}
          className="z-0"
        />
      )}
      <div className={`relative z-10 ${isFullPage ? (isFullWidth ? "w-full" : "max-w-7xl mx-auto p-4 md:p-8") : "w-full"} ${isFullPage && !pageSettings.hideNavbar ? 'pt-[60px]' : ''}`}>
        <div className="grid grid-cols-12 gap-6 items-start w-full">
        {filteredBlocks.map((block) => {
          const w = block.layout?.w ?? 12;
          const getColSpanClass = (widthVal: number) => {
            const roundedVal = Math.min(12, Math.max(1, Math.round(widthVal)));
            const spans: Record<number, string> = {
              1: 'col-span-12 sm:col-span-6 md:col-span-1',
              2: 'col-span-12 sm:col-span-6 md:col-span-2',
              3: 'col-span-12 sm:col-span-6 md:col-span-3',
              4: 'col-span-12 sm:col-span-6 md:col-span-4',
              5: 'col-span-12 md:col-span-5',
              6: 'col-span-12 md:col-span-6',
              7: 'col-span-12 md:col-span-7',
              8: 'col-span-12 md:col-span-8',
              9: 'col-span-12 md:col-span-9',
              10: 'col-span-12 md:col-span-10',
              11: 'col-span-12 md:col-span-11',
              12: 'col-span-12 md:col-span-12',
            };
            return spans[roundedVal] || 'col-span-12';
          };
          const spanClass = getColSpanClass(w);
          return (
            <motion.div 
              key={block.id} 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: block.animation?.once ?? true }}
              variants={getAnimationVariants(block.animation?.type || 'none')}
              transition={{ 
                duration: block.animation?.duration || 0.5, 
                delay: block.animation?.delay || 0 
              }}
              className={`relative overflow-hidden group/block ${spanClass} ${block.content.isClickable ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (block.content?.isClickable) {
                  const { buttonType, type, whatsapp, link, phone } = block.content || {};
                  const actionType = buttonType || type || 'link';
                  const waNumber = whatsapp || data.general.whatsapp;
                  const targetLink = link || '#';

                  if (actionType === 'whatsapp') {
                    window.open(`https://wa.me/${waNumber}`, '_blank');
                  } else if (actionType === 'phone') {
                    window.location.href = `tel:${phone || data.general.phone}`;
                  } else {
                    if (targetLink.startsWith('http')) {
                      window.open(targetLink, '_blank');
                    } else {
                      window.location.href = targetLink;
                    }
                  }
                }
              }}
              style={{
                backgroundColor: block.styles?.backgroundColor,
                color: block.styles?.color || block.styles?.textColor,
                fontFamily: block.styles?.fontFamily,
                textAlign: block.styles?.textAlign,
                padding: block.styles?.padding,
                borderRadius: block.styles?.borderRadius || '24px',
                boxShadow: block.styles?.boxShadow || 'none',
                borderWidth: block.styles?.borderWidth,
                borderColor: block.styles?.borderColor,
                borderStyle: block.styles?.borderWidth ? 'solid' : 'none',
                opacity: block.styles?.opacity,
                zIndex: block.styles?.zIndex,
                transform: block.styles?.transform,
                width: block.styles?.width,
                height: block.styles?.height,
              }}
            >
            {block.type === 'container' && (
              <div 
                className="h-full w-full overflow-hidden relative"
                style={{ 
                  backgroundColor: block.content.backgroundColor || '#ffffff',
                  padding: `${block.content.padding || 0}px`,
                  borderRadius: `${block.content.borderRadius || 0}px`,
                  borderWidth: `${block.content.borderWidth || 0}px`,
                  borderColor: block.content.borderColor || 'transparent',
                  borderStyle: block.content.borderWidth ? 'solid' : 'none',
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                  backgroundImage: block.content.bgUrl ? `url(${block.content.bgUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <LandingPageRenderer 
                  page={{ ...page, blocks: page.blocks.filter(b => b.parentId === block.id) }} 
                  isFullPage={false} 
                />
              </div>
            )}

            {block.type === 'html' && (
              <iframe 
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        body { margin: 0; font-family: sans-serif; overflow: hidden; }
                        ${block.content.css || ''}
                      </style>
                    </head>
                    <body>
                      ${block.content.code || ''}
                      <script>
                        try {
                          ${block.content.js || ''}
                        } catch (e) {
                          console.error('Dynamic Code Error:', e);
                        }
                      </script>
                    </body>
                  </html>
                `}
                className="w-full h-full border-none overflow-auto no-scrollbar"
                title="Dynamic Content"
              />
            )}

            {block.type === 'video' && (
              <div 
                className="w-full h-full overflow-hidden bg-black flex items-center justify-center group relative"
                style={{ 
                  borderRadius: block.styles?.borderRadius || '0px',
                  boxShadow: block.styles?.boxShadow || 'none'
                }}
              >
                {block.content.url ? (
                  <div className="w-full h-full relative">
                    {getYouTubeId(block.content.url) ? (
                      <iframe
                        key={block.content.url}
                        src={`https://www.youtube.com/embed/${getYouTubeId(block.content.url)}?autoplay=${block.content.autoplay ? 1 : 0}&mute=${block.content.muted ? 1 : 0}&loop=${block.content.loop ? 1 : 0}&playlist=${getYouTubeId(block.content.url)}&controls=1`}
                        className="absolute inset-0 w-full h-full"
                        allow="autoplay; encrypted-media"
                      />
                    ) : getVimeoId(block.content.url) ? (
                      <iframe
                        key={block.content.url}
                        src={`https://player.vimeo.com/video/${getVimeoId(block.content.url)}?autoplay=${block.content.autoplay ? 1 : 0}&muted=${block.content.muted ? 1 : 0}&loop=${block.content.loop ? 1 : 0}`}
                        className="absolute inset-0 w-full h-full"
                        allow="autoplay; encrypted-media"
                      />
                    ) : (
                      <video 
                        key={block.content.url}
                        src={block.content.url || undefined} 
                        autoPlay={block.content.autoplay} 
                        muted={block.content.muted} 
                        loop={block.content.loop} 
                        playsInline 
                        preload="auto"
                        className="w-full h-full"
                        style={{ objectFit: (block.styles?.objectFit as any) || 'cover' }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2 text-white/20">
                    <Video size={48} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Video URL Required</span>
                  </div>
                )}
                {block.content.overlay && (
                   <div className="absolute inset-0 bg-black/40 pointer-events-none" />
                )}
              </div>
            )}

            {block.type === 'hero' && (
              <div 
                className="relative h-full flex items-center justify-center overflow-hidden group/hero"
                style={{ borderRadius: block.styles?.borderRadius || '0px' }}
              >
                {block.content.bgType === 'video' ? (
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    {block.content.bgVideoUrl && (
                      <>
                        {getYouTubeId(block.content.bgVideoUrl) ? (
                          <iframe
                            key={block.content.bgVideoUrl}
                            src={`https://www.youtube.com/embed/${getYouTubeId(block.content.bgVideoUrl)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeId(block.content.bgVideoUrl)}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1&playsinline=1`}
                            className="absolute inset-0 w-full h-[120%] -top-[10%] pointer-events-none"
                            style={{ width: '100vw', height: '56.25vw', minHeight: '120vh', minWidth: '177.77vh', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                            allow="autoplay; encrypted-media"
                          />
                        ) : getVimeoId(block.content.bgVideoUrl) ? (
                          <iframe
                            key={block.content.bgVideoUrl}
                            src={`https://player.vimeo.com/video/${getVimeoId(block.content.bgVideoUrl)}?autoplay=1&muted=1&loop=1&background=1`}
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{ width: '100vw', height: '56.25vw', minHeight: '120vh', minWidth: '177.77vh', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                            allow="autoplay; encrypted-media"
                          />
                        ) : (
                          <video 
                            key={block.content.bgVideoUrl}
                            src={block.content.bgVideoUrl || undefined} 
                            autoPlay 
                            muted 
                            loop 
                            playsInline 
                            preload="auto"
                            className="w-full h-full object-cover" 
                          />
                        )}
                      </>
                    )}
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px]" />
                  </div>
                ) : block.content.bgUrl && (
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={block.content.bgUrl || null} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover/hero:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
                  </div>
                )}
                <div className={`${isFullWidth ? 'w-full px-6 md:px-12' : 'container mx-auto px-6'} relative z-10 text-center`}>
                  <motion.h1 
                    initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true }}
                    className="text-[clamp(2.5rem,10vw,4.5rem)] md:text-[clamp(4.5rem,10vw,8.5rem)] font-black tracking-tighter mb-6 leading-[0.9] md:leading-[0.85] not-italic normal-case drop-shadow-2xl"
                    style={{ color: block.styles?.textColor || '#ffffff' }}
                  >
                    {toTitleCase(block.content.title)}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-base md:text-xl lg:text-3xl font-semibold max-w-3xl mx-auto leading-relaxed md:leading-snug opacity-90 balance shadow-black/20"
                    style={{ color: block.styles?.textColor ? `${block.styles.textColor}CC` : 'rgba(255,255,255,0.9)' }}
                  >
                    {toTitleCase(block.content.subtitle)}
                  </motion.p>
                  {block.content.buttonText && (
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (block.content.buttonType === 'whatsapp') {
                          window.open(`https://wa.me/${block.content.whatsapp || data.general.whatsapp}`, '_blank');
                        } else {
                          const link = block.content.link || '#';
                          if (isPopupLink(link)) {
                            window.dispatchEvent(new CustomEvent('open-custom-popup', { detail: { slug: getPopupSlug(link) } }));
                          } else if (link.startsWith('http')) {
                            window.open(link, '_blank');
                          } else {
                            window.location.href = link;
                          }
                        }
                      }}
                      className="mt-10 px-10 py-5 rounded-full text-[12px] md:text-sm font-black normal-case tracking-[0.2em] md:tracking-[0.4em] transition-all shadow-2xl flex items-center gap-3 mx-auto btn-themed border border-white/10"
                      style={{
                        backgroundColor: block.styles?.buttonColor || 'var(--primary-color)',
                        color: block.styles?.buttonTextColor || '#ffffff'
                      }}
                    >
                      {block.content.buttonType === 'whatsapp' && <MessageCircle size={18} />}
                      <span>{toTitleCase(block.content.buttonText)}</span>
                    </motion.button>
                  )}
                </div>
              </div>
            )}

            {block.type === 'button' && (
              <div className={`h-full p-4 flex items-center ${
                block.content.alignment === 'left' ? 'justify-start' : 
                block.content.alignment === 'right' ? 'justify-end' : 'justify-center'
              }`}>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (block.content.type === 'whatsapp') {
                      window.open(`https://wa.me/${block.content.whatsapp || data.general.whatsapp}`, '_blank');
                    } else {
                      const link = block.content.link || '#';
                      if (isPopupLink(link)) {
                        window.dispatchEvent(new CustomEvent('open-custom-popup', { detail: { slug: getPopupSlug(link) } }));
                      } else if (link.startsWith('http')) {
                        window.open(link, '_blank');
                      } else {
                        window.location.href = link;
                      }
                    }
                  }}
                  className="px-8 py-4 rounded-2xl text-xs font-black normal-case tracking-widest shadow-xl flex items-center gap-2 btn-themed"
                  style={{
                    backgroundColor: block.styles?.buttonColor || 'var(--primary-color)',
                    color: block.styles?.buttonTextColor || '#ffffff'
                  }}
                >
                  {block.content.type === 'whatsapp' && <MessageCircle size={14} />}
                  {toTitleCase(block.content.text)}
                </motion.button>
              </div>
            )}

            {block.type === 'text' && (
              <div className="h-full p-8 flex items-center">
                <div 
                  className="prose prose-sm md:prose-lg dark:prose-invert max-w-none w-full"
                  style={{ 
                    color: block.styles?.color || block.styles?.textColor || 'inherit',
                    fontFamily: block.styles?.fontFamily || 'inherit'
                  }}
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              </div>
            )}

            {block.type === 'image' && (
              <div className="h-full">
                <div 
                  className="h-full w-full overflow-hidden relative"
                  style={{ 
                    borderRadius: block.styles?.borderRadius || '0px',
                    boxShadow: block.styles?.boxShadow || 'none'
                  }}
                >
                  <img 
                    src={block.content.url || null} 
                    alt={block.content.caption} 
                    className="w-full h-full"
                    style={{ objectFit: (block.styles?.objectFit as any) || 'cover' }}
                    referrerPolicy="no-referrer"
                  />
                  {block.content.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-md text-center text-[8px] font-black uppercase tracking-widest text-white">
                      {block.content.caption}
                    </div>
                  )}
                </div>
              </div>
            )}

            {block.type === 'cta' && (
              <div className="h-full">
                <div 
                  className="h-full w-full p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-xl"
                  style={{ 
                    backgroundColor: block.styles?.backgroundColor || 'var(--color-primary)',
                    color: block.styles?.textColor || '#ffffff',
                    borderRadius: block.styles?.borderRadius || '0px'
                  }}
                >
                  <h2 className="text-2xl md:text-4xl font-black normal-case tracking-tight" style={{ color: 'inherit' }}>
                    {toTitleCase(block.content.title)}
                  </h2>
                  <button 
                    onClick={() => {
                      if (block.content.buttonType === 'whatsapp') {
                        window.open(`https://wa.me/${block.content.whatsapp || data.general.whatsapp}`, '_blank');
                      } else {
                        const link = block.content.link || '#';
                        if (isPopupLink(link)) {
                          window.dispatchEvent(new CustomEvent('open-custom-popup', { detail: { slug: getPopupSlug(link) } }));
                        } else if (link.startsWith('http')) {
                          window.open(link, '_blank');
                        } else {
                          window.location.href = link;
                        }
                      }
                    }}
                    className="px-8 py-4 rounded-xl text-[10px] font-black normal-case tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2 btn-themed"
                    style={{
                      backgroundColor: block.styles?.buttonColor || '#ffffff',
                      color: block.styles?.buttonTextColor || 'var(--primary-color)'
                    }}
                  >
                    {block.content.buttonType === 'whatsapp' && <MessageCircle size={14} />}
                    {toTitleCase(block.content.buttonText)}
                  </button>
                </div>
              </div>
            )}

            {block.type === 'slider' && (
              <div className="h-full">
                <div 
                  className="h-full w-full overflow-hidden relative group bg-slate-100 dark:bg-zinc-800"
                  style={{ borderRadius: block.styles?.borderRadius || '0px' }}
                >
                   <motion.div 
                     className="flex h-full"
                     animate={{ x: [0, `-${(block.content.images?.length - 1) * 100}%`, 0] }}
                     transition={{ 
                        duration: (block.content.images?.length || 1) * 5, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                     }}
                   >
                      {(block.content.images || []).map((img: string, idx: number) => (
                         <img 
                           key={`${block.id}-img-${idx}`} 
                           src={img || null} 
                           alt="" 
                           className="w-full h-full object-cover shrink-0"
                           referrerPolicy="no-referrer"
                         />
                      ))}
                   </motion.div>
                </div>
              </div>
            )}

            {block.type === 'features' && (
              <div className="h-full p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {(block.content.items || []).map((item: any, idx: number) => (
                      <motion.div 
                        key={`${block.id}-feature-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-3xl border shadow-sm hover:shadow-xl transition-all group"
                        style={{
                          backgroundColor: block.styles?.backgroundColor || '#ffffff',
                          borderColor: block.styles?.borderColor || 'rgba(0,0,0,0.05)',
                        }}
                      >
                         <div 
                           className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                           style={{
                             backgroundColor: `${block.styles?.buttonColor || 'var(--color-primary)'}1A`,
                             color: block.styles?.buttonColor || 'var(--color-primary)'
                           }}
                         >
                            {(() => {
                               const Icon = {
                                  Zap, Star, CheckCircle2, MessageCircle, Quote, ArrowRight, 
                                  Image, Type, Camera, Send, Sliders, List, BarChart, Briefcase, MapPin, Users, Phone, FileText
                               }[item.icon] || Zap;
                               return <Icon size={24} />;
                            })()}
                         </div>
                         <h3 className="text-lg font-black normal-case tracking-tight mb-2" style={{ color: block.styles?.textColor || 'inherit' }}>{toTitleCase(item.title)}</h3>
                         <p className="text-sm font-medium leading-relaxed" style={{ color: block.styles?.textColor ? `${block.styles.textColor}CC` : 'inherit' }}>{item.desc}</p>
                      </motion.div>
                   ))}
                </div>
              </div>
            )}

            {block.type === 'stats' && (
              <div className="h-full p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                   {(block.content.items || []).map((item: any, idx: number) => (
                      <motion.div 
                        key={`${block.id}-stat-${idx}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-2"
                      >
                         <div className="text-3xl md:text-5xl font-black tracking-tighter">
                           <Counter value={item.value} color={block.styles?.buttonColor || 'var(--primary-color)'} />
                         </div>
                         <div className="text-[10px] font-black normal-case tracking-[0.2em]" style={{ color: block.styles?.textColor || '#94a3b8' }}>{toTitleCase(item.label)}</div>
                      </motion.div>
                   ))}
                </div>
              </div>
            )}

            {block.type === 'services' && (
              <div className="h-full p-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white normal-case tracking-tighter mb-8 text-center">{toTitleCase(block.content.title)}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {data.serviceCards.slice(0, block.content.limit || 6).map((service, idx) => (
                      <div key={service.id} className="group relative aspect-[4/5] overflow-hidden rounded-[32px] border border-slate-200 dark:border-zinc-800">
                         <img src={service.imageUrl || null} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                         <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="text-xl font-black text-white normal-case tracking-tight mb-2">{toTitleCase(service.title)}</h3>
                            <p className="text-xs text-white/70 font-bold line-clamp-2">{service.description}</p>
                         </div>
                      </div>
                   ))}
                </div>
              </div>
            )}

            {block.type === 'destinations' && (
              <div className="h-full p-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white normal-case tracking-tighter mb-8 text-center">{toTitleCase(block.content.title)}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {data.catalogue.slice(0, block.content.limit || 3).map((dest, idx) => (
                      <div 
                        key={dest.id} 
                        onClick={() => {
                          window.history.pushState({}, '', `/destinations/${dest.id}`);
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                        className="group cursor-pointer bg-white dark:bg-[#121214] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.1)] transition-all duration-500 border border-slate-100 dark:border-white/5 flex flex-col hover:-translate-y-2"
                      >
                         <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-zinc-800 relative">
                            {dest.img && (
                              <img src={dest.img || null} alt={dest.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute top-4 right-4 z-10">
                              <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-primary flex items-center gap-1">
                                <Star size={10} fill="currentColor" />
                                <span>{dest.rating || '4.9'}</span>
                              </div>
                            </div>
                         </div>
                         <div className="p-8 space-y-4 text-left">
                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg">
                               {dest.label || 'Destination'}
                            </span>
                            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight group-hover:text-primary transition-colors line-clamp-1">{toTitleCase(dest.title)}</h3>
                            <div className="pt-2 flex items-center text-[10px] font-black text-primary uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform duration-500">
                              <span>Explore Now</span>
                              <ArrowRight size={14} className="ml-2" />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
                <div className="mt-12 text-center">
                  <button
                    onClick={() => {
                      window.history.pushState({}, '', '/destinations');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-400 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <span>View All Packages</span>
                    <ArrowRight size={12} strokeWidth={3} />
                  </button>
                </div>
              </div>
            )}

            {block.type === 'blog' && (
              <div className="h-full p-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white normal-case tracking-tighter mb-8 text-center">{toTitleCase(block.content.title)}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {data.blogPosts.slice(0, block.content.limit || 3).map((post, idx) => (
                      <div 
                        key={post.id} 
                        onClick={() => {
                          window.history.pushState({}, '', `/blog/${post.id}`);
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                        className="group cursor-pointer bg-white dark:bg-[#121214] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.1)] transition-all duration-500 border border-slate-100 dark:border-white/5 flex flex-col hover:-translate-y-2"
                      >
                         <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-zinc-800 relative">
                            {post.images?.[0] && (
                              <img src={post.images[0] || null} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </div>
                         <div className="p-8 space-y-4 text-left">
                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg">
                               Article
                            </span>
                            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight group-hover:text-primary transition-colors line-clamp-2">{toTitleCase(post.title)}</h3>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.date}</span>
                               <ArrowRight size={16} className="text-primary opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
                <div className="mt-12 text-center">
                  <button
                    onClick={() => {
                      window.history.pushState({}, '', '/blog');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-400 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <span>View All Blog Stories</span>
                    <ArrowRight size={12} strokeWidth={3} />
                  </button>
                </div>
              </div>
            )}

            {block.type === 'reviews' && (
              <div className="h-full p-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white normal-case tracking-tighter mb-8 text-center">{toTitleCase(block.content.title)}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {data.reviews.slice(0, 3).map((review, idx) => (
                      <div key={review.id} className="p-8 bg-slate-50 dark:bg-zinc-800/50 rounded-[32px] border border-slate-100 dark:border-zinc-800 relative">
                         <Quote className="absolute top-6 right-6 text-primary/10" size={48} />
                         <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                               <Star key={`${block.id}-review-${review.id}-star-${i}`} size={12} className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                            ))}
                         </div>
                         <p className="text-sm text-slate-600 dark:text-zinc-400 font-medium mb-6 leading-relaxed">"{review.text}"</p>
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                               {review.name.charAt(0)}
                            </div>
                            <div>
                               <div className="text-[10px] font-black text-slate-900 dark:text-white normal-case tracking-widest">{toTitleCase(review.name)}</div>
                               <div className="text-[8px] font-bold text-slate-400 normal-case tracking-widest">{review.date}</div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
              </div>
            )}

            {block.type === 'team' && (
              <div className="h-full p-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white normal-case tracking-tighter mb-8 text-center">{toTitleCase(block.content.title)}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   {data.team.map((member, idx) => (
                      <div key={member.id} className="text-center group">
                         <div className="aspect-square rounded-full overflow-hidden mb-4 border-4 border-white dark:border-zinc-800 shadow-xl mx-auto max-w-[150px]">
                            <img src={member.image || null} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                         </div>
                         <h3 className="text-sm font-black text-slate-900 dark:text-white normal-case tracking-tight">{toTitleCase(member.name)}</h3>
                         <p className="text-[9px] font-bold text-primary normal-case tracking-widest">{toTitleCase(member.role)}</p>
                      </div>
                   ))}
                </div>
              </div>
            )}
          </motion.div>
        );
        })}
      </div>
      </div>
    </div>
  );
};

export default LandingPageRenderer;
