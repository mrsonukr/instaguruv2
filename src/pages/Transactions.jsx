import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/ui/Footer";
import { updatePageSEO } from "../utils/seoUtils";
import { useLanguage } from "../context/LanguageContext";
import { getTranslation } from "../data/translations";
import { ClipboardList, Landmark } from "lucide-react";
import { Link } from "react-router-dom";

const Transactions = () => {
  const { language } = useLanguage();
  const [groupedData, setGroupedData] = useState({});
  const [totalStats, setTotalStats] = useState({ totalTx: 0, totalAmt: 0 });
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    updatePageSEO("transactions");
    const savedAuth = localStorage.getItem("transactions_authenticated");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNormalStats();
      fetchBalance();
      fetchTransactions();
    }
  }, [isAuthenticated]);

  const fetchNormalStats = async () => {
    try {
      const response = await fetch(
        "https://bharatpe.mssonukr.workers.dev/payments"
      );
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      if (data.success) {
        setTotalStats({
          totalTx: data.summary.total_transactions,
          totalAmt: data.summary.total_amount,
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://bharatpe.mssonukr.workers.dev/payments"
      );
      if (!response.ok) throw new Error("Failed to fetch transactions");

      const data = await response.json();
      if (!data.success) throw new Error("Invalid response format");

      const grouped = {};

      // Process last_3_days
      data.last_3_days?.forEach((day) => {
        const date = new Date(day.date);
        const category = getDateCategoryFromDate(date);

        if (!grouped[category]) {
          grouped[category] = {
            type: "detailed",
            transactions: [],
            totalAmount: day.amount,
            count: day.transactions,
          };
        }

        day.payments.forEach((payment) => {
          grouped[category].transactions.push({
            id: payment.id,
            data: payment,
          });
        });

        grouped[category].transactions.sort(
          (a, b) => b.data.created_at - a.data.created_at
        );
      });

      // Process older_data (summary only)
      data.older_data?.forEach((older) => {
        const date = new Date(older.date);
        const category = getDateCategoryFromDate(date);
        grouped[category] = {
          type: "summary",
          totalAmount: older.amount,
          count: older.transactions,
        };
      });

      // Sort categories by date (most recent first)
      const sortedCategories = Object.keys(grouped).sort((a, b) => {
        const timeA = getTimestampForCategory(a);
        const timeB = getTimestampForCategory(b);
        return timeB - timeA;
      });

      const sortedGrouped = {};
      sortedCategories.forEach((cat) => {
        sortedGrouped[cat] = grouped[cat];
      });

      setGroupedData(sortedGrouped);
    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTimestampForCategory = (cat) => {
    if (cat === "today") return new Date().setHours(0, 0, 0, 0);
    if (cat === "yesterday") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.setHours(0, 0, 0, 0);
    }
    const match = cat.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
    if (match) {
      const [, day, mon, year] = match;
      const monthMap = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };
      return new Date(parseInt(year), monthMap[mon], parseInt(day)).getTime();
    }
    return 0;
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === "8080") {
      setIsAuthenticated(true);
      setPasswordError("");
      localStorage.setItem("transactions_authenticated", "true");
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await fetch(
        "https://bharatpe.mssonukr.workers.dev/balance"
      );
      if (!response.ok) throw new Error("Balance fetch failed");
      const data = await response.json();
      setBalanceData(data);
    } catch (err) {
      console.error("Balance error:", err);
      setBalanceData({ balance: 0, currency: "INR" });
    }
  };

  const getDateCategoryFromDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const yesterdayOnly = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    if (dateOnly.getTime() === todayOnly.getTime()) return "today";
    if (dateOnly.getTime() === yesterdayOnly.getTime()) return "yesterday";

    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);

  const formatBalance = (balance) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const timeString = date.toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return `today, ${timeString}`;
    if (isYesterday) return `yesterday, ${timeString}`;

    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Dynamic Icon Based on Payer
  const getPaymentMethodIcon = (payer) => {
    let iconSrc = "/ic/upi.svg"; // Default UPI icon

    if (payer) {
      const lower = payer.toLowerCase();
      if (lower.includes("phonepe")) iconSrc = "/ic/phonepe.svg";
      else if (lower.includes("google") || lower.includes("gpay"))
        iconSrc = "/ic/gpay.svg";
      else if (lower.includes("paytm")) iconSrc = "/ic/paytm.svg";
    }

    return (
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
        <img
          src={iconSrc}
          alt={payer || "UPI"}
          className="w-5 h-5 object-contain"
          onError={(e) => (e.target.src = "/ic/upi.svg")} // Fallback if icon missing
        />
      </div>
    );
  };

  // Password Screen
  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="mt-20"></div>
        <div className="min-h-screen bg-white py-8">
          <div className="max-w-md mx-auto px-4">
            <div className="bg-white rounded-lg border p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  {getTranslation("transactions", language)}
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Enter password to view transactions
                </p>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter password"
                    required
                  />
                  {passwordError && (
                    <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 md:py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Access Transactions
                </button>
              </form>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="mt-20"></div>
        <div className="min-h-screen bg-white py-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {getTranslation("loadingTransactions", language)}
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="mt-40"></div>
        <div className="min-h-screen bg-white py-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                {getTranslation("errorLoadingTransactions", language)}
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchTransactions}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="mt-20"></div>
      <div className="min-h-screen bg-white py-4">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {getTranslation("transactions", language) || "Transactions"}
            </h1>
            <div className="flex space-x-4">
              <Link
                to="/getorders"
                className="inline-flex items-center gap-2 px-3 h-8 text-sm bg-green-600 text-white font-medium rounded-full hover:bg-green-700"
              >
                <ClipboardList size={16} /> Orders
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Transactions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalStats.totalTx}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(totalStats.totalAmt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Balance ({balanceData?.currency || "INR"})
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {balanceData?.balance !== undefined
                      ? formatBalance(balanceData.balance)
                      : "₹0.00"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-lg border border-x-0">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Transactions
              </h2>
            </div>

            {Object.keys(groupedData).length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No transactions found
                </h3>
              </div>
            ) : (
              <div>
                {Object.entries(groupedData).map(([category, group]) => (
                  <div key={category}>
                    {/* Date Header */}
                    {group.type === "detailed" ? (
                      <div className="px-6 py-3 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          {category} -{" "}
                          <span className="bg-gray-100 rounded-lg px-2 py-1 text-sm font-medium text-gray-900">
                            {formatAmount(group.totalAmount)} ({group.count})
                          </span>
                        </h3>
                      </div>
                    ) : (
                      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          {category}
                        </h3>
                        <span className="bg-gray-100 rounded-lg px-2 py-1 text-sm font-medium text-gray-900">
                          {formatAmount(group.totalAmount)} ({group.count})
                        </span>
                      </div>
                    )}

                    {/* Transactions */}
                    {group.type === "detailed" && (
                      <div className="divide-y divide-gray-200">
                        {group.transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
                          >
                            <div className="flex items-center space-x-3">
                              {/* Dynamic Icon */}
                              {getPaymentMethodIcon(tx.data.payer)}

                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {tx.data.payername || "UPI Payment"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  UTR: {tx.data.utr}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-green-600">
                                +{formatAmount(tx.data.amount)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(tx.data.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Transactions;
