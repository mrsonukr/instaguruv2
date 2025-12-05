import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

const UpiQrCode = ({ pa, pn, amount, size = 288 }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  useEffect(() => {
    const generateQRCode = async () => {
      const qrLink = `upi://pay?pa=${pa}&pn=${encodeURIComponent(
        pn
      )}&am=${amount}&cu=INR`;
      try {
        const qrDataUrl = await QRCode.toDataURL(qrLink, {
          width: size,
          margin: 2,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        setQrCodeDataUrl(qrDataUrl);
      } catch (error) {
        // silently fail, QR will just not show
      }
    };

    generateQRCode();
  }, [pa, pn, amount, size]);

  if (!qrCodeDataUrl) {
    return (
      <div className="w-72 h-72 sm:h-80 flex items-center justify-center">
        <span className="text-sm text-gray-400">Generating QR...</span>
      </div>
    );
  }

  return (
    <img
      src={qrCodeDataUrl}
      alt="QR Code"
      className="w-72 h-72 sm:h-80 object-contain"
    />
  );
};

export default UpiQrCode;
