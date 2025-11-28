import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { Package, CheckCircle, Clock, XCircle } from "lucide-react";
import { updatePageSEO } from "../utils/seoUtils";
import { useLanguage } from "../context/LanguageContext";
import { getTranslation } from "../data/translations";

const enableOrdersDebugLogs = false;
const logOrdersDebug = (...args) => {
  if (enableOrdersDebugLogs && typeof console !== "undefined") {
    console.log("[OrdersDebug]", ...args);
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { language } = useLanguage();

  const sortOrdersByCreatedAt = (ordersArray) => {
    return [...ordersArray].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB - dateA;
    });
  };

  useEffect(() => {
    // Update SEO for orders page
    updatePageSEO("orders");

    // Load orders from localStorage
    loadOrders();

    // Set up automatic status updates every minute
    const statusUpdateInterval = setInterval(() => {
      updateOrderStatuses();
    }, 60000); // Check every minute

    // Update current time every second
    const timeUpdateInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(statusUpdateInterval);
      clearInterval(timeUpdateInterval);
    };
  }, []);

  const loadOrders = () => {
    const savedOrders = JSON.parse(localStorage.getItem("userOrders") || "[]");
    logOrdersDebug("Loaded orders:", savedOrders);

    // Apply status updates when loading orders and ensure all orders have createdAt
    const updatedOrders = savedOrders.map((order) => {
      logOrdersDebug(
        "Processing order:",
        order?.id,
        "Service:",
        order?.service
      );

      // Add createdAt timestamp if missing (for existing orders)
      if (!order.createdAt) {
        order.createdAt = order.date + "T00:00:00.000Z";
      }

      if (order.status === "completed") return order;

      const createdAt = new Date(order.createdAt);
      const now = new Date();
      const timeDiff = now - createdAt;
      const minutesDiff = timeDiff / (1000 * 60);

      if (minutesDiff >= 660) {
        // 10 hours + 1 hour = 11 hours (660 minutes)
        return { ...order, status: "completed" };
      } else if (minutesDiff >= 600) {
        // 10 hours = 600 minutes
        return { ...order, status: "processing" };
      } else {
        return { ...order, status: "pending" };
      }
    });

    // Save updated orders back to localStorage
    localStorage.setItem("userOrders", JSON.stringify(updatedOrders));
    setOrders(sortOrdersByCreatedAt(updatedOrders));
  };

  const updateOrderStatuses = () => {
    const savedOrders = JSON.parse(localStorage.getItem("userOrders") || "[]");
    let hasUpdates = false;

    const updatedOrders = savedOrders.map((order) => {
      if (order.status === "completed") return order; // Don't change completed orders

      // Ensure createdAt exists
      if (!order.createdAt) {
        order.createdAt = order.date + "T00:00:00.000Z";
      }

      const createdAt = new Date(order.createdAt);
      const now = new Date();
      const timeDiff = now - createdAt;
      const minutesDiff = timeDiff / (1000 * 60);

      let newStatus = order.status;

      if (minutesDiff >= 660) {
        // 10 hours + 1 hour = 11 hours (660 minutes)
        newStatus = "completed";
      } else if (minutesDiff >= 600) {
        // 10 hours = 600 minutes
        newStatus = "processing";
      } else {
        newStatus = "pending";
      }

      if (newStatus !== order.status) {
        hasUpdates = true;
        return { ...order, status: newStatus };
      }

      return order;
    });

    if (hasUpdates) {
      localStorage.setItem("userOrders", JSON.stringify(updatedOrders));
      setOrders(sortOrdersByCreatedAt(updatedOrders));
    }
  };

  const getTimeAgo = (createdAt) => {
    if (!createdAt) return "";

    const created = new Date(createdAt);
    const now = new Date();
    const timeDiff = now - created;
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (minutesDiff < 1) return getTranslation("justNow", language);
    if (minutesDiff < 60)
      return `${minutesDiff} ${getTranslation("minAgo", language)}`;

    const hoursDiff = Math.floor(minutesDiff / 60);
    if (hoursDiff < 24)
      return `${hoursDiff} ${
        hoursDiff > 1
          ? getTranslation("hoursAgo", language)
          : getTranslation("hourAgo", language)
      }`;

    const daysDiff = Math.floor(hoursDiff / 24);
    return `${daysDiff} ${
      daysDiff > 1
        ? getTranslation("daysAgo", language)
        : getTranslation("dayAgo", language)
    }`;
  };

  const getServiceIcon = (service) => {
    if (!service) {
      logOrdersDebug("Service is undefined or null:", service);
      return (
        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
      );
    }

    const serviceLower = service.toLowerCase();
    logOrdersDebug("Service name:", service, "Lowercase:", serviceLower);

    // Check for exact matches first
    if (serviceLower === "instagram") {
      return (
        <div className="w-8 h-8 rounded-full flex items-center justify-center">
          <img
            src="/ic/insta.webp"
            alt="Instagram"
            className="w-8 h-8 rounded-full"
          />
        </div>
      );
    } else if (serviceLower === "youtube") {
      return (
        <div className="w-8 h-8 rounded-full flex items-center justify-center">
          <img
            src="/ic/youtube.webp"
            alt="YouTube"
            className="w-8 h-8 rounded-full"
          />
        </div>
      );
    } else if (serviceLower === "facebook") {
      return (
        <div className="w-8 h-8 rounded-full flex items-center justify-center">
          <img
            src="/ic/facebook.webp"
            alt="Facebook"
            className="w-8 h-8 rounded-full"
          />
        </div>
      );
    } else if (serviceLower === "netflix") {
      return (
        <div className="w-8 h-8 rounded-full flex items-center justify-center">
          <img
            src="/ic/netflix.svg"
            alt="Netflix"
            className="w-8 h-8 rounded-full"
          />
        </div>
      );
    } else if (serviceLower === "spotify") {
      return (
        <div className="w-8 h-8 rounded-full flex items-center justify-center">
          <img
            src="/ic/spotify.webp"
            alt="Spotify"
            className="w-8 h-8 rounded-full"
          />
        </div>
      );
    } else if (
      serviceLower === "amazon prime" ||
      serviceLower === "amazon-prime"
    ) {
      return (
        <div className="w-8 h-8 rounded-full flex items-center justify-center">
          <img
            src="/ic/prime.webp"
            alt="Amazon Prime"
            className="w-8 h-8 rounded-full"
          />
        </div>
      );
    } else if (serviceLower === "telegram") {
      return (
        <div className="w-8 h-8 rounded-full flex items-center justify-center">
          <img
            src="/ic/telegram.webp"
            alt="Telegram"
            className="w-8 h-8 rounded-full"
          />
        </div>
      );
    } else {
      // Fallback to partial matches
      if (
        serviceLower.includes("instagram") ||
        serviceLower.includes("insta")
      ) {
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <img
              src="/ic/insta.webp"
              alt="Instagram"
              className="w-8 h-8 rounded-full"
            />
          </div>
        );
      } else if (
        serviceLower.includes("youtube") ||
        serviceLower.includes("yt")
      ) {
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <img
              src="/ic/youtube.webp"
              alt="YouTube"
              className="w-8 h-8 rounded-full"
            />
          </div>
        );
      } else if (
        serviceLower.includes("facebook") ||
        serviceLower.includes("fb")
      ) {
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <img
              src="/ic/facebook.webp"
              alt="Facebook"
              className="w-8 h-8 rounded-full"
            />
          </div>
        );
      } else if (serviceLower.includes("netflix")) {
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <img
              src="/ic/netflix.svg"
              alt="Netflix"
              className="w-8 h-8 rounded-full"
            />
          </div>
        );
      } else if (serviceLower.includes("spotify")) {
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <img
              src="/ic/spotify.webp"
              alt="Spotify"
              className="w-8 h-8 rounded-full"
            />
          </div>
        );
      } else if (
        serviceLower.includes("amazon") ||
        serviceLower.includes("prime")
      ) {
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <img
              src="/ic/prime.webp"
              alt="Amazon Prime"
              className="w-8 h-8 rounded-full"
            />
          </div>
        );
      } else if (
        serviceLower.includes("telegram") ||
        serviceLower.includes("tg")
      ) {
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <img
              src="/ic/telegram.webp"
              alt="Telegram"
              className="w-8 h-8 rounded-full"
            />
          </div>
        );
      }

      // Default icon for other services
      logOrdersDebug("No matching service icon found for:", service);
      return (
        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return getTranslation("completed", language);
      case "processing":
        return getTranslation("processing", language);
      case "pending":
        return getTranslation("pending", language);
      case "cancelled":
        return getTranslation("cancelled", language);
      default:
        return "Unknown";
    }
  };

  // Keep table headers in English only
  const getTableHeaderText = (key) => {
    const headers = {
      orderDetails: "Order Details",
      service: "Service",
      quantity: "Quantity",
      link: "Link",
      amount: "Amount",
      status: "Status",
      date: "Date",
    };
    return headers[key] || key;
  };

  return (
    <>
      <Header />
      <div className="mt-20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {getTranslation("myOrders", language)}
            </h1>
            <div className="flex justify-between items-center gap-4">
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                {currentTime.toLocaleTimeString()}
              </div>
                <a className="text-white text-sm  bg-green-500 px-3 py-2 rounded-lg" href="https://wa.me/917225979671?text=Hello%20Sir">Contact Us</a>
            </div>
          </div>

          {orders.length > 0 ? (
            <div className="bg-white rounded-lg  overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        {getTableHeaderText("orderDetails")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        {getTableHeaderText("status")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        {getTableHeaderText("quantity")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        {getTableHeaderText("link")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        {getTableHeaderText("amount")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        {getTableHeaderText("service")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        {getTableHeaderText("date")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {getServiceIcon(order.service)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {order.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.quantity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {order.link}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{order.amount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.service}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div>{order.date}</div>
                            <div className="text-xs text-gray-400">
                              {getTimeAgo(order.createdAt)}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {getTranslation("noOrdersYet", language)}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {getTranslation("noOrdersMessage", language)}
              </p>
              <a
                href="/"
                className="inline-block bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                {getTranslation("browseServices", language)}
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;
