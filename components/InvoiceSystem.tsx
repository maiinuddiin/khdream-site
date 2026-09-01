import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Plus, Trash2, Download, ArrowLeft, ShieldCheck, FileText, CheckCircle2, Loader2, Building2, ChevronDown, FileDown, User, MapPin, Hash, Percent, Coins, Receipt, Calendar, Phone } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

const InvoiceSystem: React.FC<{ onBack: () => void; t: (path: string) => string; initialData?: any }> = ({ onBack, t, initialData }) => {
  const { data, updateData, currentUser } = useCMS();
  const isStaff = currentUser?.role === 'Staff' || (currentUser?.role !== 'Admin' && currentUser?.role !== 'Manager');
  const isReadOnly = isStaff && !!initialData;

  const [selectedBusinessId, setSelectedBusinessId] = useState(initialData?.businessId || data.businessProfiles[0]?.id || '');
  const selectedBusiness = data.businessProfiles.find(b => b.id === selectedBusinessId) || data.businessProfiles[0];

  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone || '');
  const [customerAddress, setCustomerAddress] = useState(initialData?.customerAddress || '');
  const [customerEmail, setCustomerEmail] = useState(initialData?.customerEmail || '');
  const [customerTaxId, setCustomerTaxId] = useState(initialData?.customerTaxId || '');
  const [issuedBy, setIssuedBy] = useState(initialData?.issuedBy || '');
  const [items, setItems] = useState<InvoiceItem[]>(initialData?.items || [
    { id: '1', description: 'Air Ticket', quantity: 1, price: 0 }
  ]);
  const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [invoiceId, setInvoiceId] = useState(initialData?.id || null);
  const [error, setError] = useState<string | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'due' | 'partial'>(initialData?.paymentStatus || 'paid');
  const [amountPaidState, setAmountPaidState] = useState<number>(initialData?.amountPaid || 0);
  const [showSeal, setShowSeal] = useState<boolean>(initialData?.showSeal ?? true);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    if (!workspaceRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const targetWidth = 794; // A4 standard width of 210mm in pixels
        const containerPadding = window.innerWidth < 640 ? 16 : 48;
        const availableWidth = width - containerPadding;
        if (availableWidth > 0) {
          setPreviewScale(Math.min(1, availableWidth / targetWidth));
        }
      }
    });
    observer.observe(workspaceRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let token = localStorage.getItem('kh_admin_token');
    if (!token) {
      token = 'session-token-' + Date.now();
      localStorage.setItem('kh_admin_token', token);
    }
  }, []);

  useEffect(() => {
    if (currentUser && !issuedBy && !initialData?.issuedBy) {
      setIssuedBy(currentUser.fullName || currentUser.username || '');
    }
  }, [currentUser]);

  useEffect(() => {
    if (initialData) return; // Don't auto-generate if editing
    const getNextInvoiceNumber = async () => {
      if (!selectedBusiness) return;
      try {
        const token = localStorage.getItem('kh_admin_token');
        const res = await fetch('/api/invoices', { 
          headers: token ? { 'x-admin-token': token } : {},
          credentials: 'include' 
        }).catch(() => null);

        let allInvoices: any[] = [];
        if (res && res.ok) {
          allInvoices = await res.json();
        } else {
          const local = localStorage.getItem('kh_dream_invoices');
          if (local) {
            try { allInvoices = JSON.parse(local); } catch (e) {}
          }
        }

        const businessInvoices = allInvoices.filter((inv: any) => inv?.invoiceNumber?.startsWith(selectedBusiness.invoicePrefix));
        if (businessInvoices.length > 0) {
          // Extract numbers and find max
          const numbers = businessInvoices.map((inv: any) => {
            const parts = String(inv.invoiceNumber).split('-');
            return parseInt(parts[parts.length - 1]) || 0;
          });
          const maxNum = Math.max(...numbers, 0);
          setInvoiceNumber(`${selectedBusiness.invoicePrefix}-${maxNum + 1}`);
        } else {
          setInvoiceNumber(`${selectedBusiness.invoicePrefix}-${selectedBusiness.nextInvoiceNumber || 1001}`);
        }
      } catch (err) {
        console.warn("Error calculating invoice number:", err);
        setInvoiceNumber(`${selectedBusiness.invoicePrefix}-${selectedBusiness.nextInvoiceNumber || 1001}`);
      }
    };
    getNextInvoiceNumber();
  }, [selectedBusinessId]);

  const componentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice_${invoiceNumber}`,
    onAfterPrint: () => console.log('Print completed'),
    onPrintError: (errorLocation, error) => {
      console.warn('Print Resource Error (handled):', errorLocation, error);
    }
  });

  const handlePrintAction = async () => {
    await saveToServer();
    handlePrint();
  };

  const handleDownloadPDF = async () => {
    if (!componentRef.current) return;
    await saveToServer();
    
    setIsSaving(true);
    try {
      const element = componentRef.current;
      
      // Render as premium pixel-perfect PNG natively via browser engine
      const imgData = await toPng(element, {
        pixelRatio: 3, // Excellent resolution for Crisp output
        backgroundColor: '#ffffff',
        style: {
          transform: 'none',
          boxShadow: 'none',
          margin: '0',
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
      pdf.save(`Invoice_${invoiceNumber}.pdf`);
    } catch (err) {
      console.error("PDF Generation Error:", err);
      alert("Failed to generate PDF. Please try Print/Save as PDF option.");
    } finally {
      setIsSaving(false);
    }
  };

  const saveToServer = async () => {
    if (isReadOnly) {
      return;
    }
    setIsSaving(true);
    const resolvedId = invoiceId || `inv-${Date.now()}`;
    const invoicePayload = {
      id: resolvedId,
      invoiceNumber,
      customerName: customerName || "Customer",
      customerPhone,
      customerAddress,
      customerEmail,
      customerTaxId,
      issuedBy,
      items,
      date,
      total: total,
      subtotal: subtotal,
      tax: tax,
      taxRate,
      taxType,
      paymentStatus,
      amountPaid: paymentStatus === 'partial' ? amountPaidState : (paymentStatus === 'paid' ? total : 0),
      showSeal,
      businessId: selectedBusinessId,
      businessName: selectedBusiness?.name,
      businessArabicName: selectedBusiness?.arabicName,
      businessAddress: selectedBusiness?.address,
      businessVatId: selectedBusiness?.vatId,
      businessLogoUrl: selectedBusiness?.logoUrl
    };

    try {
      const token = localStorage.getItem('kh_admin_token') || 'session-token-' + Date.now();
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify(invoicePayload),
        credentials: 'include'
      }).catch(() => null);

      let savedInvoice = invoicePayload;
      if (response && response.ok) {
        try {
          const resData = await response.json();
          if (resData && resData.id) {
            savedInvoice = resData;
          }
        } catch (e) {}
      }

      setInvoiceId(savedInvoice.id || resolvedId);
      setSaveSuccess(true);
      
      // Always persist to local cache for instant offline retrieval
      try {
        const local = localStorage.getItem('kh_dream_invoices');
        const list = local ? JSON.parse(local) : [];
        const idx = list.findIndex((i: any) => String(i.id) === String(savedInvoice.id || resolvedId));
        if (idx !== -1) list[idx] = savedInvoice;
        else list.unshift(savedInvoice);
        localStorage.setItem('kh_dream_invoices', JSON.stringify(list));
      } catch (e) {}

      // Only increment serial if it's a new invoice
      if (!initialData) {
        const nb = [...data.businessProfiles];
        const bIdx = nb.findIndex(b => b.id === selectedBusinessId);
        if (bIdx !== -1) {
          nb[bIdx].nextInvoiceNumber += 1;
          updateData({ businessProfiles: nb });
        }
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.warn("Saved invoice locally:", error);
      setInvoiceId(resolvedId);
      setSaveSuccess(true);
      try {
        const local = localStorage.getItem('kh_dream_invoices');
        const list = local ? JSON.parse(local) : [];
        const idx = list.findIndex((i: any) => String(i.id) === String(resolvedId));
        if (idx !== -1) list[idx] = invoicePayload;
        else list.unshift(invoicePayload);
        localStorage.setItem('kh_dream_invoices', JSON.stringify(list));
      } catch (e) {}
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const [taxEnabled, setTaxEnabled] = useState(initialData?.taxEnabled ?? false);
  const [taxRate, setTaxRate] = useState<10 | 15>(initialData?.taxRate || 15);
  const [taxType, setTaxType] = useState<'inclusive' | 'exclusive'>(initialData?.taxType || 'inclusive');

  const calculateTotals = () => {
    let subtotal = 0;
    items.forEach(item => {
      const price = item.price || 0;
      const qty = item.quantity || 0;
      subtotal += price * qty;
    });

    let tax = 0;
    let total = subtotal;

    if (taxEnabled) {
      if (taxType === 'inclusive') {
        const base = subtotal / (1 + taxRate / 100);
        tax = subtotal - base;
        return { subtotal: base, tax, total: subtotal };
      } else {
        tax = subtotal * (taxRate / 100);
        total = subtotal + tax;
        return { subtotal, tax, total };
      }
    }

    return { subtotal, tax: 0, total: subtotal };
  };

  const { subtotal, tax, total } = calculateTotals();

  const numberToWords = (num: number) => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const inWords = (n: any): string => {
      if ((n = n.toString()).length > 9) return 'overflow';
      const n_arr = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n_arr) return '';
      let str = '';
      str += (Number(n_arr[1]) !== 0) ? (a[Number(n_arr[1])] || b[n_arr[1][0]] + ' ' + a[n_arr[1][1]]) + 'crore ' : '';
      str += (Number(n_arr[2]) !== 0) ? (a[Number(n_arr[2])] || b[n_arr[2][0]] + ' ' + a[n_arr[2][1]]) + 'lakh ' : '';
      str += (Number(n_arr[3]) !== 0) ? (a[Number(n_arr[3])] || b[n_arr[3][0]] + ' ' + a[n_arr[3][1]]) + 'thousand ' : '';
      str += (Number(n_arr[4]) !== 0) ? (a[Number(n_arr[4])] || b[n_arr[4][0]] + ' ' + a[n_arr[4][1]]) + 'hundred ' : '';
      str += (Number(n_arr[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n_arr[5])] || b[n_arr[5][0]] + ' ' + a[n_arr[5][1]]) : '';
      return str;
    };
    return inWords(Math.floor(num)).toUpperCase() + ' SAUDI RIYALS ONLY';
  };

  const numberToWordsArabic = (num: number) => {
    return "فقط " + Math.floor(num) + " ريال سعودي لا غير";
  };

  // Validation URL for QR Code - points to the frontend with a query param
  const validationUrl = `${window.location.origin}?inv=${invoiceNumber}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1550px] mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-lg flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <ShieldCheck size={20} />
            <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
          </div>
        )}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-500 hover:text-red-600 transition-colors uppercase text-[10px] font-black tracking-widest"
          >
            <ArrowLeft size={16} />
            <span>Return to Terminal</span>
          </button>
          <div className="flex items-center space-x-4">
            {!isReadOnly && (
              <button 
                onClick={saveToServer}
                disabled={isSaving}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all 
                  ${saveSuccess ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-black'}`}
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : saveSuccess ? <CheckCircle2 size={16} /> : <Download size={16} />}
                <span>{saveSuccess ? 'Synchronized' : 'Save to Server'}</span>
              </button>
            )}
            <button 
              onClick={handleDownloadPDF}
              disabled={isSaving}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <FileDown size={16} />}
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Panel */}
          <div className="lg:col-span-1 space-y-5">
            {isReadOnly && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} /> Read-only mode
                </p>
                <p className="text-[9px] font-medium leading-relaxed font-semibold">
                  Staff users are permitted to view and download existing invoices, but editing requires Administrator authorization. To issue a new invoice, return to the terminal and create a new record.
                </p>
              </div>
            )}
            <div className={isReadOnly ? 'pointer-events-none select-none opacity-70 space-y-5' : 'space-y-5'}>
              {/* Header Mini Status */}
            <div className="bg-slate-900 dark:bg-zinc-90 w-full text-white rounded-lg p-5 border border-slate-800">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-8 w-8 bg-red-600 rounded flex items-center justify-center font-bold text-xs tracking-tight">
                  KH
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-200">TRAVEL RECORDS / دفتري</h4>
                  <p className="text-[8px] text-slate-400 font-mono">ID: #{invoiceNumber.split('-')[0] || 'KHD'}</p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-slate-800 flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Gross Total:</span>
                <span className="text-red-400 font-black">{total.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR</span>
              </div>
            </div>

            {/* Section 1: Business Profile */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-5 border border-slate-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <Building2 size={14} className="text-slate-500" />
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  Business Entity / الجهة المصدرة
                </h3>
              </div>
              
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Company / الاسم</label>
                  <div className="relative">
                    <select 
                      value={selectedBusinessId}
                      onChange={(e) => setSelectedBusinessId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-850 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded px-3 py-2 text-xs font-bold uppercase appearance-none focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
                    >
                      {data.businessProfiles.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {selectedBusiness && (
                  <div className="p-2.5 bg-slate-50 dark:bg-zinc-850/60 rounded border border-slate-150 dark:border-zinc-800 text-[10px] space-y-0.5 text-slate-500 dark:text-zinc-400">
                    <p className="font-bold text-slate-700 dark:text-zinc-350">🏢 {selectedBusiness.arabicName}</p>
                    <p className="text-[9px] font-mono">VAT: {selectedBusiness.vatId || '3000XXXXXXXXXX'}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Invoice ID / السيريال</label>
                    <input 
                      type="text" 
                      value={invoiceNumber} 
                      onChange={e => setInvoiceNumber(e.target.value)}
                      placeholder="ID"
                      className="w-full bg-slate-50 dark:bg-zinc-850 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded px-3 py-2 text-xs font-mono font-bold select-all outline-none focus:ring-1 focus:ring-slate-400" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Issue Date / التاريخ</label>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={e => setDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-850 dark:text-zinc-200 border border-slate-200 dark:border-zinc-805 rounded px-3 py-2 text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-slate-400" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Recipient Info */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-5 border border-slate-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <User size={14} className="text-slate-500" />
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  Recipient Credentials / العميل الكريم
                </h3>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Client Name / اسم العميل</label>
                  <input 
                    type="text" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Al-Dossari Corp / محمد الدوسري"
                    className="w-full bg-slate-50 dark:bg-zinc-850 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mobile / الهاتف</label>
                    <input 
                      type="text" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="05XXXXXXXX"
                      className="w-full bg-slate-50 dark:bg-zinc-850 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded px-3 py-2 text-xs font-bold font-mono outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Passport / ID / الهوية</label>
                    <input 
                      type="text" 
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Doc No."
                      className="w-full bg-slate-50 dark:bg-zinc-850 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded px-3 py-2 text-xs font-bold font-mono outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Address / العنوان والإقامة</label>
                  <input 
                    type="text" 
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="e.g. Riyadh, Olaya District"
                    className="w-full bg-slate-50 dark:bg-zinc-850 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                {taxEnabled && (
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Client VAT ID / الرقم الضريبي للعميل</label>
                    <input 
                      type="text" 
                      value={customerTaxId}
                      onChange={(e) => setCustomerTaxId(e.target.value)}
                      placeholder="Client VAT ID if registered"
                      className="w-full bg-slate-50 dark:bg-zinc-850 dark:text-zinc-205 border border-slate-200 dark:border-zinc-800 rounded px-3 py-2 text-xs font-bold font-mono outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Tax & Stamp Setup */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-5 border border-slate-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <Receipt size={14} className="text-slate-500" />
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  Tax & Status Configuration / تهيئات
                </h3>
              </div>

              <div className="space-y-3.5">
                {/* Clean Flat Toggle for VAT */}
                <div className="flex justify-between items-center py-1">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Apply VAT / تطبيق الضريبة</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={taxEnabled} 
                      onChange={(e) => setTaxEnabled(e.target.checked)} 
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-650 peer-checked:bg-red-650"></div>
                  </label>
                </div>

                {taxEnabled && (
                  <div className="p-3 bg-slate-50 dark:bg-zinc-850 rounded border border-slate-150 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rate Percentage</span>
                      <div className="flex gap-1 bg-slate-200 dark:bg-zinc-900 p-0.5 rounded w-24">
                        {[15, 10].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setTaxRate(val as any)}
                            className={`flex-1 py-1 rounded text-[9px] font-black transition-all ${
                              taxRate === val 
                                ? 'bg-slate-900 text-white dark:bg-zinc-800' 
                                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                            }`}
                          >
                            {val}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Calculation Scheme</span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'inclusive', label: 'Inc / شامل' },
                          { id: 'exclusive', label: 'Exc / مضاف' }
                        ].map(tType => (
                          <button
                            key={tType.id}
                            type="button"
                            onClick={() => setTaxType(tType.id as any)}
                            className={`py-1.5 px-1 rounded text-[9px] font-black uppercase border transition-all ${
                              taxType === tType.id
                                ? 'bg-slate-900 border-slate-900 text-white dark:bg-zinc-800'
                                : 'bg-transparent border-slate-200 text-slate-400 hover:text-slate-600 dark:border-zinc-850'
                            }`}
                          >
                            {tType.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Stamp Switch */}
                <div className="flex justify-between items-center py-1">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Authorized Stamp / الختم</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={showSeal} 
                      onChange={(e) => setShowSeal(e.target.checked)} 
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-650 peer-checked:bg-red-650"></div>
                  </label>
                </div>

                {/* Segmented Payment Status */}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Payment Status / حالة السداد</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-zinc-850 p-1 rounded-lg">
                    {[
                      { value: 'paid', label: 'Paid / نقد' },
                      { value: 'due', label: 'Due / أجل' },
                      { value: 'partial', label: 'Partial' }
                    ].map(st => (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => setPaymentStatus(st.value as any)}
                        className={`py-1.5 text-[8.5px] font-bold uppercase rounded transition-all ${
                          paymentStatus === st.value 
                            ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm border border-slate-250/20' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Paid for Partial */}
                {paymentStatus === 'partial' && (
                  <div className="p-3 bg-slate-50 dark:bg-zinc-850 rounded border border-slate-200 dark:border-zinc-800 space-y-1">
                    <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-500">Amount Paid Co-Pay (SAR)</label>
                    <input 
                      type="number"
                      value={amountPaidState === 0 ? "" : amountPaidState}
                      onChange={(e) => setAmountPaidState(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 1500"
                      className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-750 rounded px-2.5 py-1.5 text-xs font-bold font-mono outline-none"
                    />
                    <div className="flex justify-between text-[8px] text-slate-400 font-mono pt-1">
                      <span>Total: {total.toFixed(2)} SAR</span>
                      <span>Balance: {(total - amountPaidState).toFixed(2)} SAR</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Coordinator / الموظف المصدر</label>
                  <input 
                    type="text" 
                    value={issuedBy}
                    onChange={(e) => setIssuedBy(e.target.value)}
                    placeholder="Wali/Coordinator Name"
                    className="w-full bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 rounded px-3 py-2 text-xs font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Line Items Workspace */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-5 border border-slate-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Coins size={14} className="text-slate-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    Line Items / العمليات والرحلات
                  </h3>
                </div>
                <button 
                  onClick={addItem}
                  className="flex items-center gap-1 py-1 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-300 rounded text-[9px] font-black uppercase tracking-wider cursor-pointer font-sans"
                >
                  <Plus size={10} />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
                {items.map((item, index) => (
                  <div key={item.id} className="p-3 bg-slate-50/50 dark:bg-zinc-850/40 rounded border border-slate-150 dark:border-zinc-800 space-y-2 relative group">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1">Description / البيان {index + 1}</label>
                        <input 
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="e.g. Roundtrip Ticket Jeddah"
                          className="w-full bg-transparent border-0 p-0 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:ring-0 outline-none placeholder-slate-400"
                        />
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)} 
                        className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1.5 border-t border-slate-100 dark:border-zinc-800">
                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1">Qty / عدد</label>
                        <input 
                          type="number"
                          value={item.quantity}
                          onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-750 rounded px-2 py-1 text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1">Price / السعر</label>
                        <input 
                          type="number"
                          value={item.price}
                          onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                          onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-750 rounded px-2 py-1 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Items Summary Footer */}
              <div className="pt-2 text-[9px] font-bold text-slate-400 font-mono flex justify-between">
                <span>Total Lines: {items.length}</span>
                <span>Active Gross: {(items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)).toLocaleString()} SAR</span>
              </div>
            </div>
          </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 overflow-hidden">
              {/* Draft/Canvas Control Bar */}
              <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-zinc-850">
                <div className="flex items-center space-x-3">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">A4 High-Fidelity Canvas</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex items-center space-x-2 bg-zinc-905 px-3 py-1 rounded-full border border-zinc-800 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>A4 Scale: 100% (210mm x 297mm)</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-650" />
                  </div>
                </div>
              </div>
              
              <div ref={workspaceRef} className="p-4 sm:p-10 overflow-x-auto flex justify-center bg-slate-100/75 dark:bg-zinc-950 rounded-b-xl min-h-[750px] relative invoice-canvas-workspace">
                <style>{`
                  .invoice-canvas-workspace {
                    background-color: #f1f5f9;
                    background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px);
                    background-size: 20px 20px;
                  }
                  .dark .invoice-canvas-workspace {
                    background-color: #0c0c0e;
                    background-image: radial-gradient(#27272a 1.2px, transparent 1.2px);
                    background-size: 20px 20px;
                  }
                  .invoice-system-container {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    background: white;
                    position: relative;
                    transform-origin: top center;
                    display: flex;
                    flex-direction: column;
                  }
                  .invoice-content {
                    flex-grow: 1;
                  }
                  @media print {
                    @page {
                      size: A4;
                      margin: 0;
                    }
                    body {
                      margin: 0;
                      -webkit-print-color-adjust: exact;
                    }
                    .invoice-system-container {
                      width: 210mm !important;
                      height: 297mm !important;
                      margin: 0 !important;
                      padding: 16mm !important;
                      box-shadow: none !important;
                      border: none !important;
                      transform: none !important;
                    }
                    .preview-scale-container {
                      transform: none !important;
                      width: auto !important;
                    }
                  }
                  /* Responsive Preview Scaling Wrapper */
                  .preview-wrapper {
                    width: 100%;
                    overflow: hidden;
                    display: flex;
                    justify-content: center;
                    padding: 0.5rem;
                    background: transparent;
                  }
                  .preview-scale-container {
                    width: 210mm;
                    flex-shrink: 0;
                    transform-origin: top center;
                  }
                `}</style>
 
                <div 
                  className="preview-wrapper no-scrollbar" 
                  style={{ minHeight: `${1122 * previewScale + 48}px` }}
                >
                  <div 
                    className="preview-scale-container"
                    style={{
                      transform: `scale(${previewScale})`,
                      marginBottom: `${1122 * (previewScale - 1) + 24}px`
                    }}
                  >
                    <div ref={componentRef} className="bg-white text-slate-900 px-12 py-10 invoice-system-container border border-slate-200">
                      <div className="invoice-content">
                        
                        {/* Invoice Header */}
                        <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-200">
                          <div className="space-y-4">
                            {selectedBusiness?.logoUrl || data.general.logoUrl ? (
                              <img 
                                src={selectedBusiness?.logoUrl || data.general.logoUrl || ""} 
                                alt="Company Logo" 
                                referrerPolicy="no-referrer" 
                                className="h-16 mb-2 object-contain filter drop-shadow-sm" 
                              />
                            ) : (
                              <div className="h-16 w-16 bg-slate-900 text-white rounded flex items-center justify-center font-bold text-lg mb-2">
                                KH
                              </div>
                            )}
                            <div className="space-y-1">
                              <h2 className={`font-bold text-slate-800 leading-tight tracking-wide font-sans whitespace-nowrap overflow-visible ${
                                (selectedBusiness?.arabicName || "").length > 30 
                                  ? "text-sm md:text-base" 
                                  : "text-base md:text-lg"
                              }`}>{selectedBusiness?.arabicName}</h2>
                              <h1 className={`font-black uppercase tracking-tight text-slate-900 leading-tight whitespace-nowrap overflow-visible ${
                                (selectedBusiness?.name || "").length > 30 
                                  ? "text-xs md:text-sm" 
                                  : (selectedBusiness?.name || "").length > 20 
                                  ? "text-sm md:text-base" 
                                  : "text-base md:text-lg"
                              }`}>{selectedBusiness?.name}</h1>
                              <p className="text-[10px] text-slate-500 max-w-[320px] leading-relaxed mt-2 whitespace-pre-line font-mono">
                                {selectedBusiness?.address}
                                {taxEnabled && <><br /><span className="font-bold text-slate-700">VAT ID / الرقم الضريبي: {selectedBusiness?.vatId}</span></>}
                              </p>
                            </div>
                          </div>
 
                          <div className="text-right flex flex-col items-end">
                            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 mb-4">
                              <QRCodeSVG value={validationUrl} size={65} level="H" />
                            </div>
                            <div className="space-y-2">
                              <div className="text-slate-900 border-b border-slate-900 pb-1 flex items-center justify-end font-bold uppercase tracking-wider text-[11px] gap-1.5">
                                {taxEnabled ? (
                                  <span className="flex items-center gap-1.5">
                                    <span>Tax Invoice</span>
                                    <span className="text-slate-300 font-normal">/</span>
                                    <span className="text-slate-600 font-bold" dir="rtl">فاتورة ضريبية</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5">
                                    <span>Invoice</span>
                                    <span className="text-slate-300 font-normal">/</span>
                                    <span className="text-slate-600 font-bold" dir="rtl">فاتورة</span>
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-end pt-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none flex items-center gap-1">
                                  <span>Invoice No.</span>
                                  <span className="text-slate-300 font-normal">/</span>
                                  <span dir="rtl" className="text-slate-500 font-bold">رقم الفاتورة</span>
                                </span>
                                <p className="text-sm font-bold text-slate-900 font-mono mt-1">{invoiceNumber}</p>
                              </div>
  
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none flex items-center gap-1">
                                  <span>Date</span>
                                  <span className="text-slate-300 font-normal">/</span>
                                  <span dir="rtl" className="text-slate-500 font-bold">التاريخ</span>
                                </span>
                                <p className="text-xs font-bold text-slate-800 font-mono mt-1">{date}</p>
                              </div>
  
                              <div className="flex flex-col items-end pt-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1 flex items-center gap-1">
                                  <span>Status</span>
                                  <span className="text-slate-300 font-normal">/</span>
                                  <span dir="rtl" className="text-slate-500 font-bold">الحالة</span>
                                </span>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                  paymentStatus === 'paid' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                                    : paymentStatus === 'partial'
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                                    : 'bg-rose-50 text-rose-700 border-rose-200/80'
                                }`}>
                                  {paymentStatus === 'paid' ? 'Paid / مدفوع' : paymentStatus === 'partial' ? 'Partial / جزئي' : 'Due / مستحق'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
  
                        {/* Address Columns Layout */}
                        <div className="grid grid-cols-2 gap-12 mb-8 pt-2">
                          {/* Sender Info */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <span>From</span>
                              <span className="text-slate-300 font-normal">/</span>
                              <span dir="rtl" className="text-slate-500 font-bold">الجهة المصدّرة</span>
                            </span>
                            <h4 className="text-xs font-bold text-slate-900">{selectedBusiness?.name || 'KH Dream Services'}</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                              {selectedBusiness?.address || 'Saudi Arabia'}
                            </p>
                            <div className="text-[9.5px] text-slate-400 font-mono space-y-0.5 pt-1">
                              {selectedBusiness?.phone && <p>Tel: <span className="text-slate-700 font-bold">{selectedBusiness.phone}</span></p>}
                              {selectedBusiness?.email && <p>Email: <span className="text-slate-700 font-bold">{selectedBusiness.email}</span></p>}
                              {taxEnabled && <p>VAT ID: <span className="text-slate-700 font-bold">{selectedBusiness?.vatId || '-'}</span></p>}
                            </div>
                          </div>
  
                          {/* Customer Info */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <span>To</span>
                              <span className="text-slate-300 font-normal">/</span>
                              <span dir="rtl" className="text-slate-500 font-bold">العميل المستلم</span>
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                              <span>{customerName || 'Valued Client'}</span>
                              <span className="text-slate-300 font-light">|</span>
                              <span dir="rtl" className="font-medium text-slate-500 text-[10.5px]">عميل كريم</span>
                            </h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                              {customerAddress || 'Kingdom of Saudi Arabia'}
                            </p>
                            <div className="text-[9.5px] text-slate-400 font-mono space-y-0.5 pt-1">
                              {customerPhone && <p>Phone: <span className="text-slate-700 font-bold">{customerPhone}</span></p>}
                              {customerEmail && <p>ID/Email: <span className="text-slate-700 font-bold">{customerEmail}</span></p>}
                              {taxEnabled && customerTaxId && <p>VAT: <span className="text-slate-700 font-bold">{customerTaxId}</span></p>}
                            </div>
                          </div>
                        </div>
  
                        {/* Modern Redesigned Items Grid (Standard Typographic Table) */}
                        <div className="mb-8">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-t border-b-2 border-slate-900 text-slate-900">
                                <th className="text-left py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider">
                                  <span className="flex items-center gap-1.5">
                                    <span>Description</span>
                                    <span className="text-slate-300 font-normal">/</span>
                                    <span dir="rtl" className="text-slate-500 font-bold animate-fadeIn">الوصف والبيان</span>
                                  </span>
                                </th>
                                <th className="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider w-24">
                                  <span className="flex items-center justify-center gap-1.5">
                                    <span>Qty</span>
                                    <span className="text-slate-300 font-normal">/</span>
                                    <span dir="rtl" className="text-slate-500 font-bold animate-fadeIn">الكمية</span>
                                  </span>
                                </th>
                                <th className="text-right py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider w-32">
                                  <span className="flex items-center justify-end gap-1.5">
                                    <span>Price</span>
                                    <span className="text-slate-300 font-normal">/</span>
                                    <span dir="rtl" className="text-slate-500 font-bold animate-fadeIn">الوحدة</span>
                                  </span>
                                </th>
                                <th className="text-right py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider w-32">
                                  <span className="flex items-center justify-end gap-1.5">
                                    <span>Total</span>
                                    <span className="text-slate-300 font-normal">/</span>
                                    <span dir="rtl" className="text-slate-500 font-bold animate-fadeIn">الإجمالي</span>
                                  </span>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item) => (
                                <tr key={item.id} className="border-b border-slate-200">
                                  <td className="py-3 px-2 text-xs text-slate-800">{item.description || 'Service Item'}</td>
                                  <td className="py-3 px-2 text-center text-xs text-slate-600 font-mono">{item.quantity}</td>
                                  <td className="py-3 px-2 text-right text-xs text-slate-600 font-mono">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR</td>
                                  <td className="py-3 px-2 text-right text-xs font-bold text-slate-900 font-mono">{(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR</td>
                                </tr>
                              ))}
                              {items.length < 3 && Array.from({ length: 3 - items.length }).map((_, i) => (
                                <tr key={`empty-${i}`} className="border-b border-slate-100 h-8">
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
  
                        {/* Grand Totals Block with Clean Typographic Alignment */}
                        <div className="flex justify-end items-start mb-8 pt-2">
                          <div className="w-72 space-y-2 text-right text-xs">
                            <div className="flex justify-between items-center text-slate-500 uppercase text-[10px]">
                              <span className="flex items-center gap-1.5">
                                <span>Subtotal</span>
                                <span className="text-slate-300 font-normal">/</span>
                                <span dir="rtl" className="text-slate-400 font-medium">المجموع الفرعي</span>
                              </span>
                              <span className="font-mono text-slate-800 font-bold">{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</span>
                            </div>
                            
                            {taxEnabled && (
                              <div className="flex justify-between items-center text-slate-500 uppercase text-[10px]">
                                <span className="flex items-center gap-1.5">
                                  <span>VAT ({taxRate}%) [{taxType}]</span>
                                  <span className="text-slate-300 font-normal">/</span>
                                  <span dir="rtl" className="text-slate-400 font-medium">الضريبة</span>
                                </span>
                                <span className="font-mono text-slate-800 font-bold">{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</span>
                              </div>
                            )}
  
                            <div className="pt-2 border-t border-slate-900 flex justify-between items-center">
                              <span className="text-[11px] font-bold uppercase text-slate-900 flex items-center gap-1.5">
                                <span>Net Amount</span>
                                <span className="text-slate-300 font-normal">/</span>
                                <span dir="rtl" className="text-slate-500 font-bold">الصافي</span>
                              </span>
                              <span className="text-sm font-black text-slate-900 font-mono">
                                {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR
                              </span>
                            </div>
  
                            {paymentStatus === 'partial' && (
                              <div className="space-y-1 pt-1.5 border-t border-dashed border-slate-200 text-[10px] text-slate-500">
                                <div className="flex justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <span>Paid</span>
                                    <span className="text-slate-300 font-normal">/</span>
                                    <span dir="rtl" className="text-slate-400 font-medium">المدفوع</span>
                                  </span>
                                  <span className="font-mono">{amountPaidState.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-900">
                                  <span className="flex items-center gap-1.5">
                                    <span>Due</span>
                                    <span className="text-slate-300 font-normal">/</span>
                                    <span dir="rtl" className="text-slate-400 font-medium">المتبقي</span>
                                  </span>
                                  <span className="font-mono">{(total - amountPaidState).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
 
                        {/* Simple Flat Words Row */}
                        <div className="border-t border-b border-slate-100 py-3 flex justify-between text-[10px] mb-8 bg-slate-50/50 px-4">
                          <div className="w-1/2">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Amount in Words</span>
                            <span className="font-bold text-slate-700 font-mono uppercase italic text-[9.5px]">{numberToWords(total)}</span>
                          </div>
                          <div className="w-1/2 text-right">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">المبلغ تفقيطاً</span>
                            <span className="font-bold text-slate-700 text-[9.5px]" dir="rtl">{numberToWordsArabic(total)}</span>
                          </div>
                        </div>
 
                      </div>
 
                      {/* Footer Signature and Seal block */}
                      <div className="pt-8 border-t border-slate-200 flex justify-between items-end mt-auto">
                        <div className="max-w-xs space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-800">KH Dream Travels & Tourism Services</p>
                          <p className="text-[8.5px] text-slate-400 leading-relaxed font-normal">
                            This document is generated dynamically by verified travel coordinators. Unauthorized modifications are prohibited under Saudi E-billing regulations.
                          </p>
                        </div>
                        
                        <div className="text-right flex flex-col items-center">
                          <div className="relative w-20 h-20 flex items-center justify-center">
                            {showSeal && selectedBusiness?.stampUrl ? (
                              <img 
                                src={selectedBusiness.stampUrl} 
                                alt="Official Seal" 
                                referrerPolicy="no-referrer"
                                className="absolute z-10 w-full h-full object-contain opacity-80 mix-blend-multiply transition-opacity duration-300 pointer-events-none"
                              />
                            ) : (
                              <span className="absolute text-[8px] text-slate-300 font-mono italic uppercase">No Seal</span>
                            )}
                            <p className="relative z-0 text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1 mt-auto">Authorized Signature</p>
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-tight mt-1 text-slate-900 border-t border-slate-100 pt-1 w-32 text-center">
                            {issuedBy || selectedBusiness?.name || 'KH Dream Coordinator'}
                          </p>
                        </div>
                      </div>
 
                    </div>
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

export default InvoiceSystem;
