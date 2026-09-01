import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Plane, PlaneTakeoff, PlaneLanding, MapPin, Calendar, ChevronDown, Users, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../context/CMSContext';
import { WORLD_COUNTRIES, GLOBAL_AIRPORTS } from '../constants/countries';

const AIRPORTS = GLOBAL_AIRPORTS;

const CustomCalendar: React.FC<{ 
  onSelect: (date: string) => void; 
  selectedDate?: string;
  minDate?: string;
}> = ({ onSelect, selectedDate, minDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || new Date()));
  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDay = (y: number, m: number) => new Date(y, m, 1).getDay();
  const days = daysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const start = firstDay(currentMonth.getFullYear(), currentMonth.getMonth());
  const dateArr = Array.from({ length: days }, (_, i) => i + 1);
  const paddingArr = Array.from({ length: start }, (_, i) => null);

  return (
    <div className="p-4 bg-white dark:bg-[#1a1a2e] rounded-xl shadow-2xl border border-slate-100 dark:border-white/5 w-full max-w-[320px]">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full">
          <ChevronDown className="rotate-90 text-slate-400" size={16} />
        </button>
        <span className="text-xs font-black uppercase dark:text-white">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full">
          <ChevronDown className="-rotate-90 text-slate-400" size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d} className="text-[10px] font-bold text-slate-400 text-center">{d}</span>)}
        {paddingArr.map((_, i) => <div key={`p-${i}`} />)}
        {dateArr.map(d => {
          const ds = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const selected = selectedDate === ds;
          const minD = minDate ? new Date(minDate) : new Date(new Date().setHours(0,0,0,0));
          const isDisabled = new Date(ds) < minD;
          
          return (
            <button 
              key={d} 
              type="button" 
              disabled={isDisabled}
              onClick={() => onSelect(ds)} 
              className={`h-9 w-9 rounded-lg text-xs font-bold transition-all ${selected ? 'bg-primary text-white' : 'hover:bg-slate-50 dark:hover:bg-white/5 dark:text-white'} ${isDisabled ? 'opacity-10 cursor-not-allowed' : ''}`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface FlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FlightSearchModal: React.FC<FlightSearchModalProps> = ({ isOpen, onClose }) => {
  const { data } = useCMS();
  
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState(today);
  const [returnDate, setReturnDate] = useState(nextWeek);
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState('Economy');
  
  const [isDirectOnly, setIsDirectOnly] = useState(true);
  
  const [searching, setSearching] = useState(false);
  const [activePopup, setActivePopup] = useState<'origin' | 'destination' | 'departure' | 'return' | 'guests' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const departureRef = useRef<HTMLDivElement>(null);
  const returnRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (activePopup === 'origin' && originRef.current && !originRef.current.contains(target)) setActivePopup(null);
      if (activePopup === 'destination' && destinationRef.current && !destinationRef.current.contains(target)) setActivePopup(null);
      if (activePopup === 'departure' && departureRef.current && !departureRef.current.contains(target)) setActivePopup(null);
      if (activePopup === 'return' && returnRef.current && !returnRef.current.contains(target)) setActivePopup(null);
      if (activePopup === 'guests' && guestsRef.current && !guestsRef.current.contains(target)) setActivePopup(null);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [activePopup]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    
    const message = `Flight Inquiry:
Route: ${origin} to ${destination}
Type: ${isRoundTrip ? 'Round Trip' : 'One Way'}
Departure: ${departureDate}
${isRoundTrip ? `Return: ${returnDate}\n` : ''}Passengers: ${adults} Adults, ${children} Children, ${infants} Infants
Class: ${cabinClass}
${isDirectOnly ? 'Direct Flights Only: Yes' : ''}`;
    
    setTimeout(() => {
      setSearching(false);
      const whatsappNumber = data.general.whatsappBooking || data.general.whatsapp || '';
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
      onClose();
    }, 1000);
  };

  const filteredAirports = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (q === '') return AIRPORTS.slice(0, 10);
    return AIRPORTS.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.country.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-[#0f0f1a] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase text-slate-800 dark:text-white">Search Flights</h2>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Premium Travel Planning</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="p-8 space-y-4">
          <div className="flex items-center space-x-6 mb-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" checked={isRoundTrip} onChange={() => setIsRoundTrip(true)} className="accent-primary" />
              <span className="text-[10px] font-black uppercase dark:text-white">Round Trip</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" checked={!isRoundTrip} onChange={() => setIsRoundTrip(false)} className="accent-primary" />
              <span className="text-[10px] font-black uppercase dark:text-white">One Way</span>
            </label>
            <div className="h-3 w-[1px] bg-slate-200 dark:bg-white/10" />
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isDirectOnly} 
                onChange={(e) => setIsDirectOnly(e.target.checked)}
                className="w-3 h-3 accent-primary rounded"
              />
              <span className="text-[10px] font-black uppercase dark:text-white">Direct Flights Only</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ORIGIN */}
            <div ref={originRef} className="space-y-2 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From</label>
              <div 
                className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-primary/50 transition-all cursor-text"
                onClick={() => { setActivePopup('origin'); setSearchQuery(''); }}
              >
                <PlaneTakeoff size={18} className="text-primary" />
                <input 
                  type="text" 
                  value={activePopup === 'origin' ? searchQuery : origin}
                  onChange={(e) => { setSearchQuery(e.target.value); setOrigin(e.target.value); }}
                  placeholder="Origin City" 
                  className="bg-transparent text-sm font-bold w-full outline-none dark:text-white"
                />
              </div>
              {activePopup === 'origin' && (
                <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-white dark:bg-[#1a1a2e] rounded-xl shadow-2xl border border-white/5 overflow-hidden max-h-48 overflow-y-auto no-scrollbar">
                  {filteredAirports.map((c, i) => (
                    <button key={i} type="button" onClick={() => { setOrigin(`${c.name}, ${c.code}`); setActivePopup(null); }} className="w-full px-5 py-3 hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors group flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black dark:text-white uppercase">{c.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{c.country}</div>
                      </div>
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded tracking-widest">{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DESTINATION */}
            <div ref={destinationRef} className="space-y-2 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To</label>
              <div 
                className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent focus-within:border-primary/50 transition-all cursor-text"
                onClick={() => { setActivePopup('destination'); setSearchQuery(''); }}
              >
                <PlaneLanding size={18} className="text-primary" />
                <input 
                  type="text" 
                  value={activePopup === 'destination' ? searchQuery : destination}
                  onChange={(e) => { setSearchQuery(e.target.value); setDestination(e.target.value); }}
                  placeholder="Destination" 
                  className="bg-transparent text-sm font-bold w-full outline-none dark:text-white"
                />
              </div>
              {activePopup === 'destination' && (
                <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-white dark:bg-[#1a1a2e] rounded-xl shadow-2xl border border-white/5 overflow-hidden max-h-48 overflow-y-auto no-scrollbar">
                  {filteredAirports.map((c, i) => (
                    <button key={i} type="button" onClick={() => { setDestination(`${c.name}, ${c.code}`); setActivePopup(null); }} className="w-full px-5 py-3 hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors group flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black dark:text-white uppercase">{c.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{c.country}</div>
                      </div>
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded tracking-widest">{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DEPARTURE */}
            <div ref={departureRef} className="space-y-2 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departure</label>
              <div 
                className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl cursor-pointer"
                onClick={() => setActivePopup(activePopup === 'departure' ? null : 'departure')}
              >
                <Calendar size={18} className="text-primary" />
                <span className="text-sm font-bold dark:text-white">{departureDate}</span>
              </div>
              {activePopup === 'departure' && (
                <div className="absolute top-full left-0 z-30">
                  <CustomCalendar selectedDate={departureDate} onSelect={d => { setDepartureDate(d); setActivePopup(null); }} />
                </div>
              )}
            </div>

            {/* RETURN */}
            {isRoundTrip && (
              <div ref={returnRef} className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Return</label>
                <div 
                  className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl cursor-pointer"
                  onClick={() => setActivePopup(activePopup === 'return' ? null : 'return')}
                >
                  <Calendar size={18} className="text-primary" />
                  <span className="text-sm font-bold dark:text-white">{returnDate}</span>
                </div>
                {activePopup === 'return' && (
                  <div className="absolute top-full right-0 z-30">
                    <CustomCalendar selectedDate={returnDate} minDate={departureDate} onSelect={d => { setReturnDate(d); setActivePopup(null); }} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GUESTS */}
            <div ref={guestsRef} className="space-y-2 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Travelers</label>
              <div 
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl cursor-pointer"
                onClick={() => setActivePopup(activePopup === 'guests' ? null : 'guests')}
              >
                <div className="flex items-center space-x-3 text-sm font-bold dark:text-white">
                  <Users size={18} className="text-primary" />
                  <span>{adults + children + infants} Pax</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
              {activePopup === 'guests' && (
                <div className="absolute right-0 top-full mt-2 z-30 w-full bg-white dark:bg-[#1a1a2e] rounded-xl shadow-2xl border border-white/5 p-6 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                    <div className="space-y-5">
                      {[
                        { label: 'Adults', desc: '12+ yrs', val: adults, set: setAdults, min: 1 },
                        { label: 'Children', desc: '2-12 yrs', val: children, set: setChildren, min: 0 },
                        { label: 'Infants', desc: 'Under 2', val: infants, set: setInfants, min: 0 }
                      ].map(p => (
                        <div key={p.label} className="flex items-center justify-between">
                          <div>
                            <div className="text-[11px] font-black uppercase dark:text-white">{p.label}</div>
                            <div className="text-[8px] font-bold uppercase text-slate-400 tracking-wider font-mono">{p.desc}</div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <button type="button" onClick={() => p.set(Math.max(p.min, p.val - 1))} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-primary transition-all">-</button>
                            <span className="text-sm font-black w-4 text-center dark:text-white">{p.val}</span>
                            <button type="button" onClick={() => p.set(p.val + 1)} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-primary transition-all">+</button>
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => setActivePopup(null)} className="w-full py-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest mt-2 shadow-lg shadow-primary/20">Set Passengers</button>
                    </div>
                </div>
              )}
            </div>

            {/* CLASS */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cabin Class</label>
              <select 
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent focus:border-primary/50 outline-none text-sm font-bold dark:text-white appearance-none cursor-pointer"
              >
                <option value="Economy">Economy</option>
                <option value="Business">Business</option>
                <option value="First">First Class</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={searching}
            className="w-full py-5 bg-gradient-themed hover:brightness-110 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center space-x-3 mt-4"
          >
            {searching ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <Plane size={20} />
                <span>Request Flight Quote</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default FlightSearchModal;
