import React, { useState, useEffect, memo, useCallback, useRef, Suspense, lazy, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Features from './components/Features';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PromoSlider from './components/PromoSlider';
import SuccessStorySection from './components/SuccessStorySection';
import GoogleReviews from './components/GoogleReviews';
import OfficeLocations from './components/OfficeLocations';
import ServicesBar from './components/ServicesBar';
import TeamSection from './components/TeamSection';
import FAQ from './components/FAQ';
import PartnerBar from './components/PartnerBar';
import PrivacyPopup from './components/PrivacyPopup';
import FloatingActions from './components/FloatingActions';
import { VisitorCouponPopup } from './components/VisitorCouponPopup';
import LoadingScreen from './components/LoadingScreen';
import SectionBackground from './components/SectionBackground';
import HotelSearchInline from './components/HotelSearchInline';
import VisaInline from './components/VisaInline';
import BusinessSetupInline from './components/BusinessSetupInline';
import ServiceCardsSection from './components/ServiceCardsSection';
import LoginModal from './components/LoginModal';
import AnimatedHeader from './components/AnimatedHeader';
import ScrollReveal from './components/ScrollReveal';
import AbstractBackground from './components/AbstractBackground';
import WhySaudiArabia from './components/WhySaudiArabia';
import { SEO } from './components/SEO';
import { Footer } from './components/Footer';
import LandingPageRenderer from './components/LandingPageRenderer';
import CustomPopupRenderer from './components/CustomPopupRenderer';
import SwipeHint from './components/SwipeHint';
import GradientDivider from './components/GradientDivider';
import Counter from './components/Counter';
import { TopBarNotification, PopupNotification } from './components/Notifications';
import { getYouTubeId, getVimeoId, toTitleCase } from './lib/utils';
import * as LucideIcons from 'lucide-react';
import { Layout, Landmark, FileText, ChevronRight, Calendar, Star, ArrowRight, ShieldCheck, Clock, Zap, Globe, Plane, MapPin, Compass, Hotel, Youtube, User, Mail, Send, Share2, Loader2 } from 'lucide-react';
import { TRANSLATIONS } from './translations';
import { CMSProvider, useCMS, CMSData } from './context/CMSContext';

// Lazy loaded heavy components
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const BlogPage = lazy(() => import('./components/BlogPage'));
const InvoiceSystem = lazy(() => import('./components/InvoiceSystem'));
const PublicInvoiceView = lazy(() => import('./components/PublicInvoiceView'));
const DestinationsCatalogue = lazy(() => import('./components/DestinationsCatalogue'));
const HotDealsPage = lazy(() => import('./components/HotDealsPage'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const IqamaInquiry = lazy(() => import('./components/IqamaInquiry'));
const BioHubPage = lazy(() => import('./components/BioHubPage'));
const BusinessServicesPage = lazy(() => import('./components/BusinessServicesPage'));
const CompanyProfilePage = lazy(() => import('./components/CompanyProfilePage').then(module => ({ default: module.CompanyProfilePage })));

const ComponentLoader = memo(() => (
  <div className="min-h-[400px] w-full flex flex-col items-center justify-center space-y-4">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
    <p className="text-[10px] font-black normal-case tracking-widest text-slate-400">Loading Module...</p>
  </div>
));

// Memoized Components to prevent unnecessary re-renders
const MemoizedFeatures = memo(Features);
const MemoizedServicesBar = memo(ServicesBar);
const MemoizedFooter = memo(Footer);
const MemoizedNavbar = memo(Navbar);
const MemoizedHero = memo(Hero);
const MemoizedPromoSlider = memo(PromoSlider);

const GeometricBackground: React.FC<{ data: CMSData }> = memo(({ data }) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none transition-colors duration-700">
      {/* Base layer that transitions */}
      <div className="absolute inset-0 bg-[#fdfdfd] dark:bg-[#02041a] transition-colors duration-700" />
      
      {/* Light Mode Specific Accents */}
      <div className="absolute inset-0 opacity-100 dark:opacity-0 transition-opacity duration-700">
        <div className="absolute inset-0 opacity-[0.03]"
             style={{ 
               backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")',
               backgroundSize: '200px 200px',
             }} />
      </div>
      
      {/* Dark Mode Specific Accents */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
             style={{ 
               backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")',
               backgroundSize: '300px 300px',
             }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.2)_0%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-transparent to-[#020617]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,78,216,0.1),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(17,24,39,0.5),transparent_80%)]" />
      </div>
      
      {data.general.bgUrl && (
        <div className="absolute inset-0 opacity-10 dark:opacity-[0.04] mix-blend-overlay">
          <img src={data.general.bgUrl || null} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="" />
        </div>
      )}

      {/* Persistent Soft Patterns at the very base layer */}
      <AbstractBackground variant="refined-grid" opacity={0.03} />
    </div>
  );
});

const LocalizedModernPatterns: React.FC = memo(() => {
  const patterns = React.useMemo(() => [
    { id: 2, variant: 'noise' as const, position: 'full' as const, opacity: 0.01, className: 'fixed' },
    { id: 4, variant: 'travel-icons' as const, position: 'full' as const, opacity: 0.02, className: 'fixed' },
    { id: 5, variant: 'glass-blobs' as const, position: 'full' as const, opacity: 0.04, className: 'fixed' },
  ], []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 text-slate-200/40 dark:text-white/5">
      {patterns.map((p) => (
        <AbstractBackground 
          key={p.id}
          variant={p.variant}
          position={p.position}
          opacity={p.opacity}
          className={p.className}
        />
      ))}
    </div>
  );
});

const AppContent: React.FC = () => {
  const { data, currentUser, updateData, isLoaded } = useCMS();
  const [pathname, setPathname] = useState(window.location.pathname);
  const [waLinkToOpen, setWaLinkToOpen] = useState<string | null>(null);
  const [waCountdown, setWaCountdown] = useState<number | null>(null);

  // High speed scroll / slider dragging performance optimizer
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastTime = Date.now();
    let isFast = false;
    let debounceTimer: any = null;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const timeDelta = currentTime - lastTime;
      const scrollDelta = Math.abs(currentScrollY - lastScrollY);

      if (timeDelta > 0) {
        // Calculate speed in px / ms
        const velocity = scrollDelta / timeDelta;
        
        // Exceeding 1.2 px/ms means user is scrolling very rapidly (dragging slider, scrollbar dragging, pagination jump)
        if (velocity > 1.2) {
          if (!isFast) {
            isFast = true;
            document.documentElement.setAttribute('data-fast-scroll', 'true');
            (window as any).__isFastScrolling = true;
          }
        } else if (velocity < 0.5) {
          // If we slow down, re-enable sleek normal-speed transitions
          if (isFast) {
            isFast = false;
            document.documentElement.removeAttribute('data-fast-scroll');
            (window as any).__isFastScrolling = false;
          }
        }
      }

      lastScrollY = currentScrollY;
      lastTime = currentTime;

      // Clean up after scroll finishes
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        isFast = false;
        document.documentElement.removeAttribute('data-fast-scroll');
        (window as any).__isFastScrolling = false;
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(debounceTimer);
    };
  }, []);

  useEffect(() => {
    if (waLinkToOpen) {
      setWaCountdown(4);
    } else {
      setWaCountdown(null);
    }
  }, [waLinkToOpen]);

  useEffect(() => {
    if (waCountdown === null) return;
    if (waCountdown <= 0) {
      if (waLinkToOpen) {
        try {
          const originalOpen = (window as any).__originalOpen || window.open;
          originalOpen.call(window, waLinkToOpen, '_blank');
        } catch (err) {
          window.location.href = waLinkToOpen;
        }
        setWaLinkToOpen(null);
      }
      return;
    }

    const interval = setInterval(() => {
      setWaCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [waCountdown, waLinkToOpen]);

  useEffect(() => {
    const originalOpen = window.open;
    if (!(window as any).__originalOpen) {
      (window as any).__originalOpen = originalOpen;
    }

    window.open = function (url, target, features) {
      if (typeof url === 'string' && (url.includes('wa.me') || url.includes('whatsapp.com') || url.includes('api.whatsapp.com'))) {
        setWaLinkToOpen(url);
        return null;
      }
      return originalOpen.call(window, url, target, features);
    };

    const handleLinkClick = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      if (target && target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href && (href.includes('wa.me') || href.includes('whatsapp.com') || href.includes('api.whatsapp.com'))) {
          e.preventDefault();
          setWaLinkToOpen(href);
        }
      }
    };
    document.addEventListener('click', handleLinkClick, true);

    return () => {
      window.open = originalOpen;
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, []);
  
  const [view, setView] = useState<'landing' | 'admin' | 'blog' | 'deals' | 'invoice' | 'public-invoice' | 'destinations' | 'hot-deals' | 'iqama' | 'bio' | 'business-services' | 'company-profile'>(() => {
    const rawPath = window.location.pathname.replace(/\/+$/, '') || '/';
    const hash = window.location.hash.replace(/^#\/?/, '/');
    const currentHostname = window.location.hostname;
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('inv')) return 'public-invoice';
    if (currentHostname.startsWith('admin.') || currentHostname.includes('.admin.')) return 'admin';
    
    const resolveViewFromPath = (p: string) => {
      if (p === '/admin' || p.startsWith('/admin/')) return 'admin';
      if (p === '/blog' || p.startsWith('/blog/')) return 'blog';
      if (p === '/destinations' || p.startsWith('/destinations/')) return 'destinations';
      if (p === '/hot-deals' || p.startsWith('/hot-deals/')) return 'hot-deals';
      if (p === '/invoice' || p.startsWith('/invoice/')) return 'invoice';
      if (p === '/iqama-inquiry' || p.startsWith('/iqama-inquiry/')) return 'iqama';
      if (p === '/bio' || p === '/profile' || p === '/hub' || p === '/help') return 'bio';
      if (p === '/company-profile') return 'company-profile';
      if (p === '/business-services' || p === '/services') return 'business-services';
      return null;
    };

    if (hash) {
      const v = resolveViewFromPath(hash);
      if (v) return v;
    }
    const pv = resolveViewFromPath(rawPath);
    if (pv) return pv;

    return 'landing';
  });

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '/');
      if (hash) setPathname(hash);
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    const rawPath = pathname.replace(/\/+$/, '') || '/';
    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#\/?/, '/') : '';
    const path = hash || rawPath;
    const currentHostname = window.location.hostname;
    const isAdminSubdomain = currentHostname.startsWith('admin.') || currentHostname.includes('.admin.');

    if (isAdminSubdomain) {
      if (view !== 'admin') {
        setView('admin');
      }
      return;
    }
    
    if (path === '/admin' || path.startsWith('/admin/')) {
      if (view !== 'admin') setView('admin');
    }
    else if (path === '/blog' || path.startsWith('/blog/')) setView('blog');
    else if (path === '/destinations' || path.startsWith('/destinations/')) setView('destinations');
    else if (path === '/hot-deals' || path.startsWith('/hot-deals/')) setView('hot-deals');
    else if (path === '/invoice' || path.startsWith('/invoice/')) setView('invoice');
    else if (path === '/iqama-inquiry' || path.startsWith('/iqama-inquiry/')) setView('iqama');
    else if (path === '/bio' || path === '/profile' || path === '/hub' || path === '/help') setView('bio');
    else if (path === '/company-profile') setView('company-profile');
    else if (path === '/business-services' || path === '/services') setView('business-services');
    else if (path === '/' || path === '/index.html') {
      setView('landing');
    }
    else if (data?.landingPages?.some(p => `/${p.slug}` === path)) {
      if (view !== 'admin') setView('landing');
    }
  }, [pathname, data?.landingPages, view]);

  useEffect(() => {
    const token = localStorage.getItem('kh_admin_token');
    if (currentUser?.role === 'Admin' || currentUser?.role === 'Manager') {
      const token = localStorage.getItem('kh_admin_token');
      if (!token) {
        console.warn("Security Alert: Admin session active but token missing. Re-authentication required for API access.");
      }
    }
  }, [currentUser]);

  const [publicInvoiceId, setPublicInvoiceId] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [initialDestId, setInitialDestId] = useState<string | null>(null);
  const [initialPostId, setInitialPostId] = useState<string | null>(null);
  const [initialDealId, setInitialDealId] = useState<string | null>(null);
  const [mappedLandingPage, setMappedLandingPage] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, view === 'admin' ? 200 : 800);
    return () => clearTimeout(timer);
  }, [view]);

  useEffect(() => {
    const hostname = window.location.hostname;
    const mappings = data.general.domainMappings || {};
    
    // Check for custom domain mapping
    const mappedId = mappings[hostname];
    if (mappedId) {
      const page = data.landingPages?.find(p => p.id === mappedId);
      if (page) {
        setMappedLandingPage(page);
      }
    }
  }, [data.general.domainMappings, data.landingPages]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kh_dream_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  }); 
  const [activeService, setActiveService] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const getFirstAvailableService = (): string | null => {
    if (data.visibility?.serviceVisa !== false) return 'visas';
    if (data.visibility?.serviceHotel !== false) return 'hotels';
    if (data.visibility?.serviceBusiness !== false) return 'setup';
    return null;
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    
    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      const isNowMobile = e.matches;
      setIsMobile(isNowMobile);
      
      if (!isNowMobile) {
        setIsExpanded(true);
        // Default to first available if not on mobile and no service selected
        setActiveService(prev => prev || getFirstAvailableService());
      } else {
        setIsExpanded(false);
      }
    };

    // Initial check
    handleResize(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, [data.visibility]);

  // Sync active service if its visibility changes
  useEffect(() => {
    if (!isLoaded) return;
    const firstSvc = getFirstAvailableService();
    
    if (!isMobile) {
      const isCurrentValid = activeService && (
        (activeService === 'visas' && data.visibility?.serviceVisa !== false) ||
        (activeService === 'hotels' && data.visibility?.serviceHotel !== false) ||
        (activeService === 'setup' && data.visibility?.serviceBusiness !== false)
      );
      if (!isCurrentValid) {
        setActiveService(firstSvc);
      }
    } else {
      const isCurrentDisabled = activeService && (
        (activeService === 'visas' && data.visibility?.serviceVisa === false) ||
        (activeService === 'hotels' && data.visibility?.serviceHotel === false) ||
        (activeService === 'setup' && data.visibility?.serviceBusiness === false)
      );
      if (isCurrentDisabled) {
        setActiveService(null);
      }
    }
  }, [isLoaded, isMobile, activeService, data.visibility?.serviceVisa, data.visibility?.serviceHotel, data.visibility?.serviceBusiness]);
  const [hasHero, setHasHero] = useState(true);
  
  const searchSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heroVisible = data.visibility?.hero !== false && view === 'landing';
    setHasHero(heroVisible);
  }, [data.visibility?.hero, view]);

  useEffect(() => {
    // This effect used to handle the secret right-click login feature
    // which has been removed as per user request.
  }, [currentUser]);

  useEffect(() => {
    // Only track if not in admin view
    if (view === 'admin') return;
    // Wait for CMS to load so we can accurately detect logged-in users
    if (!isLoaded) return;
    // Ignore direct visits from logged-in users/admins
    if (currentUser) {
      console.log("[Analytics] Skipping visit log for logged-in user / admin:", currentUser.username);
      return;
    }

    const trackVisit = async () => {
      try {
        const isRepeat = localStorage.getItem('kh_visitor_id') !== null;
        if (!isRepeat) {
          localStorage.setItem('kh_visitor_id', Date.now().toString());
        }

        const deviceType = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
        
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRepeat, deviceType })
        });
      } catch (err) {
        // Fail silently to not disrupt UX
        console.error('Analytics failed:', err);
      }
    };

    trackVisit();
  }, [view, isLoaded, currentUser]);

  useEffect(() => {
    // Subdomain detection for admin access
    const hostname = window.location.hostname;
    const isAdminSubdomain = hostname.startsWith('admin.') || hostname.includes('.admin.');
    
    if (isAdminSubdomain) {
      if (!currentUser && isLoaded) {
        // If on admin subdomain and not logged in, render the regular full-page login view and avoid modal overlaps
        console.log("[ADMIN] Restricted access on subdomain, rendering full-page Login.");
        setIsLoginModalOpen(false); // Do not open popup
        if (view !== 'admin') setView('admin');
      } else if (currentUser) {
        if (view !== 'admin') {
          console.log("[ADMIN] Admin subdomain detected, setting view to admin.");
          setView('admin');
        }
      }
    } else if (view === 'admin' && !currentUser && isLoaded) {
      // Standalone admin view page, don't show custom popup modals on top of a full login page!
      setIsLoginModalOpen(false);
    } else if (view === 'admin' && currentUser) {
      console.log("[ADMIN] Admin access granted for user:", currentUser.username);
    }
  }, [currentUser, view, isLoaded]);

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.startsWith('admin.')) return; // Don't redirect admin subdomain
    
    const redirects = data.subdomainRedirects || [];
    
    const matchingRedirect = redirects.find(r => 
      r.isActive && 
      (hostname.startsWith(`${r.subdomain}.`) || hostname === r.subdomain)
    );
    
    if (matchingRedirect) {
      if (matchingRedirect.targetUrl.startsWith('http')) {
        window.location.href = matchingRedirect.targetUrl;
      } else {
        // Internal redirect
        if (pathname !== matchingRedirect.targetUrl) {
          window.history.pushState({}, '', matchingRedirect.targetUrl);
          setPathname(matchingRedirect.targetUrl);
        }
      }
    }
  }, [data.subdomainRedirects, pathname]);

  // Remove manual favicon update as it is handled by SEO component with Helmet

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const t = useCallback((path: string) => {
    const keys = path.split('.');
    let result: any = TRANSLATIONS.EN;
    for (const key of keys) {
      if (result[key] === undefined) return path;
      result = result[key];
    }
    return result;
  }, []);

  const renderHomeSection = (sectionId: string) => {
    switch (sectionId) {
      case 'search':
        return data.visibility?.search !== false ? (
          <section key="section-search" className="relative z-50 w-full -mt-8 md:-mt-12 mb-8 px-4 font-sans" ref={searchSectionRef}>
            <div className="max-w-6xl mx-auto">
              <div className="w-full bg-white dark:bg-[#121214] rounded-md border border-slate-200/60 dark:border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] flex flex-col relative overflow-visible">
                <div className="w-full overflow-visible">
                  <MemoizedServicesBar
                    activeId={activeService}
                    setActiveId={(id) => setActiveService(id)}
                    t={t}
                  />
                </div>

                {activeService && (
                  <div key={activeService} className="pb-3 md:pb-4 lg:pb-6 px-4 md:px-6 animate-in fade-in slide-in-from-top-2 duration-500 relative z-10">
                    {activeService === 'visas' && <VisaInline />}
                    {activeService === 'hotels' && <HotelSearchInline />}
                    {activeService === 'setup' && <BusinessSetupInline />}
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null;

      case 'stats':
        return data.visibility?.stats !== false ? (
          <React.Fragment key="section-stats">
            <section className="relative py-6 md:py-10 overflow-hidden group/stats-sec bg-[#fdfdfd] dark:bg-[#060608]">
              <SectionBackground config={data.general.sectionBackgrounds?.['why-choose-us']} />
              <AbstractBackground variant="waves" opacity="opacity-[0.05]" />
              <AbstractBackground variant="circuit" opacity={0.1} />
              <AbstractBackground variant="geometric" opacity={0.08} />
              <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {[
                    { label: data.stats?.successfulVisasLabel || 'Successful Visas', value: data.stats?.successfulVisas || '15,000+' },
                    { label: data.stats?.businessSetupsLabel || 'Business Setups', value: data.stats?.businessSetups || '2,500+' },
                    { label: data.stats?.globalPartnersLabel || 'Global Partners', value: data.stats?.globalPartners || '120+' },
                    { label: data.stats?.globalReachLabel || 'Global Reach', value: data.stats?.globalReach || '45+' }
                  ].map((stat, i) => (
                    <div key={`stat-main-${i}`} className="text-center space-y-1">
                      <div className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tighter text-primary">
                        <Counter value={stat.value} />
                      </div>
                      <div className="text-[9px] font-black normal-case tracking-widest text-slate-400 dark:text-slate-500" dangerouslySetInnerHTML={{ __html: toTitleCase(stat.label) }} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <LandingPageRenderer 
              page={{ id: 'home', slug: '', title: 'Home', blocks: data.homeBlocks || [], sections: data.homeSections || [], settings: data.homeSettings, isPublished: true, createdAt: '' }} 
              slot="after-stats" 
              isFullPage={false} 
              defaultBackground={data.general.sectionBackgrounds?.['home-architect']}
            />
          </React.Fragment>
        ) : null;

      case 'services':
        return data.visibility?.services !== false ? (
          <React.Fragment key="section-services">
            <GradientDivider />
            <section className="relative overflow-hidden group/services-sec bg-[#fdfdfd] dark:bg-[#0a0a0c] pt-12 pb-4 md:pt-16 md:pb-6">
              {/* Massive Background Text */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/3 text-[20vw] font-black text-slate-900/[0.03] dark:text-white/[0.005] select-none pointer-events-none uppercase tracking-tighter whitespace-nowrap leading-none italic z-0 font-montserrat">
                Exclusive
              </div>
              <SectionBackground config={data.general.sectionBackgrounds?.['services']} />
              <AbstractBackground variant="refined-grid" opacity={0.12} />
              <ScrollReveal variant="slide" direction="right">
                <ServiceCardsSection />
              </ScrollReveal>
            </section>
            <LandingPageRenderer 
              page={{ id: 'home', slug: '', title: 'Home', blocks: data.homeBlocks || [], sections: data.homeSections || [], settings: data.homeSettings, isPublished: true, createdAt: '' }} 
              slot="after-services" 
              isFullPage={false} 
              defaultBackground={data.general.sectionBackgrounds?.['home-architect']}
            />
          </React.Fragment>
        ) : null;

      case 'destinations':
        return data.visibility?.destinations !== false ? (
          <React.Fragment key="section-destinations">
            <GradientDivider />
            <section className="relative overflow-hidden group/dest-sec bg-[#fdfdfd] dark:bg-[#060608] pt-12 pb-4 md:pt-16 md:pb-6">
              {/* Massive Background Text */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 text-[18vw] font-black text-slate-900/[0.03] dark:text-white/[0.01] select-none pointer-events-none uppercase tracking-tighter whitespace-nowrap leading-none italic z-0 font-montserrat">
                Destinations
              </div>
              <SectionBackground config={data.general.sectionBackgrounds?.['destinations']} />
              <AbstractBackground variant="mesh" opacity={0.05} />
              <AbstractBackground variant="topo" opacity={0.03} />
              <ScrollReveal direction="up">
                <DestinationsCatalogue initialId={initialDestId} onClearInitial={() => setInitialDestId(null)} />
              </ScrollReveal>
            </section>
            <LandingPageRenderer 
              page={{ id: 'home', slug: '', title: 'Home', blocks: data.homeBlocks || [], sections: data.homeSections || [], settings: data.homeSettings, isPublished: true, createdAt: '' }} 
              slot="after-destinations" 
              isFullPage={false} 
              defaultBackground={data.general.sectionBackgrounds?.['home-architect']}
            />
          </React.Fragment>
        ) : null;

      case 'whySaudiArabia':
        return data.visibility?.whySaudiArabia !== false ? (
          <WhySaudiArabia key="section-why-saudi" data={data} />
        ) : null;

      case 'blog':
        return data.visibility?.blog !== false ? (
          <React.Fragment key="section-blog">
            <GradientDivider />
            <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-12 transition-colors duration-700 relative overflow-hidden group/blog-sec bg-[#fdfdfd] dark:bg-[#030303]">
              {/* Massive Background Text */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 text-[18vw] font-black text-slate-900/[0.03] dark:text-white/[0.01] select-none pointer-events-none uppercase tracking-tighter whitespace-nowrap leading-none italic z-0 font-montserrat">
                Stories
              </div>
              <SectionBackground config={data.general.sectionBackgrounds?.['blog']} />
              <AbstractBackground variant="topo" opacity={0.1} />
              <AbstractBackground variant="travel-icons" opacity={0.12} />
              <AbstractBackground variant="mesh" opacity={0.05} />
              <div className="max-w-7xl mx-auto">
                {(!data.general.sectionTitles?.blog || 
                  data.general.sectionTitles?.blog?.title !== "" || 
                  data.general.sectionTitles?.blog?.subtitle !== "") && (
                  <ScrollReveal variant="blur">
                    <AnimatedHeader 
                      title={data.general.sectionTitles?.blog?.title !== undefined ? data.general.sectionTitles?.blog?.title : "Recommended Travel Stories"} 
                      subtitle={data.general.sectionTitles?.blog?.subtitle}
                      {...data.general.sectionTitles?.blog}
                    />
                  </ScrollReveal>
                )}

                <ScrollReveal delay={0.4}>
                  <div className="flex gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 overflow-x-auto md:overflow-x-visible no-scrollbar pb-8 md:pb-0 snap-x snap-mandatory px-4 -mx-4 md:px-0 md:mx-0">
                    {(data.blogPosts || []).slice(0, 3).map((post) => (
                      <div 
                        key={post?.id} 
                        onClick={() => {
                          if (post?.id) {
                            setInitialPostId(post.id);
                            window.history.pushState({}, '', `/blog/${post.id}`);
                            setPathname(`/blog/${post.id}`);
                            setView('blog');
                          }
                        }}
                        className="group cursor-pointer flex flex-col text-left flex-shrink-0 w-[calc(100vw-80px)] md:w-auto snap-center bg-white dark:bg-zinc-900/40 rounded-md overflow-hidden border border-slate-100 dark:border-white/[0.03] shadow-sm hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/20 transition-all duration-500"
                      >
                        <div className="relative w-full aspect-[16/10] overflow-hidden transition-transform duration-500">
                          <img 
                            src={post?.images?.[0] || "https://picsum.photos/seed/" + (post?.id || Math.random()) + "/800/600"} 
                            alt={post?.title || ""} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700" 
                          />
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-white/90 dark:bg-black/60 backdrop-blur-md text-[#FF4D6D] text-[9px] font-black normal-case tracking-widest rounded-full shadow-sm">
                              {post?.tags && post.tags.length > 0 ? post.tags[0] : 'Travel'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6 md:p-8 space-y-4 flex-1 flex flex-col">
                          <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-snug transition-colors group-hover:text-primary line-clamp-2 normal-case tracking-tight" dangerouslySetInnerHTML={{ __html: toTitleCase(post?.title || '') }} />
                          
                          <div className="mt-auto pt-4 border-t border-slate-50 dark:border-white/[0.02] flex items-center justify-between">
                            <p className="text-[9px] font-bold text-slate-400 normal-case tracking-widest flex items-center">
                              {post?.authorName || 'Staff'} <span className="mx-2 opacity-30">•</span> {post?.date || ''}
                            </p>
                            <span className="text-[9px] font-black normal-case tracking-tighter text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                              Read More →
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <SwipeHint />
                </ScrollReveal>
                
                <ScrollReveal delay={0.6}>
                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={() => {
                        window.history.pushState({}, '', '/blog');
                        setPathname('/blog');
                        setView('blog');
                      }}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center space-x-1"
                    >
                      <span>{data.general.buttonSettings?.blogViewAll?.text || data.general.blogViewAllText || 'View all stories'}</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </ScrollReveal>
              </div>
            </section>
            <LandingPageRenderer 
              page={{ id: 'home', slug: '', title: 'Home', blocks: data.homeBlocks || [], sections: data.homeSections || [], settings: data.homeSettings, isPublished: true, createdAt: '' }} 
              slot="after-blog" 
              isFullPage={false} 
              defaultBackground={data.general.sectionBackgrounds?.['home-architect']}
            />
          </React.Fragment>
        ) : null;

      case 'successStories':
        return data.visibility?.successStories !== false ? (
          <React.Fragment key="section-success">
            <GradientDivider />
            <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-[#fdfdfd] dark:bg-[#09090b] relative overflow-hidden transition-colors duration-700 group/success-sec">
              {/* Massive Background Text */}
              <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 text-[15vw] font-black text-slate-900/[0.03] dark:text-white/[0.01] select-none pointer-events-none uppercase tracking-tighter whitespace-nowrap leading-none italic z-0 font-montserrat">
                Success
              </div>
              <SectionBackground config={data.general.sectionBackgrounds?.['success-stories']} />
              <AbstractBackground variant="glass-blobs" opacity={0.1} />
              <AbstractBackground variant="waves" opacity={0.015} />
              <div className="max-w-7xl mx-auto">
                <ScrollReveal delay={0.4}>
                  <SuccessStorySection />
                </ScrollReveal>
              </div>
            </section>
            <LandingPageRenderer 
              page={{ id: 'home', slug: '', title: 'Home', blocks: data.homeBlocks || [], sections: data.homeSections || [], settings: data.homeSettings, isPublished: true, createdAt: '' }} 
              slot="after-success" 
              isFullPage={false} 
              defaultBackground={data.general.sectionBackgrounds?.['home-architect']}
            />
          </React.Fragment>
        ) : null;

      case 'features':
        return data.visibility?.whyChooseUs !== false ? (
          <Suspense key="section-features" fallback={<div className="h-20" />}>
            <MemoizedFeatures />
          </Suspense>
        ) : null;

      case 'reviews':
        return (data.visibility?.reviews !== false || data.visibility?.offices !== false) ? (
          <React.Fragment key="section-reviews">
            <GradientDivider />
            <section className="py-6 md:py-12 px-4 sm:px-6 lg:px-12 bg-transparent relative overflow-hidden group/reviews-sec">
              {/* Massive Background Text */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 text-[15vw] font-black text-slate-900/[0.03] dark:text-white/[0.01] select-none pointer-events-none uppercase tracking-tighter whitespace-nowrap leading-none italic z-0 font-montserrat">
                Feedback
              </div>
              <SectionBackground config={data.general.sectionBackgrounds?.['reviews-locations']} />
              <AbstractBackground variant="refined-grid" opacity={0.08} position="top-left" />
              <div className="max-w-7xl mx-auto">
                <ScrollReveal direction="up">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-stretch">
                    {data.visibility?.reviews !== false && (
                      <div className="h-full">
                        <div className="bg-slate-50/50 dark:bg-white/[0.02] p-8 rounded-lg border border-slate-200/60 dark:border-transparent shadow-xl dark:shadow-none h-full relative group/reviews-main">
                          <div className="absolute inset-0 rounded-lg pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/[0.02] dark:bg-primary/[0.01] blur-2xl rounded-full pointer-events-none" />
                          </div>
                          <div className="relative z-10 h-full">
                            <GoogleReviews t={t} />
                          </div>
                        </div>
                      </div>
                    )}
                    {data.visibility?.offices !== false && (
                      <div className="h-full">
                        <div className="bg-slate-50/50 dark:bg-white/[0.02] p-8 rounded-lg border border-slate-200/60 dark:border-transparent shadow-xl dark:shadow-none h-full relative group/loc-main">
                          <div className="absolute inset-0 rounded-lg pointer-events-none">
                            <AbstractBackground variant="map" opacity={0.15} />
                            {(data.locationSettings?.backgroundLogoUrl || data.general?.officesBgImageUrl) ? (
                              <img 
                                src={data.locationSettings?.backgroundLogoUrl || data.general?.officesBgImageUrl || null} 
                                alt="" 
                                style={{ 
                                  opacity: (data.locationSettings?.backgroundLogoOpacity ?? 1),
                                  width: data.locationSettings?.backgroundLogoSize ?? 240,
                                  height: data.locationSettings?.backgroundLogoSize ?? 240,
                                  top: data.locationSettings?.backgroundLogoTop ?? 8,
                                  right: data.locationSettings?.backgroundLogoRight ?? 8,
                                  transform: `rotate(${data.locationSettings?.backgroundLogoRotation ?? 0}deg)`
                                }}
                                className="absolute object-contain transition-all duration-1000 pointer-events-none group-hover/loc-main:scale-110"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <MapPin size={160} fill="currentColor" className="absolute top-4 right-4 text-slate-900/10 dark:text-white/5 transition-all duration-1000 pointer-events-none group-hover/loc-main:scale-110" />
                            )}
                          </div>
                          <div className="relative z-10">
                            <OfficeLocations />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              </div>
            </section>
            <LandingPageRenderer 
              page={{ id: 'home', slug: '', title: 'Home', blocks: data.homeBlocks || [], sections: data.homeSections || [], settings: data.homeSettings, isPublished: true, createdAt: '' }} 
              slot="after-reviews" 
              isFullPage={false} 
              defaultBackground={data.general.sectionBackgrounds?.['home-architect']}
            />
          </React.Fragment>
        ) : null;

      case 'team':
        return data.visibility?.team !== false ? (
          <React.Fragment key="section-team">
            <GradientDivider />
            <div className="relative overflow-hidden group/team-main bg-[#fdfdfd] dark:bg-[#060608]">
              <section className="relative overflow-hidden group/team-sec">
                {/* Massive Background Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-black text-slate-900/[0.03] dark:text-white/[0.01] select-none pointer-events-none uppercase tracking-tighter whitespace-nowrap leading-none italic z-0 font-montserrat">
                  Trusted
                </div>
                <SectionBackground config={data.general.sectionBackgrounds?.['team']} />
                <AbstractBackground variant="waves" opacity="opacity-[0.08]" />
                <AbstractBackground variant="lines" opacity={0.05} />
                <ScrollReveal delay={0.3}>
                  <TeamSection t={t} />
                </ScrollReveal>
              </section>
              
              <FAQ />
            </div>
            <LandingPageRenderer 
              page={{ id: 'home', slug: '', title: 'Home', blocks: data.homeBlocks || [], sections: data.homeSections || [], settings: data.homeSettings, isPublished: true, createdAt: '' }} 
              slot="after-team" 
              isFullPage={false} 
              defaultBackground={data.general.sectionBackgrounds?.['home-architect']}
            />
          </React.Fragment>
        ) : null;

      case 'partners':
        return data.visibility?.partners !== false ? (
          <React.Fragment key="section-partners">
            <GradientDivider />
            <section className="relative overflow-hidden py-16 group/partner-sec bg-[#fdfdfd] dark:bg-[#060608]">
              <ScrollReveal variant="fade" direction="up">
                <div className="max-w-7xl mx-auto px-4 text-center mb-10 relative z-10">
                  <span className="text-primary font-bold text-[10px] uppercase tracking-[0.3em] block mb-2">
                    {data.general.sectionTitles?.partners?.subtitle || "Affiliations & Licenses"}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                    {data.general.sectionTitles?.partners?.title || "Licensed By"}
                  </h2>
                </div>
                <PartnerBar />
              </ScrollReveal>
            </section>
          </React.Fragment>
        ) : null;

      default:
        return null;
    }
  };

  const handleShare = (e: React.MouseEvent, type: 'dest' | 'post', id: string, title: string) => {
    e.stopPropagation();
    const cleanPath = type === 'dest' ? `/destinations/${id}` : `/blog/${id}`;
    const shareUrl = `${window.location.origin}${cleanPath}`;
    const shareText = `Check out this ${type === 'dest' ? 'destination' : 'travel story'}: ${title.replace(/<[^>]*>/g, '')}`;

    if (navigator.share) {
      navigator.share({
        title: title.replace(/<[^>]*>/g, ''),
        text: shareText,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      // Toast or notification could be added here
      alert('Link copied to clipboard!');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    
    // Check for invoice
    const inv = params.get('inv');
    if (inv) {
      setPublicInvoiceId(inv);
      setView('public-invoice');
    }

    // Check for destination in path or params
    const destInPath = path.startsWith('/destinations/') ? path.split('/').pop() : null;
    const dest = destInPath || params.get('dest');
    if (dest) {
      setInitialDestId(dest);
    }

    // Check for blog post in path or params
    const postInPath = path.startsWith('/blog/') ? path.split('/').pop() : null;
    const post = postInPath || params.get('post');
    if (post) {
      setInitialPostId(post);
      setView('blog');
    }

    // Check for hot deal in path or params
    const dealInPath = path.startsWith('/hot-deals/') ? path.split('/').pop() : null;
    const deal = dealInPath || params.get('deal');
    if (deal) {
      setInitialDealId(deal);
      setView('hot-deals');
    }

    const resetTokenParam = params.get('resetToken');
    if (resetTokenParam) {
      setResetToken(resetTokenParam);
      setIsLoginModalOpen(true);
    }

    const action = params.get('action');
    if (action === 'login') {
      setIsLoginModalOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          const shouldBeScrolled = scrollPos > 20;
          
          setIsScrolled(prev => {
            if (prev !== shouldBeScrolled) return shouldBeScrolled;
            return prev;
          });
          
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
    };
  }, []);

  const isHomePage = 
    pathname === '/' || 
    pathname === '/index.html' || 
    pathname === '' ||
    view !== 'landing' ||
    (!data.landingPages?.some(p => `/${p.slug}` === pathname) && 
     !['/admin', '/blog', '/destinations', '/hot-deals', '/invoice', '/iqama-inquiry', '/bio', '/profile', '/hub', '/help', '/company-profile', '/business-services', '/services'].some(r => pathname === r || pathname.startsWith(r + '/')));
  const landingPage = data.landingPages?.find(p => `/${p.slug}` === pathname);
  const isAdmin = view === 'admin' || !!currentUser;

  return (
    <div 
      className={`relative min-h-screen transition-all-custom font-montserrat antialiased selection:bg-primary/30 overflow-x-hidden text-slate-900 dark:text-white`}
    >
      <AnimatePresence mode="wait">
        {!isLoaded || (!minTimeElapsed && view !== 'admin') ? (
          <LoadingScreen key="loading-screen" />
        ) : null}
      </AnimatePresence>
      
      {isLoaded && (minTimeElapsed || view === 'admin') && (
        <React.Fragment>
          <SEO />
          {data?.general?.security?.maintenanceMode && (
            <div style={{ backgroundColor: '#dc2626', color: '#ffffff' }} className="py-2.5 px-4 text-center text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 relative z-[99999] border-b border-red-800 shadow-md">
              <span className="flex items-center gap-1.5">
                <span>⚠️ Global Maintenance Protocol Active</span>
                <span className="hidden md:inline opacity-75">• Public traffic is disabled</span>
              </span>
              <button 
                onClick={async () => {
                  const p = window.prompt("Verify administrative action.\n\nEnter password for administrative account \"" + (currentUser?.username || "Admin") + "\" to immediately bring the systems online:");
                  if (!p) return;
                  try {
                    const res = await fetch('/api/maintenance/deactivate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        username: currentUser?.username || currentUser?.email || 'admin',
                        password: p
                      })
                    });
                    const rdata = await res.json();
                    if (res.ok && rdata.success) {
                      window.alert("Restore successful! Portal is now online.");
                      window.location.reload();
                    } else {
                      window.alert("Deactivation failed: " + (rdata.error || "Password incorrect"));
                    }
                  } catch (e) {
                    window.alert("Error connecting to maintenance protocols.");
                  }
                }}
                className="bg-white text-rose-600 rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer ml-3 shrink-0"
              >
                Go Online
              </button>
            </div>
          )}
          {view !== 'admin' && view !== 'bio' && <TopBarNotification />}
      {view !== 'admin' && view !== 'bio' && <PopupNotification />}
      <GeometricBackground data={data} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;700&family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;700&family=Cairo:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;700&display=swap');

        /* Global multi-language font fallback overrides for Tailwind utility classes */
        .font-montserrat, [class*="font-montserrat"] {
          font-family: 'Montserrat', var(--font-arabic), var(--font-bangla), sans-serif !important;
        }
        .font-sans, [class*="font-sans"], .font-inter, [class*="font-inter"] {
          font-family: var(--font-body), 'Inter', sans-serif !important;
        }
        .font-bangla {
          font-family: var(--font-bangla), sans-serif !important;
        }
        .font-arabic {
          font-family: var(--font-arabic), sans-serif !important;
        }

        /* React Grid Layout Base Styles */
        .react-grid-layout {
          position: relative;
          transition: height 200ms ease;
        }
        .react-grid-item {
          transition: all 200ms ease;
          transition-property: left, top, width, height;
        }
        .react-grid-item.resizing {
          z-index: 1000;
          will-change: width, height;
        }
        .react-grid-item.react-draggable-dragging {
          transition: none;
          z-index: 1000;
          will-change: left, top;
        }
        .react-grid-item.dropping {
          visibility: hidden;
        }
        .react-grid-placeholder {
          background: rgba(16, 185, 129, 0.1) !important;
          border-radius: 16px !important;
          border: 2px dashed var(--primary-color) !important;
          opacity: 0.5 !important;
          transition-duration: 100ms !important;
          z-index: 2 !important;
          user-select: none !important;
        }

        /* React Grid Layout Resize Handles */
        .react-resizable-handle {
          position: absolute;
          width: 24px;
          height: 24px;
          bottom: 0;
          right: 0;
          cursor: se-resize;
          z-index: 50;
        }
        .react-resizable-handle::after {
          content: "";
          position: absolute;
          right: 6px;
          bottom: 6px;
          width: 12px;
          height: 12px;
          border-right: 3px solid rgba(0,0,0,0.1);
          border-bottom: 3px solid rgba(0,0,0,0.1);
          border-radius: 0 0 4px 0;
          transition: all 0.2s;
        }
        .dark .react-resizable-handle::after {
          border-right-color: rgba(255,255,255,0.1);
          border-bottom-color: rgba(255,255,255,0.1);
        }
        .react-grid-item:hover .react-resizable-handle::after {
          border-right-color: var(--primary-color);
          border-bottom-color: var(--primary-color);
          width: 16px;
          height: 16px;
          opacity: 1;
        }

        ${data.general.customFontUrl ? (data.general.customFontUrl.includes('fonts.googleapis.com') ? `
          @import url('${data.general.customFontUrl}');
        ` : `
          @font-face {
            font-family: 'CustomFont';
            src: url('${data.general.customFontUrl}');
            font-display: swap;
          }
        `) : ''}

        ${data.general.customFontBase64 ? `
          @font-face {
            font-family: 'CustomLanguageFont';
            src: url('data:font/ttf;base64,${data.general.customFontBase64}') format('truetype');
            font-display: swap;
          }
        ` : ''}

        @keyframes gradient-text {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gradient-slow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-text {
          animation: gradient-text 3s ease infinite;
        }
        .animate-gradient-slow {
          animation: gradient-slow 15s ease infinite;
        }

        :root {
          --primary-color: ${data.general?.themeColor || '#f00000'};
          --primary-rgb: ${(() => {
            const color = data.general?.themeColor || '#f00000';
            let hex = color.replace('#', '');
            if (hex.length === 3) {
              hex = hex.split('').map(c => c + c).join('');
            }
            const r = parseInt(hex.substring(0, 2), 16) || 240;
            const g = parseInt(hex.substring(2, 4), 16) || 0;
            const b = parseInt(hex.substring(4, 6), 16) || 0;
            return `${r}, ${g}, ${b}`;
          })()};
          --secondary-color: ${data.general?.secondaryColor || '#020617'};
          --accent-color: ${data.general?.accentColor || '#EF4444'};
          --color-primary: var(--primary-color);
          --color-secondary: var(--secondary-color);
          --color-accent: var(--accent-color);
          --service-bar-bg: rgba(255, 255, 255, 0.9);
          --shadow-color: rgba(0, 0, 0, 0.05);
          --font-english: ${(() => {
            const ff = data.general?.englishFontFamily || data.general?.fontFamily || 'Inter';
            if (ff === 'CustomLanguageFont') return "'CustomLanguageFont'";
            if (ff === 'CustomFont') return "'CustomFont'";
            return `'${ff}'`;
          })()};
          --font-arabic: ${(() => {
            const ff = data.general?.arabicFontFamily || 'Cairo';
            if (ff === 'CustomLanguageFont') return "'CustomLanguageFont'";
            if (ff === 'CustomFont') return "'CustomFont'";
            return `'${ff}'`;
          })()};
          --font-bangla: ${(() => {
            const ff = data.general?.banglaFontFamily || 'Hind Siliguri';
            if (ff === 'CustomLanguageFont') return "'CustomLanguageFont'";
            if (ff === 'CustomFont') return "'CustomFont'";
            return `'${ff}'`;
          })()};
          --font-header: var(--font-english), var(--font-arabic), var(--font-bangla), sans-serif;
          --font-body: var(--font-english), var(--font-arabic), var(--font-bangla), sans-serif;
          --font-accent: var(--font-english), var(--font-arabic), var(--font-bangla), sans-serif;
          --bg-soft: #fdfdfd;
          --ink-main: #111827;
        }

        .dark {
          --primary-color: ${data.general?.themeColor || '#f00000'};
          --secondary-color: #020617;
          --accent-color: ${data.general?.accentColor || '#EF4444'};
          --color-primary: var(--primary-color);
          --color-secondary: var(--secondary-color);
          --color-accent: var(--accent-color);
          --surface-color: #020410;
          --border-color: rgba(37, 99, 235, 0.1);
          --shadow-color: rgba(0, 0, 0, 0.4);
          --bg-soft: #020617;
        }

        body {
          font-family: var(--font-body);
          background-color: var(--bg-soft);
          color: var(--ink-main);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
        h1, h2, h3, h4, h5, .font-header {
          font-family: var(--font-header);
          letter-spacing: -0.01em;
          font-weight: 800;
        }
        
        .dark h1, .dark h2, .dark .text-themed-heading {
          background: none;
          -webkit-background-clip: initial;
          -webkit-text-fill-color: initial;
          background-clip: initial;
          color: white;
          text-shadow: 0 0 40px rgba(255,255,255,0.05);
        }

        .dark h3, .dark h4, .dark h5 {
          color: rgba(255, 255, 255, 0.9);
        }

        .dark p, .dark span:not(.text-primary):not(.text-secondary) {
          color: rgba(255, 255, 255, 0.7);
        }

        h6, .font-accent {
          font-family: var(--font-accent);
        }
        
        /* Utility classes for the theme colors */
        .bg-primary { background-color: var(--primary-color) !important; }
        .text-primary { color: var(--primary-color) !important; }
        .border-primary { border-color: var(--primary-color) !important; }
        .bg-secondary { background-color: var(--secondary-color) !important; }
        .text-secondary { color: var(--secondary-color); }
        .bg-accent { background-color: var(--accent-color); }
        .text-accent { color: var(--accent-color); }

        /* Button Enhancements - Minimal & Soft */
        .bg-gradient-themed {
          background: linear-gradient(135deg, var(--primary-color), #f97316);
        }
        .text-gradient {
          background: linear-gradient(135deg, var(--primary-color), #f97316);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .text-gradient-subtle {
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .border-gradient {
          borderImage: linear-gradient(to right, var(--primary-color), #f97316) 1;
        }
        
        .btn-themed {
          background: linear-gradient(to right, var(--primary-color), #f97316);
          color: white;
          transition: all 0.3s ease;
          font-weight: 700;
          letter-spacing: 0.05em;
          border: none;
          text-transform: uppercase;
          box-shadow: 0 4px 15px -3px color-mix(in srgb, var(--primary-color) 50%, transparent);
        }
        .btn-themed:hover {
          background: linear-gradient(to right, color-mix(in srgb, var(--primary-color) 90%, black), #fb923c);
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 20px -3px color-mix(in srgb, var(--primary-color) 60%, transparent);
        }
        
        /* Modern Dark Mode Enhancements */
        .dark .glass-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(16px);
        }
        .dark .glass-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-4px);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1);
        }

        .dark .border-primary {
          border-color: color-mix(in srgb, var(--primary-color) 30%, transparent) !important;
        }

        /* Modern Scrollbar */
        .dark ::-webkit-scrollbar {
          width: 8px;
        }
        .dark ::-webkit-scrollbar-track {
          background: #09090b;
        }
        .dark ::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
          background: var(--primary-color);
        }
        
        .balance { text-wrap: balance; }
        .font-montserrat { font-family: 'Montserrat', sans-serif !important; }
        .font-black { font-weight: 900 !important; }
        
        @media (max-width: 768px) {
          .hero-title { font-size: 2.5rem; line-height: 1; }
        }

        /* Dark Mode Typography Polish */
        .dark .text-slate-500, .dark .text-zinc-500 {
          color: rgba(255, 255, 255, 0.45) !important;
        }
        .dark .text-slate-400, .dark .text-zinc-400 {
          color: rgba(255, 255, 255, 0.6) !important;
        }
        
        /* Subtle Glow Effects */
        .dark .glow-primary {
          filter: drop-shadow(0 0 10px color-mix(in srgb, var(--primary-color) 20%, transparent));
        }
        
        /* Smooth Transitions - Refined to exclude heavy properties from broad selector */
        .transition-all-custom {
          transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 300ms;
        }
        
        /* Explicit transitions for transform/filter where needed */
        .hover-scale {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-scale:hover {
          transform: scale(1.05);
        }
        
        /* Theme-based Shadows - Significantly Reduced for Minimal Look */
        .shadow-xl { box-shadow: 0 10px 20px -5px var(--shadow-color) !important; }
        .shadow-2xl { box-shadow: 0 15px 30px -10px var(--shadow-color) !important; }
        .shadow-lg { box-shadow: 0 4px 12px -2px var(--shadow-color) !important; }
        .shadow-md { box-shadow: 0 2px 8px -1px var(--shadow-color) !important; }
        .shadow-sm { box-shadow: 0 1px 3px 0 var(--shadow-color) !important; }
        
        /* Shadow overrides */
        .shadow-primary\/10 { --tw-shadow-color: color-mix(in srgb, var(--primary-color) 10%, transparent) !important; }
        .shadow-primary\/20 { --tw-shadow-color: color-mix(in srgb, var(--primary-color) 20%, transparent) !important; }
        .shadow-primary\/30 { --tw-shadow-color: color-mix(in srgb, var(--primary-color) 30%, transparent) !important; }
        .shadow-primary\/40 { --tw-shadow-color: color-mix(in srgb, var(--primary-color) 40%, transparent) !important; }
        
        /* Ring overrides */
        .ring-primary { --tw-ring-color: var(--primary-color) !important; }
        .focus\\:ring-primary\/20:focus { --tw-ring-color: color-mix(in srgb, var(--primary-color) 20%, transparent) !important; }
      `}</style>

      {view === 'public-invoice' && publicInvoiceId ? (
        <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
          <Suspense fallback={<ComponentLoader />}>
            <PublicInvoiceView invoiceId={publicInvoiceId} />
          </Suspense>
          <div className="flex-grow" />
        </div>
      ) : view === 'admin' ? (
        <Suspense fallback={<ComponentLoader />}>
          {currentUser ? (
              <AdminPanel 
                theme={theme}
                setTheme={setTheme}
                onBack={() => {
                  const hostname = window.location.hostname;
                  if (hostname.startsWith('admin.')) {
                    window.location.href = window.location.origin.replace('admin.', '');
                  } else {
                    window.history.pushState({}, '', '/');
                    setPathname('/');
                    setView('landing');
                  }
                }} 
                t={t} 
              />
            ) : (
              <LoginPage 
                theme={theme}
                setTheme={setTheme}
                onBack={() => {
                  const hostname = window.location.hostname;
                  if (hostname.startsWith('admin.')) {
                    window.location.href = window.location.origin.replace('admin.', '');
                  } else {
                    window.history.pushState({}, '', '/');
                    setPathname('/');
                    setView('landing');
                  }
                }} 
              />
            )}
          </Suspense>
      ) : (
        <div className="w-full">
          {mappedLandingPage && pathname === '/' ? (
            <div className="w-full">
              <LandingPageRenderer 
                page={mappedLandingPage} 
                onHomeClick={() => { window.history.pushState({}, '', '/'); setPathname('/'); setView('landing'); }}
                onBlogClick={() => { window.history.pushState({}, '', '/blog'); setPathname('/blog'); setView('blog'); }}
                onOffersClick={() => { window.history.pushState({}, '', '/hot-deals'); setPathname('/hot-deals'); setView('deals'); }}
                onLandingPageClick={(slug) => { window.history.pushState({}, '', `/${slug}`); setPathname(`/${slug}`); setView('landing'); }}
              />
            </div>
          ) : view === 'hot-deals' ? (
            <div className="flex-grow relative overflow-hidden pt-24">
              <AbstractBackground variant="waves" />
              <ScrollReveal>
                <Suspense fallback={<ComponentLoader />}>
                  <HotDealsPage initialId={initialDealId} onBack={() => { setView('landing'); setPathname('/'); window.history.pushState({}, '', '/'); setInitialDealId(null); }} />
                </Suspense>
              </ScrollReveal>
            </div>
          ) : view === 'destinations' ? (
            <div className="flex-grow relative overflow-hidden pt-24">
              <AbstractBackground variant="waves" />
              <ScrollReveal>
                <Suspense fallback={<ComponentLoader />}>
                  <DestinationsCatalogue isPage={true} initialId={initialDestId} onClearInitial={() => setInitialDestId(null)} />
                </Suspense>
              </ScrollReveal>
            </div>
          ) : view === 'blog' ? (
            <div className="flex-grow relative overflow-hidden pt-24">
              <AbstractBackground variant="waves" />
              <ScrollReveal>
                <Suspense fallback={<ComponentLoader />}>
                  <BlogPage initialId={initialPostId} onBack={() => { setView('landing'); setInitialPostId(null); setPathname('/'); window.history.pushState({}, '', '/'); }} />
                </Suspense>
              </ScrollReveal>
            </div>
          ) : view === 'iqama' ? (
            <div className="flex-grow relative overflow-hidden pt-24">
              <ScrollReveal>
                <Suspense fallback={<ComponentLoader />}>
                  <IqamaInquiry />
                </Suspense>
              </ScrollReveal>
            </div>
          ) : view === 'bio' ? (
            <div className="flex-grow w-full relative overflow-hidden">
              <Suspense fallback={<ComponentLoader />}>
                <BioHubPage onBack={() => { setView('landing'); setPathname('/'); window.history.pushState({}, '', '/'); }} />
              </Suspense>
            </div>
          ) : view === 'business-services' ? (
            <div className="flex-grow w-full relative overflow-hidden">
              <Suspense fallback={<ComponentLoader />}>
                <BusinessServicesPage onBack={() => { setView('landing'); setPathname('/'); window.history.pushState({}, '', '/'); }} />
              </Suspense>
            </div>
          ) : view === 'company-profile' ? (
            <div className="flex-grow w-full relative overflow-hidden">
              <Suspense fallback={<ComponentLoader />}>
                <CompanyProfilePage onBack={() => { setView('landing'); setPathname('/'); window.history.pushState({}, '', '/'); }} />
              </Suspense>
            </div>
          ) : landingPage && (landingPage.isPublished || isAdmin) && view === 'landing' ? (
            <div className="w-full">
              <LandingPageRenderer 
                page={landingPage} 
                onHomeClick={() => { window.history.pushState({}, '', '/'); setPathname('/'); setView('landing'); }}
                onBlogClick={() => { window.history.pushState({}, '', '/blog'); setPathname('/blog'); setView('blog'); }}
                onOffersClick={() => { window.history.pushState({}, '', '/hot-deals'); setPathname('/hot-deals'); setView('deals'); }}
                onLandingPageClick={(slug) => { window.history.pushState({}, '', `/${slug}`); setPathname(`/${slug}`); setView('landing'); }}
              />
            </div>
          ) : view === 'landing' && !isHomePage ? (
            <div className={`min-h-[80vh] flex flex-col items-center justify-center p-6 text-center transition-all duration-500 ease-in-out ${
              theme === 'dark' 
                ? 'bg-[#050508] text-white' 
                : 'bg-slate-50 text-slate-900 border-t border-slate-100'
            }`}>
               <div className="space-y-6 max-w-md w-full relative z-10 animate-in fade-in-50 duration-500">
                  <div className="flex justify-center">
                    <div className="p-5 bg-red-500/10 rounded-full text-red-500">
                      <Plane size={40} className="animate-bounce" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h1 className="text-5xl font-black font-montserrat tracking-tight text-red-500">
                      404
                    </h1>
                    <h2 className="text-xl font-bold font-montserrat">
                      Page Not Found
                    </h2>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
                      الصفحة غير موجودة
                    </h3>
                    <p className={`text-xs leading-relaxed max-w-xs mx-auto transition-colors duration-500 ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'
                    }`}>
                      The requested travel route or page is unavailable. Please choose from the active destination gateways below.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
                    <button 
                      onClick={() => {
                        setView('landing');
                        window.history.pushState({}, '', '/');
                        setPathname('/');
                      }}
                      className="w-full sm:w-auto flex-1 bg-red-600 hover:bg-red-700 text-white font-montserrat font-black text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95"
                    >
                      Homepage / الرئيسية
                    </button>
                    
                    <button 
                      onClick={() => window.history.back()}
                      className={`w-full sm:w-auto flex-1 font-montserrat font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl border transition-all duration-300 active:scale-95 ${
                        theme === 'dark' 
                          ? 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/5' 
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
                      }`}
                    >
                      Go Back / العودة
                    </button>
                  </div>
               </div>
            </div>
          ) : (
            <main className="relative">
              <LocalizedModernPatterns />
              
               {/* Removed Hero Background Areas */}

              {data.homeSettings?.backgroundPattern && data.homeSettings?.backgroundPattern !== 'none' && (
                <div className="fixed inset-0 pointer-events-none z-0">
                  <AbstractBackground 
                    variant={data.homeSettings.backgroundPattern as any} 
                    opacity={0.02}
                  />
                </div>
              )}
              {/* Slot: before-hero */}
              <LandingPageRenderer 
                page={{ id: 'home', slug: '', title: 'Home', blocks: data.homeBlocks || [], sections: data.homeSections || [], settings: data.homeSettings, isPublished: true, createdAt: '' }} 
                slot="before-hero" 
                isFullPage={false} 
                defaultBackground={data.general.sectionBackgrounds?.['home-architect']}
              />

              {data.visibility?.hero !== false && (
                <header className="relative w-full z-20 flex flex-col font-montserrat group/hero-sec">
                  <div className="relative w-full z-10 flex flex-col flex-grow items-center justify-center">
                    <MemoizedHero t={t} currentLang={pathname === '/' ? 'EN' : 'BN'} />
                  </div>
                </header>
              )}

              {/* Slot: after-hero */}
              <LandingPageRenderer 
                page={{ id: 'home', slug: '', title: 'Home', blocks: data.homeBlocks || [], sections: data.homeSections || [], settings: data.homeSettings, isPublished: true, createdAt: '' }} 
                slot="after-hero" 
                isFullPage={false} 
                defaultBackground={data.general.sectionBackgrounds?.['home-architect']}
              />

              {/* DYNAMIC HOMEPAGE SECTIONS RENDERER (Supports custom administrative ordering) */}
              {(data.homeSectionsOrder || [
                'search',
                'stats',
                'services',
                'destinations',
                'whySaudiArabia',
                'blog',
                'successStories',
                'features',
                'reviews',
                'team',
                'partners'
              ]).map((sectionId) => renderHomeSection(sectionId))}

              {/* Slot: after-partners (Bottom) */}
              <LandingPageRenderer 
                page={{ id: 'home', slug: '', title: 'Home', blocks: data.homeBlocks || [], sections: data.homeSections || [], settings: data.homeSettings, isPublished: true, createdAt: '' }} 
                slot="bottom" 
                isFullPage={false} 
                defaultBackground={data.general.sectionBackgrounds?.['home-architect']}
              />
              
              {/* Legacy Support: Render blocks without slot at the bottom */}
              <LandingPageRenderer 
                page={{ 
                  id: 'home', 
                  slug: '', 
                  title: 'Home', 
                  blocks: (data.homeBlocks || []).filter(b => !b.slot), 
                  sections: data.homeSections || [],
                  isPublished: true, 
                  createdAt: '' 
                }} 
                isFullPage={false} 
                defaultBackground={data.general.sectionBackgrounds?.['home-architect']}
              />
            </main>
      )}
    </div>
  )}
  {!isLoginModalOpen && view !== 'admin' && view !== 'bio' && view !== 'company-profile' && data.visibility?.footer !== false && (!landingPage || !landingPage.settings?.hideFooter) && (
        <section className="relative overflow-hidden group/footer-sec">
          <SectionBackground config={data.general.sectionBackgrounds?.['footer']} />
          <AbstractBackground variant="waves" opacity={0.01} />
          <MemoizedFooter t={t} />
        </section>
      )}

      {view !== 'admin' && view !== 'bio' && view !== 'company-profile' && <PrivacyPopup t={t} />}
      {view !== 'admin' && view !== 'bio' && view !== 'company-profile' && <VisitorCouponPopup />}
      {view !== 'bio' && view !== 'company-profile' && <FloatingActions t={t} isAdmin={view === 'admin'} />}
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        theme={theme}
        setTheme={setTheme}
        onClose={() => {
          setIsLoginModalOpen(false);
          setResetToken(null);
          const url = new URL(window.location.href);
          url.searchParams.delete('resetToken');
          window.history.replaceState({}, '', url.toString());
        }} 
        onLoginSuccess={() => setView('admin')} 
        initialResetToken={resetToken}
      />

      {(landingPage?.settings?.hideNavbar !== true) && view !== 'admin' && view !== 'public-invoice' && view !== 'bio' && view !== 'company-profile' && (
        <MemoizedNavbar 
          isScrolled={view === 'landing' ? isScrolled : true} 
          hasHero={hasHero}
          theme={landingPage?.settings?.navbarSettings?.theme === 'auto' || !landingPage?.settings?.navbarSettings?.theme
            ? (landingPage?.settings?.backgroundColor === '#ffffff' || !landingPage?.settings?.backgroundColor ? theme : 'dark')
            : (landingPage?.settings?.navbarSettings?.theme as any) || theme} 
          toggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} 
          t={t}
          pathname={pathname}
          links={landingPage?.settings?.navbarSettings?.links || data.navbarLinks}
          customSettings={landingPage?.settings?.navbarSettings || {
            logoUrl: data.general.logoUrl,
            isScrolledBg: theme === 'dark' ? 'rgba(9, 9, 11, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            isScrolledText: theme === 'dark' ? '#ffffff' : '#1e293b'
          }}
          onBlogClick={() => {
            window.history.pushState({}, '', '/blog');
            setPathname('/blog');
          }}
          onHomeClick={() => {
            window.history.pushState({}, '', '/');
            setPathname('/');
            setView('landing');
          }}
          onOffersClick={() => {
            window.history.pushState({}, '', '/destinations');
            setPathname('/destinations');
            setView('destinations');
          }}
          onLandingPageClick={(slug) => {
            if (slug === 'destinations') {
              window.history.pushState({}, '', '/destinations');
              setPathname('/destinations');
              setView('destinations');
              return;
            }
            if (slug === 'hot-deals') {
              window.history.pushState({}, '', '/hot-deals');
              setPathname('/hot-deals');
              setView('hot-deals');
              return;
            }
            if (slug === 'business-services' || slug === 'services') {
              window.history.pushState({}, '', '/business-services');
              setPathname('/business-services');
              setView('business-services');
              return;
            }
            window.history.pushState({}, '', `/${slug}`);
            setPathname(`/${slug}`);
            setView('landing');
          }}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onAdminClick={() => {
            window.history.pushState({}, '', '/admin');
            setPathname('/admin');
            setView('admin');
          }}
          onServiceClick={(s) => {
            if (pathname !== '/') {
              window.history.pushState({}, '', `/?service=${s}`);
              setPathname('/');
              setActiveService(s);
              setView('landing');
            } else {
              setActiveService(s);
              setView('landing');
            }
          }}
        />
      )}

      {/* Global custom popups */}
      {view !== 'admin' && <CustomPopupRenderer />}

      {/* WhatsApp Redirect Confirmation Modal with Auto-Redirect */}
      <AnimatePresence>
        {waLinkToOpen && (
          <div className="fixed inset-0 z-[10000000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden font-montserrat"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none text-[#25D366]">
                <Send size={140} className="stroke-current fill-current" />
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] mb-1">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <LucideIcons.MessageSquare size={26} className="fill-current stroke-current text-[#25D366]" />
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Leaving for WhatsApp
                  </h3>
                  <div className="h-1.5 w-16 bg-[#25D366]/20 rounded-full overflow-hidden mx-auto mt-2">
                    <motion.div 
                      className="h-full bg-[#25D366]"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 4, ease: "linear" }}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl w-full border border-slate-100 dark:border-white/[0.03]">
                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed uppercase tracking-wider">
                    You are being redirected to our official response desk on WhatsApp to continue.
                  </p>
                  <p className="text-[10px] font-black text-[#25D366] leading-relaxed uppercase tracking-widest animate-pulse">
                    Auto-redirecting in {waCountdown}s...
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                  <button
                    onClick={() => setWaLinkToOpen(null)}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-300 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (waLinkToOpen) {
                        try {
                          const originalOpen = (window as any).__originalOpen || window.open;
                          originalOpen.call(window, waLinkToOpen, '_blank');
                        } catch (err) {
                           window.location.href = waLinkToOpen;
                        }
                        setWaLinkToOpen(null);
                      }
                    }}
                    className="py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#25D366]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Continue Now ({waCountdown}s)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </React.Fragment>
  )}
</div>
  );
};

const App: React.FC = () => {
  return (
    <CMSProvider>
      <AppContent />
    </CMSProvider>
  );
};

export default App;