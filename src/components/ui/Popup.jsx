import { X, AlertTriangle, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslation } from "../../data/translations";

const Popup = ({ isVisible, onClose, requiredAmount = 0 }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const handleAddFunds = () => {
    // Create a payment token and redirect to payment page
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const paymentToken = btoa(`${requiredAmount}-${timestamp}-${randomStr}`);
    
    // Save payment transaction
    const transaction = {
      id: `popup_payment_${Date.now()}`,
      type: "payment_initiated",
      amount: requiredAmount,
      date: new Date().toISOString(),
      description: `Payment from popup - ₹${requiredAmount}`,
      status: "initiated",
      paymentToken: paymentToken
    };

    const existingTransactions = JSON.parse(localStorage.getItem("paymentTransactions") || "[]");
    existingTransactions.push(transaction);
    localStorage.setItem("paymentTransactions", JSON.stringify(existingTransactions));
    
    // Navigate to payment page
    navigate(`/payment/${paymentToken}`);
    onClose();
  };

  return (
    <>
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getTranslation('insufficientBalance', language)}
              </h3>
              <p className="text-gray-600">
                {getTranslation('insufficientBalanceMessage', language)}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleAddFunds}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                {getTranslation('addFunds', language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;