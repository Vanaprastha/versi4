"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatbotPage() {
  const [q, setQ] = useState("");
  const [logs, setLogs] = useState<{ role: "user" | "assistant"; text: string }[]>([]);

  async function send() {
    if (!q.trim()) return;
    const user = { role: "user" as const, text: q };
    setLogs((l) => [...l, user]);
    setQ("");
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ q }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setLogs((l) => [
      ...l,
      { role: "assistant", text: data.answer ?? "(no answer)" },
    ]);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold drop-shadow-md">
        Chatbot LLM (SDGs Assistant)
      </h1>
      <div className="glass-4 p-3 rounded-2xl h-[60vh] overflow-y-auto space-y-2">
        <AnimatePresence>
          {logs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`p-2 rounded-xl ${
                m.role === "user" ? "bg-white/10" : "bg-emerald-600/20"
              }`}
            >
              <b>{m.role === "user" ? "Anda" : "Asisten"}:</b> {m.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 bg-transparent border border-white/20 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tanya indikator, target, progress..."
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          className="px-4 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 transition"
        >
          Kirim
        </button>
      </div>
    </div>
  );
}

