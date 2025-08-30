import React, { useState } from "react";
import { Copy, Check, Link as LinkIcon } from "lucide-react";
import Header from "../components/Header";
import siteConfig from "../config/siteConfig";

const GenerateLink = () => {
  const [amount, setAmount] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Generate encrypted token
  const generateToken = (amount) => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const data = `${amount}|${timestamp}|${randomStr}`;
    return btoa(data); // Base64 encode
  };

  const handleGenerate = () => {
    const parsedAmount = parseInt(amount, 10);
    
    if (!amount || parsedAmount < 1 || parsedAmount > 10000) {
      setError("Amount must be between ₹1 and ₹10,000");
      return;
    }

    setError("");
    const token = generateToken(parsedAmount);
    const link = `${window.location.origin}/add-funds/${token}`;
    setGeneratedLink(link);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = generatedLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setAmount("");
    setGeneratedLink("");
    setError("");
    setCopied(false);
  };

  return (
    <>
      <Header />
      <div className="mt-20 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-green-50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <LinkIcon className="w-6 h-6 text-green-600" />
              <h1 className="text-xl font-bold text-green-700">Generate Payment Link</h1>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount to add"
                  min="1"
                  max="10000"
                  className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={!amount}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  amount
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Generate Link
              </button>
            </div>
          </div>

          {generatedLink && (
            <div className="bg-white border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Generated Link
              </h3>
              
              <div className="bg-gray-50 p-3 rounded-lg mb-4 break-all text-sm">
                {generatedLink}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleReset}
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-600 transition"
                >
                  Reset
                </button>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-700">
                  ⚠️ This link is valid for 2 minutes only and can be used once.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GenerateLink;