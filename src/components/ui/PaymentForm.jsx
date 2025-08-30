import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PayInfo from "./PayInfo";
import { Loader2 } from "lucide-react";
import siteConfig from "../../config/siteConfig";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslation } from "../../data/translations";

export default function PaymentForm() {
  const { language } = useLanguage();
  const [amount, setAmount] = useState(() => {
    // Check if there's a prefilled amount from service selection
    const prefilledAmount = localStorage.getItem("prefilledAmount");
    if (prefilledAmount) {
      localStorage.removeItem("prefilledAmount"); // Clear it after using
      return prefilledAmount;
    }
    return siteConfig.minimumAmount.toString();
  });
  const [errors, setErrors] = useState({ amount: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setAmount(value);
      setErrors((prev) => ({ ...prev, amount: "" }));
    }
  };

  const handleSuggestedAmount = (suggestedAmount) => {
    setAmount(suggestedAmount.toString());
    setErrors((prev) => ({ ...prev, amount: "" }));
  };

  const generatePaymentToken = (amount, selectedUpiId) => {
    // Include UPI ID in token for consistency
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const upiIndex = siteConfig.upiIds.indexOf(selectedUpiId);
    return btoa(`${amount}-${timestamp}-${randomStr}-${upiIndex}`);
  };

  const savePaymentTransaction = (amount, paymentToken, selectedUpiId) => {
    const transaction = {
      id: `payment_${Date.now()}`,
      type: "payment_initiated",
      amount: parseInt(amount),
      date: new Date().toISOString(),
      description: `Payment Initiated - ₹${amount}`,
      status: "initiated",
      paymentToken: paymentToken,
      upiId: selectedUpiId
    };

    // Get existing transactions
    const existingTransactions = JSON.parse(localStorage.getItem("paymentTransactions") || "[]");
    
    // Add new transaction
    existingTransactions.push(transaction);
    
    // Save back to localStorage
    localStorage.setItem("paymentTransactions", JSON.stringify(existingTransactions));
    
    return transaction.id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = { amount: "" };
    let valid = true;

    const parsedAmount = parseInt(amount, 10);
    if (!amount || parsedAmount < siteConfig.minimumAmount || parsedAmount > siteConfig.maximumAmount) {
      newErrors.amount = `Amount must be between ₹${siteConfig.minimumAmount} and ₹${siteConfig.maximumAmount}`;
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      setIsLoading(true);
      // Select random UPI ID for this payment
      const selectedUpiId = siteConfig.getRandomUpiId();
      const paymentToken = generatePaymentToken(amount, selectedUpiId);
      
      // Save payment transaction
      savePaymentTransaction(amount, paymentToken, selectedUpiId);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate(`/payment/${paymentToken}`);
      setIsLoading(false);
    }
  };

  const suggestedAmounts = [siteConfig.minimumAmount, 75, 100, 250];

  // Calculate bonus amount - 40% for 100, 200, 500
  const getBonus = (amt) => {
    const parsedAmt = parseInt(amt, 10);
    if (parsedAmt >= 100 && parsedAmt < 250) {
      return 40; // Fixed 40rs bonus for 100+
    } else if (parsedAmt >= 250) {
      return 110; // Fixed 110rs bonus for 250+
    }
    return 0;
  };

  const currentBonus = getBonus(amount);

  return (
    <div className="p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-green-50 rounded-xl p-6 space-y-4 mx-auto"
      >
        <div>
          <label className="block font-semibold mb-1">{getTranslation('amount', language)}</label>
          <div className="flex items-center bg-green-100 rounded-md">
            <span className="px-3 text-gray-500">₹</span>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              className="w-full p-2 bg-transparent text-black focus:outline-none disabled:opacity-50"
              placeholder={`${getTranslation('enterAmount', language)} (${siteConfig.minimumAmount} - ${siteConfig.maximumAmount})`}
              disabled={isLoading}
            />
          </div>
          {errors.amount && (
            <p className="text-red-500 p-3 rounded-md text-sm" aria-live="polite">
              {errors.amount}
            </p>
          )}
          
          {/* Show bonus if applicable */}
          {currentBonus > 0 && (
            <div className="mt-2 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-sm font-semibold text-green-700">
                {getTranslation('addAmountGetBonus', language).replace('{amount}', amount).replace('{bonus}', currentBonus)}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {suggestedAmounts.map((suggestedAmount) => (
            <button
              key={suggestedAmount}
              type="button"
              onClick={() => handleSuggestedAmount(suggestedAmount)}
              className="px-4 py-2 bg-green-100 text-green-600 font-semibold rounded-lg hover:bg-green-200 transition disabled:opacity-50"
              disabled={isLoading}
            >
              ₹{suggestedAmount}
            </button>
          ))}
        </div>

        {/* Special Offer Buttons */}
        <div className="space-y-2">
          <p className="text-center text-sm font-semibold text-gray-700">{getTranslation('specialOffers', language)}</p>
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => handleSuggestedAmount(100)}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-lg hover:bg-yellow-200 transition disabled:opacity-50"
              disabled={isLoading}
            >
              {getTranslation('add100Get40', language)}
            </button>
            <button
              type="button"
              onClick={() => handleSuggestedAmount(250)}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-lg hover:bg-yellow-200 transition disabled:opacity-50"
              disabled={isLoading}
            >
              {getTranslation('add250Get110', language)}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full bg-green-500 text-white font-semibold py-2 rounded-md hover:bg-green-600 transition flex items-center justify-center ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              {getTranslation('processing', language)}
            </>
          ) : (
            getTranslation('proceedToPay', language)
          )}
        </button>
        <PayInfo />
      </form>
    </div>
  );
}