import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Loader2, AlertCircle, Download, Printer, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { useReactToPrint } from 'react-to-print';

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail: string;
  customerTaxId?: string;
  issuedBy?: string;
  items: any[];
  date: string;
  total: number;
  subtotal: number;
  tax: number;
  taxRate?: number;
  taxType?: 'inclusive' | 'exclusive';
  paymentStatus?: 'paid' | 'due' | 'partial';
  amountPaid?: number;
  businessName?: string;
  businessArabicName?: string;
  businessAddress?: string;
  businessVatId?: string;
  businessLogoUrl?: string;
  isSadad?: boolean;
}

const PublicInvoiceView: React.FC<{ invoiceId: string }> = ({ invoiceId }) => {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: invoice ? `${invoice.isSadad ? 'Receipt' : 'Invoice'}_${invoice.invoiceNumber}` : 'Invoice',
    onAfterPrint: () => console.log('Print completed'),
    onPrintError: (errorLocation, error) => {
      console.warn('Print Resource Error (handled):', errorLocation, error);
    }
  });

  const handleDownloadPDF = async () => {
    if (!componentRef.current || !invoice) return;
    setIsDownloading(true);
    try {
      const element = componentRef.current;
      
      const imgData = await toPng(element, {
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        style: {
          transform: 'none',
          boxShadow: 'none',
          margin: '0',
          ...(invoice.isSadad ? {
            width: '80mm',
            padding: '10mm',
          } : {})
        }
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: invoice.isSadad ? [80, 150] : 'a4',
        compress: true
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`${invoice.isSadad ? 'Receipt' : 'Invoice'}_${invoice.invoiceNumber}.pdf`);
    } catch (err) {
      console.error("PDF Generation Error:", err);
      alert("Failed to generate PDF. Please try the Print option.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/${invoiceId}`);
        if (!response.ok) throw new Error('Invoice not found');
        const data = await response.json();
        setInvoice(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId]);

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

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
      <p className="text-sm font-black uppercase tracking-widest text-slate-400">Validating Document...</p>
    </div>
  );

  if (error || !invoice) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <AlertCircle className="text-red-500 mb-4" size={64} />
      <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Validation Failed</h2>
      <p className="text-slate-500 text-center max-w-md">The requested document could not be verified. It may have been revoked or the link is invalid.</p>
    </div>
  );

  if (invoice.isSadad) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center">
        <div className="max-w-4xl w-full mb-6 flex justify-center space-x-4">
          <button onClick={handleDownloadPDF} disabled={isDownloading} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            {isDownloading ? <Loader2 className="animate-spin" size={16} /> : <FileDown size={16} />}
            <span>Download</span>
          </button>
          <button onClick={() => handlePrint()} className="bg-red-600 text-white px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Printer size={16} />
            <span>Print</span>
          </button>
        </div>

        <div ref={componentRef} className="public-invoice-container bg-white text-black p-8 shadow-2xl w-[80mm] min-h-[120mm] font-mono text-[10px] border border-slate-100">
          <div className="text-center border-b border-black pb-4 mb-4">
            <h2 className="font-black text-xs uppercase">PAYMENT RECEIPT</h2>
            <p className="text-[8px]">{invoice.businessAddress}</p>
            <p className="text-[8px] font-bold mt-1">MINI INVOICE</p>
          </div>

          <div className="space-y-1 mb-4">
            <div className="flex justify-between"><span>NO:</span> <span className="font-bold">{invoice.invoiceNumber}</span></div>
            <div className="flex justify-between"><span>DATE:</span> <span>{invoice.date}</span></div>
            <div className="flex justify-between"><span>CUST:</span> <span className="font-bold">{invoice.customerName || 'VALUED CLIENT'}</span></div>
            {invoice.customerPhone && <div className="flex justify-between"><span>PH:</span> <span>{invoice.customerPhone}</span></div>}
          </div>

          <div className="border-b border-black mb-2 pb-1 flex justify-between font-black">
            <span>DESCRIPTION</span>
            <span>AMOUNT</span>
          </div>
          <div className="space-y-1 mb-4 min-h-[40px]">
            {invoice.items.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="uppercase">{item.description || 'SERVICE'}</span>
                <span>{item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-black pt-2 space-y-1">
            <div className="flex justify-between"><span>SUBTOTAL:</span> <span>{invoice.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>SERVICE FEE (2.5%):</span> <span>{invoice.tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-black text-xs border-t border-black pt-1 mt-1">
              <span>TOTAL:</span>
              <span>{invoice.total.toFixed(2)} SAR</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center space-y-4">
            <QRCodeSVG value={window.location.href} size={60} />
            <p className="text-[7px] text-center uppercase">Thank you for your payment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mb-6 flex justify-end space-x-4">
        <button 
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20"
        >
          {isDownloading ? <Loader2 className="animate-spin" size={16} /> : <FileDown size={16} />}
          <span>Download PDF</span>
        </button>
        <button 
          onClick={() => handlePrint()}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20"
        >
          <Printer size={16} />
          <span>Print Document</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xl">
        <div className="bg-emerald-600 p-4 flex items-center justify-center space-x-3">
          <ShieldCheck className="text-white" size={20} />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Official Verified Document</span>
        </div>

        <div className="p-8 sm:p-16">
          <style>{`
            .public-invoice-container {
              font-family: 'Arial', 'Helvetica', sans-serif;
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
              .public-invoice-container {
                width: 210mm !important;
                height: 297mm !important;
                margin: 0 !important;
                padding: 20mm !important;
                box-shadow: none !important;
                transform: none !important;
                background: white !important;
              }
            }
          `}</style>
          <div ref={componentRef} className="public-invoice-container bg-white">
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-4">
                <img src={invoice.businessLogoUrl || 'https://i.ibb.co/pjjqSnRF/Logo-23D.png'} alt="Logo" referrerPolicy="no-referrer" className="h-20 mb-6 object-contain" />
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-800 leading-tight tracking-normal">{invoice.businessArabicName}</h2>
                  <h1 className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-tight">{invoice.businessName}</h1>
                  <p className="text-[9px] text-slate-500 max-w-[300px] leading-relaxed mt-2 whitespace-pre-line">
                    {invoice.businessAddress}
                    {invoice.tax > 0 && <><br /><span className="font-bold text-slate-700">VAT ID: {invoice.businessVatId}</span></>}
                  </p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="mb-2">
                  <QRCodeSVG value={window.location.href} size={100} level="H" />
                </div>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tight mb-4 max-w-[100px] leading-tight">
                  This code is for validating the invoice with our Server
                </p>
                <div className="space-y-1">
                  <p className="text-[14px] font-black uppercase tracking-[0.2em] text-red-600 mb-1">
                    {invoice.tax > 0 ? (
                      <>Tax Invoice / <span className="tracking-normal" dir="rtl">فاتورة ضريبية</span></>
                    ) : (
                      <>Invoice / <span className="tracking-normal" dir="rtl">فاتورة</span></>
                    )}
                  </p>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No. / رقم</span>
                    <p className="text-base font-black text-slate-900 leading-none">{invoice.invoiceNumber}</p>
                  </div>
                  <div className="flex flex-col items-end mt-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Date / التاريخ</span>
                    <p className="text-xs font-bold text-slate-900">{invoice.date}</p>
                  </div>
                  <div className="flex flex-col items-end mt-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status / الحالة</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded leading-none ${
                      invoice.paymentStatus === 'paid' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : invoice.paymentStatus === 'partial'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {invoice.paymentStatus === 'paid' ? 'Paid / مدفوع' : invoice.paymentStatus === 'partial' ? 'Partial / جزئي' : 'Due / مستحق'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-red-600 mb-3">From</h4>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-tight">{invoice.businessName || 'KH Dream Services'}</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed whitespace-pre-line">
                    {invoice.businessAddress || 'Kingdom of Saudi Arabia\nRiyadh, Al Olaya District\nKing Fahd Road'}
                  </p>
                  {invoice.tax > 0 && <p className="text-[10px] font-bold text-slate-700">VAT ID: {invoice.businessVatId || '300000000000003'}</p>}
                </div>
              </div>
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-red-600 mb-3">To</h4>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-tight">
                    {invoice.customerName}
                    {invoice.tax > 0 && invoice.customerTaxId && <span className="ml-2 text-[9px] font-bold text-slate-500">(VAT: {invoice.customerTaxId})</span>}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {invoice.customerEmail}<br />
                    Saudi Arabia
                  </p>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="mb-12 border border-slate-200 rounded-sm overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-[9px] font-black uppercase tracking-widest text-slate-600 border-r border-slate-200">
                      Description / <span className="tracking-normal font-bold" dir="rtl">الوصف</span>
                    </th>
                    <th className="text-center py-3 px-4 text-[9px] font-black uppercase tracking-widest text-slate-600 border-r border-slate-200 w-20">
                      Qty / <span className="tracking-normal font-bold" dir="rtl">الكمية</span>
                    </th>
                    <th className="text-right py-3 px-4 text-[9px] font-black uppercase tracking-widest text-slate-600 border-r border-slate-200 w-32">
                      Price / <span className="tracking-normal font-bold" dir="rtl">السعر</span>
                    </th>
                    <th className="text-right py-3 px-4 text-[9px] font-black uppercase tracking-widest text-slate-600 w-32">
                      Total / <span className="tracking-normal font-bold" dir="rtl">الإجمالي</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 px-4 text-[11px] font-bold text-slate-800 border-r border-slate-200">{item.description}</td>
                      <td className="py-3 px-4 text-center text-[11px] font-medium text-slate-700 border-r border-slate-200">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-[11px] font-medium text-slate-700 border-r border-slate-200">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR</td>
                      <td className="py-3 px-4 text-right text-[11px] font-black text-slate-900">{(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR</td>
                    </tr>
                  ))}
                  {invoice.items.length < 3 && Array.from({ length: 3 - invoice.items.length }).map((_, i) => (
                    <tr key={`empty-${i}`} className="border-b border-slate-100 last:border-0 h-10">
                      <td className="border-r border-slate-200"></td>
                      <td className="border-r border-slate-200"></td>
                      <td className="border-r border-slate-200"></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end items-start mb-12">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Subtotal / <span className="tracking-normal" dir="rtl">المجموع الفرعي</span></span>
                  <span>{invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</span>
                </div>
                {invoice.tax > 0 && (
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>VAT {invoice.taxRate ? `(${invoice.taxRate}%)` : ''} {invoice.taxType ? `[${invoice.taxType}]` : ''} / <span className="tracking-normal" dir="rtl">الضريبة</span></span>
                    <span>{invoice.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t-2 border-slate-900 text-sm font-black uppercase tracking-tighter">
                  <span>Total / <span className="tracking-normal" dir="rtl">الإجمالي</span></span>
                  <span className="text-slate-900">{invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</span>
                </div>
                {invoice.paymentStatus === 'partial' && (
                  <div className="space-y-2 pt-2 border-t border-dashed border-slate-200">
                    <div className="flex justify-between text-xs font-bold text-emerald-600">
                      <span>Amount Paid / <span dir="rtl">المبلغ المدفوع</span></span>
                      <span>{(invoice.amountPaid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</span>
                    </div>
                    <div className="flex justify-between text-xs font-black text-rose-600">
                      <span>Balance Due / <span dir="rtl">المبلغ المتبقي</span></span>
                      <span>{(invoice.total - (invoice.amountPaid || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-12 border-t border-slate-100 flex justify-between items-end">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount in Words / المبلغ بالكلمات</div>
                    <div className="text-[10px] font-bold text-slate-900 italic">{numberToWords(invoice.total)}</div>
                    <div className="text-[10px] font-bold text-slate-900 text-right" dir="rtl">{numberToWordsArabic(invoice.total)}</div>
                  </div>
                </div>
                <p className="text-[8px] text-slate-400 max-w-xs leading-relaxed">
                  This is a computer-generated document. No signature is required. 
                  All services are subject to terms and conditions.
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Authorized By</p>
                <p className="text-[11px] font-black uppercase tracking-tighter italic">{invoice.issuedBy || invoice.businessName || 'KH Dream Management'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicInvoiceView;
