import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Hotel, Search, Loader2, MapPin, Calendar, MessageCircle, Star, ChevronLeft, ChevronRight, Users, Globe, Building } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { POPULAR_CITIES, WORLD_COUNTRIES } from '../constants/countries';

interface HotelSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CITIES = [
  ...POPULAR_CITIES,
  ...WORLD_COUNTRIES.map(c => ({ name: '', country: c }))
];

const CustomCalendar: React.FC<{ 
  onSelect: (date: string) => void; 
  selectedDate?: string;
  minDate?: string;
  startDate?: string;
  endDate?: string;
}> = ({ onSelect, selectedDate, minDate, startDate, endDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || new Date()));
  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDay = (y: number, m: number) => new Date(y, m, 1).getDay();
  const days = daysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const start = firstDay(currentMonth.getFullYear(), currentMonth.getMonth());
  const dateArr = Array.from({ length: days }, (_, i) => i + 1);
  const paddingArr = Array.from({ length: start }, (_, i) => null);

  const isSelected = (ds: string) => selectedDate === ds;
  const isInRange = (ds: string) => {
    if (!startDate || !endDate) return false;
    const d = new Date(ds);
    return d > new Date(startDate) && d < new Date(endDate);
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-800 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] w-[320px] border border-black/5 dark:border-white/10 animate-in fade-in zoom-in-95 duration-300 z-[150]">
      <div className="flex items-center justify-between mb-6">
        <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-full transition-colors border border-slate-100 dark:border-white/5">
          <ChevronLeft size={16} className="text-slate-400" />
        </button>
        <span className="text-[11px] font-black uppercase tracking-[0.2em] dark:text-zinc-100">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-full transition-colors border border-slate-100 dark:border-white/5">
          <ChevronRight size={16} className="text-slate-400" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={`${d}-${i}`} className="text-[9px] font-black text-slate-300 dark:text-zinc-600 text-center mb-2">{d}</span>)}
        {paddingArr.map((_, i) => <div key={`p-${i}`} />)}
        {dateArr.map(d => {
          const ds = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const selected = isSelected(ds);
          const range = isInRange(ds);
          const isCheckIn = ds === startDate;
          const isCheckOut = ds === endDate;
          
          const minD = minDate ? new Date(minDate) : new Date(new Date().setHours(0,0,0,0));
          const isDisabled = new Date(ds) < minD;
          
          return (
            <button 
              key={d} 
              type="button" 
              disabled={isDisabled} 
              onClick={() => onSelect(ds)} 
              className={`h-10 w-10 rounded-xl text-[11px] font-black transition-all relative ${
                selected || isCheckIn || isCheckOut 
                  ? 'bg-primary text-white shadow-xl shadow-primary/30' 
                  : range 
                    ? 'bg-primary/5 dark:bg-primary/10 text-primary'
                    : 'hover:bg-slate-100 dark:hover:bg-zinc-700 dark:text-zinc-300'
              } ${isDisabled ? 'opacity-10 cursor-not-allowed' : ''}`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const HotelSearchModal: React.FC<HotelSearchModalProps> = ({ isOpen, onClose }) => {
  const { data } = useCMS();
  
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [query, setQuery] = useState('');
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePopup, setActivePopup] = useState<'checkIn' | 'checkOut' | 'destination' | 'guests' | null>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const checkInRef = useRef<HTMLDivElement>(null);
  const checkOutRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (activePopup === 'destination' && destinationRef.current && !destinationRef.current.contains(target)) setActivePopup(null);
      if (activePopup === 'checkIn' && checkInRef.current && !checkInRef.current.contains(target)) setActivePopup(null);
      if (activePopup === 'checkOut' && checkOutRef.current && !checkOutRef.current.contains(target)) setActivePopup(null);
      if (activePopup === 'guests' && guestsRef.current && !guestsRef.current.contains(target)) setActivePopup(null);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [activePopup]);

  if (!isOpen) return null;

  const filteredCities = useMemo(() => {
    const q = (query || '').toLowerCase().trim();
    if (q === '') {
      // Show countries first when blank
      return CITIES.filter(c => !c.name).slice(0, 30);
    }
    // Search both name and country
    return CITIES.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.country.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [query]);

  const calculateFinalPrice = (base: string) => {
    const num = parseFloat(base.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return base;
    return `${Math.round(num * 1.10).toLocaleString()} SAR`; 
  };

  const updateChildren = (val: number) => {
    setChildren(val);
    if (val > childAges.length) {
      setChildAges([...childAges, ...Array(val - childAges.length).fill(5)]);
    } else {
      setChildAges(childAges.slice(0, val));
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate finding results
    setTimeout(() => {
      setResults([
        { name: 'Grand Royal Palace', location: query || 'Central District', rating: '5-Star Luxury', basePrice: '1,200 SAR', description: 'Experience unparalleled luxury with panoramic views.' },
        { name: 'Skyline Premium Suites', location: query || 'Business Bay', rating: '4-Star Premium', basePrice: '850 SAR', description: 'Modern comfort designed for the global traveler.' },
        { name: 'Heritage Heritage Hotel', location: query || 'Old Town', rating: '4-Star Heritage', basePrice: '600 SAR', description: 'Traditional charm meets contemporary hospitality.' }
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={onClose} />
      <div className="relative w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-[40px] overflow-hidden shadow-2xl border border-black/5 dark:border-white/5 flex flex-col max-h-[95vh] animate-in zoom-in duration-500">
        
        <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-primary rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 group">
              <Hotel size={32} className="group-hover:-translate-y-1 transition-transform duration-500" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black dark:text-zinc-100 tracking-tighter uppercase leading-none">Global Stay Finder</h2>
              <p className="text-[9px] mt-2 uppercase font-black text-primary tracking-[0.4em] opacity-80">Premium Hotel Inventory Access</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all border border-black/5 dark:border-white/5"><X size={24} className="text-slate-400" /></button>
        </div>

        <div className="overflow-y-auto no-scrollbar flex-1 p-6 md:p-10 space-y-10">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-8 bg-slate-50 dark:bg-zinc-800/40 rounded-[32px] border border-black/5 dark:border-white/5 shadow-inner">
            
            <div ref={destinationRef} className="md:col-span-5 relative overflow-visible">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Destination</label>
              <div 
                className="relative group cursor-pointer"
                onClick={(e) => {
                  if (activePopup !== 'destination') {
                    e.stopPropagation();
                    setQuery('');
                    setActivePopup('destination');
                  }
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-primary group-hover:scale-110 transition-transform" size={20} />
                <input 
                  type="text" 
                  placeholder="Where do you want to stay?" 
                  value={query} 
                  onFocus={(e) => {
                    if (activePopup !== 'destination') {
                      e.stopPropagation();
                      setQuery(''); // Clear on focus for easier typing
                      setActivePopup('destination');
                    }
                  }}
                  onChange={e => { setQuery(e.target.value); setActivePopup('destination'); }} 
                  className="w-full pl-16 pr-6 py-6 rounded-[28px] bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-700 text-base font-black dark:text-zinc-100 outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-sm placeholder:text-slate-300" 
                  required 
                />
              </div>
              {activePopup === 'destination' && (
                <div 
                  className="absolute left-0 right-0 top-full mt-3 z-[110] bg-white dark:bg-zinc-800 border border-black/10 dark:border-zinc-700 rounded-[32px] shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                     <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{query.trim() === '' ? 'Popular Countries' : 'Matching Destinations'}</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto no-scrollbar pb-4">
                    {filteredCities.map((city, idx) => (
                      <button 
                        key={idx} 
                        type="button" 
                        onClick={() => { setQuery(city.name ? `${city.name}, ${city.country}` : city.country); setActivePopup(null); }} 
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/10 text-left group transition-all"
                      >
                        <div className="flex items-center space-x-5">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-700 flex items-center justify-center text-rose-600 font-black group-hover:bg-rose-600 group-hover:text-white transition-all">
                            {city.name ? <Building size={18} /> : <Globe size={18} />}
                          </div>
                          <div className="transition-colors">
                            <div className="text-sm font-black uppercase tracking-tight leading-none text-slate-900 dark:text-zinc-100 group-hover:text-rose-600 transition-colors">{city.name || city.country}</div>
                            {city.name && <div className="text-[10px] mt-1.5 font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500 group-hover:text-rose-600/70">{city.country}</div>}
                          </div>
                        </div>
                      </button>
                    ))}
                    {filteredCities.length === 0 && (
                      <button 
                        type="button" 
                        onClick={() => setActivePopup(null)}
                        className="w-full p-8 text-center"
                      >
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Use "{query}" as custom location</p>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div ref={checkInRef} className="md:col-span-2 relative overflow-visible">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Check-in</label>
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePopup(activePopup === 'checkIn' ? null : 'checkIn');
                }} 
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full pl-14 pr-4 py-6 rounded-[28px] bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-700 text-sm font-black dark:text-zinc-100 text-left min-h-[72px] relative hover:ring-4 hover:ring-blue-600/10 transition-all shadow-sm"
              >
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" size={18} />
                {checkIn ? new Date(checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Select'}
              </button>
              {activePopup === 'checkIn' && <div className="absolute left-0 top-full mt-3 z-[110] shadow-2xl" onClick={(e) => e.stopPropagation()}><CustomCalendar selectedDate={checkIn} startDate={checkIn} endDate={checkOut} onSelect={d => { setCheckIn(d); if (new Date(checkOut) <= new Date(d)) { setCheckOut(new Date(new Date(d).getTime() + 86400000).toISOString().split('T')[0]); } setActivePopup('checkOut'); }} /></div>}
            </div>
            
            <div ref={checkOutRef} className="md:col-span-2 relative overflow-visible">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Check-out</label>
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePopup(activePopup === 'checkOut' ? null : 'checkOut');
                }} 
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full pl-14 pr-4 py-6 rounded-[28px] bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-700 text-sm font-black dark:text-zinc-100 text-left min-h-[72px] relative hover:ring-4 hover:ring-blue-600/10 transition-all shadow-sm"
              >
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                {checkOut ? new Date(checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Select'}
              </button>
              {activePopup === 'checkOut' && <div className="absolute left-0 top-full mt-3 z-[110] shadow-2xl" onClick={(e) => e.stopPropagation()}><CustomCalendar selectedDate={checkOut} minDate={new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]} startDate={checkIn} endDate={checkOut} onSelect={d => { setCheckOut(d); setActivePopup(null); }} /></div>}
            </div>

            <div ref={guestsRef} className="md:col-span-3 relative overflow-visible">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Guests</label>
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePopup(activePopup === 'guests' ? null : 'guests');
                }} 
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full pl-14 pr-6 py-6 rounded-[28px] bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-700 text-sm font-black dark:text-zinc-100 text-left min-h-[72px] relative hover:ring-4 hover:ring-blue-600/10 transition-all shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Users className="text-primary" size={18} />
                  <span>{rooms} Room, {adults + children} Guest</span>
                </div>
                <Users size={16} className="text-slate-300" />
              </button>
              
              {activePopup === 'guests' && (
                <div className="absolute right-0 top-full mt-3 z-[110] w-80 bg-white dark:bg-zinc-800 rounded-[32px] shadow-2xl border border-black/10 dark:border-zinc-700 p-8 animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                  <div className="space-y-6">
                    {[
                      { label: 'Rooms', val: rooms, set: setRooms, min: 1 },
                      { label: 'Adults', val: adults, set: setAdults, min: 1 },
                      { label: 'Children', val: children, set: updateChildren, min: 0 }
                    ].map(p => (
                      <div key={p.label} className="flex items-center justify-between">
                        <span className="text-[12px] font-black text-slate-700 dark:text-white uppercase tracking-widest">{p.label}</span>
                        <div className="flex items-center space-x-4">
                          <button type="button" onClick={() => p.set(Math.max(p.min, p.val - 1))} className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-primary transition-all">-</button>
                          <span className="text-[12px] font-black w-4 text-center dark:text-white">{p.val}</span>
                          <button type="button" onClick={() => p.set(p.val + 1)} className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-primary transition-all">+</button>
                        </div>
                      </div>
                    ))}
                    
                    {children > 0 && (
                       <div className="pt-6 mt-4 border-t border-black/5 dark:border-white/5 space-y-4">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Child Ages</p>
                          <div className="grid grid-cols-2 gap-3">
                             {childAges.map((age, i) => (
                                <select 
                                  key={i}
                                  value={age}
                                  onChange={(e) => {
                                    const newAges = [...childAges];
                                    newAges[i] = parseInt(e.target.value);
                                    setChildAges(newAges);
                                  }}
                                  className="p-3 bg-slate-50 dark:bg-zinc-700 rounded-xl text-[10px] font-black outline-none border-none dark:text-white"
                                >
                                  {Array.from({ length: 12 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} Year</option>)}
                                </select>
                             ))}
                          </div>
                       </div>
                    )}
                    
                    <button type="button" onClick={() => setActivePopup(null)} className="w-full py-5 bg-primary text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 transition-all active:scale-95">Set Travelers</button>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-12 mt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center space-x-4 shadow-2xl shadow-emerald-600/20 transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                  <>
                    <Search size={22} />
                    <span>Search Luxury Collection</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="space-y-8 pb-10">
            {results.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center justify-between px-4">
                   <h3 className="text-base font-black uppercase tracking-[0.2em] text-slate-400">{results.length} Properties Found in {query}</h3>
                </div>
                {results.map((hotel, i) => (
                  <div key={i} className="group p-8 bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-[40px] flex flex-col lg:flex-row items-center justify-between gap-10 animate-in slide-in-from-bottom-8 transition-all hover:bg-white dark:hover:bg-white/[0.04] hover:shadow-2xl">
                    <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 w-full lg:w-auto">
                      <div className="w-40 h-40 bg-white dark:bg-zinc-800 rounded-[36px] overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-700 shrink-0">
                        <img src={`https://picsum.photos/seed/${hotel.name}/300/300`} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="max-w-md text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start space-x-2 mb-3">
                           <div className="px-3 py-1 bg-primary text-[10px] font-black text-white rounded-lg uppercase tracking-widest">{hotel.rating}</div>
                        </div>
                        <h4 className="font-black dark:text-zinc-100 text-3xl uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors uppercase">{hotel.name}</h4>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-black uppercase mt-3 tracking-widest flex items-center justify-center md:justify-start">
                          <MapPin size={12} className="mr-2 text-primary" />
                          {hotel.location}
                        </p>
                        <p className="text-[13px] text-slate-500 dark:text-zinc-400 mt-4 leading-relaxed font-medium italic">"{hotel.description}"</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row lg:flex-col items-center lg:items-end space-y-8 md:space-y-0 lg:space-y-6 w-full lg:w-auto">
                      <div className="text-center lg:text-right">
                        <p className="text-[10px] text-primary font-black uppercase mb-2 tracking-widest opacity-80">Starting at</p>
                        <p className="text-4xl font-black dark:text-zinc-100 tracking-tighter leading-none">{calculateFinalPrice(hotel.basePrice)}</p>
                        <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Price for {adults + children} travelers</p>
                      </div>
                      <button 
                        onClick={() => {
                          const childDetails = childAges.length > 0 ? ` (Ages: ${childAges.join(', ')})` : '';
                          const msg = `Lux Hotel Inquiry:
Property: ${hotel.name}
Location: ${hotel.location}
Stay: ${checkIn} to ${checkOut}
Details: ${rooms} Room(s), ${adults} Adults, ${children} Children${childDetails}
Rate: ${calculateFinalPrice(hotel.basePrice)}`;
                          window.open(`https://wa.me/${data.general.whatsappHotels || data.general.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
                        }} 
                        className="w-full md:w-auto px-12 py-6 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-[28px] font-black text-[12px] uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-600 dark:hover:text-white transition-all shadow-2xl flex items-center justify-center space-x-3 active:scale-95"
                      >
                        <span>Book Inquiry</span>
                        <MessageCircle size={20} />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="bg-blue-600/5 dark:bg-white/5 border border-dashed border-blue-600/20 rounded-[40px] p-12 text-center space-y-6">
                   <h5 className="text-xl font-black dark:text-white uppercase tracking-tighter">Looking for someone to help?</h5>
                   <p className="text-[12px] text-slate-500 font-bold max-w-xl mx-auto uppercase tracking-widest leading-loose">
                     Our personal concierges are available 24/7 to handle complex multi-city bookings and group reservations.
                   </p>
                   <button 
                     onClick={() => window.open(`https://wa.me/${data.general.whatsapp}?text=I need a custom hotel concierge service.`, '_blank')}
                     className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-105 transition-all"
                   >
                     Speak to Concierge
                   </button>
                </div>
              </div>
            ) : !loading && (
               <div className="py-20 text-center space-y-6">
                 <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[30px] flex items-center justify-center mx-auto text-slate-300">
                    <Search size={40} />
                 </div>
                 <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Start Searching Above</h3>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Over 1,200 Luxury Properties Await</p>
               </div>
            )}
            
            {loading && (
               <div className="py-32 flex flex-col items-center justify-center space-y-6">
                  <Loader2 className="animate-spin text-blue-600" size={48} />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Syncing with Global Inventory...</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelSearchModal;