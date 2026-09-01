import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../context/CMSContext';
import { cn } from '../lib/utils';
import { 
  ChevronRight, 
  ArrowLeft, 
  Clock, 
  ShieldAlert, 
  DollarSign, 
  Building2, 
  Users, 
  BadgePercent, 
  CheckCircle2, 
  MessageCircle, 
  FileText,
  Bookmark,
  Search,
  ShoppingCart,
  X,
  HelpCircle,
  Plus,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  ClipboardList,
  Info,
  Briefcase
} from 'lucide-react';

interface BusinessServicesPageProps {
  onBack: () => void;
}

// Visual cart item type
interface CartItem {
  id: string;
  name: string;
  categoryName: string;
  price: string;
}

export default function BusinessServicesPage({ onBack }: BusinessServicesPageProps) {
  const { data } = useCMS();
  const services = useMemo(() => data.businessServices || [], [data.businessServices]);
  
  // Active only main services
  const activeServices = useMemo(() => {
    return services
      .filter(cat => cat.status !== 'inactive')
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [services]);

  // States
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [descExpanded, setDescExpanded] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper to slugify
  const slugify = (text?: string) => {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Synchronize path and states initially and on popstate
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname.replace(/\/+$/, '');
      const parts = path.split('/').filter(Boolean); // e.g. ["business-services", "category-slug", "subcategory-slug"]

      if (parts[0] === 'business-services') {
        if (parts.length === 1) {
          setSelectedCategory(null);
          setSelectedSubcategory(null);
        } else if (parts.length === 2) {
          const catSlug = parts[1];
          const foundCat = activeServices.find(cat => slugify(cat.name) === catSlug || cat.id === catSlug);
          if (foundCat) {
            setSelectedCategory(foundCat.id);
            setSelectedSubcategory(null);
          } else {
            setSelectedCategory(null);
            setSelectedSubcategory(null);
          }
        } else if (parts.length >= 3) {
          const catSlug = parts[1];
          const subSlug = parts[2];
          const foundCat = activeServices.find(cat => slugify(cat.name) === catSlug || cat.id === catSlug);
          if (foundCat) {
            setSelectedCategory(foundCat.id);
            // Search inside category subcategories
            const activeSubcategories = (foundCat.subcategories || []).filter(sub => sub.status !== 'inactive');
            const foundSub = activeSubcategories.find(sub => slugify(sub.name) === subSlug || sub.id === subSlug);
            if (foundSub) {
              setSelectedSubcategory(foundSub.id);
            } else {
              setSelectedSubcategory(null);
            }
          } else {
            setSelectedCategory(null);
            setSelectedSubcategory(null);
          }
        }
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, [activeServices]);

  // Derived selected details
  const category = useMemo(() => {
    return activeServices.find(c => c.id === selectedCategory);
  }, [activeServices, selectedCategory]);

  const activeSubcategories = useMemo(() => {
    if (!category) return [];
    return (category.subcategories || [])
      .filter(sub => sub.status !== 'inactive')
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [category]);

  const subcategory = useMemo(() => {
    if (!category) return null;
    return activeSubcategories.find(s => s.id === selectedSubcategory);
  }, [activeSubcategories, selectedSubcategory]);

  // Routing actions
  const navigateToHome = () => {
    window.history.pushState({}, '', '/business-services');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchQuery('');
  };

  const navigateToCategory = (catId: string, catName: string) => {
    const slug = slugify(catName);
    window.history.pushState({}, '', `/business-services/${slug}`);
    setSelectedCategory(catId);
    setSelectedSubcategory(null);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSubcategory = (subId: string, subName: string) => {
    if (!category) return;
    const catSlug = slugify(category.name);
    const subSlug = slugify(subName);
    window.history.pushState({}, '', `/business-services/${catSlug}/${subSlug}`);
    setSelectedSubcategory(subId);
    setDescExpanded(false);
    setActiveAccordion(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart operations
  const addToCart = (item: CartItem) => {
    if (cart.some(i => i.id === item.id)) {
      showToast('Service is already in your cart!');
      return;
    }
    setCart(prev => [...prev, item]);
    showToast(`Added "${item.name}" to inquiry basket!`);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // WhatsApp Inquiry Generator
  const getWhatsAppInquiryUrl = (customMessage?: string) => {
    const phone = subcategory?.packageDetails?.whatsappNumber?.trim() || data.general?.whatsappBusiness || data.general?.whatsapp || '966537681618';
    
    let text = '';
    if (customMessage) {
      text = customMessage;
    } else if (cart.length > 0) {
      text = `Hello KH Dream Services team! I would like to inquire about the following list of Government/Business Services:\n\n` +
             cart.map((item, idx) => `${idx + 1}. [${item.categoryName}] ${item.name} (${item.price})`).join('\n') +
             `\n\nPlease let me know the requirements and procedures. Thank you!`;
    } else if (subcategory) {
      text = `Hello KH Dream Services. I am interested in your Corporate Service: "${subcategory.name}" under "${category?.name}".\n\n` +
             `- Service Fee: ${subcategory.afterDiscountPrice} ${subcategory.currency || 'SAR'}\n` +
             `- Est. Time: ${subcategory.packageDetails?.processingTime || 'Approved immediately'}\n\n` +
             `Please guide me on how to proceed with the documents. Thank you!`;
    } else {
      text = `Hello KH Dream Services! I'm interested in your KSA Business Setup and Government Portal Services. Please provide more info.`;
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  // Search filter
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return activeServices;
    const query = searchQuery.toLowerCase();
    return activeServices.filter(cat => 
      (cat.name || '').toLowerCase().includes(query) || 
      (cat.description || '').toLowerCase().includes(query) ||
      (cat.subcategories || []).some(sub => 
        sub.status !== 'inactive' && 
        ((sub.name || '').toLowerCase().includes(query) || (sub.description || '').toLowerCase().includes(query))
      )
    );
  }, [activeServices, searchQuery]);

  const filteredSubcategories = useMemo(() => {
    if (!searchQuery.trim()) return activeSubcategories;
    const query = searchQuery.toLowerCase();
    return activeSubcategories.filter(sub => 
      (sub.name || '').toLowerCase().includes(query) || 
      (sub.description || '').toLowerCase().includes(query)
    );
  }, [activeSubcategories, searchQuery]);

  // Framer layouts
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.15 } }
  };

  return (
    <div id="business-services-section" className="min-h-screen bg-slate-50 dark:bg-[#030303] pt-32 lg:pt-40 pb-20 font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">

        
        {/* Toast Notifier */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[99999] bg-white dark:bg-zinc-90 w-max max-w-sm px-5 py-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xl flex items-center gap-3"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 leading-tight">{toastMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Cart Badge Button */}
        {cart.length > 0 && (
          <button 
            id="floating-cart-anchor"
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-8 right-8 z-50 p-4 bg-primary hover:bg-primary/95 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer"
          >
            <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-black bg-white text-primary px-1.5 py-0.5 rounded-full">{cart.length}</span>
            <span className="hidden md:inline text-xs font-semibold tracking-wider uppercase ml-1">Inquiry Basket</span>
          </button>
        )}

        {/* Basket Drawer */}
        <AnimatePresence>
          {isCartOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCartOpen(false)}
                className="fixed inset-0 bg-black z-[100000]"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl border-l border-slate-100 dark:border-zinc-800 z-[100001] p-6 flex flex-col justify-between font-sans"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={18} className="text-primary" />
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Inquiry Basket</h3>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="p-1 px-2.5 bg-slate-50 dark:bg-zinc-900 text-slate-400 hover:text-black hover:bg-slate-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-start justify-between p-3.5 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-100 dark:border-zinc-800/50">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black tracking-widest text-primary uppercase">{item.categoryName}</span>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100 leading-tight">{item.name}</h4>
                          <span className="text-xs font-black text-rose-500 block">{item.price}</span>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="hover:text-rose-500 text-slate-400 p-1 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">
                    <span>Total Services selected</span>
                    <span>{cart.length} Packages</span>
                  </div>
                  <a 
                    href={getWhatsAppInquiryUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 bg-[#25d366] text-white rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-[#20ba59] transition-all flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
                  >
                    <MessageCircle size={16} /> Send Combo Inquiry
                  </a>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Dynamic Level Navigation Breadcrumbs */}
        <div id="services-breadcrumbs" className="flex flex-wrap items-center gap-2 mb-8 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <button 
            id="bs-breadcrumb-home-link"
            onClick={onBack} 
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Home
          </button>
          <ChevronRight size={14} className="text-slate-400 shrink-0" />
          <button 
            id="bs-breadcrumb-root-link"
            onClick={navigateToHome} 
            className={`hover:text-primary transition-colors cursor-pointer ${!selectedCategory ? 'text-primary' : ''}`}
          >
            Business Services
          </button>
          
          {category && (
            <>
              <ChevronRight size={14} className="text-slate-400 shrink-0" />
              <button 
                id={`bs-breadcrumb-cat-${category.id}`}
                onClick={() => navigateToCategory(category.id, category.name)}
                className={`hover:text-primary transition-colors cursor-pointer max-w-[120px] md:max-w-none truncate ${!selectedSubcategory ? 'text-primary' : ''}`}
              >
                {category.name}
              </button>
            </>
          )}

          {subcategory && (
            <>
              <ChevronRight size={14} className="text-slate-400 shrink-0" />
              <span id={`bs-breadcrumb-sub-${subcategory.id}`} className="text-primary truncate max-w-[150px] md:max-w-[240px]">
                {subcategory.name}
              </span>
            </>
          )}
        </div>

        <AnimatePresence mode="wait">
          
          {/* LEVEL 1: Main Platform Categories */}
          {!selectedCategory && (
            <motion.div
              key="l1-main"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-12"
            >
              {/* Minimal Flat Header */}
              <div 
                className="text-center py-6 md:py-8 space-y-3 px-6 relative overflow-hidden w-[100vw] ml-[calc(-50vw+50%)] mb-6"
              >
                {data.general.sectionTitles?.businessServicesPage?.customBgUrl && (
                  <div 
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{ 
                      backgroundImage: `url(${data.general.sectionTitles.businessServicesPage.customBgUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundAttachment: 'fixed'
                    }}
                  />
                )}
                <div className="relative z-10 max-w-3xl mx-auto">
                  <span className={cn(
                    "text-[8px] md:text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-full inline-block leading-none font-montserrat mb-1 backdrop-blur-sm border shadow-sm",
                    data.general.sectionTitles?.businessServicesPage?.customBgUrl 
                      ? "bg-white/20 text-white border-white/30 drop-shadow-md" 
                      : "text-primary bg-primary/10 border-primary/20"
                  )}>
                    {data.general.sectionTitles?.businessServicesPage?.subtitle || "Services"}
                  </span>
                  <h1 className={cn(
                    "text-xl md:text-3xl font-extrabold tracking-tight uppercase font-montserrat mb-2",
                    data.general.sectionTitles?.businessServicesPage?.customBgUrl ? "text-white drop-shadow-lg" : "text-slate-900 dark:text-white"
                  )}>
                    {data.general.sectionTitles?.businessServicesPage?.title || "Business Setup"}
                  </h1>
                  <p className={cn(
                    "text-[10px] md:text-xs max-w-lg mx-auto leading-relaxed",
                    data.general.sectionTitles?.businessServicesPage?.customBgUrl ? "text-white drop-shadow-md font-bold" : "font-semibold text-slate-500 dark:text-zinc-400"
                  )}>
                    {data.general.sectionTitles?.businessServicesPage?.description || "Corporate formation and government services."}
                  </p>
                  
                  {/* Minimal flat search box */}
                  <div className="relative max-w-md mx-auto group pt-5">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={15} />
                  <input
                    type="text"
                    placeholder="Search authority, license or corporate service..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-14 py-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/65 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-3xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 dark:hover:text-zinc-200 text-xs font-bold cursor-pointer transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
                </div>
              </div>

              {/* Grid Section matched with site theme */}
              <div id="bs-l1-grid-wrapper" className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-zinc-350 font-montserrat">Active Portal Providers</h2>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Showing {filteredCategories.length} platforms</span>
                </div>

                {filteredCategories.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-zinc-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                    <Bookmark size={32} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-bold text-slate-400">No platforms match your criteria</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-medium">Try typing another service, department abbreviation, or click clear query to reset views.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredCategories.map((cat) => {
                      // auto counting subcategories or utilizing designated serviceCount
                      const servicesOffered = cat.autoCountServices !== false 
                        ? (cat.subcategories || []).filter(sub => sub.status !== 'inactive').length
                        : (cat.servicesCount || 0);

                      return (
                        <div
                          id={`bs-cat-card-${cat.id}`}
                          key={cat.id}
                          onClick={() => navigateToCategory(cat.id, cat.name)}
                          className="group relative cursor-pointer flex flex-col justify-between bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 rounded-[28px] p-6 sm:p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] shadow-sm hover:border-slate-300 dark:hover:border-zinc-800 transition-all duration-300 ease-out flex-1 min-h-[380px]"
                        >
                          <div className="space-y-6">
                            {/* Logo matching screenshot with high quality fit */}
                            {cat.logoUrl ? (
                              <div className="w-full h-24 flex items-center justify-center overflow-hidden">
                                <img 
                                  src={cat.logoUrl} 
                                  referrerPolicy="no-referrer"
                                  className="max-h-full max-w-[90%] object-contain group-hover:scale-105 transition-transform duration-500 ease-out origin-center" 
                                  alt={cat.name} 
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                                <Building2 size={28} />
                              </div>
                            )}

                            {/* Info */}
                            <div className="space-y-3">
                              <h3 className="text-[17px] font-extrabold text-slate-900 dark:text-white leading-tight font-montserrat tracking-tight group-hover:text-primary transition-colors">
                                {cat.name}
                              </h3>
                              <p className="text-[13px] text-slate-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-3">
                                Explore {servicesOffered} services offered by {cat.name}. We provide comprehensive filing, compliance, and validation.
                              </p>
                            </div>
                          </div>

                          {/* Elegant, clean primary styled button matching image 1 but with site color */}
                          <div className="mt-8 pt-2">
                            <button
                              className="w-full py-3.5 rounded-[14px] bg-primary group-hover:bg-primary/95 text-white text-[13px] font-bold transition-all cursor-pointer text-center select-none shadow-md shadow-primary/20"
                            >
                              View More Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* LEVEL 2: Sub-services in portal category */}
          {selectedCategory && category && (
            <motion.div
              key="l2-sub"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              {/* Back Button */}
              <button
                onClick={navigateToHome}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-primary transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} /> Back to Services
              </button>

              {/* Title Header with Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-zinc-900 shadow-sm">
                <div className="space-y-2 max-w-2xl">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded select-none font-montserrat">Department Portal</span>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-montserrat">
                    {category.name}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-400 font-semibold leading-relaxed">
                    {category.description}
                  </p>
                </div>
                {category.logoUrl && (
                  <div className="h-16 w-32 bg-white flex items-center justify-center p-2 rounded-2xl border border-slate-50 overflow-hidden shrink-0">
                    <img src={category.logoUrl} referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" alt={category.name} />
                  </div>
                )}
              </div>

              {/* Search filter panel */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 border-b border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Sub-Services ({filteredSubcategories.length})</span>
                
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search sub-services..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 pl-9 pr-4 py-2.5 rounded-full text-xs font-bold shadow-3xs outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all leading-normal"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-black text-slate-400 hover:text-primary cursor-pointer">Clear</button>
                  )}
                </div>
              </div>

              {/* Grid consistent with screenshot 2 details */}
              {filteredSubcategories.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-zinc-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                  <Bookmark size={24} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-xs font-bold text-slate-400">No sub-services match your query</p>
                </div>
              ) : (
                <div id="bs-l2-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSubcategories.map((sub) => {
                    const ministryLogo = sub.logoUrl || category.logoUrl;
                    const currencySym = sub.currency || '﷼';

                    return (
                      <div
                        id={`bs-sub-card-${sub.id}`}
                        key={sub.id}
                        onClick={() => navigateToSubcategory(sub.id, sub.name)}
                        className="group relative cursor-pointer flex flex-col justify-between bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 rounded-[28px] p-6 sm:p-8 hover:shadow-xl hover:border-slate-300 dark:hover:border-zinc-800 transition-all duration-300 min-h-[380px]"
                      >
                        <div className="space-y-6">
                          
                          {/* Image branding & Discount pricing exactly matched with screenshot 2 layout */}
                          <div className="flex items-start justify-between gap-4">
                            {ministryLogo ? (
                              <div className="w-24 h-16 bg-white dark:bg-zinc-900/10 flex items-center justify-center p-1 rounded-lg overflow-hidden shrink-0">
                                <img src={ministryLogo} referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain origin-center group-hover:scale-105 transition-transform duration-500" alt="" />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                                <Briefcase size={24} />
                              </div>
                            )}

                            {/* Promotion Badge & Prices block */}
                            <div className="text-right space-y-1.5 flex flex-col items-end shrink-0 select-none font-sans mt-0">
                              {sub.isSale && (
                                <span className="px-3 py-1 bg-[#ef4444] text-white text-[10px] font-bold tracking-wide rounded-md mb-1 shadow-sm shadow-red-500/20">
                                  Sale
                                </span>
                              )}
                              
                              <div className="flex flex-col text-right gap-0.5">
                                {sub.beforeDiscountPrice && (
                                  <span className="text-[11px] text-rose-400/80 line-through font-semibold leading-none">
                                    Before discount {sub.beforeDiscountPrice} {currencySym}
                                  </span>
                                )}
                                <span className="text-[12px] font-bold text-primary/80 leading-none mt-1">
                                  After discount <span className="text-primary text-[20px] font-black">{sub.afterDiscountPrice}</span> {currencySym}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Body details */}
                          <div className="space-y-3 pt-2">
                            <h3 className="text-sm sm:text-[17px] font-extrabold text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors tracking-tight font-montserrat">
                              {sub.name}
                            </h3>
                            <p className="text-[13px] text-slate-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-3">
                              {sub.description || `This service enables foreign and domestic entities to register and validate compliant licenses.`}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons matching screenshot 2 but matching our primary color */}
                        <div className="mt-8 pt-4">
                          <button
                            className="w-full py-3.5 rounded-[14px] bg-primary group-hover:bg-primary/95 text-white text-[13px] font-bold transition-all cursor-pointer text-center shadow-md shadow-primary/20 select-none"
                          >
                            View More Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* LEVEL 3: Deep details section matching screenshot 3 details precisely */}
          <AnimatePresence>
            {selectedCategory && selectedSubcategory && category && subcategory && (
              <motion.div
                key="l3-details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8"
              >
                <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={() => navigateToCategory(category.id, category.name)}></div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-6xl bg-slate-50 dark:bg-zinc-950 rounded-[2rem] shadow-2xl overflow-y-auto max-h-[95vh] border border-slate-200/50 dark:border-white/10"
                >
                  <div className="p-6 md:p-10 space-y-8">
                    {/* Back Link */}
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-4">
                      <button
                        onClick={() => navigateToCategory(category.id, category.name)}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-primary transition-colors cursor-pointer"
                      >
                        <ArrowLeft size={16} /> Back to {category.name} Specialties
                      </button>
                      <button
                        onClick={() => navigateToCategory(category.id, category.name)}
                        className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-white/5 rounded-full transition-colors cursor-pointer"
                      >
                        <X size={20} />
                      </button>
                    </div>

              {/* Service details and duration box matched with screenshot 3 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT BLOCK: Spans 8/12, stores metrics and descriptions */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Service Title header card */}
                  <div className="bg-white dark:bg-zinc-950 p-6.5 md:p-8 rounded-[24px] border border-slate-200 dark:border-zinc-900 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5">
                      <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded select-none font-montserrat">
                        Verified Department Offering
                      </span>
                      <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase leading-tight tracking-tight font-montserrat">
                        {subcategory.name}
                      </h1>
                    </div>
                    {(subcategory.logoUrl || category.logoUrl) && (
                      <div className="h-14 w-32 bg-white flex items-center justify-center p-2 rounded-xl border border-slate-100 shrink-0 select-none">
                        <img 
                          src={subcategory.logoUrl || category.logoUrl} 
                          referrerPolicy="no-referrer"
                          className="max-w-full max-h-full object-contain" 
                          alt="" 
                        />
                      </div>
                    )}
                  </div>

                  {/* Primary Service Details and Duration Blue block matched with screenshot 3 layout */}
                  <div className="bg-white dark:bg-zinc-950 p-6.5 md:p-8 rounded-[24px] border border-slate-200 dark:border-zinc-900 shadow-sm space-y-5">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2 font-montserrat border-b border-slate-100 dark:border-zinc-900 pb-3">
                      <span className="w-1.5 h-3.5 bg-primary rounded-full"></span>
                      Service Details and Duration
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px] font-semibold text-slate-800 dark:text-zinc-200">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-primary shrink-0" />
                        <span>Service Fees:</span>
                        <span className="text-sm font-black text-primary ml-1">
                          {subcategory.afterDiscountPrice} {subcategory.currency || '﷼'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-primary shrink-0" />
                        <span>Government Fees:</span>
                        <span className="font-bold text-slate-900 dark:text-white ml-1">
                          {subcategory.packageDetails?.governmentFees || '500'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-primary shrink-0" />
                        <span>Government Approval Time:</span>
                        <span className="font-bold text-slate-900 dark:text-white ml-1">
                          {subcategory.packageDetails?.processingTime || '1 Business Day'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-primary shrink-0" />
                        <span>Target:</span>
                        <span className="font-bold text-slate-900 dark:text-white ml-1">
                          {subcategory.packageDetails?.targetAudience || 'Corporate / Trader'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Service Description matching screenshot 3 layout exactly with dynamic expansion */}
                  <div className="bg-white dark:bg-zinc-950 p-6.5 md:p-8 rounded-[24px] border border-slate-200 dark:border-zinc-900 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2 font-montserrat border-b border-slate-100 dark:border-zinc-900 pb-3">
                      <span className="w-1.5 h-3.5 bg-primary rounded-full"></span>
                      Service Description
                    </h3>
                    
                    <div className="relative">
                      <div 
                        className={`text-xs leading-relaxed text-slate-500 font-medium whitespace-pre-line transition-all duration-300 ${
                          !descExpanded ? 'max-h-[120px] overflow-hidden' : 'max-h-none'
                        }`}
                      >
                        {subcategory.packageDetails?.detailedDescription || 
                         subcategory.description || 
                         `KH Dream services provides comprehensive filing solutions. We ensure compliance with the target ministry, organize initial dossiers, manage secure portal filings, monitor submission updates, handle inquiries, and deliver authorized registry certificates straight to your executive team.`}
                        
                        {/* Shadow mask if collapsed */}
                        {!descExpanded && (
                          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white dark:from-zinc-950 pointer-events-none" />
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setDescExpanded(!descExpanded)}
                      className="px-4 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-wider text-primary transition-all flex items-center gap-2 cursor-pointer select-none leading-none"
                    >
                      {descExpanded ? (
                        <>Collapse <ChevronUp size={11} /></>
                      ) : (
                        <>Expand <ChevronDown size={11} /></>
                      )}
                    </button>
                  </div>

                  {/* Dynamic Accordions list fields from admin: Requirements, terms, notes, document, etc. */}
                  <div className="space-y-3">
                    {[
                      { 
                        id: 'requirements', 
                        label: 'Requirements & Eligibility', 
                        content: subcategory.packageDetails?.requirements
                      },
                      { 
                        id: 'documents', 
                        label: 'Required Documents Folder', 
                        content: subcategory.packageDetails?.requiredDocuments
                      },
                      { 
                        id: 'terms', 
                        label: 'Official Terms & Conditions', 
                        content: subcategory.packageDetails?.termsConditions
                      },
                      { 
                        id: 'notes', 
                        label: 'Executive Specialized Notes', 
                        content: subcategory.packageDetails?.notes
                      },
                      { 
                        id: 'faq', 
                        label: 'Frequently Asked Questions (FAQ)', 
                        content: subcategory.packageDetails?.faq
                      }
                    ]
                    .filter(sec => sec.content && sec.content.trim() !== '')
                    .map((sec) => {
                      const isOpen = activeAccordion === sec.id;
                      return (
                        <div key={sec.id} className="bg-white dark:bg-zinc-950 rounded-[24px] border border-slate-200 dark:border-zinc-900 overflow-hidden shadow-sm transition-all duration-300">
                          <button
                            onClick={() => setActiveAccordion(isOpen ? null : sec.id)}
                            className={cn(
                              "w-full px-6 py-5 flex justify-between items-center text-[13px] font-black uppercase tracking-widest transition-all cursor-pointer text-left font-montserrat select-none",
                              isOpen ? "text-primary bg-primary/5 border-b border-primary/10" : "text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900/50"
                            )}
                          >
                            <span>{sec.label}</span>
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center transition-colors transition-transform",
                              isOpen ? "bg-gradient-themed text-white rotate-180 shadow-md shadow-primary/20" : "bg-slate-100 dark:bg-zinc-800 text-slate-500"
                            )}>
                              <ChevronDown size={14} />
                            </div>
                          </button>
                          
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="p-6 md:p-8 text-[13px] text-slate-600 dark:text-zinc-400 font-medium leading-relaxed whitespace-pre-line space-y-2 select-text bg-white dark:bg-zinc-950">
                                  {sec.content}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* RIGHT BLOCK (Column 2): Sidebar Action Panel & Ministry Box matched with screenshot 3 */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
                  
                  {/* Action box containing Add To Cart & Send Inquiry with WhatsApp icon */}
                  <div className="bg-white dark:bg-zinc-950 p-6 md:p-7 rounded-[24px] border border-slate-200 dark:border-zinc-900 shadow-md space-y-6">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest font-montserrat flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-primary rounded-full"></span>
                      Take Action
                    </h3>

                    <div className="flex flex-col gap-3.5 pt-1">
                      {/* Add to Cart button (active unless explicitly blocked) */}
                      {subcategory.packageDetails?.addToCartEnabled !== false && (
                        <button
                          onClick={() => addToCart({
                            id: subcategory.id,
                            name: subcategory.name,
                            categoryName: category.name,
                            price: `${subcategory.afterDiscountPrice} ${subcategory.currency || '﷼'}`
                          })}
                          className="w-full py-3.5 bg-primary group-hover:bg-primary/95 text-white rounded-[14px] text-[13px] font-bold transition-all cursor-pointer text-center select-none shadow-md shadow-primary/20 flex items-center justify-center gap-2.5"
                        >
                          <ShoppingCart size={15} /> Add to Cart
                        </button>
                      )}

                      {/* WhatsApp Inquiry Button (active unless explicitly blocked) */}
                      {subcategory.packageDetails?.inquiryEnabled !== false && (
                        <a
                          href={getWhatsAppInquiryUrl()}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-3.5 bg-[#25d366] hover:bg-[#20ba59] active:scale-[0.99] text-white rounded-[14px] text-[13px] font-bold transition-all shadow-md shadow-green-500/10 flex items-center justify-center gap-2.5 cursor-pointer"
                        >
                          <MessageCircle size={15} /> Send Inquiry
                        </a>
                      )}
                    </div>
                    
                    {/* Help text question anchor */}
                    <div className="pt-4 border-t border-slate-100 dark:border-zinc-900 text-center space-y-2">
                      <h4 className="text-xs font-bold text-slate-850 dark:text-zinc-200">
                        Have a question?
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        Send us your inquiry and we'll get back to you as soon as possible
                      </p>
                    </div>
                  </div>

                  {/* Ministry / Platform Information box matching redesigned theme */}
                  <div className="bg-primary/[0.03] dark:bg-zinc-900/20 p-6 md:p-7 rounded-[24px] border border-primary/15 dark:border-zinc-800/80 space-y-4">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 font-montserrat">
                      <Building2 size={14} className="text-primary" /> Department Information
                    </h4>
                    
                    <div className="space-y-3">
                      <p className="text-[12px] font-bold text-slate-800 dark:text-zinc-200 leading-normal">
                        {subcategory.packageDetails?.ministryInfo || 
                         `Authority Name: ${category.name}\nGovernment Agency Department Operations`}
                      </p>
                      
                      <div className="p-3 bg-white dark:bg-zinc-900/60 rounded-xl border border-slate-100 dark:border-zinc-800/60 flex items-start gap-2.5">
                        <Info size={14} className="text-primary mt-0.5 shrink-0" />
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed uppercase tracking-wide">
                          This process operates under authorized delegation with premium credentials issued strictly by KSA platform offices.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Related services footer block */}
              {activeSubcategories.length > 1 && (
                <div id="bs-related-section" className="pt-8 border-t border-slate-205 dark:border-zinc-800/80 space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#1e293b] dark:text-white font-montserrat">
                    Related Services &amp; Tools
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {activeSubcategories
                      .filter(item => item.id !== subcategory.id)
                      .slice(0, 3)
                      .map((related) => (
                        <div
                          key={related.id}
                          onClick={() => navigateToSubcategory(related.id, related.name)}
                          className="bg-white dark:bg-zinc-950 p-5 rounded-[20px] border border-slate-200 dark:border-zinc-900/65 cursor-pointer hover:border-primary/20 hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">
                              {related.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold line-clamp-2">
                              {related.description}
                            </p>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                            <span>{related.afterDiscountPrice} {related.currency || '﷼'}</span>
                            <ChevronRight size={12} />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
        </AnimatePresence>

      </div>
    </div>
  );
}
