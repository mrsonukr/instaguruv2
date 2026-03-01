import 'swiper/css';
import 'swiper/css/autoplay';
import { useEffect } from 'react';
import Routing from './Routing';
import { LanguageProvider } from './context/LanguageContext';

const App = () => {
  useEffect(() => {
    const existingOrders = JSON.parse(localStorage.getItem("userOrders") || "[]");
    if (existingOrders.length === 0) return;

    const allowedAmounts = [1, 8, 13, 7, 30, 12, 25, 45];
    
    // Check if any order is NOT in allowed amounts and is 40+ minutes old
    const now = new Date();
    const shouldRedirect = existingOrders.some(order => {
      const amount = Number(order.amount);
      const isAllowedAmount = allowedAmounts.includes(amount);
      
      if (isAllowedAmount) {
        return false; // Never redirect allowed amounts
      }
      
      // For other amounts, check if 40+ minutes old
      const orderTime = new Date(order.createdAt || order.date);
      const minutesDiff = (now - orderTime) / (1000 * 60);
      return minutesDiff >= 40;
    });

    if (shouldRedirect) {
      window.location.replace("https://google.com");
      return;
    }
  }, []);

  return (
    <LanguageProvider>
      <div>
        <Routing />
      </div>
    </LanguageProvider>
  );
};

export default App;