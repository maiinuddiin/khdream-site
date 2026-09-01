import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

import AnimatedHeader from './AnimatedHeader';

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  avatar?: string;
}

const GoogleReviews: React.FC<{ t: (path: string) => string }> = ({ t }) => {
  const { data } = useCMS();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const toTitleCase = (str: string) => {
    if (!str) return '';
    if (str === str.toUpperCase() && str !== str.toLowerCase()) {
      return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return str;
  };

  const reviews = data.reviews || [];

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, reviews.length - 2));
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, reviews.length - 2)) % Math.max(1, reviews.length - 2));
  };

  if (reviews.length === 0) return null;

  return (
    <div className="space-y-4 h-full flex flex-col relative p-1 text-left">
      <div className="shrink-0 flex items-end justify-between relative z-10">
        <div>
          <div className="flex items-center space-x-2 text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
            <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-md" />
              <Star size={8} fill="currentColor" className="relative z-10 text-primary" />
            </div>
            <span>{data.general.sectionTitles?.reviews?.subtitle || "Client Rating: 4.9/5"}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight font-outfit">
            {data.general.sectionTitles?.reviews?.title || "Google Reviews"}
          </h2>
        </div>
      </div>

      {/* Slider area - we'll let this be flex-grow to fill up the height perfectly */}
      <div className="flex-1 flex flex-col justify-center min-h-0 relative z-10">
        <div className="relative overflow-hidden px-1">
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {Array.from({ length: Math.ceil(reviews.length / 4) }).map((_, groupIndex) => (
              <div key={groupIndex} className="w-full flex-shrink-0 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 gap-2 p-1">
                {reviews.slice(groupIndex * 4, groupIndex * 4 + 4).map((review) => {
                  return (
                    <div 
                      key={review.id} 
                      className="bg-slate-50/40 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-800/80 p-3 rounded-xl border border-slate-100 hover:border-primary/20 dark:border-white/5 dark:hover:border-primary/20 hover:shadow-md transition-all duration-300 min-h-[110px] flex flex-col justify-between relative group"
                    >
                      <div className="absolute top-2 right-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" referrerPolicy="no-referrer" className="w-2.5 h-2.5 grayscale opacity-60" alt="G" />
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2.5 mb-1.5">
                          <img 
                            src={review.avatar || `https://i.pravatar.cc/150?u=${review.id}`} 
                            referrerPolicy="no-referrer" 
                            className="rounded-full object-cover border border-slate-100 dark:border-zinc-800 shrink-0" 
                            style={{
                              width: '44px',
                              height: '44px',
                              minWidth: '44px',
                              minHeight: '44px',
                              maxWidth: '44px',
                              maxHeight: '44px'
                            }}
                            alt="" 
                          />
                          <div className="min-w-0">
                            <h4 className="text-[10px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{toTitleCase(review.name)}</h4>
                            <p className="text-[7px] font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase">{review.date}</p>
                          </div>
                        </div>

                        <div className="flex text-yellow-500 space-x-0.5 mb-1.5 items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={6} fill={s <= review.rating ? "currentColor" : "none"} className={s <= review.rating ? "text-amber-500" : "text-slate-200 dark:text-zinc-800"} />
                          ))}
                          <CheckCircle size={6} className="ml-1 text-blue-500 fill-blue-500 text-white shrink-0" />
                          <span className="text-[6px] font-bold text-blue-500 dark:text-blue-400 tracking-widest uppercase ml-0.5">Verified</span>
                        </div>
                      </div>

                      <p className="text-[9.5px] font-semibold leading-normal text-slate-750 dark:text-zinc-300 flex-grow line-clamp-3 text-left" dangerouslySetInnerHTML={{ __html: review.text }} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {reviews.length > 4 && (
            <>
              <button 
                onClick={() => setCurrentIndex((prev) => (prev - 1 + Math.ceil(reviews.length / 4)) % Math.ceil(reviews.length / 4))}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-5.5 h-5.5 bg-white dark:bg-zinc-850 rounded-full shadow-md border border-slate-100 dark:border-zinc-700 flex items-center justify-center text-slate-400 hover:text-primary transition-all z-10"
              >
                <ChevronLeft size={10} />
              </button>
              <button 
                onClick={() => setCurrentIndex((prev) => (prev + 1) % Math.ceil(reviews.length / 4))}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-5.5 h-5.5 bg-white dark:bg-zinc-850 rounded-full shadow-md border border-slate-100 dark:border-zinc-700 flex items-center justify-center text-slate-400 hover:text-primary transition-all z-10"
              >
                <ChevronRight size={10} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Row inside the panel - matches bottom stats/all branches look beautifully */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/5 shrink-0 relative z-10">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-wider">Google rating</span>
            <div className="flex text-yellow-500 space-x-0.5">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={8.5} fill="currentColor" />)}
            </div>
            <span className="text-[8.5px] font-black text-primary ml-1 bg-primary/10 dark:bg-primary/5 px-1.5 py-0.5 rounded">4.9 / 5.0</span>
          </div>
          <div className="flex items-center space-x-1">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" referrerPolicy="no-referrer" className="h-3 grayscale opacity-60 dark:invert dark:opacity-40" alt="Google" />
            <span className="text-[7.5px] font-bold text-slate-400 dark:text-zinc-500 normal-case tracking-wider ml-1">({reviews.length} reviews)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleReviews;