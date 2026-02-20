"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Background() {
  const container = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Standard Background Animation
    gsap.to(".flow-shape", {
      x: "random(-20, 20)",
      y: "random(-20, 20)",
      duration: "random(10, 20)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Global Cursor Logic
    if (window.matchMedia("(pointer: fine)").matches) {
      gsap.set([dotRef.current, outlineRef.current], { xPercent: -50, yPercent: -50 });

      const onMouseMove = (e: MouseEvent) => {
        if (!dotRef.current || !outlineRef.current) return;

        gsap.to(dotRef.current, { x: e.clientX, y: e.clientY, duration: 0 });
        gsap.to(outlineRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.15,
        });

        const target = e.target as HTMLElement;
        const isHoverable = target.closest("a, button, .code-block, .hud-node, .node, [role='button'], .cursor-pointer");
        if (isHoverable) {
          outlineRef.current.classList.add("hovered");
        } else {
          outlineRef.current.classList.remove("hovered");
        }
      };

      window.addEventListener("mousemove", onMouseMove);

      // Cube Rotation (Handles Global even if cube isn't present)
      const onCubeMouseMove = (e: MouseEvent) => {
        const cubeLayer = document.querySelector(".cube-mouse-layer");
        if (!cubeLayer) return;
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
        const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
        gsap.to(cubeLayer, {
          rotationY: x * 30,
          rotationX: -y * 30,
          duration: 0.6,
          ease: "power2.out",
        });
      };
      window.addEventListener("mousemove", onCubeMouseMove);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mousemove", onCubeMouseMove);
      };
    }
  }, { scope: undefined });

  return (
    <div ref={container}>
      <div className="grain-overlay"></div>
      <div className="neon-flow">
        <div className="flow-shape flow1"></div>
        <div className="flow-shape flow2"></div>
        <div className="flow-shape flow3"></div>
      </div>
      <div className="gridlines"></div>

      {/* Custom Cursor */}
      <div ref={dotRef} className="cursor-dot"></div>
      <div ref={outlineRef} className="cursor-outline"></div>
    </div>
  );
}
