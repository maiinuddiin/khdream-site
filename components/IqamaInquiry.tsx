import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, FileText, CheckCircle, RefreshCw, Printer, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import AbstractBackground from './AbstractBackground';

export default function IqamaInquiry() {
  const { data } = useCMS();
  const [idType, setIdType] = useState<'iqama' | 'border'>('iqama');
  const [iqamaNumber, setIqamaNumber] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const [searchState, setSearchState] = useState<'input' | 'scanning' | 'result'>('input');
  
  // Interactive Live Document State
  const [documentData, setDocumentData] = useState<any>({
    nameEn: "Mohammad Yusuf Ali",
    nameAr: "محمد يوسف علي",
    workerNo: "24987152",
    workerStatusEn: "On the job / Currently employed",
    workerStatusAr: "على رأس العمل",
    facilityRatingEn: "Platinum (High Compliance)",
    facilityRatingAr: "بلاتيني (متوافق جداً)",
    facilityRatingColor: "platinum",
    licensesEn: "Establishment permits are valid & certified (تصاريح وتراخيص المنشأة سارية ومعتمدة)",
    licensesAr: "تصاريح وتراخيص المنشأة سارية ومعتمدة",
    iqamaNo: "2498715201",
    generatedAt: new Date().toLocaleString()
  });

  const [captchaError, setCaptchaError] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [captchaImg, setCaptchaImg] = useState('');
  const [isFetchingCaptcha, setIsFetchingCaptcha] = useState(false);
  const [sessionMode, setSessionMode] = useState<'live' | 'local'>('local');

  const fetchCaptchaSession = async () => {
    setIsFetchingCaptcha(true);
    setError('');
    try {
      const res = await fetch('/api/iqama-inquiry/session');
      const resData = await res.json();
      if (res.ok && resData.success) {
        setSessionId(resData.sessionId);
        setCaptchaImg(resData.captchaImg);
        setSessionMode(resData.mode);
        setError('');
      } else {
        setError(resData.error || 'Failed to fetch MHRSD service verification session.');
      }
    } catch (e: any) {
      setError(`Failed to retrieve verification challenge: ${e.message || String(e)}`);
    } finally {
      setIsFetchingCaptcha(false);
    }
  };

  useEffect(() => {
    fetchCaptchaSession();
  }, []);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCaptchaError(false);
    
    if (!iqamaNumber || iqamaNumber.length < 10) {
      setError(idType === 'iqama' 
        ? 'Please enter a valid 10-digit Iqama Number.'
        : 'Please enter a valid 10-digit Border Number.'
      );
      return;
    }
    
    if (!captchaInput) {
      setError('Please enter the verification security code.');
      return;
    }

    setSearchState('scanning');
    
    try {
      const response = await fetch('/api/iqama-inquiry/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          idNumber: iqamaNumber,
          captchaText: captchaInput,
          inquireType: idType
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        setSearchState('input');
        setCaptchaError(true);
        setError(resData.error || 'Incorrect code. Please match the verification Captcha carefully.');
        fetchCaptchaSession();
        return;
      }

      setDocumentData({
        nameEn: resData.data.workerName,
        nameAr: resData.data.workerNameAr || resData.data.workerName,
        workerNo: resData.data.workerNumber,
        workerStatusEn: resData.data.workerStatus,
        workerStatusAr: resData.data.workerStatusAr || "على رأس العمل",
        facilityRatingEn: resData.data.facilityRating,
        facilityRatingAr: resData.data.facilityRatingAr || "أخضر مرتفع",
        facilityRatingColor: resData.data.facilityRating?.toLowerCase().includes('platinum') ? 'platinum' : 'green',
        licensesEn: resData.data.facilityLicenses,
        licensesAr: resData.data.facilityLicensesAr || "تصاريح المنشأة سارية",
        iqamaNo: iqamaNumber,
        generatedAt: new Date().toLocaleString(),
        mode: resData.mode
      });

      setSearchState('result');

    } catch (err) {
      setSearchState('input');
      setError('Verification service connection timed out. Please try again.');
      fetchCaptchaSession();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getRatingColorClass = (rating: string) => {
    const r = rating?.toLowerCase() || '';
    if (r.includes('red') || r.includes('أحمر') || r.includes('احمر')) {
      return 'text-red-600 font-extrabold';
    }
    if (r.includes('green') || r.includes('أخضر') || r.includes('اخضر')) {
      return 'text-emerald-600 font-extrabold';
    }
    if (r.includes('platinum') || r.includes('بلاتيني') || r.includes('بلاتين')) {
      return 'text-cyan-600 font-extrabold';
    }
    return 'text-amber-500 font-extrabold';
  };

  const domainName = typeof window !== 'undefined' ? window.location.hostname : 'kh-dream-travels.com';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090b11] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Decorative clean background waves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden h-[400px] z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-40">
          <AbstractBackground variant="waves" />
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-12 pb-24">
        
        {/* Flat navigation button */}
        <div className="mb-8 flex items-center justify-between print:hidden">
          <button 
            type="button"
            id="back-btn"
            onClick={() => {
              if (searchState === 'result') {
                setSearchState('input');
                setCaptchaInput('');
                fetchCaptchaSession();
              } else {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm transition-all"
          >
            <ArrowLeft size={14} />
            {searchState === 'result' ? 'Back to Search' : 'Go to Home'}
          </button>

          <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400 dark:text-zinc-500 uppercase bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded">
            Verify Worker Status
          </span>
        </div>

        <AnimatePresence mode="wait">
          
          {/* STATE 1: INPUT FORM STATE */}
          {searchState === 'input' && (
            <motion.div 
              key="input-form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="max-w-xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-zinc-800 shadow-md relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-teal-600" />
              
              <div className="flex items-center gap-2.5 mb-2 mt-2">
                <Shield className="text-teal-600" size={20} />
                <h2 className="text-md font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  MHRSD Worker Status Enquiry
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6 font-medium leading-relaxed">
                Verify target worker status, safety compliance zone ratings, and official work permits directly.
              </p>

              <form onSubmit={handleSearchSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-2">
                    Inquiry ID Type
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-zinc-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => { setIdType('iqama'); setIqamaNumber(''); }}
                      className={`py-2 px-3 rounded text-xs font-bold uppercase transition-all ${
                        idType === 'iqama' 
                          ? 'bg-teal-600 text-white shadow-sm' 
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      Iqama Number
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIdType('border'); setIqamaNumber(''); }}
                      className={`py-2 px-3 rounded text-xs font-bold uppercase transition-all ${
                        idType === 'border' 
                          ? 'bg-teal-600 text-white shadow-sm' 
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      Border Number
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-2">
                    {idType === 'iqama' ? 'Iqama' : 'Border'} Identification Number
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      maxLength={10}
                      pattern="\d*"
                      required
                      placeholder={idType === 'iqama' ? "Enter 10-digit Iqama Number" : "Enter 10-digit Border Number"}
                      value={iqamaNumber}
                      onChange={(e) => setIqamaNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 outline-none text-sm font-bold tracking-wider text-slate-900 dark:text-white focus:border-teal-600 transition-all font-mono"
                    />
                    <Search className="absolute right-3.5 top-3.5 text-slate-400" size={16} />
                  </div>
                </div>

                {/* Larger Captcha Display for Better Visibility */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-2 leading-relaxed">
                    Verification Code
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Flat, generous container with zero shadow, pure borders */}
                    <div className="flex-[4] bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-between select-none min-h-[96px]">
                      {isFetchingCaptcha ? (
                        <span className="text-xs text-slate-400 flex items-center gap-1.5 mx-auto">
                          <RefreshCw size={14} className="animate-spin text-teal-500" /> Retrieving...
                        </span>
                      ) : captchaImg ? (
                        <img 
                          src={captchaImg} 
                          alt="Verification Code" 
                          className="h-20 w-auto object-contain rounded border border-slate-200 dark:border-zinc-800"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xs text-red-500 font-bold mx-auto">Failed to load captcha. Please retry.</span>
                      )}
                      
                      <button
                        type="button"
                        onClick={fetchCaptchaSession}
                        disabled={isFetchingCaptcha}
                        className="ml-2 p-2 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 text-slate-500 dark:text-zinc-400 hover:text-teal-600 transition-all"
                        title="Reload captcha code"
                      >
                        <RefreshCw size={15} className={isFetchingCaptcha ? "animate-spin" : ""} />
                      </button>
                    </div>

                    <div className="flex-[3]">
                      <input 
                        type="text"
                        maxLength={6}
                        required
                        placeholder="Enter Code"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        className={`w-full px-4 py-4 bg-slate-50 dark:bg-zinc-800 rounded-lg border ${
                          captchaError ? 'border-red-500' : 'border-slate-200 dark:border-zinc-700'
                        } outline-none text-lg text-center font-black tracking-widest text-slate-900 dark:text-white font-mono focus:border-teal-600 transition-all h-full min-h-[96px]`}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle size={15} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Search size={14} />
                  Verify Worker Status
                </button>
              </form>
            </motion.div>
          )}

          {/* STATE 2: SCANNING PROGRESS BAR */}
          {searchState === 'scanning' && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center max-w-xl mx-auto"
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-zinc-800 border-t-teal-600 animate-spin" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Verifying Worker Status Registry</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2">
                Checking official registers, please wait...
              </p>
              
              <div className="w-64 bg-slate-200 dark:bg-zinc-800 h-1 rounded-full mt-6 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8 }}
                  className="bg-teal-600 h-full rounded-full"
                />
              </div>
            </motion.div>
          )}

          {/* STATE 3: RESULTS STATE WITHOUT SIDELINES / EDITORS */}
          {searchState === 'result' && documentData && (
            <motion.div 
              key="result-report"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 max-w-3xl mx-auto"
            >
              
              {/* Top controls: flat primary print actions */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
                <div className="text-left">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={10} /> Status Retrieved Successfully
                  </span>
                  <p className="text-xs text-slate-500 font-bold dark:text-zinc-400">
                    Bilingual register output from official human resources database.
                  </p>
                </div>
                
                <div className="flex gap-2.5 w-full sm:w-auto">
                  <button 
                    type="button"
                    onClick={() => {
                      setSearchState('input');
                      setCaptchaInput('');
                      fetchCaptchaSession();
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded font-bold text-xs uppercase"
                  >
                    Another Query
                  </button>
                  <button 
                    type="button"
                    onClick={handlePrint}
                    className="flex-1 sm:flex-initial px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow"
                  >
                    <Printer size={13} />
                    Print Summary
                  </button>
                </div>
              </div>

              {/* Centered A4 Print Report Container */}
              <div 
                id="iqama-a4-document"
                className="w-full bg-white text-slate-900 rounded-xl border border-slate-200/80 shadow-lg overflow-hidden relative font-sans p-6 md:p-10 print:border-none print:shadow-none print:rounded-none print:p-0 print:m-0"
              >
                {/* Embedded dynamic watermark seal */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none z-0">
                  <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor" className="text-teal-700">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1-3.11c2.19.48 4 2.29 4.48 4.48l-1.48.5C15.65 2.5 14.5 1.5 13 1.13v-2.24zm-2 0v2.24C9.5 1.5 8.35 2.5 7.97 3.87l-1.48-.5C6.97 1.19 8.81-.63 11-1.11zM6.13 5.1c-.81.65-1.43 1.5-1.8 2.47l-1.48-.5c.5-1.33 1.34-2.5 2.47-3.3l.81 1.33zm11.74 0l.81-1.33c1.13.8 1.97 1.97 2.47 3.3l-1.48.5c-.37-.97-.99-1.82-1.8-2.47zM12 4.5c2.42 0 4.5 1.7 4.93 4h2.04c-.46-3.41-3.38-6-6.97-6s-6.51 2.59-6.97 6h2.04c.43-2.3 2.51-4 4.93-4zm6 6.5h3v2h-3v-2zm-12 0H3v2h3v-2zm12 3c-.43 2.3-2.51 4-4.93 4s-4.5-1.7-4.93-4H3.06c.46 3.41 3.38 6 6.97 6s6.51-2.59 7.97-6h-2.04z" />
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col justify-between">
                  {/* Document Header */}
                  <div>
                    <div className="flex justify-between items-start border-b-2 border-teal-700 pb-5 mb-6">
                      <div>
                        <h1 className="text-lg md:text-xl font-black text-teal-700 uppercase tracking-tight">
                          WORKER ENQUIRY REPORT
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold tracking-tight uppercase">Official Registry Verification Result</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                          {domainName}
                        </span>
                        <div className="text-[9px] font-semibold text-slate-400 mt-1.5 font-mono">
                          Date: {documentData.generatedAt}
                        </div>
                      </div>
                    </div>

                    {/* Report Info box */}
                    <div className="bg-slate-50 border border-slate-200/50 rounded-lg p-3.5 flex gap-3.5 items-center mb-6">
                      <div className="w-10 h-10 rounded bg-teal-50 flex items-center justify-center text-teal-700 shrink-0">
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-slate-800">
                          MHRSD System Status Summary
                        </h4>
                        <p className="text-[9px] text-slate-500 leading-normal">
                          Verification query returned successful status registry. The following records represent verified parameters matching official ministry database indexes.
                        </p>
                      </div>
                    </div>

                    {/* Report Fields Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      
                      {/* Name Card */}
                      <div className="border border-slate-200 rounded p-3.5 bg-white flex flex-col justify-between">
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 mb-1">
                          Worker Name / الاسم بالكامل
                        </span>
                        <div>
                          <p className="text-xs md:text-sm font-black text-slate-900 leading-snug">
                            {documentData.nameEn}
                          </p>
                          <p className="text-xs font-bold text-slate-500 mt-1 pb-1 font-sans text-right" dir="rtl">
                            {documentData.nameAr}
                          </p>
                        </div>
                      </div>

                      {/* Worker Status Card */}
                      <div className="border border-slate-200 rounded p-3.5 bg-white flex flex-col justify-between">
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 mb-1">
                          Worker Status / حالة العامل
                        </span>
                        <div>
                          <p className="text-xs md:text-sm font-black text-teal-800 leading-snug">
                            {documentData.workerStatusEn}
                          </p>
                          <p className="text-xs font-bold text-slate-500 mt-1 pb-1 font-sans text-right" dir="rtl">
                            {documentData.workerStatusAr}
                          </p>
                        </div>
                      </div>

                      {/* Worker Number Card */}
                      <div className="border border-slate-200 rounded p-3.5 bg-white flex flex-col justify-between">
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 mb-1">
                          Worker Registry No. / رقم العامل
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900 font-mono tracking-wider">
                            {documentData.workerNo || "Not Disclosed"}
                          </p>
                        </div>
                      </div>

                      {/* ID Number Card */}
                      <div className="border border-slate-200 rounded p-3.5 bg-white flex flex-col justify-between">
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 mb-1">
                          Enquired Identification ID / رقم الإقامة
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900 font-mono tracking-wider">
                            {documentData.iqamaNo}
                          </p>
                        </div>
                      </div>

                      {/* Facility Zone compliance rating */}
                      <div className="border border-slate-200 rounded p-3.5 bg-white md:col-span-2 flex flex-col justify-between">
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 mb-1">
                          Facility Rating (Nitaqat Zone) / تقييم المنشأة
                        </span>
                        <div className="flex justify-between items-center pt-0.5">
                          <p className={`text-xs md:text-sm ${getRatingColorClass(documentData.facilityRatingEn)}`}>
                            {documentData.facilityRatingEn}
                          </p>
                          <p className={`text-xs md:text-sm font-bold ${getRatingColorClass(documentData.facilityRatingAr)}`} dir="rtl">
                            {documentData.facilityRatingAr}
                          </p>
                        </div>
                      </div>

                      {/* Facility Licenses Card */}
                      <div className="border border-slate-200 rounded p-3.5 bg-white md:col-span-2 flex flex-col justify-between">
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 mb-1">
                          Permits &amp; Compliance Details / تراخيص المنشأة
                        </span>
                        <div className="flex justify-between items-center gap-4 pt-0.5">
                          <p className="text-xs font-bold text-slate-800 leading-normal">
                            {documentData.licensesEn}
                          </p>
                          <p className="text-xs font-bold text-slate-600 text-right leading-normal font-sans" dir="rtl">
                            {documentData.licensesAr}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Stamp & Seal Footer */}
                  <div className="border-t border-slate-200 pt-5 mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <CheckCircle size={15} />
                      </div>
                      <div>
                        <p className="text-[9px] font-extrabold text-slate-900">VERIFIED VALID REGISTRY DOCUMENT</p>
                        <p className="text-[8px] text-slate-400">Human Resources registry check completed successfully.</p>
                      </div>
                    </div>
                    <div>
                      <div className="inline-block p-1.5 border border-slate-300 font-mono text-[8px] font-black rounded text-slate-400 uppercase tracking-widest bg-slate-50">
                        MHRSD SECURITY VERIFIED
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Embedded pristine styles for print view */}
      <style>{`
        @media print {
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, header, footer, .print\\:hidden, button, #back-btn, .absolute, .bg-slate-50 {
            display: none !important;
            height: 0 !important;
            width: 0 !important;
            visibility: hidden !important;
          }
          #iqama-a4-document {
            display: block !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
