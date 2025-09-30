"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; text: string };

export default function ChatbotPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<Msg[]>([
    { role: "assistant", text: "Halo! Saya chatbot SDGs. Tanyakan apa saja tentang data SDGs 1–17. 🚀" },
  ]);

  // Ref untuk auto-scroll
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, loading]);

  async function send() {
    if (!q.trim()) return;
    const user = { role: "user" as const, text: q };
    setLogs((l) => [...l, user]);
    setQ("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ q }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      const text = data?.answer || data?.error || "Maaf, terjadi kesalahan.";
      setLogs((l) => [...l, { role: "assistant", text }]);
    } catch {
      setLogs((l) => [...l, { role: "assistant", text: "Gagal menghubungi server." }]);
    } finally {
      setLoading(false);
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") send();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center text-blue-700 drop-shadow-md">
        💬 Chatbot SDGs
      </h1>
      <p className="text-center text-gray-600">
        Tanyakan apa saja tentang data SDGs 1–17.
      </p>

      {/* Chat Window */}
      <div className="glass-4 border rounded-2xl shadow-md p-4 h-[60vh] overflow-y-auto bg-gradient-to-b from-white/90 to-blue-50/50 backdrop-blur space-y-3">
        <AnimatePresence>
          {logs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-lg break-words prose prose-sm ${
                  m.role === "user"
                    ? "bg-blue-600 text-white self-end"
                    : "bg-green-100 text-green-900"
                }`}
              >
                <b>{m.role === "user" ? "Kamu" : "Asisten"}:</b>{" "}
                {/* @ts-expect-error react-markdown typing issue */}
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="text-gray-500 italic animate-pulse">Asisten mengetik…</div>
        )}
        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input Box */}
      <div className="flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Contoh: Desa mana yang punya angka tertinggi di SDG 1?"
          className="flex-1 border rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-transparent"
        />
        <button
          onClick={send}
          disabled={loading}
          className="px-6 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 transition text-white font-medium shadow disabled:opacity-50"
        >
          Kirim
        </button>
      </div>

      <p className="text-sm text-gray-600 text-center">
        💡 Tips: Sertakan nomor SDG di pertanyaanmu <br /> (mis.{" "}
        <span className="font-semibold">"SDG 3"</span> atau{" "}
        <span className="font-semibold">"SDG 1 dan 2"</span>) agar bot tahu tabel mana yang harus diambil.
      </p>
    </div>
  );
}

