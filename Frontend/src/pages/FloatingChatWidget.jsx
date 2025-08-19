import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { MdChatBubble } from "react-icons/md";

export default function FloatingChatWidget() {
  const [typingDots, setTypingDots] = useState("");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I am Scrap Saathi's assistant. How can I help you?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Responsive CSS for mobile
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media (max-width: 600px) {
        .chatbox-float {
          width: 98vw !important;
          right: 1vw !important;
          left: 1vw !important;
          bottom: 1vh !important;
          max-width: 98vw !important;
          max-height: 85vh !important;
        }
        .chatbutton-float {
          width: 48px !important;
          height: 48px !important;
          right: 2vw !important;
          bottom: 2vh !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Typing dots animation
  useEffect(() => {
    if (!loading) {
      setTypingDots("");
      return;
    }
    const interval = setInterval(() => {
      setTypingDots(prev => (prev.length < 3 ? prev + "." : ""));
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (open) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages(msgs => [...msgs, userMsg]);
    setLoading(true);
    setInput("");

    const userQueries = messages
      .filter(m => m.sender === "user")
      .map(m => m.text)
      .slice(-2);

    const prevQueries = [...userQueries, input].slice(-2);

    const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8001";
    console.log("[ChatWidget] Sending to:", backendURL, "with", {
      query: input,
      prev_queries: prevQueries
    });

    try {
      console.log("[ChatWidget] Fetching:", `${backendURL}/chat`);
      const res = await fetch(`${backendURL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: input,
          prev_queries: prevQueries
        })
      });
      console.log("[ChatWidget] Fetch response status:", res.status);
      if (!res.ok) {
        throw new Error("Fetch failed with status: " + res.status);
      }
      const data = await res.json();
      console.log("[ChatWidget] Response data:", data);
      setMessages(msgs => [
        ...msgs,
        { sender: "bot", text: data.answer }
      ]);
    } catch (err) {
      console.error("[ChatWidget] Fetch error:", err);
      setMessages(msgs => [
        ...msgs,
        { sender: "bot", text: "Sorry, there was an error. Please try again." }
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      {!open && (
        <button
          className="chatbutton-float"
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgb(14 176 101)",
            color: "#fff",
            border: "none",
            boxShadow: "rgb(3 25 18 / 68%) 0px 2px 8px",
            fontSize: 32,
            cursor: "pointer",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          aria-label="Open chat"
        >
          <MdChatBubble size={32} />
        </button>
      )}

      {open && (
        <div
          className="chatbox-float"
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            width: 350,
            maxHeight: 500,
            background: "#fafbfc",
            border: "1px solid #ddd",
            borderRadius: 12,
            boxShadow: "0 2px 16px #aaa",
            display: "flex",
            flexDirection: "column",
            zIndex: 1001
          }}
        >
          <div style={{
            padding: "10px 16px",
            background: "rgb(14 165 42)",
            color: "#fff",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>Scrap Saathi Assistant</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 22,
                cursor: "pointer"
              }}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: 12,
            display: "flex",
            flexDirection: "column"
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  background: msg.sender === "user" ? "#d1e7dd" : "#e9ecef",
                  color: "#222",
                  borderRadius: 16,
                  padding: "10px 16px",
                  margin: "4px 0",
                  maxWidth: "80%",
                  whiteSpace: "pre-wrap",
                  fontFamily: "system-ui, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji, sans-serif"
                }}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: "flex-start",
                background: "#e9ecef",
                borderRadius: 16,
                padding: "10px 16px",
                margin: "4px 0",
                color: "#888"
              }}>
                Typing{typingDots}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ display: "flex", borderTop: "1px solid #eee", padding: 8 }}>
            <textarea
              rows={2}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              style={{
                flex: 1,
                resize: "none",
                borderRadius: 8,
                border: "1px solid #ccc",
                padding: 8
              }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                marginLeft: 8,
                padding: "0 18px",
                borderRadius: 8,
                border: "none",
                background: "rgb(14 165 42)",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
