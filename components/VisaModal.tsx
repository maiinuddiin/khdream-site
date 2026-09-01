import React, { useState, useRef, useEffect } from 'react';
import { X, Globe, MapPin, FileText, Search, MessageCircle, ChevronDown, CheckCircle, Plane } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { WORLD_COUNTRIES } from '../constants/countries';
import AbstractBackground from './AbstractBackground';

interface VisaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VisaModal: React.FC<VisaModalProps> = ({ isOpen, onClose }) => {
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

  if (!isOpen) return null;

  const handleBook = () => {
    const message = `I would like to inquire about visa requirements for:
Nationality: ${nationality}
Residency: ${residency}
Destination: ${destination}`;
    window.open(`https://wa.me/${data.general.whatsappBusiness}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSearch = () => {
    if (!nationality || !residency || !destination) return;
    setSearching(true);
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

  const selectStyle = "w-full pl-12 pr-4 py-4 rounded-xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 text-sm font-bold outline-none focus:ring-2 focus:ring-red-600 appearance-none flex items-center justify-between cursor-text transition-all hover:bg-slate-50 dark:hover:bg-white/5";

  const renderDropdown = (
    value: string, 
    setter: (val: string) => void, 
    query: string,
    type: 'nationality' | 'residency' | 'destination'
  ) => {
    const options = 
      type === 'nationality' ? WORLD_COUNTRIES :
      type === 'residency' ? data.visaOptions.residencies :
      data.visaOptions.destinations;

    const filtered = options.filter(c => 
      c.toLowerCase().includes(query.toLowerCase())
    );

    return (
      <div className="absolute left-0 right-0 top-full mt-2 z-[999] bg-white dark:bg-[#1a1a2e] rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-white/5 overflow-y-auto max-h-[250px] no-scrollbar py-2 shrink-0 overflow-x-hidden" onClick={(e) => e.stopPropagation()}>
        <AbstractBackground variant="refined-grid" opacity={0.03} position="full" />
        {filtered.length > 0 ? (
          filtered.map((c, i) => (
            <button 
              key={i} 
              type="button" 
              onClick={() => { 
                setter(c); 
                setActivePopup(null); 
                if (type === 'nationality') setNatQuery(c);
                if (type === 'residency') setResQuery(c);
                if (type === 'destination') setDestQuery(c);
              }} 
              className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-slate-100 dark:hover:bg-white/10 text-left transition-all group"
            >
              <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-rose-600 transition-all group-hover:bg-rose-600 group-hover:text-white">
                <Globe size={16} />
              </div>
              <span className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-rose-600 transition-colors">{c}</span>
            </button>
          ))
        ) : (
          <div className="px-5 py-4 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching countries</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={onClose} />
      <AbstractBackground variant="noise" opacity={0.02} position="full" />
      <AbstractBackground variant="map" opacity={0.03} position="full" />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh] animate-in zoom-in duration-500">
        <AbstractBackground variant="mesh" opacity={0.01} position="center" />
        
        <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 relative overflow-hidden bg-slate-50/50 dark:bg-white/[0.02] backdrop-blur-md">
          <AbstractBackground variant="refined-grid" opacity={0.05} position="full" />
          <div className="flex items-center space-x-5 relative z-10">
            <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-xl">
              <FileText size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Visa Concierge</h2>
              <p className="text-[10px] uppercase font-bold text-red-600 tracking-[0.4em]">Expert Documentation Support</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar flex-1 p-6 md:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Nationality</label>
              <div 
                ref={nationalityRef}
                className={selectStyle} 
                onClick={(e) => {
                  e.stopPropagation();
                  if (activePopup !== 'nationality') {
                    setActivePopup('nationality');
                    setNatQuery('');
                  }
                }}
              >
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={activePopup === 'nationality' ? natQuery : (nationality || '')}
                  onChange={(e) => setNatQuery(e.target.value)}
                  onFocus={() => {
                    setActivePopup('nationality');
                    setNatQuery('');
                  }}
                  placeholder="Select Nationality"
                  className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-800 dark:text-white outline-none placeholder:text-slate-400"
                />
                <ChevronDown className={`text-slate-400 transition-transform ${activePopup === 'nationality' ? 'rotate-180' : ''}`} size={16} />
              </div>
              {activePopup === 'nationality' && renderDropdown(nationality, setNationality, natQuery, 'nationality')}
            </div>

            <div className="space-y-3 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Residency</label>
              <div 
                ref={residencyRef}
                className={selectStyle} 
                onClick={(e) => {
                  e.stopPropagation();
                  if (activePopup !== 'residency') {
                    setActivePopup('residency');
                    setResQuery('');
                  }
                }}
              >
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={activePopup === 'residency' ? resQuery : (residency || '')}
                  onChange={(e) => setResQuery(e.target.value)}
                  onFocus={() => {
                    setActivePopup('residency');
                    setResQuery('');
                  }}
                  placeholder="Select Residency"
                  className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-800 dark:text-white outline-none placeholder:text-slate-400"
                />
                <ChevronDown className={`text-slate-400 transition-transform ${activePopup === 'residency' ? 'rotate-180' : ''}`} size={16} />
              </div>
              {activePopup === 'residency' && renderDropdown(residency, setResidency, resQuery, 'residency')}
            </div>

            <div className="space-y-3 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Destination</label>
              <div 
                ref={destinationRef}
                className={selectStyle} 
                onClick={(e) => {
                  e.stopPropagation();
                  if (activePopup !== 'destination') {
                    setActivePopup('destination');
                    setDestQuery('');
                  }
                }}
              >
                <Plane className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={activePopup === 'destination' ? destQuery : (destination || '')}
                  onChange={(e) => setDestQuery(e.target.value)}
                  onFocus={() => {
                    setActivePopup('destination');
                    setDestQuery('');
                  }}
                  placeholder="Select Destination"
                  className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-800 dark:text-white outline-none placeholder:text-slate-400"
                />
                <ChevronDown className={`text-slate-400 transition-transform ${activePopup === 'destination' ? 'rotate-180' : ''}`} size={16} />
              </div>
              {activePopup === 'destination' && renderDropdown(destination, setDestination, destQuery, 'destination')}
            </div>
          </div>

          <button 
            onClick={handleSearch}
            disabled={!nationality || !residency || !destination || searching}
            className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-xl shadow-red-600/20 disabled:opacity-40 transition-all font-sans"
          >
            {searching ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plane size={18} /> 
                <span>{(nationality && residency && destination) ? 'Inquiry' : 'Check Requirements'}</span>
              </>
            )}
          </button>

          {requirements && (
            <div className="p-8 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-black/5 dark:border-white/5 animate-in slide-in-from-bottom-4">
              <div className="mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest mb-2 dark:text-white flex items-center space-x-2">
                  <CheckCircle size={16} className="text-red-600" />
                  <span>Document Checklist</span>
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requirements for {destination}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requirements.map((req, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-white/5">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                    <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 uppercase leading-none">{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisaModal;