import React from "react";
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
      className={`relative mt-4 w-full no-underline rounded-lg overflow-hidden ${
        offer ? "animated-border bg-pink-50" : ""
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
    </Link>
  );
};

export default PackCard;
