import React, { createContext, useContext, useState, useEffect } from 'react';
import rawCmsData from '../data/cms_data.json';

export const APP_CACHE_VERSION = "2026.09.01.v9";

export type UserRole = 'Admin' | 'Manager' | 'Staff';

export interface UserPermission {
  key: string;
  label: string;
}

export const AVAILABLE_PERMISSIONS: UserPermission[] = [
  { key: 'wall', label: 'My Wall' },
  { key: 'blog', label: 'Blog Writing' },
  { key: 'invoices', label: 'Invoices & Companies' },
  { key: 'sadad-invoices', label: 'Quick Receipts' },
  { key: 'catalogue', label: 'Destinations' },
  { key: 'reviews', label: 'Client Reviews' },
  { key: 'promo', label: 'Promotions' },
  { key: 'hero', label: 'Hero Slides' },
  { key: 'service-cards', label: 'Service Cards' },
  { key: 'subscribers', label: 'Subscribers' },
  { key: 'general', label: 'Site Settings' },
  { key: 'services', label: 'Services' },
  { key: 'footer-popups', label: 'Footer Popups' },
  { key: 'team', label: 'Team Members' },
  { key: 'users', label: 'User Accounts' },
  { key: 'landing-pages', label: 'Landing Pages' },
  { key: 'custom-popups', label: 'Popup Modals' },
  { key: 'navbar', label: 'Navbar Menu' },
  { key: 'broadcast', label: 'Email Broadcasting' },
  { key: 'system-config', label: 'System Variables' },
  { key: 'notifications', label: 'Emergency Alerts' },
  { key: 'subdomains', label: 'Domain Settings' },
  { key: 'floating-cards', label: 'Floating Info' },
  { key: 'home-blocks', label: 'Home Page Control' },
  { key: 'security', label: 'Security Protocols' },
  { key: 'partners', label: 'Scrolling Partners' },
  { key: 'faqs', label: 'FAQ Section' },
  { key: 'mailbox', label: 'Internal Mailbox' },
];

export interface LandingPageBlock {
  id: string;
  type: string;
  content: any;
  parentId?: string;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  slot?: string;
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    fontSize?: string;
    fontWeight?: string;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    padding?: string;
    margin?: string;
    borderRadius?: string;
    borderWidth?: string;
    borderColor?: string;
    borderStyle?: string;
    boxShadow?: string;
    opacity?: number;
    zIndex?: number;
    objectFit?: 'cover' | 'contain' | 'fill';
    aspectRatio?: string;
    lineHeight?: string;
    letterSpacing?: string;
    transform?: string;
    width?: string;
    height?: string;
    color?: string;
    // Hero/CTA specific
    titleColor?: string;
    subtitleColor?: string;
    titleSize?: string;
    subtitleSize?: string;
  };
  animation?: {
    type?: 'none' | 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'zoomOut';
    duration?: number;
    delay?: number;
    once?: boolean;
  };
}

export interface BackgroundConfig {
  color?: string;
  gradient?: string;
  image?: string;
  imageOpacity?: number;
  imageFit?: 'cover' | 'contain';
  pattern?: 'none' | 'lines' | 'grid' | 'waves' | 'circles' | 'geometric';
  patternOpacity?: number;
  enabledLayers?: ('color' | 'gradient' | 'image' | 'pattern')[];
}

export interface LandingPageSection {
  id: string;
  title: string;
  order: number;
  settings: {
    backgroundColor?: string;
    backgroundGradient?: string;
    backgroundImage?: string;
    backgroundImageOpacity?: number;
    backgroundPattern?: 'none' | 'lines' | 'grid' | 'waves' | 'circles' | 'geometric';
    backgroundPatternOpacity?: number;
    backgroundType?: 'color' | 'gradient' | 'image' | 'pattern';
    backgroundConfig?: BackgroundConfig;
    glassEffect?: boolean;
    blurAmount?: string;
    textColor?: string;
    paddingTop?: string;
    paddingBottom?: string;
    fullWidth?: boolean;
    containerWidth?: 'max-w-7xl' | 'max-w-5xl' | 'max-w-3xl' | 'full';
  };
  blocks: LandingPageBlock[];
}

export interface LandingPageSEO {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  description?: string;
  seo?: LandingPageSEO;
  sections?: LandingPageSection[];
  blocks: LandingPageBlock[]; // Legacy support
  settings?: {
    backgroundColor?: string;
    backgroundImage?: string;
    textColor?: string;
    fontFamily?: string;
    primaryColor?: string;
    hideNavbar?: boolean;
    hideFooter?: boolean;
    fullWidth?: boolean;
    backgroundPattern?: 'none' | 'lines' | 'grid' | 'waves' | 'circles' | 'geometric';
    backgroundPatternOpacity?: number;
    glassEffect?: boolean;
    blurAmount?: string;
    navbarSettings?: {
      logoUrl?: string;
      backgroundColor?: string;
      textColor?: string;
      isScrolledBg?: string;
      isScrolledText?: string;
      theme?: 'auto' | 'light' | 'dark';
      links?: NavbarLink[];
      whatsappNumber?: string;
      showWhatsapp?: boolean;
    };
    backgroundConfig?: BackgroundConfig;
  };
  isPublished: boolean;
  createdAt: string;
}

export interface CustomPopup {
  id: string;
  slug: string; // The URL/hash trigger, e.g. "my-popup" or "/popup-deal"
  title: string;
  description?: string;
  sections?: LandingPageSection[];
  blocks: LandingPageBlock[];
  isPublished: boolean;
  createdAt: string;
  settings?: {
    backgroundColor?: string;
    backgroundImage?: string;
    textColor?: string;
    width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    autoTriggerDelay?: number; // triggering automatically on scroll or delay
    backdropColor?: string;
    backdropBlur?: boolean;
    glassEffect?: boolean;
    blurAmount?: string;
    backgroundConfig?: BackgroundConfig;
  };
}

export interface NavbarLink {
  id: string;
  label: string;
  url: string;
  order: number;
  isExternal?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  authorId: string;
  authorName: string;
  date: string;
  images: string[];
  tags?: string[];
  category?: string;
  introText?: string;
  sections?: { heading?: string; content?: string; imageUrl?: string; videoUrl?: string }[];
  buttonText?: string;
  buttonLink?: string;
  buttonType?: 'link' | 'whatsapp' | 'phone';
  buttonStyle?: string;
  customCode?: string;
  blocks?: any[];
  status?: 'Draft' | 'Review' | 'Scheduled' | 'Published' | 'Archived';
  publishScheduledDate?: string;
  seoFocusKeyword?: string;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  seoCanonical?: string;
}

export interface HotDeal {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  price?: string;
  expiryDate?: string;
  images: string[];
  date: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  password: string;
  plainPassword?: string;
  role: UserRole;
  profilePic?: string;
  parentId?: string;
  permissions: string[];
  mailboxConfig?: {
    email?: string;
    smtpHost?: string;
    smtpPort?: string;
    smtpUser?: string;
    smtpPassword?: string;
    smtpUseSSL?: boolean;
    imapHost?: string;
    imapPort?: string;
    imapUser?: string;
    imapPassword?: string;
    imapUseSSL?: boolean;
    isActive?: boolean;
    senderName?: string;
    gatewayType?: string;
    enableImapSync?: boolean;
  };
}

export interface OfficeLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  mapUrl: string;
  iconUrl?: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  arabicName: string;
  logoUrl: string;
  address: string;
  location?: string;
  phone?: string;
  email?: string;
  vatId: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  stampUrl?: string;
}

export interface ServiceCard {
  id: string;
  title: string;
  description: string;
  planDescription?: string;
  price?: string;
  priceSubtitle?: string;
  isRecommended?: boolean;
  iconUrl: string;
  imageUrl?: string;
  link?: string;
  features?: string[];
}

export interface SubdomainRedirect {
  id: string;
  subdomain: string;
  targetUrl: string;
  isActive: boolean;
}

export interface HeaderSettings {
  title: string;
  subtitle?: string;
  titleSize?: string;
  subtitleSize?: string;
  align?: 'left' | 'center' | 'right';
  titleColor?: string;
  subtitleColor?: string;
  animation?: 'none' | 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'zoomOut';
  rotation?: number;
  fontFamily?: string;
}

export interface Review { id: string; name: string; rating: number; text: string; date: string; avatar?: string }

export interface MailMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  subject: string;
  content: string;
  htmlContent?: string;
  attachments?: { filename: string; contentType: string; size: number; url: string }[];
  timestamp: string;
  read: boolean;
  type: 'internal';
  isDraft?: boolean;
  isStarred?: boolean;
  isTrash?: boolean;
}

export interface BioHubSocial {
  id: string;
  platform: string;
  label: string;
  url: string;
  iconName: string;
  enabled: boolean;
  order: number;
  iconUrl?: string;
}

export interface BioHubBranch {
  id: string;
  name: string;
  manager: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  locationUrl: string;
  workingHours: string;
  imageUrl?: string;
  views?: number;
}

export interface BioHubService {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  featured: boolean;
  imageUrl?: string;
  enabled: boolean;
}

export interface BioHubFAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface BioHubTestimonial {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  text: string;
  date: string;
  enabled: boolean;
}

export interface BioHubAnalytics {
  visitorsCount: number;
  qrScansCount: number;
  clicksCount: Record<string, number>;
  buttonClicks: {
     whatsapp: number;
     call: number;
     saveContact: number;
     share: number;
  };
}

export interface BioHubData {
  companyName: string;
  tagline: string;
  logoUrl: string;
  coverUrl: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  glassEffect: boolean;
  whatsappNumber: string;
  phoneNumber: string;
  emailAddress: string;
  inquiryDestinationEmail?: string;
  googleMapsEmbedUrl?: string;
  businessHours?: string;
  bgOpacity?: number;
  cardThemeMode?: 'light' | 'dark';
  cardOpacity?: number;
  cardBlur?: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
  };
  socials: BioHubSocial[];
  branches: BioHubBranch[];
  services: BioHubService[];
  faqs: BioHubFAQ[];
  testimonials: BioHubTestimonial[];
  analytics: BioHubAnalytics;
  socialsTitle?: string;
  officesTitle?: string;
  servicesTitle?: string;
  servicesSubtitle?: string;
  faqsTitle?: string;
  inquiryTitle?: string;
  inquirySubtitle?: string;
  inquiryReferenceText?: string;
  alertShow?: boolean;
  alertTitle?: string;
  alertContent?: string;
  alertColor?: 'red' | 'amber' | 'blue' | 'emerald';
}

export interface CompanyProfileSection {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  image?: string;
  shapeType: 'hexagon' | 'rhombus' | 'diagonal-slice' | 'rounded-blob' | 'circular-badge' | 'isometric-card';
}

export interface CompanyProfileStat {
  id: string;
  value: string;
  label: string;
  icon: string;
}

export interface CompanyProfileLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  workingHours?: string;
}

export interface CompanyProfilePartner {
  id: string;
  name: string;
  logoUrl: string;
}

export interface CompanyProfileData {
  companyName: string;
  tagline: string;
  foundedYear: string;
  ceoName: string;
  logoUrl: string;
  coverUrl: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  barcodeValue: string;
  qrCodeUrl: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  videoUrl?: string;
  sections: CompanyProfileSection[];
  stats: CompanyProfileStat[];
  locations: CompanyProfileLocation[];
  partners: CompanyProfilePartner[];
  branchCities?: string;
  aboutText?: string;
  missionTitle?: string;
  missionSubtitle?: string;
  missionText?: string;
  visionTitle?: string;
  visionSubtitle?: string;
  visionText?: string;
  relationshipTitle?: string;
  relationshipSubtitle?: string;
  relationshipText?: string;
  relationshipImage?: string;
  relationshipCheckText?: string;
  service1Title?: string;
  service1Subtitle?: string;
  service1Text?: string;
  service1Bullets?: string[];
  service1Image?: string;
  service2Title?: string;
  service2Subtitle?: string;
  service2Text?: string;
  service2Bullets?: string[];
  service2Image?: string;
  caseStudiesTitle?: string;
  caseStudiesText?: string;
  caseStudy1Tag?: string;
  caseStudy1Title?: string;
  caseStudy1Challenge?: string;
  caseStudy1Outcome?: string;
  caseStudy2Tag?: string;
  caseStudy2Title?: string;
  caseStudy2Challenge?: string;
  caseStudy2Outcome?: string;
  caseStudy3Tag?: string;
  caseStudy3Title?: string;
  caseStudy3Challenge?: string;
  caseStudy3Outcome?: string;
  accreditationsTitle?: string;
  accreditationsSubtitle?: string;
  accreditations?: { id: string; name: string; code: string }[];
  guaranteeTitle?: string;
  guaranteeText?: string;
  footerNote?: string;
}

export interface BusinessServiceSubcategoryPackage {
  id?: string;
  name?: string;
  description?: string;
  serviceFees: string;
  governmentFees: string;
  processingTime: string;
  targetAudience: string;
  detailedDescription?: string;
  bulletPoints?: string[];
  requirements?: string;
  termsConditions?: string;
  requiredDocuments?: string;
  notes?: string;
  faq?: string;
  relatedServices?: string;
  whatsappNumber?: string;
  addToCartEnabled?: boolean;
  inquiryEnabled?: boolean;
  ministryInfo?: string;
}

export interface BusinessServiceSubcategory {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  beforeDiscountPrice?: string;
  afterDiscountPrice: string;
  isSale?: boolean;
  packageDetails: BusinessServiceSubcategoryPackage;
  status?: 'active' | 'inactive';
  sortOrder?: number;
  currency?: string;
}

export interface BusinessServiceCategory {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  subcategories: BusinessServiceSubcategory[];
  status?: 'active' | 'inactive';
  sortOrder?: number;
  servicesCount?: number;
  autoCountServices?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface CMSData {
  general: {
    whatsapp: string;
    whatsappHotels: string;
    whatsappVisas: string;
    whatsappBusiness: string;
    whatsappGreeting?: string;
    requireLoginOTP?: boolean;
    enableOtpBypass?: boolean;
    otpBypassAnswer?: string;
    logoUrl: string;
    notificationSoundUrl?: string;
    notificationSoundEnabled?: boolean;
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    tiktok: string;
    youtube?: string;
    heroVideo?: string;
    heroVideoOverlayColor?: string;
    heroVideoOverlayOpacity?: number;
    footerBgUrl?: string;
    footerOverlayColor?: string;
    footerCtaTitle?: string;
    footerCtaButtonText?: string;
    themeColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    englishFontFamily?: string;
    arabicFontFamily?: string;
    banglaFontFamily?: string;
    customFontUrl?: string;
    customFontBase64?: string;
    customLanguageName?: string;
    youtubeIds?: string[];
    facebookVideoUrls?: string[];
    whatsappBooking?: string;
    serviceIcons?: {
      hotels: string;
      visas: string;
      business: string;
    };
    footerPartnerLogos?: (string | { logoUrl: string; licenseNo?: string })[];
    footerPartnersTitle?: string;
    promoSliderDuration?: number;
    scrollingPartners?: { id: string; name: string; type: string; logoUrl?: string; color?: string; licenseNo?: string }[];
    footerPopups?: {
      about?: string;
      services?: string;
      contact?: string;
      privacy?: string;
      terms?: string;
      faq?: string;
    };
    fonts?: {
      header: string;
      body: string;
      accent: string;
    };
    serviceBarColor?: string;
    shadowColor?: string;
    heroTitleLastWordColor?: string;
    heroButtonText?: string;
    hotelSearchButtonText?: string;
    visaSearchButtonText?: string;
    businessSetupButtonText?: string;
    packageBookButtonText?: string;
    destinationExploreText?: string;
    destinationBookButtonText?: string;
    blogReadGuideText?: string;
    blogViewAllText?: string;
    newsletterButtonText?: string;
    heroBadgeText?: string;
    iqamaButtonText?: string;
    iqamaButtonLink?: string;
    sectionTitles?: {
      packages?: HeaderSettings;
      destinations?: HeaderSettings;
      blog?: HeaderSettings;
      blogPage?: HeaderSettings;
      hotDeals?: HeaderSettings;
      successStories?: HeaderSettings & { description?: string };
      team?: HeaderSettings;
      partners?: HeaderSettings;
      videoSection?: HeaderSettings & { description?: string };
      reviews?: HeaderSettings;
      branding?: HeaderSettings;
      faq?: HeaderSettings;
      businessServicesPage?: HeaderSettings & { description?: string; customBgUrl?: string };
    };
    teamFooterText?: string;
    faviconUrl?: string;
    buttonSettings?: {
      hero?: { text: string; type: 'link' | 'whatsapp' | 'phone' | 'scroll' | 'email'; link: string; whatsapp: string; phone: string; email?: string; disabled?: boolean };
      hotelSearch?: { text: string; type: 'link' | 'whatsapp' | 'phone' | 'scroll' | 'email'; link: string; whatsapp: string; phone: string; email?: string; disabled?: boolean };
      visaSearch?: { text: string; type: 'link' | 'whatsapp' | 'phone' | 'scroll' | 'email'; link: string; whatsapp: string; phone: string; email?: string; disabled?: boolean };
      businessSetup?: { text: string; type: 'link' | 'whatsapp' | 'phone' | 'scroll' | 'email'; link: string; whatsapp: string; phone: string; email?: string; disabled?: boolean };
      packageBook?: { text: string; type: 'link' | 'whatsapp' | 'phone' | 'scroll' | 'email'; link: string; whatsapp: string; phone: string; email?: string; disabled?: boolean };
      destinationExplore?: { text: string; type: 'link' | 'whatsapp' | 'phone' | 'scroll' | 'email'; link: string; whatsapp: string; phone: string; email?: string; disabled?: boolean };
      destinationBook?: { text: string; type: 'link' | 'whatsapp' | 'phone' | 'scroll' | 'email'; link: string; whatsapp: string; phone: string; email?: string; disabled?: boolean };
      blogReadGuide?: { text: string; type: 'link' | 'whatsapp' | 'phone' | 'scroll' | 'email'; link: string; whatsapp: string; phone: string; email?: string; disabled?: boolean };
      blogViewAll?: { text: string; type: 'link' | 'whatsapp' | 'phone' | 'scroll' | 'email'; link: string; whatsapp: string; phone: string; email?: string; disabled?: boolean };
      newsletter?: { text: string; type: 'link' | 'whatsapp' | 'phone' | 'scroll' | 'email'; link: string; whatsapp: string; phone: string; email?: string; disabled?: boolean };
      footerCta?: { text: string; type: 'link' | 'whatsapp' | 'phone' | 'scroll' | 'email'; link: string; whatsapp: string; phone: string; email?: string; disabled?: boolean };
      navbarContact?: { text: string; type: 'link' | 'whatsapp' | 'phone' | 'scroll' | 'email'; link: string; whatsapp: string; phone: string; email?: string; disabled?: boolean };
    };
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
      ogImage?: string;
      advancedSeo?: string;
    };
    smtpConfig?: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      pass: string;
      from: string;
    };
    welcomeEmailTemplate: {
      subject: string;
      body: string;
    };
    loginOtpEmailTemplate?: {
      subject: string;
      body: string;
    };
    forgotPasswordEmailTemplate?: {
      subject: string;
      body: string;
    };
    broadcastEmailTemplate?: {
      subject: string;
      body: string;
    };
    officesBgImageUrl?: string;
    officesIconUrl?: string;
    bgUrl?: string;
    footerBgColor?: string;
    companyName?: string;
    phone?: string;
    email?: string;
    address?: string;
    siteName?: string;
    sectionBackgrounds?: {
      [key: string]: BackgroundConfig;
    };
    domainMappings?: { [domain: string]: string };
    security?: {
      maintenanceMode: boolean;
      allowedIPs: string[];
      twoFactorRequired: boolean;
      passwordPolicy: 'basic' | 'strong' | 'enterprise';
    };
  };
  locationSettings?: {
    backgroundLogoUrl?: string;
    backgroundLogoOpacity?: number;
    backgroundLogoSize?: number;
    backgroundLogoRotation?: number;
    backgroundLogoTop?: number;
    backgroundLogoRight?: number;
    defaultOfficeIconUrl?: string;
    defaultOfficeIconOpacity?: number;
    defaultOfficeIconRotation?: number;
    sectionTitle?: string;
    sectionSubtitle?: string;
  };
  footer: {
    aboutText: string;
    copyright: string;
    links: { label: string; url: string }[];
    socials: { platform: string; url: string; iconUrl: string }[];
  };
  hero: { title: string; subtitle: string; bgUrl: string; link?: string; preTitle?: string; buttonText?: string }[];
  promoSlider: { id: string; title: string; subtitle: string; img: string; link: string; showPopup?: boolean; popupImg?: string; popupTitle?: string; popupSubtitle?: string; popupDescription?: string; whatsappNumber?: string }[];
  catalogue: { id: string; title: string; label: string; img: string; link?: string; price?: string; oldPrice?: string; rating?: string; reviewsCount?: string; duration?: string; location?: string; details?: string; isFeatured?: boolean; authorImg?: string; itinerary?: { dayNum: number; title: string; desc: string }[]; inclusions?: string[]; exclusions?: string[]; advisoryText?: string }[];
  team: { id: string; name: string; role: string; image: string; link?: string }[];
  offices: OfficeLocation[];
  businessProfiles: BusinessProfile[];
  users: User[];
  blogPosts: BlogPost[];
  hotDeals: HotDeal[];
  subdomainRedirects?: SubdomainRedirect[];
  subscribers: string[];
  newsletterSubscribers: string[];
  reviews: Review[];
  faqs: FAQItem[];
  messages: MailMessage[];
  deletedMessageIds?: string[];
  features?: { 
    sectionTitle?: string;
    sectionSubtitle?: string;
    items: { title: string; description: string; iconName: string }[];
  };
  floatingCardItems?: { id: string; name: string; logoUrl: string; buttonText: string; buttonLink: string; active: boolean }[];
  branding: {
    elevatingTitle: string;
    elevatingSubtitle: string;
    elevatingTitleSize?: string;
    elevatingSubtitleSize?: string;
    elevatingFeatures?: { icon: string; title: string; desc: string }[];
  };
  stats: {
    successfulVisas: string;
    businessSetups: string;
    globalPartners: string;
    globalReach: string;
    successfulVisasLabel?: string;
    successfulVisasDesc?: string;
    businessSetupsLabel?: string;
    businessSetupsDesc?: string;
    globalPartnersLabel?: string;
    globalPartnersDesc?: string;
    globalReachLabel?: string;
    globalReachDesc?: string;
  };
  successStories: {
    youtubePlaylistId: string;
    youtubePlaylistUrl?: string;
    videoUrls?: string[];
    milestones: { id: string; title: string; value: string; icon: string }[];
  };
  visaOptions: {
    nationalities: string[];
    residencies: string[];
    destinations: string[];
    requirements: Record<string, string[]>;
  };
  businessOptions: {
    licenseTypes: string[];
    industryTypes: string[];
    requirements: Record<string, string[]>;
  };
  notifications: {
    topBar: {
      enabled: boolean;
      text: string;
      texts?: string[];
      link?: string;
      bgColor?: string;
      textColor?: string;
    };
    popup: {
      enabled: boolean;
      title?: string;
      description?: string;
      imageUrl?: string;
      link?: string;
      buttonText?: string;
    };
  };
  serviceCards: ServiceCard[];
  landingPages: LandingPage[];
  customPopups?: CustomPopup[];
  navbarLinks: NavbarLink[];
  homeBlocks: LandingPageBlock[];
  homeSections?: LandingPageSection[];
  homeSectionsOrder?: string[];
  homeSettings?: {
    backgroundColor?: string;
    backgroundImage?: string;
    textColor?: string;
    fontFamily?: string;
    primaryColor?: string;
    fullWidth?: boolean;
    backgroundPattern?: 'none' | 'lines' | 'grid' | 'waves' | 'circles' | 'geometric';
    backgroundConfig?: BackgroundConfig;
    navbarSettings?: {
      logoUrl?: string;
      backgroundColor?: string;
      textColor?: string;
      isScrolledBg?: string;
      isScrolledText?: string;
      theme?: 'auto' | 'light' | 'dark';
      links?: NavbarLink[];
      whatsappNumber?: string;
      showWhatsapp?: boolean;
    };
  };
  whySaudiArabia?: {
    badge: string;
    title: string;
    description: string;
    extraDescription: string;
    mainImageUrl: string;
    secondaryImageUrl: string;
    tertiaryImageUrl: string;
    features: { id: string; title: string; description: string; icon: string }[];
    stats: { id: string; label: string; value: string; suffix: string }[];
  };
  visibility: {
    hero: boolean;
    search: boolean;
    services: boolean;
    destinations: boolean;
    blog: boolean;
    successStories: boolean;
    reviews: boolean;
    offices: boolean;
    whyChooseUs: boolean;
    whySaudiArabia: boolean;
    stats: boolean;
    team: boolean;
    partners: boolean;
    homeBlocks: boolean;
    footer: boolean;
    promoSlider: boolean;
    iqamaButton: boolean;
    serviceVisa?: boolean;
    serviceHotel?: boolean;
    serviceBusiness?: boolean;
  };
  bioHub?: BioHubData;
  companyProfile?: CompanyProfileData;
  couponSettings?: {
    code: string;
    amount: string;
    type: string;
    active: boolean;
    minimumSpend?: string;
    expiryDays: number;
  };
  claimedCoupons?: {
    id: string;
    email: string;
    code: string;
    discount: string;
    claimedAt: string;
    status: string;
  }[];
  businessServices?: BusinessServiceCategory[];
  appointmentSettings?: {
    contactEmail: string;
  };
  appointments?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    date: string;
    service: string;
    message: string;
    status: string;
    createdAt: string;
  }[];
}

export const DEFAULT_DATA: CMSData = {
  general: {
    whatsapp: "966537681618",
    whatsappHotels: "966537681618",
    whatsappVisas: "966537681618",
    whatsappBusiness: "966537681618",
    logoUrl: "https://i.ibb.co/pjjqSnRF/Logo-23D.png",
    notificationSoundUrl: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    notificationSoundEnabled: true,
    facebook: "khdreamservices",
    instagram: "khdreamservices",
    twitter: "khdreamservices",
    linkedin: "khdreamservices",
    tiktok: "khdreamservices",
    youtube: "khdreamservices",
    heroVideo: "",
    heroVideoOverlayColor: "#020617",
    heroVideoOverlayOpacity: 85,
    footerBgUrl: "",
    footerOverlayColor: "rgba(9, 9, 11, 0.9)",
    footerCtaTitle: "Ready to explore the Kingdom? Let's plan your journey together.",
    footerCtaButtonText: "Get a Free Consultation",
    themeColor: (rawCmsData as any).general?.themeColor || "#f00000",
    secondaryColor: (rawCmsData as any).general?.secondaryColor || "#111827",
    accentColor: (rawCmsData as any).general?.accentColor || "#EF4444",
    serviceBarColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    heroTitleLastWordColor: "linear-gradient(to right, #34d399, #14b8a6, #34d399)",
    heroButtonText: "Explore Now",
    hotelSearchButtonText: "WhatsApp",
    visaSearchButtonText: "Check Requirements",
    businessSetupButtonText: "Consult Experts",
    packageBookButtonText: "এখনি বুক করুন",
    destinationExploreText: "Explore Destination",
    destinationBookButtonText: "Book This Package Now",
    blogReadGuideText: "Read Guide",
    blogViewAllText: "View all stories",
    newsletterButtonText: "Subscribe",
    heroBadgeText: "17 Years of Excellence",
    iqamaButtonText: "Iqama Inquiry",
    iqamaButtonLink: "/iqama-inquiry",
    sectionTitles: {
      packages: { title: "Simple, Transparent Pricing", subtitle: "Choose the plan that fits your needs", titleSize: "text-2xl md:text-5xl", subtitleSize: "text-base md:text-lg" },
      destinations: { title: "Top Destinations for your next trip", subtitle: "Explore the world with us", titleSize: "text-2xl md:text-5xl", subtitleSize: "text-base md:text-lg" },
      blog: { title: "Recommended Travel Stories", subtitle: "Insights and tips from our experts", titleSize: "text-2xl md:text-5xl", subtitleSize: "text-base md:text-lg" },
      blogPage: { title: "Travel <span class=\"text-primary\">Blog</span>", subtitle: "Wanderlust Chronicles & Global Adventures", titleSize: "text-3xl md:text-5xl", subtitleSize: "text-[10px] md:text-xs" },
      hotDeals: { title: "Exclusive <span class=\"text-primary\">Travel Deals</span>", subtitle: "Limited Time Offers & Flash Sales", titleSize: "text-3xl md:text-5xl", subtitleSize: "text-[10px] md:text-xs" },
      successStories: { title: "Latest Stories", subtitle: "Success Stories", description: "Real success stories from entrepreneurs and investors who built their dream in Saudi Arabia.", titleSize: "text-3xl md:text-5xl", subtitleSize: "text-[9px] font-black tracking-[0.2em]" },
      team: { title: "Our Professional Team", subtitle: "Meet the experts behind your dreams", titleSize: "text-2xl md:text-5xl", subtitleSize: "text-base md:text-lg" },
      partners: { title: "Our Global Partners", subtitle: "Working together to serve you better", titleSize: "text-2xl md:text-5xl", subtitleSize: "text-base md:text-lg" },
      videoSection: { title: "YouTube Feed", subtitle: "@Khdreams", description: "", titleSize: "text-xl font-bold", subtitleSize: "text-xs text-slate-400 font-bold" },
      reviews: { title: "Google Reviews", subtitle: "Our Client Feedbacks", titleSize: "text-2xl md:text-5xl", subtitleSize: "text-base md:text-lg" },
      branding: { title: "Elevating Your Global Ambitions", subtitle: "We don't just provide services; we craft pathways for your success in Saudi Arabia and beyond.", titleSize: "text-2xl md:text-5xl", subtitleSize: "text-sm md:text-lg", align: "left" }
    },
    teamFooterText: "+ more % amazing peoples",
    faviconUrl: "/favicon.png",
    buttonSettings: {
      hero: { text: 'Explore Packages', type: 'link', link: '#packages', whatsapp: '', phone: '', email: '' },
      hotelSearch: { text: 'Search Hotels', type: 'whatsapp', link: '', whatsapp: '', phone: '', email: '' },
      visaSearch: { text: 'Apply Now', type: 'whatsapp', link: '', whatsapp: '', phone: '', email: '' },
      businessSetup: { text: 'Get Started', type: 'whatsapp', link: '', whatsapp: '', phone: '', email: '' },
      packageBook: { text: 'Book Now', type: 'whatsapp', link: '', whatsapp: '', phone: '', email: '' },
      destinationExplore: { text: 'Explore', type: 'link', link: '', whatsapp: '', phone: '', email: '' },
      destinationBook: { text: 'Book Trip', type: 'whatsapp', link: '', whatsapp: '', phone: '', email: '' },
      blogReadGuide: { text: 'Read Guide', type: 'link', link: '', whatsapp: '', phone: '', email: '' },
      blogViewAll: { text: 'View All Posts', type: 'link', link: '', whatsapp: '', phone: '', email: '' },
      newsletter: { text: 'Subscribe', type: 'link', link: '', whatsapp: '', phone: '', email: '' },
      footerCta: { text: 'Contact Us', type: 'whatsapp', link: '', whatsapp: '', phone: '', email: '' },
      navbarContact: { text: 'Contact Us', type: 'scroll', link: '', whatsapp: '', phone: '', email: '' }
    },
    seo: {
      metaTitle: "KH Dream Services | Luxury Travel & Business in KSA",
      metaDescription: "Saudi Arabia's premier travel and business consultancy, dedicated to providing seamless experiences for global travelers and investors.",
      metaKeywords: "travel, business, saudi arabia, visa, hotels, consultancy",
      ogImage: "https://i.ibb.co/pjjqSnRF/Logo-23D.png",
      advancedSeo: ""
    },
    fontFamily: "Inter",
    englishFontFamily: "Inter",
    arabicFontFamily: "Cairo",
    banglaFontFamily: "Hind Siliguri",
    customFontUrl: "",
    customFontBase64: "",
    customLanguageName: "",
    youtubeIds: ["ScMzIvxBSi4"],
    facebookVideoUrls: ["https://www.facebook.com/khdreamservices/videos/1083431666611299/"],
    whatsappBooking: "966537681618",
    serviceIcons: {
      hotels: "",
      visas: "",
      business: ""
    },
    footerPartnerLogos: [],
    footerPartnersTitle: "Licensed By",
    promoSliderDuration: 60,
    scrollingPartners: [
      { id: "1", name: "Amadeus", type: "GDS", color: "text-blue-600" },
      { id: "2", name: "Sabre", type: "GDS", color: "text-red-700" },
      { id: "3", name: "Saudia", type: "Airline", color: "text-green-800" },
      { id: "4", name: "Emirates", type: "Airline", color: "text-red-600" },
      { id: "5", name: "Biman", type: "Airline", color: "text-green-600" },
      { id: "6", name: "PIA", type: "Airline", color: "text-emerald-900" },
      { id: "7", name: "Air India", type: "Airline", color: "text-orange-600" },
      { id: "8", name: "Travelport", type: "GDS", color: "text-indigo-600" },
      { id: "9", name: "Flyadeal", type: "LCC", color: "text-purple-600" },
      { id: "10", name: "Flynas", type: "LCC", color: "text-lime-600" }
    ],
    footerPopups: {
      about: "KH Dream Services Limited is Saudi Arabia's premier travel and business consultancy, dedicated to providing seamless experiences for global travelers and investors. Our mission is to bridge the gap between global ambitions and local opportunities.",
      services: "We offer a comprehensive suite of services including: \n- Global Hotel Bookings\n- Visa Concierge Services\n- Business Setup & Legal Consultancy\n- Luxury Travel Management\n- Corporate Travel Solutions",
      contact: "Get in touch with us:\nEmail: info@khdreamservices.com\nPhone: +966 053 768 1618\nAddress: King Fahd Road, Al Olaya District, Riyadh, KSA",
      privacy: "Your privacy is important to us. We collect and use your data only to provide and improve our services. We do not share your personal information with third parties except as required by law or to fulfill your requests."
    },
    fonts: {
      header: "Montserrat",
      body: "Inter",
      accent: "Space Grotesk"
    },
    smtpConfig: {
      host: "khdreamservices.com",
      port: 465,
      secure: true,
      user: "support@khdreamservices.com",
      pass: "",
      from: "KH Dream Services <support@khdreamservices.com>"
    },
    welcomeEmailTemplate: {
      subject: "Welcome to KH Dream Services Limited - Your Account Details",
      body: "<h1>Welcome to KH Dream Services Limited</h1><p>Hello {fullName},</p><p>Your account has been created. Here are your login details:</p><p><strong>Username:</strong> {username}</p><p><strong>Password:</strong> {password}</p><p>You can log in at: {loginUrl}</p><p>Best regards,<br/>KH Dream Services Limited Team</p>"
    },
    loginOtpEmailTemplate: {
      subject: "[KH Dream] Login Verification Code",
      body: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f1f5f9; border-radius: 16px; background: #ffffff; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
    <h2 style="color: #c99c33; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">KH Dream</h2>
    <p style="color: #64748b; font-size: 13px; margin: 5px 0 0 0; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">One-Time Security Verification Gate</p>
  </div>
  <p style="font-size: 14px; line-height: 1.6; color: #334155; text-align: center;">
    A login request was initiated for your administrator account on the KH Dream Travels & Tourism system.
  </p>
  <div style="background: #f8fafc; border: 1px dashed #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
    <p style="font-size: 13px; color: #475569; margin: 0 0 15px 0; font-weight: 600;">
      Enter this 6-digit OTP code to authorize logon (Expires in 5 mins):
    </p>
    <div style="display: inline-block; background: #ffffff; border: 2px solid #c99c33; color: #0f172a; font-size: 30px; font-weight: 900; letter-spacing: 0.18em; padding: 12px 30px; border-radius: 12px; font-family: monospace; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      {otpCode}
    </div>
  </div>
  <p style="font-size: 12px; line-height: 1.6; color: #64748b; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 25px;">
    This notification was dispatched for email: {email} (IP: {ip}).
    <br/>
    If you did not request this OTP clearance, please ignore this email and update your password immediately.
  </p>
</div>`
    },
    forgotPasswordEmailTemplate: {
      subject: "Secure Password Reset - KH Dream Services",
      body: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f1f5f9; border-radius: 16px; background: #ffffff; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
    <h2 style="color: #DC2626; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">KH Dream</h2>
    <p style="color: #64748b; font-size: 13px; margin: 5px 0 0 0; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">Secure Password Reset</p>
  </div>
  <p>Hello <strong>{fullName}</strong>,</p>
  <p>A password reset was requested for your account on the KH Dream Services Admin Panel.</p>
  <div style="text-align: center; margin: 40px 0;">
    <a href="{resetUrl}" style="background: #DC2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);">RESET PASSWORD</a>
  </div>
  <p style="color: #666; font-size: 14px;">This secure link will expire in 1 hour for your protection.</p>
  <p style="color: #666; font-size: 14px;">If the button above doesn't work, copy and paste this URL into your browser:</p>
  <p style="word-break: break-all; color: #DC2626; font-size: 12px; background: #f9f9f9; padding: 10px; border-radius: 4px;">{resetUrl}</p>
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="margin: 0; font-size: 13px;"><strong>Username:</strong> {username}</p>
    <p style="margin: 5px 0 0 0; font-size: 11px; color: #999;">Security Protocol: Token-Based Authentication</p>
  </div>
</div>`
    },
    broadcastEmailTemplate: {
      subject: "Important Announcement - KH Dream",
      body: `<div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #333;">
  <div style="background: #1e3a8a; padding: 25px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-family: 'Helvetica Neue', Arial; font-weight: bold;">Dream Services Announcement</h1>
  </div>
  <div style="padding: 30px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; min-height: 200px; line-height: 1.6;">
    {broadcastContent}
  </div>
  <div style="background: #fafafa; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; font-size: 11px; border-top: 1px solid #f3f4f6;">
    <p style="margin: 0; color: #9ca3af;">KH Dream Travels & Tourism, Saudi Arabia.</p>
  </div>
</div>`
    },
    officesBgImageUrl: "https://i.ibb.co/pjjqSnRF/Logo-23D.png",
    officesIconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    bgUrl: "",
    footerBgColor: "#09090b",
    companyName: "KH Dream Services Limited",
    phone: "+966 053 768 1618",
    email: "info@khdreamservices.com",
    siteName: "KH Dream Services",
    sectionBackgrounds: {},
    security: {
      maintenanceMode: false,
      allowedIPs: [],
      twoFactorRequired: false,
      passwordPolicy: 'strong'
    }
  },
  locationSettings: {
    backgroundLogoUrl: "https://i.ibb.co/pjjqSnRF/Logo-23D.png",
    defaultOfficeIconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    backgroundLogoRotation: 0,
    sectionTitle: "Find Us Nearby",
    sectionSubtitle: "Our Global Presence"
  },
  footer: {
    aboutText: "KH Dream Services Limited is Saudi Arabia's premier travel and business consultancy, dedicated to providing seamless experiences for global travelers and investors.",
    copyright: "© 2026 KH Dream Services Limited. All rights reserved.",
    links: [
      { label: "About Us", url: "#" },
      { label: "Services", url: "#" },
      { label: "Contact", url: "#" },
      { label: "Privacy Policy", url: "#" }
    ],
    socials: [
      { platform: "Facebook", url: "https://facebook.com", iconUrl: "https://cdn-icons-png.flaticon.com/512/733/733547.png" },
      { platform: "Instagram", url: "https://instagram.com", iconUrl: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png" },
      { platform: "LinkedIn", url: "https://linkedin.com", iconUrl: "https://cdn-icons-png.flaticon.com/512/174/174857.png" }
    ]
  },
  hero: [],
  promoSlider: [],
  catalogue: [
    { 
      id: '1', 
      title: 'Saudi Arabia Golden Visa Assistance', 
      label: 'Golden Visa', 
      img: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&q=80', 
      location: 'Riyadh, Saudi Arabia', 
      duration: '5-7 Days', 
      rating: '5.0', 
      reviewsCount: '24', 
      price: 'SAR 1,800', 
      oldPrice: 'SAR 2,200', 
      isFeatured: true, 
      authorImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
      details: 'Get professional pre-screening and document coordination for the Saudi Golden Visa programs. We handle state registry portal filing, medical report certification assistance, and premium concierge delivery.',
      inclusions: [
        'Complete assessment of eligibility requirements & golden investment criteria',
        'Official Government portal pre-filing setup and matching form compilation',
        'Direct coordination with Ministry of Investment counterparts',
        'Priority document translation assistance & certificate attestation checks'
      ],
      exclusions: [
        'Flexible Airline confirmed itineraries and hotel reservation booking layouts',
        'Saudi Ministry official government golden visa fee values (processed standardly)',
        'Local legal medical examination checkup fee values'
      ],
      advisoryText: 'Ensure your investment records, salary histories or property documents are stamped and authenticated by foreign affairs before scheduling biometrics.'
    },
    { 
      id: '2', 
      title: 'Schengen Area Premium Visa Filing', 
      label: 'Schengen Visa', 
      img: 'https://images.unsplash.com/photo-1623869032733-1456170ce046?auto=format&fit=crop&q=80', 
      location: 'Schengen & UK', 
      duration: '10-14 Days', 
      rating: '4.9', 
      reviewsCount: '18', 
      price: 'SAR 2,500', 
      oldPrice: 'SAR 3,000', 
      isFeatured: true, 
      authorImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      details: 'Step-by-step document assembly, flight & hotel reservation holds for embassy checklist, travel insurance certificates, and early biometric appointment coordination.',
      inclusions: [
        'Embassy-compliant travel health insurance documentation package',
        'Confirmed flight reservation and verified hotel accommodation voucher holds',
        'Biometric slot tracking and booking on VFS Global / TLS Contact platforms',
        'Precision review of visa application forms and cover letter templates'
      ],
      exclusions: [
        'Direct airline real-ticket purchasing services (unless requested customly)',
        'VFS / TLS concierge service fee or official embassy application fees',
        'Courier returns handling directly to home addresses if processed outside'
      ],
      advisoryText: 'Original passport must have at least 2 empty pages and minimum 6 months validity from the planned date of departure.'
    },
    { 
      id: '3', 
      title: 'USA B1/B2 Tourism & Business Visa Desk', 
      label: 'US Visa Combo', 
      img: 'https://images.unsplash.com/photo-1590418606746-018840fb9cd0?auto=format&fit=crop&q=80', 
      location: 'United States', 
      duration: '15-20 Days', 
      rating: '4.7', 
      reviewsCount: '32', 
      price: 'SAR 3,200', 
      oldPrice: 'SAR 3,500', 
      isFeatured: false, 
      authorImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar',
      details: 'DS-160 application form assistance, digital visa image vetting, embassy appointment scheduler queue supervision, and complete mock interview questionnaire preparation sessions.',
      inclusions: [
        'Pre-submission vetting of the complete DS-160 online form records',
        'Mock interview sessions with specialized counselors and prep documents',
        'Payment of SEVIS or standard consulate machinery fees if requested',
        'Confirmed flight route reservations for the travel schedule planning'
      ],
      exclusions: [
        'Official government MRV travel visa visa fees (unless standard invoice chosen)',
        'Personal flight seat purchases on final confirmation booking lines',
        'Any travel cost related to physically visiting the consulate standardly'
      ],
      advisoryText: 'Do not finalize non-refundable flights until the stamped US Visa has been received in your physical custody.'
    }
  ],
  team: [
    { id: '1', name: 'S.M. Rakibul Hasan', role: 'Chief Executive Officer', image: '' },
  ],
  offices: [
    { id: '1', name: "KH Dream Services", city: "Riyadh", address: "King Fahd Road, Al Olaya District", phone: "+966 11 000 0000", hours: "9 AM - 6 PM", mapUrl: "https://maps.app.goo.gl/2n82PcGfgrWYU45d8" },
    { id: '2', name: "Sky Search Travels", city: "Jeddah", address: "Prince Sultan Road, Al Rawdah", phone: "+966 12 000 0000", hours: "9 AM - 6 PM", mapUrl: "https://maps.app.goo.gl/2n82PcGfgrWYU45d8" }
  ],
  businessProfiles: [
    { id: '1', name: 'KH Dream Services', arabicName: 'كي اتش دريم للخدمات', logoUrl: 'https://i.ibb.co/pjjqSnRF/Logo-23D.png', address: 'King Fahd Road, Al Olaya District, Riyadh, KSA', vatId: '300000000000003', invoicePrefix: 'KHD', nextInvoiceNumber: 1001 },
    { id: '2', name: 'Sky Search Travels', arabicName: 'سكاي سيرش للسياحة', logoUrl: 'https://i.ibb.co/pjjqSnRF/Logo-23D.png', address: 'Prince Sultan Road, Al Rawdah, Jeddah, KSA', vatId: '300000000000004', invoicePrefix: 'SST', nextInvoiceNumber: 1001 },
    { id: '3', name: 'KH Dream Services Limited', arabicName: 'كي اتش دريم للخدمات المحدودة', logoUrl: 'https://i.ibb.co/pjjqSnRF/Logo-23D.png', address: 'Al Olaya District, Riyadh, KSA', vatId: '300000000000005', invoicePrefix: 'KHD', nextInvoiceNumber: 1001 }
  ],
  users: [
    { id: '1', username: 'admin', fullName: 'System Administrator', email: 'admin@khdreamservices.com', password: '●●●●●●●●', role: 'Admin', profilePic: '', permissions: AVAILABLE_PERMISSIONS.map(p => p.key) },
    { id: 'user-admin', username: 'maiinuddiin', fullName: 'Main Uddin', email: 'maiinuddiin@gmail.com', password: '●●●●●●●●', role: 'Admin', profilePic: '', permissions: AVAILABLE_PERMISSIONS.map(p => p.key) }
  ],
  blogPosts: [],
  hotDeals: [],
  subdomainRedirects: [],
  subscribers: [],
  newsletterSubscribers: [],
  couponSettings: {
    code: "DREAMTOUR10",
    amount: "100",
    type: "fixed",
    active: true,
    minimumSpend: "500",
    expiryDays: 30
  },
  claimedCoupons: [],
  reviews: [
    { id: '1', name: "Ahmed Al-Fahad", rating: 5, text: "Exceptional service! They handled my business setup in Riyadh with zero friction. Highly recommended for corporate services.", date: "2 days ago" },
    { id: '2', name: "Sarah Jenkins", rating: 5, text: "The luxury travel arrangements were beyond my expectations. Every detail was curated perfectly. Truly a bespoke experience.", date: "1 week ago" },
    { id: '3', name: "Mohammed Khan", rating: 5, text: "Fastest visa processing I've ever experienced. Their team is professional and very responsive on WhatsApp.", date: "3 weeks ago" }
  ],
  faqs: [
    { id: '1', question: 'What services do you offer?', answer: 'We offer a wide range of services including visa assistance, global hotel bookings, and business setup consultancy.' },
    { id: '2', question: 'How can I contact support?', answer: 'You can contact us via WhatsApp, email, or through our contact form on the website.' }
  ],
  messages: [
    {
      id: 'welcome-msg',
      senderId: 'system',
      senderName: 'Dream Studio',
      recipientId: 'admin',
      subject: 'Welcome to the Internal Mail System',
      content: 'Welcome to your new internal messaging system. You can communicate with other staff members and administrators securely here without using any 3rd party services.',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'internal'
    }
  ],
  features: {
    sectionTitle: 'Why Choose Us',
    sectionSubtitle: 'We provide specialized solutions for global mobility and business expansion.',
    items: [
      { iconName: 'Smile', title: 'Customer Delight', description: 'We deliver the best service and experience for our customer.' },
      { iconName: 'Mountain', title: 'Authentic Adventure', description: 'We deliver the real adventure experience for our customer.' },
      { iconName: 'Flag', title: 'Expert Guides', description: 'We deliver only expert tour guides for our customer.' },
      { iconName: 'RefreshCcw', title: 'Time Flexibility', description: 'We welcome time flexibility of traveling for our customer.' }
    ]
  },
  branding: {
    elevatingTitle: 'Elevating Your Global Ambitions',
    elevatingSubtitle: "We don't just provide services; we craft pathways for your success in Saudi Arabia and beyond. From seamless travel to complex business setups.",
    elevatingTitleSize: "text-2xl md:text-5xl",
    elevatingSubtitleSize: "text-sm md:text-lg",
    elevatingFeatures: [
      { icon: 'ShieldCheck', title: 'Secure Process', desc: 'Enterprise-grade data protection for all your documents.' },
      { icon: 'Clock', title: 'Rapid Execution', desc: 'Optimized workflows ensuring the fastest turnaround times.' },
      { icon: 'Zap', title: 'Expert Guidance', desc: 'Direct access to seasoned consultants and legal experts.' },
      { icon: 'Globe', title: 'Global Reach', desc: 'Extensive network covering over 50+ countries worldwide.' }
    ]
  },
  stats: {
    successfulVisas: '15,000+',
    businessSetups: '2,500+',
    globalPartners: '120+',
    globalReach: '45+',
    successfulVisasLabel: 'Successful Visas',
    successfulVisasDesc: 'Enterprise-grade data protection for all your documents.',
    businessSetupsLabel: 'Business Setups',
    businessSetupsDesc: 'Optimized workflows ensuring the fastest turnaround times.',
    globalPartnersLabel: 'Global Partners',
    globalPartnersDesc: 'Direct access to seasoned consultants and legal experts.',
    globalReachLabel: 'Global Reach',
    globalReachDesc: 'Extensive network covering over 50+ countries worldwide.'
  },
  successStories: {
    youtubePlaylistId: 'PLuD6-F_996_L_pI_v9_p_p_p_p_p_p_p',
    youtubePlaylistUrl: 'https://www.youtube.com/playlist?list=PLuD6-F_996_L_pI_v9_p_p_p_p_p_p_p',
    videoUrls: ['https://www.youtube.com/watch?v=ScMzIvxBSi4'],
    milestones: [
      { id: '1', title: 'Global Clients', value: '50,000+', icon: 'Users' },
      { id: '2', title: 'Countries Served', value: '120+', icon: 'Globe' },
      { id: '3', title: 'Success Rate', value: '99.9%', icon: 'Zap' },
    ],
  },
  visaOptions: {
    nationalities: ["Saudi Arabia", "Bangladesh", "United Kingdom", "USA", "India"],
    residencies: ["Saudi Arabia", "UAE", "Qatar", "Kuwait", "Oman"],
    destinations: ["United Kingdom", "USA", "Schengen Area", "Turkey", "Canada"],
    requirements: {}
  },
  businessOptions: {
    licenseTypes: ["Commercial", "Industrial", "Professional", "Service"],
    industryTypes: ["Technology", "Manufacturing", "Retail", "Healthcare"],
    requirements: {}
  },
  notifications: {
    topBar: {
      enabled: false,
      text: "Special Offer: Get 20% off on all Visa services this month!",
      texts: [
        "Special Offer: Get 20% off on all Visa services this month!",
        "Emergency Notification: System upgrade on Sunday at 2:00 AM UTC.",
        "Breaking News: New tourist guidelines announced for Saudi Arabia!"
      ],
      link: "/services",
      bgColor: "#DC2626",
      textColor: "#ffffff"
    },
    popup: {
      enabled: false,
      title: "Special Announcement",
      description: "We are excited to announce our new office in Dubai! Visit us for exclusive travel deals.",
      imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200",
      link: "/contact",
      buttonText: "Learn More"
    }
  },
  serviceCards: [
    {
      id: '1',
      title: 'Starter',
      description: 'Perfect for getting started',
      planDescription: 'Basic Umrah Package',
      price: '$0',
      priceSubtitle: '',
      isRecommended: false,
      iconUrl: '',
      imageUrl: '',
      features: [
        'মক্কা ও মদিনায় আরামদায়ক আবাসন',
        'অভিজ্ঞ ও বাংলাভাষী গাইডের তত্ত্বাবধান',
        'Basic Travel Insurance',
        'Email Support'
      ]
    },
    {
      id: '2',
      title: 'Pro',
      description: 'For most small groups',
      planDescription: 'Standard Umrah Package',
      price: '$29',
      priceSubtitle: '/person',
      isRecommended: true,
      iconUrl: '',
      imageUrl: '',
      features: [
        'VIP মক্কা ও মদিনা থাকাকালীন সেবা',
        'VVIP শীতাতপ নিয়ন্ত্রিত পরিবহন',
        'জিয়ারত ট্যুর সহ বিশেষ সুবিধা',
        '২৪/৭ ডেডিকেটেড ম্যানেজার',
        'প্রিমিয়াম হালাল খাবার'
      ]
    },
    {
      id: '3',
      title: 'Business',
      description: 'For corporate teams',
      planDescription: 'Corporate Umrah Package',
      price: '$79',
      priceSubtitle: '/person',
      isRecommended: false,
      iconUrl: '',
      imageUrl: '',
      features: [
        'Luxury ফাইভ স্টার হোটেল',
        'ব্যক্তিগত শেফ ও বিশেষ কুইজিন',
        'প্রাইভেট ট্রান্সফার ও প্রটোকল',
        'বিজনেস লাউঞ্জ অ্যাক্সেস',
        'কাস্টম ভ্রমণ পরিকল্পনা'
      ]
    }
  ],
  landingPages: [],
  customPopups: [],
  floatingCardItems: [
    { id: '1', name: 'YouTube Channel', logoUrl: '', buttonText: 'Subscribe', buttonLink: 'https://youtube.com', active: true },
    { id: '2', name: 'Newsletter', logoUrl: '', buttonText: 'Join Now', buttonLink: '#newsletter', active: true },
    { id: '3', name: 'Facebook', logoUrl: '', buttonText: 'Follow', buttonLink: 'https://facebook.com', active: true },
    { id: '4', name: 'TikTok', logoUrl: '', buttonText: 'Follow Us', buttonLink: 'https://tiktok.com', active: true },
    { id: '5', name: 'Instagram', logoUrl: '', buttonText: 'Follow', buttonLink: 'https://instagram.com', active: true },
  ],
  navbarLinks: [
    { id: '1', label: 'Home', url: '/', order: 0 },
    { id: '2', label: 'Hot Deals', url: '/hot-deals', order: 1 },
    { id: '3', label: 'Blog', url: '/blog', order: 2 },
    { id: '4', label: 'Services', url: '/#services', order: 3 },
    { id: '5', label: 'Contact', url: '/#contact', order: 4 },
  ],
  homeBlocks: [],
  homeSections: [],
  homeSectionsOrder: [
    'search',
    'stats',
    'services',
    'destinations',
    'whySaudiArabia',
    'blog',
    'successStories',
    'features',
    'reviews',
    'team',
    'partners'
  ],
  whySaudiArabia: {
    badge: "The Future is Here",
    title: "Why Saudi Arabia?",
    description: "Saudi Arabia is a land of incredible transformation and opportunity. Experience the fusion of ancient heritage and futuristic vision.",
    extraDescription: "Under Vision 2030, the Kingdom is opening its doors to the world, offering unprecedented opportunities for investors, entrepreneurs, and explorers alike.",
    mainImageUrl: "https://images.unsplash.com/photo-1551041777-ed07f99b67d8?auto=format&fit=crop&q=80&w=1200",
    secondaryImageUrl: "https://images.unsplash.com/photo-1586724230411-45b95fdfecf3?auto=format&fit=crop&q=80&w=800",
    tertiaryImageUrl: "https://images.unsplash.com/photo-1623869032733-1456170ce046?auto=format&fit=crop&q=80&w=800",
    features: [
      { id: '1', title: 'Vision 2030', description: 'A bold blueprint that is transforming the Kingdom into a global investment powerhouse.', icon: 'Flag' },
      { id: '2', title: 'Heritage', description: 'Home to multiple UNESCO World Heritage sites and rich cultural traditions.', icon: 'Globe' },
      { id: '3', title: 'Modernity', description: 'Futuristic mega-projects like NEOM and The Line redefined urban living.', icon: 'Zap' },
      { id: '4', title: 'Opportunity', description: 'One of the world\'s fastest-growing economies with massive investment potential.', icon: 'TrendingUp' }
    ],
    stats: [
      { id: '1', label: 'Economic Growth', value: '7.6', suffix: '%' },
      { id: '2', label: 'Investment Projects', value: '450', suffix: '+' },
      { id: '3', label: 'New Hubs', value: '12', suffix: '' }
    ]
  },
  visibility: {
    hero: true,
    search: true,
    services: true,
    destinations: true,
    blog: true,
    successStories: true,
    reviews: true,
    offices: true,
    whyChooseUs: true,
    whySaudiArabia: true,
    stats: true,
    team: true,
    partners: true,
    homeBlocks: true,
    footer: true,
    promoSlider: true,
    iqamaButton: true,
    serviceVisa: true,
    serviceHotel: true,
    serviceBusiness: true,
  },
  businessServices: [],
  bioHub: {
    companyName: "KH Dream Services",
    tagline: "Your Gateway to Saudi Arabia & Luxury Travel Solutions",
    logoUrl: "https://i.ibb.co/pjjqSnRF/Logo-23D.png",
    coverUrl: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=1200",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e293b",
    backgroundColor: "linear-gradient(to bottom, #0f172a, #1e293b, #0f172a)",
    textColor: "#f8fafc",
    glassEffect: true,
    whatsappNumber: "966537681618",
    phoneNumber: "966537681618",
    emailAddress: "info@khdreamservices.com",
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3622.756778401344!2d46.6713214!3d24.7135893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f131!3m3!1m2!1s0x3e2f0389de70e705%3A0x67dbad959550ca25!2sOlaya%20District%2C%20Riyadh%20Saudi%20Arabia!5e0!3m2!1sen!2s!4v1700000000000",
    businessHours: "9:00 AM - 6:00 PM (Sat - Thu)",
    bgOpacity: 50,
    cardThemeMode: "dark",
    cardOpacity: 50,
    cardBlur: 12,
    alertShow: true,
    alertTitle: "Emergency Alert Desk",
    alertContent: "Hotlines are fully operational 24/7 for immediate visa issues, passport logistics, or emergency travel & flight modifications. Contact the branch emergency desks below.",
    alertColor: "red",
    seo: {
      metaTitle: "KH Dream Services - Link-in-Bio & Business Hub",
      metaDescription: "Contact, locations, price list, FAQs, and social media connectivity for KH Dream Services.",
      ogImage: "https://i.ibb.co/pjjqSnRF/Logo-23D.png"
    },
    socials: [
      { id: "s1", platform: "Facebook", label: "Official Facebook Page", url: "https://facebook.com/khdreamservices", iconName: "Facebook", enabled: true, order: 0 },
      { id: "s2", platform: "Instagram", label: "Exclusive Instashots", url: "https://instagram.com/khdreamservices", iconName: "Instagram", enabled: true, order: 1 },
      { id: "s3", platform: "TikTok", label: "Watch Vlog on TikTok", url: "https://tiktok.com/@khdreamservices", iconName: "Video", enabled: true, order: 2 },
      { id: "s4", platform: "WhatsApp", label: "Direct Support WhatsApp", url: "https://wa.me/966537681618", iconName: "MessageCircle", enabled: true, order: 3 },
      { id: "s5", platform: "YouTube", label: "Subscribe YouTube Channel", url: "https://youtube.com", iconName: "Youtube", enabled: true, order: 4 }
    ],
    branches: [
      { id: "b1", name: "Riyadh Head Office", manager: "Kazi Shofi", phone: "966537681618", whatsapp: "966537681618", email: "riyadh@khdreamservices.com", address: "Olaya District, King Fahd Road, Riyadh, Saudi Arabia", locationUrl: "https://maps.google.com/?q=Olaya,Riyadh,Saudi+Arabia", workingHours: "9:00 AM - 6:00 PM (Sat - Thu)", imageUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600", views: 42 },
      { id: "b2", name: "Dhaka Executive Office", manager: "Hasan Ahmed", phone: "8801700000000", whatsapp: "8801700000001", email: "dhaka@khdreamservices.com", address: "Gulshan-2, Dhaka, Bangladesh", locationUrl: "https://maps.google.com/?q=Gulshan-2,Dhaka,Bangladesh", workingHours: "10:00 AM - 7:00 PM (Sun - Thu)", imageUrl: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=600", views: 24 }
    ],
    services: [
      { id: "srv1", name: "Saudi Business Setup Consultancy", description: "End-to-end commercial trade licensing, office setup, & sponsorship clearance inside the Kingdom of Saudi Arabia.", price: "Starting $2,500", category: "Corporate", featured: true, imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600", enabled: true },
      { id: "srv2", name: "Premium Umrah Exclusive Package", description: "VIP group and individual reservations with 5-star hotel towers close to Makkah/Madinah Haram, including private land transfers.", price: "Request Quote", category: "Tourism", featured: true, imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600", enabled: true },
      { id: "srv3", name: "General Residency & Visa Advisory", description: "Expert consultation for Saudi Premium Residency (KSA Gold Visa), investor, family visit visas, and document legalizations.", price: "$1,500 / Prep", category: "Visas", featured: false, imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600", enabled: true }
    ],
    faqs: [
      { id: "f1", question: "How long does it take to register a foreign company in Saudi Arabia?", answer: "Normally, setting up a company and registering with MISA takes between 2 to 4 weeks, depending on the commercial license type and ministry clearances.", order: 0 },
      { id: "f2", question: "Can you arrange custom family visit and tourist packages?", answer: "Yes! Our team crafts custom tourism solutions, arranging premium accommodation, luxury land transportation, tour guides, and fast visa approvals.", order: 1 }
    ],
    testimonials: [
      { id: "t1", name: "Sulaiman Al-Harbi", rating: 5, text: "Excellent and highly reliable business services in Riyadh. They handled our commercial registration in record time.", date: "April 2026", enabled: true },
      { id: "t2", name: "Anisur Rahman", rating: 5, text: "The premium Umrah package was an absolute dream. Everything was perfectly organized from landing to departures.", date: "March 2026", enabled: true }
    ],
    analytics: {
      visitorsCount: 0,
      qrScansCount: 0,
      clicksCount: {},
      buttonClicks: { whatsapp: 0, call: 0, saveContact: 0, share: 0 }
    }
  },
  companyProfile: {
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
    secondaryColor: "#c5a880",
    backgroundColor: "#faf9f6",
    textColor: "#1e293b",
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    sections: [
      {
        id: "sec_history",
        title: "Company History & Vision",
        subtitle: "Strategic Bridgeholders of Global Ambitions",
        content: "Founded in 2009, KH Dream Services Limited has evolved from a boutique administrative agency into Saudi Arabia's preeminent full-service corporate advisory and luxury travel gateway. Over 17 years of operational excellence, we have designed customized compliance-assured frameworks that empower foreign conglomerates, multi-family offices, and global startups to register, operate, and scale seamlessly in the GCC region. We combine deep institutional knowledge of local administrative codes with world-class travel speed.",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
        shapeType: "diagonal-slice"
      },
      {
        id: "sec_ceo",
        title: "CEO Message",
        subtitle: "Corporate Vision under Vision 2030",
        content: "Under Vision 2030, Saudi Arabia is experiencing an unprecedented era of economic expansion. Our mission is to pave a seamless, compliance-assured gateway for entrepreneurs and enterprises to establish their presence and thrive in the Kingdom. We combine localized legal intelligence with premium global concierge services, ensuring your travel and corporate setup are executed with absolute discretion and excellence. We do not simply process applications; we secure your legacy in the Kingdom.",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600",
        shapeType: "hexagon"
      },
      {
        id: "sec_mission_vision",
        title: "Our Core Pillars",
        subtitle: "Mission & Absolute Value Delivery",
        content: "We commit to speed, absolute compliance, and tailored luxury operations. Whether securing complex foreign investment permits or managing pristine VIP Umrah transfers, we believe in long-term partnerships built on trust, discretion, and executive-level performance.",
        image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800",
        shapeType: "rounded-blob"
      }
    ],
    stats: [
      { id: "st1", value: "17+", label: "Years Excellence", icon: "Clock" },
      { id: "st2", value: "2.5K+", label: "Business Setups", icon: "Briefcase" },
      { id: "st3", value: "15K+", label: "Successful Visas", icon: "FileText" },
      { id: "st4", value: "99.9%", label: "Approval Rate", icon: "Award" }
    ],
    locations: [
      { id: "loc1", name: "Riyadh Head Office", address: "Olaya District, King Fahd Road, Riyadh, Saudi Arabia", phone: "966537681618", email: "riyadh@khdreamservices.com", workingHours: "9:00 AM - 6:00 PM (Sat - Thu)" },
      { id: "loc2", name: "Dhaka Executive Branch", address: "Gulshan-2, Dhaka, Bangladesh", phone: "8801700000000", email: "dhaka@khdreamservices.com", workingHours: "10:00 AM - 7:00 PM (Sun - Thu)" }
    ],
    partners: [
      { id: "p1", name: "MISA (Ministry of Investment)", logoUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=120" },
      { id: "p2", name: "Sagia Approved Partners", logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120" }
    ],
    branchCities: "Riyadh - Jeddah - Dhaka",
    aboutText: "KH Dream Services Limited is a premier corporate advisory institution specializing in high-friction government licensing, commercial registration, and customized corporate operations under Saudi Vision 2030. Over the past 17 years, we have designed customized frameworks that empower foreign conglomerates, multi-family offices, and global startups to register, operate, and scale seamlessly in the GCC region. Our strength lies in deep institutional knowledge of local administrative codes combined with world-class service speed.",
    missionTitle: "MISSION CORE",
    missionSubtitle: "Turnkey Portals",
    missionText: "Speed and absolute compliance for setups and premium VIP transfers.",
    visionTitle: "VISION BENCHMARK",
    visionSubtitle: "Gold Standard",
    visionText: "To be the foremost advisory of choice for global family offices.",
    relationshipTitle: "Relationship Stewardship",
    relationshipSubtitle: "Proactive Stewardship",
    relationshipText: "At KH Dream Services, relationship stewardship is our absolute core promise. We believe client relations should be proactive rather than responsive. Every corporate contract is paired with a dedicated bilingual Relationship Director (bilingual in English & Arabic) who serves as an active compliance guardian. We establish custom real-time messaging tunnels, schedule bi-weekly operational check-ins, and handle all renewal cycles, ministry correspondence, and regulatory inquiries seamlessly. This ensures you can focus purely on business growth while we safeguard your regulatory health.",
    relationshipImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400",
    relationshipCheckText: "Active Compliance Monitoring & Zero Penalty Guarantee",
    service1Title: "Saudi Business Setup & FDI Permitting",
    service1Subtitle: "KSA INVESTMENT INCUBATOR",
    service1Text: "We handle the complete corporate lifecycle of foreign entities entering Saudi Arabia. We bypass bureaucratic complexity by directly interfacing with the Ministry of Investment (MISA) and Ministry of Commerce to secure foreign investment permits, commercial registrations (CR), tax registrations, and Chamber of Commerce approvals. We deliver compliance-assured speed.",
    service1Bullets: ["MISA Foreign Licensing", "CR Establishment Setup", "Bank Introductions", "ZATCA Filing Systems"],
    service1Image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=400",
    service2Title: "Worldwide Visit Visa Solutions",
    service2Subtitle: "GLOBAL IMMIGRATION DESK",
    service2Text: "We operate a specialized global visa desk providing structured, turn-key processing for personal, corporate, and investor travel. Our team handles complete dossier preparation, consular pre-checks, secure appointment scheduling, and biometrics organization for travel all across the world.",
    service2Bullets: ["Schengen Pathways", "UK & US Business Permits", "Canada Tourist Routes", "GCC Transit Permits"],
    service2Image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400",
    caseStudiesTitle: "Business Setup Success Stories",
    caseStudiesText: "Compelling case studies demonstrating how our dual expertise in MISA licensing and premium executive logistics delivers unmatched turnaround speed and operational safety in the Kingdom.",
    caseStudy1Tag: "TECH FINTECH // LONDON",
    caseStudy1Title: "TechFlow FinTech (London)",
    caseStudy1Challenge: "Securing 100% foreign-owned financial services licensing under strict compliance standards.",
    caseStudy1Outcome: "Turnaround: 8 Working Days // FDI Ingress: $15,000,000",
    caseStudy2Tag: "LOGISTICS // FRANKFURT",
    caseStudy2Title: "EuroFood Cold Chain",
    caseStudy2Challenge: "Coordinating industrial warehouse clearances and customs registers across three major economic hubs.",
    caseStudy2Outcome: "Scope: Riyadh, Jeddah, Dammam // SLA: Zero Penalties",
    caseStudy3Tag: "HEAVY INDUSTRY",
    caseStudy3Title: "SinoManufacture Joint",
    caseStudy3Challenge: "Co-structuring a complex steel JV and securing immediate bilateral custom tariff concessions.",
    caseStudy3Outcome: "Startup Saving: 18% Logistics Capital // Visa Quota: 120 Engineers",
    accreditationsTitle: "Institutional Approvals",
    accreditationsSubtitle: "AFFILIATIONS",
    accreditations: [
      { id: "ac1", name: "MISA Approved", code: "MINISTRY OF INVESTMENT" },
      { id: "ac2", name: "Sagia Liaison", code: "SAGIA LIAISON AUTH" }
    ],
    guaranteeTitle: "Profile Verification Guarantee",
    guaranteeText: "All compliance assertions, Ministry authorizations, and visa quotas correspond directly to regulations of Riyadh Chamber & Ministry of Investment.",
    footerNote: "All corporate credentials are legally verified under the active laws of Saudi Arabia."
  }
};

interface CMSContextType {
  data: CMSData;
  updateData: (newData: Partial<CMSData> | ((prev: CMSData) => Partial<CMSData>)) => void;
  saveChanges: (newData?: CMSData) => Promise<boolean>;
  resetToDefaults: () => void;
  isLoaded: boolean;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  checkSessionActive: () => Promise<boolean>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Helper to ensure data integrity and avoid runtime crashes on missing properties
  const healData = (raw: any): CMSData => {
    // If the data is fundamentally broken, return defaults
    if (!raw || typeof raw !== 'object') return DEFAULT_DATA;
    
    // Deep merge visibility to prevent missing key errors
    const visibility = { 
      ...DEFAULT_DATA.visibility, 
      ...(raw.visibility || {}) 
    };

    // Create a new object with DEFAULT_DATA as base, then overlay raw data
    const data = { ...DEFAULT_DATA, ...raw, visibility };
    
    // Robust array checks with fallbacks to empty arrays if needed
    data.blogPosts = Array.isArray(raw.blogPosts) ? raw.blogPosts : (DEFAULT_DATA.blogPosts || []);
    data.users = Array.isArray(raw.users) ? raw.users : (DEFAULT_DATA.users || []);
    data.promoSlider = Array.isArray(raw.promoSlider) ? raw.promoSlider : (DEFAULT_DATA.promoSlider || []);
    data.catalogue = Array.isArray(raw.catalogue) ? raw.catalogue : (DEFAULT_DATA.catalogue || []);
    data.team = Array.isArray(raw.team) ? raw.team : (DEFAULT_DATA.team || []);
    data.offices = Array.isArray(raw.offices) ? raw.offices : (DEFAULT_DATA.offices || []);
    data.navbarLinks = Array.isArray(raw.navbarLinks) ? raw.navbarLinks : (DEFAULT_DATA.navbarLinks || []);
    data.homeBlocks = Array.isArray(raw.homeBlocks) ? raw.homeBlocks : (DEFAULT_DATA.homeBlocks || []);
    data.homeSections = Array.isArray(raw.homeSections) ? raw.homeSections : (DEFAULT_DATA.homeSections || []);
    data.homeSectionsOrder = Array.isArray(raw.homeSectionsOrder) ? raw.homeSectionsOrder : (DEFAULT_DATA.homeSectionsOrder || []);
    data.landingPages = Array.isArray(raw.landingPages) ? raw.landingPages : (DEFAULT_DATA.landingPages || []);
    data.customPopups = Array.isArray(raw.customPopups) ? raw.customPopups : (DEFAULT_DATA.customPopups || []);
    data.hotDeals = Array.isArray(raw.hotDeals) ? raw.hotDeals : (DEFAULT_DATA.hotDeals || []);
    data.reviews = Array.isArray(raw.reviews) ? raw.reviews : (DEFAULT_DATA.reviews || []);
    data.messages = Array.isArray(raw.messages) ? raw.messages : (DEFAULT_DATA.messages || []);
    data.deletedMessageIds = Array.isArray(raw.deletedMessageIds) ? raw.deletedMessageIds : [];
    data.businessProfiles = Array.isArray(raw.businessProfiles) ? raw.businessProfiles : (DEFAULT_DATA.businessProfiles || []);
    data.businessServices = Array.isArray(raw.businessServices) ? raw.businessServices : [];
    data.serviceCards = Array.isArray(raw.serviceCards) ? raw.serviceCards : (DEFAULT_DATA.serviceCards || []);
    data.subscribers = Array.isArray(raw.subscribers) ? raw.subscribers : (DEFAULT_DATA.subscribers || []);
    data.faqs = Array.isArray(raw.faqs) ? raw.faqs : (DEFAULT_DATA.faqs || []);
    data.features = raw.features && typeof raw.features === 'object' && !Array.isArray(raw.features) 
      ? { 
          ...DEFAULT_DATA.features, 
          ...raw.features,
          items: Array.isArray((raw.features as any).items) ? (raw.features as any).items : (DEFAULT_DATA.features?.items || [])
        } 
      : (DEFAULT_DATA.features || { sectionTitle: '', sectionSubtitle: '', items: [] });
    data.successStories = { ...DEFAULT_DATA.successStories, ...(raw.successStories || {}) };
    data.whySaudiArabia = raw.whySaudiArabia ? { ...DEFAULT_DATA.whySaudiArabia, ...raw.whySaudiArabia } : DEFAULT_DATA.whySaudiArabia;
    
    // Nested objects merging
    data.general = { ...DEFAULT_DATA.general, ...(raw.general || {}) };
    data.branding = { ...DEFAULT_DATA.branding, ...(raw.branding || {}) };
    data.stats = { ...DEFAULT_DATA.stats, ...(raw.stats || {}) };
    data.notifications = { ...DEFAULT_DATA.notifications, ...(raw.notifications || {}) };
    data.homeSettings = { ...DEFAULT_DATA.homeSettings, ...(raw.homeSettings || {}) };

    data.bioHub = raw.bioHub 
      ? { 
          ...DEFAULT_DATA.bioHub, 
          ...raw.bioHub,
          seo: { ...DEFAULT_DATA.bioHub?.seo, ...(raw.bioHub.seo || {}) },
          analytics: { ...DEFAULT_DATA.bioHub?.analytics, ...(raw.bioHub.analytics || {}) },
          socials: Array.isArray(raw.bioHub.socials) ? raw.bioHub.socials : (DEFAULT_DATA.bioHub?.socials || []),
          branches: Array.isArray(raw.bioHub.branches) ? raw.bioHub.branches : (DEFAULT_DATA.bioHub?.branches || []),
          services: Array.isArray(raw.bioHub.services) ? raw.bioHub.services : (DEFAULT_DATA.bioHub?.services || []),
          faqs: Array.isArray(raw.bioHub.faqs) ? raw.bioHub.faqs : (DEFAULT_DATA.bioHub?.faqs || []),
          testimonials: Array.isArray(raw.bioHub.testimonials) ? raw.bioHub.testimonials : (DEFAULT_DATA.bioHub?.testimonials || [])
        } 
      : DEFAULT_DATA.bioHub;

    data.companyProfile = raw.companyProfile 
      ? { 
          ...DEFAULT_DATA.companyProfile, 
          ...raw.companyProfile,
          sections: Array.isArray(raw.companyProfile.sections) ? raw.companyProfile.sections : (DEFAULT_DATA.companyProfile?.sections || []),
          stats: Array.isArray(raw.companyProfile.stats) ? raw.companyProfile.stats : (DEFAULT_DATA.companyProfile?.stats || []),
          locations: Array.isArray(raw.companyProfile.locations) ? raw.companyProfile.locations : (DEFAULT_DATA.companyProfile?.locations || []),
          partners: Array.isArray(raw.companyProfile.partners) ? raw.companyProfile.partners : (DEFAULT_DATA.companyProfile?.partners || [])
        } 
      : DEFAULT_DATA.companyProfile;

    return data;
  };

  const [data, setData] = useState<CMSData>(() => {
    // Check localStorage cache first, auto-refresh if code version changed
    try {
      if (typeof window !== 'undefined') {
        const cachedVer = localStorage.getItem('kh_dream_cms_cache_ver');
        const local = localStorage.getItem('kh_dream_cms_v6');
        if (cachedVer === APP_CACHE_VERSION && local) {
          return healData(JSON.parse(local));
        } else {
          // Version updated: seamlessly load the latest fresh defaults
          localStorage.setItem('kh_dream_cms_cache_ver', APP_CACHE_VERSION);
          localStorage.setItem('kh_dream_cms_v6', JSON.stringify(DEFAULT_DATA));
          return healData(DEFAULT_DATA);
        }
      }
    } catch (e) {
      console.warn("CMSContext: Error reading initial local cache", e);
    }
    return healData(DEFAULT_DATA);
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(true);

  useEffect(() => {
    let active = true;
    let retryTimeout: any = null;
    let fetchAttempts = 0;

    const fetchCMSData = async () => {
      fetchAttempts++;
      
      const timeoutId = setTimeout(() => {
        if (active) {
          setIsLoaded(true);
        }
      }, 3000);

      try {
        const token = localStorage.getItem('kh_admin_token');
        const response = await fetch(`/api/cms?t=${Date.now()}`, {
          headers: { 
            'x-admin-token': token || '',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          cache: 'no-store',
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 403 || response.status === 401) {
            if (token) {
              localStorage.removeItem('kh_admin_token');
              localStorage.removeItem('kh_dream_session');
              setCurrentUser(null);
            }
            if (active) setIsLoaded(true);
            return;
          }
          // On static hosts like GitHub Pages where /api/cms doesn't exist (404)
          if (active) setIsLoaded(true);
          return;
        }

        const serverData = await response.json();
        if (serverData && !serverData.error) {
          if (!active) return;
          
          // Sync current user and session keys if identified by cookie/session cross-subdomains
          if (serverData.identifiedUser) {
            if (!currentUser) {
              setCurrentUser(serverData.identifiedUser);
            }
            if (serverData.token && !localStorage.getItem('kh_admin_token')) {
              console.log("[CMSContext] Auto-restored token cross-subdomain from admin_session cookie");
              localStorage.setItem('kh_admin_token', serverData.token);
              localStorage.setItem('kh_dream_session', JSON.stringify({ user: serverData.identifiedUser, loginTime: Date.now() }));
            }
          } else if (token) {
            console.warn("[CMSContext] Token existed in localStorage but server did not verify/identify the admin session. Logging out.");
            handleSetCurrentUser(null);
          }

          setData(prev => {
            try {
              const healed = healData(serverData);
              const finalUsers = (healed.users || []).map((u: any) => {
                const existingUser = prev.users?.find(eu => eu.id === u.id);
                const useLocalPassword = existingUser?.password && existingUser.password !== '●●●●●●●●' && existingUser.password !== u.password;
                return {
                  ...u,
                  password: useLocalPassword ? existingUser.password : (u.password || ''),
                  permissions: u.permissions || []
                };
              });
              
              return { ...healed, users: finalUsers };
            } catch (err) {
              console.error("CMSContext: Error during state update", err);
              return prev;
            }
          });
          
          if (active) {
            setIsLoaded(true);
          }
        } else {
          if (active) setIsLoaded(true);
        }
      } catch (e) {
        // Fallback for static hosting / network errors
        if (active) setIsLoaded(true);
        
        const local = localStorage.getItem('kh_dream_cms_v6');
        if (local) {
          try {
            setData(healData(JSON.parse(local)));
          } catch (err) { console.error("CMSContext: Local fallback failed", err); }
        }

        // Silent background retry in case server was starting up
        if (active && fetchAttempts < 3) {
          retryTimeout = setTimeout(fetchCMSData, 5000);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };

    fetchCMSData();

    return () => {
      active = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, []);

  // Sync re-fetch whenever token changes (post-login)
  useEffect(() => {
    const token = localStorage.getItem('kh_admin_token');
    if (token && isLoaded) {
      const reFetch = async () => {
        try {
          const response = await fetch(`/api/cms?t=${Date.now()}`, {
            headers: { 
              ...(token ? { 'x-admin-token': token } : {}),
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            cache: 'no-store',
            credentials: 'include'
          });
          if (response.ok) {
            const serverData = await response.json();
            if (serverData) {
               setData(prev => ({
                 ...prev,
                 ...serverData,
                 general: { ...(prev.general || {}), ...(serverData.general || {}) },
                 users: serverData.users || prev.users || []
               }));
            }
          }
        } catch (e) { console.error("CMSContext: Post-login sync failed", e); }
      };
      reFetch();
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const session = localStorage.getItem('kh_dream_session');
    if (session) {
      try {
        const { user, loginTime } = JSON.parse(session);
        
        // Session persistence logic - exactly 24 hours
        const now = new Date();
        const expirationTime = loginTime + (24 * 60 * 60 * 1000); 

        if (now.getTime() < expirationTime) {
          setCurrentUser({
            ...user,
            permissions: user.permissions || []
          });
        } else {
          console.log("CMSContext: Session expired. Logging out.");
          logout();
        }
      } catch (e) { 
        console.error("CMSContext: Session restore failed", e);
        logout(); 
      }
    }
  }, []);

  // Periodic active session monitor to auto-logout the user even if they keep the browser tab open
  useEffect(() => {
    const checkSessionExpiration = () => {
      const session = localStorage.getItem('kh_dream_session');
      if (session) {
        try {
          const { loginTime } = JSON.parse(session);
          const now = Date.now();
          // Expiration at exactly 24 hours
          const expirationTime = loginTime + (24 * 60 * 60 * 1050);
          if (now >= expirationTime) {
            console.log("CMSContext: Session expired via background timer. Automating logout.");
            logout();
          }
        } catch (e) {
          console.error("CMSContext: Periodic session check nested error", e);
          logout();
        }
      }
    };

    const handleFocusCheck = () => checkSessionExpiration();
    window.addEventListener('focus', handleFocusCheck);
    window.addEventListener('visibilitychange', handleFocusCheck);

    // Run check every 15 seconds
    const intervalId = setInterval(checkSessionExpiration, 15000);

    return () => {
      window.removeEventListener('focus', handleFocusCheck);
      window.removeEventListener('visibilitychange', handleFocusCheck);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const handler = setTimeout(() => {
        try {
          localStorage.setItem('kh_dream_cms_v6', JSON.stringify(data));
        } catch (e) {
          console.warn("CMSContext: Local storage quota exceeded or failed", e);
        }
      }, 2000); // Debounce to prevent blocking on every keystroke
      return () => clearTimeout(handler);
    }
  }, [data, isLoaded]);

  const updateData = (newData: Partial<CMSData> | ((prev: CMSData) => Partial<CMSData>)) => {
    setData(prev => {
      const updates = typeof newData === 'function' ? newData(prev) : newData;
      return { ...prev, ...updates };
    });
  };

  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('kh_dream_session', JSON.stringify({ user, loginTime: Date.now() }));
    } else {
      localStorage.removeItem('kh_dream_session');
      localStorage.removeItem('kh_admin_token');
      // Also clear cookie via logout endpoint if possible
    }
  };

  const logout = async () => {
    handleSetCurrentUser(null);
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const checkSessionActive = async (): Promise<boolean> => {
    const token = localStorage.getItem('kh_admin_token');
    if (!token) {
      if (currentUser) {
        handleSetCurrentUser(null);
      }
      return false;
    }

    try {
      const response = await fetch('/api/auth/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        credentials: 'include'
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData && resData.valid) {
          // Sync current user if roles/permissions changed
          if (resData.user && (!currentUser || currentUser.id !== resData.user.id || currentUser.role !== resData.user.role)) {
            handleSetCurrentUser(resData.user);
          }
          return true;
        } else {
          console.warn("Session verification failed on server:", resData?.error);
          handleSetCurrentUser(null);
          return false;
        }
      } else {
        // Safe fallback in case of absolute connection timeout, but behave conservatively
        return true;
      }
    } catch (e) {
      console.error("Error verifying active session:", e);
      return true;
    }
  };

  const saveChanges = async (manualData?: CMSData): Promise<boolean> => {
    if (!isLoaded) {
      console.warn("CMSProvider: Cannot save changes while data is still loading from server.");
      return false;
    }
    const dataToSave = manualData || data;
    const token = localStorage.getItem('kh_admin_token');

    // Proactive Check: verify session status dynamically before saving data to server
    const isSessionActive = await checkSessionActive();
    if (!isSessionActive) {
      handleSetCurrentUser(null);
      throw new Error("Your session has expired or is invalid. Please log in again to save your changes.");
    }

    try {
      const response = await fetch('/api/cms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'x-admin-token': token } : {})
        },
        body: JSON.stringify(dataToSave),
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Static host (e.g. GitHub Pages): save locally
          localStorage.setItem('kh_dream_cms_v6', JSON.stringify(dataToSave));
          localStorage.setItem('kh_dream_cms_cache_ver', APP_CACHE_VERSION);
          setData(dataToSave);
          return true;
        }

        let errorMessage = `Server responded with ${response.status}`;
        let errorData: any = {};
        
        try {
          const text = await response.text();
          try {
            errorData = JSON.parse(text);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = text.slice(0, 100) || errorMessage;
          }
        } catch (e) {
          // Fallback if reading text fails
        }
        
        // Handle session expiration or unauthorized access
        if (response.status === 401 || response.status === 403) {
          const isExpired = errorData.code === 'SESSION_EXPIRED' || 
                           errorMessage.toLowerCase().includes('expired') ||
                           errorMessage.toLowerCase().includes('authorized') ||
                           errorMessage.toLowerCase().includes('session');
          
          if (isExpired) {
            console.warn("CMSContext: Session invalidation detected. Clearing local session.");
            handleSetCurrentUser(null); // This clears localStorage too
            throw new Error("Your session has expired or is invalid. Please log in again to save your changes.");
          }
        }
        
        throw new Error(errorMessage);
      }
      
      localStorage.setItem('kh_dream_cms_v6', JSON.stringify(dataToSave));
      localStorage.setItem('kh_dream_cms_cache_ver', APP_CACHE_VERSION);
      if (currentUser) {
        const updatedUser = dataToSave.users.find(u => u.id === currentUser?.id);
        if (updatedUser) handleSetCurrentUser(updatedUser);
      }
      console.log("[CMS] System Synchronized with Server.");
      return true;
    } catch (e) {
      console.error("CRITICAL: Failed to save CMS data to server", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      alert(`Failed to sync with server: ${errorMessage}\n\nChanges saved locally in your browser.`);
      return false;
    }
  };

  const resetToDefaults = () => {
    if (confirm("Reset to default?")) {
      setData(DEFAULT_DATA);
      localStorage.removeItem('kh_dream_cms_v6');
      window.location.reload();
    }
  };

  return (
    <CMSContext.Provider value={{ data, updateData, saveChanges, resetToDefaults, isLoaded, currentUser, setCurrentUser: handleSetCurrentUser, logout, checkSessionActive }}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) throw new Error("useCMS must be used within CMSProvider");
  return context;
};
