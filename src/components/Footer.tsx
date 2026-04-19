"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <footer
      className={isHome ? "panel theme-dark" : "footer-static theme-dark"}
    >
      <div className="footer-layout">
        <motion.div
          className="mono partnership-label"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }}
          viewport={{ once: true }}
        >
          INITIALIZE PARTNERSHIP
        </motion.div>
        <motion.a
          href="https://contact.godwinausten.org"
          className="mega-link"
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.3 },
          }}
          whileTap={{ scale: 0.95 }}
        >
          DEPLOY
          <br />
          AGENTS
        </motion.a>
        <div className="footer-info mono">
          <a href="mailto:TEAM@GODWINAUSTEN.ORG" className="email-link">
            TEAM@GODWINAUSTEN.ORG
          </a>
          <span className="location">LAHORE, PK</span>
        </div>
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
        .panel {
          /* panel styles are in globals.css for horizontal scroll */
        }
        .footer-layout {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .partnership-label {
          margin-bottom: 2rem;
          color: #fff;
          opacity: 0.5;
        }
        .footer-info {
          display: flex;
          gap: 2rem;
          margin-top: 4rem;
          opacity: 0.6;
          justify-content: center;
          flex-wrap: wrap;
        }
        .email-link {
          color: white;
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
