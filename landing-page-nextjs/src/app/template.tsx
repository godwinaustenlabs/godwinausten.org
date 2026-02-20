"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Template({ children }: { children: React.ReactNode }) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial state
            gsap.set(overlayRef.current, { scaleY: 1, transformOrigin: "bottom" });

            const tl = gsap.timeline({ defaults: { ease: "power4.inOut" } });

            tl.to(overlayRef.current, {
                scaleY: 0,
                duration: 0.8,
                transformOrigin: "top",
                delay: 0.2,
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <>
            <div
                ref={overlayRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100vh",
                    backgroundColor: "var(--accent-pop)",
                    zIndex: 9999,
                    pointerEvents: "none",
                }}
            />
            {children}
        </>
    );
}
