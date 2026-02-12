"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface EcosystemProps {
  scrollTween?: gsap.core.Tween;
}

export default function Ecosystem({ scrollTween }: EcosystemProps) {
  const container = useRef<HTMLDivElement>(null);
  const ecoSticky = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!scrollTween) return;

      // Sticky Move Logic
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

      // Cube & Stage Animation Logic
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
        .to("#stg-0", { opacity: 0, y: -30, duration: 0.5 })
        .to("#stg-div", { opacity: 1, y: 0, duration: 0.5 })
        .to(
          "#ecoCube",
          { scale: 1, rotationX: -10, rotationY: 40, duration: 1 },
          "<"
        )
        .to("#stg-div", { opacity: 0, y: -30, duration: 0.5 })
        .to("#stg-1", { opacity: 1, y: 0, duration: 0.5 })
        .to(
          "#ecoCube",
          { rotationY: -90, rotationX: 0, x: "0%", duration: 1 },
          "<"
        )
        .to(
          ".cf-right",
          {
            "--pop-offset": "50px",
            borderColor: "#05d9e8", // Cyan highlight
            backgroundColor: "rgba(5,217,232,0.1)",
            duration: 1,
          },
          "<"
        )
        .to("#stg-1", { opacity: 0, y: -30, duration: 0.5 })
        .to(".cf-right", {
          "--pop-offset": "0px",
          borderColor: "rgba(255,255,255,0.2)",
          backgroundColor: "rgba(255,255,255,0.02)",
          duration: 0.5,
        })
        .to("#stg-2", { opacity: 1, y: 0, duration: 0.5 })
        .to(
          "#ecoCube",
          { rotationX: -90, rotationY: 0, x: "0%", y: "0%", duration: 1 },
          "<"
        )
        .to(
          ".cf-top",
          {
            "--pop-offset": "50px",
            borderColor: "#ff2a6d", // Pink highlight
            backgroundColor: "rgba(255,42,109,0.1)",
            duration: 1,
          },
          "<"
        )
        .to("#stg-2", { opacity: 0, y: -30, duration: 0.5 })
        .to(".cf-top", {
          "--pop-offset": "0px",
          borderColor: "rgba(255,255,255,0.2)",
          backgroundColor: "rgba(255,255,255,0.02)",
          duration: 0.5,
        })
        .to("#stg-3", { opacity: 1, y: 0, duration: 0.5 })
        .to(
          "#ecoCube",
          { rotationY: 90, rotationX: 0, x: "0%", y: "0%", duration: 1 },
          "<"
        )
        .to(
          ".cf-left",
          {
            "--pop-offset": "50px",
            borderColor: "#ccff00", // Acid Lime highlight
            backgroundColor: "rgba(204,255,0,0.1)",
            duration: 1,
          },
          "<"
        );
    },
    { scope: container, dependencies: [scrollTween] }
  );

  return (
    <section className="panel ecosystem-panel" id="ecoPanel" ref={container}>
      <div className="eco-sticky-wrap" id="ecoSticky" ref={ecoSticky}>
        {/* CONTENT */}
        <div className="eco-content-col">
          <div className="eco-stage" id="stg-0" style={{ opacity: 1 }}>
            <span className="eco-label" style={{ color: "#ccff00" }}>
              THE ENGINE
            </span>
            <h3 className="eco-title">Nova Framework.</h3>
            <p className="eco-desc">
              This is the substrate of our agency. Nova is a proprietary engine
              that transforms raw LLMs into specialized architectural nodes
              capable of sovereign decision making and complex execution.
            </p>
          </div>
          <div className="eco-stage" id="stg-div">
            <span className="eco-label" style={{ color: "#fff" }}>
              SERVICE VECTORS
            </span>
            <h3 className="eco-title">Neural Architecture.</h3>
            <p className="eco-desc">
              We don't deliver tools; we deliver talent. Our systems bridge the
              gap between static code and dynamic execution across three
              strategic vectors.
            </p>
          </div>
          <div className="eco-stage" id="stg-1">
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
          </div>
          <div className="eco-stage" id="stg-2">
            <span className="eco-label" style={{ color: "#ff2a6d" }}>
              VECTOR_02 // INTELLIGENCE
            </span>
            <h3 className="eco-title">Specialized Swarms</h3>
            <p className="eco-desc">
              We deploy high-fidelity specialists. From 24/7 Chatbots and AI
              Calling Agents to Autonomous Marketing Swarms, each is custom
              trained for your ecosystem.
            </p>
          </div>
          <div className="eco-stage" id="stg-3">
            <span className="eco-label" style={{ color: "#05d9e8" }}>
              VECTOR_03 // INTEGRATION
            </span>
            <h3 className="eco-title">Operational Sync</h3>
            <p className="eco-desc">
              Our agents don't just talk; they act. They inhabit your{" "}
              <span style={{ color: "#05d9e8" }}>CRMs</span>, pulse through your
              APIs, and trigger webhooks with zero friction.
            </p>
          </div>
        </div>

        {/* VISUAL */}
        <div className="eco-visual-col">
          <div className="deco-ring ring-1"></div>
          <div className="deco-ring ring-2"></div>
          <div className="cube-float-wrapper">
            <div className="cube-mouse-layer">
              <div className="cube-container" id="ecoCube">
                <div className="cube-core"></div>
                <div className="c-face cf-front">
                  <span className="cf-icon">❖</span>
                  <span className="cf-label">CORE</span>
                </div>
                <div className="c-face cf-back">
                  <span className="cf-icon">❖</span>
                </div>
                <div className="c-face cf-right">
                  <span className="cf-icon">⚙︎</span>
                  <span className="cf-label">NOVA</span>
                </div>
                <div className="c-face cf-left">
                  <span className="cf-icon">★</span>
                  <span className="cf-label">CREATIVE</span>
                </div>
                <div className="c-face cf-top">
                  <span className="cf-icon">▲</span>
                  <span className="cf-label">GROWTH</span>
                </div>
                <div className="c-face cf-bottom">
                  <span className="cf-icon">▼</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
