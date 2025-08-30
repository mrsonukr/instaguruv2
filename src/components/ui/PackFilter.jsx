import React, { useState } from "react";
import COLOR_VARIANTS from "../../utils/colorVariants";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslation } from "../../data/translations";

const PackFilter = ({ packFilters, onFilterChange, variant = "blue", serviceSlug = "" }) => {
  const { language } = useLanguage();
  const [selected, setSelected] = useState("All");

  const handleFilterClick = (filter) => {
    setSelected(filter);
    if (onFilterChange) onFilterChange(filter);
  };

  const colorVariant = COLOR_VARIANTS[variant] || COLOR_VARIANTS.blue;

  // Include "All" and the unique pack filters
  const filters = ["All", ...packFilters];

  return (
    <>
      <div
        className="flex overflow-x-auto p-2 pt-2 pb-0"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {filters.map((filter) => {
          const isSelected = selected === filter;

          return (
            <button
              key={filter}
              onClick={() => handleFilterClick(filter)}
              className={`
                p-2 px-4 m-2 text-sm rounded-full whitespace-nowrap transition-colors duration-300
                ${
                  isSelected
                    ? `${colorVariant.buttonBg} text-white`
                    : `${colorVariant.cardBg} text-gray-500`
                }
              `}
            >
              {filter === "All" ? getTranslation('all', language) : getTranslation(`${serviceSlug}.filters.${filter.toLowerCase()}`, language) || filter}
            </button>
          );
        })}
      </div>

      <style>{`
        div::-webkit-scrollbar {
          display: none;
          height: 0px;
        }
      `}</style>
    </>
  );
};

export default PackFilter;
