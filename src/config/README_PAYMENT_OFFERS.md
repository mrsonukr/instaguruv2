# Payment Offers Management

## How to Add/Modify Offers

To change offers for payment methods, simply edit the `PAYMENT_OFFERS` object in `src/config/paymentOffers.js`:

### Current Configuration:
```javascript
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
```

### How to Change Offers:

1. **Add ₹5 OFF to PayTM:**
   ```javascript
   paytm: {
     discount: 5, // Change from 0 to 5
     label: "PayTM",
     icon: "/ic/paytm.svg",
     value: "paytm"
   }
   ```

2. **Remove discount from PhonePe:**
   ```javascript
   phonepe: {
     discount: 0, // Change from 2 to 0
     label: "Phone Pe",
     icon: "/ic/phonepe.svg", 
     value: "phonepe"
   }
   ```

3. **Add ₹3 OFF to Google Pay:**
   ```javascript
   gpay: {
     discount: 3, // Change from 0 to 3
     label: "Google Pay",
     icon: "/ic/gpay.svg",
     value: "gpay"
   }
   ```

4. **Add ₹10 OFF to QR Code:**
   ```javascript
   qrcode: {
     discount: 10, // Change from 0 to 10
     label: "Scan QR Code",
     icon: "qr",
     value: "qrcode"
   }
   ```

### Adding New Payment Methods:

To add a new payment method (e.g., Amazon Pay):

```javascript
amazonpay: {
  discount: 1, // ₹1 OFF
  label: "Amazon Pay",
  icon: "/ic/amazonpay.svg", // Add icon to public/ic/ folder
  value: "amazonpay"
}
```

### Features:
- ✅ Automatic discount calculation
- ✅ Automatic UI updates (badges, strikethrough prices)
- ✅ Easy to modify offers
- ✅ Support for any number of payment methods
- ✅ Automatic validation (discount won't go below ₹0)

### Helper Functions:
- `getDiscount(paymentMethod)` - Get discount amount
- `hasDiscount(paymentMethod)` - Check if method has discount
- `getDiscountedAmount(originalAmount, paymentMethod)` - Calculate final amount
- `getPaymentMethodsWithOffers()` - Get all payment methods

That's it! Just change the discount values and the entire app will automatically update with the new offers.
