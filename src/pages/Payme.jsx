import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import NoCopyText from "../components/ui/NoCopyText";
import PaymentHeader from "../components/payment/PaymentHeader";
import PaymentMethods from "../components/payment/PaymentMethods";
import PaymentPopup from "../components/payment/PaymentPopup";
import {
  getDiscountedAmount,
  getDiscount,
  isDiscountApplicable,
} from "../config/paymentOffers";

// ✅ UPI payment address
// const MAIN_PAYMENT_ADDRESS = "insta999guru@ybl";
const MAIN_PAYMENT_ADDRESS = "BHARATPE.8F0Q0K7Y9N63655@fbpe";

const Payme = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("1.00");
  const [amountError, setAmountError] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("phonepe");
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [timeLeft, setTimeLeft] = useState(180);
  const [displayAmount, setDisplayAmount] = useState(amount);

  const discountApplicable = isDiscountApplicable(
    selectedPaymentMethod,
    amount
  );

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = atob(token);
        const tokenParts = decodedToken.split("-");
        const [encodedAmount] = tokenParts;
        const parsedAmount = parseInt(encodedAmount, 10);

        if (parsedAmount && parsedAmount >= 1) {
          setAmount(parsedAmount.toString());
        } else {
          setAmountError("Invalid payment amount");
          setTimeout(() => navigate("/orders"), 2000);
        }
      } catch {
        setAmountError("Invalid payment token");
        setTimeout(() => navigate("/orders"), 2000);
      }
    }
  }, [token, navigate]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (token && showPopup) {
        const existingTransactions = JSON.parse(
          localStorage.getItem("paymentTransactions") || "[]"
        );
        const updatedTransactions = existingTransactions.map((txn) => {
          if (txn.paymentToken === token && txn.status === "initiated") {
            return {
              ...txn,
              status: "cancelled",
              updatedAt: new Date().toISOString(),
              description: `Payment Cancelled - ₹${amount}`,
            };
          }
          return txn;
        });
        localStorage.setItem(
          "paymentTransactions",
          JSON.stringify(updatedTransactions)
        );
      }
    };
  }, [token, showPopup, amount]);

  useEffect(() => {
    let timer;
    if (showPopup && selectedPaymentMethod === "qrcode" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            closePopup();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showPopup, selectedPaymentMethod, timeLeft]);

  useEffect(() => {
    if (!paymentInitiated) {
      const discountedAmount = getDiscountedAmount(
        amount,
        selectedPaymentMethod
      );
      setDisplayAmount(discountedAmount.toString());
    }
  }, [selectedPaymentMethod, amount, paymentInitiated]);

  const handleBack = () => {
    if (token) {
      const existingTransactions = JSON.parse(
        localStorage.getItem("paymentTransactions") || "[]"
      );
      const filteredTransactions = existingTransactions.filter(
        (txn) => !(txn.paymentToken === token && txn.status === "initiated")
      );
      localStorage.setItem(
        "paymentTransactions",
        JSON.stringify(filteredTransactions)
      );
    }
    navigate("/orders");
  };

  // ✅ Generate UPI QR Code
  const generateQRCode = async () => {
    const qrLink = `upi://pay?pa=${MAIN_PAYMENT_ADDRESS}&pn=SmmGuru&am=${displayAmount}&cu=INR`;
    try {
      const qrDataUrl = await QRCode.toDataURL(qrLink, {
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      // Handle QR code generation error silently
    }
  };

  // ✅ Continue button (always opens QR code)
  const handleContinue = async () => {
    if (!selectedPaymentMethod) {
      alert("Please select a payment method");
      return;
    }

    // Lock in the discount based on selected method
    const discountedAmount = getDiscountedAmount(amount, selectedPaymentMethod);
    setDisplayAmount(discountedAmount.toString());
    setPaymentInitiated(true);

    // Force QR code mode for popup
    setSelectedPaymentMethod("qrcode");

    setShowPopup(true);
    setIsClosing(false);
    setTimeLeft(180);

    await generateQRCode();
  };

  const closePopup = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsClosing(false);
      setQrCodeDataUrl("");
      setTimeLeft(180);
    }, 300);
  };

  if (amountError) {
    return (
      <div className="px-5">
        <PaymentHeader onBack={handleBack} />
        <div className="text-center mt-8">
          <p className="text-red-600 font-semibold">{amountError}</p>
          <p className="text-gray-500 mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <NoCopyText>
      <div className="px-5 flex flex-col">
        <PaymentHeader onBack={handleBack} />

        <div className="flex items-center justify-between my-4">
          <div className="flex gap-3 items-center">
            <img src="/ic/bill.svg" alt="Add Money" />
            <p>Add Money</p>
            {discountApplicable && (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-semibold">
                ₹{getDiscount(selectedPaymentMethod)} OFF
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {discountApplicable &&
              parseFloat(amount) > getDiscount(selectedPaymentMethod) && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{amount}
                </span>
              )}
            <span className="font-medium">₹{displayAmount}</span>
          </div>
        </div>

        <PaymentMethods
          selectedPaymentMethod={selectedPaymentMethod}
          onMethodSelect={setSelectedPaymentMethod}
          amount={parseFloat(amount)}
        />

        <div className="mt-auto pb-6">
          <button
            onClick={handleContinue}
            disabled={!selectedPaymentMethod}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
              selectedPaymentMethod
                ? "bg-black hover:bg-gray-800"
                : "bg-gray-700 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>

        <PaymentPopup
          showPopup={showPopup}
          isClosing={isClosing}
          selectedPaymentMethod={selectedPaymentMethod}
          qrCodeDataUrl={qrCodeDataUrl}
          timeLeft={timeLeft}
          amount={displayAmount}
          onClose={closePopup}
          paymentToken={token}
          setTimeLeft={setTimeLeft}
        />
      </div>
    </NoCopyText>
  );
};

export default Payme;