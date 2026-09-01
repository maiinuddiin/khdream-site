import React, { useState } from 'react';
import { X, Briefcase, MessageCircle, FileText, CheckSquare, Building2, TrendingUp, Plane } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

interface BusinessSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BusinessSetupModal: React.FC<BusinessSetupModalProps> = ({ isOpen, onClose }) => {
  const { data } = useCMS();
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInquiry = () => {
    const msg = `Business Setup Inquiry for: ${selectedLicense}. Please provide more details.`;
    window.open(`https://wa.me/${data.general.whatsappBusiness}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const licenseRequirements = selectedLicense ? (data.businessOptions.requirements?.[selectedLicense] || []) : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-[40px] overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh] animate-in zoom-in duration-500">
        
        <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Briefcase size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">Saudi Business Setup</h2>
              <p className="text-[10px] uppercase font-bold text-primary tracking-[0.4em]">Propelling Your Vision in KSA</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all">
            <X size={24} className="text-slate-400" />
          </button>
        </div>
 
        <div className="overflow-y-auto no-scrollbar flex-1 p-6 md:p-10 space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
             <h3 className="text-2xl md:text-3xl font-black dark:text-white uppercase leading-tight tracking-tighter">Welcome to the Land of Opportunity</h3>
             <p className="text-sm md:text-base text-slate-500 dark:text-zinc-400 font-medium">Establishing a presence in the Kingdom of Saudi Arabia is a strategic milestone. KH Dream Services provides end-to-end legal and logistical support for international investors.</p>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.businessOptions.licenseTypes.map((type, i) => (
              <button 
                key={i}
                onClick={() => setSelectedLicense(type)}
                className={`p-8 rounded-[32px] border-2 transition-all flex flex-col items-center text-center space-y-4 group
                  ${selectedLicense === type ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10' : 'border-black/5 dark:border-white/5 hover:border-primary/50 bg-slate-50 dark:bg-zinc-900/40'}`}
              >
                <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-primary shadow-md group-hover:scale-110 transition-transform">
                  <Building2 size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase dark:text-white mb-1 tracking-tighter">{type}</h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Saudi Arabia Business License</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${selectedLicense === type ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-400'}`}>
                  {selectedLicense === type ? 'Selected' : 'Select'}
                </div>
              </button>
            ))}
          </div>
 
          {selectedLicense && (
            <div className="p-8 bg-slate-50 dark:bg-zinc-900/50 rounded-3xl border border-black/5 dark:border-white/5 animate-in slide-in-from-bottom-6">
              <div className="mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest mb-2 dark:text-white flex items-center space-x-2">
                  <FileText size={16} className="text-primary" />
                  <span>{selectedLicense} Requirements</span>
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Checklist for KSA License</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(licenseRequirements.length > 0 ? licenseRequirements.filter(Boolean) : [
                  "Certificate of Commercial Registration (Legalized)",
                  "Audited Financial Statements (Last 2 Years)",
                  "Articles of Association & By-laws",
                  "Power of Attorney for Local Representative",
                  "MISA License Application Documents",
                  "Valid Passport Copies of Shareholders"
                ]).map((req, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-black/5 dark:border-white/5">
                    <CheckSquare size={14} className="text-primary shrink-0" />
                    <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 uppercase leading-none">{req}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleInquiry}
                className="w-full mt-10 py-6 bg-[#2a3143] text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center space-x-4 shadow-2xl hover:bg-black transition-all"
              >
                <MessageCircle size={20} />
                <span>Inquiry for Processing</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessSetupModal;