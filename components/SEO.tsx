import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useCMS } from '../context/CMSContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  ogImage,
  canonicalUrl,
  noIndex = false
}) => {
  const { data } = useCMS();
  
  const siteTitle = title || data.general.seo?.metaTitle || data.general.siteName || 'KH Dream Services';
  const siteDescription = description || data.general.seo?.metaDescription || 'Saudi Arabia\'s premier travel and business consultancy.';
  const siteKeywords = keywords || data.general.seo?.metaKeywords || 'travel, business, saudi arabia';
  const siteOgImage = ogImage || data.general.seo?.ogImage || data.general.logoUrl;
  const favicon = data.general.faviconUrl || data.general.logoUrl;

  const siteUrl = window.location.origin;

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": data.general.companyName || data.general.siteName || "KH Dream Services",
    "url": siteUrl,
    "logo": data.general.logoUrl,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": data.general.phone,
      "contactType": "customer service",
      "email": data.general.email
    },
    "sameAs": [
      data.general.facebook ? `https://facebook.com/${data.general.facebook}` : '',
      data.general.instagram ? `https://instagram.com/${data.general.instagram}` : '',
      data.general.twitter ? `https://twitter.com/${data.general.twitter}` : '',
      data.general.linkedin ? `https://linkedin.com/company/${data.general.linkedin}` : ''
    ].filter(Boolean)
  };

  const webSiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": data.general.siteName || "KH Dream Services",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/?s={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  // Use a dynamic version based on the favicon URL itself to bust cache
  // We also use a timestamp to ensure it updates when the user saves changes
  const faviconVersion = React.useMemo(() => {
    return Date.now().toString();
  }, [favicon, data.general.siteName]);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow" />}
      
      {/* Favicon - Still keep it in Helmet for SSR/initial load */}
      {favicon && (
        <>
          <link rel="icon" href={`${favicon}${favicon.includes('?') ? '&' : '?'}v=${faviconVersion}`} key="favicon-icon" />
          <link rel="shortcut icon" href={`${favicon}${favicon.includes('?') ? '&' : '?'}v=${faviconVersion}`} key="favicon-shortcut" />
          <link rel="apple-touch-icon" href={`${favicon}${favicon.includes('?') ? '&' : '?'}v=${faviconVersion}`} key="favicon-apple" />
        </>
      )}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      {siteOgImage && <meta property="og:image" content={siteOgImage} />}
      <meta property="og:url" content={window.location.href} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      {siteOgImage && <meta name="twitter:image" content={siteOgImage} />}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webSiteLd)}
      </script>

      {/* Advanced SEO Scripts */}
      {data.general.seo?.advancedSeo && (
        <script type="text/javascript">
          {data.general.seo.advancedSeo}
        </script>
      )}
    </Helmet>
  );
};
