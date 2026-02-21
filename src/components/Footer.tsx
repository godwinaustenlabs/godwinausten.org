"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <footer className={isHome ? "panel theme-black" : "footer-static theme-black"}>
      <div className="footer-layout">
        <div className="mono partnership-label">
          INITIALIZE PARTNERSHIP
        </div>
        <a href="https://contact.godwinausten.org" className="mega-link">
          DEPLOY<br />AGENTS
        </a>
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
          .footer-info { flex-direction: column; gap: 1rem; }
        }
      `}</style>
    </footer>
  );
}
