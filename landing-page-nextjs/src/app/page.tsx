"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Ecosystem from "@/components/Ecosystem";
import NeuralStream from "@/components/NeuralStream";
import Chat from "@/components/Chat";
import Architecture from "@/components/Architecture";
import Topology from "@/components/Topology";
import Footer from "@/components/Footer";
import Background from "@/components/Background";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scrollTween, setScrollTween] = useState<gsap.core.Tween>();

  useGSAP(
    () => {
      const isDesktop = window.innerWidth > 768;

      if (isDesktop && wrapperRef.current) {
        const panels = gsap.utils.toArray<HTMLElement>(".panel");
        let totalWidth = 0;
        panels.forEach((panel) => (totalWidth += panel.offsetWidth));
        const dragDistance = totalWidth - window.innerWidth;

        const tween = gsap.to(panels, {
          x: -dragDistance,
          ease: "none",
          scrollTrigger: {
            trigger: wrapperRef.current,
            pin: true,
            scrub: 1.5,
            end: () => "+=" + dragDistance,
            invalidateOnRefresh: true,
          },
        });

        setScrollTween(tween);
      }

      // Cursor Logic
      if (window.matchMedia("(pointer: fine)").matches) {
        const cursorDot = document.querySelector(".cursor-dot");
        const cursorOutline = document.querySelector(".cursor-outline");

        gsap.set([cursorDot, cursorOutline], { xPercent: -50, yPercent: -50 });

        const onMouseMove = (e: MouseEvent) => {
          gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0 });
          gsap.to(cursorOutline, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.15,
          });

          // Hover effects
          const target = e.target as HTMLElement;
          const isHoverable = target.closest("a, button, .code-block, .hud-node, .node");
          if (isHoverable) {
            cursorOutline?.classList.add("hovered");
          } else {
            cursorOutline?.classList.remove("hovered");
          }
        };

        window.addEventListener("mousemove", onMouseMove);

        // Cube Rotation Logic
        const cubeLayer = document.querySelector(".cube-mouse-layer");
        const onCubeMouseMove = (e: MouseEvent) => {
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
    },
    { scope: wrapperRef }
  );

  return (
    <main>
      <Loader />
      <Navbar />
      <Background />

      <div className="wrapper" ref={wrapperRef}>
        <Hero />
        <Manifesto />
        <Ecosystem scrollTween={scrollTween} />
        <NeuralStream scrollTween={scrollTween} />
        <Chat />
        <Architecture />
        <Topology />
        <Footer />
      </div>
    </main>
  );
}
