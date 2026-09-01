import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../context/CMSContext';
import { 
  ArrowLeft, Printer, Play, Mail, Phone, Globe, MapPin, 
  Calendar, Award, Briefcase, FileText, Clock, ShieldCheck, 
  ChevronRight, Building2, ExternalLink, HelpCircle, Users,
  CheckCircle2, TrendingUp, Check, Star, Compass, HeartHandshake,
  Sparkles, Download, Info, X, Video, Shield, Milestone, Landmark, FileCheck, Zap,
  Target, ArrowUpRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface CompanyProfilePageProps {
  onBack: () => void;
}

// Shared Pure CSS Barcode Component
const VisualBarcode: React.FC<{ value: string; className?: string; light?: boolean }> = ({ value, className, light }) => {
  const getPattern = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);
    const pattern: number[] = [];
    let current = absHash;
    for (let i = 0; i < 28; i++) {
      pattern.push((current % 3) + 1);
      current = Math.floor(current / 1.7);
    }
    return pattern;
  };

  const stripes = getPattern(value || "KHD-PROFILE");

  return (
    <div className={cn("flex flex-col items-center justify-center font-mono select-none", className)}>
      <div className={cn("flex items-stretch h-8 px-2.5 py-1 border rounded-md", light ? "bg-[#faf9f6]/80 border-[#e62e2d]/30" : "bg-white border-slate-200")}>
        {stripes.map((width, idx) => (
          <React.Fragment key={idx}>
            <div 
              style={{ width: `${width * 1.5}px` }} 
              className={cn("h-full", light ? "bg-[#e62e2d]" : "bg-slate-950", idx % 2 === 0 ? "opacity-100" : "opacity-0")} 
              id={`stripe-${idx}`}
            />
            {idx === 14 && <div className="w-[3px] h-full bg-[#e62e2d] opacity-100 mx-1" />}
          </React.Fragment>
        ))}
      </div>
      <span className={cn("text-[9px] font-bold uppercase tracking-wider mt-1", light ? "text-[#e62e2d]/80" : "text-slate-500")} id="barcode-val">{value}</span>
    </div>
  );
};

// ==========================================
// 1. COVER & EXECUTIVE DESK SUB-PAGE (White Background)
// ==========================================
interface ProfileCoverPageProps {
  profile: any;
  isLandscape: boolean;
  setActiveVideo: (url: string | null) => void;
  getCleanEmbedUrl: (url?: string) => string;
  getShapeStyle: (shapeType: string) => any;
  sectionCEO: any;
}

const ProfileCoverPage: React.FC<ProfileCoverPageProps> = ({
  profile,
  isLandscape,
  setActiveVideo,
  getCleanEmbedUrl,
  getShapeStyle,
  sectionCEO,
}) => {
  return (
    <div 
      id="profile-page-1"
      className={cn(
        "a4-page w-full bg-white text-slate-900 shadow-2xl relative flex overflow-hidden transition-all duration-300 border border-slate-200",
        isLandscape 
          ? "aspect-[297/210] min-h-[210mm]" 
          : "aspect-[210/297] min-h-[297mm]"
      )}
    >
      {/* 1. LEFT EXTREME CONTACT SPINE (Matches Mockup Cover Left Spine) */}
      <div className="w-[24%] bg-slate-950 text-white p-4 sm:p-5 flex flex-col justify-between relative z-10 border-r-2 border-[#e62e2d]">
        {/* Top slant accent */}
        <div 
          className="absolute top-0 left-0 right-0 h-16 bg-[#e62e2d] z-0"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0 100%)' }}
        />
        <div className="absolute top-0 left-0 right-0 h-16 bg-white/10 z-0"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 30%, 0 80%)' }}
        />
        
        {/* Top Brand Name */}
        <div className="relative z-10 pt-1">
          <span className="text-[9px] font-black tracking-[0.25em] text-[#e62e2d] block uppercase">
            KH DREAM
          </span>
          <span className="text-[7.5px] font-mono text-slate-400 block tracking-widest uppercase mt-0.5">
            SERVICES LTD
          </span>
        </div>

        {/* Center Contact Details */}
        <div className="space-y-4 my-auto relative z-10 pt-10">
          <div>
            <span className="text-[8px] font-black text-[#e62e2d] uppercase tracking-[0.2em] block">
              CONTACT US
            </span>
            <div className="w-6 h-[1.5px] bg-[#e62e2d] mt-1 mb-2.5" />
          </div>

          <div className="space-y-3 text-[9px] leading-relaxed text-slate-300">
            <div>
              <span className="font-extrabold text-white uppercase block tracking-wider">RIYADH HEADQUARTERS</span>
              <p className="font-medium mt-0.5 text-slate-400">King Fahd Rd, Olaya, Riyadh, KSA</p>
              <span className="font-mono text-white/80 block mt-0.5">+{profile.phone}</span>
            </div>

            <div>
              <span className="font-extrabold text-white uppercase block tracking-wider">DHAKA EXECUTIVE</span>
              <p className="font-medium mt-0.5 text-slate-400">Road 11, Gulshan-2, Dhaka</p>
              <span className="font-mono text-white/80 block mt-0.5">+880 17 6816 1823</span>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="font-bold text-white block uppercase tracking-wider text-[8px]">ONLINE PORTAL</span>
              <span className="font-mono text-[#e62e2d] font-bold block mt-0.5 truncate">{profile.website}</span>
              <span className="font-mono text-slate-400 block truncate">{profile.email}</span>
            </div>
          </div>
        </div>

        {/* Bottom Badge */}
        <div className="relative z-10 border-t border-slate-800 pt-3 text-center">
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
            ESTABLISHED
          </span>
          <span className="text-sm font-black text-[#e62e2d] tracking-widest block">
            {profile.foundedYear}
          </span>
        </div>
      </div>

      {/* 2. RIGHT MAIN COVER AREA (Matches Mockup Diagonal Slice Layout) */}
      <div className="w-[76%] h-full bg-white relative flex flex-col justify-between p-6 sm:p-8 overflow-hidden">
        
        {/* Modern Diagonal Slice Hero Artwork (Slices grayscale image diagonally with red slash) */}
        <div className="absolute top-0 left-0 right-0 h-[48%] overflow-hidden z-0">
          {/* Grayscale Skyline Image */}
          <div 
            className="absolute inset-0 w-full h-full bg-slate-900 bg-cover bg-center grayscale contrast-125 brightness-75 transition-all duration-700 hover:scale-105"
            style={{ 
              backgroundImage: `url(${profile.coverUrl})`,
              clipPath: 'polygon(0 0, 100% 0, 100% 74%, 0 100%)' 
            }}
          />
          {/* Bold Crimson Accent Diagonal Bands */}
          <div 
            className="absolute inset-0 bg-[#e62e2d]"
            style={{ 
              clipPath: 'polygon(0 92%, 100% 67%, 100% 74%, 0 99%)' 
            }}
          />
          <div 
            className="absolute inset-0 bg-[#0b1b3d]"
            style={{ 
              clipPath: 'polygon(0 97%, 100% 72%, 100% 75%, 0 100%)' 
            }}
          />

          {/* Slogan Banner: DREAM • TRUST • SUCCESS Overlay on artwork corner */}
          <div className="absolute top-4 right-4 bg-white/95 px-2.5 py-1 rounded-md border border-[#e62e2d]/30 shadow-md backdrop-blur-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#e62e2d] rounded-full animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-[#0b1b3d]">Saudi Vision 2030 Gateway</span>
          </div>
        </div>

        {/* 2a. COVER CONTENT SECTION (Bottom half, pure clean white background) */}
        <div className="relative z-10 mt-[53%] flex flex-col justify-between flex-grow gap-4">
          
          {/* Title and Tagline block */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-[3px] bg-[#e62e2d]" />
              <span className="text-[9.5px] font-black uppercase tracking-[0.3em] text-[#e62e2d]">
                Corporate Dossier
              </span>
            </div>

            <div className="space-y-0">
              <h1 className="text-3xl sm:text-[38px] font-black tracking-widest text-[#0b1b3d] leading-none uppercase font-sans">
                COMPANY
              </h1>
              <h1 className="text-3xl sm:text-[38px] font-black tracking-[0.15em] text-[#e62e2d] leading-tight uppercase font-sans">
                PROFILE
              </h1>
            </div>

            <p className="text-xs sm:text-[13px] font-semibold text-[#e62e2d] border-l-4 border-[#e62e2d] pl-3 italic leading-relaxed max-w-xl">
              "{profile.tagline}"
            </p>

            <div className="w-20 h-1 bg-[#e62e2d] my-3" />

            <p className="text-[11px] sm:text-xs text-slate-500 font-semibold leading-relaxed max-w-md">
              Paving secure, compliance-assured FDI pathways under Saudi Vision 2030. We expedite licensing with corporate formation, Ministry liaison, and elite executive relocation assets.
            </p>
          </div>

          {/* Slogan Banner Grid */}
          <div className="grid grid-cols-3 gap-1 py-1 border border-slate-200 text-center bg-white rounded-lg max-w-sm shadow-xs">
            <div className="flex items-center justify-center gap-1.5 border-r border-slate-100">
              <Target size={10} className="text-[#e62e2d]" />
              <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-800">Dream</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 border-r border-slate-100">
              <ShieldCheck size={10} className="text-[#0b1b3d]" />
              <span className="text-[8.5px] font-black uppercase tracking-wider text-[#0b1b3d]">Trust</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Sparkles size={10} className="text-[#10b981]" />
              <span className="text-[8.5px] font-black uppercase tracking-wider text-[#10b981]">Success</span>
            </div>
          </div>

          {/* Video / Executive Message Quick link or barcode footer */}
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 mt-1">
            <div className="flex items-center gap-2">
              <img 
                src={profile.logoUrl} 
                alt="Logo" 
                className="h-8 object-contain bg-white p-1 rounded border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-[#0b1b3d] leading-none uppercase">KH DREAM</span>
                <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider font-mono mt-0.5">Verified Corporate Doc</span>
              </div>
            </div>

            {/* Scannable Barcode & QR Code */}
            <div className="flex items-center gap-3 shrink-0">
              <VisualBarcode value={profile.barcodeValue} className="hidden sm:flex" light={false} />
              
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg shadow-xs">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(profile.qrCodeUrl)}`}
                  alt="Profile QR"
                  className="w-8 h-8 object-contain"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[6.5px] font-mono text-slate-400 font-bold uppercase tracking-widest block vertical-text pr-0.5">SCAN</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

// ==========================================
// 2. WHO WE ARE SUB-PAGE (White/Cream Background)
// ==========================================
interface ProfileIdentityPageProps {
  profile: any;
  isLandscape: boolean;
  getShapeStyle: (shapeType: string) => any;
  sectionHistory: any;
  statsList: any[];
}

const ProfileIdentityPage: React.FC<ProfileIdentityPageProps> = ({
  profile,
  isLandscape,
  getShapeStyle,
  sectionHistory,
  statsList,
}) => {
  const getStatIcon = (index: number) => {
    switch (index) {
      case 0: return <Clock className="w-5 h-5 text-[#e62e2d]" />;
      case 1: return <Users className="w-5 h-5 text-[#e62e2d]" />;
      case 2: return <Award className="w-5 h-5 text-[#e62e2d]" />;
      case 3: return <Shield className="w-5 h-5 text-[#e62e2d]" />;
      default: return <Milestone className="w-5 h-5 text-[#e62e2d]" />;
    }
  };

  return (
    <div 
      id="profile-page-2"
      className={cn(
        "a4-page w-full bg-white shadow-xl relative flex flex-col justify-between overflow-hidden transition-all duration-300 text-slate-900 border border-slate-200 p-8 sm:p-10",
        isLandscape 
          ? "aspect-[297/210] min-h-[210mm]" 
          : "aspect-[210/297] min-h-[297mm]"
      )}
    >
      {/* Premium Custom Page Corner Flap */}
      <div 
        className="absolute top-0 left-0 w-24 h-24 bg-[#e62e2d] z-0 pointer-events-none"
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />
      <div 
        className="absolute top-0 left-0 w-[84px] h-[84px] bg-[#0b1b3d] z-0 pointer-events-none opacity-25"
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />
      
      {/* Absolute Corporate Banner in Minimalist Style */}
      <div className="absolute top-0 left-0 right-0 h-[60px] bg-white z-0 flex items-center justify-between pl-16 pr-8 border-b border-slate-100">
        <div className="flex items-center gap-2 text-[#0b1b3d]">
          <span className="text-xl font-black text-[#e62e2d] font-mono leading-none">02</span>
          <div className="w-[1.5px] h-4 bg-slate-300 mx-1" />
          <span className="text-[11px] font-black tracking-[0.25em] uppercase text-[#0b1b3d]">
            STRATEGIC IDENTITY
          </span>
        </div>
        <span className="text-[10px] font-black text-[#e62e2d] uppercase tracking-widest font-sans">
          Corporate Credentials & Stewardship
        </span>
      </div>

      {/* Decorative center shield background watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border-[15px] border-[#0b1b3d]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[470px] h-[470px] rounded-full border-[5px] border-[#e62e2d] border-dashed" />
      </div>

      {/* Main Body Grid */}
      <div className="relative z-10 flex-grow flex flex-col justify-between pt-[70px] pb-3 gap-6">
        
        {isLandscape ? (
          /* ================== LANDSCAPE LAYOUT ================== */
          <div className="grid grid-cols-12 gap-8 items-stretch flex-grow">
            
            {/* Left side: History, stats, core pillars */}
            <div className="col-span-7 flex flex-col justify-between space-y-4">
              
              {/* About Text Section */}
              <div className="space-y-1.5">
                <span className="px-2.5 py-1 bg-[#0b1b3d]/10 text-[#0b1b3d] text-[9px] font-black uppercase tracking-[0.2em] rounded inline-block">
                  {sectionHistory.subtitle}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-[#0b1b3d] uppercase tracking-tight font-sans">
                  {sectionHistory.title}
                </h2>
                <p className="text-xs leading-relaxed text-slate-700 font-semibold border-l-2 border-[#e62e2d] pl-3">
                  {profile.aboutText || "KH Dream Services Limited is Saudi Arabia's preeminent full-service corporate advisory and luxury travel gateway, paving seamless, compliance-assured pathways under Saudi Vision 2030."}
                </p>
              </div>

              {/* Dynamic Mission/Vision Pillars */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#0b1b3d] text-white rounded-xl shadow-md space-y-2 border border-[#e62e2d]/25 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white/5 translate-x-4 -translate-y-4" />
                  <div>
                    <span className="text-[8.5px] font-black text-[#e62e2d] uppercase tracking-widest block font-mono">MISSION CORE</span>
                    <h4 className="text-xs font-bold uppercase text-white font-sans mt-0.5">
                      {profile.missionTitle || "Turnkey GCC Portals"}
                    </h4>
                  </div>
                  <p className="text-[11px] text-white/85 font-semibold leading-relaxed">
                    {profile.missionText || "Eliminate bureaucratic friction completely, guaranteeing 100% compliant local company setups and premium bespoke global travel."}
                  </p>
                </div>
                
                <div className="p-4 bg-white text-slate-900 rounded-xl shadow-md space-y-2 border-2 border-[#e62e2d] flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-[#0b1b3d]/5 -translate-x-4 translate-y-4" />
                  <div>
                    <span className="text-[8.5px] font-black text-[#0b1b3d] uppercase tracking-widest block font-mono">VISION BENCHMARK</span>
                    <h4 className="text-xs font-bold uppercase text-[#0b1b3d] font-sans mt-0.5">
                      {profile.visionTitle || "The Gold Standard"}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">
                    {profile.visionText || "To be the foremost legal advisory and luxury concierge of choice, bridge-linking international investment groups with GCC realities."}
                  </p>
                </div>
              </div>

              {/* Giant Metrics Row */}
              <div className="grid grid-cols-4 gap-4">
                {statsList.map((stat, idx) => (
                  <div 
                    key={stat.id || idx} 
                    className="bg-white rounded-xl border-2 border-[#e62e2d]/20 hover:border-[#e62e2d] flex flex-col items-center justify-center text-center p-3 shadow-md transition-all duration-300"
                  >
                    {getStatIcon(idx)}
                    <span className="text-lg md:text-xl font-black text-[#0b1b3d] tracking-tight font-sans mt-1">{stat.value}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">{stat.label}</span>
                  </div>
                ))}
              </div>
              
            </div>

            {/* Right side: Relationship stewardship detail card */}
            <div className="col-span-5 flex flex-col justify-between bg-white p-6 rounded-2xl border-2 border-[#0b1b3d] shadow-lg space-y-4">
              
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div style={getShapeStyle('circular-badge')} className="w-16 h-16 shrink-0 overflow-hidden bg-[#0b1b3d] relative p-1 border-2 border-[#e62e2d] shadow-md">
                    <img 
                      src={profile.relationshipImage || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300"} 
                      alt="Consultation" 
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-[#e62e2d] uppercase tracking-widest block leading-none">
                      {profile.relationshipSubtitle || "RELATIONSHIP ADVANTAGE"}
                    </span>
                    <h3 className="text-sm font-black text-[#0b1b3d] uppercase font-sans leading-tight mt-1">
                      {profile.relationshipTitle || "Proactive Stewardship"}
                    </h3>
                  </div>
                </div>
                
                <div className="h-[2px] bg-gradient-to-r from-[#e62e2d] to-transparent" />
                
                <p className="text-xs leading-relaxed text-slate-600 font-semibold">
                  {profile.relationshipText || "At KH Dream Services, relationship stewardship is our absolute core promise. We believe client relations should be proactive rather than responsive. Every corporate contract is paired with a dedicated bilingual Relationship Director (English & Arabic) who serves as an active compliance guardian."}
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden h-28 border border-[#e62e2d]/30 shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400" 
                    alt="Corporate Boardroom Meeting" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-[#0b1b3d]/40" />
                  <div className="absolute bottom-2 left-3 flex items-center gap-2 text-white">
                    <CheckCircle2 size={12} className="text-[#10b981]" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Guaranteed FDI Compliance</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#0b1b3d]/5 p-3 rounded-xl border border-0b1b3d]/10 text-[11px] font-bold text-slate-800 shadow-sm">
                  <CheckCircle2 size={15} className="text-[#10b981] shrink-0 animate-pulse" />
                  <span className="leading-tight">{profile.relationshipCheckText || "Active Compliance Monitoring & Zero Penalty Guarantee"}</span>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* ================== PORTRAIT LAYOUT ================== */
          <div className="space-y-5 flex-grow flex flex-col justify-between mt-2">
            
            {/* Top row split: Identity introduction & Arch image frame */}
            <div className="grid grid-cols-12 gap-6 items-center">
              <div className="col-span-8 space-y-3">
                <span className="px-2.5 py-1 bg-[#0b1b3d]/10 text-[#0b1b3d] text-[9px] font-black uppercase tracking-[0.2em] rounded inline-block">
                  {sectionHistory.subtitle}
                </span>
                <h2 className="text-xl font-black text-[#0b1b3d] uppercase tracking-tight font-sans">
                  {sectionHistory.title}
                </h2>
                <p className="text-xs leading-relaxed text-slate-700 font-semibold border-l-2 border-[#e62e2d] pl-3">
                  {profile.aboutText || "KH Dream Services Limited is a preeminent corporate advisory institution specializing in high-friction government licensing, commercial registration, and customized corporate operations under Saudi Vision 2030."}
                </p>
              </div>
              <div className="col-span-4 flex justify-end">
                <div 
                  className="w-28 h-32 overflow-hidden bg-slate-100 border-2 border-[#e62e2d] shadow-md relative"
                  style={{ borderRadius: '2rem 2rem 0.5rem 0.5rem' }}
                >
                  <img 
                    src={sectionHistory.image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400"} 
                    alt="Strategic Meeting" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1b3d]/50 to-transparent" />
                </div>
              </div>
            </div>

            {/* Middle Section: Stewardship Box with light themed style */}
            <div className="grid grid-cols-12 gap-6 items-stretch bg-white p-5 rounded-2xl border-2 border-[#0b1b3d] shadow-md">
              <div className="col-span-4 flex flex-col justify-between">
                <div 
                  className="w-full h-28 overflow-hidden bg-[#0b1b3d]/10 border-2 border-[#e62e2d]/30 relative rounded-xl shadow-md"
                >
                  <img 
                    src={profile.relationshipImage || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400"} 
                    alt="Consultant Desk" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex items-center gap-1.5 bg-[#10b981]/10 text-[#10b981] px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest text-center mt-2 border border-[#10b981]/20 justify-center">
                  <span>BILINGUAL DIRECTORS</span>
                </div>
              </div>
              
              <div className="col-span-8 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[8px] font-black text-[#e62e2d] uppercase tracking-widest block font-mono">RELATIONSHIP COMPLIANCE</span>
                  <h3 className="text-xs font-black text-[#0b1b3d] uppercase font-sans leading-tight mt-0.5">
                    {profile.relationshipTitle || "Active Stewardship Promise"}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600 font-semibold line-clamp-3 mt-1">
                    {profile.relationshipText || "We establish custom real-time messaging tunnels, schedule bi-weekly operational check-ins, and handle all renewal cycles, ministry correspondence, and regulatory inquiries seamlessly."}
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700">
                  <CheckCircle2 size={13} className="text-[#10b981] shrink-0" />
                  <span className="truncate font-semibold">{profile.relationshipCheckText || "Active Compliance Monitoring & Zero Penalty Guarantee"}</span>
                </div>
              </div>
            </div>

            {/* Pillars Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#0b1b3d] text-white rounded-xl shadow-sm border border-white/10 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] font-mono text-[#e62e2d] block tracking-wider uppercase font-black">MISSION VALUE</span>
                  <h4 className="text-xs font-black uppercase text-white font-sans mt-0.5">{profile.missionTitle || "Frictionless FDI Setup"}</h4>
                  <p className="text-[10px] leading-relaxed text-white/85 font-semibold mt-1.5">{profile.missionText || "Eliminate regulatory and legal complexity for high-value entities registering in KSA."}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 text-slate-900 rounded-xl shadow-sm border-2 border-[#e62e2d] flex flex-col justify-between">
                <div>
                  <span className="text-[8px] font-mono text-[#0b1b3d] block tracking-wider uppercase font-black">VISION METRIC</span>
                  <h4 className="text-xs font-black uppercase text-[#0b1b3d] font-sans mt-0.5">{profile.visionTitle || "Riyadh's Premier Liaison"}</h4>
                  <p className="text-[10px] leading-relaxed text-slate-600 font-semibold mt-1.5">{profile.visionText || "The most compliance-assured gateway for corporate transitions into the GCC region."}</p>
                </div>
              </div>
            </div>

            {/* Metrics block */}
            <div className="grid grid-cols-4 gap-3 bg-white p-3 rounded-2xl border-2 border-slate-200">
              {statsList.map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center text-center">
                  {getStatIcon(idx)}
                  <span className="text-base font-black text-[#0b1b3d] font-sans mt-0.5 leading-none">{stat.value}</span>
                  <span className="text-[7.5px] font-extrabold text-slate-500 uppercase tracking-wider block mt-1 leading-none">{stat.label}</span>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* PAGE FOOTER */}
      <div className="relative z-10 border-t border-slate-300/60 pt-3 flex justify-between items-center text-xs font-bold text-slate-400 font-mono">
        <span>Corporate Profile // KH Dream Services Limited</span>
        <span className="text-[#e62e2d]">Page 02 // Strategic Identity & Corporate Stewardship</span>
      </div>
    </div>
  );
};

// ==========================================
// 3. PREMIUM SERVICES SUB-PAGE (White Background)
// ==========================================
interface ProfileServicesPageProps {
  profile: any;
  isLandscape: boolean;
  getShapeStyle: (shapeType: string) => any;
}

const ProfileServicesPage: React.FC<ProfileServicesPageProps> = ({
  profile,
  isLandscape,
  getShapeStyle,
}) => {
  const s1Title = profile.service1Title || "Saudi Business Setup & FDI Permitting";
  const s1Subtitle = profile.service1Subtitle || "KSA INVESTMENT INCUBATOR";
  const s1Text = profile.service1Text || "We handle the complete corporate lifecycle of foreign entities entering Saudi Arabia. We bypass bureaucratic complexity by directly interfacing with the Ministry of Investment (MISA) and Ministry of Commerce to secure foreign investment permits, commercial registrations (CR), tax registrations, and Chamber of Commerce approvals. We deliver compliance-assured speed.";
  const s1Bullets = profile.service1Bullets && profile.service1Bullets.length > 0 ? profile.service1Bullets : ["MISA Foreign Licensing", "CR Establishment Setup", "Bank Introductions", "ZATCA Filing Systems"];
  const s1Image = profile.service1Image || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=400";

  const s2Title = profile.service2Title || "Worldwide Visit Visa Solutions";
  const s2Subtitle = profile.service2Subtitle || "GLOBAL IMMIGRATION DESK";
  const s2Text = profile.service2Text || "We operate a specialized global visa desk providing structured, turn-key processing for personal, corporate, and investor travel. Our team handles complete dossier preparation, consular pre-checks, secure appointment scheduling, and biometrics organization for travel all across the world.";
  const s2Bullets = profile.service2Bullets && profile.service2Bullets.length > 0 ? profile.service2Bullets : ["Schengen Pathways", "UK & US Business Permits", "Canada Tourist Routes", "GCC Transit Permits"];
  const s2Image = profile.service2Image || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400";

  const SaudiAuthorities = [
    { name: "MISA", role: "Licenses" },
    { name: "MOC", role: "CR Registry" },
    { name: "ZATCA", role: "Tax Filing" },
    { name: "MLSD", role: "Visas & Quotas" },
    { name: "GOSI", role: "Compliance" },
    { name: "COCCI", role: "Verifications" }
  ];

  return (
    <div 
      id="profile-page-3"
      className={cn(
        "a4-page w-full bg-white shadow-xl relative flex flex-col justify-between overflow-hidden transition-all duration-300 text-slate-900 border border-slate-200 p-8 sm:p-10",
        isLandscape 
          ? "aspect-[297/210] min-h-[210mm]" 
          : "aspect-[210/297] min-h-[297mm]"
      )}
    >
      {/* Premium Custom Page Corner Flap */}
      <div 
        className="absolute top-0 left-0 w-24 h-24 bg-[#e62e2d] z-0 pointer-events-none"
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />
      <div 
        className="absolute top-0 left-0 w-[84px] h-[84px] bg-[#0b1b3d] z-0 pointer-events-none opacity-25"
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />
      
      {/* Absolute Corporate Banner in Minimalist Style */}
      <div className="absolute top-0 left-0 right-0 h-[60px] bg-white z-0 flex items-center justify-between pl-16 pr-8 border-b border-slate-100">
        <div className="flex items-center gap-2 text-[#0b1b3d]">
          <span className="text-xl font-black text-[#e62e2d] font-mono leading-none">03</span>
          <div className="w-[1.5px] h-4 bg-slate-300 mx-1" />
          <span className="text-[11px] font-black tracking-[0.25em] uppercase text-[#0b1b3d]">
            PORTFOLIO EXPERTISE
          </span>
        </div>
        <span className="text-[10px] font-black text-[#e62e2d] uppercase tracking-widest font-sans">
          Saudi Advisory & Worldwide Visas
        </span>
      </div>

      {/* Background Watermarks */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0">
        <div className="absolute bottom-12 -left-12 w-80 h-80 rounded-full border-[12px] border-[#e62e2d]" />
      </div>

      {/* Core Body Grid */}
      <div className="relative z-10 flex-grow flex flex-col justify-between pt-[70px] pb-3 gap-6">
        
        {isLandscape ? (
          /* ================== LANDSCAPE LAYOUT ================== */
          <div className="grid grid-cols-12 gap-6 items-stretch flex-grow">
            
            {/* Left Card: KSA Setup in Royal Navy */}
            <div className="col-span-5 p-6 bg-[#0b1b3d] text-white rounded-2xl shadow-xl flex flex-col justify-between border-2 border-[#e62e2d]/40 relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#e62e2d]">
                    <Building2 size={16} />
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] font-mono">
                      {s1Subtitle}
                    </span>
                  </div>
                  <ArrowUpRight size={14} className="text-[#e62e2d]" />
                </div>
                <h3 className="text-base font-black uppercase font-sans leading-tight text-white border-b border-white/10 pb-2">
                  {s1Title}
                </h3>
                <p className="text-[11.5px] leading-relaxed text-white/85 font-semibold">
                  {s1Text}
                </p>
              </div>

              {/* Slanted Image Frame */}
              <div className="h-28 overflow-hidden relative border border-white/10 rounded-xl my-3">
                <img 
                  src={s1Image} 
                  alt="KSA Advisory Skyline" 
                  className="w-full h-full object-cover opacity-85 hover:scale-105 transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1b3d] to-transparent opacity-60" />
              </div>

              {/* Bullet Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-white/95">
                {s1Bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#10b981] shrink-0" />
                    <span className="truncate">{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Card: Global Visas in White with Red Accents */}
            <div className="col-span-5 p-6 bg-slate-50 text-slate-900 rounded-2xl shadow-xl border-2 border-[#e62e2d] flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#0b1b3d]">
                    <Globe size={16} />
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] font-mono">
                      {s2Subtitle}
                    </span>
                  </div>
                  <ArrowUpRight size={14} className="text-[#0b1b3d]" />
                </div>
                <h3 className="text-base font-black uppercase font-sans leading-tight text-[#0b1b3d] border-b border-[#0b1b3d]/10 pb-2">
                  {s2Title}
                </h3>
                <p className="text-[11.5px] leading-relaxed text-slate-600 font-semibold">
                  {s2Text}
                </p>
              </div>

              {/* Slanted Image Frame */}
              <div className="h-28 overflow-hidden relative border border-[#e62e2d]/20 rounded-xl my-3">
                <img 
                  src={s2Image} 
                  alt="Immigration Travel" 
                  className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1b3d]/20 to-transparent" />
              </div>

              {/* Bullet Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-800">
                {s2Bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#e62e2d] shrink-0" />
                    <span className="truncate">{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel: Interfaced Authorities Panel */}
            <div className="col-span-2 flex flex-col justify-between space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="space-y-1 text-center border-b border-slate-200 pb-2">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">SAUDI ARABIA</span>
                <h4 className="text-[10px] font-black text-[#0b1b3d] uppercase leading-none">Interfaced Authorities</h4>
              </div>
              
              <div className="space-y-2 flex-grow flex flex-col justify-center">
                {SaudiAuthorities.map((auth, idx) => (
                  <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs text-center">
                    <span className="text-xs font-black text-[#0b1b3d] block leading-none">{auth.name}</span>
                    <span className="text-[7.5px] text-[#e62e2d] block font-bold uppercase mt-1 leading-none">{auth.role}</span>
                  </div>
                ))}
              </div>

              <div className="p-2 bg-[#0b1b3d] text-white rounded-lg text-center">
                <span className="text-[8px] font-mono text-white/70 block uppercase">STATUS</span>
                <span className="text-[9px] font-black text-[#10b981] uppercase block mt-0.5 animate-pulse">FULLY VERIFIED</span>
              </div>
            </div>

          </div>
        ) : (
          /* ================== PORTRAIT LAYOUT ================== */
          <div className="space-y-5 flex-grow flex flex-col justify-between mt-2">
            
            {/* Service 1 Banner Block (Business Setup) */}
            <div className="grid grid-cols-12 gap-6 items-stretch bg-[#0b1b3d] text-white p-5 rounded-2xl border-2 border-[#e62e2d]/40 shadow-md">
              <div className="col-span-8 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#e62e2d]">
                    <Building2 size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] font-mono">{s1Subtitle}</span>
                  </div>
                  <h3 className="text-sm font-black uppercase font-sans leading-tight text-white border-b border-white/10 pb-1.5">
                    {s1Title}
                  </h3>
                </div>
                <p className="text-[11px] leading-relaxed text-white/85 font-semibold">
                  {s1Text}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-[#e62e2d]">
                  {s1Bullets.map((bullet, idx) => (
                    <span key={idx} className="truncate flex items-center gap-1">
                      <span className="w-1 h-1 bg-[#10b981] rounded-full" /> {bullet}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-span-4 flex flex-col justify-between">
                <div className="w-full h-24 overflow-hidden relative shadow-lg border border-white/20 rounded-xl">
                  <img 
                    src={s1Image} 
                    alt="Setup Center" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="bg-white/5 border border-white/10 p-1.5 rounded-lg text-center mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck size={11} className="text-[#10b981]" />
                  <span className="text-[8px] font-black uppercase text-white/90">MISA Approved</span>
                </div>
              </div>
            </div>

            {/* Service 2 Banner Block (Worldwide Visas) */}
            <div className="grid grid-cols-12 gap-6 items-stretch bg-slate-50 text-slate-900 p-5 rounded-2xl border-2 border-[#e62e2d] shadow-md">
              <div className="col-span-4 flex flex-col justify-between">
                <div className="w-full h-24 overflow-hidden relative shadow-lg border border-[#e62e2d]/30 rounded-xl">
                  <img 
                    src={s2Image} 
                    alt="Consular Hub" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="bg-[#0b1b3d] p-1.5 rounded-lg text-center mt-2 flex items-center justify-center gap-1">
                  <Globe size={11} className="text-[#e62e2d]" />
                  <span className="text-[8px] font-black uppercase text-white">Global Desk</span>
                </div>
              </div>
              
              <div className="col-span-8 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#0b1b3d]">
                    <Globe size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] font-mono">{s2Subtitle}</span>
                  </div>
                  <h3 className="text-sm font-black uppercase font-sans leading-tight text-[#0b1b3d] border-b border-[#0b1b3d]/10 pb-1.5">
                    {s2Title}
                  </h3>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 font-semibold">
                  {s2Text}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-[#0b1b3d]">
                  {s2Bullets.map((bullet, idx) => (
                    <span key={idx} className="truncate flex items-center gap-1">
                      <span className="w-1 h-1 bg-[#e62e2d] rounded-full" /> {bullet}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Authorities Panel */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Landmark size={14} className="text-[#0b1b3d]" />
                <span className="text-[10px] font-black text-[#0b1b3d] uppercase tracking-wider font-sans">Strategic Saudi Interfaced Authorities</span>
              </div>
              
              <div className="grid grid-cols-6 gap-2">
                {SaudiAuthorities.map((auth, idx) => (
                  <div key={idx} className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between text-center min-h-[50px]">
                    <span className="text-xs font-black text-[#0b1b3d] block leading-none">{auth.name}</span>
                    <span className="text-[7.5px] text-[#e62e2d] block font-bold uppercase mt-1 leading-none">{auth.role}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* PAGE FOOTER */}
      <div className="relative z-10 border-t border-slate-300/60 pt-3 flex justify-between items-center text-xs font-bold text-slate-400 font-mono">
        <span>Corporate Profile // KH Dream Services Limited</span>
        <span className="text-[#e62e2d]">Page 03 // Service Portfolios & Saudi Governance</span>
      </div>
    </div>
  );
};

// ==========================================
// 4. PERFORMANCE RECORDS / CASE STUDIES SUB-PAGE (White Background)
// ==========================================
interface ProfileCaseStudiesPageProps {
  profile: any;
  isLandscape: boolean;
  getShapeStyle: (shapeType: string) => any;
}

const ProfileCaseStudiesPage: React.FC<ProfileCaseStudiesPageProps> = ({
  profile,
  isLandscape,
  getShapeStyle,
}) => {
  const casesTitle = profile.caseStudiesTitle || "Business Setup Success Stories";
  const casesText = profile.caseStudiesText || "Compelling case studies demonstrating how our dual expertise in MISA licensing and premium executive logistics delivers unmatched turnaround speed and operational safety in the Kingdom.";

  const s1Tag = profile.caseStudy1Tag || "TECH // FINTECH";
  const s1Title = profile.caseStudy1Title || "TechFlow FinTech (London)";
  const s1Challenge = profile.caseStudy1Challenge || "Securing 100% foreign-owned financial services licensing under strict compliance standards.";
  const s1Outcome = profile.caseStudy1Outcome || "8 Working Days | $15,000,000 FDI Ingress";

  const s2Tag = profile.caseStudy2Tag || "GLOBAL LOGISTICS";
  const s2Title = profile.caseStudy2Title || "EuroFood Cold Chain";
  const s2Challenge = profile.caseStudy2Challenge || "Coordinating industrial warehouse clearances and customs registers across three major economic hubs.";
  const s2Outcome = profile.caseStudy2Outcome || "Riyadh, Jeddah, Dammam | Zero Penalties";

  const s3Tag = profile.caseStudy3Tag || "HEAVY INDUSTRY";
  const s3Title = profile.caseStudy3Title || "SinoManufacture Joint";
  const s3Challenge = profile.caseStudy3Challenge || "Co-structuring a complex steel JV and securing immediate bilateral custom tariff concessions.";
  const s3Outcome = profile.caseStudy3Outcome || "18% Logistics Capital Saved | 120 Engineers";

  const performanceKpis = [
    { label: "MISA Turnaround SLA", val: "97.8%", color: "bg-[#e62e2d]" },
    { label: "Consular Biometrics Pass", val: "100%", color: "bg-[#10b981]" },
    { label: "FDI Ingress Verification", val: "99.9%", color: "bg-[#0b1b3d]" }
  ];

  return (
    <div 
      id="profile-page-4"
      className={cn(
        "a4-page w-full bg-white shadow-xl relative flex flex-col justify-between overflow-hidden transition-all duration-300 text-slate-900 border border-slate-200 p-8 sm:p-10",
        isLandscape 
          ? "aspect-[297/210] min-h-[210mm]" 
          : "aspect-[210/297] min-h-[297mm]"
      )}
    >
      {/* Premium Custom Page Corner Flap */}
      <div 
        className="absolute top-0 left-0 w-24 h-24 bg-[#e62e2d] z-0 pointer-events-none"
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />
      <div 
        className="absolute top-0 left-0 w-[84px] h-[84px] bg-[#0b1b3d] z-0 pointer-events-none opacity-25"
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />
      
      {/* Absolute Corporate Banner in Minimalist Style */}
      <div className="absolute top-0 left-0 right-0 h-[60px] bg-white z-0 flex items-center justify-between pl-16 pr-8 border-b border-slate-100">
        <div className="flex items-center gap-2 text-[#0b1b3d]">
          <span className="text-xl font-black text-[#e62e2d] font-mono leading-none">04</span>
          <div className="w-[1.5px] h-4 bg-slate-300 mx-1" />
          <span className="text-[11px] font-black tracking-[0.25em] uppercase text-[#0b1b3d]">
            PERFORMANCE RECORDS
          </span>
        </div>
        <span className="text-[10px] font-black text-[#e62e2d] uppercase tracking-widest font-sans">
          FDI Success Case Studies
        </span>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] z-0">
        <div className="absolute bottom-12 right-12 w-96 h-96 bg-[#e62e2d] rounded-full" />
      </div>

      {/* Main body content */}
      <div className="relative z-10 flex-grow flex flex-col justify-between pt-[70px] pb-3 gap-6">
        
        {/* Top Text Panel */}
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-8 border-l-4 border-[#e62e2d] pl-4">
            <span className="text-[9px] font-black text-[#0b1b3d] uppercase block font-mono">PROVEN KSA REPUTATION</span>
            <h3 className="text-lg md:text-xl font-black text-[#0b1b3d] uppercase font-sans">
              {casesTitle}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              {casesText}
            </p>
          </div>
          <div className="col-span-4 bg-[#e62e2d]/10 p-3 rounded-xl border border-[#e62e2d]/30 flex items-center gap-3">
            <Sparkles size={20} className="text-[#e62e2d] shrink-0 animate-pulse" />
            <span className="text-[10px] font-black text-[#0b1b3d] uppercase leading-tight font-sans">Certified SAGIA/MISA Liaison Authority</span>
          </div>
        </div>

        {isLandscape ? (
          /* ================== LANDSCAPE LAYOUT ================== */
          <div className="grid grid-cols-12 gap-6 items-stretch flex-grow">
            
            {/* Left side: Three Cards Grid */}
            <div className="col-span-8 grid grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="p-4 bg-slate-50 rounded-xl border-2 border-[#e62e2d]/25 hover:border-[#e62e2d] space-y-3 relative overflow-hidden shadow-md flex flex-col justify-between transition-all duration-300">
                <div className="absolute top-0 right-3 w-6 h-8 bg-[#0b1b3d] text-[#e62e2d] flex items-center justify-center text-[10px] font-bold rounded-b-md shadow-sm">★</div>
                <div className="space-y-1.5">
                  <span className="text-[8.5px] text-[#e62e2d] font-black uppercase tracking-wider block font-mono">{s1Tag}</span>
                  <h4 className="text-xs font-black text-[#0b1b3d] uppercase leading-tight font-sans">{s1Title}</h4>
                  <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                    <strong>Challenge:</strong> {s1Challenge}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-1 text-[11px] font-bold text-[#0b1b3d]">
                  <span className="text-[#e62e2d] block uppercase tracking-wider font-mono text-[8.5px] font-extrabold">SLA OUTCOME</span>
                  <span className="truncate">{s1Outcome}</span>
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="p-4 bg-slate-50 rounded-xl border-2 border-[#e62e2d]/25 hover:border-[#e62e2d] space-y-3 relative overflow-hidden shadow-md flex flex-col justify-between transition-all duration-300">
                <div className="absolute top-0 right-3 w-6 h-8 bg-[#0b1b3d] text-[#e62e2d] flex items-center justify-center text-[10px] font-bold rounded-b-md shadow-sm">★</div>
                <div className="space-y-1.5">
                  <span className="text-[8.5px] text-[#e62e2d] font-black uppercase tracking-wider block font-mono">{s2Tag}</span>
                  <h4 className="text-xs font-black text-[#0b1b3d] uppercase leading-tight font-sans">{s2Title}</h4>
                  <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                    <strong>Challenge:</strong> {s2Challenge}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-1 text-[11px] font-bold text-[#0b1b3d]">
                  <span className="text-[#e62e2d] block uppercase tracking-wider font-mono text-[8.5px] font-extrabold">SLA OUTCOME</span>
                  <span className="truncate">{s2Outcome}</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-4 bg-slate-50 rounded-xl border-2 border-[#e62e2d]/25 hover:border-[#e62e2d] space-y-3 relative overflow-hidden shadow-md flex flex-col justify-between transition-all duration-300">
                <div className="absolute top-0 right-3 w-6 h-8 bg-[#0b1b3d] text-[#e62e2d] flex items-center justify-center text-[10px] font-bold rounded-b-md shadow-sm">★</div>
                <div className="space-y-1.5">
                  <span className="text-[8.5px] text-[#e62e2d] font-black uppercase tracking-wider block font-mono">{s3Tag}</span>
                  <h4 className="text-xs font-black text-[#0b1b3d] uppercase leading-tight font-sans">{s3Title}</h4>
                  <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                    <strong>Challenge:</strong> {s3Challenge}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-1 text-[11px] font-bold text-[#0b1b3d]">
                  <span className="text-[#e62e2d] block uppercase tracking-wider font-mono text-[8.5px] font-extrabold">SLA OUTCOME</span>
                  <span className="truncate">{s3Outcome}</span>
                </div>
              </div>
            </div>

            {/* Right side: SLA Infographic Panel */}
            <div className="col-span-4 bg-[#0b1b3d] text-white p-5 rounded-2xl border border-[#e62e2d]/30 flex flex-col justify-between">
              <div className="space-y-2 border-b border-white/10 pb-2">
                <span className="text-[8px] font-black tracking-widest text-[#e62e2d] block font-mono">KPI BENCHMARK ENGINE</span>
                <h4 className="text-xs font-black uppercase text-white font-sans">Active SLA Compliance Performance</h4>
              </div>

              <div className="space-y-3.5 my-2">
                {performanceKpis.map((kpi, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-white/80">{kpi.label}</span>
                      <span className="text-[#10b981] font-black">{kpi.val}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", kpi.color)} style={{ width: kpi.val }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#e62e2d]/15 border border-[#e62e2d]/30 rounded-lg p-2.5 flex items-center gap-2">
                <Zap size={15} className="text-[#e62e2d] animate-pulse" />
                <span className="text-[9px] font-black text-[#e62e2d] uppercase tracking-wider">Fast-track Consular Consents Guaranteed</span>
              </div>
            </div>

          </div>
        ) : (
          /* ================== PORTRAIT LAYOUT ================== */
          <div className="space-y-5 flex-grow flex flex-col justify-between mt-2">
            
            {/* Story 1 */}
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-[#e62e2d]/25 shadow-md space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-4 w-6 h-7 bg-[#0b1b3d] text-[#e62e2d] flex items-center justify-center text-[10px] font-bold rounded-b-sm">★</div>
              <div className="flex justify-between items-center">
                <span className="text-[8.5px] text-[#e62e2d] font-black uppercase tracking-wider font-mono">{s1Tag}</span>
                <div className="flex text-[#e62e2d] gap-0.5 mr-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-current" />)}
                </div>
              </div>
              <h4 className="text-xs font-black text-[#0b1b3d] uppercase leading-tight font-sans border-b border-slate-200/60 pb-1">{s1Title}</h4>
              <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                <strong>Challenge:</strong> {s1Challenge}
              </p>
              <div className="pt-1 text-[11px] font-bold text-[#0b1b3d] flex justify-between">
                <span className="text-slate-400 font-mono text-[8.5px] uppercase font-black">OUTCOME ACCREDITATION</span>
                <span>{s1Outcome}</span>
              </div>
            </div>
            
            {/* Story 2 */}
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-[#e62e2d]/25 shadow-md space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-4 w-6 h-7 bg-[#0b1b3d] text-[#e62e2d] flex items-center justify-center text-[10px] font-bold rounded-b-sm">★</div>
              <div className="flex justify-between items-center">
                <span className="text-[8.5px] text-[#e62e2d] font-black uppercase tracking-wider font-mono">{s2Tag}</span>
                <div className="flex text-[#e62e2d] gap-0.5 mr-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-current" />)}
                </div>
              </div>
              <h4 className="text-xs font-black text-[#0b1b3d] uppercase leading-tight font-sans border-b border-slate-200/60 pb-1">{s2Title}</h4>
              <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                <strong>Challenge:</strong> {s2Challenge}
              </p>
              <div className="pt-1 text-[11px] font-bold text-[#0b1b3d] flex justify-between">
                <span className="text-slate-400 font-mono text-[8.5px] uppercase font-black">OUTCOME ACCREDITATION</span>
                <span>{s2Outcome}</span>
              </div>
            </div>

            {/* Performance KPI Infographic Block */}
            <div className="grid grid-cols-3 gap-3 bg-[#0b1b3d] text-white p-4 rounded-2xl border border-[#e62e2d]/30 shadow-lg">
              {performanceKpis.map((kpi, idx) => (
                <div key={idx} className="space-y-1.5 text-center bg-white/5 p-2 rounded-xl border border-white/10">
                  <span className="text-[8px] font-bold text-white/70 block uppercase leading-none truncate">{kpi.label}</span>
                  <span className="text-sm font-black text-[#10b981] block leading-none">{kpi.val}</span>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", kpi.color)} style={{ width: kpi.val }} />
                  </div>
                </div>
              ))}
            </div>

            {/* SAGIA Stamp Banner */}
            <div className="bg-[#e62e2d]/10 p-4 rounded-2xl border-2 border-[#e62e2d]/30 flex items-center gap-4 shadow-sm">
              <div className="w-14 h-14 shrink-0 bg-[#0b1b3d] text-[#e62e2d] flex items-center justify-center border-2 border-[#e62e2d] rounded-xl shadow-md">
                <ShieldCheck size={22} className="text-[#e62e2d]" />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-[11px] font-black text-slate-900 uppercase font-sans leading-tight">Certified MISA Authorized Liaison Desk</h4>
                <p className="text-[10.5px] text-slate-600 font-semibold leading-normal">
                  All corporate formation pathways are legally vetted under active Riyadh Chamber regulations to ensure absolute zero-penalty transitions.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* PAGE FOOTER */}
      <div className="relative z-10 border-t border-slate-300/60 pt-3 flex justify-between items-center text-xs font-bold text-slate-400 font-mono">
        <span>Corporate Profile // KH Dream Services Limited</span>
        <span className="text-[#e62e2d]">Page 04 // Performance Benchmarks & FDI Success Stories</span>
      </div>
    </div>
  );
};

// ==========================================
// 5. REGIONAL NETWORKS SUB-PAGE (White Background)
// ==========================================
interface ProfileLocationsPageProps {
  profile: any;
  isLandscape: boolean;
  getShapeStyle: (shapeType: string) => any;
}

const ProfileLocationsPage: React.FC<ProfileLocationsPageProps> = ({
  profile,
  isLandscape,
  getShapeStyle,
}) => {
  const accTitle = profile.accreditationsTitle || "Institutional Approvals";
  const accSubtitle = profile.accreditationsSubtitle || "Locations & Governance";
  const accList = profile.accreditations && profile.accreditations.length > 0
    ? profile.accreditations
    : [
        { id: "ac1", name: "MISA Approved", code: "MINISTRY OF INVESTMENT" },
        { id: "ac2", name: "Sagia Liaison", code: "SAGIA LIAISON AUTH" }
      ];

  const guarTitle = profile.guaranteeTitle || "Profile Verification Guarantee";
  const guarText = profile.guaranteeText || "All compliance assertions, Ministry authorizations, and visa quotas correspond directly to regulations of Riyadh Chamber & Ministry of Investment.";
  const legalNote = profile.footerNote || "Verified Corporate Document // KHD-PROFILE-2026";

  return (
    <div 
      id="profile-page-5"
      className={cn(
        "a4-page w-full bg-white text-slate-900 shadow-2xl relative flex flex-col justify-between overflow-hidden transition-all duration-300 border border-slate-200 p-8 sm:p-10",
        isLandscape 
          ? "aspect-[297/210] min-h-[210mm]" 
          : "aspect-[210/297] min-h-[297mm]"
      )}
    >
      {/* Premium Custom Page Corner Flap */}
      <div 
        className="absolute top-0 left-0 w-24 h-24 bg-[#e62e2d] z-0 pointer-events-none"
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />
      <div 
        className="absolute top-0 left-0 w-[84px] h-[84px] bg-[#0b1b3d] z-0 pointer-events-none opacity-25"
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />
      
      {/* Absolute Corporate Banner in Minimalist Style */}
      <div className="absolute top-0 left-0 right-0 h-[60px] bg-white z-0 flex items-center justify-between pl-16 pr-8 border-b border-slate-100">
        <div className="flex items-center gap-2 text-[#0b1b3d]">
          <span className="text-xl font-black text-[#e62e2d] font-mono leading-none">05</span>
          <div className="w-[1.5px] h-4 bg-slate-300 mx-1" />
          <span className="text-[11px] font-black tracking-[0.25em] uppercase text-[#0b1b3d]">
            REGIONAL NETWORKS
          </span>
        </div>
        <span className="text-[10px] font-black text-[#e62e2d] uppercase tracking-widest font-sans">
          {accSubtitle}
        </span>
      </div>

      {/* Decorative background center badge watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-[12px] border-[#e62e2d] border-dashed" />
      </div>

      {/* Main content deck */}
      <div className="relative z-10 flex-grow flex flex-col justify-between pt-[70px] pb-3 gap-6">
        
        {isLandscape ? (
          /* ================== LANDSCAPE LAYOUT ================== */
          <div className="grid grid-cols-12 gap-8 items-stretch flex-grow">
            
            {/* Left Column: Physical branch terminals */}
            <div className="col-span-6 flex flex-col justify-between space-y-4">
              <div className="border-l-4 border-[#e62e2d] pl-3">
                <span className="text-[9px] font-black text-[#e62e2d] uppercase block font-mono">REGIONAL NETWORKS</span>
                <h3 className="text-base font-black text-[#0b1b3d] uppercase font-sans">
                  Bilateral Physical Branches
                </h3>
              </div>

              <div className="space-y-4 flex-grow flex flex-col justify-center">
                {[
                  { id: "loc1", name: "Riyadh Head Office", address: "King Fahd Road, Al Olaya District, Riyadh, Kingdom of Saudi Arabia", phone: "966537681618", email: "riyadh@khdreamservices.com" },
                  { id: "loc2", name: "Dhaka Executive Branch", address: "Suite 4B, Road 11, Gulshan-2, Dhaka, Bangladesh", phone: "8801768161823", email: "dhaka@khdreamservices.com" }
                ].map((loc) => (
                  <div key={loc.id} className="p-4 rounded-xl border-2 border-slate-200 bg-white space-y-1.5 relative overflow-hidden shadow-sm hover:border-[#e62e2d]/50 transition-all duration-300">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                      <div className="p-1.5 rounded bg-[#e62e2d] text-white shadow-sm">
                        <MapPin size={12} />
                      </div>
                      <span className="text-xs font-black uppercase text-[#0b1b3d] font-sans">{loc.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">{loc.address}</p>
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10.5px] font-bold text-[#e62e2d] font-mono">
                      <span>Tel: +{loc.phone}</span>
                      <span className="text-right text-slate-400">Email: {loc.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Verified Approvals, stamps and QR (Light themed cards) */}
            <div className="col-span-6 flex flex-col justify-between bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              
              <div className="space-y-3">
                <div className="border-l-4 border-[#e62e2d] pl-3">
                  <span className="text-[9px] font-black text-[#e62e2d] uppercase block font-mono">AFFILIATIONS</span>
                  <h3 className="text-sm font-black text-[#0b1b3d] uppercase font-sans leading-tight">
                    {accTitle}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {accList.map((partner: any) => (
                    <div key={partner.id} className="p-3 rounded-xl border border-slate-200 bg-[#0b1b3d]/5 flex items-center justify-between gap-2 shadow-xs">
                      <div className="space-y-0.5 truncate">
                        <span className="text-[11px] font-black text-[#0b1b3d] uppercase block font-sans leading-none">{partner.name}</span>
                        <span className="text-[8px] font-mono text-[#e62e2d] tracking-wider block leading-none truncate mt-1">{partner.code}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#e62e2d] text-white flex items-center justify-center text-[9px] font-black shrink-0 shadow-inner">
                        KSA
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Certificate Block */}
              <div className="bg-white text-slate-900 p-5 rounded-2xl border-2 border-[#e62e2d] text-center space-y-3 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#0b1b3d] text-[#e62e2d] flex items-center justify-center rounded-bl-3xl shadow-sm border-l border-b border-[#e62e2d]">
                  <FileCheck size={18} />
                </div>
                
                <span className="text-[9px] font-black tracking-widest text-[#0b1b3d] uppercase block font-mono">{guarTitle}</span>
                <p className="text-[11px] leading-relaxed text-slate-600 font-semibold max-w-xs mx-auto">
                  {guarText}
                </p>
                
                <div className="flex justify-center items-center gap-4 pt-1">
                  <VisualBarcode value={profile.barcodeValue} light={false} />
                  <div className="h-10 w-[1px] bg-slate-200" />
                  <div className="flex flex-col items-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(profile.qrCodeUrl)}`}
                      alt="Profile QR"
                      className="w-10 h-10 object-contain p-1 bg-white border border-slate-200 rounded-md"
                      referrerPolicy="no-referrer"
                      id="locations-qr"
                    />
                    <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-1">Verify Digital</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* ================== PORTRAIT LAYOUT ================== */
          <div className="space-y-5 flex-grow flex flex-col justify-between mt-2">
            
            <div className="border-l-4 border-[#e62e2d] pl-4">
              <span className="text-[9px] font-black text-[#e62e2d] uppercase block font-mono">REGIONAL GOVERNANCE</span>
              <h3 className="text-base font-black text-[#0b1b3d] uppercase font-sans leading-tight">
                Physical Branches & Affiliations
              </h3>
            </div>

            {/* Riyadh and Dhaka branch grids */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-sm flex flex-col justify-between hover:border-[#e62e2d]/30 transition-all duration-300">
                <div>
                  <span className="text-[10px] font-black text-[#e62e2d] uppercase font-sans block">Riyadh HQ Terminal</span>
                  <p className="text-[11px] text-slate-600 font-semibold leading-relaxed mt-1">King Fahd Road, Olaya District, Riyadh, Kingdom of Saudi Arabia</p>
                </div>
                <div className="pt-2 border-t border-slate-100 mt-2 text-[10px] font-bold text-slate-400 font-mono">
                  Tel: +966 53 768 1618
                </div>
              </div>
              
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-sm flex flex-col justify-between hover:border-[#e62e2d]/30 transition-all duration-300">
                <div>
                  <span className="text-[10px] font-black text-[#e62e2d] uppercase font-sans block">Dhaka Executive Branch</span>
                  <p className="text-[11px] text-slate-600 font-semibold leading-relaxed mt-1">Suite 4B, Road 11, Gulshan-2, Dhaka, Bangladesh</p>
                </div>
                <div className="pt-2 border-t border-slate-100 mt-2 text-[10px] font-bold text-slate-400 font-mono">
                  Tel: +880 17 6816 1823
                </div>
              </div>
            </div>

            {/* Accreditations Row */}
            <div className="grid grid-cols-2 gap-4">
              {accList.map((partner: any, idx: number) => (
                <div key={idx} className="p-3 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-between shadow-sm">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-black text-[#0b1b3d] uppercase block font-sans leading-none">{partner.name}</span>
                    <span className="text-[7.5px] font-mono text-[#e62e2d] block truncate mt-1 leading-none">{partner.code}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#e62e2d] text-white flex items-center justify-center text-[9px] font-black border border-white/10 shrink-0 shadow-inner">KSA</div>
                </div>
              ))}
            </div>

            {/* Certified Compliance Document Back Shield */}
            <div className="bg-white text-slate-900 p-5 rounded-2xl border-4 border-[#e62e2d] text-center space-y-3.5 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-14 h-14 bg-[#0b1b3d] text-[#e62e2d] flex items-center justify-center rounded-bl-3xl border-l-2 border-b-2 border-[#e62e2d]">
                <ShieldCheck size={18} />
              </div>
              
              <div className="space-y-1">
                <span className="text-[9px] font-black text-[#0b1b3d] uppercase tracking-wider block font-mono">{guarTitle}</span>
                <p className="text-[11px] text-slate-600 font-semibold max-w-xs mx-auto leading-relaxed">
                  {guarText}
                </p>
              </div>

              <div className="h-[1px] bg-slate-200" />

              <div className="flex justify-center items-center gap-6">
                <VisualBarcode value={profile.barcodeValue} light={false} />
                
                <div className="flex items-center gap-2.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(profile.qrCodeUrl)}`}
                    alt="Profile QR"
                    className="w-10 h-10 object-contain p-0.5 bg-white border border-slate-100 rounded-md"
                    referrerPolicy="no-referrer"
                    id="locations-portrait-qr"
                  />
                  <div className="text-left shrink-0">
                    <span className="text-[8px] text-[#0b1b3d] font-black uppercase leading-none block">Corporate QR</span>
                    <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Digital Ledger</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* PAGE FOOTER */}
      <div className="relative z-10 border-t border-slate-200 pt-3 flex justify-between items-center text-xs font-bold text-slate-400 font-mono">
        <span>{legalNote}</span>
        <span className="text-[#e62e2d]">Page 05 // Affiliations, Branches & Endorsement Seal</span>
      </div>
    </div>
  );
};


// ==========================================
// MAIN COMPONENT orchestrator
// ==========================================
export const CompanyProfilePage: React.FC<CompanyProfilePageProps> = ({ onBack }) => {
  const { data } = useCMS();
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('portrait');
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const profile = data.companyProfile || {
    companyName: "KH Dream Services Limited",
    tagline: "Your Visionary Partner in Saudi Business Formation & Luxury Global Travel",
    foundedYear: "2009",
    ceoName: "S.M. Rakibul Hasan",
    logoUrl: "https://i.ibb.co/pjjqSnRF/Logo-23D.png",
    coverUrl: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&q=80&w=1200",
    phone: "966537681618",
    email: "info@khdreamservices.com",
    website: "https://khdreamservices.com",
    address: "Olaya District, King Fahd Road, Riyadh, Saudi Arabia",
    barcodeValue: "KHD-PROFILE-2026",
    qrCodeUrl: "https://khdreamservices.com/company-profile",
    primaryColor: "#0b1b3d",
    secondaryColor: "#e62e2d",
    backgroundColor: "#ffffff",
    textColor: "#1e293b",
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    sections: [],
    stats: [],
    locations: [],
    partners: []
  };

  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const triggerPrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    setShowDownloadModal(true);
  };

  const handleConfirmDownload = () => {
    setShowDownloadModal(false);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Shape style retriever
  const getShapeStyle = (shapeType: string) => {
    switch (shapeType) {
      case 'hexagon':
      case 'rhombus':
      case 'rounded-blob':
      case 'leaf-shape':
        return { borderRadius: '1.25rem' };
      case 'circular-badge':
      case 'ribbon-seal':
        return { borderRadius: '9999px' };
      case 'isometric-card':
      case 'shield-badge':
      case 'default':
        return { borderRadius: '0.75rem' };
      case 'diagonal-slice':
        return { borderRadius: '0px' };
      case 'arch-frame':
        return { borderRadius: '2rem 2rem 0px 0px' };
      default:
        return { borderRadius: '0.75rem' };
    }
  };

  // Safe video embed retriever
  const getCleanEmbedUrl = (url?: string) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
          videoId = match[2];
        }
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
    } catch (e) {
      console.error(e);
    }
    return url;
  };

  // Safe section retriever
  const getSection = (index: number, defaultTitle: string, defaultSubtitle: string, defaultContent: string, defaultImg: string, defaultShape: string) => {
    if (profile.sections && profile.sections[index]) {
      return {
        title: profile.sections[index].title || defaultTitle,
        subtitle: profile.sections[index].subtitle || defaultSubtitle,
        content: profile.sections[index].content || defaultContent,
        image: profile.sections[index].image || defaultImg,
        shapeType: profile.sections[index].shapeType || defaultShape
      };
    }
    return {
      title: defaultTitle,
      subtitle: defaultSubtitle,
      content: defaultContent,
      image: defaultImg,
      shapeType: defaultShape
    };
  };

  const sectionHistory = getSection(0, "Company History & Vision", "Strategic Bridgeholders of Global Ambitions", "Founded in 2009, KH Dream Services Limited has evolved from a boutique administrative agency into Saudi Arabia's preeminent full-service corporate advisory and luxury travel gateway. Over 17 years of operational excellence, we have designed customized compliance-assured frameworks that empower foreign conglomerates, multi-family offices, and global startups to register, operate, and scale seamlessly in the GCC region. We combine deep institutional knowledge of local administrative codes with world-class travel speed.", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800", "diagonal-slice");
  const sectionCEO = getSection(1, "CEO Message", "Corporate Vision under Vision 2030", "Under Vision 2030, Saudi Arabia is experiencing an unprecedented era of economic expansion. Our mission is to pave a seamless, compliance-assured gateway for entrepreneurs and enterprises to establish their presence and thrive in the Kingdom. We combine localized legal intelligence with premium global concierge services, ensuring your travel and corporate setup are executed with absolute discretion and excellence. We do not simply process applications; we secure your legacy in the Kingdom.", "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600", "hexagon");

  const defaultStats = [
    { id: "st1", value: "17+", label: "Years Excellence" },
    { id: "st2", value: "2.5K+", label: "Business Setups" },
    { id: "st3", value: "15K+", label: "Successful Visas" },
    { id: "st4", value: "99.9%", label: "Approval Rate" }
  ];
  const statsList = profile.stats && profile.stats.length > 0 ? profile.stats : defaultStats;

  const isLandscape = orientation === 'landscape';

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 transition-colors duration-500 font-sans pb-24 print:pb-0 print:bg-white">
      
      {/* Top Controller Header - Hidden on Print */}
      <div className="w-full bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 py-4 px-6 sticky top-0 z-50 shadow-md no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-[#0b1b3d] dark:hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Gateway
          </button>
          
          {/* Orientation Toggle Options */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700">
            <button
              onClick={() => setOrientation('landscape')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer",
                isLandscape 
                  ? "bg-white dark:bg-zinc-900 text-[#0b1b3d] dark:text-white shadow-sm font-black" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
              )}
            >
              <div className="w-4 h-3 border-2 border-current rounded-sm flex items-center justify-center text-[8px] font-bold">H</div>
              Landscape Booklet
            </button>
            <button
              onClick={() => setOrientation('portrait')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer",
                !isLandscape 
                  ? "bg-white dark:bg-zinc-900 text-[#0b1b3d] dark:text-white shadow-sm font-black" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
              )}
            >
              <div className="w-3 h-4 border-2 border-current rounded-sm flex items-center justify-center text-[8px] font-bold">V</div>
              Portrait Booklet
            </button>
          </div>
          
          {/* Action buttons with premium styling */}
          <div className="flex items-center gap-3">
            <button 
              onClick={triggerPrint}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Printer size={15} /> Print
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-[#0b1b3d] hover:bg-[#07132b] text-[#e62e2d] border border-[#e62e2d]/40 text-xs font-black uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-[#e62e2d]/5 animate-pulse" />
              <Download size={15} className="group-hover:translate-y-0.5 transition-transform" /> Download PDF (A4)
            </button>
          </div>

        </div>
      </div>

      {/* Screen Mode Banner (Visible only on desktop/screen) */}
      <div className="max-w-[210mm] mx-auto mt-6 px-4 sm:px-0 no-print">
        <div className="bg-[#0b1b3d] border-2 border-[#e62e2d] text-white p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
          {/* Background decoration inside card */}
          <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="p-2.5 rounded-xl bg-[#e62e2d]/15 text-[#e62e2d] border border-[#e62e2d]/30 shadow-inner">
              <Sparkles size={22} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#e62e2d] font-sans">KHD Executive Brochure Generator</h4>
              <p className="text-[11px] text-white/80 font-semibold leading-normal max-w-lg mt-0.5">
                Generate a multi-page, vector-quality PDF dossier formatted perfectly for A4 printing. Verified by the Saudi Ministry of Investment Liaison Desk.
              </p>
            </div>
          </div>
          <button 
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto bg-[#e62e2d] hover:bg-[#c52120] text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0 relative z-10"
          >
            <Download size={15} /> Save PDF Now
          </button>
        </div>
      </div>

      {/* Main Container - Wraps the printable A4 sheet deck */}
      <div 
        className={cn(
          "mx-auto mt-6 px-4 sm:px-0 flex flex-col gap-10 select-none transition-all duration-300 print:gap-0 print:mt-0 print:px-0 print:shadow-none print:border-none",
          isLandscape ? "max-w-[297mm]" : "max-w-[210mm]"
        )}
      >
        
        {/* PAGE 1: COVER & EXECUTIVE DESK */}
        <ProfileCoverPage 
          profile={profile}
          isLandscape={isLandscape}
          setActiveVideo={setActiveVideo}
          getCleanEmbedUrl={getCleanEmbedUrl}
          getShapeStyle={getShapeStyle}
          sectionCEO={sectionCEO}
        />

        {/* PAGE 2: WHO WE ARE */}
        <ProfileIdentityPage 
          profile={profile}
          isLandscape={isLandscape}
          getShapeStyle={getShapeStyle}
          sectionHistory={sectionHistory}
          statsList={statsList}
        />

        {/* PAGE 3: PREMIUM SERVICES */}
        <ProfileServicesPage 
          profile={profile}
          isLandscape={isLandscape}
          getShapeStyle={getShapeStyle}
        />

        {/* PAGE 4: CASE STUDIES */}
        <ProfileCaseStudiesPage 
          profile={profile}
          isLandscape={isLandscape}
          getShapeStyle={getShapeStyle}
        />

        {/* PAGE 5: LOCATIONS & GOVERNANCE */}
        <ProfileLocationsPage 
          profile={profile}
          isLandscape={isLandscape}
          getShapeStyle={getShapeStyle}
        />

      </div>

      {/* Floating Action Button - Download PDF (Always visible on screen scroll) */}
      <div className="fixed bottom-6 right-6 z-40 no-print">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2.5 bg-[#0b1b3d] hover:bg-[#07132b] text-[#e62e2d] border-2 border-[#e62e2d] font-black text-xs uppercase tracking-widest px-6 py-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
          title="Download Corporate Profile PDF"
        >
          <div className="relative">
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 z-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e62e2d] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e62e2d]"></span>
            </span>
            <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
          </div>
          <span>Download PDF (A4)</span>
        </button>
      </div>

      {/* Interactive Video Overlay Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 no-print"
          >
            <div className="w-full max-w-4xl aspect-video bg-zinc-950 rounded-2xl overflow-hidden relative shadow-2xl border border-zinc-800/50">
              <button 
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
              <iframe 
                src={activeVideo}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download PDF Helpful Instructions Modal */}
      <AnimatePresence>
        {showDownloadModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 no-print"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-zinc-800/80 overflow-hidden"
            >
              <div className="p-6 space-y-4 text-slate-900 dark:text-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-[#0b1b3d]/10 text-[#0b1b3d] border border-[#0b1b3d]/20">
                      <Info size={20} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider font-sans text-slate-900 dark:text-white leading-none">
                        PDF Save Instruction
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        A4 Vector Grade Resolution
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDownloadModal(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="h-[1px] bg-slate-100 dark:bg-zinc-800/60" />

                <div className="space-y-3 text-xs font-medium">
                  <p className="text-slate-500 dark:text-zinc-400 leading-relaxed text-[11px]">
                    To save this 5-page booklet as a flawless digital PDF with perfect formatting and high-res vector graphics:
                  </p>
                  
                  <div className="space-y-2.5 bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-slate-100 dark:border-zinc-800/40 font-semibold text-[10.5px]">
                    <div className="flex gap-2">
                      <span className="text-primary font-black">1.</span>
                      <span>Set Destination in print panel to <strong className="text-slate-900 dark:text-white font-black">"Save as PDF"</strong>.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary font-black">2.</span>
                      <span>Ensure Layout matches selected style: <strong className="text-[#0b1b3d] dark:text-[#e62e2d] font-black uppercase">{orientation}</strong>.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary font-black">3.</span>
                      <span>Set margins to <strong className="text-slate-900 dark:text-white font-black">"None"</strong> to print edge-to-edge full bleed.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary font-black">4.</span>
                      <span>Ensure <strong className="text-slate-900 dark:text-white font-black">"Background graphics"</strong> checkbox is checked.</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowDownloadModal(false)}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 dark:border-zinc-700 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-black uppercase py-3 rounded-xl transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDownload}
                    className="flex-1 bg-[#0b1b3d] hover:bg-[#07132b] text-[#e62e2d] border border-[#e62e2d]/30 text-xs font-black uppercase py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-center"
                  >
                    Proceed to PDF Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Print Layout Styling Overrides */}
      <style>{`
        @media print {
          @page {
            size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
            margin: 0 !important;
          }
          body {
            background: white !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, nav, footer, header, .floating-actions, #whatsapp-widget, .privacy-popup, .visitor-coupon {
            display: none !important;
          }
          .a4-page {
            width: ${isLandscape ? '297mm' : '210mm'} !important;
            height: ${isLandscape ? '210mm' : '297mm'} !important;
            margin: 0 auto !important;
            padding: ${isLandscape ? '10mm' : '12mm'} !important;
            page-break-after: always !important;
            break-after: page !important;
            border: none !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            background-color: #ffffff !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Preserve branding colors on printer grids */
          .bg-[#0b1b3d] {
            background-color: #0b1b3d !important;
            background: #0b1b3d !important;
            color: white !important;
          }
          .bg-[#faf9f6] {
            background-color: #f8fafc !important;
            background: #f8fafc !important;
          }
          .text-[#e62e2d] {
            color: #e62e2d !important;
          }
          .text-[#10b981] {
            color: #10b981 !important;
          }
          
          /* Force page break gaps to prevent multi-page leaking */
          #profile-page-1 {
            page-break-before: avoid !important;
          }
          #profile-page-2 {
            page-break-before: always !important;
          }
          #profile-page-3 {
            page-break-before: always !important;
          }
          #profile-page-4 {
            page-break-before: always !important;
          }
          #profile-page-5 {
            page-break-before: always !important;
          }
        }
      `}</style>
    </div>
  );
};
