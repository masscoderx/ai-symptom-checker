import { useState, useRef, useEffect } from "react";
import axios from "axios";
import UrgencyBadge from "./UrgencyBadge";
import { generatePDF } from "./reportGenerator";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 rounded-2xl rounded-bl-none w-fit max-w-xs">
      <span className="text-gray-400 text-sm">MediBot is thinking</span>
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
    </div>
  );
}

export default function ChatWindow({ age, gender, quickSymptoms }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm MediBot 👋 Tell me what symptoms you're experiencing and I'll help you understand what might be going on.",
      meta: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastMeta, setLastMeta] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    const newMessages = [
      ...messages,
      { role: "user", content: userText, meta: null },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const payload = {
        messages: newMessages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.content })),
        patient_age: age ? parseInt(age) : null,
        patient_gender: gender || null,
      };

      const res = await axios.post(`${API_URL}/chat`, payload);
      const data = res.data;

      setLastMeta(data);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          meta: data,
        },
      ]);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errMsg =
        typeof detail === "string"
          ? detail
          : typeof detail === "object"
          ? JSON.stringify(detail)
          : err.message || "Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠ Error: ${errMsg}`,
          meta: null,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🩺</span>
          <div>
            <h1 className="text-white font-bold text-xl">MediBot</h1>
            <p className="text-gray-400 text-xs">AI Symptom Checker</p>
          </div>
        </div>
        {lastMeta && (
          <button
            onClick={() => generatePDF(messages, lastMeta, { age, gender })}
            className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            📄 Export PDF
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto mb-4 min-h-0 max-h-[65vh] pr-1">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-800 text-gray-100 rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Triage result card */}
              {msg.meta && (
                <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                  <UrgencyBadge urgency={msg.meta.urgency} color={msg.meta.urgency_color} />

                  {msg.meta.conditions?.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-xs font-semibold mb-1">
                        Possible conditions:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {msg.meta.conditions.map((c, i) => (
                          <span
                            key={i}
                            className="bg-gray-700 text-gray-200 text-xs px-2 py-0.5 rounded-full"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.meta.action && (
                    <div className="bg-gray-700/50 rounded-lg px-3 py-2">
                      <p className="text-gray-300 text-xs">
                        <span className="font-semibold text-white">Recommended: </span>
                        {msg.meta.action}
                      </p>
                    </div>
                  )}

                  <p className="text-gray-500 text-xs italic">{msg.meta.disclaimer}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick symptom chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {quickSymptoms.slice(0, 7).map((s) => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            disabled={loading}
            className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          ref={inputRef}
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your symptoms... (e.g. I have a bad headache and fever since yesterday)"
          disabled={loading}
          className="flex-1 bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-blue-500 placeholder-gray-500 disabled:opacity-60"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-4 rounded-xl font-semibold transition-colors self-stretch"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
