import React, { useEffect, useState } from "react";
import Header from "../components/Header";

export default function GetOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("https://smmguru.mssonukr.workers.dev/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getServiceIcon = (serviceName) => {
    if (!serviceName) return "/ic/default.webp";
    const name = serviceName.toLowerCase();
    if (name.includes("insta")) return "/ic/insta.webp";
    if (name.includes("youtube")) return "/ic/youtube.webp";
    if (name.includes("facebook")) return "/ic/facebook.webp";
    if (name.includes("telegram")) return "/ic/telegram.webp";
    return "/ic/default.webp";
  };

  if (loading)
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-screen text-lg font-medium text-gray-600">
          Loading orders...
        </div>
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-screen text-red-600 font-medium">
          Error: {error}
        </div>
      </>
    );

  if (orders.length === 0)
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-screen text-gray-600 font-medium">
          No orders found.
        </div>
      </>
    );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-6">

        <div className="overflow-x-auto mt-20 bg-white shadow-md rounded-xl">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="py-3 px-4 font-semibold">Order</th>
                <th className="py-3 px-4 font-semibold">Quantity</th>
                <th className="py-3 px-4 font-semibold">Link</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Created (IST)</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="py-2 px-4 flex items-center gap-2">
                    <img
                      src={getServiceIcon(order.service)}
                      alt="icon"
                      className="w-5 h-5 rounded"
                    />
                    <span>{order.id}</span>
                  </td>
                  <td className="py-2 px-4">{order.quantity}</td>
                  <td className="py-2 px-4 text-blue-600 break-all">
                    <a
                      href={order.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {order.link}
                    </a>
                  </td>
                  <td className="py-2 px-4 font-medium">₹{order.amount}</td>
                  <td className="py-2 px-4 text-sm text-gray-500">
                    {new Date(order.created_at * 1000).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      hour12: true,
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
