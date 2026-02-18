import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ui/ScrollToTop";
import { Loader2 } from "lucide-react";

const Home = lazy(() => import("./pages/Home"));

const About = lazy(() => import("./pages/About"));
const Purchase = lazy(() => import("./pages/Purchase"));
const Contact = lazy(() => import("./pages/Contact"));
const Products = lazy(() => import("./pages/Products"));
const ReferPage = lazy(() => import("./pages/Refer"));
const Orders = lazy(() => import("./pages/Orders"));
const GetOrders = lazy(() => import("./pages/GetOrders"));

// Simple loading fallback
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-green-500" />
  </div>
);

const Routing = () => {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/refer" element={<ReferPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/purchase/:id" element={<Purchase />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/:slug" element={<Products />} />
          <Route path="/refer/:referralId" element={<ReferPage />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/getorders" element={<GetOrders />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default Routing;
