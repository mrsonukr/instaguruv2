import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ui/ScrollToTop";
import Home from "./pages/Home";
import Payme from "./pages/Payme";
import Getdata from "./pages/Getdata";

// Lazy load components
const About = lazy(() => import("./pages/About"));
const Purchase = lazy(() => import("./pages/Purchase"));
const Contact = lazy(() => import("./pages/Contact"));
const Products = lazy(() => import("./pages/Products"));
const ReferPage = lazy(() => import("./pages/Refer"));
const Redirecting = lazy(() => import("./pages/Redirecting"));
const Orders = lazy(() => import("./pages/Orders"));
const GenerateLink = lazy(() => import("./pages/GenerateLink"));
const ProcessLink = lazy(() => import("./pages/ProcessLink"));
const Refund = lazy(() => import("./pages/Refund"));
const HowToPurchase = lazy(() => import("./pages/HowToPurchase"));
const Transactions = lazy(() => import("./pages/Transactions"));
const GetOrders = lazy(() => import("./pages/GetOrders")); // ✅ NEW

// Simple loading fallback
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
  </div>
);

const Routing = () => {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/getdata" element={<Getdata />} />
          <Route path="/" element={<Home />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/refer" element={<ReferPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/purchase/:id" element={<Purchase />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/:slug" element={<Products />} />
          <Route path="/payment/:token" element={<Payme />} />
          <Route path="/refer/:referralId" element={<ReferPage />} />
          <Route path="/redirecting" element={<Redirecting />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/generate-link" element={<GenerateLink />} />
          <Route path="/add-funds/:token" element={<ProcessLink />} />
          <Route path="/how-to-purchase" element={<HowToPurchase />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/getorders" element={<GetOrders />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default Routing;
