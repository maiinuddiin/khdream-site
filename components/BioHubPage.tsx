import React, { useState, useEffect, useMemo } from 'react';
import { useCMS, BioHubSocial, BioHubBranch, BioHubService, BioHubFAQ, BioHubData } from '../context/CMSContext';
import { 
  Facebook, Instagram, Youtube, Twitter, Linkedin, Link2, 
  ChevronDown, ChevronUp, Mail, Phone, MessageCircle, MapPin, 
  Share2, CheckCircle, Check, Globe, ArrowLeft, ExternalLink, Star, 
  Clock, Building2, HelpCircle, ArrowRight, Sparkles, Send, Languages, X,
  FileText, ArrowDownRight, Video, Bookmark, Palette, Save, Map, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BioHubPageProps {
  onBack?: () => void;
}

// Curated beautiful background scenery presets
const backgroundPresets = [
  {
    id: 'blue-gradient',
    name: 'Standard Corporate Sky',
    url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#3b82f6',
    previewColor: '#bfdbfe'
  },
  {
    id: 'riyadh-sky',
    name: 'Riyadh Executive Sunset',
    url: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#10b981',
    previewColor: '#a7f3d0'
  },
  {
    id: 'makkah-spiritual',
    name: 'Spiritual Haram Sacred',
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#f59e0b',
    previewColor: '#fde68a'
  },
  {
    id: 'golden-desert',
    name: 'Sand Dunes Wilderness',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#f97316',
    previewColor: '#fed7aa'
  },
  {
    id: 'modern-abstract',
    name: 'Wanderlust Blue Ocean',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#6366f1',
    previewColor: '#c7d2fe'
  },
  {
    id: 'oasis-palm',
    name: 'Al-Ahsa Green Palm Oasis',
    url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#22c55e',
    previewColor: '#bbf7d0'
  }
];

// Curated natural translation dictionary with warm, professional local vibes for predefined texts
const uiTranslations = {
  en: {
    back: "Return to Homepage",
    share: "Share Profile",
    copied: "Link Copied!",
    verified: "Official Profile",
    callAdmin: "Call Main Office",
    whatsapp: "WhatsApp Support",
    mailSupport: "Email Support",
    primarySocials: "Connect with Us on Social Media",
    branches: "Our Offices & Live Helplines",
    viewDetails: "View Details",
    services: "🏷️ EXCLUSIVE TRAVEL & BUSINESS PACKAGES",
    faqs: "💬 FREQUENTLY ASKED QUESTIONS (FAQ)",
    premiumSolutions: "VIP & Business Solutions",
    featuredService: "Highly Recommended",
    fixedRate: "Estimated Price",
    otherServices: "Other Active Services",
    noServices: "No active packages listed at this moment.",
    operatingHours: "Working Hours",
    callHotline: "Call Branch Helpline",
    whatsappHub: "WhatsApp Support",
    noLocations: "No branch locations configured.",
    secureInquiry: "Direct InquiryDesk",
    inquiryDesc: "Have questions about Visas, Umrah, or Saudi Company Registration? Write to us, we respond quickly.",
    fullName: "Your Full Name",
    emailAddr: "Email Address",
    writeMsg: "Describe your travel or business requirement...",
    sendInquiry: "Submit Inquiry Message",
    successMsg: "Message received successfully! One of our travel consultants will connect with you via WhatsApp/Phone very shortly.",
    allRightsReserved: "All Rights Reserved",
    langCode: "en",
    dir: "ltr" as const,
    branchDetailsTitle: "Office Location & Helplines",
    manager: "Contact Person / Manager",
    address: "Location Address",
    phone: "Direct Voice Call",
    whatsappNum: "WhatsApp Chat Hotline",
    mapLocation: "Get Google Map Directions",
    close: "Close details",
    connectedStatus: "Connected & Active Support",
    clickBranchHint: "Select an office below to instantly update the live satellite routing map next to it!",
    getMapDirections: "Open on Google Maps App",
    backgroundChanger: "🎨 Custom Backdrop Customizer",
    applyBg: "Change Backdrop View",
    saveDefaultBg: "Save Backdrop in Database (Admin)",
    saving: "Saving...",
    savedSuccess: "Successfully saved background in database!",
    officeMapTitle: "🗺️ Integrated Global Offices Location Map",
    activeMapTextPlaceholder: "Active GPS coordinates showing",
    networkDirectory: "🌐 Active Social Network Directory",
    profilePreview: "📱 Live Smartphone Hub Preview",
    unlockContent: "Share profile link to easily access exclusive packages!",
    newsletterTitle: "SUBSCRIPTION TO NEWSLETTER",
    premiumBadge: "PREMIUM ACTIVE",
    connectProfileBtn: "Connect Profile",
    connectedVerified: "Connected Profile",
    contactHeading: "Instant Touch Helpline Desk"
  },
  bn: {
    back: "মূল পেইজে ফিরুন",
    share: "প্রোফাইল শেয়ার করুন",
    copied: "লিংক কপি হয়েছে!",
    verified: "অফিসিয়াল প্রোফাইল",
    callAdmin: "সরাসরি হেড অফিসে কল করুন",
    whatsapp: "হোয়াটসঅ্যাপ হেল্পডেস্ক",
    mailSupport: "ইমেইল সাপোর্ট",
    primarySocials: "সোশ্যাল মিডিয়ায় আমাদের সাথে যুক্ত হোন",
    branches: "আমাদের সক্রিয় অফিস ও হেল্পলাইনসমূহ",
    viewDetails: "ঠিকানা ও যোগাযোগের বিবরণ",
    services: "🏷️ আকর্ষণীয় ট্রাভেল ও বিজনেস প্যাকেজ সমূহ",
    faqs: "💬 সাধারণ জিজ্ঞাসা ও উত্তর (FAQ)",
    premiumSolutions: "ভিআইপি ও বিজনেস সলিউশন",
    featuredService: "স্পেশাল অফার",
    fixedRate: "আনুমানিক খরচ",
    otherServices: "অন্যান্য সক্রিয় সেবা সমূহ",
    noServices: "এই মুহূর্তে কোনো প্যাকেজ বা সেবা তালিকাভুক্ত নেই।",
    operatingHours: "অফিসের সময়সূচী",
    callHotline: "হেল্পলাইনে সরাসরি কল করুন",
    whatsappHub: "হোয়াটসঅ্যাপ সাপোর্ট",
    noLocations: "কোনো শাখা অফিস সংযুক্ত নেই।",
    secureInquiry: "নিরাপদ ইনকোয়ারি ডেস্ক",
    inquiryDesc: "ভিসা প্রসেসিং, ওমরাহ অথবা সৌদি আরবে কোম্পানি নিবন্ধন নিয়ে কোনো প্রশ্ন থাকলে নিচে লিখুন। আমরা খুব দ্রুত উত্তর দেব।",
    fullName: "আপনার নাম",
    emailAddr: "ইমেইল অ্যাড্রেস",
    writeMsg: "আপনার ভ্রমণ বা প্রয়োজনীয় সেবার বিবরণ দিন...",
    sendInquiry: "আজই ইনকোয়ারি সাবমিট করুন",
    successMsg: "ইনকোয়ারি বার্তা সফলভাবে পাঠানো হয়েছে! খুব দ্রুত আমাদের একজন কনসালটেন্ট সরাসরি ফোন অথবা হোয়াটসঅ্যাপে আপনার সাথে যোগাযোগ করবেন।",
    allRightsReserved: "সর্বস্বত্ব সংরক্ষিত",
    langCode: "bn",
    dir: "ltr" as const,
    branchDetailsTitle: "অফিসের বিবরণ ও যোগাযোগের নম্বর",
    manager: "দায়িত্বপ্রাপ্ত কর্মকর্তা",
    address: "ঠিকানা",
    phone: "সরাসরি ফোন কল",
    whatsappNum: "হোয়াটসঅ্যাপ চ্যাট",
    mapLocation: "গুগল ম্যাপ রুট ও ডিরেকশন",
    close: "বন্ধ করুন",
    connectedStatus: "সংযুক্ত ও হেল্পলাইন সচল",
    clickBranchHint: "লাইভ স্যাটেলাইট ম্যাপে অবস্থান ও ডিরেকশন দেখতে নিচের যেকোনো অফিসে ক্লিক করুন!",
    getMapDirections: "গুগল ম্যাপস অ্যাপে দেখুন",
    backgroundChanger: "🎨 কাস্টম ব্যাকগ্রাউন্ড ও থিম চয়নকারী",
    applyBg: "ব্যাকগ্রাউন্ড পরিবর্তন করুন",
    saveDefaultBg: "ডাটাবেজে ব্যাকগ্রাউন্ডটি সংরক্ষণ করুন (অ্যাডমিন)",
    saving: "সংরক্ষণ হচ্ছে...",
    savedSuccess: "ডাটাবেজে সফলভাবে থিম ব্যাকগ্রাউন্ড সেভ হয়েছে!",
    officeMapTitle: "🗺️ ইন্টিগ্রেটেড গ্লোবাল অফিস লোকেশন ম্যাপ",
    activeMapTextPlaceholder: "সক্রিয় জিপিএস কোঅর্ডিনেটস ম্যাপে প্রদর্শিত হচ্ছে",
    networkDirectory: "🌐 সক্রিয় সোশ্যাল নেটওয়ার্ক ডিরেক্টরি",
    profilePreview: "📱 লাইভ স্মার্টফোন প্রোফাইল প্রিভিউ",
    unlockContent: "এক্সক্লুসিভ অফারগুলো আনলক করতে এই লিংকটি শেয়ার করুন!",
    newsletterTitle: "নিউজলেটার সাবস্ক্রিপশন",
    premiumBadge: "প্রিমিয়াম সক্রিয়",
    connectProfileBtn: "কানেক্ট প্রোফাইল",
    connectedVerified: "সংযুক্ত প্রোফাইল",
    contactHeading: "সরাসরি যোগাযোগ ও ইনকোয়ারি হেল্পলাইন"
  }
};

// Curated translations matrix for initial database default texts
const dynamicTranslations: { [key: string]: { en: string; bn: string } } = {
  "KH Dream Services": {
    en: "KH Dream Services",
    bn: "কেএইচ ড্রিম সার্ভিসেস"
  },
  "Your Gateway to Saudi Arabia & Luxury Travel Solutions": {
    en: "Your Gateway to Saudi Arabia & Luxury Travel Solutions",
    bn: "সৌদি আরব এবং লাক্সারি ট্রাভেল সলিউশনের জন্য আপনার বিশ্বস্ত গেটওয়ে"
  },
  "9:00 AM - 6:00 PM (Sat - Thu)": {
    en: "9:00 AM - 6:00 PM (Sat - Thu)",
    bn: "সকাল ৯:০০ - সন্ধ্যা ৬:০০ (শনিবার - বৃহস্পতিবার)"
  },
  "Official Facebook Page": { en: "Official Facebook Page", bn: "ফেসবুক পেজ" },
  "Exclusive Instashots": { en: "Exclusive Instashots", bn: "ইনস্টাগ্রাম অ্যাকাউন্ট" },
  "Watch Vlog on TikTok": { en: "Watch Vlog on TikTok", bn: "টিকটক ভ্লগ চ্যানেল" },
  "Direct Support WhatsApp": { en: "Direct Support WhatsApp", bn: "সহায়তা হোয়াটসঅ্যাপ" },
  "Subscribe YouTube Channel": { en: "Subscribe YouTube Channel", bn: "ইউটিউব চ্যানেল" },
  "Riyadh Head Office": {
    en: "Riyadh Head Office",
    bn: "রিয়াদ প্রধান কার্যালয়"
  },
  "Olaya District, King Fahd Road, Riyadh, Saudi Arabia": {
    en: "Olaya District, King Fahd Road, Riyadh, Saudi Arabia",
    bn: "ওলায়া জেলা, কিং ফাহদ রোড, রিয়াদ, সৌদি আরব"
  },
  "Dhaka Executive Office": {
    en: "Dhaka Executive Office",
    bn: "ঢাকা প্রিমিয়ার এক্সিকিউটিভ অফিস"
  },
  "Gulshan-2, Dhaka, Bangladesh": {
    en: "Gulshan-2, Dhaka, Bangladesh",
    bn: "গুলশান-২, ঢাকা, বাংলাদেশ"
  },
  "10:00 AM - 7:00 PM (Sun - Thu)": {
    en: "10:00 AM - 7:00 PM (Sun - Thu)",
    bn: "সকাল ১০:০০ - সন্ধ্যা ৭:০০ (রবিবার - বৃহস্পতিবার)"
  },
  "Corporate": { en: "Corporate Setting", bn: "কর্পোরেট সেবা" },
  "Tourism": { en: "Luxury Tourism", bn: "পর্যটন ও উমরাহ" },
  "Visas": { en: "Visa Clearance", bn: "ভিসা ও রেসিডেন্সি" },
  "Saudi Business Setup Consultancy": {
    en: "Saudi Business Setup Consultancy",
    bn: "সৌদি বাণিজ্য এবং কোম্পানি সেটআপ কনসালটেন্সি"
  },
  "End-to-end commercial trade licensing, office setup, & sponsorship clearance inside the Kingdom of Saudi Arabia.": {
    en: "End-to-end commercial trade licensing, office setup, & sponsorship clearance inside the Kingdom of Saudi Arabia.",
    bn: "সৌদি আরবে বিনিয়োগ লাইসেন্স, কমার্শিয়াল ট্রেড লাইসেন্সিং, স্পন্সরশিপ এবং অফিস স্থাপনের যাবতীয় সাপোর্ট।"
  },
  "Premium Umrah Exclusive Package": {
    en: "Premium Umrah Exclusive Package",
    bn: "উমরাহ প্রিমিয়াম এক্সক্লুসিভ প্যাকেজ"
  },
  "VIP group and individual reservations with 5-star hotel towers close to Makkah/Madinah Haram, including private land transfers.": {
    en: "VIP group and individual reservations with 5-star hotel towers close to Makkah/Madinah Haram, including private land transfers.",
    bn: "মক্কা ও মদিনার অত্যন্ত কাছে অবস্থিত ৫-স্টার হোটেল বুকিং, ভিআইপি যাতায়াত কনভয় এবং বিমান বুকিং সেবা।"
  },
  "General Residency & Visa Advisory": {
    en: "General Residency & Visa Advisory",
    bn: "রেসিডেন্সি ভিসা ও প্রফেশনাল ইমিগ্রেশন কনসালটেন্সি"
  },
  "Expert consultation for Saudi Premium Residency (KSA Gold Visa), investor, family visit visas, and document legalizations.": {
    en: "Expert consultation for Saudi Premium Residency (KSA Gold Visa), investor, family visit visas, and document legalizations.",
    bn: "সৌদি আরব প্রিমিয়াম গোল্ডেন রেসিডেন্সি, বিনিয়োগকারী ভিসা এবং আন্তর্জাতিক ডকুমেন্ট এটেস্টেশন সেবা।"
  },
  "Starting $2,500": { en: "Starting $2,500", bn: "শুরু $২,৫০০ থেকে" },
  "Request Quote": { en: "Request Quote", bn: "কোটেশন পাঠান" },
  "$1,500 / Prep": { en: "$1,500 / Prep", bn: "$১,৫০০ ফাইল ফি" },
  "How long does it take to register a foreign company in Saudi Arabia?": {
    en: "How long does it take to register a foreign company in Saudi Arabia?",
    bn: "সৌদি আরবে একটি বিদেশী বা নতুন কোম্পানি নিবন্ধন করতে কত সময় লাগে?"
  },
  "Normally, setting up a company and registering with MISA takes between 2 to 4 weeks, depending on the commercial license type and ministry clearances.": {
    en: "Normally, setting up a company and registering with MISA takes between 2 to 4 weeks, depending on the commercial license type and ministry clearances.",
    bn: "বাণিজ্যিক লাইসেন্সের ধরন এবং সংশ্লিষ্ট ছাড়পত্রের ওপর নির্ভর করে সৌদি বিনিয়োগ মন্ত্রণালয় (MISA) এর সাথে কোম্পানি নিবন্ধন সম্পূর্ণ হতে আনুমানিক ২ থেকে ৪ সপ্তাহ সময় লাগে।"
  },
  "Can you arrange custom family visit and tourist packages?": {
    en: "Can you arrange custom family visit and tourist packages?",
    bn: "আপনারা কি কাস্টম ফ্যামিলি ভিজিট এবং ট্যুরিস্ট ট্রাভেল ডিল বা প্যাকেজ তৈরি করতে পারেন?"
  },
  "Yes! Our team crafts custom tourism solutions, arranging premium accommodation, luxury land transportation, tour guides, and fast visa approvals.": {
    en: "Yes! Our team crafts custom tourism solutions, arranging premium accommodation, luxury land transportation, tour guides, and fast visa approvals.",
    bn: "হ্যাঁ! আমাদের স্পেশাল ডেক্স কাস্টম বুকিং, বিলাসবহুল গাড়ি সুবিধা, দক্ষ গাইড এবং অতি দ্রুততম সময়ে ফ্যামিলি ভিজিট ভিসা সংক্রান্ত যাবতীয় কাজ সমাধান করে থাকে।"
  }
};

const translateText = (text: string | undefined | null, _lang: 'en' | 'bn' = 'en'): string => {
  if (!text) return '';
  const trimmed = text.trim();
  
  if (trimmed.includes('|')) {
    const parts = trimmed.split('|');
    return parts[0]?.trim() || '';
  }
  
  return text;
};

const BioHubPage: React.FC<BioHubPageProps> = ({ onBack }) => {
  const { data, updateData, saveChanges } = useCMS();
  const lang = 'en';
  const t = uiTranslations.en;

  const bio: BioHubData = data.bioHub || {
    companyName: "KH Dream Services",
    tagline: "Your Gateway to Saudi Arabia & Luxury Travel Solutions",
    logoUrl: "https://i.ibb.co/pjjqSnRF/Logo-23D.png",
    coverUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e293b",
    backgroundColor: "linear-gradient(to bottom, #f8fafc, #edf2f7)",
    textColor: "#1e293b",
    glassEffect: true,
    whatsappNumber: "966537681618",
    phoneNumber: "966537681618",
    emailAddress: "info@khdreamservices.com",
    businessHours: "9:00 AM - 6:00 PM (Sat - Thu)",
    seo: {
      metaTitle: "KH Dream Services - Link-in-Bio",
      metaDescription: "Your Gateway to Saudi Arabia & Luxury Travel Solutions",
      ogImage: ""
    },
    analytics: {
      visitorsCount: 0,
      qrScansCount: 0,
      clicksCount: {},
      buttonClicks: {
        whatsapp: 0,
        call: 0,
        saveContact: 0,
        share: 0
      }
    },
    socials: [],
    branches: [],
    services: [],
    faqs: [],
    testimonials: []
  };

  // Setup Default Branches List & merge physical offices defined in Main CMS Data
  const defaultBranchesList: BioHubBranch[] = useMemo(() => {
    const customBranches = bio.branches || [];
    const physicalOffices = (data.offices || []).map((o: any) => ({
      id: `office-ref-${o.id}`,
      name: `${o.name}${o.city ? ` (${o.city})` : ''}`,
      manager: "Branch Team",
      phone: o.phone || bio.phoneNumber || "966537681618",
      whatsapp: o.phone ? o.phone.replace(/[^0-9]/g, '') : (bio.whatsappNumber ? bio.whatsappNumber.replace(/[^0-9]/g, '') : "966537681618"),
      email: bio.emailAddress || "info@khdreamservices.com",
      address: o.address || "Saudi Arabia",
      locationUrl: o.mapUrl || "https://maps.google.com",
      workingHours: o.hours || o.workingHours || "9:00 AM - 6:00 PM (Sat - Thu)",
      imageUrl: o.iconUrl || "",
      views: 0
    }));

    const combined = [...customBranches, ...physicalOffices];

    if (combined.length === 0) {
      return [
        { 
          id: "b1", 
          name: "Riyadh Head Office", 
          manager: "Kazi Shofi", 
          phone: "966537681618", 
          whatsapp: "966537681618", 
          email: "riyadh@khdreamservices.com", 
          address: "Olaya District, King Fahd Road, Riyadh, Saudi Arabia", 
          locationUrl: "https://maps.google.com/?q=Olaya,Riyadh,Saudi+Arabia", 
          workingHours: "9:00 AM - 6:00 PM (Sat - Thu)", 
          imageUrl: "",
          views: 12
        },
        { 
          id: "b2", 
          name: "Dhaka Executive Office", 
          manager: "Hasan Ahmed", 
          phone: "8801700000000", 
          whatsapp: "8801700000001", 
          email: "dhaka@khdreamservices.com", 
          address: "Gulshan-2, Dhaka, Bangladesh", 
          locationUrl: "https://maps.google.com/?q=Gulshan-2,Dhaka,Bangladesh", 
          workingHours: "10:00 AM - 7:00 PM (Sun - Thu)", 
          imageUrl: "",
          views: 7
        }
      ];
    }
    return combined;
  }, [bio.branches, bio.phoneNumber, bio.whatsappNumber, bio.emailAddress, data.offices]);

  // Initialize selectedBranch to state which defaults to first branch in list
  const [selectedBranchState, setSelectedBranchState] = useState<BioHubBranch | null>(null);
  const selectedBranch = selectedBranchState || defaultBranchesList[0] || {} as BioHubBranch;
  const setSelectedBranch = (branch: BioHubBranch) => setSelectedBranchState(branch);
  const [showAllPins, setShowAllPins] = useState<boolean>(true);

  // Resolved long urls for short Google Maps URLs to extract coordinates dynamically
  const [resolvedMapUrls, setResolvedMapUrls] = useState<Record<string, string>>({});

  // Stable tracking of branch URLs to prevent infinite fetches
  const branchUrlsString = useMemo(() => {
    return JSON.stringify(defaultBranchesList.map(b => ({ id: b.id, url: b.locationUrl, name: b.name })));
  }, [defaultBranchesList]);

  useEffect(() => {
    try {
      const branches = JSON.parse(branchUrlsString);
      branches.forEach((branch: any) => {
        const url = branch.url?.trim();
        if (url && (url.includes("maps.app.goo.gl") || url.includes("goo.gl/maps"))) {
          fetch(`/api/resolve-maps-url?url=${encodeURIComponent(url)}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.resolvedUrl) {
                setResolvedMapUrls(prev => ({
                  ...prev,
                  [branch.id]: data.resolvedUrl
                }));
                console.log(`[MAPS RESOLVING] Successfully resolved short url for ${branch.name}: ${data.resolvedUrl}`);
              }
            })
            .catch(err => {
              console.error(`[MAPS RESOLVING] Error resolving map url:`, err);
            });
        }
      });
    } catch (e) {
      console.error("Error parsing branch URLs:", e);
    }
  }, [branchUrlsString]);

  // Dynamic background image computed directly from CMS config
  const currentBg = bio.coverUrl || backgroundPresets[0].url;

  const [savingBg, setSavingBg] = useState(false);
  const [saveNotifier, setSaveNotifier] = useState<string | null>(null);

  const [openedFaq, setOpenedFaq] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Local message box state variables
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  // REAL TELEMETRY ANALYTICS SYNCHRONIZER
  useEffect(() => {
    const hasVisitedSess = sessionStorage.getItem('kh_dream_visited_profile');
    const isFromQR = new URLSearchParams(window.location.search).get('ref') === 'qr' || window.location.href.includes('source=qr');
    
    const timer = setTimeout(() => {
      const initialAnalytics = bio.analytics || {
        visitorsCount: 0,
        qrScansCount: 0,
        clicksCount: {},
        buttonClicks: { whatsapp: 0, call: 0, saveContact: 0, share: 0 }
      };

      let changed = false;
      const analyticsCopy = {
        ...initialAnalytics,
        buttonClicks: {
          whatsapp: initialAnalytics.buttonClicks?.whatsapp || 0,
          call: initialAnalytics.buttonClicks?.call || 0,
          saveContact: initialAnalytics.buttonClicks?.saveContact || 0,
          share: initialAnalytics.buttonClicks?.share || 0
        }
      };

      if (!hasVisitedSess) {
        sessionStorage.setItem('kh_dream_visited_profile', 'true');
        analyticsCopy.visitorsCount = (analyticsCopy.visitorsCount || 0) + 1;
        changed = true;
      }

      if (isFromQR && !sessionStorage.getItem('kh_dream_visited_qr')) {
        sessionStorage.setItem('kh_dream_visited_qr', 'true');
        analyticsCopy.qrScansCount = (analyticsCopy.qrScansCount || 0) + 1;
        changed = true;
      }

      if (changed) {
        updateData((prev) => {
          const currentBio = prev.bioHub || bio;
          return {
            bioHub: {
              ...currentBio,
              analytics: analyticsCopy
            }
          };
        });
        saveChanges();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // TELEMETRY BUTTON CLICK RECOGNITION WIDGET
  const trackAnalyticsClick = (type: 'whatsapp' | 'call' | 'saveContact' | 'share') => {
    const initialAnalytics = bio.analytics || {
      visitorsCount: 0,
      qrScansCount: 0,
      clicksCount: {},
      buttonClicks: { whatsapp: 0, call: 0, saveContact: 0, share: 0 }
    };

    const updatedButtonClicks = {
      whatsapp: initialAnalytics.buttonClicks?.whatsapp || 0,
      call: initialAnalytics.buttonClicks?.call || 0,
      saveContact: initialAnalytics.buttonClicks?.saveContact || 0,
      share: initialAnalytics.buttonClicks?.share || 0,
      [type]: ((initialAnalytics.buttonClicks?.[type]) || 0) + 1
    };

    updateData((prev) => {
      const currentBio = prev.bioHub || bio;
      return {
        bioHub: {
          ...currentBio,
          analytics: {
            ...initialAnalytics,
            buttonClicks: updatedButtonClicks
          }
        }
      };
    });
    saveChanges();
  };

  const triggerCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    trackAnalyticsClick('share');
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlatformIconStyles = (platform: string) => {
    const val = platform.toLowerCase();
    switch (val) {
      case 'facebook':
        return {
          bg: 'bg-[#1877F2]',
          icon: <Facebook size={18} fill="currentColor" className="text-white shrink-0" />
        };
      case 'instagram':
        return {
          bg: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
          icon: <Instagram size={18} className="text-white shrink-0" />
        };
      case 'youtube':
        return {
          bg: 'bg-[#FF0000]',
          icon: <Youtube size={18} fill="currentColor" className="text-white shrink-0" />
        };
      case 'twitter':
      case 'x':
        return {
          bg: 'bg-black',
          icon: <Twitter size={18} fill="currentColor" className="text-white shrink-0" />
        };
      case 'linkedin':
        return {
          bg: 'bg-[#0A66C2]',
          icon: <Linkedin size={18} fill="currentColor" className="text-white shrink-0" />
        };
      case 'whatsapp':
        return {
          bg: 'bg-[#25D366]',
          icon: <MessageCircle size={18} fill="currentColor" className="text-white shrink-0" />
        };
      case 'mail':
      case 'email':
        return {
          bg: 'bg-[#EA4335]',
          icon: <Mail size={18} fill="currentColor" className="text-white shrink-0" />
        };
      default:
        return {
          bg: 'bg-[#3b82f6]',
          icon: <Link2 size={18} className="text-white shrink-0" />
        };
    }
  };

  const getQueryFromLocationUrl = (branch: BioHubBranch) => {
    const rawUrl = resolvedMapUrls[branch.id] || branch.locationUrl || '';
    if (!rawUrl) return null;
    try {
      const url = rawUrl.trim();
      const placeMatch = url.match(/\/place\/([^\/]+)/);
      if (placeMatch && placeMatch[1]) {
        return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      }
      const searchMatch = url.match(/\/search\/([^\/]+)/);
      if (searchMatch && searchMatch[1]) {
        return decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
      }
      const qParameterMatch = url.match(/[?&]q=([^&]+)/);
      if (qParameterMatch && qParameterMatch[1]) {
        return decodeURIComponent(qParameterMatch[1].replace(/\+/g, ' '));
      }
    } catch (e) {
      console.error("Error parsing location link:", e);
    }
    return null;
  };

  const getSingleBranchSearchText = (branch: BioHubBranch) => {
    const rawUrl = resolvedMapUrls[branch.id] || branch.locationUrl || '';
    if (!rawUrl || rawUrl === "https://maps.google.com") {
      return branch.address || branch.name;
    }
    const url = rawUrl.trim();
    if (url.includes('<iframe') && url.includes('src=')) {
      const srcMatch = url.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) return srcMatch[1];
    }
    const extracted = getQueryFromLocationUrl(branch);
    if (extracted) return extracted;
    const coordMatch = url.match(/@([0-9.-]+),([0-9.-]+)/);
    if (coordMatch) return `${coordMatch[1]},${coordMatch[2]}`;
    
    // Check if the url looks like latitude,longitude directly
    const isCoordinates = /^[+-]?[0-9.]+,\s*[+-]?[0-9.]+$/.test(url);
    if (isCoordinates) {
      return url;
    }

    if (!url.startsWith('http')) return url;
    return branch.address || branch.name;
  };

  const getGoogleMapsEmbedUrl = (branch: BioHubBranch | 'all') => {
    if (branch === 'all') {
      if (defaultBranchesList.length > 0) {
        return getGoogleMapsEmbedUrl(defaultBranchesList[0]);
      }
      return `https://maps.google.com/maps?q=Saudi%20Arabia&t=&z=10&ie=UTF8&iwloc=&output=embed`;
    }

    const rawUrl = resolvedMapUrls[branch.id] || branch.locationUrl || '';
    const url = rawUrl.trim();

    if (url && url !== "https://maps.google.com") {
      // 1. Check if it's full iframe code and extract the src attribute
      if (url.includes('<iframe') && url.includes('src=')) {
        const srcMatch = url.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) {
          return srcMatch[1];
        }
      }

      // 2. Check if it is already an embed URL
      if (url.includes('/maps/embed') || url.includes('output=embed')) {
        return url;
      }

      // 3. If it looks like raw coordinates "lat,lng" (e.g. "24.6853,46.7324")
      const isCoordinates = /^[+-]?[0-9.]+,\s*[+-]?[0-9.]+$/.test(url);
      if (isCoordinates) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }

      // 4. Try extracting coordinate match from Google Maps web link (like @24.6853,46.7324) FIRST
      // This is crucial for exact pinpoint accuracy.
      const coordMatch = url.match(/@([0-9.-]+),([0-9.-]+)/);
      if (coordMatch) {
        const coords = `${coordMatch[1]},${coordMatch[2]}`;
        const placeMatch = url.match(/\/place\/([^\/]+)/);
        if (placeMatch && placeMatch[1]) {
          const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
          return `https://maps.google.com/maps?q=${encodeURIComponent(`${coords} (${placeName})`)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
        }
        return `https://maps.google.com/maps?q=${encodeURIComponent(coords)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
      }

      // 5. Try parsing Google Maps web link to find a search term
      const mapQuery = getQueryFromLocationUrl(branch);
      if (mapQuery) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
    }

    // Default Fallback
    // Let's first use the branch.address if it is detailed, or fall back to name!
    let query = '';
    if (branch.address && branch.address.trim().length > 5) {
      query = branch.address;
    } else {
      query = branch.name || "Olaya District, King Fahd Road, Riyadh, Saudi Arabia";
    }

    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const getServiceIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('visa') || cat.includes('residency') || cat.includes('passport')) {
      return <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={20} />;
    }
    if (cat.includes('setup') || cat.includes('business') || cat.includes('corporate') || cat.includes('company')) {
      return <Building2 className="text-blue-600 dark:text-blue-400" size={20} />;
    }
    if (cat.includes('umrah') || cat.includes('makkah') || cat.includes('hajj') || cat.includes('spiritual')) {
      return <Star className="text-amber-500" size={20} />;
    }
    return <Globe className="text-sky-600 dark:text-sky-400" size={20} />;
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName.trim() || !feedbackEmail.trim() || !feedbackMsg.trim()) {
      return;
    }

    setSubmittingInquiry(true);

    const newMessage = {
      id: `bio_${Date.now()}_` + Math.random().toString(36).substr(2, 9),
      name: feedbackName,
      email: feedbackEmail,
      senderId: feedbackEmail,
      senderName: feedbackName,
      recipientId: 'admin',
      subject: `Query from Hub Connect Profile`,
      message: feedbackMsg,
      content: feedbackMsg,
      receivedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      read: false,
      replied: false,
      status: 'unread',
      type: 'internal' as const
    };

    try {
      // 1. Submit email via backend
      await fetch('/api/bio-hub/submit-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: feedbackName,
          email: feedbackEmail,
          message: feedbackMsg
        })
      });
    } catch (err) {
      console.error("Failed to forward inquiry email through backend SMTP:", err);
    }

    // 2. Always persist details in CMS DB
    const updatedMessages = [newMessage, ...(data.messages || [])];
    updateData({ messages: updatedMessages as any });
    saveChanges();

    setSubmittingInquiry(false);
    setFeedbackSent(true);
    setFeedbackName('');
    setFeedbackEmail('');
    setFeedbackMsg('');
    setTimeout(() => setFeedbackSent(false), 8000);
  };

  const servicesList = (bio.services || []).filter((s: BioHubService) => s.enabled !== false);
  const featuredServices = servicesList.filter((s: BioHubService) => s.featured);
  const normalServices = servicesList.filter((s: BioHubService) => !s.featured);

  const displaySocials: BioHubSocial[] = bio.socials && bio.socials.length > 0 ? bio.socials : [
    { id: "s1", platform: "Facebook", label: "Official Facebook Page", url: "https://facebook.com/khdreamservices", iconName: "Facebook", enabled: true, order: 0 },
    { id: "s2", platform: "Instagram", label: "Exclusive Instashots", url: "https://instagram.com/khdreamservices", iconName: "Instagram", enabled: true, order: 1 },
    { id: "s11", platform: "LinkedIn", label: "Official Company LinkedIn", url: "https://linkedin.com", iconName: "Linkedin", enabled: true, order: 2 },
    { id: "s4", platform: "WhatsApp", label: "Direct Support WhatsApp", url: "https://wa.me/966537681618", iconName: "MessageCircle", enabled: true, order: 3 },
    { id: "s5", platform: "Twitter", label: "Twitter Handles Feed", url: "https://twitter.com", iconName: "Twitter", enabled: true, order: 4 },
    { id: "s6", platform: "YouTube", label: "Vlogs Tutorials channel", url: "https://youtube.com", iconName: "Youtube", enabled: true, order: 5 }
  ];

  const opacityVal = (bio.bgOpacity !== undefined ? bio.bgOpacity : 50) / 100;

  const cardThemeMode = bio.cardThemeMode || 'dark';
  const cardOpacity = bio.cardOpacity !== undefined ? bio.cardOpacity : 100;
  const isLightCard = cardThemeMode === 'light';

  // Compile inline styles with solid flat colors for perfect readability
  const glassCardStyle = {
    backgroundColor: isLightCard ? '#ffffff' : '#18181b', // pure flat white or flat zinc-900
  };
  
  const textTitleClass = isLightCard ? 'text-slate-900 border-b border-slate-100' : 'text-zinc-100 border-b border-zinc-800/60';
  const plainTextTitleClass = isLightCard ? 'text-slate-900' : 'text-zinc-100';
  const textSecClass = isLightCard ? 'text-slate-705 font-medium' : 'text-zinc-300 font-medium';

  // Custom Admin Section Titles with solid fallback values
  const socialsTitle = bio.socialsTitle || "Connect with Us";
  const officesTitle = bio.officesTitle || "Our Offices";
  const servicesTitle = bio.servicesTitle || "Exclusive Travel & Business Packages";
  const servicesSubtitle = bio.servicesSubtitle || "VIP & Business Solutions";
  const faqsTitle = bio.faqsTitle || "Frequently Asked Questions (FAQ)";
  const inquiryTitle = bio.inquiryTitle || "Direct Portal Inquiry Desk";
  const inquirySubtitle = bio.inquirySubtitle || "Have questions about Visas, Umrah, or Saudi Company Registration? Write to us, we respond quickly.";
  const inquiryReferenceText = bio.inquiryReferenceText || "Consular Desk Ref: KH-HUB-SECURE";

  const textMutedClass = isLightCard ? 'text-slate-400 font-bold' : 'text-zinc-500 font-bold';
  const borderDividerClass = isLightCard ? 'border-slate-100' : 'border-zinc-800/50';
  const glassCardBorderClass = isLightCard 
    ? 'border border-slate-200/70 bg-white rounded-3xl p-6 shadow-xs relative' 
    : 'border border-zinc-800/80 bg-zinc-900 rounded-3xl p-6 relative';

  const rootContainerClass = isLightCard 
    ? 'min-h-screen relative font-sans text-slate-800 bg-[#f8fafc] flex flex-col justify-start overflow-x-hidden select-text transition-all duration-350'
    : 'min-h-screen relative font-sans text-zinc-100 bg-zinc-950 flex flex-col justify-start overflow-x-hidden select-text transition-all duration-350';

  return (
    <div 
      className={rootContainerClass}
    >
      {/* Fallback Font Styles for Perfect Multilingual Rendering (English & Bangla) */}
      <style>{`
        .bio-hub-root, .bio-hub-root input, .bio-hub-root textarea {
          font-family: 'Inter', 'Hind Siliguri', 'Noto Sans Bengali', system-ui, -apple-system, sans-serif !important;
        }
      `}</style>
      
      {/* CRISP DYNAMIC FULL-PAGE BACKGROUND IMAGE - Kept only at very low opacity if explicitly used */}
      {currentBg && opacityVal > 0 && (
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none transition-all duration-500 z-0"
          style={{ 
            backgroundImage: `url(${currentBg})`,
            opacity: isLightCard ? opacityVal * 0.3 : opacityVal * 0.5
          }}
        />
      )}
      
      {/* Minimal flat single-color backdrop booster */}
      {!isLightCard && <div className="fixed inset-0 bg-zinc-950/40 pointer-events-none z-0" />}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-themed z-35" />

      {/* Global Header Row - Centered, Responsive layout widths */}
      <header className="relative w-full max-w-xl lg:max-w-6xl mx-auto px-4 pt-6 pb-2 z-20 flex justify-between items-center select-none gap-2">
        {onBack ? (
          <button 
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs font-black text-slate-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            id="back-to-home-btn"
          >
            <ArrowLeft size={13} className="text-primary" /> {t.back}
          </button>
        ) : <div />}

        <button 
          type="button"
          onClick={triggerCopy}
          className="px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs font-black text-slate-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          id="profile-share-btn"
        >
          {copied ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
              <CheckCircle size={13} /> {t.copied}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Share2 size={13} className="text-primary" /> {t.share}
            </span>
          )}
        </button>
      </header>

      {/* Main Container - Responsive full width Layout on PC & Smartphone flow on mobile */}
      <main className="w-full max-w-xl lg:max-w-6xl mx-auto px-4 pb-20 pt-3 z-15 flex-grow bio-hub-root">
        
        <div className="space-y-6">
          
          {/* CUSTOMIZABLE EMERGENCY ALERT NOTIFICATION BAR (FLAT & EYE CATCHY) */}
          {(bio.alertShow !== false && bio.alertContent) && (
            (() => {
              const color = bio.alertColor || 'red';
              const colorStyleMap = {
                red: {
                  bg: 'bg-red-500/[0.04] dark:bg-red-500/[0.06] hover:bg-red-500/[0.07]',
                  border: 'border-red-500/20 dark:border-red-500/20',
                  text: 'text-red-600 dark:text-red-400',
                  badgeBg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                  pingBg: 'bg-red-500'
                },
                amber: {
                  bg: 'bg-amber-500/[0.04] dark:bg-amber-500/[0.06] hover:bg-amber-500/[0.07]',
                  border: 'border-amber-500/20 dark:border-amber-500/20',
                  text: 'text-amber-600 dark:text-amber-400',
                  badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                  pingBg: 'bg-amber-500'
                },
                blue: {
                  bg: 'bg-blue-500/[0.04] dark:bg-blue-500/[0.06] hover:bg-blue-500/[0.07]',
                  border: 'border-blue-500/20 dark:border-blue-500/20',
                  text: 'text-blue-600 dark:text-blue-400',
                  badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                  pingBg: 'bg-blue-500'
                },
                emerald: {
                  bg: 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] hover:bg-emerald-500/[0.07]',
                  border: 'border-emerald-500/20 dark:border-emerald-500/20',
                  text: 'text-emerald-600 dark:text-emerald-400',
                  badgeBg: 'bg-emerald-500/10 text-emerald-605 dark:text-emerald-400 border-emerald-500/20',
                  pingBg: 'bg-emerald-500'
                }
              };
              const style = colorStyleMap[color as keyof typeof colorStyleMap] || colorStyleMap.red;
              return (
                <div className={`p-4 ${style.bg} border ${style.border} rounded-xl transition-all duration-300 relative overflow-hidden backdrop-blur-md flex flex-col md:flex-row items-start md:items-center gap-3.5 shadow-sm`}>
                  {/* Flat clean layout with accent badge */}
                  <div className="flex items-center gap-2.5 shrink-0 select-none">
                    <span className="text-base">📢</span>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${style.badgeBg} flex items-center gap-1.5`}>
                      <span className="flex h-1.5 w-1.5 relative">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${style.pingBg} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${style.pingBg}`}></span>
                      </span>
                      {translateText(bio.alertTitle || "Alert", lang)}
                    </span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-[11px] text-slate-700 dark:text-neutral-205 font-extrabold leading-relaxed">
                      {translateText(bio.alertContent, lang)}
                    </p>
                  </div>
                </div>
              );
            })()
          )}

          {/* PC View Wide Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN - Bio profile, socials, and support hotlines */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* 1. BRANDING & BIOGRAPHY DISPLAY CARD (Premium Glass presentation) */}
              <section 
                style={glassCardStyle}
                className={`${glassCardBorderClass} text-center space-y-4 relative overflow-hidden`}
                id="brand-header-matte"
              >
                 {/* Profile Avatar Emblem */}
                <div className="relative inline-block mx-auto group">
                  <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-zinc-700 relative pointer-events-none">
                    {(() => {
                      const finalLogoUrl = bio.logoUrl || data.general?.logoUrl;
                      if (finalLogoUrl) {
                        return (
                          <img 
                            src={finalLogoUrl} 
                            alt={translateText(bio.companyName, lang)}
                            className="w-full h-full object-contain p-1.5"
                            referrerPolicy="no-referrer"
                          />
                        );
                      }
                      return <div className="text-3xl text-slate-400 font-black">KH</div>;
                    })()}
                  </div>
                  <span className="absolute bottom-0.5 right-1 w-5 h-5 bg-gradient-to-tr from-sky-500 to-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white select-none pointer-events-none">
                    ✓
                  </span>
                </div>

                {/* Title & Slogan */}
                <div className="space-y-1.5 max-w-lg mx-auto">
                  <h1 className={`text-xl font-extrabold tracking-tight uppercase flex items-center justify-center gap-1.5 ${plainTextTitleClass}`}>
                    <span>{translateText(bio.companyName, lang)}</span>
                  </h1>
                  <p className={`text-xs font-black tracking-wide leading-relaxed ${textSecClass}`}>
                    {translateText(bio.tagline, lang)}
                  </p>
                </div>

                {/* Flat elegant spacer */}
                <div className={`w-12 h-[1px] mx-auto ${borderDividerClass}`} />
              </section>

              {/* 2. SOCIALS & DIRECTORY PANEL (Premium Glass) */}
              <section 
                style={glassCardStyle}
                className={`${glassCardBorderClass} space-y-6`}
              >
                <div className={`flex justify-between items-center pb-2 ${borderDividerClass}`}>
                  <h3 className={`text-xs font-black uppercase tracking-wider ${plainTextTitleClass}`}>
                    {translateText(socialsTitle, lang)}
                  </h3>
                </div>

                {/* Premium Grid of Socials */}
                <div className="grid grid-cols-4 gap-2.5">
                  {displaySocials
                    .filter((social) => social.enabled !== false)
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((social) => {
                      const style = getPlatformIconStyles(social.platform);
                      return (
                        <a
                          key={social.id}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-slate-50 dark:bg-zinc-800/65 hover:bg-slate-100 dark:hover:bg-zinc-750 border border-slate-200/60 dark:border-zinc-700/50 rounded-xl text-center flex flex-col items-center justify-center gap-2 transition-colors duration-200 cursor-pointer"
                        >
                          <div className={`w-9 h-9 rounded-full ${social.iconUrl ? 'bg-transparent overflow-hidden' : style.bg} flex items-center justify-center`}>
                            {social.iconUrl ? (
                              <img 
                                src={social.iconUrl} 
                                alt={social.platform} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer" 
                              />
                            ) : (
                              React.cloneElement(style.icon, { size: 15 })
                            )}
                          </div>
                          <span className={`font-black text-[9px] block truncate max-w-full leading-normal ${textSecClass}`}>
                            {social.platform}
                          </span>
                        </a>
                      );
                    })}
                </div>
              </section>

              {/* HELPLINE & BRANCH CONTACT NUMBERS SECTION */}
              <section 
                style={glassCardStyle}
                className={`${glassCardBorderClass} space-y-4`}
              >
                <div className={`pb-2 flex justify-between items-center ${borderDividerClass}`}>
                  <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${plainTextTitleClass}`}>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Branch Contact Hotlines</span>
                  </h3>
                  <span className="text-[10px] text-primary font-black uppercase">Direct Connect</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {defaultBranchesList.map((branch) => {
                    const isSelectedOnMap = selectedBranch.id === branch.id && !showAllPins;
                    return (
                      <div 
                        key={branch.id} 
                        onClick={() => {
                          setSelectedBranch(branch);
                          setShowAllPins(false);
                          const mapElement = document.getElementById('quick-live-map-container');
                          if (mapElement && window.innerWidth < 1024) {
                            mapElement.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        title="Click to view live directions map"
                        className={`flex items-center justify-between p-3 border rounded-xl hover:border-blue-500/30 transition-all gap-3 cursor-pointer ${
                          isSelectedOnMap 
                            ? 'bg-blue-600/[0.04] dark:bg-blue-500/[0.04] border-blue-500/40 dark:border-blue-500/30' 
                            : 'bg-slate-50/50 dark:bg-zinc-900/30 border-slate-150 dark:border-zinc-800/80 hover:bg-slate-100/50 dark:hover:bg-zinc-800/30'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-[11px] font-extrabold uppercase ${plainTextTitleClass} truncate flex items-center gap-1.5`}>
                            <span>{translateText(branch.name, lang)}</span>
                            {isSelectedOnMap && (
                              <span className="inline-block w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse shrink-0" />
                            )}
                          </h4>
                          <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5 select-all font-semibold">
                            {branch.phone}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {branch.phone && (
                            <a
                              href={`tel:${branch.phone}`}
                              className="p-2 bg-gradient-themed hover:brightness-110 text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                              title="Call Helpline"
                            >
                              <Phone size={12} />
                            </a>
                          )}
                          {branch.whatsapp && (
                            <a
                              href={`https://wa.me/${branch.whatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all flex items-center justify-center cursor-pointer"
                              title="WhatsApp Chat"
                            >
                              <MessageCircle size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 6. REDESIGNED DIRECT INQUIRY OFFICE CASE LODGER */}
              <section id="quick-inquiry-container" className="w-[100%] animate-fadeIn">
                <div 
                  style={glassCardStyle}
                  className={`${glassCardBorderClass} p-6 flex flex-col justify-between relative overflow-hidden`}
                >
                  {/* Visual glowing border accent */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-500" />

                  <div>
                    <div className={`pb-3 mb-4 items-start text-left border-b ${borderDividerClass}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/10 flex items-center justify-center">
                          <span className="text-blue-500 text-sm">📬</span>
                        </div>
                        <div>
                          <h4 className={`text-xs md:text-sm font-black uppercase tracking-tight ${plainTextTitleClass}`}>
                            {translateText(inquiryTitle, lang)}
                          </h4>
                          <span className="text-[8px] font-black tracking-widest text-[#00A86B] uppercase block">Secure Broadcast Channel</span>
                        </div>
                      </div>
                      <p className={`text-[10px] font-semibold mt-2 leading-relaxed ${textSecClass}`}>
                        {translateText(inquirySubtitle, lang)}
                      </p>
                    </div>

                    {/* Topic Smart Selector Pills */}
                    <div className="space-y-1.5 mb-4 text-left">
                      <label className={`text-[8.5px] uppercase tracking-wider font-extrabold block ${textMutedClass}`}>
                        Select Case Theme (Quick Fill)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: '🕋 Umrah Visa', msg: 'Hello KHT, I want to book an Umrah Package with hotel accommodation and ground transport transfers of high quality. Please contact.' },
                          { name: '🛂 Visa Processing', msg: 'Hi KH, I want to process a tourist/family visit visa invitation. Please list requirements & prices.' },
                          { name: '✈️ Flight Tickets', msg: 'Hello KHT Team, I am looking to book return flight tickets for Saudi Arabia. Please coordinate options.' },
                          { name: '🏢 Company Setup', msg: 'Hello KH Dream Services, I am looking to establish a company registry setup in Riyadh, Saudi Arabia. Please coordinate the procedure.' },
                          { name: '📞 General Help', msg: 'Hello KH Travels, I have a general query regarding travel services. Please secure feedback call.' }
                        ].map((t) => {
                          const isSel = selectedTopic === t.name;
                          return (
                            <button
                              type="button"
                              key={t.name}
                              onClick={() => {
                                setSelectedTopic(t.name);
                                setFeedbackMsg(t.msg);
                              }}
                              className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${
                                isSel 
                                  ? 'bg-blue-600 text-white shadow-sm' 
                                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-805/40'
                              }`}
                            >
                              {t.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {!feedbackSent ? (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-4 font-bold text-left text-[10.5px]">
                        <div className="space-y-1">
                          <label className={`text-[9px] uppercase tracking-wider font-extrabold block ${textMutedClass}`}>Your Full Name</label>
                          <input 
                            type="text" 
                            value={feedbackName}
                            onChange={(e) => setFeedbackName(e.target.value)}
                            placeholder="e.g. Kazi Shofi"
                            required
                            disabled={submittingInquiry}
                            className="w-full bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/80 focus:border-blue-500 focus:bg-white focus:text-slate-900 focus:outline-none rounded-xl py-3 px-3.5 focus:ring-4 focus:ring-blue-500/10 text-[11px] transition-all duration-200 shadow-sm font-semibold placeholder:text-slate-400 text-inherit"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className={`text-[9px] uppercase tracking-wider font-extrabold block ${textMutedClass}`}>Email Address</label>
                          <input 
                            type="email" 
                            value={feedbackEmail}
                            onChange={(e) => setFeedbackEmail(e.target.value)}
                            placeholder="e.g. yourname@domain.com"
                            required
                            disabled={submittingInquiry}
                            className="w-full bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/80 focus:border-blue-500 focus:bg-white focus:text-slate-900 focus:outline-none rounded-xl py-3 px-3.5 focus:ring-4 focus:ring-blue-500/10 text-[11px] transition-all duration-200 shadow-sm font-semibold placeholder:text-slate-400 text-inherit"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className={`text-[9px] uppercase tracking-wider font-extrabold block ${textMutedClass}`}>Inquiry Case Details</label>
                          <textarea 
                            value={feedbackMsg}
                            onChange={(e) => setFeedbackMsg(e.target.value)}
                            placeholder="Describe your travel setup, iqama status, or business requirements here in detail..."
                            rows={4}
                            required
                            disabled={submittingInquiry}
                            className="w-full bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/80 focus:border-blue-500 focus:bg-white focus:text-slate-900 focus:outline-none rounded-xl py-3 px-3.5 focus:ring-4 focus:ring-blue-500/10 resize-none text-[11px] transition-all duration-200 shadow-sm font-semibold placeholder:text-slate-400 text-inherit"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submittingInquiry}
                          className={`w-full py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md select-none border border-transparent ${
                            submittingInquiry 
                              ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg shadow-blue-500/10 active:scale-[0.98]'
                          }`}
                        >
                          {submittingInquiry ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin shrink-0" />
                              <span>Securing Connection...</span>
                            </>
                          ) : (
                            <>
                              <Send size={11} className="shrink-0 text-white" />
                              <span>Submit Inquiry Case</span>
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <div className="py-8 px-5 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20 rounded-2xl text-center font-bold text-[11px] leading-relaxed animate-fade-in space-y-2 flex flex-col items-center">
                        <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center text-lg shadow-md animate-bounce">
                          ✓
                        </div>
                        <span className="uppercase text-[9px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 block pt-1">Inquiry Dispatched</span>
                        <p className="max-w-[280px] leading-relaxed mx-auto text-slate-600 dark:text-zinc-350">
                          Your query case has been safely sent to <strong>khdreamservices.aziziyah@gmail.com</strong> (and registered in the master dashboard queue). A consultant will reply soon!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Reference indicator line */}
                  {inquiryReferenceText && (
                    <div className="pt-3.5 mt-4 border-t border-slate-200/50 dark:border-zinc-800/10 text-[8px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest text-center">
                      {inquiryReferenceText}
                    </div>
                  )}
                </div>
              </section>

            </div>

            {/* RIGHT COLUMN - Pinpoint Satellite Maps, Redesigned Premium Packages, and Interactive Inquiry desks */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* 3. MULTI-OFFICE LIVE PINPOINT MAPS & ADDRESSES */}
              <section 
                id="quick-live-map-container"
                className="space-y-5 animate-fadeIn"
              >
                <div className={`pb-3.5 border-b ${borderDividerClass} text-left`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg">
                      🗺️ GPS Coordinates
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg animate-pulse">
                      ● Unified Interactive Map
                    </span>
                  </div>
                  <h3 className={`text-sm md:text-base font-black uppercase tracking-tight mt-2.5 ${plainTextTitleClass}`}>
                    {translateText(officesTitle, lang)}
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-400 mt-1">
                    Explore all our branch offices on a single, unified mapping pinpoint driver. Toggle branches above or click to load custom satellite overlays.
                  </p>
                </div>

                {/* SINGLE INTERACTIVE MASTER MAP */}
                <div 
                  style={glassCardStyle}
                  className={`${glassCardBorderClass} p-5 rounded-[28px] shadow-xl transition-all duration-300 relative overflow-hidden group space-y-4`}
                >
                  {/* Branch Selectors Row inside Map Card */}
                  <div className="flex flex-wrap items-center gap-2 pb-2">
                    <button
                      onClick={() => setShowAllPins(true)}
                      className={`px-3 py-1.5 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                        showAllPins 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                          : 'bg-slate-100/80 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      🗺️ All Offices
                    </button>
                    {defaultBranchesList.map((branchItem, idx) => {
                      const isSelected = !showAllPins && selectedBranch.id === branchItem.id;
                      return (
                        <button
                          key={branchItem.id}
                          onClick={() => {
                            setSelectedBranch(branchItem);
                            setShowAllPins(false);
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                              : 'bg-slate-100/80 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          📍 {idx + 1}. {translateText(branchItem.name, lang)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Exactly One Master Iframe Frame */}
                  <div className="w-full h-[320px] rounded-2xl overflow-hidden bg-slate-150 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-808 relative shadow-inner">
                    <iframe
                      title="Unified Interactive Office Pinpoint Map"
                      src={getGoogleMapsEmbedUrl(showAllPins ? 'all' : selectedBranch)}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0 w-full h-full grayscale-[10%] dark:grayscale-[25%] dark:invert-[90%] dark:hue-rotate-[180deg]"
                    />
                  </div>

                  {/* Active Selected Office (or summary of all if 'All' is active) details overlay */}
                  <div className="p-4 bg-slate-50/60 dark:bg-zinc-900/40 rounded-2xl border border-slate-150/60 dark:border-zinc-800/60 text-left">
                    {showAllPins ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded">
                            Collective Directory Overview
                          </span>
                          <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded animate-pulse">
                            {defaultBranchesList.length} Active Outposts
                          </span>
                        </div>
                        <p className={`text-[11px] font-semibold ${textSecClass} leading-relaxed`}>
                          Currently showing entire office telemetry pins mapping. Click a specific location tab above to instantly pinpoint real-time directions!
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">
                            📍 Live Selected Pinpoint
                          </span>
                          <h4 className={`text-xs md:text-sm font-black uppercase tracking-wide leading-tight ${plainTextTitleClass}`}>
                            {translateText(selectedBranch.name, lang)}
                          </h4>
                          <p className={`text-[10.5px] font-semibold leading-relaxed ${textSecClass}`}>
                            🏢 {translateText(selectedBranch.address, lang)}
                          </p>
                          {selectedBranch.workingHours && (
                            <div className="flex items-center gap-1.5 text-[9.5px]">
                              <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wider">Duty Timings:</span>
                              <span className={`${plainTextTitleClass} font-bold`}>{translateText(selectedBranch.workingHours, lang)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 shrink-0">
                          {selectedBranch.phone && (
                            <a
                              href={`tel:${selectedBranch.phone}`}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                            >
                              <Phone size={10} />
                              <span>Voice Call</span>
                            </a>
                          )}
                          {selectedBranch.whatsapp && (
                            <a
                              href={`https://wa.me/${selectedBranch.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi KHT Branch Team, I see your location in ${selectedBranch.name}. Please connect.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                            >
                              <MessageCircle size={10} />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          {selectedBranch.locationUrl && selectedBranch.locationUrl !== "https://maps.google.com" && (
                            <a
                              href={selectedBranch.locationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-amber-500 hover:bg-amber-605 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md active:scale-95 transition-all font-sans"
                            >
                              <MapPin size={10} className="text-white animate-bounce" />
                              <span>Directions Pin</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* 5. REDESIGNED LUXURY SERVICE CATALOGUE / PACKAGES */}
              <section id="packages-section" className="space-y-5">
                  <div className={`pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b ${borderDividerClass}`}>
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full tracking-widest">
                        🌟 Dream Packages
                      </span>
                      <h3 className={`text-sm md:text-base font-black uppercase tracking-tight ${plainTextTitleClass}`}>
                        {translateText(servicesTitle, lang)}
                      </h3>
                      <p className={`text-[10px] font-semibold text-slate-400 dark:text-slate-400`}>
                        {translateText(servicesSubtitle, lang)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    {/* Combined Services Stream */}
                    {servicesList.map((srv) => {
                      const getFallbackServiceImage = (category: string, name: string) => {
                        const cat = (category || '').toLowerCase() + " " + (name || '').toLowerCase();
                        if (cat.includes('umrah') || cat.includes('makkah') || cat.includes('madinah')) {
                          return "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format&fit=crop&w=800&q=80";
                        }
                        if (cat.includes('visa') || cat.includes('residency') || cat.includes('immigration')) {
                          return "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80";
                        }
                        if (cat.includes('setup') || cat.includes('business') || cat.includes('corporate') || cat.includes('company')) {
                          return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80";
                        }
                        return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";
                      };

                      const srvImg = srv.imageUrl || getFallbackServiceImage(srv.category, srv.name);

                      return (
                        <div 
                          key={srv.id}
                          style={glassCardStyle}
                          className={`${glassCardBorderClass} p-4.5 flex flex-col justify-between rounded-2xl hover:translate-y-[-2px] transition-all duration-205 group border border-slate-200 dark:border-zinc-800/80 overflow-hidden relative`}
                        >
                          <div className="space-y-4">
                            {/* Featured Image block */}
                            <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden mb-1 border border-slate-100 dark:border-zinc-800 select-none">
                              <img 
                                src={srvImg} 
                                alt={srv.name} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                              />
                              <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                                <span className="text-[8px] font-black uppercase tracking-wider bg-black/70 text-white backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                                  {translateText(srv.category, lang)}
                                </span>
                              </div>
                              <div className="absolute top-2.5 right-2.5">
                                <span className="text-[7.5px] font-black uppercase text-amber-500 bg-black/75 backdrop-blur-md border border-amber-500/20 px-2.5 py-1 rounded-md flex items-center gap-1">
                                  <Star size={8} className="text-amber-500 fill-amber-500" />
                                  <span>{srv.featured ? 'Bestseller' : 'Active Pass'}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-3 items-start text-left">
                              <div className="w-9 h-9 rounded-lg bg-blue-600/5 dark:bg-blue-500/10 border border-blue-500/10 flex items-center justify-center shrink-0 shadow-3xs text-blue-600 dark:text-blue-400 font-bold">
                                {getServiceIcon(srv.category || '')}
                              </div>
                              <div className="space-y-1 flex-1 min-w-0">
                                <h4 className={`text-xs md:text-sm font-black uppercase tracking-wide leading-snug ${plainTextTitleClass} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
                                  {translateText(srv.name, lang)}
                                </h4>
                                <p className={`text-[10px] sm:text-[10.5px] leading-relaxed ${textSecClass}`}>
                                  {translateText(srv.description, lang)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Price rate and action buttons */}
                          <div className="mt-4 pt-3 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-zinc-800/50">
                            <div className="text-left">
                              <span className="text-[7px] uppercase tracking-wider font-extrabold text-slate-400 block leading-none">Rate Option</span>
                              <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-450 mt-0.5 block leading-none">
                                {translateText(srv.price, lang)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 font-bold">
                              <button
                                type="button"
                                onClick={() => {
                                  const trg = srv.name;
                                  setSelectedTopic(trg);
                                  setFeedbackMsg(`Hi KH Travels, I'm specifically interested in booking the "${trg}" package. Please send me the pricing, itinerary breakdown, and document checklist.`);
                                  const eqBox = document.getElementById('quick-inquiry-container');
                                  if (eqBox) {
                                    eqBox.scrollIntoView({ behavior: 'smooth' });
                                  }
                                }}
                                className="bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-805 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-750 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-3xs"
                              >
                                ✍️ Inquire
                              </button>
                              <a 
                                href={`https://wa.me/${bio.whatsappNumber || '966537681618'}?text=${encodeURIComponent(`Hi KH Dream Travels, I am extremely interested in your Bio-Hub premium package: "${srv.name}". Please provide details.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-500 hover:bg-emerald-650 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                              >
                                <span>WhatsApp</span>
                                <ArrowRight size={9} className="text-white" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {servicesList.length === 0 && (
                      <div className="text-center py-10 bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-3xl">
                        <HelpCircle className="mx-auto text-slate-400 mb-2" size={24} />
                        <p className="text-xs font-extrabold text-slate-400">No active categories listed at this moment.</p>
                      </div>
                    )}
                  </div>
                </section>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default BioHubPage;
