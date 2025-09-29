"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "bot"; text: string };

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Halo! Saya chatbot SDGs. Tanyakan apa saja tentang data SDGs 1–17. 🚀",
    },
  ]);

  // Ref untuk auto-scroll
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const q = input.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      const text = data?.answer || data?.error || "Maaf, terjadi kesalahan.";
      setMessages((prev) => [...prev, { role: "bot", text }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Gagal menghubungi server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") send();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center text-blue-700">
        💬 Chatbot SDGs
      </h1>
      <p className="text-center text-gray-600">
        Tanyakan apa saja tentang data SDGs 1–17.
      </p>

      {/* Chat Window */}
      <div className="border rounded-2xl shadow-md p-4 h-96 overflow-y-auto bg-gradient-to-b from-white/90 to-blue-50/50 backdrop-blur space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-lg break-words prose prose-sm ${
                m.role === "user"
                  ? "bg-blue-600 text-white self-end"
                  : "bg-green-100 text-green-900"
              }`}
            >
              <b>{m.role === "user" ? "Kamu" : "Bot"}:</b>{" "}
              {/* @ts-expect-error react-markdown typing issue */}
              <ReactMarkdown>{m.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-gray-500 italic animate-pulse">Bot mengetik…</div>
        )}
        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input Box */}
      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Contoh: Desa mana yang punya angka tertinggi di SDG 1?"
          className="flex-1 border rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={send}
          disabled={loading}
          className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white font-medium shadow disabled:opacity-50"
        >
          Kirim
        </button>
      </div>

      <p className="text-sm text-gray-600 text-center">
        💡 Tips: Sertakan nomor SDG di pertanyaanmu <br /> (mis.{" "}
        <span className="font-semibold">"SDG 3"</span> atau{" "}
        <span className="font-semibold">"SDG 1 dan 2"</span>) agar bot tahu
        tabel mana yang harus diambil.
      </p>
    </div>
  );
}

