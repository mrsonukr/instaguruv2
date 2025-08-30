import React from "react";
import { ChevronLeft } from "lucide-react";

const PaymentHeader = ({ onBack }) => (
  <div className="flex items-center gap-3 py-4">
    <div className="-ml-2 cursor-pointer" onClick={onBack}>
      <ChevronLeft size={32} />
    </div>
    <p className="text-xl font-semibold">Payment Methods</p>
  </div>
);

export default PaymentHeader;