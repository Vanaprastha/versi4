"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const Scatter = dynamic(()=>import("./scatter"), { ssr:false });

export default function ClusteringPage() {
  const [k, setK] = useState(3);
  return (
    <div className="space-y-4">
      <h1 className="text-xl text-gray-900 font-semibold drop-shadow-md">Clustering Wilayah</h1>
      <div className="glass-4 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <label className="text-sm">Jumlah Klaster (k):</label>
        <input type="number" className="bg-transparent border border-white/20 rounded-xl p-2 w-24" value={k} onChange={e=>setK(+e.target.value)} />
        <button className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20">Proses</button>
      </div>
      <div className="glass-4 p-4 rounded-2xl">
        <Scatter />
      </div>
    </div>
  );
}
