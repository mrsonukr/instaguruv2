import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import siteConfig from "../config/siteConfig";

const AutoSlider = () => {
  const navigate = useNavigate();

  const handleBannerClick = (bannerId) => {
    switch (bannerId) {
      case 2:
        navigate("/purchase/11004");
        break;
      case 3:
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const paymentToken = btoa(`100-${timestamp}-${randomStr}`);
        
        const transaction = {
          id: `banner_payment_${Date.now()}`,
          type: "payment_initiated",
          amount: 100,
          date: new Date().toISOString(),
          description: "Payment from Banner - ₹100",
          status: "initiated",
          paymentToken: paymentToken
        };

        const existingTransactions = JSON.parse(localStorage.getItem("paymentTransactions") || "[]");
        existingTransactions.push(transaction);
        localStorage.setItem("paymentTransactions", JSON.stringify(existingTransactions));
        
        navigate(`/payment/${paymentToken}`);
        break;
      case 4:
        window.open("https://wa.me/917470729419?text=Hello%20SmmGuru", "_blank");
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full max-w-[calc(100vw-2rem)] mx-auto mt-6">
      <Swiper
        spaceBetween={20}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        modules={[Pagination, Autoplay]}
        className="rounded-xl overflow-hidden"
      >
        {siteConfig.banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div 
              className="relative w-full aspect-[2000/734] cursor-pointer bg-gray-100 rounded-xl"
              onClick={() => handleBannerClick(banner.id)}
            >
              <img
                src={banner.src}
                alt={banner.alt}
                width={banner.width}
                height={banner.height}
                className="w-full h-full object-cover rounded-xl"
                loading={banner.id === 1 ? "eager" : "lazy"}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default AutoSlider;