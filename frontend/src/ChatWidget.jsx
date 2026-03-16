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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
     const res = await fetch("/api/chat", {
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
        <div style={styles.container} className="chat-container">

          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.logoMark}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div style={styles.headerTitle}>EVENT Toolkit Assistant</div>
                <div style={styles.headerSubtitle}>SETS CALCULATOR · AI POWERED</div>
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
                <button key={i} style={styles.suggestionBtn}
                  onMouseEnter={e => e.currentTarget.style.background = "#FDFDE0"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                  onClick={() => sendMessage(s)}>
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
              onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.background = "#EEEE00" }}
              onMouseLeave={e => { if (input.trim() && !loading) e.currentTarget.style.background = "#F5F700" }}
              style={{
                ...styles.sendBtn,
                opacity: !input.trim() || loading ? 0.35 : 1,
                cursor: !input.trim() || loading ? "not-allowed" : "pointer",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"
                  stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
    background: "#F0F0EE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
  },
  container: {
    width: "100%",
    maxWidth: "680px",
    height: "calc(100vh - 48px)",
    maxHeight: "860px",
    background: "#FFFFFF",
    border: "1.5px solid #D0D0CC",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    animation: "fadeSlideIn 0.4s ease forwards",
  },
  header: {
    padding: "18px 24px",
    borderBottom: "1px solid #E8E8E4",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoMark: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "#F5F700",
    border: "1px solid #E0E000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerTitle: {
    color: "#111",
    fontSize: "14px",
    fontWeight: "700",
    letterSpacing: "0.01em",
  },
  headerSubtitle: {
    color: "#888",
    fontSize: "10px",
    fontWeight: "500",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginTop: "2px",
  },
  statusPill: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#F7F7F5",
    border: "1px solid #E0E0DC",
    borderRadius: "20px",
    padding: "4px 10px",
    fontSize: "11px",
    fontWeight: "500",
    color: "#555",
    letterSpacing: "0.04em",
  },
  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#22c55e",
    animation: "pulse 2s infinite",
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    background: "#FAFAF8",
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    animation: "messageIn 0.25s ease forwards",
  },
  avatar: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    background: "#F5F700",
    border: "1px solid #E0E000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "75%",
    padding: "11px 15px",
    fontSize: "14px",
    lineHeight: "1.6",
    letterSpacing: "0.01em",
  },
  userBubble: {
    background: "#1A1A1A",
    color: "#fff",
    borderRadius: "12px",
    fontWeight: "400",
    borderBottomRightRadius: "3px",
  },
  assistantBubble: {
    background: "#fff",
    border: "1px solid #E8E8E4",
    color: "#222",
    borderRadius: "12px",
    borderBottomLeftRadius: "3px",
  },
  typingWrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
  },
  typingBubble: {
    background: "#fff",
    border: "1px solid #E8E8E4",
    borderRadius: "12px",
    borderBottomLeftRadius: "3px",
    padding: "13px 16px",
    display: "flex",
    gap: "5px",
    alignItems: "center",
  },
  dot: {
    display: "inline-block",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#aaa",
    animation: "dotBounce 1.2s infinite ease-in-out",
  },
  suggestions: {
    padding: "12px 24px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    borderTop: "1px solid #EFEFEB",
    background: "#FAFAF8",
  },
  suggestionBtn: {
    background: "#fff",
    border: "1px solid #E0E0DC",
    borderRadius: "8px",
    color: "#333",
    fontSize: "12.5px",
    fontWeight: "400",
    padding: "10px 14px",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: "0.01em",
  },
  inputRow: {
    padding: "14px 18px",
    borderTop: "1px solid #E8E8E4",
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
    background: "#fff",
  },
  textarea: {
    flex: 1,
    background: "#F7F7F5",
    border: "1px solid #E0E0DC",
    borderRadius: "8px",
    color: "#111",
    fontSize: "14px",
    padding: "11px 13px",
    resize: "none",
    outline: "none",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    lineHeight: "1.5",
    transition: "border-color 0.15s",
  },
  sendBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "8px",
    background: "#F5F700",
    border: "1px solid #E0E000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s ease",
    flexShrink: 0,
  },
  footer: {
    textAlign: "center",
    fontSize: "10px",
    color: "#bbb",
    padding: "6px",
    letterSpacing: "0.04em",
    background: "#fff",
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
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes messageIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dotBounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
    40%           { transform: translateY(-5px); opacity: 1; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }
  textarea:focus {
    border-color: #000 !important;
    background: #fff !important;
  }
  textarea::placeholder {
    color: #aaa;
  }

  @media (min-width: 900px) {
    .chat-page    { padding: 40px !important; }
    .chat-container {
      max-width: 760px !important;
      height: calc(100vh - 80px) !important;
      max-height: 860px !important;
    }
  }
  @media (min-width: 600px) and (max-width: 899px) {
    .chat-page    { padding: 24px !important; align-items: flex-start !important; }
    .chat-container {
      max-width: 100% !important;
      height: calc(100vh - 48px) !important;
    }
  }
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
      box-shadow: none !important;
    }
  }
`;