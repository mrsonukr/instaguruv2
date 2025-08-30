import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import siteConfig from "../config/siteConfig";

const ProcessLink = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("Processing your request...");

  useEffect(() => {
    processPaymentLink();
  }, []);

  const processPaymentLink = async () => {
    try {
      // Decode token
      const decodedData = atob(token);
      const [amount, timestamp, randomStr] = decodedData.split("|");
      
      const parsedAmount = parseInt(amount, 10);
      const linkTimestamp = parseInt(timestamp, 10);
      const currentTime = Date.now();
      
      // Check if link is expired (2 minutes = 120000 ms)
      if (currentTime - linkTimestamp > 120000) {
        setStatus("error");
        setMessage("Link has expired. Links are valid for 2 minutes only.");
        setTimeout(() => navigate("/orders"), 3000);
        return;
      }

      // Check if link was already used
      const usedLinks = JSON.parse(localStorage.getItem("usedPaymentLinks") || "[]");
      if (usedLinks.includes(token)) {
        setStatus("error");
        setMessage("This link has already been used.");
        setTimeout(() => navigate("/orders"), 3000);
        return;
      }

      // Mark link as used
      usedLinks.push(token);
      localStorage.setItem("usedPaymentLinks", JSON.stringify(usedLinks));

      const transactions = [];

      // Add the payment amount
      const paymentTransaction = {
        id: `upi_payment_${Date.now()}`,
        type: "payment",
        amount: parsedAmount,
        date: new Date().toISOString(),
        description: "Payment via UPI",
        status: "completed"
      };

      // Get existing payment transactions
      const existingTransactions = JSON.parse(localStorage.getItem("paymentTransactions") || "[]");
      existingTransactions.push(paymentTransaction);
      localStorage.setItem("paymentTransactions", JSON.stringify(existingTransactions));

      transactions.push(paymentTransaction);

      // Show success
      setStatus("success");
      const totalAdded = transactions.reduce((sum, txn) => sum + txn.amount, 0);
      setMessage(`Successfully processed payment of ₹${totalAdded}!`);
      
      // Redirect to orders after 2 seconds
      setTimeout(() => navigate("/orders"), 2000);

    } catch (error) {
      setStatus("error");
      setMessage("Invalid or corrupted link.");
      setTimeout(() => navigate("/orders"), 3000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "processing":
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case "error":
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "processing":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {getStatusIcon()}
        <h2 className={`text-2xl font-bold mt-4 ${getStatusColor()}`}>
          {status === "processing" ? "Processing..." : status === "success" ? "Success!" : "Error"}
        </h2>
        <p className="text-gray-600 mt-2">{message}</p>
      </div>
    </div>
  );
};

export default ProcessLink;