import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { ThreeDot } from "react-loading-indicators";
import Skeleton from "../ui/Skeleton";
import Lottie from "lottie-react";
import successAnimation from "../../../public/animation/success.json";

// Test mode constant - set to true for testing, false for production
// When testMode = true: Payment will auto-succeed after 5 seconds without real payment
// When testMode = false: Uses real payment API checking
const testMode = false;
const enablePaymentDebugLogs = true;

const logPaymentDebug = (...args) => {
  if (enablePaymentDebugLogs && typeof console !== "undefined") {
    console.log("[PaymentDebug]", ...args);
  }
};

// Function to send order details to webhook
const sendOrderToWebhook = async (orderData) => {
  try {
    const webhookData = {
      id: parseInt(orderData.id) || 0,
      quantity: orderData.quantity || "1",
      link: orderData.link || "",
      amount: Math.floor(orderData.amount) || 0,
      service: orderData.service || "Service Order",
    };

    logPaymentDebug("Sending order to webhook", webhookData);

    const response = await fetch("https://bharatpe.mssonukr.workers.dev/neworder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    });

    if (response.ok) {
      const result = await response.json();
      logPaymentDebug("Webhook response received", result);
    } else {
      logPaymentDebug("Webhook request failed", {
        status: response.status,
        statusText: response.statusText,
      });
    }
  } catch (error) {
    logPaymentDebug("Error sending order to webhook", error);
    // Don't throw error - webhook failure shouldn't block order creation
  }
};

const PaymentPopup = ({
  showPopup,
  isClosing,
  selectedPaymentMethod,
  qrCodeDataUrl,
  timeLeft,
  amount,
  onClose,
  paymentToken,
  orderId,
  setTimeLeft,
}) => {
  const [loadedImages, setLoadedImages] = useState({});
  const [showAppNotInstalled, setShowAppNotInstalled] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("waiting");
  const navigate = useNavigate();
  const isPollingStartedRef = useRef(false);

  // Reset states when popup opens
  useEffect(() => {
    if (showPopup) {
      setPaymentStatus("waiting");
    } else {
      // Reset polling flag when popup closes
      isPollingStartedRef.current = false;
    }
  }, [showPopup]);







  // Payment polling logic for all payment methods
  useEffect(() => {
    let intervalId, countdownId, initialTimeout, testModeTimeout;

    if (showPopup && !isPollingStartedRef.current) {
      isPollingStartedRef.current = true;

      // Test mode: simulate payment success after 5 seconds
      if (testMode) {
        testModeTimeout = setTimeout(async () => {
          // Clear any existing intervals
          if (intervalId) clearInterval(intervalId);
          if (countdownId) clearInterval(countdownId);

          setPaymentStatus("success");

          // Create payment transaction record for test mode
          const existingTransactions = JSON.parse(localStorage.getItem("paymentTransactions") || "[]");
          const paymentTransaction = {
            id: `test_payment_${Date.now()}`,
            type: "payment",
            amount: Math.floor(amount), // Amount in rupees
            date: new Date().toISOString(),
            description: `Test Payment for service - ₹${amount}`,
            paymentId: `test_${Date.now()}`,
            method: "test_mode",
            vpa: "test@test",
            rrn: `TEST${Date.now()}`,
            currency: "INR",
            status: "completed"
          };

          // Add to paymentTransactions
          existingTransactions.push(paymentTransaction);
          localStorage.setItem("paymentTransactions", JSON.stringify(existingTransactions));

          // Get actual service details from localStorage
          const selectedService = JSON.parse(localStorage.getItem("selectedService") || "{}");

          // Create actual order in userOrders with real service details
          const finalOrderId = orderId || Math.floor(Math.random() * 900000) + 100000;
          const newOrder = {
            id: finalOrderId.toString(),
            service: selectedService.service,
            quantity: selectedService.packTitle,
            link: selectedService.profileLink,
            amount: Math.floor(amount),
            status: "pending",
            createdAt: new Date().toISOString()
          };

          // Add to userOrders
          const existingOrders = JSON.parse(localStorage.getItem("userOrders") || "[]");
          existingOrders.push(newOrder);
          localStorage.setItem("userOrders", JSON.stringify(existingOrders));

          // Send order to webhook
          await sendOrderToWebhook(newOrder);

          // Clear selectedService after creating order
          localStorage.removeItem("selectedService");

          // Redirect to orders page after 2 seconds
          setTimeout(() => {
            navigate("/orders");
          }, 2000);
        }, 30000); // 5 seconds delay for test mode

        // Start countdown timer for test mode
        countdownId = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(countdownId);
              setPaymentStatus("timeout");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => {
          if (testModeTimeout) clearTimeout(testModeTimeout);
          if (countdownId) clearInterval(countdownId);
        };
      }

      // Production mode: real payment checking
      const checkPayment = async () => {
        try {
          const parsedAmount = parseFloat(amount);
          if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            logPaymentDebug("Invalid amount, skipping check", { amount });
            return;
          }

          const amountInPaise = Math.round(parsedAmount * 100);
          logPaymentDebug("Checking payment status", {
            amount: parsedAmount,
            amountInPaise,
            paymentToken,
            selectedPaymentMethod,
          });
          const res = await fetch(`https://bharatpe.mssonukr.workers.dev/amount/${amountInPaise}`);
          if (res.ok) {
            const data = await res.json();
            logPaymentDebug("API response received", data);

            if (data.success && data.orderplaced) {
              const apiAmount = Math.round(parseFloat(data.amount));

              if (Number.isNaN(apiAmount) || apiAmount !== amountInPaise) {
                logPaymentDebug("Amount mismatch between API and expected", {
                  apiAmount,
                  expected: amountInPaise,
                  rawAmount: data.amount,
                });
                return;
              }

              const paymentId = data.payment_id || `upi_payment_${Date.now()}`;

              const existingTransactions = JSON.parse(localStorage.getItem("paymentTransactions") || "[]");
              clearInterval(intervalId);
              clearInterval(countdownId);

              setPaymentStatus("success");
              logPaymentDebug("Payment confirmed, updating records", { paymentId });

              const apiOrderId = data.orderid;
              const finalOrderId =
                (apiOrderId !== undefined && apiOrderId !== null ? apiOrderId : orderId) ||
                Math.floor(Math.random() * 900000) + 100000;
              const finalOrderIdStr = finalOrderId.toString();

              const paymentTransaction = {
                id: `upi_payment_${Date.now()}`,
                type: "payment",
                amount: parsedAmount,
                date: new Date().toISOString(),
                description: `Payment for service - ₹${parsedAmount}`,
                paymentId,
                method: selectedPaymentMethod,
                status: "completed",
                orderId: finalOrderIdStr
              };

              existingTransactions.push(paymentTransaction);
              localStorage.setItem("paymentTransactions", JSON.stringify(existingTransactions));

              const selectedService = JSON.parse(localStorage.getItem("selectedService") || "{}");
              const newOrder = {
                id: finalOrderIdStr,
                service: selectedService.service || "Service Order",
                quantity: selectedService.packTitle || "1",
                link: selectedService.profileLink || "order@example.com",
                amount: parsedAmount,
                status: "pending",
                createdAt: new Date().toISOString()
              };

              const existingOrders = JSON.parse(localStorage.getItem("userOrders") || "[]");
              const isOrderAlreadyStored = existingOrders.some(
                (order) => order.id?.toString() === finalOrderIdStr || order.orderId?.toString() === finalOrderIdStr
              );

              if (!isOrderAlreadyStored) {
                existingOrders.push(newOrder);
                localStorage.setItem("userOrders", JSON.stringify(existingOrders));
                logPaymentDebug("Stored new order in userOrders", newOrder);

                // Send order to webhook
                await sendOrderToWebhook(newOrder);
              } else {
                logPaymentDebug("Order already exists in userOrders, skipping insert", { finalOrderIdStr });
              }

              localStorage.removeItem("selectedService");

              setTimeout(() => {
                navigate("/orders");
              }, 2000);
            } else {
              logPaymentDebug("Payment not completed yet", data);
            }
          } else {
            logPaymentDebug("Payment status API returned non-OK response", {
              status: res.status,
              statusText: res.statusText,
            });
          }
        } catch (error) {
          // Handle payment check error silently
          logPaymentDebug("Error while checking payment status", error);
        }
      };

      // First check after 15 seconds, then every 10 seconds
      initialTimeout = setTimeout(() => {
        checkPayment();
        intervalId = setInterval(checkPayment, 10000);
      }, 15000);

      // Start countdown timer
      countdownId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            clearInterval(countdownId);
            setPaymentStatus("timeout");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (countdownId) clearInterval(countdownId);
      if (initialTimeout) clearTimeout(initialTimeout);
      if (testModeTimeout) clearTimeout(testModeTimeout);
    };
  }, [showPopup, selectedPaymentMethod, orderId, amount, navigate, setTimeLeft]);

  const handleClose = () => {

    // Mark transaction as cancelled if still initiated
    if (paymentToken && paymentStatus === "waiting") {
      const existingTransactions = JSON.parse(localStorage.getItem("paymentTransactions") || "[]");
      const updatedTransactions = existingTransactions.map(txn => {
        if (txn.paymentToken === paymentToken && txn.status === "initiated") {
          return {
            ...txn,
            status: "cancelled",
            updatedAt: new Date().toISOString(),
            description: `Payment Cancelled - ₹${amount}`
          };
        }
        return txn;
      });
      localStorage.setItem("paymentTransactions", JSON.stringify(updatedTransactions));
    }

    onClose();

    // Page refresh ONLY in Safari after closing popup
    setTimeout(() => {
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );
      if (isSafari) {
        window.location.reload();
      }
    }, 300);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleImageLoad = (imageName) => {
    setLoadedImages((prev) => ({ ...prev, [imageName]: true }));
  };

  // Effect to show "app not installed" message after 3 seconds
  useEffect(() => {
    if (showPopup && selectedPaymentMethod !== "qrcode") {
      const timer = setTimeout(() => {
        setShowAppNotInstalled(true);
      }, 3000);

      return () => {
        clearTimeout(timer);
        setShowAppNotInstalled(false);
      };
    } else {
      setShowAppNotInstalled(false);
    }
  }, [showPopup, selectedPaymentMethod]);

  const PaymentIcon = ({ src, alt, className, imageName }) => (
    <div className="relative inline-block">
      {!loadedImages[imageName] && (
        <Skeleton
          className={`absolute inset-0 ${className} rounded transition-all duration-200`}
        />
      )}
      <img
        loading="lazy"
        src={src}
        alt={alt}
        onLoad={() => handleImageLoad(imageName)}
        className={`${className} transition-opacity duration-300 ease-in-out ${loadedImages[imageName] ? "opacity-100" : "opacity-0"
          }`}
        style={{ willChange: "opacity", backfaceVisibility: "hidden" }}
      />
    </div>
  );

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 h-50px bg-black bg-opacity-50 z-50 flex items-end">
      <div
        className={`bg-white w-full rounded-t-3xl transform transition-transform duration-300 ease-out ${isClosing ? "translate-y-full" : "translate-y-0"
          }`}
      >
        {/* iPhone-style handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="p-4">
          {/* Header - Hide when payment is successful */}
          {paymentStatus !== "success" && (
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedPaymentMethod === "qrcode"
                  ? "Scan QR Code By Taking Screenshot"
                  : "Payment Processing"}
              </h3>
              <button
                onClick={(e) => {
                  if (e.detail === 2) {
                    handleClose();
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Content based on payment method */}
          {selectedPaymentMethod === "qrcode" ? (
            <div className="text-center py-2">
              {paymentStatus === "success" ? (
                <div className="bg-white p-4 rounded-lg relative">
                  <button
                    onClick={(e) => {
                      if (e.detail === 2) {
                        handleClose();
                      }
                    }}
                    className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="flex flex-col items-center">
                    <Lottie
                      animationData={successAnimation}
                      loop={false}
                      style={{ width: 150, height: 150 }}
                    />
                    <p className="text-lg font-semibold text-black mt-2">Payment Successful</p>
                  </div>
                </div>
              ) : paymentStatus === "timeout" ? (
                <div className="bg-red-100 p-4 rounded-lg border border-red-400 text-red-800">
                  ❌ Payment Timeout. Redirecting to wallet...
                </div>
              ) : qrCodeDataUrl ? (
                <>
                  <div className="bg-white p-4 rounded-xl border-2 border-gray-200 inline-block mb-4">
                    <img
                      src={qrCodeDataUrl}
                      alt="Payment QR Code"
                      className="mx-auto"
                    />
                  </div>
                  <p className="text-sm text-red-600 mb-4">
                    {formatTime(timeLeft)} Time Remaining
                  </p>

                  <p className="text-sm text-gray-600 mb-2">
                    Scan this QR code with any UPI app to pay ₹{amount}
                  </p>

                  <div className="flex justify-center items-center gap-4 mt-4">
                    <img className="h-4" src="/ic/paytm.svg" alt="" />
                    <img className="h-6" src="/ic/phonepe.svg" alt="" />
                    <img className="h-6" src="/ic/gpay.svg" alt="" />
                    <img className="h-4" src="/ic/upi.svg" alt="" />
                  </div>
                </>
              ) : (
                <div className="py-8">
                  <div className="flex justify-center mb-4">
                    <ThreeDot
                      color="#3b7aff"
                      size="medium"
                      text=""
                      textColor=""
                    />
                  </div>
                  <p className="text-gray-600">Generating QR Code...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              {paymentStatus === "success" ? (
                <div className="bg-white p-4 rounded-lg relative">
                  <button
                    onClick={(e) => {
                      if (e.detail === 2) {
                        handleClose();
                      }
                    }}
                    className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="flex flex-col items-center">
                    <Lottie
                      animationData={successAnimation}
                      loop={false}
                      style={{ width: 150, height: 150 }}
                    />
                    <p className="text-lg font-semibold text-black mt-2">Payment Successful</p>
                  </div>
                </div>
              ) : paymentStatus === "timeout" ? (
                <div className="bg-red-100 p-4 rounded-lg border border-red-400 text-red-800">
                  Payment Timeout. Retry...
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <ThreeDot color="#3b7aff" size="large" text="" textColor="" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Processing Payment</h4>

                  <p>Please wait while we process your payment.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPopup;