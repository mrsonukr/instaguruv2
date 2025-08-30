import React from "react";
import COLOR_VARIANTS from "../../utils/colorVariants";

const PBanner = ({ imageSrc, altText, title, description, color = "red" }) => {
  const variant = COLOR_VARIANTS[color] || COLOR_VARIANTS.red;

  return (
    <div className={`${variant.cardBg} h-[120px] flex items-center px-6`}>
      <div className="flex-shrink-0 flex items-center">
        <img
          src={imageSrc}
          alt={altText}
          className="h-16 w-16 rounded-full object-cover"
        />
      </div>
      <div className="pl-6">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
};

export default PBanner;
