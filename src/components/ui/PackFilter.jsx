import React, { useState } from "react";
import COLOR_VARIANTS from "../../utils/colorVariants";
import { useTranslation } from "react-i18next";

const PackFilter = ({ packFilters, onFilterChange, variant = "blue",  }) => {
  const { t } = useTranslation();
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
              {filter === "All" ? t('all') : t(`filters.${filter}`, filter)}
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