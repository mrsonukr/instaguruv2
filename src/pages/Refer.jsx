import React, { useEffect, useState } from "react";
import { Link2, Check, MessageSquare } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import siteConfig from "../config/siteConfig";
import { updatePageSEO } from "../utils/seoUtils";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";

const Refer = () => {
  const { referralId } = useParams(); // Extract referral ID from URL (e.g., JW2-TLZ-0VT)
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate referral code like: abc-def-ghi (3 blocks of 3 lowercase letters/numbers)
  const generateReferralCode = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 9; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code.match(/.{1,3}/g).join("-"); // e.g. abc-def-ghi
  };

  useEffect(() => {
    // Update SEO for refer page
    updatePageSEO('refer');

    // Handle referral ID from URL
    if (referralId) {
      // Store referral ID in localStorage (or send to backend)
      localStorage.setItem("referredBy", referralId);
      // Redirect to home page
      navigate("/");
    } else {
      // Existing logic for generating/storing referral code
      const savedCode = localStorage.getItem("referralCode");
      if (savedCode) {
        setReferralCode(savedCode);
      } else {
        const newCode = generateReferralCode();
        localStorage.setItem("referralCode", newCode);
        setReferralCode(newCode);
      }
    }
  }, [referralId, navigate]);

  const referralLink = `${window.location.origin}/refer/${referralCode}`;
  const shareMessage = `🔥 Get real followers, subscribers & OTT subscriptions at the lowest prices!

🎁 Use my referral link to join ${siteConfig.siteName}!  
👇 Click now and grab the deal:
${referralLink}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareMessage;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`,
      "_blank"
    );
  };

  const shareToSMS = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(shareMessage)}`;
    window.open(smsUrl, "_blank");
  };

  return (
    <>
      <Header />
      <div className="flex mt-20 items-center justify-center px-4">
        <div className="bg-primary-50 rounded-lg p-5 w-full">
          <h2 className="text-xl font-bold text-primary-700 mb-3 text-center">
            {t('refer')}
          </h2>
          <p className="text-sm text-gray-700 mb-4 text-center">
            {t('shareReferralMessage')}
          </p>

          {/* Share Buttons */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={handleCopy}
              className="bg-gray-200 h-12 w-12 rounded-full flex items-center justify-center hover:bg-gray-300"
              title={copied ? "Copied!" : "Copy Link"}
            >
              {copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
            </button>
            <button
              onClick={shareToWhatsApp}
              className="bg-[#25D366] h-12 w-12 rounded-full flex items-center justify-center hover:bg-[#20B85A]"
              title="Share to WhatsApp"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.304A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fillRule="evenodd" clipRule="evenodd"/></svg>
            </button>
            <button
              onClick={shareToSMS}
              className="bg-[#00A1D6] h-12 w-12 rounded-full flex items-center justify-center hover:bg-[#0090C0]"
              title="Share via SMS"
            >
              <MessageSquare className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-xs text-center text-gray-500 mt-2 mb-6">
            {t('shareLinkMessage')}
          </p>
        </div>
      </div>
    </>
  );
};

export default Refer;