import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowLeft, 
  Printer, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Building2, 
  Phone, 
  User, 
  Calendar, 
  CreditCard,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import PublicInvoiceView from './PublicInvoiceView';

interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  date: string;
  total: number;
  subtotal?: number;
  paymentStatus?: 'paid' | 'due' | 'partial';
  amountPaid?: number;
  businessName?: string;
  businessArabicName?: string;
  items?: Array<{ id?: string; description?: string; quantity?: number; price?: number }>;
  createdAt?: string;
  isSadad?: boolean;
}

interface PublicInvoicePortalProps {
  onSelectInvoice?: (invoiceId: string) => void;
  onBack?: () => void;
  initialInvoiceId?: string | null;
}

export default function PublicInvoicePortal({ onSelectInvoice, onBack, initialInvoiceId }: PublicInvoicePortalProps) {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>(() => {
    try {
      const cached = localStorage.getItem('kh_dream_invoices');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialInvoiceId || '');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'due' | 'partial'>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(initialInvoiceId || null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const fetchInvoices = async (forceSync = false) => {
    setLoading(true);
    if (forceSync) setIsSyncing(true);
    try {
      const syncQuery = forceSync ? '&sync=true' : '';
      const res = await fetch(`/api/invoices?t=${Date.now()}${syncQuery}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setInvoices(data);
          localStorage.setItem('kh_dream_invoices', JSON.stringify(data));
          setLastSyncTime(new Date());
        }
      }
    } catch (err) {
      console.warn('Failed to load invoices from API, using cached data if available:', err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchInvoices(true);
    // Auto-sync every 60 seconds
    const interval = setInterval(() => {
      fetchInvoices(false);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update active invoice if initial prop changes
  useEffect(() => {
    if (initialInvoiceId) {
      setActiveInvoiceId(initialInvoiceId);
    }
  }, [initialInvoiceId]);

  // Unique business entities for filter
  const businessEntities = Array.from(
    new Set(invoices.map(i => i.businessName).filter(Boolean))
  ) as string[];

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    // Exclude mini sadad receipts from regular tax invoice list unless searched
    const matchesStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;
    const matchesEntity = entityFilter === 'all' || inv.businessName === entityFilter;

    if (!matchesStatus || !matchesEntity) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    const invNo = (inv.invoiceNumber || '').toLowerCase();
    const id = (inv.id || '').toLowerCase();
    const name = (inv.customerName || '').toLowerCase();
    const phone = (inv.customerPhone || '').toLowerCase();
    const date = (inv.date || '').toLowerCase();
    const itemsDesc = (inv.items || []).map(i => i.description || '').join(' ').toLowerCase();

    return invNo.includes(q) || id.includes(q) || name.includes(q) || phone.includes(q) || date.includes(q) || itemsDesc.includes(q);
  });

  // If viewing a specific invoice
  if (activeInvoiceId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-16">
        {/* Top return bar */}
        <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-40 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button
              onClick={() => {
                setActiveInvoiceId(null);
                if (window.history.pushState) {
                  window.history.pushState({}, '', '/invoice');
                }
              }}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white transition-colors uppercase tracking-wider"
            >
              <ArrowLeft size={16} />
              <span>Back to Invoice Directory</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-zinc-400">
                Verified Document: {activeInvoiceId}
              </span>
            </div>
          </div>
        </div>

        <PublicInvoiceView 
          invoiceId={activeInvoiceId} 
          onBack={() => {
            setActiveInvoiceId(null);
            if (window.history.pushState) {
              window.history.pushState({}, '', '/invoice');
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white transition-colors duration-300 pb-20">
      {/* Header Banner */}
      <div className="relative border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden">
        <div className="absolute inset-0 bg-radial from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck size={13} />
                  Official Digital Archive
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  data/invoices auto-synced
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Invoices & Official Receipts Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                Verify authenticity, review service breakdowns, and access verified tax invoices generated by KH Dream Travels & Tourism.
              </p>
            </div>

            {/* Quick Actions / Back */}
            <div className="flex items-center gap-3 self-start md:self-center">
              <button
                onClick={() => fetchInvoices(true)}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all disabled:opacity-50"
                title="Sync and pull latest invoices from data/invoices/"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin text-primary' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Directory'}</span>
              </button>
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/20 hover:brightness-110 transition-all uppercase tracking-wider"
                >
                  <ArrowLeft size={14} />
                  <span>Return to Site</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">Available Invoices</span>
              <span className="text-xl font-black text-slate-800 dark:text-white font-mono mt-1 block">{invoices.length}</span>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">Paid & Settled</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                {invoices.filter(i => i.paymentStatus === 'paid').length}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">Pending / Partial</span>
              <span className="text-xl font-black text-amber-500 font-mono mt-1 block">
                {invoices.filter(i => i.paymentStatus === 'due' || i.paymentStatus === 'partial').length}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">Storage Folder</span>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-zinc-300 mt-2 block truncate">
                data/invoices/
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by invoice number (e.g. KHDAZ-1117), customer name, phone, or service..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-primary transition-all text-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['all', 'paid', 'due', 'partial'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {status === 'all' ? 'All Invoices' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Entity Filter pills if multiple exist */}
          {businessEntities.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-zinc-800/60 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Branch:</span>
              <button
                onClick={() => setEntityFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                  entityFilter === 'all' 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                All Branches
              </button>
              {businessEntities.map(ent => (
                <button
                  key={ent}
                  onClick={() => setEntityFilter(ent)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap truncate max-w-[200px] ${
                    entityFilter === ent 
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                  title={ent}
                >
                  {ent}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Invoices List Display */}
        {loading && invoices.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="animate-spin mx-auto text-primary" size={28} />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading invoices from data/invoices/...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-4">
            <FileText className="mx-auto text-slate-300 dark:text-zinc-600" size={48} />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No invoices found matching criteria</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                {searchQuery 
                  ? `No record matched "${searchQuery}". Double-check the invoice reference number or customer phone.` 
                  : 'No invoices currently saved in the data/invoices directory.'}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300"
              >
                Reset Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInvoices.map((inv) => {
              const displayId = inv.invoiceNumber || inv.id;
              const isPaid = inv.paymentStatus === 'paid';
              const isPartial = inv.paymentStatus === 'partial';

              return (
                <div
                  key={inv.id || inv.invoiceNumber}
                  className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between group"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Invoice Number & Status Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <FileText size={15} className="text-primary" />
                        <span className="text-xs font-mono font-black tracking-tight text-slate-900 dark:text-white">
                          {displayId}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        isPaid 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                          : isPartial 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}>
                        {inv.paymentStatus || 'issued'}
                      </span>
                    </div>

                    {/* Customer & Branch Information */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-zinc-800/60">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-200">
                        <User size={13} className="text-slate-400 shrink-0" />
                        <span className="text-xs font-bold truncate">
                          {inv.customerName || 'Valued Client'}
                        </span>
                      </div>
                      {inv.customerPhone && (
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-mono">
                          <Phone size={12} className="text-slate-400 shrink-0" />
                          <span>{inv.customerPhone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px]">
                        <Calendar size={12} className="text-slate-400 shrink-0" />
                        <span>{inv.date || 'Standard Date'}</span>
                      </div>
                      {inv.businessName && (
                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500 text-[10px] truncate">
                          <Building2 size={11} className="shrink-0" />
                          <span className="truncate">{inv.businessName}</span>
                        </div>
                      )}
                    </div>

                    {/* Items snippet */}
                    {Array.isArray(inv.items) && inv.items.length > 0 && (
                      <div className="bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/40">
                        <p className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 truncate">
                          {inv.items.map(i => i.description).filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Row: Total & Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Total Amount</span>
                      <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                        {Number(inv.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] font-bold text-slate-500">SAR</span>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const targetId = inv.id || inv.invoiceNumber;
                        if (onSelectInvoice) {
                          onSelectInvoice(targetId);
                        } else {
                          setActiveInvoiceId(targetId);
                          if (window.history.pushState) {
                            window.history.pushState({}, '', `/invoice/${encodeURIComponent(targetId)}`);
                          }
                        }
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs group-hover:bg-primary group-hover:text-white"
                    >
                      <span>View & Verify</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
