import React, { useEffect } from "react";
import PgHeader from "../components/pgparts/PgHeader";
import PgQrCard from "../components/pgparts/PgQrCard";
import PgFooter from "../components/pgparts/PgFooter";

const PgPage = () => {
  useEffect(() => {
    let meta = document.querySelector('meta[name="theme-color"]');
    const prevColor = meta?.getAttribute("content") || "#ffffff";

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", "#5F259F");

    return () => {
      if (meta) {
        meta.setAttribute("content", prevColor);
      }
    };
  }, []);

  return (
    <div>
      {/* Fixed header at top */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <div className="max-w-md mx-auto">
          <PgHeader />
        </div>
      </div>

      {/* Content under header */}
      <div className="pt-28 pb-6 px-4 flex justify-center">
        <div className="w-full max-w-md flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-4 overflow-y-auto">
            <PgQrCard />
          </div>
          <PgFooter />
        </div>
      </div>
    </div>
  );
};

export default PgPage;
