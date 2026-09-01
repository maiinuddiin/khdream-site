import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Loader2, MapPin, Calendar, ChevronDown, ChevronRight, Users, Globe, Building, MessageCircle, Star, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../context/CMSContext';
import { WORLD_COUNTRIES, POPULAR_CITIES } from '../constants/countries';

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
    <div className="p-6 bg-white dark:bg-[#212134] rounded-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-[320px] border border-slate-100 dark:border-white/5 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-6">
        <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-[#32324d] rounded-full transition-colors border border-slate-100 dark:border-white/5">
          <ChevronDown className="rotate-90 text-slate-400" size={14} />
        </button>
        <span className="text-[12px] font-black uppercase tracking-widest text-[#2a3143] dark:text-white">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-[#32324d] rounded-full transition-colors border border-slate-100 dark:border-white/5">
          <ChevronDown className="-rotate-90 text-slate-400" size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => <span key={`${d}-${i}`} className="text-[9px] font-black text-slate-300 dark:text-slate-500 text-center mb-2 uppercase">{d[0]}</span>)}
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
              className={`h-10 w-10 rounded-sm text-[11px] font-bold transition-all relative ${
                selected || isCheckIn || isCheckOut 
                  ? 'bg-primary text-white z-10' 
                  : range 
                    ? 'bg-primary/5 dark:bg-primary/10 text-primary'
                    : 'hover:bg-slate-100 dark:hover:bg-white/5 dark:text-white text-slate-700'
              } ${isDisabled ? 'opacity-10 cursor-not-allowed' : ''}`}
            >
              {d}
              {(isCheckIn || isCheckOut) && (
                <div className="absolute inset-0 border-2 border-white/20 rounded-sm pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[9px] font-black uppercase text-slate-400">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary/20 dark:bg-primary/30" />
          <span className="text-[9px] font-black uppercase text-slate-400">Range</span>
        </div>
      </div>
    </div>
  );
};

interface HotelSearchInlineProps {
  isExpanded?: boolean;
  onCollapse?: () => void;
  onSearch?: () => void;
}

const HotelSearchInline: React.FC<HotelSearchInlineProps> = ({ isExpanded = true, onCollapse, onSearch }) => {
  const { data } = useCMS();
  
  // Initialize dates to today and tomorrow
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  const [destination, setDestination] = useState('Riyadh, Saudi Arabia');
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [activePopup, setActivePopup] = useState<'destination' | 'checkIn' | 'checkOut' | 'guests' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    if (onSearch) onSearch();

    // Simulate search results
    setTimeout(() => {
      setResults([
        { name: 'Luxury Palace Hotel', price: 'SAR 1,200', rating: 5, location: destination, description: 'Premium 5-star experience with city views.' },
        { name: 'Business Suites', price: 'SAR 850', rating: 4, location: destination, description: 'Modern suites perfect for business travel.' },
        { name: 'City View Inn', price: 'SAR 450', rating: 3, location: destination, description: 'Comfortable stay in the heart of the city.' }
      ]);
      setSearching(false);
    }, 1000);
  };

  const updateChildren = (val: number) => {
    setChildren(val);
    if (val > childAges.length) {
      setChildAges([...childAges, ...Array(val - childAges.length).fill(5)]);
    } else {
      setChildAges(childAges.slice(0, val));
    }
  };

  const handleBooking = (hotelName: string) => {
    const childDetails = childAges.length > 0 ? ` (Ages: ${childAges.join(', ')})` : '';
    const message = `Hotel Inquiry:
Hotel: ${hotelName}
Destination: ${destination}
Check-in: ${checkIn}
Check-out: ${checkOut}
Summary: ${rooms} Room(s), ${adults} Adult(s), ${children} Child(ren)${childDetails}`;
    
    const whatsappNumber = data.general.whatsappBooking || data.general.whatsapp || '';
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredCities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (q === '') {
      // Show countries first when blank
      return CITIES.filter(c => !c.name).slice(0, 30);
    }
    // Search both name and country
    return CITIES.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.country.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [searchQuery]);

  return (
    <div className="flex flex-col w-full relative overflow-visible">
      <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-stretch w-full p-1 lg:p-1.5 gap-2 relative overflow-visible">
        
        {/* DESTINATION INPUT */}
        <div 
          ref={destinationRef} 
          className="flex-1 lg:flex-[1.5] flex flex-col justify-center px-4 py-1 bg-slate-100 dark:bg-zinc-800 rounded-sm relative overflow-visible cursor-pointer"
          onClick={(e) => {
             if (activePopup !== 'destination') {
               e.stopPropagation();
               setSearchQuery('');
               setActivePopup('destination');
             }
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <label className="text-[9px] font-bold text-slate-500 normal-case mb-0.5 tracking-wider">Destination</label>
          <div className="flex items-center space-x-2">
            <MapPin size={16} className="text-primary shrink-0" />
            <input 
              type="text"
              value={activePopup === 'destination' ? searchQuery : destination}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDestination(e.target.value);
              }}
              onFocus={(e) => {
                if (activePopup !== 'destination') {
                  e.stopPropagation();
                  setSearchQuery(''); // Clear on focus for easier typing
                  setActivePopup('destination');
                }
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder="Where are you going?"
              className="text-sm md:text-base font-bold text-slate-800 dark:text-white bg-transparent outline-none w-full placeholder:text-slate-300"
            />
          </div>
          {activePopup === 'destination' && (
            <div 
              className="absolute left-0 right-0 top-full mt-2 z-[999] bg-white dark:bg-[#1a1a2e] rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-white/5 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                 <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{searchQuery.trim() === '' ? 'Popular Countries' : 'Matching Destinations'}</span>
              </div>
              <div className="max-h-64 overflow-y-auto no-scrollbar pb-1">
                {filteredCities.length > 0 ? (
                  filteredCities.map((c, i) => (
                    <button 
                      key={i} 
                      type="button" 
                      onClick={() => { setDestination(c.name ? `${c.name}, ${c.country}` : c.country); setActivePopup(null); }} 
                      className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-slate-100 dark:hover:bg-white/10 text-left transition-all group"
                    >
                      <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-rose-600 transition-all group-hover:bg-rose-600 group-hover:text-white">
                        {c.name ? <Building size={16} /> : <Globe size={16} />}
                      </div>
                      <div className="flex flex-col">
                        <div className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-rose-600 transition-colors">
                          {c.name || c.country}
                        </div>
                        {c.name && (
                          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0 group-hover:text-rose-600/70">
                            {c.country}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <button type="button" onClick={() => { setDestination(searchQuery); setActivePopup(null); }} className="w-full px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 group transition-colors">
                    <div className="text-[12px] font-bold text-slate-900 dark:text-white">Use "{searchQuery}"</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Search as custom location</div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CHECK-IN & CHECK-OUT GROUP */}
        <div className="flex-1 lg:flex-[1.8] flex items-center gap-0 w-full bg-slate-100 dark:bg-zinc-800 rounded-sm relative">
          {/* CHECK-IN */}
          <div 
            ref={checkInRef}
            className={`flex-1 px-4 py-1 hover:bg-slate-100/50 dark:hover:bg-white/5 cursor-pointer flex flex-col justify-center h-full transition-colors relative ${activePopup === 'checkIn' ? 'bg-slate-100 dark:bg-white/10' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActivePopup(activePopup === 'checkIn' ? null : 'checkIn');
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <label className="text-[9px] font-bold text-slate-500 normal-case mb-0.5 tracking-wider">Check-in</label>
            <div className="flex items-center space-x-2">
               <Calendar size={14} className="text-primary shrink-0" />
               <div className="text-sm md:text-base font-bold text-slate-800 dark:text-white truncate">
                {checkIn ? new Date(checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : 'Select Date'}
              </div>
            </div>
            {activePopup === 'checkIn' && (
              <div 
                className="absolute top-full left-0 mt-2 z-[500]"
                onClick={(e) => e.stopPropagation()}
              >
                <CustomCalendar 
                  selectedDate={checkIn} 
                  startDate={checkIn}
                  endDate={checkOut}
                  onSelect={d => { 
                    setCheckIn(d); 
                    // If check-out is before check-in, update check-out
                    if (new Date(checkOut) <= new Date(d)) {
                      const nextDay = new Date(new Date(d).getTime() + 86400000).toISOString().split('T')[0];
                      setCheckOut(nextDay);
                    }
                    setActivePopup('checkOut'); // Auto move to checkout
                  }} 
                />
              </div>
            )}
          </div>

          {/* Vertical Divider */}
          <div className="w-[1px] h-8 bg-slate-200 dark:bg-white/10" />

          {/* CHECK-OUT */}
          <div 
            ref={checkOutRef}
            className={`flex-1 px-4 py-1 hover:bg-slate-100/50 dark:hover:bg-white/5 cursor-pointer flex flex-col justify-center h-full transition-colors relative ${activePopup === 'checkOut' ? 'bg-slate-100 dark:bg-white/10' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActivePopup(activePopup === 'checkOut' ? null : 'checkOut');
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <label className="text-[9px] font-bold text-slate-500 normal-case mb-0.5 tracking-wider">Check-out</label>
            <div className="flex items-center space-x-2">
               <Calendar size={14} className="text-red-500 shrink-0" />
               <div className="text-sm md:text-base font-bold text-slate-800 dark:text-white truncate">
                {checkOut ? new Date(checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : 'Select Date'}
              </div>
            </div>
            {activePopup === 'checkOut' && (
              <div 
                className="absolute top-full right-0 mt-2 z-[500]"
                onClick={(e) => e.stopPropagation()}
              >
                <CustomCalendar 
                  selectedDate={checkOut} 
                  minDate={new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]}
                  startDate={checkIn}
                  endDate={checkOut}
                  onSelect={d => { 
                    setCheckOut(d); 
                    setActivePopup(null); 
                  }} 
                />
              </div>
            )}
          </div>
        </div>

        {/* ROOMS AND GUESTS */}
        <div 
          ref={guestsRef} 
          className={`flex-1 flex flex-col justify-center px-4 py-1 bg-slate-100 dark:bg-zinc-800 rounded-sm hover:bg-slate-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors group relative ${activePopup === 'guests' ? 'bg-slate-200 dark:bg-zinc-700' : ''}`} 
          onClick={(e) => {
            e.stopPropagation();
            setActivePopup(activePopup === 'guests' ? null : 'guests');
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <label className="text-[9px] font-bold text-slate-500 normal-case mb-0.5 tracking-wider">Rooms & Guests</label>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users size={14} className="text-primary shrink-0" />
              <div className="text-sm md:text-base font-bold text-slate-800 dark:text-white truncate">
                {rooms} Room, {adults + children} Guest
              </div>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${activePopup === 'guests' ? 'rotate-180' : ''}`} />
          </div>
          {activePopup === 'guests' && (
            <div 
              className="absolute right-0 top-full mt-2 z-[500] w-80 bg-white dark:bg-[#1a1a2e] rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-white/5 p-6 animate-in fade-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-5">
                {[
                  { label: 'Rooms', desc: 'Number of units', val: rooms, set: setRooms, min: 1 },
                  { label: 'Adults', desc: 'Ages 12+', val: adults, set: setAdults, min: 1 },
                  { label: 'Children', desc: 'Ages 2-12', val: children, set: updateChildren, min: 0 }
                ].map(p => (
                  <div key={p.label} className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-black text-slate-700 dark:text-white uppercase tracking-wider">{p.label}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{p.desc}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button type="button" onClick={(e) => { e.stopPropagation(); p.set(Math.max(p.min, p.val - 1)); }} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-primary transition-all border border-slate-200 dark:border-white/5">-</button>
                      <span className="text-xs font-black w-4 text-center dark:text-white">{p.val}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); p.set(p.val + 1); }} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-primary transition-all border border-slate-200 dark:border-white/5">+</button>
                    </div>
                  </div>
                ))}

                {children > 0 && (
                  <div className="pt-4 mt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Child Ages (Required)</div>
                    <div className="grid grid-cols-2 gap-3">
                      {childAges.map((age, i) => (
                        <div key={i} className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-400 uppercase">Child {i+1}</label>
                          <select 
                            value={age}
                            onChange={(e) => {
                              const newAges = [...childAges];
                              newAges[i] = parseInt(e.target.value);
                              setChildAges(newAges);
                            }}
                            className="w-full p-2 bg-slate-50 dark:bg-white/5 rounded-lg text-[10px] font-bold border border-slate-100 dark:border-white/5 outline-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                              <option key={num} value={num}>{num} Year</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <button type="button" onClick={(e) => { e.stopPropagation(); setActivePopup(null); }} className="w-full py-4 bg-primary text-white rounded-lg text-[10px] font-black normal-case tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all mt-2">Apply Choices</button>
              </div>
            </div>
          )}
        </div>

        {/* SEARCH BUTTON */}
        <button 
          type="submit" 
          disabled={searching}
          onClick={(e) => {
            const settings = data.general.buttonSettings?.hotelSearch;
            if (settings?.type === 'whatsapp' && !searching) {
              e.preventDefault();
              const childDetails = childAges.length > 0 ? ` (Ages: ${childAges.join(', ')})` : '';
              const message = `Hotel Inquiry:
Destination: ${destination}
Check-in: ${checkIn}
Check-out: ${checkOut}
Rooms: ${rooms}
Guests: ${adults} Adults, ${children} Children${childDetails}`;
              window.open(`https://wa.me/${settings.whatsapp || data.general.whatsappBooking || data.general.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
            } else if (settings?.type === 'phone' && !searching) {
              e.preventDefault();
              window.location.href = `tel:${settings.phone || data.general.phone}`;
            }
          }}
          className="lg:w-48 py-2.5 bg-primary hover:brightness-110 text-white rounded-md font-bold normal-case tracking-wider text-xs transition-all active:scale-95 flex items-center justify-center space-x-2 self-stretch disabled:opacity-50"
        >
          {searching ? <Loader2 className="animate-spin" size={18} /> : (
            <>
              {data.general.buttonSettings?.hotelSearch?.type === 'whatsapp' ? <MessageCircle size={18} /> : 
               data.general.buttonSettings?.hotelSearch?.type === 'phone' ? <Phone size={18} /> : <Search size={18} />}
              <span>{data.general.buttonSettings?.hotelSearch?.text || data.general.hotelSearchButtonText || 'Search Hotels'}</span>
            </>
          )}
        </button>
      </form>

      {results && isExpanded && (
          <div className="w-full">
            <div className="px-4 pb-8">
              <div className="p-8 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5 relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div>
                    <h4 className="text-[12px] font-black normal-case tracking-widest text-primary mb-1 flex items-center gap-2">
                      <Building size={16} />
                      Curated Hotel Deals
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold normal-case tracking-widest">Hand-picked luxury stays in {destination}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                     <div className="px-4 py-2 bg-white dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                        <span className="text-[9px] font-black normal-case text-slate-400 mr-2">Duration:</span>
                        <span className="text-[10px] font-bold text-primary">{Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)} Nights</span>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {results.map((hotel, i) => (
                    <div key={i} className="flex flex-col bg-white dark:bg-[#1a1a2e] rounded-lg border border-slate-100 dark:border-white/5 hover:shadow-2xl transition-all group overflow-hidden">
                      <div className="h-40 relative group overflow-hidden">
                        <img src={`https://picsum.photos/seed/${hotel.name}/400/250`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={hotel.name} />
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-md px-2 py-1 rounded-md flex items-center text-amber-500">
                          <Star size={10} fill="currentColor" />
                          <span className="text-[10px] font-black ml-1">{hotel.rating}</span>
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="text-[14px] font-black text-slate-800 dark:text-zinc-100 normal-case tracking-tight">{hotel.name}</h5>
                        </div>
                        <div className="text-[10px] text-slate-400 mb-4 flex items-center gap-1 font-bold normal-case tracking-tighter">
                          <MapPin size={10} className="text-primary" />
                          {hotel.location}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-6 line-clamp-2 leading-relaxed italic">
                          "{hotel.description}"
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-white/5">
                          <div>
                            <div className="text-[8px] font-black text-slate-400 normal-case tracking-widest mb-0.5">Starting From</div>
                            <div className="text-base font-black text-primary tracking-tighter">{hotel.price}</div>
                          </div>
                          <button 
                            onClick={() => handleBooking(hotel.name)}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black normal-case tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center gap-2"
                          >
                            Reserve
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center justify-center space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
                   <p className="text-[10px] text-center max-w-lg text-slate-400 font-bold normal-case tracking-widest italic animate-pulse">
                     Can't find what you are looking for? Our travel experts can source over 500,000+ properties worldwide.
                   </p>
                   <button 
                     onClick={() => {
                        const message = `Custom Hotel Request:
Destination: ${destination}
Dates: ${checkIn} to ${checkOut}
Travelers: ${rooms} Room, ${adults} Adults, ${children} Children`;
                        window.open(`https://wa.me/${data.general.whatsappBooking || data.general.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
                     }}
                     className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[10px] font-black normal-case tracking-widest hover:scale-105 transition-all shadow-xl"
                   >
                     Request Custom Quotation
                   </button>
                </div>

                {/* COLLAPSE BUTTON FIXED INSIDE EXPANDED AREA */}
                <div className="absolute top-6 right-8">
                  <button 
                    type="button"
                    onClick={onCollapse}
                    className="flex w-10 h-10 items-center justify-center text-slate-400 hover:text-primary transition-all bg-white dark:bg-white/5 rounded-full shadow-lg border border-slate-100 dark:border-white/10 hover:scale-110 active:scale-95 group"
                    title="Collapse Details"
                  >
                    <ChevronDown size={20} className="transition-transform duration-500 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default HotelSearchInline;