import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import {
  faLink,
  faCommentSms,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import siteConfig from "../config/siteConfig";
import { updatePageSEO } from "../utils/seoUtils";
import { useLanguage } from "../context/LanguageContext";
import { getTranslation } from "../data/translations";

const Refer = () => {
  const { referralId } = useParams(); // Extract referral ID from URL (e.g., JW2-TLZ-0VT)
  const navigate = useNavigate();
  const { language } = useLanguage();
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
        <div className="bg-green-50 rounded-lg p-5 w-full">
          <h2 className="text-xl font-bold text-green-700 mb-3 text-center">
            {getTranslation('refer', language)}
          </h2>
          <p className="text-sm text-gray-700 mb-4 text-center">
            {getTranslation('shareReferralMessage', language)}
          </p>

          {/* Share Buttons */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={handleCopy}
              className="bg-gray-200 h-12 w-12 rounded-full flex items-center justify-center hover:bg-gray-300"
              title={copied ? "Copied!" : "Copy Link"}
            >
              <FontAwesomeIcon icon={copied ? faCheck : faLink} size="lg" />
            </button>
            <button
              onClick={shareToWhatsApp}
              className="bg-[#25D366] h-12 w-12 rounded-full flex items-center justify-center hover:bg-[#20B85A]"
              title="Share to WhatsApp"
            >
              <FontAwesomeIcon icon={faWhatsapp} size="lg" color="white" />
            </button>
            <button
              onClick={shareToSMS}
              className="bg-[#00A1D6] h-12 w-12 rounded-full flex items-center justify-center hover:bg-[#0090C0]"
              title="Share via SMS"
            >
              <FontAwesomeIcon icon={faCommentSms} size="lg" color="white" />
            </button>
          </div>
          <p className="text-xs text-center text-gray-500 mt-2 mb-6">
            {getTranslation('shareLinkMessage', language)}
          </p>
        </div>
      </div>
    </>
  );
};

export default Refer;