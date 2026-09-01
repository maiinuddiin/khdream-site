import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { useCMS, CustomPopup } from '../context/CMSContext';
import LandingPageRenderer from './LandingPageRenderer';

export const isPopupLink = (link?: string): boolean => {
  if (!link) return false;
  const cleanLink = link.trim().toLowerCase();
  return cleanLink.startsWith('popup:') || cleanLink.startsWith('/popup-') || cleanLink.startsWith('#popup-') || cleanLink.includes('popup:');
};

export const getPopupSlug = (link?: string): string => {
  if (!link) return '';
  const cleanLink = link.trim();
  if (cleanLink.startsWith('popup:')) return cleanLink.replace('popup:', '');
  if (cleanLink.startsWith('/popup-')) return cleanLink.replace('/popup-', '');
  if (cleanLink.startsWith('#popup-')) return cleanLink.replace('#popup-', '');
  const match = cleanLink.match(/popup:([a-zA-Z0-9-_]+)/i);
  if (match) return match[1];
  return cleanLink;
};

const CustomPopupRenderer: React.FC = () => {
  const { data } = useCMS();
  const [activePopup, setActivePopup] = useState<CustomPopup | null>(null);

  useEffect(() => {
    // 1. Intercept manual programmatically triggered popups
    const handleOpenPopup = (e: Event) => {
      const customEvent = e as CustomEvent<{ slug: string }>;
      const slugOrId = customEvent.detail?.slug;
      if (!slugOrId) return;

      const popups = data.customPopups || [];
      const foundPopup = popups.find(p => p.slug === slugOrId || p.id === slugOrId);
      if (foundPopup && foundPopup.isPublished) {
        setActivePopup(foundPopup);
      }
    };

    window.addEventListener('open-custom-popup', handleOpenPopup);

    // 2. Intercept any click event on the page (for a-tags or elements with popup triggers)
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('a, button, [data-popup-link]') as HTMLElement | null;
      if (!interactiveEl) return;

      let link = '';
      if (interactiveEl.tagName === 'A') {
        const href = interactiveEl.getAttribute('href');
        if (href) link = href;
      } else if (interactiveEl.getAttribute('data-popup-link')) {
        link = interactiveEl.getAttribute('data-popup-link') || '';
      }

      if (isPopupLink(link)) {
        e.preventDefault();
        e.stopPropagation();
        const slug = getPopupSlug(link);
        const popups = data.customPopups || [];
        const foundPopup = popups.find(p => p.slug === slug || p.id === slug);
        if (foundPopup && foundPopup.isPublished) {
          setActivePopup(foundPopup);
        }
      }
    };

    document.addEventListener('click', handleGlobalClick, true);

    // 3. Handle Auto-trigger Delays configured on custom popups
    const activeDelays: number[] = [];
    const popups = data.customPopups || [];
    popups.forEach(popup => {
      if (popup.isPublished && popup.settings?.autoTriggerDelay && popup.settings.autoTriggerDelay > 0) {
        const timer = window.setTimeout(() => {
          // Verify we aren't already fully editing in Admin or have another popup active
          if (window.location.pathname.startsWith('/admin')) return;
          setActivePopup(popup);
        }, popup.settings.autoTriggerDelay * 1000);
        activeDelays.push(timer);
      }
    });

    return () => {
      window.removeEventListener('open-custom-popup', handleOpenPopup);
      document.removeEventListener('click', handleGlobalClick, true);
      activeDelays.forEach(clearTimeout);
    };
  }, [data.customPopups]);

  if (!activePopup) return null;

  // Determine width config for spacing
  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
    full: 'max-w-[95vw] h-[90vh]'
  }[activePopup.settings?.width || 'md'] || 'max-w-md';

  // Format custom popups as a temporary virtual landing page to let LandingPageRenderer handle full aesthetic grid layouts
  const virtualLandingPage = {
    id: activePopup.id,
    title: activePopup.title,
    slug: `popup-${activePopup.slug}`,
    blocks: activePopup.blocks || [],
    sections: activePopup.sections || (activePopup.blocks?.length ? [{
      id: 'default-popup-sec',
      title: 'Main Content',
      order: 0,
      blocks: activePopup.blocks,
      settings: { backgroundColor: activePopup.settings?.backgroundColor || '#ffffff', paddingTop: '0', paddingBottom: '0', fullWidth: true }
    }] : []),
    settings: {
      backgroundColor: activePopup.settings?.backgroundColor || '#ffffff',
      textColor: activePopup.settings?.textColor || '#000000',
      backgroundConfig: activePopup.settings?.backgroundConfig
    },
    isPublished: activePopup.isPublished,
    createdAt: activePopup.createdAt
  };

  const backdropBlurClass = activePopup.settings?.backdropBlur !== false ? 'backdrop-blur-md' : '';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActivePopup(null)}
          className={`absolute inset-0 transition-all duration-300 ${backdropBlurClass}`}
          style={{ backgroundColor: activePopup.settings?.backdropColor || 'rgba(0,0,0,0.65)' }}
        />

        {/* Modal container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full ${widthClasses} bg-white dark:bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh] border border-slate-100 dark:border-zinc-800`}
          style={{ 
            backgroundColor: activePopup.settings?.backgroundColor || undefined,
            color: activePopup.settings?.textColor || undefined
          }}
        >
          {/* Close button option */}
          {activePopup.settings?.showCloseButton !== false && (
            <button
              onClick={() => setActivePopup(null)}
              className="absolute top-4 right-4 z-[100001] p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all scale-100 hover:scale-105"
              aria-label="Close Popup"
            >
              <X size={16} />
            </button>
          )}

          {/* Render container scrolling dynamically */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-6">
            <LandingPageRenderer 
              page={virtualLandingPage}
              isFullPage={false}
              onLandingPageClick={(slug) => {
                setActivePopup(null);
                window.history.pushState({}, '', `/${slug}`);
                window.dispatchEvent(new Event('popstate'));
              }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomPopupRenderer;
