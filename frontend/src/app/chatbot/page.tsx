"use client";
import { useState } from "react";

export default function ChatbotPage() {
  const [q, setQ] = useState("");
  const [logs, setLogs] = useState<{role:"user"|"assistant", text:string}[]>([]);

  async function send() {
    if (!q.trim()) return;
    const user = { role:"user" as const, text: q };
    setLogs(l => [...l, user]);
    setQ("");
    const res = await fetch("/api/chat", { method:"POST", body: JSON.stringify({ q }), headers: { "Content-Type":"application/json" }});
    const data = await res.json();
    setLogs(l => [...l, { role:"assistant", text: data.answer ?? "(no answer)" }]);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold drop-shadow-md">Chatbot LLM (SDGs Assistant)</h1>
      <div className="glass-4 p-3 rounded-2xl h-[60vh] overflow-y-auto space-y-2">
        {logs.map((m,i)=>(
          <div key={i} className={`p-2 rounded-xl ${m.role==="user"?"bg-white/10":"bg-emerald-600/20"}`}>
            <b>{m.role==="user"?"Anda":"Asisten"}:</b> {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 bg-transparent border border-white/20 rounded-xl p-2" value={q} onChange={e=>setQ(e.target.value)} placeholder="Tanya indikator, target, progress..." />
        <button onClick={send} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">Kirim</button>
      </div>
    </div>
  );
}
