"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, Variants } from "framer-motion";

interface EcosystemProps {
  scrollTween?: gsap.core.Tween;
}

export default function Ecosystem({ scrollTween }: EcosystemProps) {
  const container = useRef<HTMLDivElement>(null);
  const ecoSticky = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const isMobile = window.innerWidth < 1024;

      // Sticky Move Logic (Desktop only)
      if (scrollTween && !isMobile) {
        gsap.to(ecoSticky.current, {
          x: () => window.innerWidth * 4,
          ease: "none",
          scrollTrigger: {
            trigger: container.current,
            containerAnimation: scrollTween,
            start: "left left",
            end: "right right",
            scrub: true,
          },
        });
      }

      // --- Vector Lattice Logic (Minimal & Unique) ---
      const canvas = document.getElementById("ecoCanvas") as HTMLCanvasElement;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let frame = 0;
      const coreProps = {
        rotation: 0,
        intensity: 0,
        scale: 0.8,
        morph: 0, // 0: Engine, 1: Arch, 2: Intel, 3: Sync
        color: "#ccff00",
      };

      // 3x3x3 Grid (27 points) - Structured and Lightweight
      const vertices = Array.from({ length: 27 }, (_, i) => ({
        id: i,
        seed: Math.random() * Math.PI * 2,
        gridX: (i % 3 - 1),
        gridY: (Math.floor(i / 3) % 3 - 1),
        gridZ: (Math.floor(i / 9) - 1),
      }));

      const resize = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (rect) {
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          canvas.style.width = `${rect.width}px`;
          canvas.style.height = `${rect.height}px`;
          ctx.scale(dpr, dpr);
        }
      };
      window.addEventListener("resize", resize);
      resize();

      const drawKinetic = () => {
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const cx = w / 2;
        const cy = h / 2;
        const baseRadius = Math.min(w, h) * 0.35 * coreProps.scale; // Reduced from 0.42 for a smaller footprint

        ctx.clearRect(0, 0, w, h);
        frame++;

        const rotX = coreProps.rotation * 0.2;
        const rotY = coreProps.rotation;

        const points = vertices.map(v => {
          let tx, ty, tz;

          // Stages: 0 (Line) -> 1 (Grid) -> 2 (Swarm) -> 3 (Nexus)
          const t1 = Math.max(0, Math.min(1, coreProps.morph));
          const t2 = Math.max(0, Math.min(1, coreProps.morph - 1));
          const t3 = Math.max(0, Math.min(1, coreProps.morph - 2));

          // Stage 0: Vertical Axis (Engine)
          const beamX = 0;
          const beamY = v.gridY * 0.8;
          const beamZ = 0;

          // Stage 1: Cube Grid (Architecture)
          const gridX = v.gridX;
          const gridY = v.gridY;
          const gridZ = v.gridZ;

          // Stage 2: Orbit Swarm (Intelligence)
          const angle = frame * 0.015 + v.id * 0.4;
          const swarmX = Math.cos(angle) * 0.85;
          const swarmY = Math.sin(angle * 0.5) * 0.85;
          const swarmZ = Math.sin(angle) * 0.85;

          // Stage 3: Synchronized Nexus (Integration)
          const nexusX = Math.cos(v.seed) * 0.5;
          const nexusY = Math.sin(v.seed) * 0.5;
          const nexusZ = Math.cos(v.seed * 2) * 0.5;

          // Multi-stage Interpolation
          tx = beamX * (1 - t1) + gridX * t1;
          ty = beamY * (1 - t1) + gridY * t1;
          tz = beamZ * (1 - t1) + gridZ * t1;

          if (t2 > 0) {
            tx = tx * (1 - t2) + swarmX * t2;
            ty = ty * (1 - t2) + swarmY * t2;
            tz = tz * (1 - t2) + swarmZ * t2;
          }

          if (t3 > 0) {
            tx = tx * (1 - t3) + nexusX * t3;
            ty = ty * (1 - t3) + nexusY * t3;
            tz = tz * (1 - t3) + nexusZ * t3;
          }

          // Projection
          const cY = Math.cos(rotY), sY = Math.sin(rotY);
          let x1 = tx * cY - tz * sY;
          let z1 = tx * sY + tz * cY;
          const cX = Math.cos(rotX), sX = Math.sin(rotX);
          let y2 = ty * cX - z1 * sX;
          let z2 = ty * sX + z1 * cX;

          const perspective = 3 / (3 + z2);

          const dFromCenter = Math.sqrt(tx * tx + ty * ty + tz * tz);
          const opacity = Math.max(0, 1 - Math.pow(dFromCenter / 1.3, 4));

          return {
            x: cx + x1 * baseRadius * perspective,
            y: cy + y2 * baseRadius * perspective,
            z: z2,
            tx, ty, tz, // Store warped 3D for stable mapping
            opacity: opacity
          };
        });

        // Stable 3D Wireframe
        ctx.beginPath();
        ctx.strokeStyle = coreProps.color;
        ctx.lineWidth = 1.6;

        // Dynamic threshold for different stages
        const baseThreshold = 1.1;
        const swarmThreshold = 0.8;
        const currentThreshold = baseThreshold * (1 - Math.max(0, Math.min(1, coreProps.morph - 1))) + swarmThreshold * Math.max(0, Math.min(1, coreProps.morph - 1));

        for (let i = 0; i < points.length; i++) {
          const p1 = points[i];
          if (p1.opacity <= 0.1) continue;
          for (let j = i + 1; j < points.length; j++) {
            const p2 = points[j];
            if (p2.opacity <= 0.1) continue;

            // Use 3D distance for stable connections (no flickering in swarm)
            const dist3DSq = (p1.tx - p2.tx) ** 2 + (p1.ty - p2.ty) ** 2 + (p1.tz - p2.tz) ** 2;
            if (dist3DSq < currentThreshold * currentThreshold) {
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
            }
          }
        }
        ctx.globalAlpha = 0.15 + coreProps.intensity * 0.35;
        ctx.stroke();

        // Draw Focal Nodes
        points.forEach(p => {
          if (p.opacity <= 0.1) return;
          ctx.beginPath();
          ctx.globalAlpha = p.opacity * (0.6 + coreProps.intensity * 0.4);
          ctx.fillStyle = coreProps.color;
          const size = Math.max(0.1, 3.5 * (1.4 - p.z)); // Guard against negative radius
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
        });

        requestAnimationFrame(drawKinetic);
      };

      const animId = requestAnimationFrame(drawKinetic);

      // --- Timeline Updates ---
      const cubeTl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          containerAnimation: scrollTween,
          start: "left left",
          end: "right right",
          scrub: 1.5,
        },
      });

      cubeTl
        // ENGINE (Axis)
        .to("#stg-0", { opacity: 0, y: -30, duration: 0.5 })
        .to("#stg-div", { opacity: 1, y: 0, duration: 0.5 })
        .to(coreProps, { scale: 1.1, intensity: 0.4, morph: 0.3, duration: 1 }, "<")

        // ARCHITECTURE (Unfold Grid)
        .to("#stg-div", { opacity: 0, y: -30, duration: 0.5 })
        .to("#stg-1", { opacity: 1, y: 0, duration: 0.5 })
        .to(coreProps, { color: "#ffffff", intensity: 0.6, rotation: Math.PI, morph: 1.0, duration: 1 }, "<")

        // INTELLIGENCE (Spin Swarm)
        .to("#stg-1", { opacity: 0, y: -30, duration: 0.5 })
        .to("#stg-2", { opacity: 1, y: 0, duration: 0.5 })
        .to(coreProps, { color: "#e4e4e7", intensity: 0.9, rotation: Math.PI * 2, morph: 2.0, duration: 1 }, "<")

        // INTEGRATION (Nexus Pulse)
        .to("#stg-2", { opacity: 0, y: -30, duration: 0.5 })
        .to("#stg-3", { opacity: 1, y: 0, duration: 0.5 })
        .to(coreProps, { color: "#ccff00", intensity: 0.9, rotation: Math.PI * 3, morph: 2.5, duration: 1 }, "<");

      return () => {
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(animId);
      };
    },
    { scope: container, dependencies: [scrollTween] }
  );

  const cardVariants: Variants = {
    hover: {
      scale: 1.02,
      backgroundColor: "rgba(14, 14, 16, 0.6)",
      transition: { duration: 0.3 }
    }
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="panel ecosystem-panel theme-dark" id="ecoPanel" ref={container}>
      <div className="eco-sticky-wrap" id="ecoSticky" ref={ecoSticky}>
        {/* CONTENT */}
        <div className="eco-content-col">
          <motion.div 
            className="eco-stage" 
            id="stg-0" 
            style={{ opacity: 1 }}
            whileHover="hover"
            variants={cardVariants}
          >
            <span className="eco-label" style={{ color: "#ccff00" }}>
              THE ENGINE
            </span>
            <h3 className="eco-title">Nova Framework.</h3>
            <p className="eco-desc">
              This is the substrate of our agency. Nova is a proprietary engine
              that transforms raw LLMs into specialized architectural nodes
              capable of sovereign decision making and complex execution.
            </p>
          </motion.div>
          <motion.div 
            className="eco-stage" 
            id="stg-div"
            whileHover="hover"
            variants={cardVariants}
          >
            <span className="eco-label" style={{ color: "#fff" }}>
              SERVICE VECTORS
            </span>
            <h3 className="eco-title">Neural Architecture.</h3>
            <p className="eco-desc">
              We don't deliver tools; we deliver talent. Our systems bridge the
              gap between static code and dynamic execution across three
              strategic vectors.
            </p>
          </motion.div>
          <motion.div 
            className="eco-stage" 
            id="stg-1"
            whileHover="hover"
            variants={cardVariants}
          >
            <span className="eco-label" style={{ color: "#05d9e8" }}>
              VECTOR_01 // ARCHITECTURE
            </span>
            <h3 className="eco-title">Workflow Mapping</h3>
            <p className="eco-desc">
              We dissect your internal bottlenecks and re-engineer the path to
              autonomy, utilizing{" "}
              <span style={{ color: "#05d9e8" }}>Cloudflare’s global edge</span>{" "}
              to ensure agents are always-available and instant.
            </p>
          </motion.div>
          <motion.div 
            className="eco-stage" 
            id="stg-2"
            whileHover="hover"
            variants={cardVariants}
          >
            <span className="eco-label" style={{ color: "#ff2a6d" }}>
              VECTOR_02 // INTELLIGENCE
            </span>
            <h3 className="eco-title">Specialized Swarms</h3>
            <p className="eco-desc">
              We deploy high-fidelity specialists. From 24/7 Chatbots and AI
              Calling Agents to Autonomous Marketing Swarms, each is custom
              trained for your ecosystem.
            </p>
          </motion.div>
          <motion.div 
            className="eco-stage" 
            id="stg-3"
            whileHover="hover"
            variants={cardVariants}
          >
            <span className="eco-label" style={{ color: "#05d9e8" }}>
              VECTOR_03 // INTEGRATION
            </span>
            <h3 className="eco-title">Operational Sync</h3>
            <p className="eco-desc">
              Our agents don't just talk; they act. They inhabit your{" "}
              <span style={{ color: "#05d9e8" }}>CRMs</span>, pulse through your
              APIs, and trigger webhooks with zero friction.
            </p>
          </motion.div>

          <div className="eco-cta">
            <a href="https://contact.godwinausten.org" className="cta-button cta-button-filled" style={{ display: "inline-flex", textDecoration: "none" }}>
              <span>Build an Ecosystem</span>
              <span className="cta-arrow">→</span>
            </a>
          </div>
        </div>

        {/* VISUAL */}
        <div className="eco-visual-col">
          <div className="deco-ring ring-1"></div>
          <div className="deco-ring ring-2"></div>
          <div className="eco-canvas-wrapper">
            <canvas id="ecoCanvas" className="eco-canvas"></canvas>
          </div>
        </div>
      </div>
    </section>
  );
}
