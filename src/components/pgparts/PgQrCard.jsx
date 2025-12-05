import React, { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import UpiQrCode from "./UpiQrCode";

const PgQrCard = () => {
  const [timeLeft, setTimeLeft] = useState(600);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className="bg-white px-6 ">
      <div className="text-center">
        <p className="font-semibold text-gray-800">Scan QR Code</p>
        <p className="text-sm text-gray-500 capitalize ">Payment will be confirmed automatically.</p>
      </div>

      <div className="p-4 flex flex-col items-center">
        <div className="bg-white ">
          <UpiQrCode pa="mssonukr@upi" pn="Merchant" amount="20" />
        </div>
        <div className="flex items-center gap-2 mt-3 text-sm py-1 px-3 rounded-full bg-violet-100 text-violet-800">
          <Timer className="w-4 h-4 text-violet-700" />
          <span className="font-semibold font-mono tabular-nums w-12 text-center text-violet-900">
            {formatTime(timeLeft)}
          </span>
          <span className="text-[11px] font-medium">Waiting For Payment</span>
        </div>
        
      </div>

      <div className="flex items-center justify-center gap-4 mt-5">
        <img src="/ic/phonepe.svg" alt="PhonePe" className="h-6" />
        <img src="/ic/gpay.svg" alt="GPay" className="h-6" />
        <img src="/ic/paytm.svg" alt="Paytm" className="h-4" />
        <img src="/ic/bhim.svg" alt="Paytm" className="h-7" />
        <div className="flex items-center gap-1 text-xs text-gray-500 px-2 py-1 rounded-full border border-gray-200 bg-gray-50">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
          <span className="text-[11px] font-medium">All UPI</span>
        </div>
      </div>
    </div>
  );
};

export default PgQrCard;
