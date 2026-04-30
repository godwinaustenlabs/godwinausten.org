"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, Variants, useInView } from "framer-motion";
import MagneticButton from "./MagneticButton";
import Marquee from "./Marquee";

interface NeuralStreamProps {
  scrollTween?: gsap.core.Tween;
}

export default function NeuralStream({ scrollTween }: NeuralStreamProps) {
  const container = useRef<HTMLDivElement>(null);
  const cableRef = useRef<SVGPathElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);

  const isInView = useInView(container);
  const isInViewRef = useRef(isInView);
  useEffect(() => {
    isInViewRef.current = isInView;
  }, [isInView]);

  // Particle background for dark section
  useEffect(() => {
    // Skip entire particle system on mobile — O(n²) distance checks are too heavy
    const isMobileDevice = window.innerWidth <= 768;
    if (isMobileDevice) return;

    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const animate = () => {
      if (!isInViewRef.current) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(26, 26, 26, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(26, 26, 26, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    };
    const animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  useGSAP(
    () => {
      const isMobile = window.innerWidth <= 768;
      const items = gsap.utils.toArray<HTMLElement>(".stream-item");
      if (cableRef.current) {
        gsap.fromTo(cableRef.current,
          { strokeDashoffset: 1000, strokeDasharray: 1000 },
          { strokeDashoffset: 0, ease: "none", scrollTrigger: {
            trigger: container.current, 
            containerAnimation: isMobile ? undefined : scrollTween,
            start: isMobile ? "top center" : "left center", 
            end: isMobile ? "bottom center" : "right center", 
            scrub: 1,
          }}
        );
      }

      items.forEach((node) => {
        gsap.to(node, {
          scrollTrigger: {
            trigger: node, 
            containerAnimation: isMobile ? undefined : scrollTween, 
            start: isMobile ? "top center" : "left center",
            toggleClass: { targets: node, className: "active-stream" },
            onEnter: () => {
              gsap.fromTo(node, { opacity: 0, x: isMobile ? 0 : -20, y: isMobile ? 20 : 0 }, { opacity: 1, x: 0, y: 0, duration: 0.3, clearProps: "all" });
            },
          },
        });
      });
    },
    { scope: container, dependencies: [scrollTween] }
  );

  const nodeData = [
    { id: "01", layer: "LAYER_01", title: "Simple Chatbots", metric: "● LISTENING", metricBlink: true, desc: "Tactical agents for handling direct inquiries and basic support. The first entry point of automation.", progress: 25 },
    { id: "02", layer: "LAYER_02", title: "Voice AI Agents", metric: "MATCH: 98.4%", metricBlink: false, desc: "Autonomous calling and qualification. Handling objections with human-like nuance.", progress: 50 },
    { id: "03", layer: "LAYER_03", title: "Agentic Systems", metric: "● ACTIVE", metricBlink: true, desc: "Full-fledged AI swarms that navigate entire business processes autonomously.", progress: 75, highlight: true },
    { id: "04", layer: "TOTALITY", title: "Full Autonomy", metric: "COMPLETE", metricBlink: false, desc: "Seamless intelligence loop. Meeting secured, CRM updated, growth unlocked.", progress: 100 },
  ];

  return (
    <section className="panel system-stream-panel theme-accent" id="sysPanel" ref={container}>
      {/* Particle background */}
      <canvas
        ref={particleCanvasRef}
        style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.6 }}
      />

      {/* Top marquee */}
      <div style={{ position: "absolute", top: "2rem", left: 0, width: "100%", zIndex: 2 }}>
        <Marquee
          texts={["NEURAL ARCHITECTURE", "LOGIC CHAINS", "INTELLIGENCE ROUTING", "ADAPTIVE EXECUTION", "DYNAMIC SYNTHESIS"]}
          speed={25}
          direction="right"
          separator="✦"
          className="stream-marquee"
        />
      </div>

      <div className="stream-container" style={{ zIndex: 2, position: "relative" }}>

        <div className="stream-header-mobile">
          <h2 className="text-xl">Logic Chain</h2>
        </div>

        <div className="stream-track-layer">
          <svg className="stream-svg" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <path className="cable-bg" d="M0,100 L1000,100" />
            <path className="cable-active" id="streamCable" ref={cableRef} d="M0,100 L1000,100" />
          </svg>
        </div>

        <div className="stream-flex">
          {nodeData.map((node) => (
            <motion.div
              key={node.id}
              className="hud-node stream-item"
              style={node.highlight ? { borderColor: "var(--accent-pop)" } : {}}
              whileHover={{
                scale: 1.08,
                boxShadow: "0 0 40px rgba(255, 221, 0, 0.2)",
                borderColor: "var(--accent-pop)",
                transition: { duration: 0.3 }
              }}
            >
              <motion.div
                className="hud-scanner"
                animate={{ opacity: [0.5, 1, 0.5], scaleX: [0.95, 1.05, 0.95] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="hud-content">
                <div className="hud-id" style={node.highlight ? { color: "var(--accent-pop)" } : {}}>
                  {node.id} // {node.layer}
                </div>
                <div className="hud-title">{node.title}</div>
                <div className="hud-metric">
                  {node.metricBlink && <span className="blink">●</span>}
                  {node.metric.replace("● ", "")}
                </div>
                <div className="hud-desc" style={{ fontSize: "0.85rem", color: "var(--text-color)", opacity: 0.6, marginTop: "10px" }}>
                  {node.desc}
                </div>
                {/* Progress bar */}
                <div className="hud-progress">
                  <motion.div
                    className="hud-progress-fill"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: node.progress / 100 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Section CTA */}
        <motion.div
          className="stream-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <MagneticButton href="https://contact.godwinausten.org" className="cta-button cta-button-filled">
            <span>Deploy Your System</span>
            <span className="cta-arrow">→</span>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Bottom marquee */}
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", zIndex: 2 }}>
        <Marquee
          texts={["CHATBOTS", "VOICE AI", "AGENT SWARMS", "FULL AUTONOMY", "24/7 OPERATION", "ZERO DOWNTIME"]}
          speed={30}
          separator="—"
          className="stream-marquee"
        />
      </div>
    </section>
  );
}
