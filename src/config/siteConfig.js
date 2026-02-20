// ============================================================
// SITE CONFIGURATION — Edit only this section to rebrand
// ============================================================
const SITE_NAME     = "SmmGuru";
const SITE_DOMAIN   = "smmguru.shop";
const MOBILE_NUMBER = "9973843805"; // sirf 10 digit — baaki sab auto-format hoga
export const PRIMARY_COLOR  = "#00C707"; // sirf yahan change karo — poora app retheme ho jayega
// ============================================================

const siteConfig = {
  siteName:        SITE_NAME,
  siteUrl:         `https://${SITE_DOMAIN}`,
  siteDescription: "Get real followers, subscribers & OTT subscriptions at the lowest prices. Trusted by thousands for Instagram, YouTube, Facebook and more.",
  siteKeywords:    "social media marketing, instagram followers, youtube subscribers, facebook likes, social media services",

  supportEmail:    `help@${SITE_DOMAIN}`,
  mobileNumber:   MOBILE_NUMBER,
  supportPhone:    `+91 ${MOBILE_NUMBER.slice(0, 5)} ${MOBILE_NUMBER.slice(5)}`,
  whatsappNumber:  `91${MOBILE_NUMBER}`,


  googleAnalyticsId: "G-T164JLCFNC",
  logoPath:        "/ic/logo.svg",

  banners: [
    { id: 1, src: "/banner/banner2.webp", alt: "Banner 1", width: 1000, height: 367 },
    { id: 2, src: "/banner/banner1.webp", alt: "Banner 2", width: 1000, height: 367 },
    { id: 3, src: "/banner/banner3.webp", alt: "Banner 3", width: 1000, height: 367 },
  ],

};

export default siteConfig;
