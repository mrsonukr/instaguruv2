import React, { useEffect, useState } from "react";
import { ExternalLink, Copy, Search, X } from "lucide-react";
import Header from "../components/Header";

export default function GetOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 20;
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://smmguru.mssonukr.workers.dev/orders?page=${currentPage}&limit=${limit}`
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

  const handleSearch = async (query) => {
    if (!query.trim()) {
      // If empty query, reset to full list
      setIsSearching(false);
      setSearchQuery("");
      fetchOrders(1);
      setPage(1);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://smmguru.mssonukr.workers.dev/search?query=${encodeURIComponent(query)}`
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 404) {
          // No record found - treat as empty results
          setOrders([]);
          setTotalPages(1);
          setPage(1);
          setIsSearching(true);
          return;
        }
        throw new Error(errorData.error || "Search failed");
      }

      const data = await res.json();
      setOrders(data.data ? [data.data] : []);
      setTotalPages(1);
      setPage(1);
      setIsSearching(true);
    } catch (err) {
      setError(err.message || "Search failed");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSearching) {
      fetchOrders(page);
    }
  }, [page, isSearching]);

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
          {isSearching ? "Searching..." : "Loading orders..."}
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

        <div className="mt-20 bg-white">
          {/* Search Bar */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-2 mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Order ID or UTR..."
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    if (!value.trim()) {
                      setIsSearching(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(searchQuery);
                    }
                  }}
                  className="w-full pl-10 pr-10 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {isSearching && searchQuery && (
                  <button
                    onClick={() => handleSearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            {isSearching && orders.length === 0 && !error && (
             <></>
            )}
            {isSearching && orders.length > 0 && (
              <p className="text-center text-green-600 mt-2 text-sm">Showing search result for: {searchQuery}</p>
            )}
          </div>

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
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      {isSearching ? "No results found." : "No orders available."}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className={`border-t hover:bg-gray-50 transition ${isSearching ? "bg-green-50" : ""}`}
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
                              <ExternalLink className="w-3 h-3 text-green-500 hover:text-green-700 cursor-pointer" />
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination - Hide when searching single result */}
        {!isSearching && (
          <div className="m-6 overflow-x-auto text-sm pb-2">
            <div className="flex justify-center gap-2 min-w-max">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className={`px-4 py-2 rounded-lg border  ${
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium border  ${
                    page === i + 1
                      ? "bg-green-600 text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className={`px-4 py-2 rounded-lg border  ${
                  page === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}