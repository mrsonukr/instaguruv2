import siteConfig from '../config/siteConfig.js';

// Update document title and meta tags dynamically
export const updateSEO = (title, description, keywords, imageUrl) => {
  // Update title
  document.title = title || `${siteConfig.siteName} - Social Media Marketing Services`;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description || siteConfig.siteDescription);
  }
  
  // Update meta keywords
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) {
    metaKeywords.setAttribute('content', keywords || siteConfig.siteKeywords);
  }
  
  // Update Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', title || `${siteConfig.siteName} - Social Media Marketing Services`);
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', description || siteConfig.siteDescription);
  }
  
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) {
    ogUrl.setAttribute('content', window.location.href);
  }

  // Update Open Graph image
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && imageUrl) {
    ogImage.setAttribute('content', imageUrl);
  }

  // Update Twitter Card image
  const twitterImage = document.querySelector('meta[name="twitter:image"]');
  if (twitterImage && imageUrl) {
    twitterImage.setAttribute('content', imageUrl);
  }

  // Update canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = window.location.href;
};

// Update Google Analytics ID
export const updateAnalytics = () => {
  // Update gtag config
  if (window.gtag) {
    window.gtag('config', siteConfig.googleAnalyticsId);
  }
};

// SEO data for different pages
const seoData = {
  home: {
    title: `${siteConfig.siteName} - Best Social Media Marketing Services | Real Followers & Subscribers`,
    description: `Get real Instagram followers, YouTube subscribers, Facebook likes & premium OTT subscriptions at lowest prices. Trusted SMM panel with 24/7 support & instant delivery.`,
    keywords: `social media marketing, buy instagram followers, youtube subscribers, facebook likes, netflix subscription, amazon prime, spotify premium, smm panel, real followers`
  },
  instagram: {
    title: `Buy Instagram Followers, Likes & Views - ${siteConfig.siteName}`,
    description: `Buy real Instagram followers, likes, comments & story views at lowest prices. 100% Indian, non-drop followers with instant delivery. Boost your Instagram presence now!`,
    keywords: `buy instagram followers, instagram likes, instagram views, instagram comments, real followers, indian followers, instagram growth`
  },
  youtube: {
    title: `Buy YouTube Subscribers, Views & Likes - ${siteConfig.siteName}`,
    description: `Get real YouTube subscribers, video views, likes & watch time for monetization. 4000 hours watch time available. Grow your YouTube channel with genuine engagement.`,
    keywords: `buy youtube subscribers, youtube views, youtube likes, youtube watch time, youtube monetization, real subscribers`
  },
  facebook: {
    title: `Buy Facebook Followers, Likes & Views - ${siteConfig.siteName}`,
    description: `Increase Facebook page followers, post likes, comments & video views. Real Indian users, instant delivery, and affordable prices for Facebook marketing.`,
    keywords: `buy facebook followers, facebook likes, facebook page likes, facebook views, facebook marketing, social media growth`
  },
  netflix: {
    title: `Netflix Premium Subscription - ${siteConfig.siteName}`,
    description: `Get Netflix premium subscription at lowest prices. HD & Standard quality available for 1, 3, 6 months. Instant delivery with email activation.`,
    keywords: `netflix subscription, netflix premium, netflix hd, netflix account, ott subscription, streaming services`
  },
  'amazon-prime': {
    title: `Amazon Prime Subscription - ${siteConfig.siteName}`,
    description: `Buy Amazon Prime membership at discounted rates. Get Prime Video, free delivery & exclusive deals. 1, 3, 6, 12 months subscription available.`,
    keywords: `amazon prime subscription, prime video, amazon prime membership, prime delivery, ott services`
  },
  spotify: {
    title: `Spotify Premium Subscription - ${siteConfig.siteName}`,
    description: `Get Spotify Premium at lowest prices. Ad-free music, offline downloads & unlimited skips. 1, 3, 6, 12 months subscription plans available.`,
    keywords: `spotify premium, spotify subscription, music streaming, ad-free music, spotify account`
  },
  telegram: {
    title: `Buy Telegram Members & Views - ${siteConfig.siteName}`,
    description: `Grow your Telegram channel with real members and post views. High retention members for groups and channels. Boost your Telegram presence instantly.`,
    keywords: `buy telegram members, telegram views, telegram channel growth, telegram marketing, real telegram members`
  },
  about: {
    title: `About ${siteConfig.siteName} - Leading SMM Panel Since 2+ Years`,
    description: `Learn about ${siteConfig.siteName}, the trusted SMM panel serving thousands of customers for 2+ years. Real followers, subscribers & premium OTT services with 24/7 support.`,
    keywords: `about smmguru, smm panel, social media marketing company, trusted smm services`
  },
  contact: {
    title: `Contact ${siteConfig.siteName} - 24/7 Customer Support`,
    description: `Get in touch with ${siteConfig.siteName} support team. Available 24/7 via email and WhatsApp for all your social media marketing needs and queries.`,
    keywords: `contact smmguru, customer support, smm panel support, social media marketing help`
  },
  refer: {
            title: `Refer - ${siteConfig.siteName}`,
    description: `Refer friends to ${siteConfig.siteName}. Share your link and help others discover our services!`,
    keywords: `refer and earn, referral program, earn money, social media marketing referral`
  },
  orders: {
    title: `My Orders - ${siteConfig.siteName}`,
    description: `Track your social media marketing orders. View order status, delivery progress and manage your purchases from ${siteConfig.siteName}.`,
    keywords: `my orders, order tracking, social media orders, order history, order status`
  }
};

// Generate dynamic social preview for specific pages
export const updatePageSEO = (pageType, data = {}) => {
  const seo = seoData[pageType];
  
  if (seo) {
    updateSEO(seo.title, seo.description, seo.keywords, `${siteConfig.siteUrl}/banner/preview.webp`);
  } else if (pageType === 'service' && data.name) {
    // Dynamic service page SEO
    const serviceName = data.name.toLowerCase();
    const seoInfo = seoData[serviceName] || seoData[data.slug];
    
    if (seoInfo) {
      updateSEO(seoInfo.title, seoInfo.description, seoInfo.keywords, `${siteConfig.siteUrl}/banner/preview.webp`);
    } else {
      // Fallback for unknown services
      updateSEO(
        `${data.name} Services - ${siteConfig.siteName}`,
        `Get real ${data.name} ${data.description} at lowest prices. Fast delivery, 24/7 support.`,
        `${data.name.toLowerCase()}, social media marketing, ${siteConfig.siteKeywords}`,
        `${siteConfig.siteUrl}/banner/preview.webp`
      );
    }
  } else if (pageType === 'purchase' && data.title) {
    updateSEO(
      `${data.title} - ${siteConfig.siteName}`,
      `Purchase ${data.title} for just ₹${data.price}. ${data.description} Fast delivery and 24/7 support guaranteed.`,
      `${data.title.toLowerCase()}, buy followers, social media services, ${siteConfig.siteKeywords}`,
      `${siteConfig.siteUrl}/banner/preview.webp`
    );
  } else {
    // Default SEO
    updateSEO();
  }
  
  // Update analytics
  updateAnalytics();
};

// Function to add structured data (JSON-LD)
export const addStructuredData = (type, data) => {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  let structuredData = {};

  switch (type) {
    case 'organization':
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": siteConfig.siteName,
        "url": siteConfig.siteUrl,
        "logo": `${siteConfig.siteUrl}/ic/logo.svg`,
        "description": siteConfig.siteDescription,
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": siteConfig.supportPhone,
          "contactType": "customer service",
          "availableLanguage": ["English", "Hindi"]
        },
        "sameAs": [
          `https://wa.me/${siteConfig.whatsappNumber}`
        ]
      };
      break;

    case 'service':
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": `${data.name} Marketing Services`,
        "description": data.description,
        "provider": {
          "@type": "Organization",
          "name": siteConfig.siteName,
          "url": siteConfig.siteUrl
        },
        "serviceType": "Social Media Marketing",
        "areaServed": "Worldwide"
      };
      break;

    case 'website':
      structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": siteConfig.siteName,
        "url": siteConfig.siteUrl,
        "description": siteConfig.siteDescription,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${siteConfig.siteUrl}/?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      };
      break;
  }

  if (Object.keys(structuredData).length > 0) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }
};