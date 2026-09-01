import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Star, CheckCircle2, MessageCircle, Quote, ArrowRight, 
  Image as ImageIcon, Type, Camera, Send, Sliders, List, BarChart, Briefcase, MapPin, Users, Phone, FileText, Video, Box, Code, Globe, MessageSquare,
  Facebook, Instagram, Youtube, Twitter, Linkedin, Link2, ChevronDown, ChevronUp, DollarSign, Building2, HelpCircle, X, Mail
} from 'lucide-react';
import { LandingPageBlock, LandingPage } from '../context/CMSContext';
import { useCMS } from '../context/CMSContext';
import AbstractBackground from './AbstractBackground';
import { toTitleCase } from '../lib/utils';

interface BlockContentProps {
  block: LandingPageBlock;
  page: LandingPage;
}

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getVimeoId = (url: string) => {
  const regExp = /vimeo\.com\/(?:video\/)?(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

const Counter = ({ value, color }: { value: string, color: string }) => {
  const num = parseInt(value.replace(/\D/g, '')) || 0;
  const suffix = value.replace(/[0-9]/g, '');
  const [count, setCount] = React.useState(0);
  const nodeRef = React.useRef(null);

  React.useEffect(() => {
    let start = 0;
    const end = num;
    if (start === end) return;

    let totalMiliseconds = 2000;
    let incrementTime = (totalMiliseconds / end) > 10 ? (totalMiliseconds / end) : 10;

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [num]);

  return <span style={{ color }}>{count}{suffix}</span>;
};

const BlockContent: React.FC<BlockContentProps> = ({ block, page }) => {
  const { data } = useCMS();

  switch (block.type) {
    case 'hero':
      return (
        <div className="relative h-full flex items-center justify-center overflow-hidden">
          <AbstractBackground variant="waves" opacity={0.05} />
          {block.content.bgType === 'video' ? (
            <div className="absolute inset-0 z-0 overflow-hidden">
              {block.content.bgVideoUrl && (
                <>
                  {getYouTubeId(block.content.bgVideoUrl) ? (
                    <iframe
                      key={block.content.bgVideoUrl}
                      src={`https://www.youtube.com/embed/${getYouTubeId(block.content.bgVideoUrl)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeId(block.content.bgVideoUrl)}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`}
                      className="absolute inset-0 w-full h-[120%] -top-[10%] pointer-events-none"
                      style={{ width: '100vw', height: '56.25vw', minHeight: '120vh', minWidth: '177.77vh', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                      allow="autoplay; encrypted-media"
                    />
                  ) : getVimeoId(block.content.bgVideoUrl) ? (
                    <iframe
                      key={block.content.bgVideoUrl}
                      src={`https://player.vimeo.com/video/${getVimeoId(block.content.bgVideoUrl)}?autoplay=1&muted=1&loop=1&background=1`}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ width: '100vw', height: '56.25vw', minHeight: '120vh', minWidth: '177.77vh', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                      allow="autoplay; encrypted-media"
                    />
                  ) : (
                    <video 
                      key={block.content.bgVideoUrl}
                      src={block.content.bgVideoUrl || undefined} 
                      autoPlay 
                      muted 
                      loop 
                      playsInline 
                      preload="auto"
                      className="w-full h-full object-cover" 
                    />
                  )}
                </>
              )}
              <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px]" />
            </div>
          ) : block.content.bgUrl ? (
            <div className="absolute inset-0 z-0">
              <img src={block.content.bgUrl || null} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
            </div>
          ) : (
            <div className="absolute inset-0 z-0 bg-slate-50 dark:bg-slate-950">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50" />
            </div>
          )}
          <div className="relative z-10 text-center px-6">
            <h1 className="text-[clamp(1.75rem,8vw,3rem)] md:text-[clamp(3rem,8vw,6rem)] font-extrabold text-slate-900 dark:text-white tracking-tighter mb-4 leading-[1.1] md:leading-[1] not-italic normal-case" style={{ color: block.styles?.textColor }}>{toTitleCase(block.content.title)}</h1>
            <p className="text-[12px] md:text-lg lg:text-xl text-slate-600 dark:text-white/80 font-medium max-w-2xl mx-auto leading-snug md:leading-relaxed" style={{ color: block.styles?.textColor ? `${block.styles.textColor}CC` : undefined }}>{toTitleCase(block.content.subtitle)}</p>
            {block.content.buttonText && (
              <button 
                className="mt-8 px-8 py-4 rounded-lg text-[10px] font-black normal-case tracking-widest shadow-lg flex items-center gap-2 mx-auto"
                style={{
                  backgroundColor: block.styles?.buttonColor || 'var(--color-primary)',
                  color: block.styles?.buttonTextColor || '#ffffff'
                }}
              >
                {block.content.buttonType === 'whatsapp' && <MessageCircle size={14} />}
                {toTitleCase(block.content.buttonText)}
              </button>
            )}
          </div>
        </div>
      );

    case 'text':
      return (
        <div className="h-full p-8 flex items-center">
          <div 
            className="prose prose-sm md:prose-lg dark:prose-invert max-w-none w-full font-bold text-slate-600 dark:text-zinc-400"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      );

    case 'image':
      return (
        <div className="h-full">
          <div 
            className="h-full w-full overflow-hidden shadow-xl relative"
            style={{ borderRadius: block.styles?.borderRadius || '0px' }}
          >
            {block.content.url ? (
              <img 
                src={block.content.url || null} 
                alt={block.content.caption} 
                className="w-full h-full"
                style={{ objectFit: (block.styles?.objectFit as any) || 'cover' }}
                referrerPolicy="no-referrer" 
              />
            ) : (
              <div className="h-full w-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-300">
                <ImageIcon size={48} />
              </div>
            )}
            {block.content.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-md text-center text-[8px] font-black uppercase tracking-widest text-white">
                {block.content.caption}
              </div>
            )}
          </div>
        </div>
      );

    case 'button':
      return (
        <div className={`h-full flex items-center ${
          block.content.alignment === 'left' ? 'justify-start' : 
          block.content.alignment === 'right' ? 'justify-end' : 'justify-center'
        }`}>
          <button 
            className="px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-2"
            style={{
              backgroundColor: block.styles?.buttonColor || 'var(--color-primary)',
              color: block.styles?.buttonTextColor || '#ffffff'
            }}
          >
            {block.content.type === 'whatsapp' && <MessageCircle size={14} />}
            {block.content.text}
          </button>
        </div>
      );

    case 'video':
      return (
        <div 
          className="w-full h-full overflow-hidden bg-black flex items-center justify-center group relative"
          style={{ borderRadius: block.styles?.borderRadius || '0px' }}
        >
          {block.content.url ? (
            <div className="w-full h-full relative">
              {getYouTubeId(block.content.url) ? (
                <iframe
                  key={block.content.url}
                  src={`https://www.youtube.com/embed/${getYouTubeId(block.content.url)}?autoplay=${block.content.autoplay ? 1 : 0}&mute=${block.content.muted ? 1 : 0}&loop=${block.content.loop ? 1 : 0}&playlist=${getYouTubeId(block.content.url)}&controls=1`}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  allow="autoplay; encrypted-media"
                />
              ) : getVimeoId(block.content.url) ? (
                <iframe
                  key={block.content.url}
                  src={`https://player.vimeo.com/video/${getVimeoId(block.content.url)}?autoplay=${block.content.autoplay ? 1 : 0}&muted=${block.content.muted ? 1 : 0}&loop=${block.content.loop ? 1 : 0}`}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <video 
                  key={block.content.url}
                  src={block.content.url || undefined} 
                  autoPlay={block.content.autoplay} 
                  muted={block.content.muted} 
                  loop={block.content.loop} 
                  playsInline 
                  preload="auto"
                  className="w-full h-full"
                  style={{ objectFit: (block.styles?.objectFit as any) || 'cover' }}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 text-white/20">
              <Video size={48} />
              <span className="text-[10px] font-black uppercase tracking-widest">Video URL Required</span>
            </div>
          )}
        </div>
      );

    case 'cta':
      return (
        <div className="h-full relative overflow-hidden group">
          <AbstractBackground variant="geometric" opacity={0.1} />
          <AbstractBackground variant="mesh" opacity={0.05} />
          <div 
            className="h-full w-full p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-xl relative z-10"
            style={{ 
              backgroundColor: block.styles?.backgroundColor || 'var(--color-primary)',
              color: block.styles?.textColor || '#ffffff',
              borderRadius: block.styles?.borderRadius || '0px'
            }}
          >
            <h2 className="text-2xl md:text-4xl font-black normal-case tracking-tight" style={{ color: 'inherit' }}>{toTitleCase(block.content.title)}</h2>
            <button 
              className="px-8 py-4 rounded-lg text-[10px] font-black normal-case tracking-widest shadow-lg flex items-center gap-2"
              style={{
                backgroundColor: block.styles?.buttonColor || '#ffffff',
                color: block.styles?.buttonTextColor || 'var(--color-primary)'
              }}
            >
              {block.content.buttonType === 'whatsapp' && <MessageCircle size={14} />}
              {toTitleCase(block.content.buttonText)}
            </button>
          </div>
        </div>
      );

    case 'slider':
      return (
        <div className="h-full">
          <div 
            className="h-full w-full overflow-hidden relative group bg-slate-100 dark:bg-zinc-800 flex items-center justify-center"
            style={{ borderRadius: block.styles?.borderRadius || '0px' }}
          >
             {block.content.images?.length > 0 ? (
               <div className="flex h-full w-full">
                  {block.content.images.map((img: string, idx: number) => (
                     <img key={idx} src={img || null} alt="" className="w-full h-full object-cover shrink-0" referrerPolicy="no-referrer" />
                  ))}
               </div>
             ) : (
               <Sliders size={48} className="text-slate-300" />
             )}
          </div>
        </div>
      );

    case 'features':
      return (
        <div className="h-full p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {(block.content.items || []).map((item: any, idx: number) => (
                <div key={idx} className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                   <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                      <Zap size={24} />
                   </div>
                   <h3 className="text-lg font-black text-slate-900 dark:text-white normal-case tracking-tight mb-2">{toTitleCase(item.title)}</h3>
                   <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
             ))}
          </div>
        </div>
      );

    case 'stats':
      return (
        <div className="h-full p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             {(block.content.items || []).map((item: any, idx: number) => (
                <div key={idx} className="text-center space-y-2">
                   <div className="text-3xl md:text-5xl font-black text-primary tracking-tighter">
                     <Counter value={item.value} color={block.styles?.buttonColor || 'var(--color-primary)'} />
                   </div>
                   <div className="text-[10px] font-black text-slate-400 normal-case tracking-[0.2em]">{toTitleCase(item.label)}</div>
                </div>
             ))}
          </div>
        </div>
      );

    case 'container':
      return (
        <div 
          className="h-full w-full relative group"
          style={{ 
            backgroundColor: block.content.backgroundColor || '#ffffff',
            padding: `${block.content.padding || 0}px`,
            borderRadius: `${block.content.borderRadius || 0}px`,
          }}
        >
          <div className="absolute inset-0 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-lg pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="h-full w-full overflow-auto no-scrollbar">
            {page.sections.flatMap(s => s.blocks).filter(b => b.parentId === block.id).length > 0 ? (
              <div className="space-y-2">
                {page.sections.flatMap(s => s.blocks || []).filter(b => b.parentId === block.id).map(child => (
                  <div key={child.id} className="p-2 bg-slate-50 dark:bg-zinc-800 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-400 flex justify-between items-center">
                    <span>{child?.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Box size={24} className="text-slate-300" />
              </div>
            )}
          </div>
        </div>
      );

    case 'html':
      return (
        <div className="h-full w-full overflow-auto no-scrollbar relative group/html">
          <div className="absolute inset-0 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-col items-center justify-center opacity-0 group-hover/html:opacity-100 transition-opacity z-10 pointer-events-none">
            <Code size={24} className="text-primary mb-2" />
            <span className="text-[8px] font-black uppercase tracking-widest text-primary">HTML Block</span>
          </div>
          <iframe 
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { margin: 0; font-family: sans-serif; overflow: hidden; }
                    ${block.content.css || ''}
                  </style>
                </head>
                <body>
                  ${block.content.code || ''}
                </body>
              </html>
            `}
            className="w-full h-full border-none pointer-events-none"
            title="Dynamic Content"
          />
        </div>
      );

    case 'services':
      return (
        <div className="h-full p-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white normal-case tracking-tighter mb-8 text-center">{toTitleCase(block.content.title)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {data.serviceCards.slice(0, block.content.limit || 6).map((service, idx) => (
                <div key={service.id} className="group relative aspect-[4/5] overflow-hidden rounded-[32px] border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800">
                   {service.imageUrl && (
                     <img src={service.imageUrl || null} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                   <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-xl font-black text-white normal-case tracking-tight mb-2">{toTitleCase(service.title)}</h3>
                      <p className="text-xs text-white/70 font-bold line-clamp-2">{service.description}</p>
                   </div>
                </div>
             ))}
          </div>
        </div>
      );

    case 'destinations':
      return (
        <div className="h-full p-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white normal-case tracking-tighter mb-8 text-center">{toTitleCase(block.content.title)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {data.catalogue.slice(0, block.content.limit || 3).map((dest, idx) => (
                <div key={dest.id} className="group bg-white dark:bg-zinc-900 rounded-md overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-slate-100 dark:border-zinc-800 flex flex-col">
                   <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-zinc-800 relative">
                      {dest.img && (
                        <img src={dest.img || null} alt={dest.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black normal-case rounded">
                           {toTitleCase(dest.label)}
                        </span>
                        <div className="flex items-center space-x-1 text-primary font-bold text-[10px]">
                          <Star size={10} fill="currentColor" />
                          <span>{dest.rating || '4.9'}</span>
                        </div>
                      </div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white normal-case tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-1">{toTitleCase(dest.title)}</h3>
                      <div className="pt-2 flex items-center text-[9px] font-black text-primary normal-case tracking-widest group-hover:translate-x-1 transition-transform">
                        <span>View Details</span>
                        <ArrowRight size={12} className="ml-2" />
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>
      );

    case 'blog':
      return (
        <div className="h-full p-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white normal-case tracking-tighter mb-8 text-center">{toTitleCase(block.content.title)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {data.blogPosts.slice(0, block.content.limit || 3).map((post, idx) => (
                <div key={post.id} className="group bg-white dark:bg-zinc-900 rounded-md overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-slate-100 dark:border-zinc-800 flex flex-col">
                   <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-zinc-800 relative">
                      {post.images?.[0] && (
                        <img src={post.images[0] || null} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black normal-case rounded">
                           Article
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 normal-case tracking-widest">{post.date}</span>
                      </div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white normal-case tracking-tight line-clamp-2 leading-tight group-hover:text-primary transition-colors">{toTitleCase(post.title)}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium line-clamp-2 normal-case tracking-tight">{toTitleCase(post.subtitle)}</p>
                      <div className="pt-2 flex items-center text-[9px] font-black text-primary normal-case tracking-widest group-hover:translate-x-1 transition-transform">
                        <span>Read Story</span>
                        <ArrowRight size={12} className="ml-2" />
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>
      );

    case 'reviews':
      return (
        <div className="h-full p-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white normal-case tracking-tighter mb-8 text-center">{toTitleCase(block.content.title)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.reviews.slice(0, block.content.limit || 3).map((review, idx) => (
                <div key={review.id} className="p-8 bg-white dark:bg-zinc-900 rounded-[32px] border border-slate-100 dark:border-zinc-800 shadow-sm space-y-4">
                   <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />)}
                   </div>
                   <p className="text-sm text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">"{review.text}"</p>
                   <div className="flex items-center gap-3 pt-4 border-t border-slate-50 dark:border-zinc-800">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                         {review.avatar && (
                           <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                         )}
                      </div>
                      <div>
                         <div className="text-[10px] font-black text-slate-900 dark:text-white normal-case tracking-tight">{toTitleCase(review.name)}</div>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>
      );

    case 'onelink': {
      const links = block.content.links || [];
      const title = block.content.title || 'Connect With Our Socials';

      const getPlatformStats = (platform: string) => {
        switch (platform.toLowerCase()) {
          case 'facebook':
            return { color: 'bg-[#1877F2] hover:opacity-90 text-white', icon: <Facebook size={18} /> };
          case 'instagram':
            return { color: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-90 text-white', icon: <Instagram size={18} /> };
          case 'youtube':
            return { color: 'bg-[#FF0000] hover:opacity-90 text-white', icon: <Youtube size={18} /> };
          case 'whatsapp':
            return { color: 'bg-[#25D366] hover:opacity-90 text-white', icon: <MessageCircle size={18} /> };
          case 'tiktok':
            return { color: 'bg-black dark:bg-zinc-950 hover:opacity-95 text-white border border-white/10', icon: <Video size={18} /> };
          case 'twitter':
          case 'x':
            return { color: 'bg-slate-900 hover:opacity-90 text-white', icon: <Twitter size={18} /> };
          case 'linkedin':
            return { color: 'bg-[#0077B5] hover:opacity-90 text-white', icon: <Linkedin size={18} /> };
          case 'email':
            return { color: 'bg-teal-650 hover:opacity-90 text-white', icon: <Mail size={18} /> };
          default:
            return { color: 'bg-primary hover:opacity-90 text-white', icon: <Globe size={18} /> };
        }
      };

      return (
        <div className="p-6 md:p-8 rounded-3xl w-full text-center space-y-6">
          {title && (
            <h3 className="text-lg md:text-xl font-black tracking-tight text-slate-800 dark:text-white uppercase">
              {title}
            </h3>
          )}
          <div className="flex flex-col gap-3 max-w-md mx-auto">
            {links.map((lnk: any, idx: number) => {
              const platformInfo = getPlatformStats(lnk.platform || 'website');
              return (
                <a
                  key={idx}
                  href={lnk.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-4 px-6 rounded-2xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest shadow-md transition-all duration-300 transform hover:-translate-y-0.5 ${platformInfo.color}`}
                >
                  <span className="flex items-center gap-3">
                    {platformInfo.icon}
                    <span>{lnk.label || lnk.platform}</span>
                  </span>
                  <ArrowRight size={14} className="opacity-75" />
                </a>
              );
            })}
          </div>
        </div>
      );
    }

    case 'branches': {
      const branches = block.content.items || [];
      const title = block.content.title || 'Our Branch Locations';
      return (
        <div className="p-6 md:p-8 rounded-3xl w-full space-y-6">
          {title && (
            <h3 className="text-lg md:text-xl font-black tracking-tight text-slate-800 dark:text-white text-center uppercase">
              {title}
            </h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((branch: any, idx: number) => (
              <div 
                key={idx} 
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-primary/25 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 font-bold">
                      <Building2 size={16} />
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {branch.name}
                    </span>
                  </div>
                  {branch.address && (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold leading-normal">
                      {branch.address}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/60 font-medium">
                  {branch.phone && (
                    <a
                      href={`tel:${branch.phone.replace(/[^0-9+]/g, '')}`}
                      className="flex-1 py-3 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Phone size={11} /> Call Us
                    </a>
                  )}
                  {branch.locationUrl && (
                    <a
                      href={branch.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <MapPin size={11} /> Locate Map
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'price-list': {
      const items = block.content.items || [];
      const title = block.content.title || 'Our Service Pricing';
      return (
        <div className="p-6 md:p-8 rounded-3xl w-full space-y-6">
          {title && (
            <h3 className="text-lg md:text-xl font-black tracking-tight text-slate-800 dark:text-white text-center uppercase">
              {title}
            </h3>
          )}
          <div className="space-y-3 max-w-2xl mx-auto">
            {items.map((item: any, idx: number) => (
              <div 
                key={idx} 
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {item.name}
                  </h4>
                  {item.desc && (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold leading-relaxed">
                      {item.desc}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 bg-primary/10 dark:bg-primary/20 text-primary px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tight whitespace-nowrap">
                  {item.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'faq': {
      const items = block.content.items || [];
      const title = block.content.title || 'Frequently Asked Questions';
      const [openIndex, setOpenIndex] = React.useState<number | null>(null);

      return (
        <div className="p-6 md:p-8 rounded-3xl w-full space-y-6">
          {title && (
            <h3 className="text-lg md:text-xl font-black tracking-tight text-slate-800 dark:text-white text-center uppercase">
              {title}
            </h3>
          )}
          <div className="space-y-3 max-w-2xl mx-auto">
            {items.map((item: any, idx: number) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full py-4 px-5 flex items-center justify-between text-left gap-4 font-black text-xs text-slate-900 dark:text-white hover:text-primary transition-colors focus:outline-none"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp size={16} className="text-primary shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-2 text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400 font-semibold border-t border-slate-100 dark:border-zinc-805/60">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    default:
      return <div className="p-4 text-xs opacity-50">Block type "{block.type}" not implemented</div>;
  }
};

export default BlockContent;
