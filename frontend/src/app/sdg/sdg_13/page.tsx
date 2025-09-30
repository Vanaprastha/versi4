// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip
} from "recharts";

export default function SDG13Page() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sdgs13")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6"];

  // Ringkasan
  const summary = {
    proklim: data.filter(
      (d) => d["Status desa termasuk Program Kampung Iklim (Proklim)"] !== "tidak termasuk"
    ).length,
    banjir: data.filter(
      (d) => d["status Kejadian bencana alam banjir"] !== "tidak ada kejadian"
    ).length,
    kekeringan: data.filter(
      (d) => d["status Kejadian bencana alam kekeringan"] !== "tidak ada kejadian"
    ).length,
    peringatan: data.filter(
      (d) => d["Fasilitas sistem peringatan dini bencana alam"] === "ada"
    ).length,
    simulasi: data.filter(
      (d) => d["Partisipasi_Simulasi_Bencana"] !== "Tidak ada warga"
    ).length,
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
            {desaList.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  // Render Pie Chart per indikator
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
        <h2 className="text-xl font-bold drop-shadow text-green-500">
          SDG 13: Penanganan Perubahan Iklim
        </h2>
        <p className="text-sm text-gray-200">
          Visualisasi: Proklim, kejadian bencana, fasilitas peringatan dini, dan partisipasi simulasi bencana
        </p>
      </div>

      {/* Cards Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Desa Proklim</h4>
          <p className="text-xl font-bold text-green-400">{summary.proklim}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Kejadian Banjir</h4>
          <p className="text-xl font-bold text-green-400">{summary.banjir}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Kejadian Kekeringan</h4>
          <p className="text-xl font-bold text-green-400">{summary.kekeringan}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Peringatan Dini</h4>
          <p className="text-xl font-bold text-green-400">{summary.peringatan}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Simulasi Bencana</h4>
          <p className="text-xl font-bold text-green-400">{summary.simulasi}</p>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Indikator Perubahan Iklim & Bencana</h3>
        <div className="grid grid-cols-2 gap-6">
          {renderPieChart("Status desa termasuk Program Kampung Iklim (Proklim)")}
          {renderPieChart("status Kejadian bencana alam banjir")}
          {renderPieChart("status Kejadian bencana alam kekeringan")}
          {renderPieChart("Fasilitas sistem peringatan dini bencana alam")}
          {renderPieChart("Partisipasi_Simulasi_Bencana")}
        </div>
      </div>
    </div>
  );
}

