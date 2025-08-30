import React from "react";

const SectionLabel = ({ text, icon }) => {
  return (
    <div className="bg-gray-100 flex gap-2 text-gray-500 font-semibold text-xs -mx-5 px-5 py-2 items-center">
      <span>{text}</span>
      {icon && (
        <img className="w-8" src={icon} alt={text} />
      )}
    </div>
  );
};

export default SectionLabel;