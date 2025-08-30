import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Redirecting = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to wallet after 3 seconds
    const timer = setTimeout(() => {
      navigate("/wallet");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Redirecting...
        </h2>
        <p className="text-gray-600">
          Please wait while we redirect you to your wallet
        </p>
      </div>
    </div>
  );
};

export default Redirecting;