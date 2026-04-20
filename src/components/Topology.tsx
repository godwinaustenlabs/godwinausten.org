"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import MagneticButton from "./MagneticButton";

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
  ["api", "router"], ["email", "router"], ["agents", "router"],
  ["router", "ag1"], ["router", "ag2"], ["router", "ag3"],
  ["ag1", "output"], ["ag2", "output"], ["ag3", "output"],
];

export default function Topology() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
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
      clientMouse.x = e.clientX; clientMouse.y = e.clientY;
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

    function drawBezier(p1: { x: number; y: number }, p2: { x: number; y: number }, isActive: boolean, mx: number, my: number) {
      if (!ctx) return;
      const x1 = p1.x * w, y1 = p1.y * h, x2 = p2.x * w, y2 = p2.y * h;
      const cp1 = { x: (x1 + x2) / 2, y: y1 };
      const cp2 = { x: (x1 + x2) / 2, y: y2 };

      let shiftX = 0, shiftY = 0;
      if (!isMobile) {
        const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
        const dist = Math.hypot(mx - midX, my - midY);
        if (dist < 200) {
          const power = (1 - dist / 200) * 50;
          const angle = Math.atan2(midY - my, midX - mx);
          shiftX = Math.cos(angle) * power; shiftY = Math.sin(angle) * power;
        }
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cp1.x + shiftX, cp1.y + shiftY, cp2.x + shiftX, cp2.y + shiftY, x2, y2);

      if (isActive) {
        ctx.strokeStyle = "#FFDD00";
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(255, 221, 0, 0.5)";
        ctx.setLineDash([5, 15]);
        ctx.lineDashOffset = -flowOffset;
      } else {
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
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
      const mx = clientMouse.x - rect.left, my = clientMouse.y - rect.top;

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
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, type: "spring" } },
  };

  return (
    <section className="panel results-panel theme-light">
      <div className="topology-layout" ref={containerRef}>
        <motion.div
          className="topology-desc"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="td-header">THE BOTTLENECK</div>
          <h2 className="td-title">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Shattering the{" "}
            </motion.span>
            <motion.span
              className="td-highlight"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
            >
              Linear Queue.
            </motion.span>
          </h2>
          <motion.p
            className="td-body"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Human workflows are fragile because one jam breaks the entire pipe.
            Nova replaces the single threaded bottleneck with an elastic Router
            Agent that orchestrates asymmetrical swarms to handle infinite
            volume simultaneously.
          </motion.p>

          {/* Flow stats */}
          <motion.div
            className="topo-stats"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="topo-stat">
              <span className="topo-stat-value">∞</span>
              <span className="topo-stat-label">Concurrent Threads</span>
            </div>
            <div className="topo-stat">
              <span className="topo-stat-value">&lt;50ms</span>
              <span className="topo-stat-label">Routing Time</span>
            </div>
          </motion.div>

          <motion.div
            style={{ marginTop: "2rem" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="topo-cta"
          >
            <MagneticButton href="https://contact.godwinausten.org" className="cta-button">
              <span>See it in Action</span>
              <span className="cta-arrow">→</span>
            </MagneticButton>
          </motion.div>
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
                    x: "-50%", y: "-50%",
                    borderColor: (node as { isRouter?: boolean }).isRouter ? "var(--accent-pop)" : undefined,
                  }}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.15, zIndex: 10, borderColor: "#1A1A1A",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  {/* Ping animation for router */}
                  {(node as { isRouter?: boolean }).isRouter && (
                    <motion.div
                      className="node-ping"
                      animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
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
