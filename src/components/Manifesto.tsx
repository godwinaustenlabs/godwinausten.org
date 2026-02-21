"use client";

export default function Manifesto() {
  return (
    <section className="panel theme-lime" style={{ paddingLeft: "0px" }}>
      <div className="manifesto-card">
        <h2 className="text-xl" style={{ fontWeight: 400, lineHeight: 1.2 }}>
          "Stop hiring for roles that{" "}
          <span style={{ fontWeight: 800 }}>Software</span> can
          fill."
        </h2>
        <p
          className="text-body"
          style={{ marginTop: "2rem" }}
        >
          <strong>The Initiative.</strong> Automation is no longer about rigid
          scripts. It is about fluid intelligence. We architect bespoke AI
          ecosystems that live at the edge. Deployed via Cloudflare, our agents
          are stateless, indestructible, and hyper-aware of your business
          context. From the first handshake of lead qualification to the deep
          mechanics of aftersales support, we solve for outcomes.
        </p>
        <div
          className="mono"
          style={{ marginTop: "3rem", opacity: 0.5, fontSize: "0.8rem", fontWeight: "bold" }}
        >
          // GODWIN AUSTEN LABS
        </div>
      </div>
    </section>
  );
}
