"use client";

export default function Architecture() {
  return (
    <section className="panel">
      <div className="arch-grid">
        <div>
          <div className="pill">UNDER THE HOOD</div>
          <h2 className="text-xl">Edge AI.</h2>
          <p className="text-body" style={{ marginTop: "2rem" }}>
            Nova is built for the global edge. By deploying on Cloudflare, we
            eliminate the latency of traditional servers. Your intelligence is
            stateless, globally distributed, and instantly scalable.
          </p>
          <ul className="mono" style={{ marginTop: "2rem", listStyle: "none", color: "#888" }}>
            <li style={{ marginBottom: "1rem" }}>{">"} Stateless Execution: Infinite scalability without baggage</li>
            <li style={{ marginBottom: "1rem" }}>{">"} Edge Native Speed: Sub 10ms global responsiveness</li>
            <li style={{ marginBottom: "1rem" }}>{">"} Sovereign Intelligence: Agents that own their outcomes</li>
          </ul>
        </div>
        <div className="code-block">
          <div className="scan-line"></div>
          <span className="code-highlight">import</span> {"{ NovaSwarm } "}{" "}
          <span className="code-highlight">from</span> '@nova/core';
          <br />
          <br />
          <span className="code-highlight">const</span> agent ={" "}
          <span className="code-highlight">new</span> Agent({"{"}
          <br />
          &nbsp;&nbsp;role: 'Closer',
          <br />
          &nbsp;&nbsp;model: 'gpt-4o',
          <br />
          &nbsp;&nbsp;tools: [Stripe_API]
          <br />
          {"});"}
          <br />
        </div>
      </div>
    </section>
  );
}
