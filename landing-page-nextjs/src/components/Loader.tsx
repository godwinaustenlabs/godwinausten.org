"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Loader() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const loaderTimeline = gsap.timeline({
        onComplete: () => {
          document.body.classList.remove("loading");
          const loader = document.getElementById("loader");
          if (loader) loader.style.display = "none";
          ScrollTrigger.refresh();
        },
      });

      loaderTimeline
        .fromTo(
          ".loader-line",
          { attr: { x1: 0, x2: 0 } },
          { attr: { x1: 0, x2: 400 }, duration: 0.8, ease: "power2.inOut" }
        )
        .to("#gridH", { opacity: 0.5, duration: 0.1 })
        .to("#gridV", { opacity: 0.5, duration: 0.1 }, "<")
        .to(".loader-line", {
          attr: { x1: 200, x2: 200 },
          duration: 0.5,
          ease: "power2.in",
        })
        .fromTo(
          "#loader-logo-bar",
          { strokeDasharray: 200, strokeDashoffset: 200, opacity: 1 },
          { strokeDashoffset: 0, duration: 0.6, ease: "power2.out" }
        )
        .fromTo(
          "#loader-logo-chevron",
          { strokeDasharray: 400, strokeDashoffset: 400, opacity: 1, y: 15 },
          { strokeDashoffset: 0, y: 0, duration: 1.0, ease: "power2.out" },
          "-=0.3"
        )
        .to(".loader-text", { opacity: 1, duration: 0.2 })
        .to(container.current, {
          yPercent: -100,
          duration: 0.8,
          ease: "expo.inOut",
          delay: 0.3,
          onComplete: () => {
             if (container.current) container.current.style.pointerEvents = "none";
          }
        });
    },
    { scope: container }
  );

  return (
    <div id="loader" ref={container}>
      <svg className="loader-svg" viewBox="0 0 400 300">
        {/* Grid Lines */}
        <line
          className="loader-grid"
          x1="0"
          y1="150"
          x2="400"
          y2="150"
          strokeDasharray="5,5"
          opacity="0"
          id="gridH"
        />
        <line
          className="loader-grid"
          x1="200"
          y1="0"
          x2="200"
          y2="300"
          strokeDasharray="5,5"
          opacity="0"
          id="gridV"
        />

        {/* Horizon Line Removed for Centering */}

        {/* Logo Blueprint Path (Centered & Split) */}
        <path
          id="loader-logo-bar"
          className="loader-logo-path"
          d="M 160 195 L 240 195"
        />
        <path
          id="loader-logo-chevron"
          className="loader-logo-path"
          d="M 140 165 L 200 105 L 260 165"
        />

        {/* Text */}
        <text className="loader-text" x="200" y="230" textAnchor="middle">
          {/* NOVA_SYSTEMS / INITIALIZING... */}
        </text>

        {/* Active Line */}
        <line className="loader-line" x1="0" y1="250" x2="400" y2="250" />
      </svg>
    </div>
  );
}
