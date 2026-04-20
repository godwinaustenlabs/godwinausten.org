"use client";

import { usePathname } from "next/navigation";
import { motion, Variants } from "framer-motion";
import MagneticButton from "./MagneticButton";

export default function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const letterVariants: Variants = {
    hidden: { y: 100, opacity: 0 },
    visible: (i: number) => ({
      y: 0, opacity: 1,
      transition: { duration: 0.6, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }
    }),
  };

  const word1 = "DEPLOY";
  const word2 = "AGENTS";

  return (
    <footer className={isHome ? "panel theme-dark" : "footer-static theme-dark"}>
      <div className="footer-layout">
        <motion.div
          className="mono partnership-label"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 0.5, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          INITIALIZE PARTNERSHIP
        </motion.div>

        {/* Split text mega link */}
        <motion.a
          href="https://contact.godwinausten.org"
          className="mega-link"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span style={{ display: "flex", justifyContent: "center", overflow: "hidden" }}>
            {word1.split("").map((char, i) => (
              <motion.span key={`d-${i}`} custom={i} variants={letterVariants} style={{ display: "inline-block" }}>
                {char}
              </motion.span>
            ))}
          </span>
          <span style={{ display: "flex", justifyContent: "center", overflow: "hidden" }}>
            {word2.split("").map((char, i) => (
              <motion.span key={`a-${i}`} custom={i + word1.length} variants={letterVariants} style={{ display: "inline-block" }}>
                {char}
              </motion.span>
            ))}
          </span>
        </motion.a>

        <motion.div
          style={{ marginBottom: "2rem" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <MagneticButton href="https://contact.godwinausten.org" className="cta-button cta-button-filled">
            <span>Get Started</span>
            <span className="cta-arrow">→</span>
          </MagneticButton>
        </motion.div>

        <motion.div
          className="footer-info mono"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <a href="mailto:TEAM@GODWINAUSTEN.ORG" className="email-link">
            TEAM@GODWINAUSTEN.ORG
          </a>
          <span className="location">LAHORE, PK</span>
        </motion.div>
      </div>

      <style jsx>{`
        .footer-static {
          padding: 120px 0;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          border-top: 1px solid var(--glass-border);
        }
        .footer-layout {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 2;
        }
        .partnership-label {
          margin-bottom: 2rem;
          color: #F2F0EB;
          opacity: 0.5;
        }
        .footer-info {
          display: flex;
          gap: 2rem;
          margin-top: 2rem;
          opacity: 0.6;
          justify-content: center;
          flex-wrap: wrap;
        }
        .email-link {
          color: #F2F0EB;
          text-decoration: none;
          transition: 0.3s;
        }
        .email-link:hover {
          color: var(--accent-pop);
        }
        @media (max-width: 768px) {
          .footer-info {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </footer>
  );
}
