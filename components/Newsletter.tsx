import React from 'react';
import { Send } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import AbstractBackground from './AbstractBackground';

const Newsletter: React.FC<{ t: (path: string) => string }> = ({ t }) => {
  const { data } = useCMS();
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Newsletter error:', error);
      setStatus('error');
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-12 bg-[#fdfdfd] dark:bg-zinc-950 transition-colors duration-700 relative overflow-hidden">
      <div className="max-w-4xl mx-auto p-8 md:p-16 rounded-[40px] md:rounded-[60px] bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 relative overflow-hidden shadow-2xl">
        <AbstractBackground variant="modern-triangles" opacity={0.02} />
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-themed text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20"><Send size={24} /></div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase" dangerouslySetInnerHTML={{ __html: t('newsletter.title') }} />
          <p className="text-sm md:text-base text-slate-500 dark:text-zinc-400 mb-10 max-w-md" dangerouslySetInnerHTML={{ __html: t('newsletter.subtitle') }} />
          <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-primary/50 outline-none dark:text-white font-medium transition-all" 
            />
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="px-8 py-4 bg-gradient-themed hover:brightness-110 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {status === 'loading' ? '...' : (data.general.newsletterButtonText || t('newsletter.button'))}
            </button>
          </form>
          {status === 'success' && <p className="mt-4 text-emerald-500 font-bold text-sm">Thank you for subscribing!</p>}
          {status === 'error' && <p className="mt-4 text-rose-500 font-bold text-sm">Something went wrong. Please try again.</p>}
          <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('newsletter.spam')}</p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
