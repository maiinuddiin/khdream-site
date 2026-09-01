import React, { memo } from 'react';
import { ShieldCheck, BedDouble, Building } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../context/CMSContext';

interface ServicesBarProps {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  t: (path: string) => string;
}

const ServicesBar: React.FC<ServicesBarProps> = ({ activeId, setActiveId, t }) => {
  const { data } = useCMS();

  const toTitleCase = (str: string) => {
    if (!str) return '';
    const hasLower = /[a-z]/.test(str);
    const hasUpper = /[A-Z]/.test(str);
    if (hasUpper && !hasLower) {
      return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return str;
  };

  const SERVICES = [
    { 
      id: 'visas', 
      icon: <ShieldCheck size={16} />, 
      name: toTitleCase(t('services.visas') || 'Visa Support'), 
      visible: data.visibility?.serviceVisa !== false,
    },
    { 
      id: 'hotels', 
      icon: <BedDouble size={16} />, 
      name: toTitleCase(t('services.hotels') || 'Hotels'), 
      visible: data.visibility?.serviceHotel !== false,
    },
    { 
      id: 'setup', 
      icon: <Building size={16} />, 
      name: toTitleCase(t('services.business') || 'Business Setup'), 
      visible: data.visibility?.serviceBusiness !== false,
    }
  ].filter(svc => svc.visible);

  return (
    <div className="w-full relative z-20 overflow-hidden font-montserrat">
      <div className="flex w-full divide-x divide-slate-100 dark:divide-white/5">
        {SERVICES.map((service, idx) => (
          <button
            key={service.id}
            onClick={() => setActiveId(service.id)}
            className={cn(
              "flex-1 group relative flex flex-col items-center justify-center py-3.5 sm:py-5 md:py-6 outline-none transition-all duration-500",
              activeId === service.id 
                ? "bg-primary/5 dark:bg-primary/10" 
                : "bg-transparent hover:bg-slate-50/50 dark:hover:bg-white/5"
            )}
          >
            <div className={cn(
              "flex flex-col md:flex-row items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 transition-all duration-500",
              "p-1 md:p-0"
            )}>
              <div className={cn(
                "shrink-0 flex items-center justify-center transition-all duration-500",
                activeId === service.id ? "text-primary scale-110" : "text-slate-400 group-hover:text-primary group-hover:scale-105"
              )}>
                {React.cloneElement(service.icon as React.ReactElement<any>, {
                  size: 16,
                  className: "transition-transform duration-500 md:w-5 md:h-5"
                })}
              </div>
              <div className="flex flex-col items-center md:items-start text-center">
                <span className={cn(
                  "text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-black tracking-[0.05em] sm:tracking-[0.12em] md:tracking-[0.18em] uppercase whitespace-nowrap transition-colors duration-300",
                  activeId === service.id ? "text-primary" : "text-slate-600 dark:text-slate-400 group-hover:text-primary"
                )}>
                  {service.name.toUpperCase()}
                </span>
              </div>
            </div>
            
            {/* Active indicator line */}
            <AnimatePresence>
              {activeId === service.id && (
                <motion.div 
                  layoutId="active-nav-line"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
    </div>
  );
};

export default memo(ServicesBar);
