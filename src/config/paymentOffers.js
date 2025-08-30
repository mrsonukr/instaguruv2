// Payment Offers Configuration
// Easy to manage offers for different payment methods

export const PAYMENT_OFFERS = {
  paytm: {
    discount: 0, // ₹0 OFF
    label: "PayTM",
    icon: "/ic/paytm.svg",
    value: "paytm"
  },
  phonepe: {
    discount: 2, // ₹2 OFF
    label: "Phone Pe",
    icon: "/ic/phonepe.svg",
    value: "phonepe"
  },
  gpay: {
    discount: 0, // ₹0 OFF
    label: "Google Pay",
    icon: "/ic/gpay.svg",
    value: "gpay"
  },
  upi: {
    discount: 2, // ₹2 OFF
    label: "Other UPI",
    icon: "/ic/upi.svg",
    value: "upi"
  },
  qrcode: {
    discount: 0, // ₹0 OFF
    label: "Scan QR Code",
    icon: "qr", // Special icon type
    value: "qrcode"
  }
};

// Helper function to get discount for a payment method
export const getDiscount = (paymentMethod) => {
  return PAYMENT_OFFERS[paymentMethod]?.discount || 0;
};

// Helper function to check if payment method has discount
export const hasDiscount = (paymentMethod) => {
  return getDiscount(paymentMethod) > 0;
};

// Helper function to get all payment methods with their offers
export const getPaymentMethodsWithOffers = () => {
  return Object.values(PAYMENT_OFFERS);
};

// Helper function to get discounted amount
export const getDiscountedAmount = (originalAmount, paymentMethod) => {
  const discount = getDiscount(paymentMethod);
  return Math.max(0, parseFloat(originalAmount) - discount);
};
