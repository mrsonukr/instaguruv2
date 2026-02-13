import React, { useEffect, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { Heart } from "lucide-react";
import COLOR_VARIANTS from "../../utils/colorVariants";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import {
  translatePackTitle,
  translatePackDescription,
} from "../../utils/translationUtils";

const HEARTS_COUNT = 18;

const FloatingHearts = () => {
  return (
    <div className="valentine-hearts-overlay z-0">
      {Array.from({ length: HEARTS_COUNT }).map((_, index) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 3;
        const duration = 3 + Math.random() * 2;
        const size = 14 + Math.random() * 10;

        return (
          <Heart
            key={index}
            className="valentine-heart"
            color="#fecdd3"
            fill="#fecdd3"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              width: `${size}px`,
              height: `${size}px`,
              opacity: 0.6,
              filter: "blur(1px)",
            }}
          />
        );
      })}
    </div>
  );
};

const OFFER_DURATION_SECONDS = 30 * 60; // 30 minutes countdown

const formatTime = (totalSeconds) => {
  const seconds = Math.max(totalSeconds, 0);
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

const OFFER_TIMER_STORAGE_KEY = "instaguru_offer_timer_start";

const OfferTimerBadge = () => {
  const [timeLeft, setTimeLeft] = useState(OFFER_DURATION_SECONDS);

  useEffect(() => {
    const getOrInitStartTime = () => {
      try {
        const stored = localStorage.getItem(OFFER_TIMER_STORAGE_KEY);
        const now = Math.floor(Date.now() / 1000);

        if (stored) {
          const parsed = parseInt(stored, 10);
          if (!Number.isNaN(parsed)) {
            const elapsed = now - parsed;
            if (elapsed >= 0 && elapsed < OFFER_DURATION_SECONDS) {
              return parsed;
            }
          }
        }

        // Init new cycle
        localStorage.setItem(OFFER_TIMER_STORAGE_KEY, String(now));
        return now;
      } catch {
        // localStorage unavailable, fallback to now without persistence
        return Math.floor(Date.now() / 1000);
      }
    };

    let startTime = getOrInitStartTime();

    const updateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      let elapsed = now - startTime;

      if (elapsed >= OFFER_DURATION_SECONDS || elapsed < 0) {
        // start new 30-min cycle
        startTime = now;
        try {
          localStorage.setItem(OFFER_TIMER_STORAGE_KEY, String(startTime));
        } catch {
          // ignore storage errors
        }
        elapsed = 0;
      }

      const remaining = OFFER_DURATION_SECONDS - elapsed;
      setTimeLeft(remaining);
    };

    // Set initial value immediately
    updateTimeLeft();

    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute -top-2 left-3 z-20 bg-rose-600 text-white text-[10px] px-2 py-1 rounded-b-lg flex items-center gap-1">
      <span className="uppercase tracking-wide font-semibold">Ends in</span>
      <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
      <span className="uppercase tracking-wide font-semibold">Min</span>
    </div>
  );
};

const PackCard = ({
  color = "red",
  title,
  description,
  price,
  link,
  offer = false,
}) => {
  const { language } = useLanguage();
  const translatedTitle = translatePackTitle(title, language);
  const translatedDescription = translatePackDescription(description, language);
  const variant = COLOR_VARIANTS[color] || COLOR_VARIANTS.red;

  return (
    <Link
      to={link}
      className={`relative mt-4 w-full no-underline ${
        offer ? "animated-border" : ""
      }`}
    >
      {offer && <OfferTimerBadge />}
      <div
        className={`relative rounded-lg overflow-hidden ${
          offer ? "bg-pink-50" : ""
        }`}
      >
        {offer && <FloatingHearts />}
        {/* INNER CARD */}
        <div
          className={`relative z-10 flex items-center ${
            offer ? "bg-transparent" : variant.cardBg
          } rounded-lg p-4 w-full`}
        >
          <div className="flex flex-col flex-grow pr-4 min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 truncate">
              {translatedTitle}
            </h3>
            <p className="text-xs text-gray-600 mt-1 truncate">
              {translatedDescription}
            </p>
          </div>

          <div
            className={`flex-shrink-0 text-white text-sm px-4 py-2 rounded-full flex items-center gap-1
              ${variant.buttonBg} ${variant.buttonHover}`}
          >
            ₹{price}
            <ArrowRightIcon className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PackCard;
