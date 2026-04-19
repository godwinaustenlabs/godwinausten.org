"use client";

import { motion, Variants } from "framer-motion";

export default function Architecture() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="panel theme-yellow">
      <motion.div
        className="arch-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div>
          <motion.div className="pill" variants={itemVariants}>
            UNDER THE HOOD
          </motion.div>
          <motion.h2 className="text-xl" variants={itemVariants}>
            Edge AI.
          </motion.h2>
          <motion.p
            className="text-body"
            style={{ marginTop: "2rem" }}
            variants={itemVariants}
          >
            Nova is built for the global edge. By deploying on Cloudflare, we
            eliminate the latency of traditional servers. Your intelligence is
            stateless, globally distributed, and instantly scalable.
          </motion.p>
          <motion.ul
            className="mono"
            style={{
              marginTop: "2rem",
              listStyle: "none",
              color: "inherit",
              opacity: 0.8,
            }}
            variants={containerVariants}
          >
            {[
              "Stateless Execution: Infinite scalability without baggage",
              "Edge Native Speed: Sub 10ms global responsiveness",
              "Sovereign Intelligence: Agents that own their outcomes",
            ].map((text, i) => (
              <motion.li
                key={i}
                style={{ marginBottom: "1rem" }}
                variants={itemVariants}
              >
                {">"} {text}
              </motion.li>
            ))}
          </motion.ul>
        </div>
        <motion.div
          className="code-block"
          variants={itemVariants}
          whileHover={{ scale: 1.02, rotate: -0.5 }}
        >
          <div className="scan-line"></div>
          <span className="code-highlight">import</span> {"{ NovaSwarm } "}{" "}
          <span className="code-highlight">from</span> "@nova/core";
          <br />
          <br />
          <span className="code-highlight">const</span> agent ={" "}
          <span className="code-highlight">new</span> Agent({"{"}
          <br />
          &nbsp;&nbsp;role: "Closer",
          <br />
          &nbsp;&nbsp;model: "gpt-4o",
          <br />
          &nbsp;&nbsp;tools: [Stripe_API]
          <br />
          {"});"}
          <br />
        </motion.div>
      </motion.div>
    </section>
  );
}
