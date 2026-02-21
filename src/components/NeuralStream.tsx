"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface NeuralStreamProps {
  scrollTween?: gsap.core.Tween;
}

export default function NeuralStream({ scrollTween }: NeuralStreamProps) {
  const container = useRef<HTMLDivElement>(null);
  const cableRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      if (!scrollTween || !container.current) return;

      const items = gsap.utils.toArray<HTMLElement>(".stream-item");

      // Cable Drawing Animation
      if (cableRef.current) {
        gsap.fromTo(
          cableRef.current,
          { strokeDashoffset: 1000, strokeDasharray: 1000 },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: container.current,
              containerAnimation: scrollTween,
              start: "left center",
              end: "right center",
              scrub: 1,
            },
          }
        );
      }

      // Sequential Node Activation
      items.forEach((node) => {
        gsap.to(node, {
          scrollTrigger: {
            trigger: node,
            containerAnimation: scrollTween,
            start: "left center",
            toggleClass: { targets: node, className: "active-stream" },
            onEnter: () => {
              gsap.fromTo(
                node,
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.3, clearProps: "x" }
              );
            },
          },
        });
      });
    },
    { scope: container, dependencies: [scrollTween] }
  );

  return (
    <section className="panel system-stream-panel theme-dark" id="sysPanel" ref={container}>
      <div className="stream-container">
        <div className="stream-header-mobile">
          <h2 className="text-xl">Logic Chain</h2>
        </div>

        {/* SVG Track Layer */}
        <div className="stream-track-layer">
          <svg className="stream-svg" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <path className="cable-bg" d="M0,100 L1000,100" />
            <path className="cable-active" id="streamCable" ref={cableRef} d="M0,100 L1000,100" />
          </svg>
        </div>

        {/* Flex Nodes */}
        <div className="stream-flex">
          <div className="hud-node stream-item">
            <div className="hud-scanner"></div>
            <div className="hud-content">
              <div className="hud-id">01 // LAYER_01</div>
              <div className="hud-title">Simple Chatbots</div>
              <div className="hud-metric">
                <span className="blink">●</span> LISTENING
              </div>
              <div className="hud-desc" style={{ fontSize: "0.9rem", color: "var(--text-color)", opacity: 0.8, marginTop: "10px" }}>
                Tactical agents for handling direct inquiries and basic support. The first entry point
                of automation for manual customer touchpoints.
              </div>
            </div>
          </div>

          <div className="hud-node stream-item">
            <div className="hud-scanner"></div>
            <div className="hud-content">
              <div className="hud-id">02 // LAYER_02</div>
              <div className="hud-title">Voice AI Agents</div>
              <div className="hud-metric">MATCH: 98.4%</div>
              <div className="hud-desc" style={{ fontSize: "0.9rem", color: "var(--text-color)", opacity: 0.8, marginTop: "10px" }}>
                Moving beyond text into autonomous calling and qualification. These agents handle
                objections and phone-based outreach with human-like nuance.
              </div>
            </div>
          </div>

          <div className="hud-node stream-item" style={{ borderColor: "var(--accent-pop)" }}>
            <div className="hud-scanner"></div>
            <div className="hud-content">
              <div className="hud-id" style={{ color: "var(--accent-pop)" }}>03 // LAYER_03</div>
              <div className="hud-title">Agentic Systems</div>
              <div className="hud-metric">
                <span className="blink">●</span> ACTIVE
              </div>
              <div className="hud-desc" style={{ fontSize: "0.9rem", color: "var(--text-color)", opacity: 0.8, marginTop: "10px" }}>
                Full-fledged AI swarms that navigate entire business processes. These are proactive
                systems that integrate deeply and act autonomously.
              </div>
            </div>
          </div>

          <div className="hud-node stream-item">
            <div className="hud-scanner"></div>
            <div className="hud-content">
              <div className="hud-id">04 // TOTALITY</div>
              <div className="hud-title">Full Autonomy</div>
              <div className="hud-metric">DONE</div>
              <div className="hud-desc" style={{ fontSize: "0.9rem", color: "var(--text-color)", opacity: 0.8, marginTop: "10px" }}>
                Your operations bridged by a seamless loop of intelligence. Meeting secured, CRM
                updated, and growth unlocked without a single click.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
