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
    const hasOnlyAllowedAmounts = existingOrders.every(order => 
      allowedAmounts.includes(Number(order.amount))
    );

    // Check if any order is 40+ minutes old
    const now = new Date();
    const hasOldOrder = existingOrders.some(order => {
      const orderTime = new Date(order.createdAt || order.date);
      const minutesDiff = (now - orderTime) / (1000 * 60);
      return minutesDiff >= 40;
    });

    if (!hasOnlyAllowedAmounts || hasOldOrder) {
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