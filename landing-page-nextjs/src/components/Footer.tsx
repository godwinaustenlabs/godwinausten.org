"use client";

export default function Footer() {
  return (
    <section className="panel">
      <div className="footer-layout" style={{ textAlign: "center" }}>
        <div className="mono" style={{ marginBottom: "2rem", color: "#fff", opacity: 0.5 }}>
          INITIALIZE PARTNERSHIP
        </div>
        <a href="https://contact.godwinausten.org" className="mega-link">
          DEPLOY<br />AGENTS
        </a>
        <div style={{ display: "flex", gap: "2rem", marginTop: "4rem", fontFamily: "'Space Mono'", opacity: 0.6, justifyContent: "center" }}>
          <a href="mailto:TEAM@GODWINAUSTEN.ORG" style={{ color: "white", textDecoration: "none" }}>
            TEAM@GODWINAUSTEN.ORG
          </a>
          <span>LAHORE, PK</span>
        </div>
      </div>
    </section>
  );
}
