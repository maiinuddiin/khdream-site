import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft, Calculator, FileDown, Loader2, Landmark, Coins, FileCheck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const SadadInvoice: React.FC<{ onBack: () => void; t: (path: string) => string }> = ({ onBack, t }) => {
  const { data, currentUser } = useCMS();
  const [selectedBusinessId, setSelectedBusinessId] = useState(data.businessProfiles[0]?.id || '');
  const selectedBusiness = data.businessProfiles.find(b => b.id === selectedBusinessId) || data.businessProfiles[0];

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Multiple items state
  interface ReceiptItem {
    id: string;
    name: string;
    amount: number;
  }
  const [items, setItems] = useState<ReceiptItem[]>([
    { id: '1', name: 'Air Ticket Booking', amount: 0 }
  ]);

  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'due' | 'partial'>('paid');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [showSeal, setShowSeal] = useState<boolean>(true);
  const [issuedBy, setIssuedBy] = useState('');
  
  // Flexible service charge: percent or fixed amount
  const [serviceChargeType, setServiceChargeType] = useState<'percent' | 'fixed'>('percent');
  const [serviceChargeValue, setServiceChargeValue] = useState<number>(2.5);

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Math.random().toString(), name: '', amount: 0 }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<ReceiptItem>) => {
    setItems((prev) => prev.map((item) => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    }));
  };

  useEffect(() => {
    if (currentUser && !issuedBy) {
      setIssuedBy(currentUser.fullName || currentUser.username || '');
    }
  }, [currentUser]);

  useEffect(() => {
    // Generate a random-ish one-time number since we don't store it in the database
    const random = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const timestamp = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
    setInvoiceNumber(`INV-${selectedBusiness?.invoicePrefix || 'KH'}-${timestamp}-${random}`);
  }, [selectedBusinessId]);

  const pdfRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: pdfRef,
    documentTitle: `INV_${invoiceNumber}`,
    onAfterPrint: () => console.log('Print completed'),
    onPrintError: (errorLocation, error) => {
      console.warn('Print Resource Error (handled):', errorLocation, error);
    }
  });

  const downloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsDownloading(true);
    try {
      const element = pdfRef.current;
      
      const imgData = await toPng(element, {
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        style: {
          transform: 'none',
          boxShadow: 'none',
          margin: '0',
          width: '210mm',
        }
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`Receipt_${invoiceNumber}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert("Failed to generate PDF receipt.");
    } finally {
      setIsDownloading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const commissionAmount = serviceChargeType === 'percent'
      ? (subtotal * serviceChargeValue) / 100
      : serviceChargeValue;
    const total = subtotal + commissionAmount;
    
    // Set actual paid amount based on term status
    const actualPaid = paymentStatus === 'paid' ? total : (paymentStatus === 'partial' ? amountPaid : 0);
    const balanceDue = total - actualPaid;

    return { subtotal, commissionAmount, total, actualPaid, balanceDue };
  };

  const { subtotal, commissionAmount, total, actualPaid, balanceDue } = calculateTotals();

  // Handle setting default amount when status switches to partial
  const handleStatusChange = (status: 'paid' | 'due' | 'partial') => {
    setPaymentStatus(status);
    if (status === 'partial' && amountPaid === 0) {
      setAmountPaid(Math.round(total / 2));
    }
  };

  return (
    <div className="py-6 bg-slate-50 dark:bg-zinc-950/40 rounded-3xl border border-slate-100 dark:border-zinc-850 p-6 md:p-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-8 gap-4 border-b border-slate-150 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <Coins size={12} className="text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500">Quick Receipt / سند قبض فوري</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">One-Time Receipt Console</h2>
          <p className="text-xs text-slate-500 font-medium">Issue fast, custom receipts with optional partial-payments. No database entries created.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={downloadPDF} 
            disabled={isDownloading || total <= 0}
            className="px-5 py-3 bg-slate-900 border border-slate-800 hover:bg-black dark:bg-white dark:border-white dark:text-black dark:hover:bg-zinc-150 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-40"
          >
            {isDownloading ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
            <span>Export PDF</span>
          </button>
          
          <button 
            onClick={() => handlePrint()} 
            disabled={total <= 0}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-40"
          >
            <Printer size={13} />
            <span>Print A4 Receipt</span>
          </button>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
        
        {/* Left Side: Controllers */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Business Entity Selection */}
          <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800/60 shadow-xs space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Landmark size={13} className="text-slate-400" />
              <span>Entity Profile</span>
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Issuing Company / الشركة المصدرة</label>
                <select 
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="w-full bg-slate-50/70 dark:bg-zinc-850 border border-slate-150 dark:border-zinc-800 rounded-xl p-3 text-xs font-black uppercase tracking-wider outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all cursor-pointer"
                >
                  {data.businessProfiles.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Invoice No / الرقم</label>
                  <input 
                    type="text" 
                    value={invoiceNumber} 
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className="w-full bg-slate-50/70 dark:bg-zinc-850 dark:text-zinc-350 border border-slate-150 dark:border-zinc-800 rounded-xl p-3 text-[11px] font-mono select-all outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Date / التاريخ</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-50/70 dark:bg-zinc-850 border border-slate-150 dark:border-zinc-800 rounded-xl p-3 text-[11px] font-mono outline-none" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800/60 shadow-xs space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Landmark size={13} className="text-slate-400" />
              <span>Customer Credentials</span>
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Recipient Full Name / العميل</label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={e => setCustomerName(e.target.value)} 
                  className="w-full bg-slate-50/70 dark:bg-zinc-850 border border-slate-150 dark:border-zinc-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-emerald-600 transition-all" 
                  placeholder="e.g. John Doe" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Customer Phone / الجوال</label>
                  <input 
                    type="text" 
                    value={customerPhone} 
                    onChange={e => setCustomerPhone(e.target.value)} 
                    className="w-full bg-slate-50/70 dark:bg-zinc-850 border border-slate-150 dark:border-zinc-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-emerald-600 transition-all font-mono" 
                    placeholder="966..." 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Operator Name / الكاشير</label>
                  <input 
                    type="text" 
                    value={issuedBy} 
                    onChange={e => setIssuedBy(e.target.value)} 
                    className="w-full bg-slate-50/70 dark:bg-zinc-850 border border-slate-150 dark:border-zinc-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-emerald-600 transition-all" 
                    placeholder="e.g. Admin Term" 
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Itemized List Configuration */}
          <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800/60 shadow-xs space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Calculator size={13} className="text-slate-400" />
                <span>Line Items / تفاصيل الباقة والرسوم</span>
              </h4>
              <button 
                type="button"
                onClick={handleAddItem}
                className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 no-scrollbar-all">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-2.5 items-center bg-slate-50/50 dark:bg-zinc-900/10 p-2.5 rounded-xl border border-slate-150 dark:border-zinc-800 transition-all">
                  <span className="text-[9px] font-mono font-black text-slate-400 w-4 text-center">{idx + 1}</span>
                  
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={item.name} 
                      onChange={e => handleUpdateItem(item.id, { name: e.target.value })} 
                      className="w-full bg-transparent border-0 outline-none text-xs font-bold text-slate-800 dark:text-zinc-200 placeholder-slate-400" 
                      placeholder="e.g. Schengen Visa Application" 
                    />
                  </div>

                  <div className="w-24 relative flex items-center pr-3">
                    <input 
                      type="number" 
                      value={item.amount || ''} 
                      onChange={e => handleUpdateItem(item.id, { amount: parseFloat(e.target.value) || 0 })} 
                      className="w-full bg-transparent border-0 outline-none text-right text-xs font-black font-mono text-slate-900 dark:text-white" 
                      placeholder="0.00"
                    />
                    <span className="text-[8px] font-black text-slate-400 uppercase ml-1">SAR</span>
                  </div>

                  {items.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer text-xs"
                      title="Remove Item"
                    >
                      ✕
                    </button>
                  ) : (
                    <div className="w-4" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="font-bold text-slate-400 uppercase text-[9px]">Subtotal / المجموع الفرعي:</span>
              <span className="font-black text-slate-900 dark:text-white font-mono">{subtotal.toFixed(2)} SAR</span>
            </div>
          </div>

          {/* Financials & Interactive Terms */}
          <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800/60 shadow-xs space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Calculator size={13} className="text-slate-400" />
              <span>Service Charge & Payment Term</span>
            </h4>

            <div className="space-y-4">
              {/* Type toggle: Percent % vs Fixed SAR */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5 font-sans">Service Charge Type / نوع الرسوم</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/60 dark:bg-zinc-850/60 rounded-xl border border-slate-150 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setServiceChargeType('percent')}
                    className={`p-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer text-center ${serviceChargeType === 'percent' ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceChargeType('fixed')}
                    className={`p-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer text-center ${serviceChargeType === 'fixed' ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Fixed Amount (SAR)
                  </button>
                </div>
              </div>

              {/* Dynamic input based on selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5 font-sans">
                    {serviceChargeType === 'percent' ? 'Rate % / النسبة' : 'Fixed Fee (SAR) / القيمة'}
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step={serviceChargeType === 'percent' ? '0.1' : '1'}
                      value={serviceChargeValue || ''} 
                      onChange={e => setServiceChargeValue(parseFloat(e.target.value) || 0)} 
                      className="w-full bg-slate-50/70 dark:bg-zinc-850 border border-slate-150 dark:border-zinc-800 rounded-xl p-3 text-xs font-black font-mono outline-none" 
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">
                      {serviceChargeType === 'percent' ? '%' : 'SAR'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5 font-sans">Calculated Charge</label>
                  <div className="w-full bg-slate-50/70 dark:bg-zinc-850 border border-slate-150 dark:border-zinc-800 rounded-xl p-3 text-xs font-black text-emerald-600 font-mono">
                    {commissionAmount.toFixed(2)} SAR
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Receipt State / حالة الدفع</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'paid', label: 'Cash Paid', desc: 'مدفوع' },
                    { id: 'partial', label: 'Partial', desc: 'جزئي' },
                    { id: 'due', label: 'Full Due', desc: 'مستحق' }
                  ].map((term) => (
                    <button
                      key={term.id}
                      type="button"
                      onClick={() => handleStatusChange(term.id as 'paid' | 'due' | 'partial')}
                      className={`py-2 px-1 border transition-all rounded-xl text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer
                        ${paymentStatus === term.id 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black scale-102' 
                          : 'bg-slate-50/70 dark:bg-zinc-850 border-slate-150 dark:border-zinc-800 text-slate-500'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-tight">{term.label}</span>
                      <span className="text-[8px] opacity-70">{term.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Partial Payment Option input triggers */}
              {paymentStatus === 'partial' && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl space-y-3.5 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-sans">PARTIAL CO-PAY TERMINAL</span>
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Down-Payment Paid Online (SAR) / المبلغ المدفوع حالياً</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        max={total}
                        value={amountPaid || ''} 
                        onChange={e => setAmountPaid(Math.min(total, parseFloat(e.target.value) || 0))} 
                        className="w-full bg-white dark:bg-zinc-900 border border-emerald-500/30 rounded-xl p-2.5 text-base font-black text-emerald-600 outline-none focus:border-emerald-500 transition-all font-mono" 
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">SAR</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-400 uppercase">Outstanding Balance:</span>
                    <span className="font-black text-rose-500 font-mono">{(total - amountPaid).toFixed(2)} SAR</span>
                  </div>
                </div>
              )}

              {/* Stamp and Seals options */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 leading-normal">Overlay official signature stamp:</span>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showSeal}
                    onChange={(e) => setShowSeal(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Responsive high-accuracy container sandbox */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="bg-slate-200/40 dark:bg-zinc-950 border border-slate-250 dark:border-zinc-800 rounded-3xl p-4 w-full flex justify-center overflow-hidden min-h-[500px] select-none">
            <style>{`
              .sadad-preview-wrapper {
                width: 100%;
                overflow: hidden;
                display: flex;
                justify-content: center;
                background: transparent;
              }
              .sadad-scale-container {
                width: 210mm;
                flex-shrink: 0;
                transform: scale(0.68);
                transform-origin: top center;
              }
              @media (max-width: 1400px) {
                .sadad-scale-container {
                  transform: scale(0.55);
                }
              }
              @media (max-width: 1150px) {
                .sadad-scale-container {
                  transform: scale(0.42);
                }
              }
              @media (max-width: 768px) {
                .sadad-scale-container {
                  transform: scale(0.35);
                }
              }
              .sadad-receipt-container {
                font-family: 'Arial', 'Helvetica', sans-serif;
                box-shadow: 0 15px 40px rgba(0,0,0,0.15);
                width: 210mm;
                min-height: 297mm;
                background: white;
                position: relative;
                transform-origin: top center;
              }
            `}</style>
            
            <div className="sadad-preview-wrapper no-scrollbar">
              <div className="sadad-scale-container">
                {/* The A4 Print block */}
                <div ref={pdfRef} className="bg-white text-black p-12 sadad-receipt-container flex flex-col justify-between leading-normal border border-slate-200">
                  
                  {/* Receipt Header Grid */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                      <div className="text-left space-y-1">
                        <h2 className="font-black text-lg uppercase leading-none tracking-tight font-sans flex items-center gap-2">
                          <span>CASH RECEIPT</span>
                          <span className="text-slate-300 font-normal">|</span>
                          <span className="font-medium text-base text-slate-600" dir="rtl">سند دفع نقدي</span>
                        </h2>
                        <p className="text-[9px] text-slate-500 font-bold max-w-[400px] leading-tight uppercase font-sans">
                          {selectedBusiness?.name || 'KH DREAM SERVICES'}<br />
                          {selectedBusiness?.address || 'King Fahd Road, Riyadh, Kingdom of Saudi Arabia'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 inline-block font-sans">MINI RECEIPT</p>
                        <p className="text-[13px] font-black tracking-tight mt-1.5 font-mono">{invoiceNumber || 'INV-DRAFT'}</p>
                      </div>
                    </div>

                    {/* Meta details grid */}
                    <div className="grid grid-cols-2 gap-12 text-[10px]">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="text-slate-400 uppercase font-black text-[8px] font-sans flex items-center gap-1.5">
                            <span>Date</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-500 font-bold animate-fadeIn" dir="rtl">التاريخ</span>
                          </span>
                          <span className="font-bold text-slate-800 font-mono">{date || '2026-05-21'}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="text-slate-400 uppercase font-black text-[8px] font-sans flex items-center gap-1.5">
                            <span>Customer</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-500 font-bold animate-fadeIn" dir="rtl">العميل</span>
                          </span>
                          <span className="font-black text-slate-800 uppercase tracking-tight">{customerName || 'VALUED CLIENT'}</span>
                        </div>
                        {customerPhone && (
                          <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                            <span className="text-slate-400 uppercase font-black text-[8px] font-sans flex items-center gap-1.5">
                              <span>Phone</span>
                              <span className="text-slate-300">/</span>
                              <span className="text-slate-500 font-bold animate-fadeIn" dir="rtl">جوال</span>
                            </span>
                            <span className="font-bold text-slate-800 font-mono">{customerPhone}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 font-sans">
                          <span className="text-slate-400 uppercase font-black text-[8px] flex items-center gap-1.5">
                            <span>Status</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-500 font-bold animate-fadeIn" dir="rtl">الحالة</span>
                          </span>
                          <span className={`font-black uppercase text-[10px] ${paymentStatus === 'paid' ? 'text-emerald-600' : paymentStatus === 'partial' ? 'text-indigo-600' : 'text-rose-600'}`}>
                            {paymentStatus === 'paid' ? 'Paid / مدفوع' : paymentStatus === 'partial' ? 'Partial / جزئي' : 'Due / مستحق'}
                          </span>
                        </div>
                        
                        {paymentStatus === 'partial' && (
                          <>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 animate-fadeIn">
                              <span className="text-slate-400 uppercase font-bold text-[8px] font-sans flex items-center gap-1.5">
                                <span>Paid</span>
                                <span className="text-slate-300">/</span>
                                <span className="text-slate-500 font-bold animate-fadeIn" dir="rtl">المدفوع بقيمة</span>
                              </span>
                              <span className="font-black text-emerald-600 font-mono">{actualPaid.toFixed(2)} SAR</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 animate-fadeIn">
                              <span className="text-slate-400 uppercase font-bold text-[8px] font-sans flex items-center gap-1.5">
                                <span>Ref Balance</span>
                                <span className="text-slate-300">/</span>
                                <span className="text-slate-500 font-bold animate-fadeIn" dir="rtl">المستحق</span>
                              </span>
                              <span className="font-black text-rose-500 font-mono">{balanceDue.toFixed(2)} SAR</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Purchase Line item list */}
                    <div className="pt-4">
                      <div className="bg-slate-50 border-y-2 border-slate-900 py-2 px-2.5 flex justify-between font-black text-[9px] uppercase tracking-widest font-sans">
                        <span className="flex items-center gap-2">
                          <span>Item Specifications</span>
                          <span className="text-slate-300 font-normal">/</span>
                          <span className="text-slate-600 font-medium" dir="rtl">تفاصيل الخدمة</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span>Price (SAR)</span>
                          <span className="text-slate-300 font-normal">/</span>
                          <span className="text-slate-600 font-medium" dir="rtl">السعر</span>
                        </span>
                      </div>
                      
                      <div className="px-2 py-3 divide-y divide-slate-100">
                        {items.map((item, index) => (
                          <div key={item.id} className="flex justify-between items-center py-2 text-[10px]">
                            <span className="uppercase font-black text-slate-800">{item.name || `Service Item #${index + 1}`}</span>
                            <span className="font-bold font-mono text-slate-900">{item.amount.toFixed(2)}</span>
                          </div>
                        ))}
                        {commissionAmount > 0 && (
                          <div className="flex justify-between items-center py-2 text-slate-500 italic text-[8.5px]">
                            <span className="uppercase">
                              Service Charge / رسوم الخدمة 
                              {serviceChargeType === 'percent' ? ` (${serviceChargeValue}%)` : ' (Fixed Amount)'}
                            </span>
                            <span className="font-mono">{commissionAmount.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic stamp, signature qr code footer bottom */}
                  <div className="flex justify-between items-end border-t-2 border-slate-900 pt-6 mt-12 font-sans">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center space-y-1 select-none">
                        <QRCodeSVG value={`INV-${invoiceNumber}-${total}`} size={60} />
                        <p className="text-[6px] text-slate-400 uppercase tracking-widest font-sans">Scan to Verify</p>
                      </div>
                      
                      <div className="flex flex-col items-center relative h-20 w-24">
                        {showSeal && selectedBusiness?.stampUrl && (
                          <img 
                            src={selectedBusiness.stampUrl} 
                            alt="Stamp Seal" 
                            referrerPolicy="no-referrer"
                            className="absolute -top-6 w-full h-[85px] object-contain opacity-80 mix-blend-multiply" 
                          />
                        )}
                        <p className="text-[7.5px] font-black uppercase text-slate-400 mt-auto font-sans">Officer Signature</p>
                        <p className="text-[8.5px] font-black uppercase tracking-tighter italic whitespace-nowrap mt-0.5">{issuedBy || 'Dream Management'}</p>
                      </div>
                    </div>

                    <div className="w-72 space-y-1.5 text-[10px]">
                      <div className="flex justify-between items-center text-slate-500 uppercase font-black">
                        <span>Subtotal / المجموع</span>
                        <span className="font-mono text-slate-900 font-bold">{subtotal.toFixed(2)} SAR</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500 uppercase font-black">
                        <span>Surcharge / الرسوم</span>
                        <span className="font-mono text-slate-900 font-bold">{commissionAmount.toFixed(2)} SAR</span>
                      </div>

                      {paymentStatus === 'partial' ? (
                        <div className="space-y-1.5 pt-2 border-t border-slate-200">
                          <div className="flex justify-between items-center text-slate-500 uppercase font-black">
                            <span>Total Price / الإجمالي</span>
                            <span className="font-mono text-slate-900 font-black">{total.toFixed(2)} SAR</span>
                          </div>
                          <div className="flex justify-between items-center text-emerald-600 uppercase font-black border-t border-slate-100 pt-1">
                            <span>Down Paid / المدفوع</span>
                            <span className="font-mono">{actualPaid.toFixed(2)} SAR</span>
                          </div>
                          <div className="flex justify-between items-center border-t-2 border-slate-900 pt-2 font-black">
                            <span className="text-slate-400 uppercase text-[9px]">Outstanding / المتبقي</span>
                            <span className="font-mono text-slate-900">{balanceDue.toFixed(2)} SAR</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center font-black text-[13px] pt-2 border-t-2 border-slate-950 mt-2">
                          <span className="text-slate-400 text-[9px] uppercase tracking-widest font-sans">Grand Total / الإجمالي</span>
                          <span className="font-mono text-slate-900">{total.toFixed(2)} SAR</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* cut here note */}
                  <div className="mt-8 pt-4 border-t border-dashed border-slate-200 text-center font-sans">
                    <p className="text-[7.5px] text-slate-400 uppercase tracking-widest font-sans">
                      •••• CUT VOUCHER ALONG DASHED LINE •••• THANK YOU FOR YOUR TRUST
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SadadInvoice;
