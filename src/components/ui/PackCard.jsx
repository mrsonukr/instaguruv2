import React from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { ShoppingBag } from "lucide-react";
import COLOR_VARIANTS from "../../utils/colorVariants";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { translatePackTitle, translatePackDescription } from "../../utils/translationUtils";

const PackCard = ({ color = "red", title, description, price, link, packId }) => {
  const { language } = useLanguage();
  const translatedTitle = translatePackTitle(title, language);
  const translatedDescription = translatePackDescription(description, language);
  const variant = COLOR_VARIANTS[color] || COLOR_VARIANTS.red;

  return (
    <Link
      to={link}
      className={`flex items-center ${variant.cardBg} mt-4 rounded-lg p-4 w-full transition no-underline`}
    >
      <div className="flex flex-col flex-grow pr-4 min-w-0">
        <h3 className="text-sm font-semibold text-gray-800 truncate">
          {translatedTitle}
        </h3>
        <p className="text-xs text-gray-600 mt-1 truncate">{translatedDescription}</p>
      </div>

      <div
        className={`flex-shrink-0 text-white text-sm px-4 py-2 rounded-full flex items-center gap-1 ${variant.buttonBg} ${variant.buttonHover}`}
      >
        <div>
          {/* <span className="line-through mr-1">₹{price*2}</span> */}
          ₹{price}

        </div>
        <ArrowRightIcon className="w-4 h-4" />
      </div>
    </Link>
  );
};

export default PackCard;