import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import COLOR_VARIANTS from "../../utils/colorVariants";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslation } from "../../data/translations";

const PurchaseForm = ({
  color = "green",
  serviceData = {},
  filter = "Followers",
  packPrice = 0,
  packTitle = "",
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const variant = COLOR_VARIANTS[color] || COLOR_VARIANTS.red;
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (
    !serviceData ||
    !serviceData.label ||
    !serviceData.placeholder ||
    !serviceData.logo ||
    !serviceData.filters
  ) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600 font-semibold">
          {getTranslation("invalidServiceData", language)}
        </p>
      </div>
    );
  }

  const config = serviceData;
  const filterConfig = config.filters?.[filter] || {
    label: config.label,
    placeholder: config.placeholder,
  };

  // Get the proper translated label for this specific filter
  const filterLabel =
    getTranslation(`${config.slug}.filters.${filter}.label`, language) ||
    filterConfig.label;
  const translatedFilterConfig = {
    ...filterConfig,
    label: filterLabel,
    placeholder: filterConfig.placeholder, // Placeholder is URL, no translation needed
  };

  // UTF-8 safe Base64 encoder for browsers
  const utf8ToBase64 = (str) => {
    try {
      // encodeURIComponent -> percent-encodes utf8, unescape -> raw bytes, btoa -> base64
      return btoa(unescape(encodeURIComponent(str)));
    } catch (err) {
      // Fallback: if any issue, try a more defensive approach (should rarely be needed)
      console.error("utf8ToBase64 encoding failed:", err);
      // As last resort, base64 without utf8 handling (may throw)
      return btoa(str);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!input.trim()) return;

    setIsSubmitting(true);

    try {
      // Store the service details
      const serviceDetails = {
        service: config.name,
        filter: filter,
        packPrice: packPrice,
        profileLink: input,
        serviceSlug: config.slug,
        packTitle: packTitle,
      };

      localStorage.setItem("selectedService", JSON.stringify(serviceDetails));

      // Build payment payload for external payment page
      const payload = {
        id: Date.now().toString(),
        txnId: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        quantity: packTitle,
        link: input,
        amount: String(Math.round(Number(packPrice) * 100)), // in paise if packPrice in rupees
        service: config.name,
        redirectTo: "https://smmguru.shop/orders",
        fallbackUrl: window.location.href,
      };

      // Use UTF-8 safe base64 encoding
      const paymentToken = utf8ToBase64(JSON.stringify(payload));

      // Save payment transaction locally
      const transaction = {
        id: `payment_${Date.now()}`,
        type: "payment_initiated",
        amount: packPrice,
        date: new Date().toISOString(),
        description: `Payment for ${config.name} - ${filter}`,
        status: "initiated",
        paymentToken: paymentToken,
        serviceDetails: serviceDetails,
      };

      const existingTransactions = JSON.parse(
        localStorage.getItem("paymentTransactions") || "[]"
      );
      existingTransactions.push(transaction);
      localStorage.setItem(
        "paymentTransactions",
        JSON.stringify(existingTransactions)
      );

      // Redirect to external payment gateway
      // Use https by default; if your gateway requires http, change accordingly.
      // encodeURIComponent to ensure token safe in URL
      const gatewayUrl = `https://payment.smmguru.shop/?payment=${encodeURIComponent(
        paymentToken
      )}`;

      // Small timeout can help some browsers finish localStorage write, but not necessary.
      // Directly navigate:
      window.location.href = gatewayUrl;
    } catch (err) {
      console.error("Payment init error:", err);
      setIsSubmitting(false);
      // Show friendly message; replace with your toast if any
      alert(getTranslation("paymentInitError", language) || "Kuch error hua, dobara try karo.");
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-4 p-4 rounded-lg ${variant.cardBg} max-w-full w-full mx-auto my-4 box-border sm:p-6`}
      >
        <label
          htmlFor="profileInput"
          className="text-gray-800 font-semibold flex items-center gap-2"
        >
          <img
            src={config.logo}
            className="w-8 h-8 rounded-full bg-cover"
            alt={`${config.name} icon`}
          />
          {translatedFilterConfig.label}
        </label>
        <input
          id="profileInput"
          type="text"
          placeholder={translatedFilterConfig.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
          className={`px-3 py-2 rounded border-[1.5px] ${variant.borderColor} focus:outline-none w-full box-border`}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center justify-center text-center text-white w-full px-6 py-2 rounded-full gap-2 ${variant.buttonBg} ${variant.buttonHover} ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <span>{getTranslation("continue", language)}</span>
          )}
        </button>
      </form>
    </>
  );
};

export default PurchaseForm;