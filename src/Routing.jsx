import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ui/ScrollToTop";
import Home from "./pages/Home";
import Payme from "./pages/Payme";
import Getdata from "./pages/Getdata";

// Lazy load non-critical routes with better chunking
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

// Loading component for Suspense - Removed loading animation
const LoadingFallback = () => null;

// Preload critical routes on user interaction
const preloadCriticalRoutes = () => {
  // Preload Products page as it's commonly accessed
  const productsPromise = import("./pages/Products");
  const purchasePromise = import("./pages/Purchase");
  
  // Store promises for faster access
  window.__preloadedRoutes = {
    products: productsPromise,
    purchase: purchasePromise
  };
};

// Add preloading on user interaction
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', preloadCriticalRoutes, { once: true });
  window.addEventListener('touchstart', preloadCriticalRoutes, { once: true });
}

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
        </Routes>
      </Suspense>
    </Router>
  );
};

export default Routing;