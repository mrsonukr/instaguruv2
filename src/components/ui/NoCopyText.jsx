import React from "react";

const NoCopyText = ({ children }) => {
  const handleCopy = (e) => {
    e.preventDefault();
    alert("Copying is disabled!");
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  return (
    <div
      onCopy={handleCopy}
      onContextMenu={handleContextMenu}
      className="select-none"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
    >
      {children}
    </div>
  );
};

export default NoCopyText;
