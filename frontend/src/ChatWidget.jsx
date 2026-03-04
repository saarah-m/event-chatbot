import { useState, useEffect, useRef } from "react";

const SESSION_ID = Math.random().toString(36).slice(2);

const SUGGESTIONS = [
  "How many 72\" round tables fit in a 40×60 ft room?",
  "What's the guest capacity for theater style in 2400 sq ft?",
  "Compare classroom vs banquet setup for 50 guests",
];

function TypingIndicator() {
  return (
    <div style={styles.typingWrapper}>
      <div style={styles.typingBubble}>
        <span style={{ ...styles.dot, animationDelay: "0ms" }} />
        <span style={{ ...styles.dot, animationDelay: "180ms" }} />
        <span style={{ ...styles.dot, animationDelay: "360ms" }} />
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ ...styles.messageRow, justifyContent: isUser ? "flex-end" : "flex-start" }}>
      {!isUser && (
        <div style={styles.avatar}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div style={{
        ...styles.bubble,
        ...(isUser ? styles.userBubble : styles.assistantBubble),
      }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome! I'm your event planning assistant. Tell me your room dimensions and the type of setup you're considering, and I'll calculate exactly how many guests you can accommodate.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    const message = text || input.trim();
    if (!message) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId: SESSION_ID }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't reach the server. Please check that the backend is running." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.page} className="chat-page">
        {/* Background texture */}
        <div style={styles.bgGradient} />

        <div style={styles.container} className="chat-container">
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.logoMark}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div style={styles.headerTitle}>Event Space Assistant</div>
                <div style={styles.headerSubtitle}>Capacity & Layout Calculator</div>
              </div>
            </div>
            <div style={styles.statusPill}>
              <div style={styles.statusDot} />
              Online
            </div>
          </div>

          {/* Messages */}
          <div style={styles.messagesArea}>
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — only show before any user message */}
          {messages.filter((m) => m.role === "user").length === 0 && (
            <div style={styles.suggestions}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} style={styles.suggestionBtn} onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={styles.inputRow}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your room and setup..."
              style={styles.textarea}
              rows={1}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                ...styles.sendBtn,
                opacity: !input.trim() || loading ? 0.4 : 1,
                cursor: !input.trim() || loading ? "not-allowed" : "pointer",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"
                  stroke="#0B1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div style={styles.footer}>Press Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = {
  page: {
    height: "100vh",
    width: "100%",
    background: "#0B1628",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
  },
  bgGradient: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.05) 0%, transparent 50%)",
    pointerEvents: "none",
  },
  container: {
    width: "100%",
    maxWidth: "680px",
    height: "calc(100vh - 48px)",
    maxHeight: "860px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(201,168,76,0.2)",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backdropFilter: "blur(12px)",
    boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.1)",
    animation: "fadeSlideIn 0.5s ease forwards",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid rgba(201,168,76,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(201,168,76,0.04)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoMark: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "rgba(201,168,76,0.1)",
    border: "1px solid rgba(201,168,76,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#F0E6C8",
    fontSize: "15px",
    fontWeight: "600",
    letterSpacing: "0.02em",
  },
  headerSubtitle: {
    color: "rgba(201,168,76,0.7)",
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginTop: "2px",
  },
  statusPill: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(34,197,94,0.08)",
    border: "1px solid rgba(34,197,94,0.2)",
    borderRadius: "20px",
    padding: "4px 10px",
    fontSize: "11px",
    color: "rgba(134,239,172,0.9)",
    letterSpacing: "0.05em",
  },
  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#4ade80",
    animation: "pulse 2s infinite",
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    animation: "messageIn 0.3s ease forwards",
  },
  avatar: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    background: "rgba(201,168,76,0.08)",
    border: "1px solid rgba(201,168,76,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "75%",
    padding: "12px 16px",
    borderRadius: "14px",
    fontSize: "14px",
    lineHeight: "1.6",
    letterSpacing: "0.01em",
  },
  userBubble: {
    background: "linear-gradient(135deg, #C9A84C, #A8863C)",
    color: "#0B1628",
    borderBottomRightRadius: "4px",
    fontFamily: "'Georgia', serif",
    fontWeight: "500",
  },
  assistantBubble: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(201,168,76,0.15)",
    color: "#E8DFC8",
    borderBottomLeftRadius: "4px",
  },
  typingWrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
  },
  typingBubble: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(201,168,76,0.15)",
    borderRadius: "14px",
    borderBottomLeftRadius: "4px",
    padding: "14px 18px",
    display: "flex",
    gap: "5px",
    alignItems: "center",
  },
  dot: {
    display: "inline-block",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#C9A84C",
    animation: "dotBounce 1.2s infinite ease-in-out",
  },
  suggestions: {
    padding: "0 24px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  suggestionBtn: {
    background: "rgba(201,168,76,0.06)",
    border: "1px solid rgba(201,168,76,0.2)",
    borderRadius: "10px",
    color: "rgba(201,168,76,0.85)",
    fontSize: "12.5px",
    padding: "10px 14px",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'Georgia', serif",
    letterSpacing: "0.01em",
  },
  inputRow: {
    padding: "16px 20px",
    borderTop: "1px solid rgba(201,168,76,0.12)",
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
    background: "rgba(0,0,0,0.2)",
  },
  textarea: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(201,168,76,0.2)",
    borderRadius: "10px",
    color: "#F0E6C8",
    fontSize: "14px",
    padding: "12px 14px",
    resize: "none",
    outline: "none",
    fontFamily: "'Georgia', serif",
    lineHeight: "1.5",
    transition: "border-color 0.2s",
  },
  sendBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #C9A84C, #A8863C)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    flexShrink: 0,
  },
  footer: {
    textAlign: "center",
    fontSize: "10.5px",
    color: "rgba(201,168,76,0.3)",
    padding: "8px",
    letterSpacing: "0.05em",
  },
};

const keyframes = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root {
    height: 100%;
    width: 100%;
    overflow-x: hidden;
  }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes messageIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dotBounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40%           { transform: translateY(-6px); opacity: 1; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  textarea:focus {
    border-color: rgba(201,168,76,0.5) !important;
  }
  textarea::placeholder {
    color: rgba(201,168,76,0.3);
  }
  button[style*="cursor: pointer"]:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(201,168,76,0.3);
  }

  /* ── Responsive breakpoints ── */

  /* Large screens: centered card with breathing room */
  @media (min-width: 900px) {
    .chat-page    { padding: 40px !important; }
    .chat-container {
      max-width: 760px !important;
      height: calc(100vh - 80px) !important;
      max-height: 860px !important;
    }
  }

  /* Medium screens: comfortable full-height card */
  @media (min-width: 600px) and (max-width: 899px) {
    .chat-page    { padding: 24px !important; align-items: flex-start !important; }
    .chat-container {
      max-width: 100% !important;
      height: calc(100vh - 48px) !important;
    }
  }

  /* Mobile: edge-to-edge, full height */
  @media (max-width: 599px) {
    .chat-page {
      padding: 0 !important;
      align-items: flex-start !important;
    }
    .chat-container {
      max-width: 100% !important;
      width: 100% !important;
      height: 100vh !important;
      border-radius: 0 !important;
      border-left: none !important;
      border-right: none !important;
    }
  }
`;