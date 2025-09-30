// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip
} from "recharts";

export default function SDG15Page() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sdgs15")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

  // Ringkasan untuk cards
  const summary = {
    tepiHutan: data.filter((d) =>
      String(d["Lokasi wilayah desa/kelurahan terhadap kawasan hutan/hutan"]).includes("tepi")
    ).length,
    luarHutan: data.filter((d) =>
      String(d["Lokasi wilayah desa/kelurahan terhadap kawasan hutan/hutan"]).includes("luar")
    ).length,
    adaPenanaman: data.filter((d) =>
      String(d["Penanaman/pemeliharaan pepohonan di lahan kritis, penanaman mangrove, dan sejenisnya oleh masyarakat desa/kelurahan"]).includes("Ada")
    ).length,
  };

  // Tooltip custom
  const CustomTooltipPie = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const category = payload[0].name;
      const key = payload[0].payload.key;
      const desaList = data
        .filter((row) => String(row[key]).trim() === category)
        .map((row) => row.nama_desa);

      return (
        <div className="bg-black/80 text-white p-2 rounded-lg text-sm max-w-xs">
          <p className="font-semibold">{category}</p>
          <p className="italic">Desa:</p>
          <ul className="list-disc list-inside">
            {desaList.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  // Generate pie chart per indikator
  const renderPieChart = (key: string) => {
    const counts: Record<string, number> = {};
    data.forEach((row) => {
      const val = String(row[key]).trim();
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
                        ? "#ef4444" // merah untuk "tidak ada"
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
        <h2 className="text-xl font-bold drop-shadow text-green-500">
          SDG 15: Ekosistem Daratan
        </h2>
        <p className="text-sm text-gray-200">
          Visualisasi: kondisi desa terhadap kawasan hutan, kebakaran hutan, penanaman pohon, dan program perhutanan
        </p>
      </div>

      {/* Cards Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Desa di Tepi Hutan</h4>
          <p className="text-xl font-bold text-green-400">{summary.tepiHutan}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Desa di Luar Hutan</h4>
          <p className="text-xl font-bold text-green-400">{summary.luarHutan}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Ada Penanaman Pohon</h4>
          <p className="text-xl font-bold text-green-400">{summary.adaPenanaman}</p>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Indikator Kehutanan & Lingkungan</h3>
        <div className="grid grid-cols-2 gap-6">
          {renderPieChart("Lokasi wilayah desa/kelurahan terhadap kawasan hutan/hutan")}
          {renderPieChart("Kejadian Kebakaran hutan dan lahan")}
          {renderPieChart("Penanaman/pemeliharaan pepohonan di lahan kritis, penanaman mangrove, dan sejenisnya oleh masyarakat desa/kelurahan")}
          {renderPieChart("Keberadaan Program perhutanan sosial")}
          {renderPieChart("Kepemilikan hutan milik desa")}
        </div>
      </div>
    </div>
  );
}

