import React, { useMemo } from "react";

const DEFAULT_COUNT = 18;

const HoliBlast = ({ count = DEFAULT_COUNT, className = "" }) => {
  const particles = useMemo(() => {
    const palette = [
      "#ff1744",
      "#ffea00",
      "#00e5ff",
      "#76ff03",
      "#f500ff",
      "#ff9100",
      "#7c3aed",
      "#22c55e",
    ];

    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 1.8;
      const duration = 2.8 + Math.random() * 2.2;
      const size = 10 + Math.random() * 18;
      const drift = -20 + Math.random() * 40;
      const drift2 = -34 + Math.random() * 68;
      const spin = -70 + Math.random() * 140;
      const color = palette[i % palette.length];
      return { left, delay, duration, size, drift, drift2, spin, color };
    });
  }, [count]);

  return (
    <div className={`holi-blast ${className}`} aria-hidden="true">
      {particles.map((p, idx) => (
        <span
          key={idx}
          className="holi-balloon"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.2}px`,
            color: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            "--holi-drift": `${p.drift}px`,
            "--holi-drift2": `${p.drift2}px`,
            "--holi-spin": `${p.spin}deg`,
            "--holi-color": p.color,
          }}
        />
      ))}
    </div>
  );
};

export default HoliBlast;
