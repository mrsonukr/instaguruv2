import React from 'react';

const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ minHeight: "inherit" }}
      {...props}
    />
  );
};

export default Skeleton;