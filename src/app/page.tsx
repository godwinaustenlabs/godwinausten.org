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
      const initScroll = () => {
        if (!wrapperRef.current) return;

        const isDesktop = window.innerWidth > 768;
        if (isDesktop) {
          const panels = gsap.utils.toArray<HTMLElement>(".panel");
          let totalWidth = 0;
          panels.forEach((panel) => {
            totalWidth += panel.offsetWidth || window.innerWidth;
          });
          const dragDistance = totalWidth - window.innerWidth;

          const tween = gsap.to(panels, {
            x: -dragDistance,
            ease: "none",
            scrollTrigger: {
              trigger: wrapperRef.current,
              pin: true,
              pinType: "fixed",
              anticipatePin: 1,
              scrub: 1.5,
              end: () => "+=" + dragDistance,
              invalidateOnRefresh: true,
            },
          });

          setScrollTween(tween);
          ScrollTrigger.refresh();
        }
      };

      // Ensure layout is stable
      const timer = setTimeout(initScroll, 100);
      window.addEventListener("load", () => {
        setTimeout(() => ScrollTrigger.refresh(), 500);
      });

      return () => clearTimeout(timer);
    },
    { scope: undefined }
  );

  // Dynamic Theme Color Observer
  useGSAP(
    () => {
      const isDesktop = window.innerWidth > 768;
      const panels = gsap.utils.toArray<HTMLElement>(".panel");

      const updateThemeColor = (color: string) => {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
          metaThemeColor = document.createElement("meta");
          metaThemeColor.setAttribute("name", "theme-color");
          document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.setAttribute("content", color);
      };

      const getPanelColor = (panel: HTMLElement) => {
        if (panel.classList.contains("theme-lime")) return "#ccff00";
        if (panel.classList.contains("theme-yellow")) return "#ffcf00";
        return "#050505";
      };

      if (panels.length > 0) updateThemeColor(getPanelColor(panels[0]));

      panels.forEach((panel) => {
        ScrollTrigger.create({
          trigger: panel,
          containerAnimation: isDesktop && scrollTween ? scrollTween : undefined,
          start: isDesktop ? "left center" : "top center",
          onEnter: () => updateThemeColor(getPanelColor(panel)),
          onEnterBack: () => updateThemeColor(getPanelColor(panel)),
        });
      });
    },
    { scope: undefined, dependencies: [scrollTween] }
  );

  return (
    <main>
      <Loader />

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
