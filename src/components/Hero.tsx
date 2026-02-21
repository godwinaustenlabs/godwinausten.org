"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w: number, h: number;
    const waves = [
      {
        color: "#e0e0e0",
        speed: 0.005,
        amplitude: 50,
        frequency: 0.01,
        offset: 0,
        yMod: 0,
      },
      {
        color: "#ccff00",
        speed: 0.003,
        amplitude: 80,
        frequency: 0.005,
        offset: 100,
        yMod: 20,
      },
      {
        color: "rgba(204, 255, 0, 0.3)",
        speed: 0.007,
        amplitude: 30,
        frequency: 0.015,
        offset: 50,
        yMod: -20,
      },
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
      ctx.globalCompositeOperation = "lighter";
      time += 1;

      const rect = canvas.getBoundingClientRect();
      const relX = clientMouse.x - rect.left;
      const relY = clientMouse.y - rect.top;

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 5;
        ctx.shadowColor = wave.color;

        const points = [];
        const step = 40; // Sample every 40px for Bezier interpolation

        for (let x = 0; x <= w + step; x += step) {
          const baseY = h / 2 + wave.yMod + Math.sin(x * wave.frequency + time * wave.speed + wave.offset) * wave.amplitude;

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

  return (
    <section className="panel theme-dark">
      <div className="hero-grid">
        <div className="hero-left">
          <div className="pill">System Architecture</div>
          <h1 className="text-jumbo">
            Deploying<br />
            <span className="text-gradient">Autonomy.</span>
          </h1>
          <p className="text-body" style={{ marginTop: "2rem" }}>
            Godwin Austen Labs constructs the digital central nervous systems of
            the modern enterprise. We engineer agentic infrastructures that
            breathe life into your business logic, automating the complex
            interplay of Sales, Service, and Operations with surgical precision.
          </p>
        </div>
        <div className="hero-right">
          <canvas id="hero-canvas" ref={canvasRef}></canvas>
        </div>
      </div>
    </section>
  );
}
