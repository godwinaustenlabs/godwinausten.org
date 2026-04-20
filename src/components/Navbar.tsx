"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="ui-layer">
      <nav className={`nav-top ${isHome ? "is-home" : ""}`}>
        <div className="logo cursor-pointer px-4 py-2">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", color: "#1A1A1A", textDecoration: "none" }}>
            <svg className="nav-logo-svg" viewBox="0 0 100 100">
              <path d="M 20 55 L 50 25 L 80 55" />
              <path d="M 30 75 L 70 75" />
            </svg>
            GODWIN AUSTEN LABS
          </Link>
        </div>
        <div className="nav-links" style={{ display: "flex", gap: "40px", alignItems: "center", fontFamily: "'Space Mono', monospace", pointerEvents: "auto" }}>
          <Link href="/about" className="nav-link-item">
            ABOUT
          </Link>
          <Link href="/about-ceo" className="nav-link-item">
            CEO
          </Link>
          <Link href="/privacy-policy" className="nav-privacy-btn">
            PRIVACY
          </Link>
        </div>
      </nav>

      <style jsx>{`
        .nav-link-item {
          color: #1A1A1A;
          text-decoration: none;
          font-size: 13px;
          letter-spacing: 0.1em;
          transition: all 0.3s ease;
          position: relative;
          padding: 8px 0;
        }
        .nav-link-item:hover {
          color: var(--accent-pop);
        }
        .nav-link-item::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--accent-pop);
          transition: width 0.3s ease;
        }
        .nav-link-item:hover::after {
          width: 100%;
        }
        .nav-privacy-btn {
          color: #1A1A1A;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 24px;
          border: 2px solid #1A1A1A;
          border-radius: 100px;
          background: transparent;
          transition: all 0.3s ease;
        }
        .nav-privacy-btn:hover {
          background: var(--accent-pop);
          color: #1A1A1A;
          border-color: var(--accent-pop);
          box-shadow: 0 0 20px rgba(255, 221, 0, 0.3);
        }
        @media (max-width: 768px) {
          .nav-links {
            gap: 15px !important;
            font-size: 10px !important;
          }
          .nav-privacy-btn {
            padding: 8px 16px;
            font-size: 10px;
          }
        }
      `}</style>
      <style jsx global>{`
        .nav-top.is-home {
          background: transparent !important;
          backdrop-filter: none !important;
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
}
