import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Phone, MessageCircle, Sun, Moon, Compass, Tag, Info, FileText, Landmark, User, LogIn, LayoutDashboard, Menu, X, ChevronDown, ChevronRight, Plane, Hotel, Shield, Briefcase, Cloud, ExternalLink, Calendar } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { cn, toTitleCase } from '../lib/utils';
import AbstractBackground from './AbstractBackground';
import { AppointmentModal } from './AppointmentModal';


interface NavbarProps {
  isScrolled: boolean;
  hasHero?: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  t: (path: string) => string;
  onBlogClick?: () => void;
  onHomeClick?: () => void;
  onOffersClick?: () => void;
  onLandingPageClick?: (slug: string) => void;
  onLoginClick?: () => void;
  onAdminClick?: () => void;
  onServiceClick?: (service: 'hotels' | 'visas' | 'setup') => void;
  pathname: string;
  links?: any[];
  customSettings?: {
    logoUrl?: string;
    backgroundColor?: string;
    textColor?: string;
    isScrolledBg?: string;
    isScrolledText?: string;
    whatsappNumber?: string;
    showWhatsapp?: boolean;
  };
}

const Navbar: React.FC<NavbarProps> = ({ 
  isScrolled, 
  hasHero = true,
  theme, 
  toggleTheme, 
  t, 
  onBlogClick, 
  onHomeClick,
  onOffersClick,
  onLandingPageClick,
  onLoginClick,
  onAdminClick,
  onServiceClick,
  pathname,
  links,
  customSettings
}) => {
  const { data, currentUser } = useCMS();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const [localIsScrolled, setLocalIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  const navLinks = links || data.navbarLinks || [];

  useEffect(() => {
    const handleScroll = () => {
      setLocalIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Determine if navbar should have a solid background
  const effectiveIsScrolled = isScrolled || localIsScrolled;
  const isSolid = effectiveIsScrolled || !hasHero;
  
  // Determine default text color behavior (white over hero or in dark mode)
  const isDefaultTextWhite = !isSolid || theme === 'dark';

  // Apply custom settings if available
  const bgColor = isSolid 
    ? (customSettings?.isScrolledBg || (theme === 'dark' ? 'rgba(9, 9, 11, 0.7)' : 'rgba(255, 255, 255, 0.75)'))
    : (customSettings?.backgroundColor || 'transparent');
    
  const textColorClass = isSolid
    ? (customSettings?.isScrolledText ? '' : (theme === 'dark' ? 'text-white/90' : 'text-slate-900'))
    : (customSettings?.textColor ? '' : 'text-white/90');

  const buttonBaseClass = isDefaultTextWhite
    ? 'bg-white/5 border-white/10 backdrop-blur-md'
    : 'bg-slate-50 border-slate-200';

  const textStyle = {
    color: isSolid ? customSettings?.isScrolledText : customSettings?.textColor
  };

  const isLogoWhite = !isSolid || theme === 'dark';

  const services = [
    { id: 'visas', label: 'Visa Concierge', icon: Shield },
    { id: 'hotels', label: 'Hotel Booking', icon: Hotel },
    { id: 'setup', label: 'Business Setup', icon: Briefcase },
  ];

  const showWhatsapp = customSettings?.showWhatsapp !== false;
  const whatsappNumber = customSettings?.whatsappNumber || data.general.whatsapp;

  const displayLogoUrl = customSettings?.logoUrl || data.general.logoUrl;

  useEffect(() => {
    setLogoError(false);
  }, [displayLogoUrl]);

  return (
    <>
      <nav 
        style={{ 
          top: 'var(--top-bar-height, 0)',
          backgroundColor: bgColor,
          backdropFilter: isSolid ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: isSolid ? 'blur(12px)' : 'none',
          zIndex: 1000001
        }}
        className={cn(
          "fixed left-0 w-full h-[72px] px-4 sm:px-10 lg:px-20 flex flex-row items-center justify-between z-[1000001] font-sans transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300 ease-in-out",
          isSolid ? "shadow-md shadow-black/5 border-b border-slate-205/60 dark:border-zinc-800/85" : "border-b border-transparent"
        )}>
        
        {/* Left: Logo */}
        <div 
          onClick={onHomeClick} 
          className="flex-none flex items-center h-full cursor-pointer min-w-[80px] md:min-w-[120px] py-2 group \
will-change-transform"
        >
          {displayLogoUrl && !logoError ? (
            <div className="h-full flex items-center shrink-0">
              <img 
                src={displayLogoUrl} 
                alt={data.general.siteName || "Logo"} 
                className={cn(
                  "h-9 md:h-12 w-auto object-contain transition-all duration-300 group-hover:scale-102",
                  isLogoWhite ? "brightness-0 invert" : "brightness-100"
                )}
                onError={() => {
                  console.error('Logo failed to load:', displayLogoUrl);
                  setLogoError(true);
                }}
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="bg-white/10 p-1.5 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300">
                <Cloud className={cn("transition-all duration-300", isSolid ? "text-primary fill-primary" : "text-white fill-white")} size={18} />
              </div>
            </div>
          )}
        </div>

        {/* Center: Navigation Links with Flat Premium active indicators */}
        <div className={cn(
          "hidden lg:flex flex-1 items-center justify-center space-x-2 xl:space-x-4 font-sans text-xs tracking-wider transition-colors duration-300",
          isSolid ? "text-slate-700 dark:text-zinc-200" : "text-white/95"
        )}>
          {navLinks.sort((a, b) => a.order - b.order).map((link) => {
            const isActive = pathname === link.url;
            return (
              <button 
                key={link.id}
                onClick={() => {
                  if (link.url === '/') {
                    onHomeClick?.();
                  } else if (link.url === '/blog') {
                    onBlogClick?.();
                  } else if (link.url === '/destinations' || link.url === '/hot-deals') {
                    onOffersClick?.();
                  } else if (link.url.startsWith('/') && !link.url.startsWith('/#') && link.url !== '/') {
                    onLandingPageClick?.(link.url.substring(1));
                  } else if (link.url.startsWith('/#')) {
                    const id = link.url.substring(2);
                    const el = document.getElementById(id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.href = link.url;
                    }
                  } else if (link.url.startsWith('http')) {
                    window.open(link.url, '_blank');
                  } else {
                    window.location.href = link.url;
                  }
                }}
                className={cn(
                  "relative py-2 px-3 xl:px-4 text-[11px] tracking-widest font-extrabold uppercase transition-all duration-200 cursor-pointer flex items-center justify-center",
                  isActive 
                    ? isSolid 
                      ? "text-primary dark:text-white" 
                      : "text-white"
                    : isSolid 
                      ? "text-slate-500 hover:text-primary dark:text-zinc-400 dark:hover:text-white" 
                      : "text-white/70 hover:text-white"
                )}
              >
                <span>{link.label}</span>
                {isActive && (
                  <motion.span 
                    layoutId="activeNavTabBorder"
                    className={cn(
                      "absolute bottom-[-6px] inset-x-2.5 h-0.5 rounded-full",
                      isSolid ? "bg-primary dark:bg-white" : "bg-white"
                    )}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex-none flex items-center gap-3">
          {data.visibility?.iqamaButton !== false && (
            <button 
              onClick={() => {
                const targetLink = data.general?.iqamaButtonLink || '/iqama-inquiry';
                if (targetLink.startsWith('http') || targetLink.startsWith('https://') || targetLink.startsWith('tel:') || targetLink.startsWith('mailto:')) {
                  window.open(targetLink, '_blank');
                } else {
                  window.history.pushState({}, '', targetLink);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all duration-200 bg-teal-500/10 hover:bg-teal-500 border border-teal-500/35 text-teal-600 dark:text-teal-400 hover:text-white dark:hover:text-white shadow-3xs cursor-pointer uppercase"
            >
              <Shield size={12} />
              <span>{data.general?.iqamaButtonText || 'Iqama Inquiry'}</span>
            </button>
          )}

          {currentUser && (
            <button 
              onClick={onAdminClick}
              className={cn(
                "hidden md:flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all duration-200 uppercase cursor-pointer",
                isSolid 
                  ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-slate-800 dark:hover:bg-zinc-100" 
                  : "bg-white/10 text-white border border-white/20 hover:bg-white hover:text-slate-900 backdrop-blur-md"
              )}
            >
              <LayoutDashboard size={13} />
              <span>Dashboard</span>
            </button>
          )}

          <button 
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-xl transition-all duration-200 cursor-pointer",
              isSolid 
                ? "bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-slate-205 dark:hover:bg-zinc-700/80" 
                : "bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-md"
            )}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {(!data.general?.buttonSettings?.navbarContact || !data.general.buttonSettings.navbarContact.disabled) && (
            <button 
              onClick={() => setIsAppointmentModalOpen(true)}
              className="hidden sm:flex px-6 py-2.5 rounded-[12px] text-[10.5px] font-black tracking-widest transition-all duration-300 uppercase cursor-pointer hover:scale-105 active:scale-95 shadow-lg bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-400 text-white shadow-primary/20"
            >
              Get Appointment
            </button>
          )}
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "lg:hidden p-2 rounded-lg transition-colors cursor-pointer",
              isSolid 
                ? (theme === 'dark' ? "text-white hover:bg-white/10" : "text-slate-900 hover:bg-slate-100") 
                : "text-white hover:bg-white/10"
            )}
          >
             {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 top-[80px] z-[1000000] bg-white dark:bg-[#030014] lg:hidden overflow-y-auto no-scrollbar font-montserrat"
          >
            <AbstractBackground variant="refined-grid" opacity={0.03} position="full" />
            
            <div className="relative z-10 p-6 space-y-8">
              <div className="flex items-center justify-center pt-4 pb-10 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] rounded-b-[2.5rem]">
                <div className="flex items-center justify-center px-6">
                  {displayLogoUrl && !logoError ? (
                    <img 
                      src={displayLogoUrl} 
                      alt="Logo" 
                      className={cn(
                        "h-14 w-auto object-contain",
                        theme === 'dark' ? "brightness-0 invert" : "brightness-100"
                      )}
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Cloud size={28} />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {data.visibility?.iqamaButton !== false && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                      const targetLink = data.general?.iqamaButtonLink || '/iqama-inquiry';
                      if (targetLink.startsWith('http') || targetLink.startsWith('https://') || targetLink.startsWith('tel:') || targetLink.startsWith('mailto:')) {
                        window.open(targetLink, '_blank');
                      } else {
                        window.history.pushState({}, '', targetLink);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-teal-950/20 border border-teal-500/30 text-teal-400 font-bold shadow-[0_0_15px_rgba(20,184,166,0.3)] animate-pulse"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                        <Shield size={16} />
                      </div>
                      <span className="text-xs tracking-[0.2em] text-teal-300 uppercase">{data.general?.iqamaButtonText || 'Iqama Inquiry'}</span>
                    </div>
                    <ChevronRight size={14} className="text-teal-400" />
                  </motion.button>
                )}

                {(navLinks || []).sort((a, b) => a.order - b.order).map((link, idx) => (
                  <motion.button 
                    key={link.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      if (link.url === '/') {
                        onHomeClick?.();
                      } else if (link.url === '/blog') {
                        onBlogClick?.();
                      } else if (link.url === '/hot-deals') {
                        onOffersClick?.();
                      } else if (link.url.startsWith('/') && !link.url.startsWith('/#') && link.url !== '/') {
                        onLandingPageClick?.(link.url.substring(1));
                      } else if (link.url.startsWith('/#')) {
                        const id = link.url.substring(2);
                        const el = document.getElementById(id);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          window.location.href = link.url;
                        }
                      } else if (link.url.startsWith('http')) {
                        window.open(link.url, '_blank');
                      } else {
                        window.location.href = link.url;
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-white font-bold group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Compass size={16} />
                      </div>
                      <span className="text-xs tracking-[0.2em]">{toTitleCase(link.label)}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                  </motion.button>
                ))}

                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navLinks?.length || 0) * 0.05 }}
                  className="space-y-4"
                >
                  <button 
                    onClick={() => setExpandedSubmenu(expandedSubmenu === 'services' ? null : 'services')}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-white font-bold"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Shield size={16} />
                      </div>
                      <span className="text-xs tracking-[0.2em]">Services</span>
                    </div>
                    {expandedSubmenu === 'services' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  <AnimatePresence>
                    {expandedSubmenu === 'services' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-3 pl-4"
                      >
                        {services.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              onServiceClick?.(s.id as any);
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.05] text-slate-600 dark:text-slate-400 font-bold"
                          >
                            <s.icon size={16} className="text-primary" />
                            <span className="text-[10px] tracking-widest">{s.label}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setTimeout(() => setIsAppointmentModalOpen(true), 300);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all duration-300 bg-gradient-to-r from-primary to-orange-500 text-white shadow-xl shadow-primary/20"
                >
                  <Calendar size={18} />
                  <span>Get Appointment</span>
                </button>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-white/5 space-y-4">
                <p className="text-[10px] font-bold tracking-[0.4em] text-slate-400 px-2 opacity-60 text-center">Appearance & Identity</p>
                <div className={cn("grid gap-4", currentUser ? "grid-cols-3" : "grid-cols-2")}>
                  <button 
                    onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                    className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-white space-y-3"
                  >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    <span className="text-[9px] font-bold tracking-widest">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                  </button>

                  <a 
                    href={`https://wa.me/${whatsappNumber}`}
                    className="flex flex-col items-center justify-center p-6 rounded-3xl bg-[#25D366]/5 text-[#25D366] space-y-3 border border-[#25D366]/10"
                  >
                    <MessageCircle size={24} fill="currentColor" />
                    <span className="text-[9px] font-bold tracking-widest">WhatsApp</span>
                  </a>
                  
                  {currentUser && (
                    <button 
                      onClick={() => { onAdminClick?.(); setIsMobileMenuOpen(false); }}
                      className="flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-themed text-white space-y-3 shadow-xl"
                    >
                      <LayoutDashboard size={24} />
                      <span className="text-[9px] font-bold tracking-widest uppercase">Dashboard</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AppointmentModal 
        isOpen={isAppointmentModalOpen} 
        onClose={() => setIsAppointmentModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;