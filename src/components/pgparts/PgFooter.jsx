import React from "react";

const PgFooter = () => {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-xs text-gray-500">
      <div className="w-full border-t border-gray-200 mb-3" />
      <span>Powered by</span>
      <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
        <img src="/ic/phonepefull.svg" alt="PhonePe" className="h-5" />
        <span className="text-gray-300">|</span>
        <span className="font-medium">100% Secure UPI Payments</span>
      </div>
    </div>
  );
};

export default PgFooter;
