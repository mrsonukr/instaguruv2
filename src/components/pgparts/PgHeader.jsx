import React from "react";

const PgHeader = () => {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-[#5F259F] text-white">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded bg-white flex items-center justify-center">
          <img src="/ic/logo.svg" alt="Logo" className="h-7 w-7 object-contain" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-xs text-violet-100/80">Merchant</span>
          <span className="text-sm font-semibold">SmmGuru Limited</span>
        </div>
      </div>
      <div className="text-right leading-tight">
        <span className="block text-[11px] text-violet-100/80">Amount</span>
        <span className="text-base font-semibold">₹1.00</span>
      </div>
    </div>
  );
};

export default PgHeader;
