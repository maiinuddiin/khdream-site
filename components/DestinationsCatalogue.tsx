import React, { useState, useEffect, useMemo } from 'react';
import { useCMS } from '../context/CMSContext';
import { 
  MapPin, 
  ArrowRight, 
  X, 
  Star, 
  ShieldCheck, 
  Clock, 
  Search, 
  Heart, 
  Sparkles, 
  Compass, 
  Hotel, 
  Plane, 
  Calendar, 
  Info,
  Check,
  Share2,
  Users,
  CalendarRange,
  Briefcase,
  Utensils,
  ChevronDown,
  SlidersHorizontal,
  BadgePercent,
  AlertCircle,
  TrendingUp,
  Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AbstractBackground from './AbstractBackground';
import AnimatedHeader from './AnimatedHeader';
import SwipeHint from './SwipeHint';

interface DestinationsCatalogueProps {
  initialId?: string | null;
  onClearInitial?: () => void;
  isPage?: boolean;
}

const DestinationsCatalogue: React.FC<DestinationsCatalogueProps> = ({ initialId, onClearInitial, isPage = false }) => {
  const { data } = useCMS();
  const destinations = data.catalogue || [];
  
  // Selection states
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'visa' | 'spots' | 'featured'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  
  // Interactive Modal booking states
  const [guestCount, setGuestCount] = useState<number>(1);
  const [departureDate, setDepartureDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 15); // Default setup 15 days out
    return today.toISOString().split('T')[0];
  });
  const [selectedTier, setSelectedTier] = useState<'standard' | 'elite' | 'royal'>('standard');
  const [activeBrochureTab, setActiveBrochureTab] = useState<'overview' | 'visa' | 'tickets'>('overview');
  const [expandedItineraryDay, setExpandedItineraryDay] = useState<number>(1);
  const [showShareNotification, setShowShareNotification] = useState<string | null>(null);

  // Trigger loading initial view if routed from deep links
  useEffect(() => {
    if (initialId && destinations.length > 0) {
      const item = destinations.find((d: any) => String(d.id) === String(initialId));
      if (item) {
        setSelectedItem(item);
        const section = document.getElementById('destinations-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }
      if (onClearInitial) onClearInitial();
    }
  }, [initialId, destinations, onClearInitial]);

  // Sync virtual URL path
  useEffect(() => {
    if (selectedItem) {
      const newPath = `/destinations/${selectedItem.id}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({}, '', newPath);
      }
    } else if (window.location.pathname.startsWith('/destinations/')) {
      window.history.pushState({}, '', '/destinations');
    }
  }, [selectedItem]);

  // Automatically reset states when user opens a new itinerary brochure
  useEffect(() => {
    if (selectedItem) {
      setGuestCount(1);
      setSelectedTier('standard');
      setActiveBrochureTab('overview');
      setExpandedItineraryDay(1);
    }
  }, [selectedItem]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const handleShare = (e: React.MouseEvent, item: any) => {
    if (!item) return;
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/destinations/${item.id}`;
    const cleanTitle = (item.title || '').replace(/<[^>]*>/g, '');
    
    if (navigator.share) {
      navigator.share({
        title: cleanTitle,
        text: `Check out this premium tour package: ${cleanTitle}`,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShowShareNotification(item.id);
      setTimeout(() => setShowShareNotification(null), 3000);
    }
  };

  // Filter Categories Smart Helper
  const categoriesList = useMemo(() => {
    return [
      { id: 'all', name: 'All Services', count: destinations.length },
      { id: 'visa', name: 'Visa & Residency', count: destinations.filter((item: any) => {
          const lowerStr = ((item.title || '') + ' ' + (item.label || '')).toLowerCase();
          return lowerStr.includes('visa') || lowerStr.includes('residency') || lowerStr.includes('passport') || lowerStr.includes('embassy') || lowerStr.includes('consulate');
        }).length
      },
      { id: 'spots', name: 'Spots & Entry Tickets', count: destinations.filter((item: any) => {
          const lowerStr = ((item.title || '') + ' ' + (item.label || '')).toLowerCase();
          const isVisa = lowerStr.includes('visa') || lowerStr.includes('residency') || lowerStr.includes('passport') || lowerStr.includes('embassy') || lowerStr.includes('consulate');
          return !isVisa;
        }).length
      },
      { id: 'featured', name: 'Highly Popular', count: destinations.filter((item: any) => item.isFeatured || parseFloat(item.rating) >= 4.9).length }
    ];
  }, [destinations]);

  // Helper pricing parser
  const parsePriceNumber = (priceStr: string) => {
    if (!priceStr) return 1500;
    const cleaned = priceStr.replace(/[^0-9]/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 1500 : num;
  };

  const getCurrencyStr = (priceStr: string) => {
    if (!priceStr) return 'SAR';
    if (priceStr.toUpperCase().includes('USD')) return 'USD';
    if (priceStr.toUpperCase().includes('AED')) return 'AED';
    if (priceStr.includes('$')) return '$';
    return 'SAR';
  };

  // Helper discount parser
  const calculateDiscountPercentage = (oldPriceStr: string, newPriceStr: string) => {
    const oldNum = parsePriceNumber(oldPriceStr);
    const newNum = parsePriceNumber(newPriceStr);
    if (!oldNum || !newNum || oldNum <= newNum) return null;
    return Math.round(((oldNum - newNum) / oldNum) * 100);
  };

  // Core filter, sort & search architecture
  const processedDestinations = useMemo(() => {
    let result = (destinations || []).filter(item => {
      if (!item) return false;
      const lowerTitle = (item.title || '').toLowerCase();
      const lowerDetails = (item.details || '').toLowerCase();
      const lowerLoc = (item.location || '').toLowerCase();
      const matchesSearch = lowerTitle.includes(query.toLowerCase()) || 
                            lowerDetails.includes(query.toLowerCase()) ||
                            lowerLoc.includes(query.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'featured') return item.isFeatured || parseFloat(item.rating) >= 4.9;
      
      const lowerStr = (lowerTitle + ' ' + (item.label || '')).toLowerCase();
      const isVisa = lowerStr.includes('visa') || lowerStr.includes('residency') || lowerStr.includes('passport') || lowerStr.includes('embassy') || lowerStr.includes('consulate');
      
      if (selectedCategory === 'visa') return isVisa;
      if (selectedCategory === 'spots') return !isVisa;

      return true;
    });

    // Sorting algorithm execution
    return [...result].sort((a, b) => {
      if (sortBy === 'rating') {
        const ratingA = parseFloat(a.rating || '4.8');
        const ratingB = parseFloat(b.rating || '4.8');
        return ratingB - ratingA;
      }
      if (sortBy === 'price-asc') {
        return parsePriceNumber(a.price) - parsePriceNumber(b.price);
      }
      if (sortBy === 'price-desc') {
        return parsePriceNumber(b.price) - parsePriceNumber(a.price);
      }
      // default 'featured': featured state first, then rating
      const featA = a.isFeatured ? 1 : 0;
      const featB = b.isFeatured ? 1 : 0;
      if (featA !== featB) return featB - featA;
      return parseFloat(b.rating || '4.8') - parseFloat(a.rating || '4.8');
    });
  }, [destinations, query, selectedCategory, sortBy]);

  // Handle homepage carousel allocation nicely (static random representation)
  const [randomWeights, setRandomWeights] = useState<number[]>([]);
  useEffect(() => {
    if (destinations.length > 0 && randomWeights.length !== destinations.length) {
      setRandomWeights(Array.from({ length: destinations.length }, () => Math.random()));
    }
  }, [destinations, randomWeights.length]);

  const homeDestinations = useMemo(() => {
    if (isPage) return [];
    if (destinations.length === 0) return [];
    const itemsWithWeights = destinations.map((item, idx) => ({
      item,
      weight: randomWeights[idx] !== undefined ? randomWeights[idx] : 0.5
    }));
    const sorted = [...itemsWithWeights].sort((a, b) => a.weight - b.weight).map(x => x.item);
    return sorted.slice(0, Math.min(4, sorted.length));
  }, [destinations, randomWeights, isPage]);

  const itemsToDisplay = isPage ? processedDestinations : homeDestinations;

  // Type checker helper for selected item
  const itemType = useMemo(() => {
    if (!selectedItem) return { isVisa: false, isCinema: false, isSpot: true };
    const t = (selectedItem.title || '').toLowerCase();
    const l = (selectedItem.label || '').toLowerCase();
    const isVisa = t.includes('visa') || l.includes('visa') || t.includes('residency') || l.includes('residency') || t.includes('golden') || t.includes('passport') || t.includes('entry assistance') || l.includes('assistance');
    const isCinema = t.includes('cinema') || l.includes('cinema') || t.includes('movie') || l.includes('movie') || t.includes('show') || l.includes('show') || t.includes('theatre') || t.includes('film') || t.includes('multiplex') || t.includes('seat');
    return {
      isVisa,
      isCinema,
      isSpot: !isVisa && !isCinema
    };
  }, [selectedItem]);

  // Visa Processing & Document Submission step generator based on selected Destination
  const itineraryDaysList = useMemo(() => {
    if (!selectedItem) return [];
    
    if (selectedItem.itinerary && Array.isArray(selectedItem.itinerary) && selectedItem.itinerary.length > 0) {
      return selectedItem.itinerary;
    }
    
    const title = selectedItem.title || '';
    const location = selectedItem.location || '';
    const durationText = selectedItem.duration || '3-5 Days';
    
    const titleClean = title.replace(/<[^>]*>/g, '');
    const lowerTitle = titleClean.toLowerCase();
    const lowerLoc = location.toLowerCase();

    // Cinema ticket agenda template
    if (lowerTitle.includes('cinema') || lowerTitle.includes('movie') || lowerTitle.includes('film') || lowerTitle.includes('theatre') || lowerTitle.includes('show')) {
      return [
        { dayNum: 1, title: 'Step 1: Seat Assignment & Direct Ticket Generation', desc: 'Secure the absolute best row positions (Premium Lounge or Standard rows) matching modern optimal screen viewing angles. Immediate barcoded digital ticket forms are compiled.' },
        { dayNum: 2, title: 'Step 2: Gate Admission & Priority Queue Scan', desc: 'Arrive at the theatre lobby where your digital barcode ID is checked instantly by our priority lane team. Skip the standard ticketing queues.' },
        { dayNum: 3, title: 'Step 3: Popcorn Snack Dispatch & Seat Butler Assistance', desc: 'Indulge in gourmet popcorn and beverages delivered directly to your custom seat with in-movie call butler assistance.' }
      ];
    }

    // Custom bespoke visa template based on Middle East / Golden Visa
    if (lowerTitle.includes('golden') || lowerLoc.includes('riyadh') || lowerTitle.includes('saudi')) {
      return [
        { dayNum: 1, title: 'Step 1: Document Upload & Sponsor Evaluation', desc: 'Securely submit your investment assets, trade registry, employment salary certificate, or professional records through our encrypted portal. Our senior legal consultants evaluate the pre-clearance threshold.' },
        { dayNum: 2, title: 'Step 2: Government Submission & Attestations', desc: 'Our government relations officers (Muqeem) dispatch certified translations of certificates to the corresponding Ministry branches. The government portal fee handles are cleared standardly.' },
        { dayNum: 3, title: 'Step 3: Biometric Attendance & Golden Residency Delivery', desc: 'Secure immediate scheduling inside premium VIP centers. After biometrics clearance, our concierge team retrieves your stamped residence documents and physical cards for hand delivery.' }
      ];
    }

    // Default 3-step Visa Assist / Ticketing procedure template
    return [
      { dayNum: 1, title: 'Step 1: Document Vetting & Online Application Filing', desc: `Our legal desks double-check your passport eligibility, print custom white-background photographs, and compile the official visa forms (DS-160, Schengen declarations, or corresponding forms) for ${location || 'the destination'}.` },
      { dayNum: 2, title: 'Step 2: Biometric Slot Procurement & Embassy Pre-Check', desc: `We secure the earliest priority appointment dates with TLS, VFS Global, or direct consulates. Verified airline reservation records and hotel vouchers holds are prepared to fulfill embassy checklist matches.` },
      { dayNum: 3, title: 'Step 3: Consulate Interview Training & Visa Delivery', desc: 'Engage with mock embassy interview sessions to secure complete composure with matching questionnaires. Once stamped, courier services securely return your passport with flexible airline ticketing schedules.' }
    ];
  }, [selectedItem]);

  // Dynamic price checkout calculator states
  const priceMath = useMemo(() => {
    if (!selectedItem) return { base: 1500, tierPremium: 0, total: 1500, currency: 'SAR' };
    
    const base = parsePriceNumber(selectedItem.price);
    const currency = getCurrencyStr(selectedItem.price);
    
    // Tier multiplier markups
    let tierPremium = 0;
    if (selectedTier === 'elite') tierPremium = Math.round(base * 0.15); // +15% for premium boutique
    if (selectedTier === 'royal') tierPremium = Math.round(base * 0.35); // +35% for royal VIP and private chauffeurs
    
    const perPersonPrice = base + tierPremium;
    const total = perPersonPrice * guestCount;

    return {
      base,
      tierPremium,
      total,
      currency
    };
  }, [selectedItem, selectedTier, guestCount]);

  if (!destinations || destinations.length === 0) return null;

  return (
    <section 
      id="destinations-section" 
      className={`${isPage ? 'min-h-screen bg-[#F8FAFC] dark:bg-[#030303] pt-32 pb-24 px-4 sm:px-6' : 'py-8 md:py-16 px-4 sm:px-6 lg:px-8'} relative overflow-hidden`}
    >
      <AbstractBackground variant="refined-grid" opacity={0.02} />
      <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-slate-200/40 dark:from-white/[0.01] to-transparent -z-10" />
      
      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        
        {/* EDITORIAL HEADER BANNER */}
        {(!data?.general?.sectionTitles?.destinations || 
          data?.general?.sectionTitles?.destinations?.title !== "" || 
          data?.general?.sectionTitles?.destinations?.subtitle !== "") && (
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-slate-200/80 dark:border-zinc-850">
            <div className="text-left space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-full">
                <Sparkles size={11} className="text-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                  Premium Bespoke Curations
                </span>
              </div>
              
              {isPage ? (
                <div className="space-y-3">
                  <h1 
                    className="text-4xl sm:text-6xl font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-none"
                    dangerouslySetInnerHTML={{ __html: data?.general?.sectionTitles?.destinations?.title !== undefined && data?.general?.sectionTitles?.destinations?.title !== '' ? data?.general?.sectionTitles?.destinations?.title : 'Signature <span class="text-primary">Expeditions</span>' }}
                  />
                  <p className="text-[11px] font-black tracking-[0.15em] text-slate-400 dark:text-zinc-500 uppercase leading-relaxed">
                    {data?.general?.sectionTitles?.destinations?.subtitle !== undefined && data?.general?.sectionTitles?.destinations?.subtitle !== '' ? data?.general?.sectionTitles?.destinations?.subtitle : 'Handpicked and globally managed high-ticket journeys for discerning adventurers'}
                  </p>
                </div>
              ) : (
                <AnimatedHeader 
                  title={data?.general?.sectionTitles?.destinations?.title || "Signature Journeys"}
                  subtitle={data?.general?.sectionTitles?.destinations?.subtitle || "YOUR PATHWAY TO ULTIMATE WONDER"}
                  align="left"
                />
              )}
            </div>

            {/* DYNAMIC METRIC CHIPS - Only subpage context */}
            {isPage && (
              <div className="flex flex-wrap gap-4 text-left shrink-0">
                <div className="px-5 py-3.5 bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl shadow-sm">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Elite Portals</div>
                  <div className="text-xl font-black text-slate-950 dark:text-white font-mono">{destinations.length} <span className="text-[10px] text-primary font-bold">LIVE</span></div>
                </div>
                <div className="px-5 py-3.5 bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl shadow-sm">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Satisfied Score</div>
                  <div className="text-xl font-black text-amber-550 flex items-center gap-1 font-mono">
                    <Star size={14} fill="currentColor" className="text-amber-500" />
                    <span>4.98</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COMPREHENSIVE SUBPAGE FILTER & SEARCH CONSOLE */}
        {isPage && (
          <div className="bg-white dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-900 rounded-[2rem] p-5 lg:p-6 shadow-md shadow-slate-100/50 dark:shadow-none space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
              
              {/* Category selector */}
              <div className="lg:col-span-5 flex flex-wrap gap-1.5">
                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer border
                      ${selectedCategory === cat.id 
                        ? 'bg-zinc-950 text-white dark:bg-white dark:text-black border-transparent shadow-md' 
                        : 'bg-slate-50 dark:bg-zinc-900 text-slate-650 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-855 border-slate-150 dark:border-zinc-800'}`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${selectedCategory === cat.id ? 'bg-primary/20 text-primary dark:bg-zinc-800 dark:text-white' : 'bg-slate-200/60 text-slate-500 dark:bg-zinc-800/80 dark:text-zinc-400'}`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Bar Input */}
              <div className="lg:col-span-4 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={15} />
                <input 
                  type="text" 
                  placeholder="Search countries, landmarks, packages..." 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-11 pr-8 py-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 text-[11px] font-bold text-slate-900 dark:text-white focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
                {query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-black"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sorting Downbox */}
              <div className="lg:col-span-3 relative flex items-center gap-2">
                <SlidersHorizontal size={13} className="text-slate-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full py-3 px-4.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer"
                >
                  <option value="featured">Featured Stays First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                </select>
              </div>

            </div>

            {/* LIVE RESULTS TEXT COUNTER */}
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <div className="flex items-center gap-1.5">
                <Compass size={12} className="text-primary animate-spin" style={{ animationDuration: '6s' }} />
                <span>Found <strong className="text-slate-800 dark:text-zinc-200 font-extrabold">{processedDestinations.length}</strong> luxurious tour packages</span>
              </div>
              
              {query && (
                <button 
                  onClick={() => { setQuery(''); setSelectedCategory('all'); }} 
                  className="text-primary hover:underline text-[9px] font-black uppercase tracking-widest cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* MAIN DESTINATIONS INTERACTIVE BENTO GRID */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 }
            }
          }}
          className={`${isPage ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8' : 'flex gap-5 md:grid md:grid-cols-3 lg:grid-cols-4 overflow-x-auto md:overflow-x-visible no-scrollbar pb-6 snap-x snap-mandatory px-4 -mx-4 md:px-0 md:mx-0'}`}
        >
          {itemsToDisplay.map((item) => {
            const discountPct = item.oldPrice ? calculateDiscountPercentage(item.oldPrice, item.price) : null;
            const currency = getCurrencyStr(item.price);
            
            return (
              <motion.div 
                key={item.id} 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
                }}
                onClick={() => setSelectedItem(item)}
                className={`group cursor-pointer relative bg-transparent ${!isPage ? 'flex-shrink-0 w-[290px] md:w-auto snap-center' : ''}`}
              >
                {/* Visual Imagery Vault */}
                <div className="relative aspect-[4/3.5] overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 transition-all duration-300">
                  {item.img ? (
                    <img 
                      src={item.img} 
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Compass size={32} className="opacity-20 animate-pulse" />
                    </div>
                  )}
                  
                  {/* Luxury Ambient Darkness Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-black/30 to-transparent group-hover:via-zinc-950/40 transition-all duration-300" />
                  
                  {/* Floating Action/Badge Ribbon Layer */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
                    <div className="flex flex-col gap-1 items-start pointer-events-auto">
                      {item.isFeatured && (
                        <span className="px-2 py-0.5 bg-primary/90 text-white text-[9px] font-bold uppercase tracking-wider rounded shadow-sm">
                          Featured
                        </span>
                      )}
                      
                      {discountPct && (
                        <span className="px-2 py-0.5 bg-rose-500/90 text-white text-[9px] font-bold uppercase tracking-wider rounded shadow-sm flex items-center gap-1">
                          <BadgePercent size={8} />
                          <span>-{discountPct}%</span>
                        </span>
                      )}
                    </div>
                    
                    {/* Circle buttons */}
                    <div className="flex items-center gap-1.5 pointer-events-auto">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleShare(e, item); }}
                        className="p-1.5 bg-white/20 backdrop-blur-sm rounded-md text-white hover:bg-primary hover:text-white transition-all border border-white/20"
                        title="Copy Share Link"
                      >
                        <Share2 size={12} />
                      </button>
                        
                      <button 
                        onClick={(e) => toggleFavorite(e, item.id)}
                        className="p-1.5 bg-white/20 backdrop-blur-sm rounded-md text-white hover:bg-white hover:text-red-500 transition-all border border-white/20"
                      >
                        <Heart size={12} fill={favorites.includes(item.id) ? "currentColor" : "none"} className={favorites.includes(item.id) ? "text-red-500" : ""} />
                      </button>
                    </div>
                  </div>

                  {/* Share alert popups nested in cards specifically */}
                  {showShareNotification === item.id && (
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 bg-black/80 text-white text-[9px] font-medium uppercase tracking-wider rounded pointer-events-none border border-white/10 animate-fade-in">
                      Copied!
                    </div>
                  )}

                  {/* Floating duration key metadata top-right style */}
                  {item.duration && (
                    <div className="absolute bottom-24 left-4 z-10 flex items-center gap-1 px-2 py-0.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded text-white text-[9px] font-medium tracking-wide">
                      <Clock size={10} className="text-primary/80" />
                      <span>{item.duration}</span>
                    </div>
                  )}

                  {/* Bottom details Overlay block */}
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-300 text-[10px] font-medium uppercase tracking-wider">
                        <MapPin size={10} className="text-primary" />
                        <span className="truncate">{item.location || 'Exotic Region'}</span>
                      </div>
                      <h3 
                        className="text-base sm:text-lg font-bold text-white leading-snug tracking-tight font-sans drop-shadow"
                        dangerouslySetInnerHTML={{ __html: item.title }} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      {/* Rating details */}
                      <div className="flex items-center gap-1">
                        <Star size={10} fill="currentColor" className="text-amber-400" />
                        <span className="text-[10px] font-semibold text-white">{item.rating || '4.9'}</span>
                        <span className="text-[9px] font-medium text-white/60">({item.reviewsCount || '75'})</span>
                      </div>
                      
                      {/* Custom pricing */}
                      <div className="text-right">
                        {item.oldPrice && (
                          <span className="text-[9px] font-medium text-white/50 line-through block leading-none">
                            {item.oldPrice}
                          </span>
                        )}
                        <span className="text-[13px] font-bold text-white">{item.price || 'SAR 1,500'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        
        {!isPage && <SwipeHint />}

        {/* Home redirection links */}
        {!isPage && destinations.length > 0 && (
          <div className="mt-8 text-center relative z-10">
            <button
              onClick={() => {
                window.history.pushState({}, '', '/destinations');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="inline-flex items-center gap-3.5 px-9 py-4.5 bg-zinc-950 hover:bg-[#D4AF37] hover:text-black border border-zinc-900 dark:bg-white dark:border-white dark:text-black dark:hover:bg-zinc-100 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all hover:scale-102 active:scale-95 cursor-pointer font-sans"
            >
              <span>Explore All Curations</span>
              <ArrowRight size={13} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Empty records fallbacks */}
        {itemsToDisplay.length === 0 && (
          <div className="py-24 text-center space-y-3 bg-white dark:bg-zinc-900/10 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 p-8">
            <Compass size={36} className="mx-auto text-slate-300 dark:text-zinc-700 animate-pulse" />
            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">No Bespoke Excursions Found</h4>
            <p className="text-[10px] font-bold text-slate-400 max-w-sm mx-auto uppercase">Try refining your word queries, cleaning filters, or choosing more general location inputs.</p>
            <button
              onClick={() => { setQuery(''); setSelectedCategory('all'); }}
              className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 text-[9px] font-black uppercase tracking-wider rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* DETAILED INTERACTIVE TOUR BROCHURE AND BOOKING INTERFACE */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
            
            {/* Elegant deep blur background mask */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-lg"
            />
            
            {/* The Luxury Brochure Booklet */}
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-5xl bg-white dark:bg-[#080808] rounded-[2.5rem] shadow-2xl overflow-hidden text-left border border-slate-100 dark:border-zinc-900 flex flex-col md:grid md:grid-cols-12 max-h-[95vh] md:max-h-[90vh]"
            >
              {/* Abs Close floating lead */}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-50 p-2.5 bg-black/55 hover:bg-black/80 border border-white/10 text-white rounded-full transition-all cursor-pointer shadow-lg hover:rotate-90 duration-300"
                aria-label="Close dossier"
              >
                <X size={15} strokeWidth={3} />
              </button>

              {/* MD LEFT COLUMN: SPLENDID VISUAL MASTERWORK FRAME (4 cols) */}
              <div className="md:col-span-4 h-56 md:h-full relative bg-slate-100 dark:bg-zinc-900 flex flex-col justify-between p-6 overflow-hidden">
                {selectedItem.img && (
                  <img 
                    src={selectedItem.img} 
                    referrerPolicy="no-referrer" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                    alt={selectedItem.title} 
                  />
                )}
                
                {/* Gradient occlusion of image */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-zinc-950/20" />
                
                {/* Top Badge Overlay */}
                <div className="relative z-10 self-start">
                  <span className="px-3.5 py-1.5 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg inline-block">
                    {selectedItem.label || 'Vetted Luxury'}
                  </span>
                </div>

                {/* Bottom Title card overlays */}
                <div className="relative z-10 space-y-2 mt-auto text-white">
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
                    <MapPin size={11} className="text-primary animate-bounce shrink-0" />
                    <span>{selectedItem.location || 'Exotic getaway'}</span>
                  </div>
                  <h2 
                    className="text-2xl sm:text-3xl font-black uppercase tracking-tighter leading-none text-white drop-shadow-md font-sans" 
                    dangerouslySetInnerHTML={{ __html: selectedItem.title }} 
                  />
                  
                  <div className="flex items-center gap-4 pt-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Star size={10} fill="currentColor" className="text-amber-400" /> {selectedItem.rating || '4.9'} Satisfied</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> 
                      {selectedItem.duration || (itemType.isVisa ? '3-5 Days' : itemType.isCinema ? '2-3 Hours' : '1 Day')}
                      {itemType.isVisa ? ' Processing' : itemType.isCinema ? ' Duration' : ' Entry Window'}
                    </span>
                  </div>
                </div>
              </div>

              {/* MD RIGHT COLUMN: SCROLLABLE DOSSIER CORE (8 cols split sidebar/tabs) */}
              <div className="md:col-span-8 overflow-y-auto max-h-[65vh] md:max-h-[90vh] bg-slate-50 dark:bg-[#080808] flex flex-col md:grid md:grid-cols-12">
                
                {/* 1. EDITORIAL & ITINERARY MODULE (8 cols -> 7 cols of booklet) */}
                <div className="p-6 lg:p-10 md:col-span-7 space-y-6">
                  
                  {/* METRIC BADGING PANEL */}
                  <div className="grid grid-cols-3 gap-2 pb-4 border-b border-slate-200/60 dark:border-zinc-900">
                    <div className="bg-white dark:bg-zinc-900/60 border border-slate-150 dark:border-zinc-800 p-3 rounded-2xl text-center space-y-1">
                      {itemType.isVisa ? (
                        <>
                          <ShieldCheck size={14} className="text-[#D4AF37] mx-auto" />
                          <p className="text-[8.5px] font-black uppercase tracking-widest text-slate-800 dark:text-zinc-250 leading-none">Visa Processing</p>
                          <span className="text-[7.5px] text-slate-400 font-bold leading-none block">100% Secure Filing</span>
                        </>
                      ) : itemType.isCinema ? (
                        <>
                          <Clock size={14} className="text-[#D4AF37] mx-auto" />
                          <p className="text-[8.5px] font-black uppercase tracking-widest text-slate-800 dark:text-zinc-250 leading-none">Timely Bookings</p>
                          <span className="text-[7.5px] text-slate-400 font-bold leading-none block">Instant Seat Swaps</span>
                        </>
                      ) : (
                        <>
                          <Compass size={14} className="text-[#D4AF37] mx-auto" />
                          <p className="text-[8.5px] font-black uppercase tracking-widest text-slate-800 dark:text-zinc-250 leading-none">Direct Entry</p>
                          <span className="text-[7.5px] text-slate-400 font-bold leading-none block">Skip-The-Line Pass</span>
                        </>
                      )}
                    </div>
                    
                    <div className="bg-white dark:bg-zinc-900/60 border border-slate-150 dark:border-zinc-800 p-3 rounded-2xl text-center space-y-1">
                      {itemType.isVisa ? (
                        <>
                          <Plane size={14} className="text-[#D4AF37] mx-auto" />
                          <p className="text-[8.5px] font-black uppercase tracking-widest text-slate-800 dark:text-zinc-250 leading-none">Flight Logistics</p>
                          <span className="text-[7.5px] text-slate-400 font-bold leading-none block">Best Route Booking</span>
                        </>
                      ) : itemType.isCinema ? (
                        <>
                          <Utensils size={14} className="text-[#D4AF37] mx-auto" />
                          <p className="text-[8.5px] font-black uppercase tracking-widest text-slate-800 dark:text-zinc-250 leading-none">Food & Drinks</p>
                          <span className="text-[7.5px] text-slate-400 font-bold leading-none block">Fresh Popcorn Perks</span>
                        </>
                      ) : (
                        <>
                          <Plane size={14} className="text-[#D4AF37] mx-auto" />
                          <p className="text-[8.5px] font-black uppercase tracking-widest text-slate-800 dark:text-zinc-250 leading-none">Scenic Routes</p>
                          <span className="text-[7.5px] text-slate-400 font-bold leading-none block">Bespoke Guidance</span>
                        </>
                      )}
                    </div>

                    <div className="bg-white dark:bg-zinc-900/60 border border-slate-150 dark:border-zinc-800 p-3 rounded-2xl text-center space-y-1">
                      {itemType.isVisa ? (
                        <>
                          <Briefcase size={14} className="text-[#D4AF37] mx-auto" />
                          <p className="text-[8.5px] font-black uppercase tracking-widest text-slate-800 dark:text-zinc-250 leading-none">Document Review</p>
                          <span className="text-[7.5px] text-slate-400 font-bold leading-none block">Embassy Standards</span>
                        </>
                      ) : itemType.isCinema ? (
                        <>
                          <ShieldCheck size={14} className="text-[#D4AF37] mx-auto" />
                          <p className="text-[8.5px] font-black uppercase tracking-widest text-slate-800 dark:text-zinc-250 leading-none">Digital Delivery</p>
                          <span className="text-[7.5px] text-slate-400 font-bold leading-none block">Secure Barcode ID</span>
                        </>
                      ) : (
                        <>
                          <Briefcase size={14} className="text-[#D4AF37] mx-auto" />
                          <p className="text-[8.5px] font-black uppercase tracking-widest text-slate-800 dark:text-zinc-250 leading-none">Local Escort</p>
                          <span className="text-[7.5px] text-slate-400 font-bold leading-none block">Certified Hosts</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* DOUBLE-TAB CONTROLLER LAYOUT */}
                  <div className="flex border-b border-slate-200/60 dark:border-zinc-900">
                    {[
                      { id: 'overview', name: 'Overview' },
                      { 
                        id: 'visa', 
                        name: itemType.isVisa 
                          ? 'Visa Processing Details' 
                          : itemType.isCinema 
                            ? 'Show Details & Sequence' 
                            : 'Admission & Spot Steps' 
                      },
                      { 
                        id: 'tickets', 
                        name: itemType.isVisa 
                          ? 'Required Documents' 
                          : itemType.isCinema 
                            ? 'Cinema Entry Rules' 
                            : 'Rules & Requirements' 
                      }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveBrochureTab(tab.id as any)}
                        className={`py-3.5 px-4.5 text-[9.5px] font-black uppercase tracking-wider transition-all relative cursor-pointer
                          ${activeBrochureTab === tab.id 
                            ? 'text-primary' 
                            : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700'}`}
                      >
                        <span>{tab.name}</span>
                        {activeBrochureTab === tab.id && (
                          <motion.div 
                            layoutId="activeBrochureTabLine" 
                            className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" 
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* ACTIVE TAB WINDOWS */}
                  <div className="min-h-[220px]">
                    
                    {/* TAB A: OVERVIEW */}
                    {activeBrochureTab === 'overview' && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="space-y-2">
                          <h4 className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                            <Info size={11} className="text-primary" />
                            <span>
                              {itemType.isVisa 
                                ? 'About Travel Authorization & Ticketing Desk' 
                                : itemType.isCinema 
                                  ? 'About Cinema Admission & Show Times Desk' 
                                  : 'About Spot Admission & Entry Services'}
                            </span>
                          </h4>
                          <p className="text-slate-650 dark:text-zinc-400 text-xs font-medium leading-relaxed text-justify" dangerouslySetInnerHTML={{ __html: selectedItem.details || 'Get professional visa application assistance and confirmed air ticketing services. Our dedicated legal specialists support all administrative steps with accuracy and speed.' }} />
                        </div>

                        {/* Guarantee Seal */}
                        <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
                          <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5 animate-pulse" />
                          <div className="text-left space-y-1">
                            <p className="text-[9.5px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-450">SECURE DISPATCH GUARANTEED</p>
                            <p className="text-[8.5px] font-bold text-slate-400 dark:text-zinc-500 leading-normal uppercase">
                              Official document pre-filing, passport tracking, consulate interview mentoring, fast turnaround options, and flexible airline reservation bookings are monitored directly.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}                    {/* TAB B: VISA PROCESSING DETAILS */}
                    {activeBrochureTab === 'visa' && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                            {itemType.isVisa ? (
                              <>
                                <Briefcase size={11} className="text-primary" />
                                <span>Visa Application Details & Roadmap</span>
                              </>
                            ) : itemType.isCinema ? (
                              <>
                                <Clock size={11} className="text-primary" />
                                <span>Show Agenda & Sequence Guide</span>
                              </>
                            ) : (
                              <>
                                <Compass size={11} className="text-primary" />
                                <span>Spot Admission & Guided Agenda</span>
                              </>
                            )}
                          </h4>
                          <span className="text-[8px] font-black text-slate-400 bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded-full uppercase">
                            {itemType.isVisa ? 'Processing Plan' : itemType.isCinema ? 'Show Guide' : 'Route Map'}
                          </span>
                        </div>

                        {/* Vertical Path timeline showing Visa Steps instead of tour days */}
                        <div className="relative pl-4 border-l border-slate-200 dark:border-zinc-850 space-y-4">
                          {(itineraryDaysList && itineraryDaysList.length > 0 ? itineraryDaysList : [
                            { dayNum: 1, title: 'Step 1: Document Upload & Assessment', desc: 'Submit your passport Bio-page, passport-size photographs, and visa forms for a thorough pre-check compliance report.' },
                            { dayNum: 2, title: 'Step 2: Consulate Payment & Appointment Booking', desc: 'Secure the earliest available biometrics/consulate registration date. All government visa submission fees are processed standardly.' },
                            { dayNum: 3, title: 'Step 3: Stamped Clearance & Direct Dispatch', desc: 'Our courier services retrieve your approved passport from the embassy and transport it back to you immediately.' }
                          ]).map((step) => {
                            const isExpanded = expandedItineraryDay === step.dayNum;
                            return (
                              <div key={step.dayNum} className="relative group/day">
                                
                                {/* Bullet */}
                                <div 
                                  className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 transition-all duration-300
                                    ${isExpanded ? 'bg-primary border-primary scale-125' : 'bg-slate-300 dark:bg-zinc-800 border-white dark:border-zinc-900 group-hover/day:bg-primary/50'}`} 
                                />
                                
                                <div 
                                  onClick={() => setExpandedItineraryDay(isExpanded ? 0 : step.dayNum)}
                                  className={`p-3.5 bg-white dark:bg-zinc-[905] hover:bg-zinc-50 dark:hover:bg-zinc-900 border ${isExpanded ? 'border-primary shadow-sm shadow-primary/5' : 'border-slate-150 dark:border-zinc-900'} rounded-2xl cursor-pointer transition-all duration-300`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-black uppercase tracking-wide ${isExpanded ? 'text-primary' : 'text-slate-800 dark:text-zinc-200'}`}>
                                      {step.title}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase shrink-0 ml-2">
                                      {isExpanded ? 'Hide' : 'Expand'}
                                    </span>
                                  </div>

                                  <AnimatePresence initial={false}>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1, transition: { height: { duration: 0.25 }, opacity: { duration: 0.2 } }}}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <p className="text-slate-650 dark:text-zinc-400 text-[10.5px] leading-relaxed pt-2 text-justify">
                                          {step.desc}
                                        </p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* TAB C: REQUIRED DOCUMENTS */}
                    {activeBrochureTab === 'tickets' && (
                      <div className="space-y-5 animate-in fade-in duration-300">
                        {/* Split inclusions/exclusions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* Inclusions as Custom Documentation List */}
                          <div className="space-y-2.5">
                            <span className="text-[9px] font-extrabold text-emerald-500 uppercase tracking-widest">
                              {itemType.isVisa ? '✓ Required Information' : itemType.isCinema ? '✓ Show Ticket Inclusions' : '✓ Ticket Rules & Inclusions'}
                            </span>
                            <ul className="space-y-1.5">
                              {((selectedItem.inclusions && selectedItem.inclusions.length > 0) 
                                ? selectedItem.inclusions 
                                : itemType.isVisa 
                                  ? [
                                      'Original Passport with minimum 6 months validity',
                                      'Two (2) recent white-background passport-sized photographs',
                                      'National ID Card & Resident Copy (Iqama/Resident Visa if applicable)',
                                      'Copy of travel route details or preferred dates',
                                      'Official salary certificate or work sponsor letter'
                                    ]
                                  : itemType.isCinema 
                                    ? [
                                        'Confirmed reserved seat selection in selected cinema hall row',
                                        'Digital barcoded entrance e-Ticket delivered instantly over email/whatsapp',
                                        'Valid state-approved digital ID may be checked at gate checkpoints',
                                        'Flexible slot swap available up to 4 hours prior'
                                      ]
                                    : [
                                        'Official admission pass valid for single-day spot entrance',
                                        'Included English/Arabic language audio guide devices at main desks',
                                        'Fully fast-track stamp to skip regular visitor queues',
                                        'Free parking privileges inside dedicated customer zones'
                                      ]
                              ).map((itemStr, idx) => (
                                <li key={idx} className="flex gap-2 text-[10px] text-slate-650 dark:text-zinc-450 leading-tight">
                                  <Check size={11} className="text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{itemStr}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Exclusions as Ticket Services Checklist */}
                          <div className="space-y-2.5">
                            <span className="text-[9px] font-extrabold text-[#D4AF37] uppercase tracking-widest">
                              {itemType.isVisa ? '✈ Ticket Booking Benefits' : itemType.isCinema ? '🍿 Cinema Food & Drink perks' : '🎯 Tour Spot Experience perks'}
                            </span>
                            <ul className="space-y-1.5">
                              {((selectedItem.exclusions && selectedItem.exclusions.length > 0) 
                                ? selectedItem.exclusions 
                                : itemType.isVisa 
                                  ? [
                                      'Direct support with leading global & domestic aviation lines',
                                      'Guaranteed best pricing options & reserved routes',
                                      'Baggage allowance upgrade coordinates and seat reservations',
                                      'All-inclusive transit advice and regulatory border notifications'
                                    ]
                                  : itemType.isCinema 
                                    ? [
                                        'Complimentary premium food, buttery popcorn & cold soft drinks',
                                        'Access to VIP lounge and red-carpet photo station zones',
                                        'Adjustable high-end leather recliner seats with warm blanket',
                                        'Personal digital buzzer to call support in-hall staff directly'
                                      ]
                                    : [
                                        'Exclusive behind-the-scenes access & private archaeologist guidance',
                                        'Gourmet lunch reservations at premium scenic restaurants',
                                        'Complimentary transfer in air-conditioned luxury business suites',
                                        'Bespoke hand-crafted souvenir kit provided at departure desks'
                                      ]
                              ).map((itemStr, idx) => (
                                <li key={idx} className="flex gap-2 text-[10px] text-slate-650 dark:text-zinc-455 leading-tight">
                                  <span className="text-[#D4AF37] font-extrabold shrink-0">★</span>
                                  <span>{itemStr}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                        </div>

                        {/* advisory tips */}
                        <div className="p-3.5 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex items-start gap-2.5">
                          <AlertCircle size={14} className="text-yellow-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5 text-left">
                            <span className="text-[8.5px] font-black uppercase text-yellow-700 dark:text-yellow-500">
                              {itemType.isVisa ? 'Embassy & Flight Advisories' : itemType.isCinema ? 'Cinema Entry Rules & Timing' : 'Spot Clearance & Gate Rules'}
                            </span>
                            <p className="text-[8.5px] text-slate-600 dark:text-zinc-400 font-semibold leading-relaxed">
                              {selectedItem.advisoryText || (itemType.isVisa ? 'Please double-check that your passport has no damage and at least two clean pages. Government visa fees are standardly subject to regulatory change.' : itemType.isCinema ? 'Please arrive at least 15 minutes prior to the movie showtime. Direct outside snacks and foods are standardly restricted.' : 'Ensure proper safety footwear and hats for outdoor tours. Children under 12 years require adult guardianship.')}
                            </p>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                </div>

                {/* 2. HIGH-CONVERSION PRICING & GUEST CALCULATOR SIDEBAR (5 cols of booklet) */}
                <div className="p-6 md:col-span-5 bg-white dark:bg-zinc-900 border-t md:border-t-0 md:border-l border-slate-200/60 dark:border-zinc-900 flex flex-col justify-between space-y-6">
                  
                  <div className="space-y-5 text-left">
                    <div className="pb-3 border-b border-slate-100 dark:border-zinc-850">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">
                        {itemType.isVisa ? 'Estimated Base Rate' : itemType.isCinema ? 'Seat Ticket Price' : 'Admission Rate'}
                      </span>
                      <span className="text-2xl font-black text-slate-950 dark:text-white font-mono leading-none">
                        {selectedItem.price || 'SAR 1,500'}
                      </span>
                    </div>

                    {/* INTERACTIVE CONTROLS */}
                    <div className="space-y-4">
                      
                      {/* Date Picker */}
                      <div className="space-y-1.5">
                        <label className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1 leading-none">
                          <CalendarRange size={11} className="text-primary" />
                          <span>
                            {itemType.isVisa ? 'Planned Departure / Intended Entry' : itemType.isCinema ? 'Show Date' : 'Intended Ticket Date'}
                          </span>
                        </label>
                        <input 
                          type="date"
                          value={departureDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setDepartureDate(e.target.value)}
                          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[10px] font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all cursor-pointer font-mono"
                        />
                      </div>

                      {/* Guest Counter */}
                      <div className="space-y-1.5">
                        <label className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1 leading-none">
                          <Users size={11} className="text-primary" />
                          <span>
                            {itemType.isVisa ? 'Number of Applicants' : itemType.isCinema ? 'Reserved Seats Selection' : 'Tickets Quantity'}
                          </span>
                        </label>
                        <div className="flex items-center justify-between p-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setGuestCount(prev => Math.max(1, prev - 1))}
                            className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-250 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-all active:scale-90"
                          >
                            -
                          </button>
                          <span className="text-[11px] font-black font-mono text-slate-900 dark:text-white">
                            {guestCount} {guestCount === 1 
                              ? (itemType.isVisa ? 'Applicant' : itemType.isCinema ? 'Seat' : 'Ticket') 
                              : (itemType.isVisa ? 'Applicants' : itemType.isCinema ? 'Seats' : 'Tickets')}
                          </span>
                          <button
                            type="button"
                            onClick={() => setGuestCount(prev => Math.min(20, prev + 1))}
                            className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-250 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-all active:scale-90"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Service Priority Select */}
                      <div className="space-y-1.5">
                        <label className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1 leading-none">
                          <TrendingUp size={11} className="text-primary" />
                          <span>Choose Service Standard</span>
                        </label>
                        <div className="grid grid-cols-1 gap-1.5">
                          {[
                            { 
                              id: 'standard', 
                              name: itemType.isVisa ? 'STANDARD FILING' : itemType.isCinema ? 'STANDARD SEATING' : 'STANDARD ENTRY', 
                              text: itemType.isVisa ? 'Regular queue submission' : itemType.isCinema ? 'Standard hall row mapping' : 'Regular gate pass access' 
                            },
                            { 
                              id: 'elite', 
                              name: itemType.isVisa ? 'EXPRESS FILING' : itemType.isCinema ? 'PREMIUM VIEWER SEAT' : 'SKIP-THE-LINE PASS', 
                              text: itemType.isVisa ? 'Fast-track advocacy filing (+15%)' : itemType.isCinema ? 'Optimized screen center views (+15%)' : 'Fast-track priority pass (+15%)' 
                            },
                            { 
                              id: 'royal', 
                              name: itemType.isVisa ? 'VIP ROYAL CONCIERGE' : itemType.isCinema ? 'VIP RECLINER LOUNGE' : 'VIP SCOUT ESCORT', 
                              text: itemType.isVisa ? 'Legal power of attorney hands-off (+35%)' : itemType.isCinema ? 'Luxury leather lounger & snacks (+35%)' : 'Direct elite personal guide escort (+35%)' 
                            }
                          ].map((tier) => (
                            <button
                               key={tier.id}
                               type="button"
                               onClick={() => setSelectedTier(tier.id as any)}
                               className={`py-2 px-3 border rounded-xl text-left flex flex-col justify-between cursor-pointer transition-all duration-300
                                 ${selectedTier === tier.id 
                                   ? 'bg-primary/5 dark:bg-primary/15 border-primary shadow-sm' 
                                   : 'bg-slate-50 dark:bg-[#030303] border-slate-200 dark:border-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-900'}`}
                            >
                               <div className="flex items-center justify-between w-full font-mono">
                                 <span className={`text-[8.5px] font-black uppercase tracking-wide ${selectedTier === tier.id ? 'text-primary' : 'text-slate-800 dark:text-zinc-350'}`}>
                                   {tier.name}
                                 </span>
                                 {selectedTier === tier.id && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />}
                               </div>
                               <span className="text-[7.5px] text-slate-400 font-bold uppercase block mt-0.5 leading-none">{tier.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* FINAL BILLING SUMMARY */}
                    <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-800/80 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold text-slate-400">
                        <span>Base Rate</span>
                        <span className="font-mono text-slate-700 dark:text-zinc-300">
                          {priceMath.currency} {priceMath.base.toLocaleString()}
                        </span>
                      </div>
                      
                      {priceMath.tierPremium > 0 && (
                        <div className="flex justify-between items-center text-[9px] uppercase font-bold text-slate-400">
                          <span>
                            {itemType.isVisa ? 'Concierge Premium' : itemType.isCinema ? 'Seat Upgrade' : 'Pass Upgrade'}
                          </span>
                          <span className="font-mono text-slate-700 dark:text-zinc-300">
                            + {priceMath.currency} {priceMath.tierPremium.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[9px] uppercase font-bold text-slate-400">
                        <span>
                          {itemType.isVisa ? 'Applicants' : itemType.isCinema ? 'Seats Selected' : 'Tickets Quantity'}
                        </span>
                        <span className="font-mono text-slate-700 dark:text-zinc-300">
                          × {guestCount} {guestCount === 1 
                            ? (itemType.isVisa ? 'Applicant' : itemType.isCinema ? 'Seat' : 'Ticket') 
                            : (itemType.isVisa ? 'Applicants' : itemType.isCinema ? 'Seats' : 'Tickets')}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-zinc-850 flex justify-between items-end">
                        <span className="text-[9px] font-black uppercase text-slate-800 dark:text-zinc-200 tracking-wider">
                          {itemType.isVisa ? 'Estimated Total Fee' : itemType.isCinema ? 'Total Cinema Seat Cost' : 'Total Entry Fee'}
                        </span>
                        <span className="text-xl font-black text-primary font-mono leading-none">
                          {priceMath.currency} {priceMath.total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* ACTION FORM INITIATION */}
                  <div className="pt-4 border-t border-slate-100 dark:border-zinc-900/60 mt-4 space-y-2">
                    <button 
                      onClick={() => {
                        const cleanTitle = (selectedItem.title || '').replace(/<[^>]*>/g, '');
                        const parsedDate = new Date(departureDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                        const tierName = selectedTier === 'royal' 
                          ? (itemType.isVisa ? 'VIP Royal Concierge' : itemType.isCinema ? 'VIP Recliner Lounge' : 'VIP Scout Escort') 
                          : selectedTier === 'elite' 
                            ? (itemType.isVisa ? 'Express Filing' : itemType.isCinema ? 'Premium Viewer Seat' : 'Skip-The-Line Pass') 
                            : (itemType.isVisa ? 'Standard Filing' : itemType.isCinema ? 'Standard Seating' : 'Standard Entry');
                        
                        const quantityLabel = itemType.isVisa ? 'Applicants' : itemType.isCinema ? 'Seats Selected' : 'Tickets Quantity';
                        const typeHeader = itemType.isVisa ? 'VISA APPLICATION ASSISTANCE' : itemType.isCinema ? 'CINEMA SEAT BOOKING' : 'TICKET ENTRY & RECREATION';

                        const message = encodeURIComponent(
                          `🎟️ ${typeHeader} 🎟️\n\n` +
                          `I am interested in Booking/Assistance for:\n` +
                          `• Service Item: "${cleanTitle}"\n` +
                          `• Intended Date: ${parsedDate}\n` +
                          `• ${quantityLabel}: ${guestCount}\n` +
                          `• Selection Tier: ${tierName}\n` +
                          `• Estimated Service Fee: ${priceMath.currency} ${priceMath.total.toLocaleString()}\n\n` +
                          `Please guide me through the booking coordinates and immediate requirements. Thank you!`
                        );
                        
                        const phone = data?.general?.whatsappBooking || data?.general?.whatsapp || '';
                        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                      }}
                      className="w-full py-4.5 bg-zinc-950 hover:bg-[#D4AF37] hover:text-black dark:bg-white dark:hover:bg-[#D4AF37] dark:text-black dark:hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.18em] transition-all hover:scale-102 active:scale-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-transparent dark:border-zinc-800"
                    >
                      <span>{data?.general?.destinationBookButtonText || 'Initiate Secure WhatsApp Booking'}</span>
                      <ArrowRight size={13} strokeWidth={2.5} />
                    </button>
                    <p className="text-[7.5px] font-bold text-center text-slate-400 uppercase tracking-widest">
                      Instant direct secure connections to our official concierge representatives
                    </p>
                  </div>

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default DestinationsCatalogue;
