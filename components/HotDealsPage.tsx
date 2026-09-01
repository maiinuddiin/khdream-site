import React, { useState } from 'react';
import { useCMS, HotDeal } from '../context/CMSContext';
import { ArrowLeft, Calendar, Tag, Clock, ChevronRight, Share2, Search, Briefcase } from 'lucide-react';

const HotDealsPage: React.FC<{ onBack: () => void; initialId?: string | null }> = ({ onBack, initialId }) => {
  const { data } = useCMS();
  const [selectedDeal, setSelectedDeal] = useState<HotDeal | null>(null);
  const [query, setQuery] = useState('');

  React.useEffect(() => {
    if (initialId && data.hotDeals) {
      const deal = data.hotDeals.find(d => String(d.id) === String(initialId));
      if (deal) {
        setSelectedDeal(deal);
      }
    }
  }, [initialId, data.hotDeals]);

  React.useEffect(() => {
    if (selectedDeal) {
      const newPath = `/hot-deals/${selectedDeal.id}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({}, '', newPath);
      }
    } else if (window.location.pathname.startsWith('/hot-deals/')) {
      window.history.pushState({}, '', '/hot-deals');
    }
  }, [selectedDeal]);

  const handleShare = (e: React.MouseEvent, deal: HotDeal) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/hot-deals/${deal.id}`;
    const shareText = `Check out this travel deal: ${deal.title}`;

    if (navigator.share) {
      navigator.share({
        title: deal.title,
        text: shareText,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const filteredDeals = (data.hotDeals || []).filter(d => 
    d.title.toLowerCase().includes(query.toLowerCase()) || 
    d.subtitle.toLowerCase().includes(query.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (selectedDeal) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans transition-colors duration-700 pb-20 animate-fade-in">
        <div className="h-[50vh] relative overflow-hidden">
          <img src={selectedDeal.images[0] || null} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-950 via-transparent to-black/20" />
          <button onClick={() => setSelectedDeal(null)} className="absolute top-8 left-8 p-3 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-primary transition-all">
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
          <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 md:p-16 shadow-2xl border border-black/5 dark:border-white/5">
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest">
                <Tag size={14} />
                <span>{selectedDeal.price}</span>
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Calendar size={14} />
                <span>Expires: {selectedDeal.expiryDate}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-6">
              {selectedDeal.title}
            </h1>
            <p className="text-xl md:text-2xl font-bold text-slate-500 dark:text-zinc-400 mb-12 uppercase tracking-tight">
              {selectedDeal.subtitle}
            </p>

            <div 
              className="prose dark:prose-invert max-w-none text-slate-600 dark:text-zinc-300 text-lg leading-relaxed mb-12"
              dangerouslySetInnerHTML={{ __html: selectedDeal.content }}
            />

            {selectedDeal.images.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {selectedDeal.images.slice(1).map((img, i) => (
                  <img key={i} src={img || null} referrerPolicy="no-referrer" className="rounded-3xl w-full h-64 object-cover shadow-lg" />
                ))}
              </div>
            )}

            <div className="pt-12 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
               <button 
                 onClick={(e) => handleShare(e, selectedDeal)}
                 className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all"
               >
                 <Share2 size={16} />
                 <span>Share This Deal</span>
               </button>
               <button onClick={() => setSelectedDeal(null)} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                 Return to Offers
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-32 pb-20 px-6 font-sans transition-colors duration-700 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8 border-b border-black/5 dark:border-white/5 pb-12">
          <div className="text-left">
            {data.general.sectionTitles?.hotDeals?.title !== "" && (
              <h1 
                className={`${data.general.sectionTitles?.hotDeals?.titleSize || 'text-3xl md:text-5xl'} font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-4`}
                dangerouslySetInnerHTML={{ __html: data.general.sectionTitles?.hotDeals?.title !== undefined ? data.general.sectionTitles?.hotDeals?.title : 'Exclusive <span class="text-primary">Travel Deals</span>' }}
              />
            )}
            {data.general.sectionTitles?.hotDeals?.subtitle !== "" && (
              <p className={`${data.general.sectionTitles?.hotDeals?.subtitleSize || 'text-[10px] md:text-xs'} text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-[0.4em]`}>
                {data.general.sectionTitles?.hotDeals?.subtitle !== undefined ? data.general.sectionTitles?.hotDeals?.subtitle : 'Limited Time Offers & Flash Sales'}
              </p>
            )}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Offers..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-slate-900 dark:text-white focus:border-primary outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-slate-100 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-800">
          {filteredDeals.map(deal => (
            <div 
              key={deal.id} 
              onClick={() => setSelectedDeal(deal)}
              className="group cursor-pointer bg-white dark:bg-zinc-950 overflow-hidden transition-all hover:bg-slate-50 dark:hover:bg-zinc-900"
            >
              <div className="aspect-square overflow-hidden relative">
                <img src={deal.images[0] || null} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-themed text-white text-[8px] font-black uppercase tracking-widest z-10">
                  {deal.price}
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-[8px] font-black text-primary uppercase tracking-widest">
                    <span>Expires: {deal.expiryDate}</span>
                  </div>
                </div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {deal.title}
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium line-clamp-2 uppercase tracking-tight">
                  {deal.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredDeals.length === 0 && (
          <div className="py-40 text-center">
            <p className="text-xl font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest">No active deals found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotDealsPage;
