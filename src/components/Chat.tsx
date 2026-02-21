"use client";

import { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

const WORKER_URL = "https://chatswarm.galabs.workers.dev/website";

type Message = {
  text: string;
  type: "sm-bot" | "sm-user";
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Synchronizing with Nova Core. I am your lead architect. Which operational bottleneck shall we dissolve today?",
      type: "sm-bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [clientId, setClientId] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    // Generate simple UUID for session
    const id = crypto.randomUUID?.() || Math.random().toString(36).substring(2);
    setClientId(id);
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { text: userText, type: "sm-user" }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt: userText, clientID: clientId }),
      });

      if (!res.ok) throw new Error("Connection failed");

      const data = await res.json();
      let botReply = data.response || data.message || data;

      if (typeof botReply === "string") {
        if (botReply.startsWith('"') && botReply.endsWith('"')) {
          botReply = botReply.slice(1, -1);
        }
      } else {
        botReply = JSON.stringify(botReply);
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, { text: botReply, type: "sm-bot" }]);
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          text: "Error connecting to the swarm protocol. Plz try again.",
          type: "sm-bot",
        },
      ]);
    }
  }

  return (
    <section className="panel theme-dark">
      <div className="split-layout">
        {/* Left: Text */}
        <div className="split-left">
          <div className="pill">OPERATIONAL VOID</div>
          <h2 className="text-xl" style={{ marginBottom: "2rem" }}>
            The Command Center
          </h2>
          <p className="text-body">
            A direct interface to your autonomous workforce. Monitor every move
            of your Nova Swarm, intervene when human intuition is needed, or
            refine high-level operational protocols in real-time.
          </p>
        </div>

        {/* Right: Chatbot */}
        <div className="split-right">
          <div className="antigravity-zone">
            <div className="ag-floater ag-f1"></div>
            <div className="ag-floater ag-f2"></div>
            <div className="ag-floater ag-f3"></div>

            {/* SOFT BOT UI */}
            <div className="soft-bot-container">
              <div className="bot-header">
                <div className="bot-status">
                  <div className="bot-avatar">N</div>
                  <div className="bot-info">
                    <h3>Nova Core</h3>
                    <span>ONLINE</span>
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    maxWidth: "10px",
                    height: "10px",
                    background: "#0f0",
                    borderRadius: "50%",
                    boxShadow: "0 0 10px #0f0",
                  }}
                ></div>
              </div>

              <div className="bot-body" ref={chatBodyRef}>
                {isMounted && messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`soft-message ${msg.type}`}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(marked.parse(msg.text) as string),
                    }}
                  />
                ))}
                {isTyping && (
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                )}
              </div>

              <div className="bot-input-area">
                <div className="input-pill">
                  <input
                    type="text"
                    className="soft-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Enter command protocol..."
                    autoComplete="off"
                  />
                  <button className="soft-send-btn" onClick={sendMessage}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
