var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var CMSContext_exports = {};
__export(CMSContext_exports, {
  AVAILABLE_PERMISSIONS: () => AVAILABLE_PERMISSIONS,
  CMSProvider: () => CMSProvider,
  useCMS: () => useCMS
});
module.exports = __toCommonJS(CMSContext_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_react = require("react");
const AVAILABLE_PERMISSIONS = [
  { key: "wall", label: "My Wall" },
  { key: "blog", label: "Blog Writing" },
  { key: "invoices", label: "Invoices & Companies" },
  { key: "sadad-invoices", label: "Quick Receipts" },
  { key: "catalogue", label: "Destinations" },
  { key: "reviews", label: "Client Reviews" },
  { key: "promo", label: "Promotions" },
  { key: "hero", label: "Hero Slides" },
  { key: "service-cards", label: "Service Cards" },
  { key: "subscribers", label: "Subscribers" },
  { key: "general", label: "Site Settings" },
  { key: "services", label: "Services" },
  { key: "footer-popups", label: "Footer Popups" },
  { key: "team", label: "Team Members" },
  { key: "users", label: "User Accounts" },
  { key: "landing-pages", label: "Landing Pages" },
  { key: "custom-popups", label: "Popup Modals" },
  { key: "navbar", label: "Navbar Menu" },
  { key: "broadcast", label: "Email Broadcasting" },
  { key: "system-config", label: "System Variables" },
  { key: "notifications", label: "Emergency Alerts" },
  { key: "subdomains", label: "Domain Settings" },
  { key: "floating-cards", label: "Floating Info" },
  { key: "home-blocks", label: "Home Page Control" },
  { key: "security", label: "Security Protocols" },
  { key: "partners", label: "Scrolling Partners" },
  { key: "faqs", label: "FAQ Section" },
  { key: "mailbox", label: "Internal Mailbox" }
];
const DEFAULT_DATA = {
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
    themeColor: "#2563eb",
    secondaryColor: "#111827",
    accentColor: "#3b82f6",
    serviceBarColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    heroTitleLastWordColor: "linear-gradient(to right, #34d399, #14b8a6, #34d399)",
    heroButtonText: "Explore Now",
    hotelSearchButtonText: "WhatsApp",
    visaSearchButtonText: "Check Requirements",
    businessSetupButtonText: "Consult Experts",
    packageBookButtonText: "\u098F\u0996\u09A8\u09BF \u09AC\u09C1\u0995 \u0995\u09B0\u09C1\u09A8",
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
      blogPage: { title: 'Travel <span class="text-primary">Blog</span>', subtitle: "Wanderlust Chronicles & Global Adventures", titleSize: "text-3xl md:text-5xl", subtitleSize: "text-[10px] md:text-xs" },
      hotDeals: { title: 'Exclusive <span class="text-primary">Travel Deals</span>', subtitle: "Limited Time Offers & Flash Sales", titleSize: "text-3xl md:text-5xl", subtitleSize: "text-[10px] md:text-xs" },
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
      hero: { text: "Explore Packages", type: "link", link: "#packages", whatsapp: "", phone: "", email: "" },
      hotelSearch: { text: "Search Hotels", type: "whatsapp", link: "", whatsapp: "", phone: "", email: "" },
      visaSearch: { text: "Apply Now", type: "whatsapp", link: "", whatsapp: "", phone: "", email: "" },
      businessSetup: { text: "Get Started", type: "whatsapp", link: "", whatsapp: "", phone: "", email: "" },
      packageBook: { text: "Book Now", type: "whatsapp", link: "", whatsapp: "", phone: "", email: "" },
      destinationExplore: { text: "Explore", type: "link", link: "", whatsapp: "", phone: "", email: "" },
      destinationBook: { text: "Book Trip", type: "whatsapp", link: "", whatsapp: "", phone: "", email: "" },
      blogReadGuide: { text: "Read Guide", type: "link", link: "", whatsapp: "", phone: "", email: "" },
      blogViewAll: { text: "View All Posts", type: "link", link: "", whatsapp: "", phone: "", email: "" },
      newsletter: { text: "Subscribe", type: "link", link: "", whatsapp: "", phone: "", email: "" },
      footerCta: { text: "Contact Us", type: "whatsapp", link: "", whatsapp: "", phone: "", email: "" },
      navbarContact: { text: "Contact Us", type: "scroll", link: "", whatsapp: "", phone: "", email: "" }
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
      passwordPolicy: "strong"
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
    copyright: "\xA9 2026 KH Dream Services Limited. All rights reserved.",
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
      id: "1",
      title: "Saudi Arabia Golden Visa Assistance",
      label: "Golden Visa",
      img: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&q=80",
      location: "Riyadh, Saudi Arabia",
      duration: "5-7 Days",
      rating: "5.0",
      reviewsCount: "24",
      price: "SAR 1,800",
      oldPrice: "SAR 2,200",
      isFeatured: true,
      authorImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
      details: "Get professional pre-screening and document coordination for the Saudi Golden Visa programs. We handle state registry portal filing, medical report certification assistance, and premium concierge delivery.",
      inclusions: [
        "Complete assessment of eligibility requirements & golden investment criteria",
        "Official Government portal pre-filing setup and matching form compilation",
        "Direct coordination with Ministry of Investment counterparts",
        "Priority document translation assistance & certificate attestation checks"
      ],
      exclusions: [
        "Flexible Airline confirmed itineraries and hotel reservation booking layouts",
        "Saudi Ministry official government golden visa fee values (processed standardly)",
        "Local legal medical examination checkup fee values"
      ],
      advisoryText: "Ensure your investment records, salary histories or property documents are stamped and authenticated by foreign affairs before scheduling biometrics."
    },
    {
      id: "2",
      title: "Schengen Area Premium Visa Filing",
      label: "Schengen Visa",
      img: "https://images.unsplash.com/photo-1623869032733-1456170ce046?auto=format&fit=crop&q=80",
      location: "Schengen & UK",
      duration: "10-14 Days",
      rating: "4.9",
      reviewsCount: "18",
      price: "SAR 2,500",
      oldPrice: "SAR 3,000",
      isFeatured: true,
      authorImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      details: "Step-by-step document assembly, flight & hotel reservation holds for embassy checklist, travel insurance certificates, and early biometric appointment coordination.",
      inclusions: [
        "Embassy-compliant travel health insurance documentation package",
        "Confirmed flight reservation and verified hotel accommodation voucher holds",
        "Biometric slot tracking and booking on VFS Global / TLS Contact platforms",
        "Precision review of visa application forms and cover letter templates"
      ],
      exclusions: [
        "Direct airline real-ticket purchasing services (unless requested customly)",
        "VFS / TLS concierge service fee or official embassy application fees",
        "Courier returns handling directly to home addresses if processed outside"
      ],
      advisoryText: "Original passport must have at least 2 empty pages and minimum 6 months validity from the planned date of departure."
    },
    {
      id: "3",
      title: "USA B1/B2 Tourism & Business Visa Desk",
      label: "US Visa Combo",
      img: "https://images.unsplash.com/photo-1590418606746-018840fb9cd0?auto=format&fit=crop&q=80",
      location: "United States",
      duration: "15-20 Days",
      rating: "4.7",
      reviewsCount: "32",
      price: "SAR 3,200",
      oldPrice: "SAR 3,500",
      isFeatured: false,
      authorImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=Omar",
      details: "DS-160 application form assistance, digital visa image vetting, embassy appointment scheduler queue supervision, and complete mock interview questionnaire preparation sessions.",
      inclusions: [
        "Pre-submission vetting of the complete DS-160 online form records",
        "Mock interview sessions with specialized counselors and prep documents",
        "Payment of SEVIS or standard consulate machinery fees if requested",
        "Confirmed flight route reservations for the travel schedule planning"
      ],
      exclusions: [
        "Official government MRV travel visa visa fees (unless standard invoice chosen)",
        "Personal flight seat purchases on final confirmation booking lines",
        "Any travel cost related to physically visiting the consulate standardly"
      ],
      advisoryText: "Do not finalize non-refundable flights until the stamped US Visa has been received in your physical custody."
    }
  ],
  team: [
    { id: "1", name: "S.M. Rakibul Hasan", role: "Chief Executive Officer", image: "" }
  ],
  offices: [
    { id: "1", name: "KH Dream Services", city: "Riyadh", address: "King Fahd Road, Al Olaya District", phone: "+966 11 000 0000", hours: "9 AM - 6 PM", mapUrl: "https://maps.app.goo.gl/2n82PcGfgrWYU45d8" },
    { id: "2", name: "Sky Search Travels", city: "Jeddah", address: "Prince Sultan Road, Al Rawdah", phone: "+966 12 000 0000", hours: "9 AM - 6 PM", mapUrl: "https://maps.app.goo.gl/2n82PcGfgrWYU45d8" }
  ],
  businessProfiles: [
    { id: "1", name: "KH Dream Services", arabicName: "\u0643\u064A \u0627\u062A\u0634 \u062F\u0631\u064A\u0645 \u0644\u0644\u062E\u062F\u0645\u0627\u062A", logoUrl: "https://i.ibb.co/pjjqSnRF/Logo-23D.png", address: "King Fahd Road, Al Olaya District, Riyadh, KSA", vatId: "300000000000003", invoicePrefix: "KHD", nextInvoiceNumber: 1001 },
    { id: "2", name: "Sky Search Travels", arabicName: "\u0633\u0643\u0627\u064A \u0633\u064A\u0631\u0634 \u0644\u0644\u0633\u064A\u0627\u062D\u0629", logoUrl: "https://i.ibb.co/pjjqSnRF/Logo-23D.png", address: "Prince Sultan Road, Al Rawdah, Jeddah, KSA", vatId: "300000000000004", invoicePrefix: "SST", nextInvoiceNumber: 1001 },
    { id: "3", name: "KH Dream Services Limited", arabicName: "\u0643\u064A \u0627\u062A\u0634 \u062F\u0631\u064A\u0645 \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u062D\u062F\u0648\u062F\u0629", logoUrl: "https://i.ibb.co/pjjqSnRF/Logo-23D.png", address: "Al Olaya District, Riyadh, KSA", vatId: "300000000000005", invoicePrefix: "KHD", nextInvoiceNumber: 1001 }
  ],
  users: [
    { id: "1", username: "admin", fullName: "System Administrator", email: "admin@khdreamservices.com", password: "\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF", role: "Admin", profilePic: "", permissions: AVAILABLE_PERMISSIONS.map((p) => p.key) },
    { id: "user-admin", username: "maiinuddiin", fullName: "Main Uddin", email: "maiinuddiin@gmail.com", password: "\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF", role: "Admin", profilePic: "", permissions: AVAILABLE_PERMISSIONS.map((p) => p.key) }
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
    { id: "1", name: "Ahmed Al-Fahad", rating: 5, text: "Exceptional service! They handled my business setup in Riyadh with zero friction. Highly recommended for corporate services.", date: "2 days ago" },
    { id: "2", name: "Sarah Jenkins", rating: 5, text: "The luxury travel arrangements were beyond my expectations. Every detail was curated perfectly. Truly a bespoke experience.", date: "1 week ago" },
    { id: "3", name: "Mohammed Khan", rating: 5, text: "Fastest visa processing I've ever experienced. Their team is professional and very responsive on WhatsApp.", date: "3 weeks ago" }
  ],
  faqs: [
    { id: "1", question: "What services do you offer?", answer: "We offer a wide range of services including visa assistance, global hotel bookings, and business setup consultancy." },
    { id: "2", question: "How can I contact support?", answer: "You can contact us via WhatsApp, email, or through our contact form on the website." }
  ],
  messages: [
    {
      id: "welcome-msg",
      senderId: "system",
      senderName: "Dream Studio",
      recipientId: "admin",
      subject: "Welcome to the Internal Mail System",
      content: "Welcome to your new internal messaging system. You can communicate with other staff members and administrators securely here without using any 3rd party services.",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      read: false,
      type: "internal"
    }
  ],
  features: {
    sectionTitle: "Why Choose Us",
    sectionSubtitle: "We provide specialized solutions for global mobility and business expansion.",
    items: [
      { iconName: "Smile", title: "Customer Delight", description: "We deliver the best service and experience for our customer." },
      { iconName: "Mountain", title: "Authentic Adventure", description: "We deliver the real adventure experience for our customer." },
      { iconName: "Flag", title: "Expert Guides", description: "We deliver only expert tour guides for our customer." },
      { iconName: "RefreshCcw", title: "Time Flexibility", description: "We welcome time flexibility of traveling for our customer." }
    ]
  },
  branding: {
    elevatingTitle: "Elevating Your Global Ambitions",
    elevatingSubtitle: "We don't just provide services; we craft pathways for your success in Saudi Arabia and beyond. From seamless travel to complex business setups.",
    elevatingTitleSize: "text-2xl md:text-5xl",
    elevatingSubtitleSize: "text-sm md:text-lg",
    elevatingFeatures: [
      { icon: "ShieldCheck", title: "Secure Process", desc: "Enterprise-grade data protection for all your documents." },
      { icon: "Clock", title: "Rapid Execution", desc: "Optimized workflows ensuring the fastest turnaround times." },
      { icon: "Zap", title: "Expert Guidance", desc: "Direct access to seasoned consultants and legal experts." },
      { icon: "Globe", title: "Global Reach", desc: "Extensive network covering over 50+ countries worldwide." }
    ]
  },
  stats: {
    successfulVisas: "15,000+",
    businessSetups: "2,500+",
    globalPartners: "120+",
    globalReach: "45+",
    successfulVisasLabel: "Successful Visas",
    successfulVisasDesc: "Enterprise-grade data protection for all your documents.",
    businessSetupsLabel: "Business Setups",
    businessSetupsDesc: "Optimized workflows ensuring the fastest turnaround times.",
    globalPartnersLabel: "Global Partners",
    globalPartnersDesc: "Direct access to seasoned consultants and legal experts.",
    globalReachLabel: "Global Reach",
    globalReachDesc: "Extensive network covering over 50+ countries worldwide."
  },
  successStories: {
    youtubePlaylistId: "PLuD6-F_996_L_pI_v9_p_p_p_p_p_p_p",
    youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLuD6-F_996_L_pI_v9_p_p_p_p_p_p_p",
    videoUrls: ["https://www.youtube.com/watch?v=ScMzIvxBSi4"],
    milestones: [
      { id: "1", title: "Global Clients", value: "50,000+", icon: "Users" },
      { id: "2", title: "Countries Served", value: "120+", icon: "Globe" },
      { id: "3", title: "Success Rate", value: "99.9%", icon: "Zap" }
    ]
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
      id: "1",
      title: "Starter",
      description: "Perfect for getting started",
      planDescription: "Basic Umrah Package",
      price: "$0",
      priceSubtitle: "",
      isRecommended: false,
      iconUrl: "",
      imageUrl: "",
      features: [
        "\u09AE\u0995\u09CD\u0995\u09BE \u0993 \u09AE\u09A6\u09BF\u09A8\u09BE\u09DF \u0986\u09B0\u09BE\u09AE\u09A6\u09BE\u09DF\u0995 \u0986\u09AC\u09BE\u09B8\u09A8",
        "\u0985\u09AD\u09BF\u099C\u09CD\u099E \u0993 \u09AC\u09BE\u0982\u09B2\u09BE\u09AD\u09BE\u09B7\u09C0 \u0997\u09BE\u0987\u09A1\u09C7\u09B0 \u09A4\u09A4\u09CD\u09A4\u09CD\u09AC\u09BE\u09AC\u09A7\u09BE\u09A8",
        "Basic Travel Insurance",
        "Email Support"
      ]
    },
    {
      id: "2",
      title: "Pro",
      description: "For most small groups",
      planDescription: "Standard Umrah Package",
      price: "$29",
      priceSubtitle: "/person",
      isRecommended: true,
      iconUrl: "",
      imageUrl: "",
      features: [
        "VIP \u09AE\u0995\u09CD\u0995\u09BE \u0993 \u09AE\u09A6\u09BF\u09A8\u09BE \u09A5\u09BE\u0995\u09BE\u0995\u09BE\u09B2\u09C0\u09A8 \u09B8\u09C7\u09AC\u09BE",
        "VVIP \u09B6\u09C0\u09A4\u09BE\u09A4\u09AA \u09A8\u09BF\u09DF\u09A8\u09CD\u09A4\u09CD\u09B0\u09BF\u09A4 \u09AA\u09B0\u09BF\u09AC\u09B9\u09A8",
        "\u099C\u09BF\u09DF\u09BE\u09B0\u09A4 \u099F\u09CD\u09AF\u09C1\u09B0 \u09B8\u09B9 \u09AC\u09BF\u09B6\u09C7\u09B7 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE",
        "\u09E8\u09EA/\u09ED \u09A1\u09C7\u09A1\u09BF\u0995\u09C7\u099F\u09C7\u09A1 \u09AE\u09CD\u09AF\u09BE\u09A8\u09C7\u099C\u09BE\u09B0",
        "\u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09B9\u09BE\u09B2\u09BE\u09B2 \u0996\u09BE\u09AC\u09BE\u09B0"
      ]
    },
    {
      id: "3",
      title: "Business",
      description: "For corporate teams",
      planDescription: "Corporate Umrah Package",
      price: "$79",
      priceSubtitle: "/person",
      isRecommended: false,
      iconUrl: "",
      imageUrl: "",
      features: [
        "Luxury \u09AB\u09BE\u0987\u09AD \u09B8\u09CD\u099F\u09BE\u09B0 \u09B9\u09CB\u099F\u09C7\u09B2",
        "\u09AC\u09CD\u09AF\u0995\u09CD\u09A4\u09BF\u0997\u09A4 \u09B6\u09C7\u09AB \u0993 \u09AC\u09BF\u09B6\u09C7\u09B7 \u0995\u09C1\u0987\u099C\u09BF\u09A8",
        "\u09AA\u09CD\u09B0\u09BE\u0987\u09AD\u09C7\u099F \u099F\u09CD\u09B0\u09BE\u09A8\u09CD\u09B8\u09AB\u09BE\u09B0 \u0993 \u09AA\u09CD\u09B0\u099F\u09CB\u0995\u09B2",
        "\u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u09B2\u09BE\u0989\u099E\u09CD\u099C \u0985\u09CD\u09AF\u09BE\u0995\u09CD\u09B8\u09C7\u09B8",
        "\u0995\u09BE\u09B8\u09CD\u099F\u09AE \u09AD\u09CD\u09B0\u09AE\u09A3 \u09AA\u09B0\u09BF\u0995\u09B2\u09CD\u09AA\u09A8\u09BE"
      ]
    }
  ],
  landingPages: [],
  customPopups: [],
  floatingCardItems: [
    { id: "1", name: "YouTube Channel", logoUrl: "", buttonText: "Subscribe", buttonLink: "https://youtube.com", active: true },
    { id: "2", name: "Newsletter", logoUrl: "", buttonText: "Join Now", buttonLink: "#newsletter", active: true },
    { id: "3", name: "Facebook", logoUrl: "", buttonText: "Follow", buttonLink: "https://facebook.com", active: true },
    { id: "4", name: "TikTok", logoUrl: "", buttonText: "Follow Us", buttonLink: "https://tiktok.com", active: true },
    { id: "5", name: "Instagram", logoUrl: "", buttonText: "Follow", buttonLink: "https://instagram.com", active: true }
  ],
  navbarLinks: [
    { id: "1", label: "Home", url: "/", order: 0 },
    { id: "2", label: "Hot Deals", url: "/hot-deals", order: 1 },
    { id: "3", label: "Blog", url: "/blog", order: 2 },
    { id: "4", label: "Services", url: "/#services", order: 3 },
    { id: "5", label: "Contact", url: "/#contact", order: 4 }
  ],
  homeBlocks: [],
  homeSections: [],
  homeSectionsOrder: [
    "search",
    "stats",
    "services",
    "destinations",
    "whySaudiArabia",
    "blog",
    "successStories",
    "features",
    "reviews",
    "team",
    "partners"
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
      { id: "1", title: "Vision 2030", description: "A bold blueprint that is transforming the Kingdom into a global investment powerhouse.", icon: "Flag" },
      { id: "2", title: "Heritage", description: "Home to multiple UNESCO World Heritage sites and rich cultural traditions.", icon: "Globe" },
      { id: "3", title: "Modernity", description: "Futuristic mega-projects like NEOM and The Line redefined urban living.", icon: "Zap" },
      { id: "4", title: "Opportunity", description: "One of the world's fastest-growing economies with massive investment potential.", icon: "TrendingUp" }
    ],
    stats: [
      { id: "1", label: "Economic Growth", value: "7.6", suffix: "%" },
      { id: "2", label: "Investment Projects", value: "450", suffix: "+" },
      { id: "3", label: "New Hubs", value: "12", suffix: "" }
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
    serviceBusiness: true
  },
  businessServices: [
    {
      id: "cat_sbc",
      name: "Saudi Business Center",
      logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80",
      description: "Explore 33 services offered by Saudi Business Center. We provide comprehensive business starting point assistance.",
      subcategories: [
        {
          id: "sub_rec_comm",
          name: "Recording Commercial Registration for Sole Proprietorship",
          logoUrl: "",
          description: "This service enables the investor to start practicing commercial activity, and through it, secure commercial registry.",
          beforeDiscountPrice: "320 \uFDFC",
          afterDiscountPrice: "256 \uFDFC",
          isSale: true,
          packageDetails: {
            id: "pkg_rec_comm",
            name: "Recording Commercial Registration for Sole Proprietorship",
            description: "Full service offering to secure commercial registration under sole proprietorship, perfectly legal and aligned with MOC regulations.",
            serviceFees: "256 \uFDFC",
            governmentFees: "500 \uFDFC",
            processingTime: "1 Working Day",
            targetAudience: "Trader",
            detailedDescription: "The Commercial Registration service for sole proprietorships grants an official license to operate a business under the name of one individual in the Saudi market. This registration becomes the foundation for all commercial and administrative dealings with government entities, partners, and clients. The service is offered fully online through the Ministry of Commerce platform, providing a seamless and fast experience in establishing a business.",
            bulletPoints: [
              "100% Online Processing",
              "Instant Registration issuance on completion",
              "Assistance with Chamber of Commerce subscription",
              "Support with commercial bank account pre-approval"
            ]
          }
        },
        {
          id: "sub_est_lld",
          name: "Establishment of Limited Liability Company",
          logoUrl: "",
          description: "This service enables the investor to start practicing commercial activity and establish a full LLC.",
          beforeDiscountPrice: "3,110 \uFDFC",
          afterDiscountPrice: "2,488 \uFDFC",
          isSale: true,
          packageDetails: {
            id: "pkg_est_lld",
            name: "Establishment of Limited Liability Company (LLC)",
            description: "Complete setup of limited liability company, drafting Articles of Association, and processing municipal licenses.",
            serviceFees: "2,488 \uFDFC",
            governmentFees: "1,200 \uFDFC",
            processingTime: "3 Working Days",
            targetAudience: "Corporate Investor",
            detailedDescription: "Establish a fully compliant Limited Liability Company in the Saudi market with custom Articles of Association. This includes complete alignment with the new Companies Law, registration with the Ministry of Commerce, and coordination with various public departments.",
            bulletPoints: [
              "Drafting custom Articles of Association",
              "Ministry of Commerce (MOC) portal submission and setup",
              "VAT & tax registration support",
              "Guidance on foreign investment licenses (MISA) if applicable"
            ]
          }
        },
        {
          id: "sub_amend_mem",
          name: "Amendment of the Memorandum of Association / Articles of Association",
          logoUrl: "",
          description: "This service enables the investor to amend the company's articles of incorporation by updating capitals, partners or activities.",
          beforeDiscountPrice: "2,590 \uFDFC",
          afterDiscountPrice: "2,072 \uFDFC",
          isSale: true,
          packageDetails: {
            id: "pkg_amend_mem",
            name: "Amendment of Memorandum of Association",
            description: "Official drafting and registration of all modifications to articles of association and commercial registry.",
            serviceFees: "2,072 \uFDFC",
            governmentFees: "800 \uFDFC",
            processingTime: "2 Working Days",
            targetAudience: "Corporation",
            detailedDescription: "Make updates to partners, capital increment or reduction, administrative structures, or commercial name. We process custom registry updates through SBC and MOC portals and support notarization steps.",
            bulletPoints: [
              "Partner additions or exits legally processed",
              "Authorized signatory additions",
              "Notary coordination",
              "Updated commercial registration issuance"
            ]
          }
        },
        {
          id: "sub_ecom_auth",
          name: "E-Commerce Authentication",
          logoUrl: "",
          description: "This service enables investors to authenticate their online store by verifying it under a verified commercial registry.",
          beforeDiscountPrice: "370 \uFDFC",
          afterDiscountPrice: "296 \uFDFC",
          isSale: true,
          packageDetails: {
            id: "pkg_ecom_auth",
            name: "E-Commerce Authentication Setup",
            description: "Connect physical commercial registry with Maroof (e-commerce authentication portal) for absolute customer trust.",
            serviceFees: "296 \uFDFC",
            governmentFees: "150 \uFDFC",
            processingTime: "1 Working Day",
            targetAudience: "Online Trader",
            detailedDescription: "Authenticate your digital store on the national platform, guaranteeing compliance with local retail regulations and enabling instant connection with electronic payment processors.",
            bulletPoints: [
              "Maroof verification profile setup",
              "MOC system pairing",
              "Digital certification badge on store",
              "Assistance with payment gateway integrations"
            ]
          }
        }
      ]
    },
    {
      id: "cat_hcis",
      name: "High Commission for Industrial Security",
      logoUrl: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=400&q=80",
      description: "Explore 1 services offered by High Commission for Industrial Security. We provide specialized safety & security certifications coordination.",
      subcategories: []
    },
    {
      id: "cat_mimr",
      name: "Ministry of Industry and Mineral Resources",
      logoUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80",
      description: "Explore 11 services offered by Ministry of Industry and Mineral Resources. We provide compliance, license application & advisory.",
      subcategories: []
    },
    {
      id: "cat_moc",
      name: "Ministry of Commerce",
      logoUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80",
      description: "Explore 7 services offered by Ministry of Commerce. We provide comprehensive commercial licensing, brand registrations, & renewals.",
      subcategories: []
    },
    {
      id: "cat_misa",
      name: "Ministry of Investment",
      logoUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80",
      description: "Explore 25 services offered by Ministry of Investment. We provide foreign investor licensing (MISA licenses) and joint ventures.",
      subcategories: []
    },
    {
      id: "cat_saip",
      name: "SAIP (Saudi Intellectual Property)",
      logoUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80",
      description: "Explore 20 services offered by SAIP. We provide comprehensive support for trademarks, patents, and copyright legal filings.",
      subcategories: []
    },
    {
      id: "cat_pr",
      name: "Premium Residency",
      logoUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80",
      description: "Explore 11 services offered by Premium Residency. We provide comprehensive eligibility assessment, documents compilation, and concierge filings.",
      subcategories: []
    },
    {
      id: "cat_gcam",
      name: "General Authority of Media Regulation",
      logoUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&q=80",
      description: "Explore 27 services offered by GAMR. We provide media and publishing licenses, audio-visual event compliance approvals, and advertising permits.",
      subcategories: []
    }
  ],
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
  }
};
const CMSContext = (0, import_react.createContext)(void 0);
const CMSProvider = ({ children }) => {
  const healData = (raw) => {
    if (!raw || typeof raw !== "object") return DEFAULT_DATA;
    const visibility = {
      ...DEFAULT_DATA.visibility,
      ...raw.visibility || {}
    };
    const data2 = { ...DEFAULT_DATA, ...raw, visibility };
    data2.blogPosts = Array.isArray(raw.blogPosts) ? raw.blogPosts : DEFAULT_DATA.blogPosts || [];
    data2.users = Array.isArray(raw.users) ? raw.users : DEFAULT_DATA.users || [];
    data2.promoSlider = Array.isArray(raw.promoSlider) ? raw.promoSlider : DEFAULT_DATA.promoSlider || [];
    data2.catalogue = Array.isArray(raw.catalogue) ? raw.catalogue : DEFAULT_DATA.catalogue || [];
    data2.team = Array.isArray(raw.team) ? raw.team : DEFAULT_DATA.team || [];
    data2.offices = Array.isArray(raw.offices) ? raw.offices : DEFAULT_DATA.offices || [];
    data2.navbarLinks = Array.isArray(raw.navbarLinks) ? raw.navbarLinks : DEFAULT_DATA.navbarLinks || [];
    data2.homeBlocks = Array.isArray(raw.homeBlocks) ? raw.homeBlocks : DEFAULT_DATA.homeBlocks || [];
    data2.homeSections = Array.isArray(raw.homeSections) ? raw.homeSections : DEFAULT_DATA.homeSections || [];
    data2.homeSectionsOrder = Array.isArray(raw.homeSectionsOrder) ? raw.homeSectionsOrder : DEFAULT_DATA.homeSectionsOrder || [];
    data2.landingPages = Array.isArray(raw.landingPages) ? raw.landingPages : DEFAULT_DATA.landingPages || [];
    data2.customPopups = Array.isArray(raw.customPopups) ? raw.customPopups : DEFAULT_DATA.customPopups || [];
    data2.hotDeals = Array.isArray(raw.hotDeals) ? raw.hotDeals : DEFAULT_DATA.hotDeals || [];
    data2.reviews = Array.isArray(raw.reviews) ? raw.reviews : DEFAULT_DATA.reviews || [];
    data2.messages = Array.isArray(raw.messages) ? raw.messages : DEFAULT_DATA.messages || [];
    data2.deletedMessageIds = Array.isArray(raw.deletedMessageIds) ? raw.deletedMessageIds : [];
    data2.businessProfiles = Array.isArray(raw.businessProfiles) ? raw.businessProfiles : DEFAULT_DATA.businessProfiles || [];
    data2.businessServices = Array.isArray(raw.businessServices) ? raw.businessServices : DEFAULT_DATA.businessServices || [];
    data2.serviceCards = Array.isArray(raw.serviceCards) ? raw.serviceCards : DEFAULT_DATA.serviceCards || [];
    data2.subscribers = Array.isArray(raw.subscribers) ? raw.subscribers : DEFAULT_DATA.subscribers || [];
    data2.faqs = Array.isArray(raw.faqs) ? raw.faqs : DEFAULT_DATA.faqs || [];
    data2.features = raw.features && typeof raw.features === "object" && !Array.isArray(raw.features) ? {
      ...DEFAULT_DATA.features,
      ...raw.features,
      items: Array.isArray(raw.features.items) ? raw.features.items : DEFAULT_DATA.features?.items || []
    } : DEFAULT_DATA.features || { sectionTitle: "", sectionSubtitle: "", items: [] };
    data2.successStories = { ...DEFAULT_DATA.successStories, ...raw.successStories || {} };
    data2.whySaudiArabia = raw.whySaudiArabia ? { ...DEFAULT_DATA.whySaudiArabia, ...raw.whySaudiArabia } : DEFAULT_DATA.whySaudiArabia;
    data2.general = { ...DEFAULT_DATA.general, ...raw.general || {} };
    data2.branding = { ...DEFAULT_DATA.branding, ...raw.branding || {} };
    data2.stats = { ...DEFAULT_DATA.stats, ...raw.stats || {} };
    data2.notifications = { ...DEFAULT_DATA.notifications, ...raw.notifications || {} };
    data2.homeSettings = { ...DEFAULT_DATA.homeSettings, ...raw.homeSettings || {} };
    data2.bioHub = raw.bioHub ? {
      ...DEFAULT_DATA.bioHub,
      ...raw.bioHub,
      seo: { ...DEFAULT_DATA.bioHub?.seo, ...raw.bioHub.seo || {} },
      analytics: { ...DEFAULT_DATA.bioHub?.analytics, ...raw.bioHub.analytics || {} },
      socials: Array.isArray(raw.bioHub.socials) ? raw.bioHub.socials : DEFAULT_DATA.bioHub?.socials || [],
      branches: Array.isArray(raw.bioHub.branches) ? raw.bioHub.branches : DEFAULT_DATA.bioHub?.branches || [],
      services: Array.isArray(raw.bioHub.services) ? raw.bioHub.services : DEFAULT_DATA.bioHub?.services || [],
      faqs: Array.isArray(raw.bioHub.faqs) ? raw.bioHub.faqs : DEFAULT_DATA.bioHub?.faqs || [],
      testimonials: Array.isArray(raw.bioHub.testimonials) ? raw.bioHub.testimonials : DEFAULT_DATA.bioHub?.testimonials || []
    } : DEFAULT_DATA.bioHub;
    return data2;
  };
  const [data, setData] = (0, import_react.useState)(() => {
    return DEFAULT_DATA;
  });
  const [currentUser, setCurrentUser] = (0, import_react.useState)(null);
  const [isLoaded, setIsLoaded] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    let active = true;
    let retryTimeout = null;
    let fetchAttempts = 0;
    const fetchCMSData = async () => {
      console.log(`CMSContext: Starting fetchCMSData (Attempt ${fetchAttempts + 1})...`);
      fetchAttempts++;
      const timeoutId = setTimeout(() => {
        if (active && fetchAttempts === 1) {
          console.warn("CMSContext: First fetch taking longer than 10s...");
          setIsLoaded(true);
        }
      }, 1e4);
      try {
        const token = localStorage.getItem("kh_admin_token");
        const response = await fetch(`/api/cms?t=${Date.now()}`, {
          headers: {
            "x-admin-token": token || "",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          },
          cache: "no-store",
          credentials: "include"
        });
        if (!response.ok) {
          if (response.status === 403 || response.status === 401) {
            if (token) {
              localStorage.removeItem("kh_admin_token");
              localStorage.removeItem("kh_dream_session");
              setCurrentUser(null);
            }
            if (active) setIsLoaded(true);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const serverData = await response.json();
        if (serverData && !serverData.error) {
          if (!active) return;
          if (serverData.identifiedUser) {
            if (!currentUser) {
              setCurrentUser(serverData.identifiedUser);
            }
            if (serverData.token && !localStorage.getItem("kh_admin_token")) {
              console.log("[CMSContext] Auto-restored token cross-subdomain from admin_session cookie");
              localStorage.setItem("kh_admin_token", serverData.token);
              localStorage.setItem("kh_dream_session", JSON.stringify({ user: serverData.identifiedUser, loginTime: Date.now() }));
            }
          } else if (token) {
            console.warn("[CMSContext] Token existed in localStorage but server did not verify/identify the admin session. Logging out.");
            handleSetCurrentUser(null);
          }
          setData((prev) => {
            try {
              const healed = healData(serverData);
              const finalUsers = (healed.users || []).map((u) => {
                const existingUser = prev.users?.find((eu) => eu.id === u.id);
                const useLocalPassword = existingUser?.password && existingUser.password !== "\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF" && existingUser.password !== u.password;
                return {
                  ...u,
                  password: useLocalPassword ? existingUser.password : u.password || "",
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
          throw new Error("Invalid or empty data received from database server.");
        }
      } catch (e) {
        console.error("CMSContext: Failed to fetch CMS data on attempt " + fetchAttempts, e);
        const local = localStorage.getItem("kh_dream_cms_v5");
        if (local && !isLoaded) {
          try {
            setData(healData(JSON.parse(local)));
          } catch (err) {
            console.error("CMSContext: Local fallback failed", err);
          }
        }
        if (active && fetchAttempts < 15) {
          const delay = fetchAttempts < 4 ? 2e3 : 5e3;
          console.log(`CMSContext: Scheduling automatic database reconnection retry in ${delay}ms...`);
          retryTimeout = setTimeout(fetchCMSData, delay);
        } else {
          if (active) setIsLoaded(true);
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
  (0, import_react.useEffect)(() => {
    const token = localStorage.getItem("kh_admin_token");
    if (token && isLoaded) {
      const reFetch = async () => {
        try {
          const response = await fetch(`/api/cms?t=${Date.now()}`, {
            headers: {
              ...token ? { "x-admin-token": token } : {},
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
              "Expires": "0"
            },
            cache: "no-store",
            credentials: "include"
          });
          if (response.ok) {
            const serverData = await response.json();
            if (serverData) {
              setData((prev) => ({
                ...prev,
                ...serverData,
                general: { ...prev.general || {}, ...serverData.general || {} },
                users: serverData.users || prev.users || []
              }));
            }
          }
        } catch (e) {
          console.error("CMSContext: Post-login sync failed", e);
        }
      };
      reFetch();
    }
  }, [currentUser?.id]);
  (0, import_react.useEffect)(() => {
    const session = localStorage.getItem("kh_dream_session");
    if (session) {
      try {
        const { user, loginTime } = JSON.parse(session);
        const now = /* @__PURE__ */ new Date();
        const expirationTime = loginTime + 24 * 60 * 60 * 1e3;
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
  (0, import_react.useEffect)(() => {
    const checkSessionExpiration = () => {
      const session = localStorage.getItem("kh_dream_session");
      if (session) {
        try {
          const { loginTime } = JSON.parse(session);
          const now = Date.now();
          const expirationTime = loginTime + 24 * 60 * 60 * 1050;
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
    window.addEventListener("focus", handleFocusCheck);
    window.addEventListener("visibilitychange", handleFocusCheck);
    const intervalId = setInterval(checkSessionExpiration, 15e3);
    return () => {
      window.removeEventListener("focus", handleFocusCheck);
      window.removeEventListener("visibilitychange", handleFocusCheck);
      clearInterval(intervalId);
    };
  }, []);
  (0, import_react.useEffect)(() => {
    if (isLoaded) {
      const handler = setTimeout(() => {
        try {
          localStorage.setItem("kh_dream_cms_v5", JSON.stringify(data));
        } catch (e) {
          console.warn("CMSContext: Local storage quota exceeded or failed", e);
        }
      }, 2e3);
      return () => clearTimeout(handler);
    }
  }, [data, isLoaded]);
  const updateData = (newData) => {
    setData((prev) => {
      const updates = typeof newData === "function" ? newData(prev) : newData;
      return { ...prev, ...updates };
    });
  };
  const handleSetCurrentUser = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("kh_dream_session", JSON.stringify({ user, loginTime: Date.now() }));
    } else {
      localStorage.removeItem("kh_dream_session");
      localStorage.removeItem("kh_admin_token");
    }
  };
  const logout = async () => {
    handleSetCurrentUser(null);
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    }
  };
  const checkSessionActive = async () => {
    const token = localStorage.getItem("kh_admin_token");
    if (!token) {
      if (currentUser) {
        handleSetCurrentUser(null);
      }
      return false;
    }
    try {
      const response = await fetch("/api/auth/verify-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token
        },
        credentials: "include"
      });
      if (response.ok) {
        const resData = await response.json();
        if (resData && resData.valid) {
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
        return true;
      }
    } catch (e) {
      console.error("Error verifying active session:", e);
      return true;
    }
  };
  const saveChanges = async (manualData) => {
    if (!isLoaded) {
      console.warn("CMSProvider: Cannot save changes while data is still loading from server.");
      return false;
    }
    const dataToSave = manualData || data;
    const token = localStorage.getItem("kh_admin_token");
    const isSessionActive = await checkSessionActive();
    if (!isSessionActive) {
      handleSetCurrentUser(null);
      throw new Error("Your session has expired or is invalid. Please log in again to save your changes.");
    }
    try {
      const response = await fetch("/api/cms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...token ? { "x-admin-token": token } : {}
        },
        body: JSON.stringify(dataToSave),
        credentials: "include"
      });
      if (!response.ok) {
        let errorMessage = `Server responded with ${response.status}`;
        let errorData = {};
        try {
          const text = await response.text();
          try {
            errorData = JSON.parse(text);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = text.slice(0, 100) || errorMessage;
          }
        } catch (e) {
        }
        if (response.status === 401 || response.status === 403) {
          const isExpired = errorData.code === "SESSION_EXPIRED" || errorMessage.toLowerCase().includes("expired") || errorMessage.toLowerCase().includes("authorized") || errorMessage.toLowerCase().includes("session") || errorMessage.toLowerCase().includes("forbidden");
          if (isExpired || token) {
            console.warn("CMSContext: Session invalidation detected. Clearing local session.");
            handleSetCurrentUser(null);
            throw new Error("Your session has expired or is invalid. Please log in again to save your changes.");
          }
        }
        throw new Error(errorMessage);
      }
      localStorage.setItem("kh_dream_cms_v5", JSON.stringify(dataToSave));
      if (currentUser) {
        const updatedUser = dataToSave.users.find((u) => u.id === currentUser?.id);
        if (updatedUser) handleSetCurrentUser(updatedUser);
      }
      console.log("[CMS] System Synchronized with Server.");
      return true;
    } catch (e) {
      console.error("CRITICAL: Failed to save CMS data to server", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      alert(`Failed to sync with server: ${errorMessage}

Changes saved locally in your browser.`);
      return false;
    }
  };
  const resetToDefaults = () => {
    if (confirm("Reset to default?")) {
      setData(DEFAULT_DATA);
      localStorage.removeItem("kh_dream_cms_v5");
      window.location.reload();
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CMSContext.Provider, { value: { data, updateData, saveChanges, resetToDefaults, isLoaded, currentUser, setCurrentUser: handleSetCurrentUser, logout, checkSessionActive }, children });
};
const useCMS = () => {
  const context = (0, import_react.useContext)(CMSContext);
  if (!context) throw new Error("useCMS must be used within CMSProvider");
  return context;
};
