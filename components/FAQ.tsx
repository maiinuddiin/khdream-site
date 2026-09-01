import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  Search,
  MessageSquare, 
  PhoneCall, 
  Mail
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';

const FAQItem = ({ 
  question, 
  answer, 
  isOpen, 
  onClick 
}: { 
  question: string; 
  answer: string; 
  isOpen: boolean; 
  onClick: () => void;
}) => {
  return (
    <div className="border-b border-slate-200 dark:border-zinc-800 last:border-0">
      <button
        type="button"
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group cursor-pointer"
      >
        <span className="text-sm md:text-base font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-primary transition-colors pr-6">
          {question}
        </span>
        <span className="flex-shrink-0 text-slate-400 group-hover:text-primary transition-colors">
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-6 pr-6 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const { data } = useCMS();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  if (!data.faqs || data.faqs.length === 0) return null;

  const filteredFaqs = data.faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <section id="faq" className="py-24 bg-white dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Help & FAQs
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Find answers to common questions or reach out to our team.
          </p>
        </div>

        <div className="relative mb-12">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mb-16">
          {filteredFaqs.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-zinc-800 border-t border-b border-slate-200 dark:border-zinc-800">
              {filteredFaqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === index}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
            <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <PhoneCall size={20} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Call Us</h3>
            <a href={'tel:' + data.general.phone} className="text-sm text-slate-600 dark:text-zinc-400 hover:text-primary transition-colors">
              {data.general.phone}
            </a>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
            <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <Mail size={20} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Email Us</h3>
            <a href={'mailto:' + data.general.email} className="text-sm text-slate-600 dark:text-zinc-400 hover:text-primary transition-colors">
              {data.general.email}
            </a>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
            <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">WhatsApp</h3>
            <a href={'https://wa.me/' + data.general.whatsapp} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 dark:text-zinc-400 hover:text-primary transition-colors">
              Message us
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FAQ;
