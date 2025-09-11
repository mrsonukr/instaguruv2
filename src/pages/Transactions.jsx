import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/ui/Footer";
import { updatePageSEO } from "../utils/seoUtils";
import { useLanguage } from "../context/LanguageContext";
import { getTranslation } from "../data/translations";

const Transactions = () => {
  const { language } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    updatePageSEO("transactions");
    // Check if user was previously authenticated
    const savedAuth = localStorage.getItem('transactions_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === '8080') {
      setIsAuthenticated(true);
      setPasswordError('');
      // Save authentication state to localStorage
      localStorage.setItem('transactions_authenticated', 'true');
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://faizul.mssonukr.workers.dev/api/getmain?limit=1000');
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      
      if (data.success && data.webhooks) {
        // Filter out non-transaction entries (like claim entries) and mssonukr@axl VPA
        const validTransactions = data.webhooks.filter(webhook => 
          webhook.data && 
          typeof webhook.data === 'object' && 
          webhook.data.id && 
          webhook.data.amount &&
          webhook.data.vpa && 
          !webhook.data.vpa.toLowerCase().includes('mssonukr')
        );
        
        // Sort transactions by created_at timestamp (latest first)
        const sortedTransactions = validTransactions.sort((a, b) => 
          b.data.created_at - a.data.created_at
        );
        
        setTransactions(sortedTransactions);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  const formatDate = (timestamp) => {
    const transactionDate = new Date(timestamp * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time to compare only dates
    const transactionDateOnly = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    
    const timeString = transactionDate.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    if (transactionDateOnly.getTime() === todayOnly.getTime()) {
      return `today, ${timeString}`;
    } else if (transactionDateOnly.getTime() === yesterdayOnly.getTime()) {
      return `yesterday, ${timeString}`;
    } else {
      return transactionDate.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const getDateCategory = (timestamp) => {
    const transactionDate = new Date(timestamp * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time to compare only dates
    const transactionDateOnly = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    
    if (transactionDateOnly.getTime() === todayOnly.getTime()) {
      return 'today';
    } else if (transactionDateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'yesterday';
    } else {
      return transactionDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const groupTransactionsByDate = (transactions) => {
    const grouped = {};
    transactions.forEach(transaction => {
      const category = getDateCategory(transaction.data.created_at);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(transaction);
    });
    return grouped;
  };

  const getDateTotalAmount = (dateTransactions) => {
    return dateTransactions.reduce((sum, transaction) => sum + transaction.data.amount, 0);
  };

  const getPaymentMethodIcon = (method) => {
    return (
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <img 
          src="/ic/upi.svg" 
          alt="UPI" 
          className="w-5 h-5"
        />
      </div>
    );
  };

  const getStatusColor = (amount) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBg = (amount) => {
    return amount > 0 ? 'bg-green-50' : 'bg-red-50';
  };

  // Password protection screen
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
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  {getTranslation('transactions', language)}
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Enter password to view transactions
                </p>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter password"
                    required
                  />
                  {passwordError && (
                    <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 md:py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
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
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">{getTranslation('loadingTransactions', language)}</p>
            </div>
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
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-red-800 mb-2">{getTranslation('errorLoadingTransactions', language)}</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={fetchTransactions}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {getTranslation('tryAgain', language)}
                </button>
              </div>
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
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getTranslation('transactions', language) || 'Transactions'}
            </h1>
            <p className="text-gray-600">
              {getTranslation('viewAllTransactions', language) || 'View all your payment transactions'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 md:gap-6 mb-8">
            <div className="bg-white rounded-lg border p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start">
                <div className="p-1 md:p-2 bg-green-100 rounded-lg mb-2 md:mb-0">
                  <svg className="w-4 h-4 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-0 md:ml-4 text-center md:text-left">
                  <p className="text-xs md:text-sm font-medium text-gray-600">{getTranslation('totalTransactions', language)}</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{transactions.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start">
                <div className="p-1 md:p-2 bg-blue-100 rounded-lg mb-2 md:mb-0">
                  <svg className="w-4 h-4 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-0 md:ml-4 text-center md:text-left">
                  <p className="text-xs md:text-sm font-medium text-gray-600">{getTranslation('totalAmount', language)}</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {formatAmount(transactions.reduce((sum, tx) => sum + tx.data.amount, 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start">
                <div className="p-1 md:p-2 bg-purple-100 rounded-lg mb-2 md:mb-0">
                  <svg className="w-4 h-4 md:w-6 md:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-0 md:ml-4 text-center md:text-left">
                  <p className="text-xs md:text-sm font-medium text-gray-600">{getTranslation('averageAmount', language)}</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {transactions.length > 0 ? formatAmount(transactions.reduce((sum, tx) => sum + tx.data.amount, 0) / transactions.length) : '₹0'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-lg border border border-white">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {getTranslation('recentTransactions', language) || 'Recent Transactions'}
              </h2>
            </div>
            
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{getTranslation('noTransactionsFound', language)}</h3>
                <p className="text-gray-600">{getTranslation('noTransactionsMessage', language)}</p>
              </div>
            ) : (
              <div>
                {Object.entries(groupTransactionsByDate(transactions)).map(([dateCategory, dateTransactions]) => (
                  <div key={dateCategory}>
                    {/* Date Header */}
                    <div className="px-6 py-3 bg-white border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        {dateCategory} - <span className="bg-gray-100 rounded-lg px-2 py-1 text-gray-900">{formatAmount(getDateTotalAmount(dateTransactions))} ({dateTransactions.length})</span>
                      </h3>
                    </div>
                    
                    {/* Transactions for this date */}
                    <div className="divide-y divide-gray-200">
                      {dateTransactions.map((transaction, index) => (
                        <div key={transaction.id || index} className="py-4 ">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getPaymentMethodIcon(transaction.data.method)}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {transaction.data.vpa || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {transaction.data.rrn || 'N/A'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className={`text-lg font-semibold ${getStatusColor(transaction.data.amount)}`}>
                                {formatAmount(transaction.data.amount)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(transaction.data.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Button */}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Transactions;
