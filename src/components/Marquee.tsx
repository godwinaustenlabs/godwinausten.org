"use client";

// Optimized with native CSS animations for GPU acceleration

interface MarqueeProps {
  texts: string[];
  speed?: number;
  direction?: "left" | "right";
  separator?: string;
  className?: string;
}

export default function Marquee({
  texts,
  speed = 30,
  direction = "left",
  separator = "✦",
  className = "",
}: MarqueeProps) {
  const items = [...texts, ...texts, ...texts, ...texts]; // 4x repeat for seamless loop

  return (
    <div 
      className={`marquee-track ${className}`} 
      style={{ overflow: "hidden", whiteSpace: "nowrap" as const }}
    >
      <div
        className="marquee-inner"
        style={{ 
          display: "inline-flex", 
          gap: "0", 
          willChange: "transform",
          animationName: direction === "left" ? "marquee-left" : "marquee-right",
          animationDuration: `${speed}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite"
        }}
      >
        {items.map((text, j) => (
          <span key={j} className="marquee-item">
            <span className="marquee-text">{text}</span>
            <span className="marquee-sep">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
