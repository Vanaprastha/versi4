"use client";
import { useState } from "react";

export default function UploadCSVPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"predict"|"cluster">("predict");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const endpoint = mode === "predict" ? "/predict" : "/cluster";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      setResult(data);
    } catch (err:any) {
      setResult({ error: err?.message || "Upload gagal" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold drop-shadow-md">Upload CSV untuk {mode === "predict" ? "Prediksi" : "Clustering"}</h1>
      <form onSubmit={handleSubmit} className="glass-4 p-4 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e)=>setFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
          <select value={mode} onChange={(e)=>setMode(e.target.value as any)}
            className="bg-black text-white border border-white/20 rounded-lg px-2 py-2 text-sm">
            <option value="predict">Prediksi</option>
            <option value="cluster">Clustering</option>
          </select>
          <button
            type="submit"
            disabled={!file || loading}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition disabled:opacity-50 text-sm"
          >
            {loading ? "Memproses..." : "Kirim"}
          </button>
        </div>
        <p className="text-xs text-neutral-400">
          Pastikan kolom CSV sama persis dengan skema model. Atur URL backend via <code>NEXT_PUBLIC_API_BASE_URL</code>.
        </p>
      </form>

      {result && (
        <pre className="glass-4 p-4 rounded-2xl text-xs overflow-auto whitespace-pre-wrap">
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
