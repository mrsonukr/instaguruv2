import React, { useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { LazyLoadImage } from "react-lazy-load-image-component";
import COLOR_VARIANTS from "../../utils/colorVariants";
import Skeleton from "./Skeleton";

const Suggestion = ({ logo, name, color = "red" }) => {
  const [imgError, setImgError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardBg = COLOR_VARIANTS[color]?.cardBg || COLOR_VARIANTS.red.cardBg;

  return (
    <div
      className={`w-28 h-24 ${cardBg} border border-gray-200 rounded flex flex-col items-center justify-center text-center p-2 shrink-0`}
    >
      <div className="relative w-10 h-10">
        {!imageLoaded && !imgError && (
          <Skeleton className="absolute inset-0 rounded-full" />
        )}
        {imgError || !logo ? (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <PhotoIcon className="w-6 h-6 text-gray-400" />
          </div>
        ) : (
          <LazyLoadImage
            src={logo}
            alt={name}
            onError={() => setImgError(true)}
            afterLoad={() => setImageLoaded(true)}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
      </div>
      <span className="text-xs font-medium text-gray-700 mt-1 truncate">
        {name}
      </span>
    </div>
  );
};

export default Suggestion;