"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function About() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".fade-node", {
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: "power2.out"
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <main className="text-[var(--accent-a)] relative page-main theme-dark" ref={sectionRef}>
            <div className="max-w-6xl mx-auto px-10 relative z-10">
                <header className="about-header fade-node">
                    <Link href="/" className="back-link mono">
                        [ SYSTEM.RETURN.TO_BASE ]
                    </Link>
                    <div className="title-block">
                        <h1 className="about-jumbo uppercase leading-none">
                            ARCHITECTING <br /><span className="accent-text italic">LEVERAGE</span>
                        </h1>
                        <div className="doc-meta mono tracking-widest">
                            <span className="doc-id">ENTITY: GODWIN_AUSTEN_LABS</span>
                            <span className="doc-status">OBJECTIVE: ELIMINATE_DRAG</span>
                        </div>
                    </div>
                </header>

                <div className="about-grid fade-node">
                    {/* Genesis Module */}
                    <div className="grid-module panel-glass">
                        <div className="module-header mono">
                            <span className="module-id">MOD_01</span>
                            <span className="module-title">THE_AGENCY_ERA</span>
                        </div>
                        <div className="module-body">
                            <p>We launched in the high-stakes trenches of lead generation and digital growth. As a specialized agency, we mastered the art of acquisition. However, a critical failure point emerged across the industry:</p>
                            <div className="quote-box mono">
                                "Most businesses don’t have an acquisition problem. They have a systems problem."
                            </div>
                            <p>Generating flow was easy. Managing it without human drag, chaotic software stacks, and leaky funnels was the true bottleneck.</p>
                        </div>
                    </div>

                    {/* Pivot Module */}
                    <div className="grid-module panel-glass">
                        <div className="module-header mono">
                            <span className="module-id">MOD_02</span>
                            <span className="module-title">INTELLIGENCE_PIVOT</span>
                        </div>
                        <div className="module-body">
                            <p>We realized that Artificial Intelligence was not a tool to be integrated; it was a <span className="white">new operational paradigm</span>. We stopped rendering services and started engineering infrastructure.</p>
                            <ul className="sys-list mono text-xs">
                                <li><span>[-]</span> DEPRECATED: Duct-taped stacks</li>
                                <li><span>[-]</span> DEPRECATED: Manual qualification</li>
                                <li className="accent-text"><span>[+]</span> DEPLOYED: Cognitive architectures</li>
                                <li className="accent-text"><span>[+]</span> DEPLOYED: 24/7 Automation</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="philosophy-section theme-yellow full-bleed" style={{ padding: '120px 24px', marginTop: '120px', marginBottom: '80px' }}>
                    <div className="max-w-6xl mx-auto">
                        <div className="module-header mono mb-l" style={{ borderBottomColor: 'rgba(5, 5, 5, 0.2)' }}>
                            <span className="module-id" style={{ color: '#050505', fontWeight: 'bold' }}>CORE</span>
                            <span className="module-title" style={{ color: '#050505' }}>OPERATING_PHILOSOPHY</span>
                        </div>
                        <div className="phil-grid">
                            <div className="phil-node" style={{ borderLeft: '1px solid rgba(5,5,5,0.2)', paddingLeft: '1.5rem' }}>
                                <h4 className="mono uppercase mb-s" style={{ color: '#050505' }}>01. Automate_Repetitive</h4>
                                <p style={{ color: 'var(--text-dim)' }}>Human capital should be reserved for high-level strategy and creativity, never for data moving or basic qualification.</p>
                            </div>
                            <div className="phil-node" style={{ borderLeft: '1px solid rgba(5,5,5,0.2)', paddingLeft: '1.5rem' }}>
                                <h4 className="mono uppercase mb-s" style={{ color: '#050505' }}>02. Systemize_Chaos</h4>
                                <p style={{ color: 'var(--text-dim)' }}>Centralized, predictable systems beat fragmented tools every time. We build for seamless synchronicity.</p>
                            </div>
                            <div className="phil-node" style={{ borderLeft: '1px solid rgba(5,5,5,0.2)', paddingLeft: '1.5rem' }}>
                                <h4 className="mono uppercase mb-s" style={{ color: '#050505' }}>03. Engineer_Scale</h4>
                                <p style={{ color: 'var(--text-dim)' }}>If it works for ten users, it must work for ten thousand without breaking or requiring a massive increase in overhead.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="terminal-footer center fade-node">
                    <p className="mono accent-text text-sm mb-m">SYSTEM.LOG.OUT()</p>
                    <h2 className="footer-jumbo white uppercase font-bold tracking-tight">AI is not the future.<br />It is <span className="italic accent-text">Leverage.</span></h2>
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
                
                .about-header { margin-bottom: 80px; }
                .title-block { margin-top: 32px; margin-bottom: 64px; }
                .about-jumbo {
                    font-size: clamp(3rem, 6.5vw, 6.5rem);
                    line-height: 0.9;
                    font-weight: 700;
                    letter-spacing: -0.04em;
                }
                
                .doc-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    padding-bottom: 20px;
                    border-top: 1px solid var(--glass-border);
                    border-bottom: 1px solid var(--glass-border);
                    opacity: 0.6;
                    font-size: 12px;
                }

                .back-link {
                    color: var(--accent-pop);
                    font-size: 11px;
                    letter-spacing: 0.1em;
                    transition: all 0.3s;
                    display: inline-block;
                }
                .back-link:hover { color: white; }
                .accent-text { color: var(--accent-pop); }
                .white { color: white; }

                .about-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                    margin-bottom: 40px;
                }

                .panel-glass {
                    background: rgba(10, 10, 12, 0.4);
                    border: 1px solid var(--glass-border);
                    backdrop-filter: blur(20px);
                    padding: 40px;
                }

                .module-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 32px;
                    padding-bottom: 16px;
                    border-bottom: 1px dashed var(--glass-border);
                    font-size: 11px;
                    opacity: 0.7;
                }
                .module-id { color: var(--accent-pop); }

                .module-body p {
                    font-size: 1.15rem;
                    line-height: 1.7;
                    color: var(--text-dim);
                    margin-bottom: 24px;
                }

                .quote-box {
                    padding: 20px;
                    border-left: 2px solid var(--accent-pop);
                    background: rgba(204, 255, 0, 0.03);
                    font-size: 14px;
                    color: white;
                    margin-bottom: 24px;
                    line-height: 1.6;
                }

                .sys-list {
                    list-style: none;
                    padding: 0;
                    margin-top: 32px;
                }
                .sys-list li {
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    gap: 16px;
                    color: var(--accent-c);
                }

                .philosophy-section {
                    margin-bottom: 120px;
                }
                .phil-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 40px;
                }
                .mb-l { margin-bottom: 48px; }
                .mb-s { margin-bottom: 16px; }
                .phil-node p {
                    line-height: 1.6;
                    color: var(--text-dim);
                }

                .terminal-footer {
                    margin-top: 120px;
                    margin-bottom: 80px;
                }
                .center { text-align: center; }
                .mb-m { margin-bottom: 24px; }
                .footer-jumbo {
                    font-size: clamp(2rem, 5vw, 4rem);
                    line-height: 1;
                    letter-spacing: -0.02em;
                }

                @media (max-width: 1024px) {
                    .page-main { padding-top: 140px; }
                    .about-grid { grid-template-columns: 1fr; }
                    .phil-grid { grid-template-columns: 1fr; }
                    .doc-meta {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                        font-size: 10px;
                    }
                    .panel-glass { padding: 30px; }
                    .philosophy-section .max-w-6xl > div:first-child {
                        text-align: center !important;
                    }
                    .phil-node {
                        border-left: none !important;
                        border-top: 1px solid rgba(5,5,5,0.1) !important;
                        padding-left: 0 !important;
                        padding-top: 1.5rem !important;
                        text-align: center !important;
                    }
                }
            `}</style>
        </main >
    );
}
