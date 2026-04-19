"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

const DESKTOP_LAYOUT = {
  api: { x: 0.1, y: 0.25, label: "API" },
  email: { x: 0.1, y: 0.5, label: "EMAIL" },
  agents: { x: 0.1, y: 0.75, label: "AGENTS" },
  router: { x: 0.3, y: 0.5, label: "ROUTER", isRouter: true },
  ag1: { x: 0.6, y: 0.25, label: "RESEARCH" },
  ag2: { x: 0.6, y: 0.5, label: "STRATEGY" },
  ag3: { x: 0.6, y: 0.75, label: "FULFILLMENT" },
  output: { x: 0.9, y: 0.5, label: "OUTPUT" },
};

const MOBILE_LAYOUT = {
  api: { x: 0.2, y: 0.1, label: "API" },
  email: { x: 0.5, y: 0.1, label: "EMAIL" },
  agents: { x: 0.8, y: 0.1, label: "AGENTS" },
  router: { x: 0.5, y: 0.3, label: "ROUTER", isRouter: true },
  ag1: { x: 0.2, y: 0.55, label: "RESEARCH" },
  ag2: { x: 0.5, y: 0.55, label: "STRATEGY" },
  ag3: { x: 0.8, y: 0.55, label: "FULFILLMENT" },
  output: { x: 0.5, y: 0.85, label: "OUTPUT" },
};

const LINKS = [
  ["api", "router"],
  ["email", "router"],
  ["agents", "router"],
  ["router", "ag1"],
  ["router", "ag2"],
  ["router", "ag3"],
  ["ag1", "output"],
  ["ag2", "output"],
  ["ag3", "output"],
];

export default function Topology() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w: number, h: number;
    const clientMouse = { x: -1000, y: -1000 };
    const currentLayout = isMobile ? MOBILE_LAYOUT : DESKTOP_LAYOUT;

    const handleMouseMove = (e: MouseEvent) => {
      clientMouse.x = e.clientX;
      clientMouse.y = e.clientY;
    };

    const resize = () => {
      if (!canvas.parentElement) return;
      w = canvas.width = canvas.parentElement.offsetWidth;
      h = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", resize);
    resize();

    let flowOffset = 0;

    function drawBezier(
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      isActive: boolean,
      mx: number,
      my: number
    ) {
      if (!ctx) return;
      const x1 = p1.x * w;
      const y1 = p1.y * h;
      const x2 = p2.x * w;
      const y2 = p2.y * h;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const cp1 = { x: midX, y: y1 };
      const cp2 = { x: midX, y: y2 };

      let shiftX = 0,
        shiftY = 0;
      if (!isMobile) {
        const dist = Math.hypot(mx - midX, my - midY);
        const range = 200;
        if (dist < range) {
          const power = (1 - dist / range) * 50;
          const angle = Math.atan2(midY - my, midX - mx);
          shiftX = Math.cos(angle) * power;
          shiftY = Math.sin(angle) * power;
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(
          cp1.x + shiftX,
          cp1.y + shiftY,
          cp2.x + shiftX,
          cp2.y + shiftY,
          x2,
          y2
        );
      } else {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, x2, y2);
      }

      if (isActive) {
        ctx.strokeStyle = "#ccff00";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ccff00";
        ctx.setLineDash([5, 15]);
        ctx.lineDashOffset = -flowOffset;
      } else {
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.setLineDash([]);
      }
      ctx.stroke();
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      flowOffset += 1;
      const rect = canvas.getBoundingClientRect();
      const mx = clientMouse.x - rect.left;
      const my = clientMouse.y - rect.top;

      LINKS.forEach((l) => {
        const start = currentLayout[l[0] as keyof typeof currentLayout];
        const end = currentLayout[l[1] as keyof typeof currentLayout];
        drawBezier(start, end, false, mx, my);
        drawBezier(start, end, true, mx, my);
      });

      requestAnimationFrame(animate);
    };

    const animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [isMobile]);

  const currentLayout = isMobile ? MOBILE_LAYOUT : DESKTOP_LAYOUT;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: "-40%" },
    visible: { opacity: 1, scale: 1, y: "-50%", transition: { duration: 0.5 } },
  };

  return (
    <section className="panel results-panel theme-dark">
      <div className="topology-layout" ref={containerRef}>
        <motion.div
          className="topology-desc"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="td-header">THE BOTTLENECK</div>
          <h2 className="td-title">
            Shattering the <span className="td-highlight">Linear Queue.</span>
          </h2>
          <p className="td-body">
            Human workflows are fragile because one jam breaks the entire pipe.
            Nova replaces the single threaded bottleneck with an elastic Router
            Agent that orchestrates asymmetrical swarms to handle infinite
            volume simultaneously.
          </p>
        </motion.div>
        <div className="graph-container">
          <canvas id="topology-canvas" ref={canvasRef}></canvas>
          <motion.div
            className="graph-nodes"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <AnimatePresence>
              {Object.entries(currentLayout).map(([key, node]) => (
                <motion.div
                  key={`${key}-${isMobile}`}
                  className="node"
                  style={{
                    left: `${node.x * 100}%`,
                    top: `${node.y * 100}%`,
                    position: "absolute",
                    x: "-50%",
                    y: "-50%",
                    borderColor: (node as { isRouter?: boolean }).isRouter
                      ? "var(--accent-pop)"
                      : undefined,
                  }}
                  variants={itemVariants}
                  whileHover={{ scale: 1.1, zIndex: 10, borderColor: "#fff" }}
                >
                  {node.label}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
