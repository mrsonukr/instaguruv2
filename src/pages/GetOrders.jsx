import React, { useEffect, useState } from "react";
import Header from "../components/Header";

export default function GetOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

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

  // Validate URL before making it clickable
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
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

      <div className="min-h-screen bg-gray-50 p-6">

        <div className="mt-20 bg-white shadow-md rounded-xl">
          {/* MOBILE SCROLL FIX */}
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse">
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
                      {isValidUrl(order.link) ? (
                        <a
                          href={order.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {order.link}
                        </a>
                      ) : (
                        <span className="text-gray-500">{order.link}</span>
                      )}
                    </td>

                    <td className="py-2 px-4 font-medium">₹{order.amount}</td>

                    <td className="py-2 px-4 text-sm text-gray-500">
                      {new Date(order.created_at * 1000).toLocaleString(
                        "en-IN",
                        {
                          timeZone: "Asia/Kolkata",
                          hour12: true,
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
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
