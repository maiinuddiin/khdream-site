import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, CheckSquare, ChevronDown, Briefcase, Loader2, FileText, CheckCircle, Phone, Plane } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../context/CMSContext';

interface BusinessSetupInlineProps {
  isExpanded?: boolean;
  onCollapse?: () => void;
  onSearch?: () => void;
}

const BusinessSetupInline: React.FC<BusinessSetupInlineProps> = ({ isExpanded = true, onCollapse, onSearch }) => {
  const { data } = useCMS();
  const [selectedType, setSelectedType] = useState('');
  const [industry, setIndustry] = useState('');
  
  const [typeQuery, setTypeQuery] = useState('');
  const [industryQuery, setIndustryQuery] = useState('');

  const [searching, setSearching] = useState(false);
  const [setupInfo, setSetupInfo] = useState<string[] | null>(null);

  const [activePopup, setActivePopup] = useState<'type' | 'industry' | null>(null);
  
  const typeRef = useRef<HTMLDivElement>(null);
  const industryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (activePopup === 'type' && typeRef.current && !typeRef.current.contains(target)) setActivePopup(null);
      if (activePopup === 'industry' && industryRef.current && !industryRef.current.contains(target)) setActivePopup(null);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [activePopup]);

  const handleInquiry = () => {
    if (!selectedType || !industry) return;
    setSearching(true);
    if (onSearch) onSearch();
    
    setTimeout(() => {
      const typeDocs = data.businessOptions.requirements?.[selectedType] || [];
      const industryDocs = data.businessOptions.requirements?.[industry] || [];
      const combinedDocs = [...new Set([...typeDocs, ...industryDocs])].filter(Boolean);

      setSetupInfo(combinedDocs.length > 0 ? combinedDocs : [
        "Trade Name Reservation Certificate",
        "Initial Approval Documents from MISA/DED",
        "Articles of Association (Legalized)",
        "Office Lease (Ejari/Tawtheeq)",
        "Bank Reference Letter",
        "Passport Copies of Partners"
      ]);
      setSearching(false);
    }, 800);
  };

  const renderDropdown = (
    value: string, 
    setter: (val: string) => void, 
    query: string,
    items: string[],
    Icon: any
  ) => {
    const filtered = items.filter(item => 
      item.toLowerCase().includes(query.toLowerCase())
    );

    return (
      <div className="absolute left-0 right-0 top-full mt-1 z-[999] bg-white dark:bg-[#1a1a2e] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-white/5 overflow-y-auto max-h-[300px] no-scrollbar py-2 shrink-0 overflow-x-hidden" onClick={(e) => e.stopPropagation()}>
        {filtered.length > 0 ? (
          filtered.map((item, i) => (
            <button 
              key={i} 
              type="button" 
              onClick={() => { 
                setter(item); 
                setActivePopup(null); 
                if (activePopup === 'type') setTypeQuery(item);
                if (activePopup === 'industry') setIndustryQuery(item);
              }} 
              className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-slate-100 dark:hover:bg-white/10 text-left transition-all group"
            >
              <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-rose-600 transition-all group-hover:bg-rose-600 group-hover:text-white">
                <Icon size={16} />
              </div>
              <span className="text-[12px] font-bold text-slate-900 dark:text-white normal-case tracking-tight group-hover:text-rose-600 transition-colors">{item}</span>
            </button>
          ))
        ) : (
          <div className="px-5 py-4 text-center">
            <p className="text-xs font-bold text-slate-400 normal-case tracking-widest">No matching options</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full">
      <form onSubmit={(e) => { e.preventDefault(); handleInquiry(); }} className="flex flex-col lg:flex-row items-stretch w-full p-1 lg:p-1.5 gap-2 relative">
        
        {/* License Type Dropdown */}
        <div 
          ref={typeRef}
          className="flex-1 flex flex-col justify-center px-4 py-1 bg-slate-100 dark:bg-zinc-800 rounded-sm relative cursor-text" 
          onClick={(e) => {
            e.stopPropagation();
            if (activePopup !== 'type') {
              setActivePopup('type');
              setTypeQuery('');
            }
          }}
        >
          <label className="text-[9px] font-bold text-slate-500 normal-case mb-0.5 tracking-wider">License Type</label>
          <div className="relative">
            <input
              type="text"
              value={activePopup === 'type' ? typeQuery : selectedType}
              onChange={(e) => setTypeQuery(e.target.value)}
              onFocus={() => {
                setActivePopup('type');
                setTypeQuery('');
              }}
              placeholder="Search License Type"
              className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-800 dark:text-white outline-none placeholder:text-slate-300"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${activePopup === 'type' ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {activePopup === 'type' && renderDropdown(selectedType, setSelectedType, typeQuery, data.businessOptions.licenseTypes, Briefcase)}
        </div>

        {/* Industry Dropdown */}
        <div 
          ref={industryRef}
          className="flex-1 flex flex-col justify-center px-4 py-1 bg-slate-100 dark:bg-zinc-800 rounded-sm relative cursor-text" 
          onClick={(e) => {
            e.stopPropagation();
            if (activePopup !== 'industry') {
              setActivePopup('industry');
              setIndustryQuery('');
            }
          }}
        >
          <label className="text-[9px] font-bold text-slate-500 normal-case mb-0.5 tracking-wider">Industry Vertical</label>
          <div className="relative">
            <input
              type="text"
              value={activePopup === 'industry' ? industryQuery : industry}
              onChange={(e) => setIndustryQuery(e.target.value)}
              onFocus={() => {
                setActivePopup('industry');
                setIndustryQuery('');
              }}
              placeholder="Search Industry"
              className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-800 dark:text-white outline-none placeholder:text-slate-300"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${activePopup === 'industry' ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {activePopup === 'industry' && renderDropdown(industry, setIndustry, industryQuery, data.businessOptions.industryTypes, FileText)}
        </div>

        {/* SEARCH BUTTON - ON THE RIGHT */}
        <button 
          type="button" 
          onClick={handleInquiry}
          disabled={searching}
          className="lg:w-48 py-2.5 bg-primary hover:brightness-110 text-white rounded-md font-bold normal-case tracking-wider text-xs transition-all active:scale-95 flex items-center justify-center space-x-2 self-stretch disabled:opacity-50"
        >
          {searching ? <Loader2 className="animate-spin" size={18} /> : (
            <>
              <Briefcase size={18} />
              <span>{(selectedType && industry) ? 'Inquiry' : (data.general.buttonSettings?.businessSetup?.text || data.general.businessSetupButtonText || 'Consult Experts')}</span>
            </>
          )}
        </button>
      </form>

      {setupInfo && isExpanded && (
          <div className="w-full">
            <div className="px-8 pb-8">
              <div className="p-6 bg-slate-50 dark:bg-[#181826]/50 rounded-lg border border-slate-200 dark:border-[#32324d] relative">
                <div className="mb-6">
                  <h4 className="text-[10px] font-black normal-case tracking-widest text-slate-400 mb-1 flex items-center gap-2">
                    <Briefcase size={14} />
                    Setup Roadmap & Requirements
                  </h4>
                  <p className="text-[11px] font-bold text-orange-600 normal-case tracking-widest leading-none">{selectedType} - {industry}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {setupInfo.map((step, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-white dark:bg-[#212134] rounded-md border border-slate-100 dark:border-[#32324d]">
                      <CheckCircle size={14} className="text-orange-500 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-200">{step}</span>
                    </div>
                  ))}
                </div>

                <button 
                  type="button"
                  className="w-full sm:w-auto px-8 py-3 bg-[#2a3143] text-white rounded-md text-[10px] font-black normal-case tracking-widest hover:bg-black transition-all flex items-center justify-center space-x-2"
                  onClick={() => {
                    const msg = `Business Setup Inquiry: ${selectedType} - ${industry}`;
                    window.open(`https://wa.me/${data.general.whatsappBusiness || data.general.whatsapp || '966537681618'}?text=${encodeURIComponent(msg)}`, '_blank');
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

export default BusinessSetupInline;