import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronUp, 
  MessageCircle, 
  Phone, 
  X, 
  ExternalLink,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../context/CMSContext';

const FloatingActions: React.FC<{ t: (path: string) => string; isAdmin?: boolean }> = ({ t, isAdmin }) => {
  const { data, updateData } = useCMS();
  const [showScroll, setShowScroll] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [message, setMessage] = useState('');
  const notificationAudio = useRef<HTMLAudioElement | null>(null);
  const audioUnlocked = useRef(false);
  
  const promos = data.floatingCardItems?.filter(item => item.active) || [];

  // Unlock audio on first interaction
  useEffect(() => {
    const unlockAudio = () => {
      if (audioUnlocked.current) return;
      if (notificationAudio.current) {
        notificationAudio.current.play().then(() => {
          notificationAudio.current?.pause();
          if (notificationAudio.current) notificationAudio.current.currentTime = 0;
          audioUnlocked.current = true;
        }).catch(() => {});
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const playNotificationSound = () => {
    if (!data.general?.notificationSoundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.07); // E5
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (err) {
      // Silently fail if blocked by browser
    }
  };

  useEffect(() => {
    if (promos.length > 0) {
      setCurrentPromoIndex(Math.floor(Math.random() * promos.length));
    }
  }, [promos.length]);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    
    // Show promo after 4 seconds
    const promoTimer = setTimeout(() => {
      if (promos.length > 0) {
        setShowPromo(true);
        playNotificationSound();
      }
    }, 4000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(promoTimer);
    };
  }, [promos.length, data.general?.notificationSoundEnabled]);

  if (isAdmin) return null;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSend = () => {
    if (!message.trim()) return;
    const greeting = data.general?.whatsappGreeting || "Hello! I am interested in your services.";
    const fullMessage = `${greeting}\n\n${message}`;
    const encodedMessage = encodeURIComponent(fullMessage);
    window.open(`https://wa.me/${data.general.whatsapp}?text=${encodedMessage}`, '_blank');
    setMessage('');
    setIsChatOpen(false);
  };

  return (
    <>
      {/* Left side: Interaction Cards (Promos) */}
      <div className="hidden md:block fixed bottom-6 left-6 z-[1200] pointer-events-none">
        <AnimatePresence>
          {showPromo && promos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              className="pointer-events-auto relative w-72 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden p-5 group animate-all duration-300"
            >
              {/* Header actions: Close */}
              <div className="absolute top-3 right-3 z-10">
                <button 
                  type="button"
                  onClick={() => setShowPromo(false)}
                  title="Close Card"
                  className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/15 rounded-full transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex gap-4 items-start pr-12">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 overflow-hidden shrink-0 border border-primary/20 p-1">
                  <img 
                    src={promos[currentPromoIndex].logoUrl || "https://cdn-icons-png.flaticon.com/512/3233/3233010.png"} 
                    className="w-full h-full object-contain" 
                    alt="" 
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">Special Update</p>
                  </div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
                    {promos[currentPromoIndex].name}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <a 
                  href={promos[currentPromoIndex].buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all shadow-lg shadow-black/10"
                >
                  {promos[currentPromoIndex].buttonText}
                  <ExternalLink size={12} />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side: Communication Hub */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[1200] flex flex-col items-end gap-3">
        {/* Scroll to Top */}
        <AnimatePresence>
          {showScroll && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={scrollToTop}
              className="p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all group"
            >
              <ChevronUp size={18} className="text-slate-600 dark:text-white group-hover:-translate-y-0.5 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3">
          {/* WhatsApp Action */}
          <div className="relative">
            <AnimatePresence>
              {isChatOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                  className="absolute bottom-full right-0 mb-4 w-[calc(100vw-48px)] sm:w-80 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden"
                >
                  <div className="bg-[#25D366] p-3 text-white">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                          <MessageCircle size={15} fill="currentColor" />
                        </div>
                        <div>
                          <h4 className="text-[9px] font-black uppercase tracking-widest leading-none">Support</h4>
                        </div>
                      </div>
                      <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-black/10 rounded-full transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-zinc-950/50">
                    <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-white/5 mb-2">
                      <p className="text-[9px] font-medium text-slate-600 dark:text-zinc-300 leading-relaxed italic">
                        "{data.general?.whatsappGreeting || 'How can we help you?'}"
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-[9px] font-medium outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all resize-none h-16"
                      />
                      <button 
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className="w-full py-2.5 bg-[#25D366] text-white rounded-xl font-black uppercase tracking-widest text-[8px] flex items-center justify-center gap-2 hover:bg-[#128C7E] active:scale-95 transition-all shadow-lg shadow-[#25D366]/20 disabled:opacity-50"
                      >
                        <MessageCircle size={10} fill="currentColor" />
                        <span>Start Chat</span>
                      </button>

                      <div className="flex items-center gap-2 py-0.5">
                        <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                        <span className="text-[6px] font-black uppercase tracking-widest text-slate-400">or</span>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                      </div>

                      <a 
                        href={`tel:${data.general.whatsapp}`}
                        className="w-full py-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-xl font-black uppercase tracking-widest text-[8px] flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                      >
                        <Phone size={10} />
                        <span>Direct Call</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-2xl relative transition-all duration-500
                ${isChatOpen 
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rotate-90 scale-90' 
                  : 'bg-[#25D366] text-white hover:scale-110 active:scale-95'}`}
            >
              {isChatOpen ? <X size={24} /> : <MessageCircle size={28} fill="currentColor" className="md:w-8 md:h-8" />}
            </button>
          </div>
        </div>
      </div>

    </>
  );
};

export default FloatingActions;
