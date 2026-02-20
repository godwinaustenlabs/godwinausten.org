"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function AboutCEO() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".reveal-text", {
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out"
            });
            gsap.from(".profile-card", {
                scale: 0.95,
                opacity: 0,
                duration: 1.5,
                ease: "expo.out"
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <main className="text-[var(--accent-a)] relative page-main" ref={containerRef}>
            <div className="max-w-6xl mx-auto px-10 relative z-10">
                <header className="ceo-header">
                    <Link href="/" className="back-link mono uppercase scroll-reveal">
                        [ RETURN.TO.BASE ]
                    </Link>
                    <div className="title-wrap">
                        <h1 className="reveal-text headline uppercase" style={{ display: 'inline-block' }}>
                            LEADERSHIP <span className="accent-text italic">PROFILE</span>
                        </h1>
                        <p className="reveal-text mono subtitle opacity-50 tracking-widest uppercase block">
                            // NODE_ID: SAAD_NAIK // MANAGING_DIRECTOR
                        </p>
                    </div>
                </header>

                <div className="grid-layout">
                    {/* LEFT SIDE: Dossier Content */}
                    <div className="dossier-col">
                        <div className="profile-hero reveal-text">
                            <h2 className="name-title uppercase">Saad Naik</h2>
                            <p className="role-caption accent-text mono uppercase">Managing Director & Founder</p>
                        </div>

                        <div className="bio-section reveal-text">
                            <p className="bio-paragraph">
                                Architect of intelligent automation and veteran of the digital growth landscape.
                                Saad Naik founded Godwin Austen Labs with a singular objective:
                                <strong> to eliminate operational chaos through agentic intelligence.</strong>
                            </p>
                            <p className="bio-paragraph mt-p">
                                With a background rooted in high-performance marketing systems, he recognized early
                                that the next frontier of business efficiency wasn't more tools—it was
                                <span className="white"> centralized, autonomous architecture.</span>
                            </p>
                        </div>

                        <div className="tenets-grid reveal-text">
                            <div className="tenet-card glass-panel">
                                <span className="tenet-num mono">01</span>
                                <h3 className="mono uppercase">Systemic Vision</h3>
                                <p className="text-sm opacity-70">Focusing on the ecosystem, not the tool. Engineering long-term leverage over short-term hacks.</p>
                            </div>
                            <div className="tenet-card glass-panel">
                                <span className="tenet-num mono">02</span>
                                <h3 className="mono uppercase">Technical Precision</h3>
                                <p className="text-sm opacity-70">Every automation node must be resilient, predictable, and scalable without human drag.</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Visual Card */}
                    <div className="visual-col">
                        <div className="profile-card glass-panel accent-glow">
                            <div className="card-header border-b">
                                <span className="mono text-xs opacity-40">SYSTEMS_ACCESS_GRANTED</span>
                            </div>

                            <div className="spec-item">
                                <label className="mono text-xs opacity-40 uppercase block mb-label">Specialization</label>
                                <div className="tags">
                                    <span className="pill">AGENT_DESIGN</span>
                                    <span className="pill">INFRA_SCALING</span>
                                    <span className="pill">AI_ARCH</span>
                                </div>
                            </div>

                            <div className="contact-info">
                                <label className="mono text-xs opacity-40 uppercase block mb-label">Direct Connection</label>
                                <a href="mailto:ceo@godwinausten.org" className="email-link accent-text mono block w-full truncate" title="ceo@godwinausten.org">
                                    ceo@godwinausten.org
                                </a>
                            </div>

                            <div className="footer-decoration flex justify-between">
                                <div className="bar-graph">
                                    <div className="bar" style={{ height: '40%' }}></div>
                                    <div className="bar" style={{ height: '70%' }}></div>
                                    <div className="bar" style={{ height: '55%' }}></div>
                                    <div className="bar" style={{ height: '90%' }}></div>
                                </div>
                                <span className="mono text-[10px] opacity-20">EST_MMXXIII</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            <style jsx>{`
                .page-main {
                    padding-top: 180px;
                    padding-bottom: 120px;
                    min-height: 100vh;
                }
                .max-w-6xl { max-width: 1152px; }
                .mx-auto { margin-left: auto; margin-right: auto; }
                .px-10 { padding-left: 40px; padding-right: 40px; }
                
                .ceo-header { margin-bottom: 64px; }
                .title-wrap { margin-top: 32px; margin-bottom: 64px; }
                .subtitle { margin-top: 24px; font-size: 11px; }

                .back-link {
                    color: var(--accent-pop);
                    font-size: 11px;
                    letter-spacing: 0.1em;
                    transition: 0.3s;
                    display: inline-block;
                }
                .back-link:hover { color: white; }
                
                .headline {
                    font-size: clamp(2.5rem, 6vw, 6rem);
                    line-height: 0.95;
                    margin-bottom: 12px;
                    letter-spacing: -0.04em;
                }
                .accent-text { color: var(--accent-pop); }
                .white { color: white; }
                
                .grid-layout {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 80px;
                    margin-top: 80px;
                    margin-bottom: 120px;
                }

                .name-title {
                    font-size: 3.5rem;
                    line-height: 1;
                    margin-bottom: 8px;
                }
                
                .bio-section { margin-top: 48px; }
                .bio-paragraph {
                    font-size: 1.2rem;
                    line-height: 1.6;
                    color: var(--accent-b);
                }
                .mt-p { margin-top: 24px; }

                .tenets-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-top: 64px;
                }
                .tenet-card {
                    padding: 30px;
                    background: rgba(255,255,255,0.02);
                }
                .tenet-num {
                    font-size: 10px;
                    color: var(--accent-pop);
                    margin-bottom: 12px;
                    display: block;
                    opacity: 0.5;
                }
                .tenet-card h3 {
                    font-size: 1rem;
                    margin-bottom: 12px;
                }

                .profile-card {
                    padding: 40px;
                    position: sticky;
                    top: 150px;
                    background: rgba(10, 10, 12, 0.4);
                    border: 1px solid var(--glass-border);
                    backdrop-filter: blur(20px);
                }
                .accent-glow {
                    box-shadow: 0 0 40px rgba(0, 0, 0, 0.5), inset 0 0 1px rgba(204, 255, 0, 0.1);
                }
                
                .card-header.border-b {
                    border-bottom: 1px solid var(--glass-border);
                    padding-bottom: 16px;
                    margin-bottom: 24px;
                }
                .spec-item { margin-bottom: 32px; }
                .mb-label { margin-bottom: 8px; }
                .contact-info { margin-top: 32px; }

                .pill {
                    display: inline-block;
                    padding: 4px 10px;
                    border: 1px solid var(--glass-border);
                    font-size: 10px;
                    color: var(--accent-pop);
                    margin-right: 8px;
                    margin-bottom: 8px;
                    background: rgba(204, 255, 0, 0.05);
                }
                .email-link {
                    font-size: 1.1rem;
                    text-decoration: underline;
                    word-break: break-all;
                }

                .footer-decoration {
                    margin-top: 48px;
                    padding-top: 24px;
                    border-top: 1px solid var(--glass-border);
                }
                .bar-graph {
                    display: flex;
                    align-items: flex-end;
                    gap: 4px;
                    height: 20px;
                }
                .bar {
                    width: 3px;
                    background: var(--accent-pop);
                    opacity: 0.4;
                }

                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .block { display: block; }
                .text-xs { font-size: 12px; }
                .w-full { width: 100%; }

                @media (max-width: 1024px) {
                    .page-main { padding-top: 140px; }
                    .grid-layout { grid-template-columns: 1fr; gap: 40px; margin-top: 40px; }
                    .visual-col { order: -1; }
                    .profile-card { position: relative; top: 0; }
                    .tenets-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </main>
    );
}
