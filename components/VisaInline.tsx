import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, MessageCircle, ChevronDown, CheckCircle, FileText, Phone, Plane, Globe, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../context/CMSContext';
import { WORLD_COUNTRIES } from '../constants/countries';

interface VisaInlineProps {
  isExpanded?: boolean;
  onCollapse?: () => void;
  onSearch?: () => void;
}

const VisaInline: React.FC<VisaInlineProps> = ({ isExpanded = true, onCollapse, onSearch }) => {
  const { data } = useCMS();
  const [nationality, setNationality] = useState('');
  const [residency, setResidency] = useState('');
  const [destination, setDestination] = useState('');
  
  const [natQuery, setNatQuery] = useState('');
  const [resQuery, setResQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');

  const [searching, setSearching] = useState(false);
  const [requirements, setRequirements] = useState<string[] | null>(null);

  const [activePopup, setActivePopup] = useState<'nationality' | 'residency' | 'destination' | null>(null);
  
  const nationalityRef = useRef<HTMLDivElement>(null);
  const residencyRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (activePopup === 'nationality' && nationalityRef.current && !nationalityRef.current.contains(target)) setActivePopup(null);
      if (activePopup === 'residency' && residencyRef.current && !residencyRef.current.contains(target)) setActivePopup(null);
      if (activePopup === 'destination' && destinationRef.current && !destinationRef.current.contains(target)) setActivePopup(null);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [activePopup]);

  const handleSearch = () => {
    if (!nationality || !residency || !destination) return;
    setSearching(true);
    if (onSearch) onSearch();
    setTimeout(() => {
      const docs = data.visaOptions.requirements?.[destination] || [];
      setRequirements(docs.length > 0 ? docs.filter(Boolean) : [
        "Valid Original Passport (Min 6 months)",
        "Proof of Residency (Min 3 months)",
        "Digital Passport Size Photographs",
        "Bank Statements (Last 6 Months)",
        "Employment Letter / Business License"
      ]);
      setSearching(false);
    }, 800);
  };

  const renderDropdown = (
    value: string, 
    setter: (val: string) => void, 
    query: string,
    items: string[]
  ) => {
    const filtered = items.filter(item => 
      item.toLowerCase().includes(query.toLowerCase())
    );

    return (
      <div className="absolute left-0 right-0 top-full mt-1 z-[999] bg-white dark:bg-[#1a1a2e] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-white/5 overflow-y-auto max-h-[300px] no-scrollbar py-2 shrink-0 overflow-x-hidden" onClick={(e) => e.stopPropagation()}>
        {filtered.length > 0 ? (
          filtered.map((c, i) => (
            <button 
              key={i} 
              type="button" 
              onClick={() => { 
                setter(c); 
                setActivePopup(null); 
                if (activePopup === 'nationality') setNatQuery(c);
                if (activePopup === 'residency') setResQuery(c);
                if (activePopup === 'destination') setDestQuery(c);
              }} 
              className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-slate-100 dark:hover:bg-white/10 text-left transition-all group"
            >
              <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-rose-600 transition-all group-hover:bg-rose-600 group-hover:text-white">
                <Globe size={16} />
              </div>
              <span className="text-[12px] font-bold text-slate-900 dark:text-white normal-case tracking-tight group-hover:text-rose-600 transition-colors">{c}</span>
            </button>
          ))
        ) : (
          <div className="px-5 py-4 text-center">
            <p className="text-xs font-bold text-slate-400 normal-case tracking-widest">No matching countries</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full relative">
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex flex-col lg:flex-row items-stretch w-full p-1 lg:p-1.5 gap-2 relative">
        
        {/* Nationality Dropdown */}
        <div 
          ref={nationalityRef}
          className="flex-1 flex flex-col justify-center px-4 py-1 bg-slate-100 dark:bg-zinc-800 rounded-sm relative cursor-text" 
          onClick={(e) => {
            e.stopPropagation();
            if (activePopup !== 'nationality') {
              setActivePopup('nationality');
              setNatQuery('');
            }
          }}
        >
          <label className="text-[9px] font-bold text-slate-500 normal-case mb-0.5 tracking-wider">Nationality</label>
          <div className="relative">
            <input
              type="text"
              value={activePopup === 'nationality' ? natQuery : nationality}
              onChange={(e) => setNatQuery(e.target.value)}
              onFocus={() => {
                setActivePopup('nationality');
                setNatQuery('');
              }}
              placeholder="Search Nationality"
              className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-800 dark:text-white outline-none placeholder:text-slate-300"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${activePopup === 'nationality' ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {activePopup === 'nationality' && renderDropdown(nationality, setNationality, natQuery, WORLD_COUNTRIES)}
        </div>

        {/* Residency Dropdown */}
        <div 
          ref={residencyRef}
          className="flex-1 flex flex-col justify-center px-4 py-1 bg-slate-100 dark:bg-zinc-800 rounded-sm relative cursor-text" 
          onClick={(e) => {
            e.stopPropagation();
            if (activePopup !== 'residency') {
              setActivePopup('residency');
              setResQuery('');
            }
          }}
        >
          <label className="text-[9px] font-bold text-slate-500 normal-case mb-0.5 tracking-wider">Residency</label>
          <div className="relative">
            <input
              type="text"
              value={activePopup === 'residency' ? resQuery : residency}
              onChange={(e) => setResQuery(e.target.value)}
              onFocus={() => {
                setActivePopup('residency');
                setResQuery('');
              }}
              placeholder="Search Residency"
              className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-800 dark:text-white outline-none placeholder:text-slate-300"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${activePopup === 'residency' ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {activePopup === 'residency' && renderDropdown(residency, setResidency, resQuery, data.visaOptions.residencies)}
        </div>

        {/* Destination Dropdown */}
        <div 
          ref={destinationRef}
          className="flex-1 flex flex-col justify-center px-4 py-1 bg-slate-100 dark:bg-zinc-800 rounded-sm relative cursor-text" 
          onClick={(e) => {
            e.stopPropagation();
            if (activePopup !== 'destination') {
              setActivePopup('destination');
              setDestQuery('');
            }
          }}
        >
          <label className="text-[9px] font-bold text-slate-500 normal-case mb-0.5 tracking-wider">Destination</label>
          <div className="relative">
            <input
              type="text"
              value={activePopup === 'destination' ? destQuery : destination}
              onChange={(e) => setDestQuery(e.target.value)}
              onFocus={() => {
                setActivePopup('destination');
                setDestQuery('');
              }}
              placeholder="Search Destination"
              className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-800 dark:text-white outline-none placeholder:text-slate-300"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${activePopup === 'destination' ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {activePopup === 'destination' && renderDropdown(destination, setDestination, destQuery, data.visaOptions.destinations)}
        </div>

        {/* SEARCH BUTTON - ON THE RIGHT */}
        <button 
          type="button" 
          onClick={handleSearch}
          disabled={searching}
          className="lg:w-48 py-2.5 bg-primary hover:brightness-110 text-white rounded-md font-bold normal-case tracking-wider text-xs transition-all active:scale-95 flex items-center justify-center space-x-2 self-stretch disabled:opacity-50"
        >
          {searching ? <Loader2 className="animate-spin" size={18} /> : (
            <>
              <Plane size={18} />
              <span>{(nationality && residency && destination) ? 'Inquiry' : (data.general.buttonSettings?.visaSearch?.text || data.general.visaSearchButtonText || 'Check Requirements')}</span>
            </>
          )}
        </button>
      </form>

      {requirements && isExpanded && (
          <div className="w-full">
            <div className="px-8 pb-8">
              <div className="p-6 bg-slate-50 dark:bg-[#181826]/50 rounded-lg border border-slate-200 dark:border-[#32324d] relative">
                <div className="mb-6">
                  <h4 className="text-[10px] font-black normal-case tracking-widest text-slate-400 mb-1 flex items-center gap-2">
                    <FileText size={14} />
                    Required Documentation
                  </h4>
                  <p className="text-[11px] font-bold text-primary normal-case tracking-widest leading-none">Requirements for {destination}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {requirements.map((req, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-white dark:bg-[#212134] rounded-md border border-slate-100 dark:border-[#32324d]">
                      <CheckCircle size={14} className="text-primary shrink-0" />
                      <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-200">{req}</span>
                    </div>
                  ))}
                </div>
                <button 
                  type="button"
                  className="w-full sm:w-auto px-8 py-3 bg-[#2a3143] text-white rounded-md text-[10px] font-black normal-case tracking-widest hover:bg-black transition-all flex items-center justify-center space-x-2"
                  onClick={() => {
                    const msg = `Visa Inquiry: ${nationality} citizen living in ${residency} for ${destination}`;
                    window.open(`https://wa.me/${data.general.whatsappVisas || data.general.whatsappBooking || data.general.whatsapp || '966537681618'}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                >
                  <MessageCircle size={14} />
                  <span>Inquiry for Processing</span>
                </button>

                {/* COLLAPSE BUTTON FIXED INSIDE EXPANDED AREA */}
                <div className="absolute bottom-4 right-4">
                  <button 
                    type="button"
                    onClick={onCollapse}
                    className="flex w-8 h-8 items-center justify-center text-slate-500 dark:text-red-200 hover:text-primary dark:hover:text-white transition-all bg-white dark:bg-[#212134] rounded-full shadow-lg border border-slate-200 dark:border-[#32324d] hover:scale-110 active:scale-95 group"
                    title="Collapse Details"
                  >
                    <ChevronDown size={16} className="transition-transform duration-500 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* NO EXTERNAL COLLAPSE BUTTON - ONLY INSIDE EXPANDED AREA */}
    </div>
  );
};

export default VisaInline;