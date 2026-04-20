"use client";

import { useEffect, useRef } from "react";
import { motion, Variants, useMotionValue, useSpring } from "framer-motion";
import MagneticButton from "./MagneticButton";
import Marquee from "./Marquee";

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX.set((e.clientX - cx) / cx * 15);
      mouseY.set((e.clientY - cy) / cy * 15);
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w: number, h: number;
    const waves = [
      { color: "rgba(26,26,26,0.5)", speed: 0.005, amplitude: 50, frequency: 0.01, offset: 0, yMod: 0 },
      { color: "#FFDD00", speed: 0.003, amplitude: 80, frequency: 0.005, offset: 100, yMod: 20 },
      { color: "rgba(255,221,0,0.3)", speed: 0.007, amplitude: 30, frequency: 0.015, offset: 50, yMod: -20 },
      { color: "rgba(26,26,26,0.12)", speed: 0.004, amplitude: 40, frequency: 0.008, offset: 200, yMod: -40 },
    ];

    let time = 0;
    const clientMouse = { x: -1000, y: -1000 };

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

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      time += 1;

      const rect = canvas.getBoundingClientRect();
      const relX = clientMouse.x - rect.left;
      const relY = clientMouse.y - rect.top;

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = wave.color;

        const points = [];
        const step = 30;

        for (let x = 0; x <= w + step; x += step) {
          const baseY = h / 2 + wave.yMod +
            Math.sin(x * wave.frequency + time * wave.speed + wave.offset) * wave.amplitude;
          const dx = x - relX;
          const dist = Math.sqrt(dx * dx + (h / 2 - relY) * (h / 2 - relY));
          let y = baseY;
          if (dist < 400) {
            const force = (1 - dist / 400) ** 2;
            y += Math.sin(dx * 0.05 + time * 0.1) * 60 * force;
            y += (relY - y) * 0.5 * force;
          }
          points.push({ x, y });
        }

        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.stroke();
      });

      requestAnimationFrame(animate);
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const letterVariants: Variants = {
    hidden: { y: 100, opacity: 0, rotateX: -80 },
    visible: (i: number) => ({
      y: 0, opacity: 1, rotateX: 0,
      transition: { duration: 0.8, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }
    }),
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.8, delay: 0.6 + i * 0.15, ease: [0.16, 1, 0.3, 1] }
    }),
  };

  const word1 = "Deploying";
  const word2 = "Autonomy";

  return (
    <section className="panel theme-light">
      <div className="hero-grid">
        <motion.div
          className="hero-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Decorative elements removed as requested */}

          <motion.div
            className="pill"
            custom={0}
            variants={fadeUp}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255, 221, 0, 0.15)",
              borderColor: "rgba(255, 221, 0, 0.5)",
            }}
          >
            System Architecture 001
          </motion.div>

          <h1 className="text-jumbo">
            <motion.div
              variants={letterVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              style={{ display: "inline-block", marginRight: "0.4em" }}
            >
              {word1}
            </motion.div>
            <motion.div
              variants={letterVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              style={{ display: "inline-block", color: "#b8b6af" }}
            >
              <span>{word2}</span>
            </motion.div>
          </h1>

          <motion.p className="text-body" style={{ marginTop: "2rem" }} custom={1} variants={fadeUp}>
            Godwin Austen Labs constructs the digital central nervous systems of
            the modern enterprise. We engineer agentic infrastructures that
            breathe life into your business logic, automating the complex
            interplay of Sales, Service, and Operations with surgical precision.
          </motion.p>

          <motion.div style={{ marginTop: "2.5rem" }} custom={2} variants={fadeUp} className="hero-cta">
            <MagneticButton href="https://contact.godwinausten.org" className="cta-button cta-button-filled">
              <span>Explore Our Systems</span>
              <span className="cta-arrow">→</span>
            </MagneticButton>
          </motion.div>

          {/* Animated stats strip */}
          <motion.div className="hero-stats" custom={3} variants={fadeUp}>
            <div className="hero-stat">
              <motion.span className="hero-stat-number"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ duration: 1, delay: 1.5 }}
              >14ms</motion.span>
              <span className="hero-stat-label">Avg Latency</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <motion.span className="hero-stat-number"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ duration: 1, delay: 1.7 }}
              >99.9%</motion.span>
              <span className="hero-stat-label">Uptime</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <motion.span className="hero-stat-number"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ duration: 1, delay: 1.9 }}
              >300+</motion.span>
              <span className="hero-stat-label">Edge Nodes</span>
            </div>
          </motion.div>
        </motion.div>
        <div className="hero-right">
          <canvas id="hero-canvas" ref={canvasRef}></canvas>
        </div>
      </div>
    </section>
  );
}
