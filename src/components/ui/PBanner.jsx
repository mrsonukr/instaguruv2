import React from "react";

const STAR_POSITIONS = [
  { top: "15%", left: "8%", size: 10, opacity: 0.6 },
  { top: "60%", left: "15%", size: 6, opacity: 0.4 },
  { top: "25%", left: "78%", size: 8, opacity: 0.5 },
  { top: "70%", left: "88%", size: 5, opacity: 0.35 },
  { top: "10%", left: "50%", size: 7, opacity: 0.45 },
  { top: "80%", left: "55%", size: 6, opacity: 0.4 },
  { top: "40%", left: "92%", size: 9, opacity: 0.5 },
  { top: "55%", left: "3%", size: 7, opacity: 0.4 },
];

const STAR_COLORS = {
  pink:   "#db2777",
  red:    "#dc2626",
  blue:   "#2563eb",
  green:  "#16a34a",
  sky:    "#0ea5e9",
  yellow: "#ca8a04",
};

const TEXT_COLORS = {
  pink:   { title: "#831843", desc: "#9d174d", badge: "#fce7f3", badgeText: "#9d174d" },
  red:    { title: "#7f1d1d", desc: "#991b1b", badge: "#fee2e2", badgeText: "#991b1b" },
  blue:   { title: "#1e3a8a", desc: "#1d4ed8", badge: "#dbeafe", badgeText: "#1d4ed8" },
  green:  { title: "#14532d", desc: "#166534", badge: "#dcfce7", badgeText: "#166534" },
  sky:    { title: "#0c4a6e", desc: "#0369a1", badge: "#e0f2fe", badgeText: "#0369a1" },
  yellow: { title: "#713f12", desc: "#92400e", badge: "#fef9c3", badgeText: "#92400e" },
};

const StarIcon = ({ size, opacity, style, starColor }) => (
  <svg
    viewBox="0 0 24 24"
    fill={starColor}
    style={{ width: size, height: size, opacity, position: "absolute", ...style }}
  >
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const COLOR_GRADIENTS = {
  pink:  "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)",
  red:   "linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%)",
  blue:  "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)",
  green: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 50%, #86efac 100%)",
  sky:   "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)",
  yellow:"linear-gradient(135deg, #fef9c3 0%, #fef08a 50%, #fde047 100%)",
};

const PBanner = ({ imageSrc, altText, title, description, color = "red" }) => {
  const gradient = COLOR_GRADIENTS[color] || COLOR_GRADIENTS.red;
  const starColor = STAR_COLORS[color] || STAR_COLORS.red;
  const tc = TEXT_COLORS[color] || TEXT_COLORS.red;

  return (
    <div
      className="relative overflow-hidden flex items-center px-5 py-5"
      style={{
        background: gradient,
        minHeight: "130px",
      }}
    >
      {/* Decorative stars */}
      {STAR_POSITIONS.map((s, i) => (
        <StarIcon key={i} size={s.size} opacity={s.opacity} style={{ top: s.top, left: s.left }} starColor={starColor} />
      ))}

      {/* Crescent moon */}
      <svg
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          top: "8px",
          right: "16px",
          width: 36,
          height: 36,
          opacity: 0.3,
          fill: starColor,
        }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>

      {/* Subtle arc overlay */}
      <div
        className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />
      <div
        className="absolute -top-8 -left-8 w-40 h-40 rounded-full"
        style={{ background: "rgba(255,255,255,0.03)" }}
      />

      {/* Logo */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className="rounded-2xl p-2 flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)" }}
        >
          <img
            src={imageSrc}
            alt={altText}
            className="h-14 w-14 rounded-xl object-cover"
          />
        </div>
      </div>

      {/* Text */}
      <div className="relative z-10 pl-4 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: tc.badge, color: tc.badgeText }}
          >
            Ramadan Special
          </span>
        </div>
        <h2 className="text-lg font-bold leading-tight truncate" style={{ color: tc.title }}>{title}</h2>
        <p className="text-xs mt-0.5 truncate" style={{ color: tc.desc }}>{description}</p>
      </div>
    </div>
  );
};

export default PBanner;
