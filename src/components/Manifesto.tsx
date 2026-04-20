"use client";

import { motion, Variants } from "framer-motion";
import MagneticButton from "./MagneticButton";
import Marquee from "./Marquee";

export default function Manifesto() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const slideUp: Variants = {
    hidden: { opacity: 0, y: 60, clipPath: "inset(100% 0% 0% 0%)" },
    visible: {
      opacity: 1, y: 0,
      clipPath: "inset(0% 0% 0% 0%)",
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
    },
  };

  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="panel theme-accent">
      {/* Top marquee ticker — positioned exactly at top 2rem */}
      <div style={{ position: "absolute", top: "2rem", left: 0, width: "100%", zIndex: 2 }}>
        <Marquee
          texts={["AGENTIC INFRASTRUCTURE", "NOVA FRAMEWORK", "EDGE COMPUTING", "AI SWARMS", "CLOUDFLARE WORKERS", "AUTONOMOUS SYSTEMS"]}
          speed={25}
          separator="—"
          className="stream-marquee"
        />
      </div>

      <motion.div
        className="manifesto-card"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h2 className="text-xl manifesto-headline" variants={slideUp}>
          &ldquo;Stop hiring for roles that{" "}
          <motion.span
            style={{ fontWeight: 800, display: "inline-block" }}
            whileHover={{ scale: 1.05, color: "#1A1A1A" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Software
          </motion.span>{" "}
          can fill.&rdquo;
        </motion.h2>

        <motion.p className="text-body" style={{ marginTop: "2.5rem", maxWidth: "60ch" }} variants={fadeIn}>
          <strong>The Initiative.</strong> Automation is no longer about rigid
          scripts. It is about fluid intelligence. We architect bespoke AI
          ecosystems that live at the edge. Deployed via Cloudflare, our agents
          are stateless, indestructible, and hyper-aware of your business context.
        </motion.p>

        <motion.div className="manifesto-metrics" variants={fadeIn}>
          <div className="manifesto-metric">
            <motion.span className="manifesto-metric-value"
              initial={{ scale: 0 }} whileInView={{ scale: 1 }}
              viewport={{ once: true }} transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
            >10x</motion.span>
            <span className="manifesto-metric-label">Faster Deployment</span>
          </div>
          <div className="manifesto-metric">
            <motion.span className="manifesto-metric-value"
              initial={{ scale: 0 }} whileInView={{ scale: 1 }}
              viewport={{ once: true }} transition={{ type: "spring", stiffness: 200, delay: 0.7 }}
            >85%</motion.span>
            <span className="manifesto-metric-label">Cost Reduction</span>
          </div>
          <div className="manifesto-metric">
            <motion.span className="manifesto-metric-value"
              initial={{ scale: 0 }} whileInView={{ scale: 1 }}
              viewport={{ once: true }} transition={{ type: "spring", stiffness: 200, delay: 0.9 }}
            >24/7</motion.span>
            <span className="manifesto-metric-label">Always On</span>
          </div>
        </motion.div>

        <motion.div
          style={{ marginTop: "2.5rem", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}
          variants={fadeIn}
        >
          <MagneticButton href="https://contact.godwinausten.org" className="cta-button cta-button-filled">
            <span>Start Building</span>
            <span className="cta-arrow">→</span>
          </MagneticButton>
          <span className="mono" style={{ opacity: 0.5, fontSize: "0.8rem", fontWeight: "bold" }}>
            // GODWIN AUSTEN LABS // EST. 2024
          </span>
        </motion.div>
      </motion.div>

      {/* Bottom marquee (opposite direction) */}
      <div className="manifesto-marquee-bottom">
        <Marquee
          texts={["DEPLOY AGENTS", "AUTOMATE WORKFLOWS", "SCALE INFINITELY", "ZERO LATENCY", "EDGE NATIVE", "SOVEREIGN AI"]}
          speed={20}
          direction="right"
          separator="✦"
        />
      </div>
    </section>
  );
}
