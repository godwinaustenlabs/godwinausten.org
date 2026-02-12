"use client";

export default function Background() {
  return (
    <>
      <div className="grain-overlay"></div>
      <div className="neon-flow">
        <div className="flow-shape flow1"></div>
        <div className="flow-shape flow2"></div>
        <div className="flow-shape flow3"></div>
      </div>
      <div className="gridlines"></div>
      
      {/* Custom Cursor */}
      <div className="cursor-dot"></div>
      <div className="cursor-outline"></div>
    </>
  );
}
