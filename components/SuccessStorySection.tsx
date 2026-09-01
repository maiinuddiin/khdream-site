import React, { useState, useEffect } from 'react';
import { Youtube, Play, Clock, ChevronRight, Activity, Users, Globe, Zap } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import AbstractBackground from './AbstractBackground';
import AnimatedHeader from './AnimatedHeader';

const SuccessStorySection: React.FC = () => {
  const { data } = useCMS();
  
  const extractPlaylistId = (input: string) => {
    if (!input) return '';
    if (input.startsWith('PL')) return input;
    const match = input.match(/[?&]list=([^#&?]+)/);
    return match ? match[1] : input;
  };

  const getYouTubeId = (url: string) => {
    if (url && url.length === 11 && !url.includes('/') && !url.includes('.')) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^#&?]+)/);
    return match ? match[1] : null;
  };

  const getVimeoId = (url: string) => {
    const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
    return match ? match[1] : null;
  };

  const getFacebookId = (url: string) => {
    const match = url.match(/(?:facebook\.com\/.*\/videos\/|facebook\.com\/watch\/\?v=)([0-9]+)/);
    return match ? match[1] : null;
  };

  const playlistId = React.useMemo(() => extractPlaylistId(data.successStories?.youtubePlaylistUrl || data.successStories?.youtubePlaylistId || ''), [data.successStories?.youtubePlaylistUrl, data.successStories?.youtubePlaylistId]);
  
  const parsedVideos = React.useMemo(() => {
    const urls = data.successStories?.videoUrls || (data.general.youtubeIds ? data.general.youtubeIds.map(id => `https://youtube.com/watch?v=${id}`) : []);
    return urls.map((url, index) => {
      const ytId = getYouTubeId(url);
      const vmId = getVimeoId(url);
      const fbId = getFacebookId(url);
      const id = ytId || vmId || fbId || '';
      const type = ytId ? 'youtube' : vmId ? 'vimeo' : fbId ? 'facebook' : 'youtube';
      const title = `Success Story ${index + 1}`;
      
      const canonicalUrl = ytId 
        ? `https://www.youtube.com/watch?v=${ytId}` 
        : vmId 
          ? `https://vimeo.com/${vmId}`
          : fbId
            ? `https://www.facebook.com/watch/?v=${fbId}`
            : url;

      return {
        id,
        url: canonicalUrl,
        type,
        fallbackTitle: title,
        duration: 'Varies',
        thumbnail: ytId 
          ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` 
          : vmId 
            ? `https://vumbnail.com/${id}.jpg`
            : fbId
              ? `https://graph.facebook.com/${id}/picture`
              : ''
      };
    }).filter(v => v.id);
  }, [data.successStories?.videoUrls, data.general.youtubeIds]);

  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [isPlaylistMode, setIsPlaylistMode] = useState(false);

  useEffect(() => {
    if (parsedVideos.length > 0 && !activeVideo) {
      setActiveVideo(parsedVideos[0]);
    }
  }, [parsedVideos, activeVideo]);
  const [videoTitles, setVideoTitles] = useState<Record<string, string>>(() => {
    try {
      const cached = sessionStorage.getItem('kh_video_titles');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  useEffect(() => {
    const fetchTitles = async () => {
      const missing = parsedVideos.filter(v => v.id && !videoTitles[v.id]);
      if (missing.length === 0) return;

      const titles = await Promise.all(missing.map(async (v) => {
        try {
          // Use internal server API to bypass CORS
          const apiUrl = `/api/video-title?url=${encodeURIComponent(v.url)}`;
          const response = await fetch(apiUrl);
          if (response.ok) {
            const data = await response.json();
            if (data.title) {
              return { id: v.id, title: decodeHtml(data.title) };
            }
          }
          
          // Fallback to direct client-side fetch if server API fails (might happen in dev)
          const fallbackApi = `https://noembed.com/embed?url=${encodeURIComponent(v.url)}`;
          const fallbackResp = await fetch(fallbackApi);
          if (fallbackResp.ok) {
            const fbData = await fallbackResp.json();
            if (fbData.title) return { id: v.id, title: decodeHtml(fbData.title) };
          }
        } catch (err) {
          console.warn(`Could not fetch title for video ${v.id}:`, err);
        }
        return null;
      }));

      const newEntries: Record<string, string> = {};
      titles.forEach(t => {
        if (t && t.title) newEntries[t.id] = t.title;
      });

      if (Object.keys(newEntries).length > 0) {
        setVideoTitles(prev => {
          const updated = { ...prev, ...newEntries };
          try {
            sessionStorage.setItem('kh_video_titles', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    };

    fetchTitles();
    const interval = setInterval(fetchTitles, 5000);
    return () => clearInterval(interval);
  }, [parsedVideos, videoTitles]);

  const featured = activeVideo;
  const others = featured ? parsedVideos.filter(v => v.id !== featured.id) : [];
  const milestones = data.successStories?.milestones || [];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users': return <Users size={16} />;
      case 'Globe': return <Globe size={16} />;
      case 'Zap': return <Zap size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const renderIframe = () => {
    if (isPlaylistMode && playlistId && playlistId.startsWith('PL')) {
      return (
        <iframe 
          src={`https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=0&rel=0`}
          className="w-full h-full absolute inset-0"
          allowFullScreen
          title="Playlist Video"
        />
      );
    }

    if (!featured) return <div className="w-full h-full bg-slate-50 dark:bg-zinc-950 flex items-center justify-center text-slate-300 dark:text-zinc-800"><Youtube size={48} /></div>;

    if (featured.type === 'vimeo') {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${featured.id}?autoplay=0&title=0&byline=0&portrait=0`}
          className="w-full h-full absolute inset-0"
          allowFullScreen
          title="Success Story Video"
        />
      );
    }

    if (featured.type === 'facebook') {
      return (
        <iframe
          src={`https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/facebook/videos/${featured.id}/&show_text=0&width=560`}
          className="w-full h-full absolute inset-0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          title="Success Story Video"
        />
      );
    }

    return (
      <iframe 
        src={`https://www.youtube.com/embed/${featured.id}?autoplay=0&rel=0`}
        className="w-full h-full absolute inset-0"
        allowFullScreen
        title="Success Story Video"
      />
    );
  };

  return (
    <div className="relative bg-[#fdfdfd] dark:bg-[#060608] transition-colors duration-500 overflow-hidden py-16">
      <AbstractBackground variant="mesh" opacity={0.02} position="center" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          {(!data.general.sectionTitles?.successStories || 
            data.general.sectionTitles?.successStories?.title !== "" || 
            data.general.sectionTitles?.successStories?.subtitle !== "") && (
            <div className="max-w-xl">
              <AnimatedHeader 
                {...data.general.sectionTitles?.successStories}
                title={data.general.sectionTitles?.successStories?.title !== undefined ? data.general.sectionTitles?.successStories?.title : "Latest Stories"}
                subtitle={data.general.sectionTitles?.successStories?.subtitle !== undefined ? data.general.sectionTitles?.successStories?.subtitle : "SUCCESS STORIES"}
                align="left"
              />
              <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400 font-medium leading-relaxed max-w-md mt-4">
                {data.general.sectionTitles?.successStories?.description || "Real success stories from entrepreneurs and investors who built their dream in Saudi Arabia."}
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-6 md:gap-12 pb-4 overflow-x-auto no-scrollbar sm:overflow-visible">
            {milestones.slice(0, 3).map((m) => (
              <div key={m.id} className="flex flex-col items-start">
                <div className="flex items-center gap-2 text-primary font-bold">
                  {getIcon(m.icon)}
                  <span className="text-xl md:text-2xl tracking-tighter leading-none">{m.value}</span>
                </div>
                <span className="text-[8px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-2">{m.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pb-8">
          {/* Main Player Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-8 bg-white dark:bg-zinc-900/40 rounded-lg p-6 border border-slate-200 dark:border-white/5 flex flex-col h-full relative"
          >
            <div className="aspect-video w-full bg-black rounded-lg mb-6 relative overflow-hidden border border-slate-100 dark:border-white/5">
               {renderIframe()}
            </div>
            
            <div className="mt-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1.5 bg-primary/10 text-primary text-[8px] font-bold px-2 py-1 rounded-md border border-primary/20">
                    <Youtube size={10} />
                    <span>Featured case study</span>
                  </div>
                </div>
                <h3 className="text-sm sm:text-lg md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight" dangerouslySetInnerHTML={{ __html: (featured && videoTitles[featured.id]) || featured?.fallbackTitle || '' }} />
              </div>
              
              {playlistId && (
                <button 
                  onClick={() => setIsPlaylistMode(!isPlaylistMode)}
                  className={`shrink-0 text-[10px] font-bold tracking-widest px-5 py-2.5 rounded-sm border transition-all ${isPlaylistMode ? 'bg-gradient-themed text-white border-primary shadow-xl shadow-primary/20' : 'bg-white dark:bg-white/5 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                >
                  {isPlaylistMode ? 'Exit Playlist Mode' : 'Watch Full Series'}
                </button>
              )}
            </div>
          </motion.div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 flex flex-col gap-2.5 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {others.length > 0 ? (
              others.map((video, idx) => (
                <motion.button
                  key={`${video.id}-${idx}`}
                  onClick={() => {
                    setActiveVideo(video);
                    setIsPlaylistMode(false);
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-zinc-900/30 rounded-md p-2.5 border border-slate-100 dark:border-white/5 flex items-center gap-3 group text-left hover:bg-white dark:hover:bg-zinc-800 transition-all duration-300"
                >
                  <div className="w-20 md:w-28 aspect-video bg-slate-100 dark:bg-zinc-950 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-white/5 relative">
                    <img src={video.thumbnail || null} referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:bg-primary group-hover:border-primary transition-all">
                        <Play size={8} className="text-white fill-current translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <h4 className="text-[9px] sm:text-[10px] font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-2" dangerouslySetInnerHTML={{ __html: videoTitles[video.id] || video.fallbackTitle }} />
                    <div className="flex items-center gap-1.5 text-[7px] font-bold tracking-widest text-slate-400 dark:text-zinc-500">
                      <Clock size={7} />
                      <span>{video.duration}</span>
                    </div>
                  </div>
                </motion.button>
              ))
            ) : null}
            
            {playlistId && (
              <a 
                href={data.successStories?.youtubePlaylistUrl || `https://www.youtube.com/playlist?list=${playlistId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto w-full py-3.5 rounded-md border border-slate-200 dark:border-white/5 text-slate-400 dark:text-zinc-500 text-[8px] font-bold uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-2 group"
              >
                Watch Full Playlist
                <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessStorySection;


