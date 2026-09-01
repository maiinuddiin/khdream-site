import React from 'react';
import { useCMS } from '../context/CMSContext';

const PartnerBar: React.FC = () => {
  const { data } = useCMS();
  const partners = data.general.scrollingPartners || [];

  const toTitleCase = (str: string) => {
    if (!str) return '';
    const hasLower = /[a-z]/.test(str);
    const hasUpper = /[A-Z]/.test(str);
    if (hasUpper && !hasLower) {
      return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return str;
  };

  if (partners.length === 0) return null;

  return (
    <div className="w-full py-6 md:py-8 bg-transparent overflow-hidden relative">
      {/* Side Fades - Matching section background, thinned on mobile */}
      <div className="absolute inset-y-0 left-0 w-8 sm:w-16 md:w-24 lg:w-36 bg-gradient-to-r from-[#fdfdfd] dark:from-[#060608] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 sm:w-16 md:w-24 lg:w-36 bg-gradient-to-l from-[#fdfdfd] dark:from-[#060608] to-transparent z-10 pointer-events-none" />
      
      <div className="flex whitespace-nowrap animate-scroll group items-center">
        {[...partners, ...partners, ...partners, ...partners].map((partner, idx) => (
          <div 
            key={idx} 
            className="inline-flex flex-col items-center justify-center mx-4 sm:mx-8 md:mx-12 transition-all duration-500 grayscale opacity-70 dark:opacity-60 hover:grayscale-0 hover:opacity-100 shrink-0"
          >
            {partner.logoUrl ? (
              <div className="flex items-center justify-center h-8 sm:h-12 md:h-16 w-24 sm:w-32 md:w-40">
                <img 
                  src={partner.logoUrl.trim() || undefined} 
                  alt={partner.name || 'Partner Logo'} 
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                />
              </div>
            ) : (
              <span className={`text-sm sm:text-xl md:text-3xl font-black tracking-tighter ${partner.color || 'text-slate-900 dark:text-white'} normal-case`}>
                {toTitleCase(partner.name)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnerBar;