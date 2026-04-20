"use client";

import { motion, Variants } from "framer-motion";
import MagneticButton from "./MagneticButton";
import Marquee from "./Marquee";

export default function Architecture() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const slideIn: Variants = {
    hidden: { opacity: 0, x: -40, clipPath: "inset(0% 100% 0% 0%)" },
    visible: {
      opacity: 1, x: 0,
      clipPath: "inset(0% 0% 0% 0%)",
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
    },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  const techBadges = [
    "Cloudflare Workers", "AI SDK", "WebSockets", "D1 Database",
    "KV Storage", "Vectorize", "Workers AI"
  ];

  return (
    <section className="panel theme-accent">
      {/* Top marquee */}
      <div style={{ position: "absolute", top: "2rem", left: 0, width: "100%", zIndex: 2 }}>
        <Marquee
          texts={["EDGE NATIVE", "SUB-10MS LATENCY", "STATELESS EXECUTION", "GLOBAL DISTRIBUTION", "SOVEREIGN AGENTS"]}
          speed={30}
          separator="✦"
          className="stream-marquee"
        />
      </div>
      <motion.div
        className="arch-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div>
          <motion.div className="pill arch-pill" variants={fadeUp}>UNDER THE HOOD</motion.div>
          <motion.h2 className="text-xl" variants={slideIn} style={{ lineHeight: 1.1 }}>
            Edge AI.
          </motion.h2>
          <motion.p className="text-body" style={{ marginTop: "2rem" }} variants={fadeUp}>
            Nova is built for the global edge. By deploying on Cloudflare, we
            eliminate the latency of traditional servers. Your intelligence is
            stateless, globally distributed, and instantly scalable.
          </motion.p>

          {/* Floating tech badges */}
          <motion.div className="tech-badges" variants={fadeUp}>
            {techBadges.map((badge, i) => (
              <motion.span
                key={badge}
                className="tech-badge"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + i * 0.08, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1, y: -3, boxShadow: "0 6px 20px rgba(0,0,0,0.15)" }}
              >
                {badge}
              </motion.span>
            ))}
          </motion.div>

          <motion.ul
            className="mono"
            style={{ marginTop: "2rem", listStyle: "none", color: "inherit", opacity: 0.8 }}
            variants={containerVariants}
          >
            {[
              "Stateless Execution: Infinite scalability",
              "Edge Native: Sub 10ms global response",
              "Sovereign Intelligence: Agents that own outcomes",
            ].map((text, i) => (
              <motion.li key={i} style={{ marginBottom: "1rem" }} variants={fadeUp}>
                {">"} {text}
              </motion.li>
            ))}
          </motion.ul>

          <motion.div style={{ marginTop: "2rem" }} variants={fadeUp}>
            <MagneticButton href="https://contact.godwinausten.org" className="cta-button cta-button-filled">
              <span>See Case Studies</span>
              <span className="cta-arrow">→</span>
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div
          className="code-block"
          variants={fadeUp}
          whileHover={{ scale: 1.02, rotate: -0.5 }}
        >
          <div className="scan-line"></div>
          <span className="code-highlight">import</span> {"{ NovaSwarm } "}
          <span className="code-highlight">from</span> &quot;@nova/core&quot;;
          <br /><br />
          <span className="code-highlight">const</span> agent ={" "}
          <span className="code-highlight">new</span> Agent({"{"}
          <br />
          &nbsp;&nbsp;role: <span className="code-pop">&quot;Closer&quot;</span>,
          <br />
          &nbsp;&nbsp;model: <span className="code-pop">&quot;gpt-4o&quot;</span>,
          <br />
          &nbsp;&nbsp;tools: [<span className="code-pop">Stripe_API</span>]
          <br />
          {"});"}
        </motion.div>
      </motion.div>
    </section>
  );
}
