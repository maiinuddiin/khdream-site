import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Phone, Mail, FileText, CheckCircle2, ChevronRight, Loader2, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCMS } from '../context/CMSContext';

export const AppointmentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { data } = useCMS();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    service: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.phone || !formData.date) {
      setError('Name, phone, and date are required fields.');
      return;
    }

    const dateObj = new Date(formData.date);
    const hours = dateObj.getHours();
    
    // Validate time block (between 14:00 and 23:00)
    if (hours < 14 || hours > 23 || (hours === 23 && dateObj.getMinutes() > 0)) {
      setError('Appointments are only available between 2:00 PM and 11:00 PM.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/appointment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFormData({
            name: '',
            phone: '',
            email: '',
            date: '',
            service: '',
            message: ''
          });
        }, 3000);
      } else {
        setError(result.error || 'Failed to submit appointment request.');
      }
    } catch (err: any) {
      setError('An error occurred while submitting your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm z-[9999]"
          />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl md:rounded-[32px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] pointer-events-auto border border-slate-100 dark:border-zinc-800 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100 dark:border-zinc-900 shrink-0 bg-slate-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Calendar className="text-primary" size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white leading-tight font-montserrat">
                      Get Appointment
                    </h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                      Schedule a Consultation
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto no-scrollbar">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 space-y-4"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="text-emerald-500" size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white font-montserrat uppercase tracking-tight">Request Sent</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-xs mx-auto font-medium">
                      Your appointment request has been successfully submitted. Our team will contact you shortly to confirm the scheduled time.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3">
                        <Info className="text-red-500 shrink-0 mt-0.5" size={16} />
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 leading-snug">{error}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 mb-1.5 block">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                            placeholder="e.g. John Smith"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 mb-1.5 block">Phone Number *</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="tel"
                              required
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                              placeholder="+966 5X XXX XXXX"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 mb-1.5 block">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                              placeholder="john@company.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 mb-1.5 block flex items-center justify-between">
                            <span>Preferred Date & Time *</span>
                            <span className="text-primary text-[8px] normal-case tracking-normal border border-primary/20 bg-primary/5 px-1.5 py-0.5 rounded">2:00 PM - 11:00 PM</span>
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="datetime-local"
                              required
                              value={formData.date}
                              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 mb-1.5 block">Service Interest</label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select
                              value={formData.service}
                              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                              className="w-full pl-10 pr-8 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white appearance-none"
                            >
                              <option value="" disabled>Select subject</option>
                              <option value="Business Setup">Business Setup in KSA</option>
                              <option value="Visa Services">Visa Services</option>
                              <option value="Corporate Services">Corporate Services</option>
                              <option value="Other">Other / General</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 mb-1.5 block">Additional Information</label>
                        <textarea
                          rows={3}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white resize-none"
                          placeholder="Briefly describe your request..."
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg",
                        isSubmitting 
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed hidden" 
                          : "bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-400 text-white shadow-primary/20 hover:-translate-y-0.5"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Booking</span>
                          <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                    {isSubmitting && (
                        <div className="w-full flex justify-center py-2">
                             <Loader2 className="animate-spin text-primary" size={24} />
                        </div>
                    )}
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
