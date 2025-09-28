// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip
} from "recharts";

export default function SDG11Page() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sdgs11")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  // Warna kategori (merah untuk "tidak ada"/"tidak termasuk")
  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6"];

  // Ringkasan Cards
  const summary = {
    permukimanKumuh: data.filter((d) => d["Keberadaan permukiman kumuh (sanitasi lingkungan buruk, bangunan padat dan sebagian besar tidak layak huni)"] === "ada").length,
    sistemPeringatan: data.filter((d) => d["Sistem Peringatan Dini Bencana alam"] === "ada").length,
    rambuEvakuasi: data.filter((d) => d["Fasilitas Rambu–rambu dan jalur evakuasi bencana"] === "ada").length,
    desaTangguh: data.filter((d) => d["Status Desa Tangguh Bencana"] === "termasuk").length,
    programLingkungan: data.filter((d) => d["Keberadaan program pengelolaan lingkungan perumahan desa/kelurahan"] === "ada").length,
  };

  // Tooltip custom
  const CustomTooltipPie = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const category = payload[0].name;
      const key = payload[0].payload.key;
      const desaList = data
        .filter((row) => String(row[key]) === category)
        .map((row) => row.nama_desa);

      return (
        <div className="bg-black/80 text-white p-2 rounded-lg text-sm max-w-xs">
          <p className="font-semibold">{category}</p>
          <p className="italic">Desa:</p>
          <ul className="list-disc list-inside">
            {desaList.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      );
    }
    return null;
  };

  // Fungsi render Pie Chart per indikator
  const renderPieChart = (key: string) => {
    const counts: Record<string, number> = {};
    data.forEach((row) => {
      const val = String(row[key]);
      if (val) counts[val] = (counts[val] || 0) + 1;
    });
    const pieData = Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      key,
    }));

    return (
      <div className="glass-2 p-4 rounded-xl shadow">
        <h4 className="text-md font-semibold mb-4 text-center">{key}</h4>
        <div className="w-full h-72 flex justify-center">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {pieData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.name.toLowerCase().includes("tidak")
                        ? "#ef4444"
                        : COLORS[i % COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" layout="horizontal" align="center" />
              <Tooltip content={<CustomTooltipPie />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold drop-shadow text-amber-500">
          SDG 11: Kota dan Permukiman yang Berkelanjutan
        </h2>
        <p className="text-sm text-gray-200">
          Visualisasi sesuai indikator asli pada dataset.
        </p>
      </div>

      {/* Cards Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Permukiman Kumuh (ada)</h4>
          <p className="text-xl font-bold text-amber-400">{summary.permukimanKumuh}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Sistem Peringatan (ada)</h4>
          <p className="text-xl font-bold text-amber-400">{summary.sistemPeringatan}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Rambu Evakuasi (ada)</h4>
          <p className="text-xl font-bold text-amber-400">{summary.rambuEvakuasi}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Desa Tangguh (termasuk)</h4>
          <p className="text-xl font-bold text-amber-400">{summary.desaTangguh}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Program Lingkungan (ada)</h4>
          <p className="text-xl font-bold text-amber-400">{summary.programLingkungan}</p>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Indikator dari Dataset</h3>
        <div className="grid grid-cols-2 gap-6">
          {renderPieChart("Keberadaan permukiman kumuh (sanitasi lingkungan buruk, bangunan padat dan sebagian besar tidak layak huni)")}
          {renderPieChart("Sistem Peringatan Dini Bencana alam")}
          {renderPieChart("Fasilitas Rambu–rambu dan jalur evakuasi bencana")}
          {renderPieChart("Status Desa Tangguh Bencana")}
          {renderPieChart("Keberadaan program pengelolaan lingkungan perumahan desa/kelurahan")}
        </div>
      </div>
    </div>
  );
}

