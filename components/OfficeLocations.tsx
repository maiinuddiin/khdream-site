import React, { useState } from 'react';
import { MapPin, Phone, Clock, ExternalLink, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../context/CMSContext';
import AbstractBackground from './AbstractBackground';

const OfficeLocations: React.FC = () => {
  const { data } = useCMS();
  const LOCATIONS = data.offices || [];
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderLocationCard = (loc: any, index: number, simple: boolean = false) => {
    const iconToUse = loc.iconUrl || data.locationSettings?.defaultOfficeIconUrl || data.general?.officesIconUrl;
    
    return (
      <div 
        key={loc.id} 
        className={`group p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 flex flex-col justify-between hover:border-primary/30 dark:hover:border-primary/30 ${!simple ? 'h-full' : ''}`}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="min-w-0">
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block truncate" dangerouslySetInnerHTML={{ __html: loc.name || "KH Dream Travels" }} />
              <span className="text-sm font-semibold text-slate-900 dark:text-white block truncate" dangerouslySetInnerHTML={{ __html: loc.city }} />
            </div>
            <a 
              href={loc.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 rounded-md bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-all shrink-0 ml-2"
              title="View on Google Maps"
            >
              <ExternalLink size={12} />
            </a>
          </div>
          
          <div className="flex items-start space-x-2 text-slate-600 dark:text-zinc-400 mb-3">
            <div className="mt-0.5 shrink-0 text-slate-400">
              {iconToUse ? (
                <img 
                  src={iconToUse || null} 
                  alt="" 
                  className="w-3.5 h-3.5 object-contain opacity-70" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <MapPin size={14} />
              )}
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-300" dangerouslySetInnerHTML={{ __html: loc.address }} />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-500 dark:text-zinc-400 text-xs">
            <a href={`tel:${loc.phone}`} className="flex items-center space-x-1.5 hover:text-primary transition-colors min-w-0">
              <Phone size={12} className="shrink-0" />
              <span className="font-medium truncate">{loc.phone}</span>
            </a>
            <div className="flex items-center space-x-1.5 min-w-0">
              <Clock size={12} className="shrink-0" />
              <span className="font-medium truncate" title={loc.hours} dangerouslySetInnerHTML={{ __html: loc.hours }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 h-full flex flex-col relative p-1">
      <AbstractBackground variant="refined-grid" opacity={0.03} position="full" />
      <div className="shrink-0 flex items-end justify-between relative z-10">
        <div>
          <div className="flex items-center space-x-2 text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
            <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
              <div 
                className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-md"
              />
              {(data.locationSettings?.defaultOfficeIconUrl || data.general?.officesIconUrl) ? (
                <img 
                  src={data.locationSettings?.defaultOfficeIconUrl || data.general?.officesIconUrl || null} 
                  alt="" 
                  className="w-2.5 h-2.5 object-contain relative z-10" 
                  referrerPolicy="no-referrer" 
                  style={{
                    opacity: data.locationSettings?.defaultOfficeIconOpacity ?? 1,
                    transform: `rotate(${data.locationSettings?.defaultOfficeIconRotation ?? 0}deg)`,
                    transition: 'transform 0.3s ease, opacity 0.3s ease'
                  }}
                />
              ) : (
                <MapPin size={8} fill="currentColor" className="relative z-10" />
              )}
            </div>
            <span>{data.locationSettings?.sectionSubtitle || "Our Global Presence"}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight font-outfit">
            {data.locationSettings?.sectionTitle ? (
              <span dangerouslySetInnerHTML={{ __html: data.locationSettings.sectionTitle }} />
            ) : (
              <>Find Us <span className="text-primary">Nearby</span></>
            )}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 gap-2 flex-1 overflow-y-auto no-scrollbar pb-3 pr-1">
        {LOCATIONS.slice(0, 8).map((loc, index) => renderLocationCard(loc, index))}
      </div>

      {LOCATIONS.length > 8 && (
        <div className="flex justify-center pt-1 shrink-0">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 text-slate-500 hover:text-primary transition-colors text-[9px] font-bold uppercase tracking-widest group border-b border-transparent hover:border-primary pb-0.5"
          >
            <span>All Branches</span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Locations Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 1, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: 10 }}
              className="relative w-full max-w-6xl bg-white dark:bg-[#0b0b18] rounded-3xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-white/5"
            >
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-outfit">Our Worldwide <span className="text-primary">Network</span></h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Explore all {LOCATIONS.length} of our physical office locations</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 bg-slate-100/50 dark:bg-white/5 rounded-full text-slate-500 hover:bg-primary hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {LOCATIONS.map((loc, index) => renderLocationCard(loc, index, true))}
              </div>

              <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex justify-center shrink-0">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-12 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all active:scale-95"
                >
                  Close Directory
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OfficeLocations;
