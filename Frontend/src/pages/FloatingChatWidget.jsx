import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const QUICK_QUESTIONS = [
  "What is today's iron and newspaper rate?",
  "How does doorstep pickup work?",
  "Which cities do you serve?",
  "How do digital weighing & UPI payouts work?",
];

export default function FloatingChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hello! I am **ScrapSaathi's AI Assistant**. Ask me anything about scrap rates, doorstep pickup booking, or recycling categories!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = async (customQuery = null) => {
    const queryText = (customQuery || input).trim();
    if (!queryText || loading) return;

    const userMsg = { sender: "user", text: queryText };
    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInput("");
    setLoading(true);

    const prevQueries = messages
      .filter((m) => m.sender === "user")
      .map((m) => m.text)
      .slice(-2);

    const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8001";

    try {
      const controller = new AbortController();
      // 30s timeout matching LLM generation latency (Caveat #13)
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(`${backendURL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          query: queryText,
          prev_queries: [...prevQueries, queryText].slice(-2),
        }),
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Chat API responded with status ${res.status}`);
      }

      const data = await res.json();
      const botResponse = data.answer || data.reply || data.response || "I am glad to help with your scrap queries!";
      setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    } catch {
      // Graceful conversational fallback with direct links when AI server is unreachable
      let fallbackText = "Our AI knowledge base is currently being updated for live rates. In the meantime:\n\n";
      const lower = queryText.toLowerCase();

      if (lower.includes("rate") || lower.includes("price") || lower.includes("iron") || lower.includes("paper")) {
        fallbackText += "📊 **Live Scrap Rates:** Check our updated daily price board at [/rates](/rates).\n- Iron: ~₹28-32/kg\n- Newspaper: ~₹14-16/kg\n- Cardboard: ~₹10-12/kg\n- Copper: ~₹680-720/kg";
      } else if (lower.includes("pickup") || lower.includes("book") || lower.includes("sell")) {
        fallbackText += "🚚 **Doorstep Pickup:** You can schedule a verified collector anytime at [/sellWaste](/sellWaste). Select your scrap types, choose a date & time slot, and get paid instantly upon pickup.";
      } else if (lower.includes("city") || lower.includes("location") || lower.includes("where")) {
        fallbackText += "📍 **Service Locations:** We currently operate across Delhi NCR (Noida, Ghaziabad, Gurgaon, Greater Noida) and Bengaluru.";
      } else {
        fallbackText += "You can explore live pricing at [/rates](/rates), book a doorstep collector at [/sellWaste](/sellWaste), or contact our team via WhatsApp for instant support.";
      }

      setMessages((prev) => [...prev, { sender: "bot", text: fallbackText }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="z-50 select-none">
      {/* Floating Launcher Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group z-50 cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            boxShadow: "0 8px 30px rgba(16, 185, 129, 0.45)",
          }}
          aria-label="Open ScrapSaathi Assistant"
        >
          <ChatBubbleLeftRightIcon className="w-7 h-7 transition-transform group-hover:rotate-6" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
        </button>
      )}

      {/* Floating Chat Modal */}
      {open && (
        <div
          className="fixed bottom-4 sm:bottom-6 right-2 sm:right-6 w-[calc(100vw-16px)] sm:w-[390px] h-[550px] max-h-[85vh] rounded-3xl flex flex-col overflow-hidden z-50 shadow-2xl border border-slate-700/60 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
          style={{
            background: "rgba(10, 16, 30, 0.95)",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(16, 185, 129, 0.15)",
          }}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg">
                ♻️
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight leading-none">
                  ScrapSaathi Assistant
                </h3>
                <p className="text-[11px] text-emerald-100/90 font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Instant scrap & pricing guide
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-600/20"
                      : "bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none prose prose-invert prose-xs"
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <Link
                          to={props.href}
                          className="text-emerald-300 font-bold underline hover:text-emerald-200"
                        >
                          {props.children}
                        </Link>
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 bg-slate-800/70 border border-slate-700/50 w-fit px-3 py-2 rounded-2xl rounded-bl-none text-xs">
                <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Checking rates & info...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions pills */}
          {messages.length <= 2 && (
            <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-none">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700/60 text-[11px] font-medium transition-colors shrink-0 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input box */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex items-center gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about scrap rates, pickup, etc..."
              disabled={loading}
              className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none transition-colors"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-md shadow-emerald-500/20 shrink-0"
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
