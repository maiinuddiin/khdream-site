import React, { useState } from 'react';
import { Youtube, Lightbulb, Zap, ShieldCheck, Clock } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import AbstractBackground from './AbstractBackground';
import AnimatedHeader from './AnimatedHeader';

const VideoSection: React.FC = () => {
  const { data } = useCMS();
  const [activeTab, setActiveTab] = useState<'youtube' | 'tips'>('youtube');

  const videoUrls = data.successStories?.videoUrls || (data.general.youtubeIds ? data.general.youtubeIds.map(id => `https://youtube.com/watch?v=${id}`) : []);
  
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^#&?]+)/);
    return match ? match[1] : null;
  };

  const getVimeoId = (url: string) => {
    const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
    return match ? match[1] : null;
  };

  const parsedVideos = React.useMemo(() => {
    return videoUrls.map((url, index) => {
      const ytId = getYouTubeId(url);
      const vmId = getVimeoId(url);
      const id = ytId || vmId || '';
      const type = ytId ? 'youtube' : vmId ? 'vimeo' : 'youtube';
      return { id, type, title: `Update ${index + 1}` };
    }).filter(v => v.id);
  }, [videoUrls]);

  const [featuredVideo, setFeaturedVideo] = useState(parsedVideos[0]);

  React.useEffect(() => {
    if (parsedVideos.length > 0) {
      const randomIndex = Math.floor(Math.random() * parsedVideos.length);
      setFeaturedVideo(parsedVideos[randomIndex]);
    }
  }, [parsedVideos]);

  const travelTips = [
    { icon: <Zap className="text-primary" />, title: "Fast Processing", desc: "Visa and document processing in record time." },
    { icon: <ShieldCheck className="text-primary" />, title: "Secure Booking", desc: "Your data and payments are always protected." },
    { icon: <Clock className="text-primary" />, title: "24/7 Support", desc: "We are here for you at any time of the day." },
    { icon: <Lightbulb className="text-primary" />, title: "Expert Advice", desc: "Get the best travel and investment insights." }
  ];

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-[#fdfdfd] dark:bg-zinc-950 transition-colors duration-700 relative overflow-hidden">
      <AbstractBackground variant="halftone" opacity={0.03} position="bottom-right" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex lg:hidden justify-center mb-8 p-1 bg-slate-200 dark:bg-zinc-900 rounded-lg max-w-[280px] mx-auto">
          <button 
            onClick={() => setActiveTab('youtube')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'youtube' ? 'bg-white dark:bg-zinc-800 shadow-md text-primary' : 'text-slate-500'}`}
          >
            <Youtube size={14} />
            <span>YouTube</span>
          </button>
          <button 
            onClick={() => setActiveTab('tips')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'tips' ? 'bg-white dark:bg-zinc-800 shadow-md text-primary' : 'text-slate-500'}`}
          >
            <Lightbulb size={14} />
            <span>Tips</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
          <div className={`${activeTab === 'youtube' ? 'block' : 'hidden'} lg:block space-y-6 md:space-y-8`}>
            {(!data.general.sectionTitles?.videoSection || 
              data.general.sectionTitles?.videoSection?.title !== "" || 
              data.general.sectionTitles?.videoSection?.subtitle !== "") && (
              <div className="hidden lg:flex items-center space-x-4 mb-6">
                <div className="p-3 bg-primary/10 text-primary rounded-lg shrink-0">
                  <Youtube size={24} />
                </div>
                <div className="min-w-0">
                  <AnimatedHeader 
                    {...data.general.sectionTitles?.videoSection}
                    title={data.general.sectionTitles?.videoSection?.title !== undefined ? data.general.sectionTitles?.videoSection?.title : "YouTube Feed"}
                    subtitle={data.general.sectionTitles?.videoSection?.subtitle !== undefined ? data.general.sectionTitles?.videoSection?.subtitle : "@Khdreams"}
                    align="left"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              {featuredVideo && (
                <div className="aspect-video w-full rounded-lg overflow-hidden shadow-xl border border-black/5 dark:border-white/5 bg-zinc-900 group">
                  <iframe
                    className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                    src={featuredVideo.type === 'vimeo' 
                      ? `https://player.vimeo.com/video/${featuredVideo.id}?title=0&byline=0&portrait=0`
                      : `https://www.youtube.com/embed/${featuredVideo.id}?rel=0`
                    }
                    title={featuredVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              )}
              {!featuredVideo && (
                <div className="aspect-video w-full rounded-lg bg-slate-100 dark:bg-zinc-900 flex items-center justify-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No videos available</p>
                </div>
              )}
            </div>
          </div>

          <div className={`${activeTab === 'tips' ? 'block' : 'hidden'} lg:block space-y-6 md:space-y-8`}>
            <div className="hidden lg:flex items-center space-x-4 mb-6">
              <div className="p-3 bg-primary/10 text-primary rounded-lg">
                <Lightbulb size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold dark:text-zinc-100 leading-tight uppercase tracking-tight">Travel Insights</h3>
                <p className="text-xs text-slate-400 font-bold">Quick Tips & Facts</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {travelTips.map((tip, idx) => (
                <div key={idx} className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-all group hover:shadow-xl hover:shadow-primary/5">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform">{tip.icon}</div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{tip.title}</h4>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 leading-relaxed uppercase tracking-wider">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;