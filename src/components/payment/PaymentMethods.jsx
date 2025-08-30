import React from "react";
import WalletOption from "./WalletOption";
import SectionLabel from "./SectionLabel";
import { getPaymentMethodsWithOffers, hasDiscount, getDiscount } from "../../config/paymentOffers";

const PaymentMethods = ({ selectedPaymentMethod, onMethodSelect, amount = 0 }) => {
  return (
    <>
      {/* PAY WITH UPI */}
      <SectionLabel text="PAY WITH" icon="/ic/upi.png" />
      <div className="flex flex-col py-5 flex-grow">
        {getPaymentMethodsWithOffers().map((method) => (
          <WalletOption
            key={method.value}
            icon={method.icon === "qr" ? <QRCodeIcon /> : method.icon}
            label={
              hasDiscount(method.value) && amount > getDiscount(method.value) ? (
                <div className="flex items-center gap-2">
                  <span>{method.label}</span>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-semibold">
                    ₹{getDiscount(method.value)} OFF
                  </span>
                </div>
              ) : (
                method.label
              )
            }
            value={method.value}
            selectedMethod={selectedPaymentMethod}
            onSelect={onMethodSelect}
          />
        ))}
      </div>
    </>
  );
};

// QR Code SVG icon component
const QRCodeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-gray-600"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="5" y="5" width="3" height="3" fill="currentColor"/>
    <rect x="16" y="5" width="3" height="3" fill="currentColor"/>
    <rect x="5" y="16" width="3" height="3" fill="currentColor"/>
    <rect x="14" y="14" width="2" height="2" fill="currentColor"/>
    <rect x="17" y="14" width="2" height="2" fill="currentColor"/>
    <rect x="14" y="17" width="2" height="2" fill="currentColor"/>
    <rect x="19" y="17" width="2" height="2" fill="currentColor"/>
    <rect x="17" y="19" width="2" height="2" fill="currentColor"/>
  </svg>
);

export default PaymentMethods;