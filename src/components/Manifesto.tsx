"use client";

import { motion, Variants } from "framer-motion";

export default function Manifesto() {
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="panel theme-lime" style={{ paddingLeft: "0px" }}>
      <motion.div
        className="manifesto-card"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h2
          className="text-xl"
          style={{ fontWeight: 400, lineHeight: 1.2 }}
          variants={itemVariants}
        >
          "Stop hiring for roles that{" "}
          <span style={{ fontWeight: 800 }}>Software</span> can fill."
        </motion.h2>
        <motion.p
          className="text-body"
          style={{ marginTop: "2rem" }}
          variants={itemVariants}
        >
          <strong>The Initiative.</strong> Automation is no longer about rigid
          scripts. It is about fluid intelligence. We architect bespoke AI
          ecosystems that live at the edge. Deployed via Cloudflare, our agents
          are stateless, indestructible, and hyper-aware of your business
          context. From the first handshake of lead qualification to the deep
          mechanics of aftersales support, we solve for outcomes.
        </motion.p>
        <motion.div
          className="mono"
          style={{
            marginTop: "3rem",
            opacity: 0.5,
            fontSize: "0.8rem",
            fontWeight: "bold",
          }}
          variants={itemVariants}
        >
          // GODWIN AUSTEN LABS // EST. 2024
        </motion.div>
      </motion.div>
    </section>
  );
}
