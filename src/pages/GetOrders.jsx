import React, { useEffect, useState } from "react";
import { ExternalLink, Copy } from "lucide-react";
import Header from "../components/Header";

export default function GetOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 20;
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://smmguru.mssonutech.workers.dev/orders?page=${currentPage}&limit=${limit}`
      );
      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();
      setOrders(data.data || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const copyToClipboard = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const getServiceIcon = (serviceName) => {
    if (!serviceName) return "/ic/default.webp";

    const name = serviceName.toLowerCase();

    if (
      name.includes("insta") ||
      name.includes("instagram") ||
      serviceName.includes("इंस्टाग्राम")
    )
      return "/ic/insta.webp";

    if (name.includes("youtube") || serviceName.includes("यूट्यूब"))
      return "/ic/youtube.webp";

    if (name.includes("facebook") || serviceName.includes("फेसबुक"))
      return "/ic/facebook.webp";

    if (name.includes("telegram") || serviceName.includes("टेलीग्राम"))
      return "/ic/telegram.webp";

    return "/ic/default.webp";
  };

  const isValidUrl = (string) => {
    if (!string) return false;
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  // ✅ Date formatter: Today / Yesterday / dd Mon yyyy, hh:mm AM/PM
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";

    const date = new Date(timestamp * 1000);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) return `Today, ${time}`;
    if (isYesterday) return `Yesterday, ${time}`;

    const datePart = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return `${datePart}, ${time}`;
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

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50 relative">
        {/* ✅ Copied toast with icon */}
        {copied && (
          <div className="fixed bottom-4 right-4 bg-green-600 rounded-full text-white px-4 py-2  z-50 flex items-center gap-2">
            <Copy className="w-4 h-4" />
            <span>Copied!</span>
          </div>
        )}

        <div className="mt-20 bg-white ">
          {/* MOBILE SCROLL FIX */}
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-700">
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Quantity</th>
                  <th className="py-3 px-4 font-semibold">Link</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Ordered At</th>
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

                    <td className="py-2 text-sm px-4">{order.quantity}</td>

                    <td className="py-2  px-4">
                      <div className="flex items-center gap-1 whitespace-nowrap max-w-xs">
                        {isValidUrl(order.link) ? (
                          <a
                            href={order.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open link"
                            className="flex-shrink-0"
                          >
                            <ExternalLink className="w-3 h-3 text-blue-500 hover:text-blue-700 cursor-pointer" />
                          </a>
                        ) : (
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        )}

                        <div
                          className="bg-gray-200 px-2 py-1 rounded text-xs text-gray-700 cursor-pointer hover:bg-gray-300 flex-1 overflow-hidden text-ellipsis"
                          onClick={() => copyToClipboard(order.link)}
                          title={order.link || "Click to copy"}
                        >
                          {order.link}
                        </div>
                      </div>
                    </td>

                    <td className="py-2 text-sm px-4 font-medium whitespace-nowrap">
                      ₹{order.amount}
                    </td>

                    <td className="py-2 px-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 gap-3 flex-wrap">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`px-4 py-2 rounded-lg border shadow ${
              page === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border shadow ${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className={`px-4 py-2 rounded-lg border shadow ${
              page === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
