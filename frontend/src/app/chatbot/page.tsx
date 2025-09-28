"use client";

import { useState } from "react";

type Msg = { role: "user" | "bot"; text: string };

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Halo! Saya chatbot SDGs. Tanyakan apa saja tentang data SDGs 1–17. 🚀" }
  ]);

  const send = async () => {
    const q = input.trim();
    if (!q) return;
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q })
      });
      const data = await res.json();
      const text = data?.answer || data?.error || "Maaf, terjadi kesalahan.";
      setMessages(prev => [...prev, { role: "bot", text }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "bot", text: "Gagal menghubungi server." }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") send();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">💬 Chatbot SDGs (Gemini)</h1>

      <div className="border rounded-lg p-4 h-96 overflow-y-auto bg-white/60 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-blue-700" : "text-green-700"}>
            <b>{m.role === "user" ? "Kamu" : "Bot"}:</b> {m.text}
          </div>
        ))}
        {loading && <div className="text-gray-500">Mengetik…</div>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Contoh: Tunjukkan desa dengan angka tertinggi di SDG 1"
          className="flex-1 border rounded p-2"
        />
        <button
          onClick={send}
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          Kirim
        </button>
      </div>

      <p className="text-sm text-gray-600">
        Tips: Tulis nomor SDG di pertanyaanmu (mis. "SDG 3" atau "SDG 1 dan 2") agar bot mengambil tabel yang tepat.
      </p>
    </div>
  );
}
