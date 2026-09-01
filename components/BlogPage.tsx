import React, { useState, useEffect, useMemo } from 'react';
import Markdown from 'react-markdown';
import { useCMS, BlogPost } from '../context/CMSContext';
import { 
  ArrowLeft, Calendar, User as UserIcon, Clock, ChevronRight, 
  Share2, Search, X, ArrowRight, Zap, Phone, BookOpen, Heart, 
  FileText, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomCodeEmbed: React.FC<{ code?: string }> = ({ code }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current || !code) return;

    const container = containerRef.current;
    container.innerHTML = code;

    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [code]);

  if (!code) return null;

  return (
    <div 
      ref={containerRef} 
      className="w-full my-6 p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-white/5 overflow-auto text-slate-850 dark:text-zinc-200"
    />
  );
};

const BlogPage: React.FC<{ onBack: () => void; initialId?: string | null }> = ({ onBack, initialId }) => {
  const { data } = useCMS();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Parse path or initialId on load
  useEffect(() => {
    if (initialId && data.blogPosts) {
      const post = data.blogPosts.find(p => String(p.id) === String(initialId));
      if (post) {
        setSelectedPost(post);
      }
    }
  }, [initialId, data.blogPosts]);

  // Sync routing history smoothly
  useEffect(() => {
    if (selectedPost) {
      const newPath = `/blog/${selectedPost.id}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({}, '', newPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (window.location.pathname.startsWith('/blog/')) {
        window.history.pushState({}, '', '/blog');
      }
    }
  }, [selectedPost]);

  const handleShare = (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/blog/${post.id}`;
    const shareText = `Check out this travel post: ${post.title.replace(/<[^>]*>/g, '')}`;

    if (navigator.share) {
      navigator.share({
        title: post.title.replace(/<[^>]*>/g, ''),
        text: shareText,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedId(String(post.id));
      setTimeout(() => setCopiedId(null), 3000);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  // Extract categories dynamically
  const categories = useMemo(() => {
    const list = ['All'];
    (data.blogPosts || []).forEach(post => {
      if (post.category && !list.includes(post.category)) {
        list.push(post.category);
      }
    });
    return list;
  }, [data.blogPosts]);

  // Sorting/Filtering of posts - clean and direct
  const filteredPosts = useMemo(() => {
    return (data.blogPosts || []).filter(p => {
      const matchesQuery = (p.title || '').toLowerCase().includes(query.toLowerCase()) || 
        (p.subtitle || '').toLowerCase().includes(query.toLowerCase()) ||
        (p.content || '').toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

      return matchesQuery && matchesCategory;
    }).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  }, [data.blogPosts, query, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-[#080808] text-slate-800 dark:text-zinc-200 transition-colors duration-700 pb-24 text-left">
      
      {/* Navigation Header */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-100 dark:border-white/5 sticky top-0 z-[100] py-4 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if (selectedPost) {
                  setSelectedPost(null);
                } else {
                  onBack();
                }
              }} 
              className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-white/5 rounded-full transition-all active:scale-95 text-slate-700 dark:text-zinc-300 flex items-center justify-center shadow-sm"
              aria-label="Go Back"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
            </button>
            <div className="text-left">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary block">
                {selectedPost ? "Article Reader" : "Travel Blog"}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase font-montserrat truncate max-w-[200px] sm:max-w-xs block">
                {selectedPost ? selectedPost.title.replace(/<[^>]*>/g, '') : "Dream Blog"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {selectedPost && (
              <button 
                onClick={(e) => handleShare(e, selectedPost)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-white/5 text-[9px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-200 rounded-full transition-all"
              >
                <Share2 size={11} className="text-primary" />
                <span>{copiedId ? "LINK COPIED" : "SHARE POST"}</span>
              </button>
            )}
            <button 
              onClick={() => {
                setSelectedPost(null);
                setSelectedCategory('All');
                setQuery('');
              }}
              className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-wider transition-colors hidden sm:inline"
            >
              Blog Index
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mt-12">
        <AnimatePresence>
          {selectedPost && (
            <motion.div 
              key="article-modal"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-[110] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-100 dark:border-white/5 py-4 px-6 md:px-12">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-primary transition-all bg-slate-100 dark:bg-zinc-900 px-4 py-2 rounded-full"
                  >
                    <ArrowLeft size={14} strokeWidth={2.5} />
                    <span>Close</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleShare(e, selectedPost)}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-primary transition-all bg-slate-100 dark:bg-zinc-900 px-4 py-2 rounded-full"
                    >
                      <Share2 size={12} strokeWidth={2.5} />
                      <span>{copiedId === selectedPost.id ? 'Copied' : 'Share'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="max-w-4xl mx-auto space-y-8 py-12 px-6">
                <article className="bg-white dark:bg-zinc-900/60 p-6 sm:p-12 rounded-3xl border border-slate-200/50 dark:border-white/5 space-y-8">
                  {/* Meta details */}
                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider pb-4 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{selectedPost.date ? new Date(selectedPost.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No Date'}</span>
                    </div>
                    {selectedPost.authorName && (
                      <div className="flex items-center gap-1">
                        <UserIcon size={11} />
                        <span>{selectedPost.authorName}</span>
                      </div>
                    )}
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[8px] font-black">
                      {selectedPost.category || 'Travel'}
                    </span>
                  </div>

                  <h1 
                    className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white uppercase leading-tight font-montserrat tracking-tight" 
                    dangerouslySetInnerHTML={{ __html: selectedPost.title }} 
                  />
                  
                  {/* Hero Image inside post */}
                  {selectedPost.images && selectedPost.images.length > 0 && (
                    <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-900 border border-slate-100 dark:border-white/5 relative group">
                      <img 
                        src={selectedPost.images[0]} 
                        alt="Blog Featured"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>
                  )}

                  {/* Introduction */}
                  {selectedPost.introText && (
                    <div className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 font-medium leading-relaxed italic border-l-4 border-primary pl-4 py-1 bg-slate-50 dark:bg-zinc-900/50 rounded-r-xl">
                      {selectedPost.introText}
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-montserrat prose-headings:uppercase prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl">
                    <Markdown>{selectedPost.content}</Markdown>
                  </div>

                  {/* Sections / Modules */}
                  {selectedPost.sections && selectedPost.sections.length > 0 && (
                    <div className="space-y-12 pt-8">
                      {selectedPost.sections.map((section, idx) => (
                        <div key={idx} className="space-y-6">
                          {section.heading && (
                            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white uppercase font-montserrat">
                              {section.heading}
                            </h2>
                          )}
                          
                          {section.imageUrl && (
                            <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-900 border border-slate-100 dark:border-white/5 shadow-sm">
                              <img 
                                src={section.imageUrl} 
                                alt={section.heading || 'Article section'} 
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          )}

                          {section.videoUrl && (
                            <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-sm">
                              <iframe
                                src={section.videoUrl}
                                title={section.heading || 'Article video'}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}

                          {section.content && (
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-zinc-400 leading-relaxed text-sm sm:text-base">
                              <Markdown>{section.content}</Markdown>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Tags */}
                  {selectedPost.tags && selectedPost.tags.length > 0 && (
                    <div className="pt-8 flex flex-wrap gap-2">
                      {selectedPost.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-200 dark:border-white/5"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>

                {/* Footer Actions inside Modal */}
                <div className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-white/5 pb-12">
                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => handleShare(e, selectedPost)}
                      className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                    >
                      <Share2 size={12} strokeWidth={2.5} />
                      {copiedId === selectedPost.id ? "Link Copied!" : "Share Article"}
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setSelectedPost(null);
                    }}
                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-sm"
                  >
                    <span>Back to Blog</span>
                    <ArrowLeft size={12} strokeWidth={2.5} className="rotate-180" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div 
            key="minimal-feed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-12"
          >
              {/* Brand Title Spotlight */}
              {((data.general.sectionTitles?.blogPage?.title !== "" && data.general.sectionTitles?.blogPage?.title !== undefined) || 
                (data.general.sectionTitles?.blogPage?.subtitle !== "" && data.general.sectionTitles?.blogPage?.subtitle !== undefined)) && (
                <div className="text-center space-y-3">
                  {data.general.sectionTitles?.blogPage?.title !== "" && (
                    <h1 
                      className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none"
                      dangerouslySetInnerHTML={{ __html: data.general.sectionTitles?.blogPage?.title !== undefined ? data.general.sectionTitles?.blogPage?.title : 'Travel <span class="text-primary font-montserrat">Stories</span>' }}
                    />
                  )}
                  {data.general.sectionTitles?.blogPage?.subtitle !== "" && (
                    <p className="text-xs text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-widest max-w-xl mx-auto">
                      {data.general.sectionTitles?.blogPage?.subtitle !== undefined ? data.general.sectionTitles?.blogPage?.subtitle : 'Wanderlust Blog & Global Adventures'}
                    </p>
                  )}
                </div>
              )}

              {/* Minimal Search and Filter bar */}
              <div className="space-y-6 max-w-xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input 
                    type="text" 
                    placeholder="Search posts..." 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 text-xs font-medium text-slate-900 dark:text-white focus:border-primary outline-none transition-all shadow-sm"
                  />
                  {query && (
                    <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Categories filtering tab strip */}
                <div className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {categories.map(cat => (
                    <button
                      key={`cat-${cat}`}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-gradient-themed text-white shadow-sm'
                          : 'bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/60 dark:border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Blog Posts (Pristine and Minimal) */}
              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {filteredPosts.map(post => (
                    <motion.div 
                      key={post.id} 
                      onClick={() => setSelectedPost(post)}
                      className="group cursor-pointer bg-white dark:bg-zinc-900/45 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300 flex flex-col h-full shadow-sm hover:shadow-md"
                    >
                      {/* Image container */}
                      <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-zinc-900 relative">
                        {post.images && post.images.length > 0 ? (
                          <img 
                            src={post.images[0]} 
                            referrerPolicy="no-referrer" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            alt={post.title} 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <BookOpen size={28} />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 px-2 py-0.5 bg-white/90 dark:bg-zinc-950/90 text-primary text-[8px] font-black uppercase rounded-md shadow-xs border border-slate-100 dark:border-white/5">
                          {post.category}
                        </span>
                      </div>

                      {/* Content panel */}
                      <div className="p-5 flex flex-col justify-between flex-grow space-y-4">
                        <div className="space-y-2">
                          <h3 
                            className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-snug line-clamp-2 hover:text-primary transition-colors font-montserrat"
                            dangerouslySetInnerHTML={{ __html: post.title }}
                          />
                          <p 
                            className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal leading-relaxed line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: post.subtitle }}
                          />
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                          <span className="text-[9px] font-semibold text-slate-400">
                            {post.date ? new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Archive Story'}
                          </span>
                          <span className="text-[9px] font-bold text-primary flex items-center gap-0.5 transition-transform group-hover:translate-x-0.5">
                            <span>Read Post</span>
                            <ChevronRight size={10} strokeWidth={2.5} />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/50 dark:border-white/5">
                  <BookOpen className="mx-auto text-slate-300 mb-3" size={32} />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">No matching posts found.</p>
                </div>
              )}

              {/* Minimal Newsletter container */}
              <div className="max-w-xl mx-auto pt-12 border-t border-slate-150 dark:border-white/5">
                <div className="bg-slate-50 dark:bg-zinc-900 p-8 rounded-2xl text-center space-y-4 border border-slate-200/50 dark:border-white/5">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase font-montserrat">Subscribe to our newsletter</h3>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-medium">
                      Get updates, offers, and travel guides straight to your inbox.
                    </p>
                  </div>

                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
                    <input 
                      type="email" 
                      required
                      placeholder="Your email address..." 
                      value={newsletterEmail}
                      onChange={e => setNewsletterEmail(e.target.value)}
                      className="flex-grow px-4 py-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/5 text-xs rounded-xl text-slate-900 dark:text-white outline-none focus:border-primary"
                    />
                    <button 
                      type="submit"
                      className="px-5 py-2.5 bg-slate-900 hover:bg-primary text-white dark:bg-white dark:text-black dark:hover:bg-primary dark:hover:text-white rounded-xl text-[10px] font-bold uppercase transition-all"
                    >
                      {subscribed ? "Subscribed" : "Subscribe"}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};

export default BlogPage;
