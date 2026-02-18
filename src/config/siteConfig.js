// ============================================================
// SITE CONFIGURATION — Edit only this section to rebrand
// ============================================================
const SITE_NAME   = "SmmGuru";
const SITE_DOMAIN = "smmguru.shop";
// ============================================================

const siteConfig = {
  siteName:        SITE_NAME,
  siteUrl:         `https://${SITE_DOMAIN}`,
  siteDescription: "Get real followers, subscribers & OTT subscriptions at the lowest prices. Trusted by thousands for Instagram, YouTube, Facebook and more.",
  siteKeywords:    "social media marketing, instagram followers, youtube subscribers, facebook likes, social media services",

  supportEmail:    `help@${SITE_DOMAIN}`,
  supportPhone:    "+91 99738 43805",
  whatsappNumber:  "919973843805",

  upiIds:          ["netc.34161FA820328AA2D2560DE0@mairtel"],
  minimumAmount:   45,
  maximumAmount:   3500,

  googleAnalyticsId: "G-T164JLCFNC",
  logoPath:        "/ic/logo.svg",

  banners: [
    { id: 1, src: "/banner/banner2.webp", alt: "Banner 1", width: 1000, height: 367 },
    { id: 2, src: "/banner/banner1.webp", alt: "Banner 2", width: 1000, height: 367 },
    { id: 3, src: "/banner/banner3.webp", alt: "Banner 3", width: 1000, height: 367 },
  ],

  getRandomUpiId() {
    return this.upiIds[Math.floor(Math.random() * this.upiIds.length)];
  },
};

export default siteConfig;
