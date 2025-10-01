// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip
} from "recharts";

export default function SDG14Page() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sdgs14")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b"];

  // Ringkasan untuk cards
  const summary = {
    pesisir: data.filter((d) =>
      String(d["Ada wilayah desa/kelurahan yang berbatasan langsung dengan laut"]).includes("ada")
    ).length,
    perikanan: data.filter((d) =>
      String(d["Pemanfaatan laut untuk Perikanan tangkap (mencakup seluruh biota laut) "]).includes("ada")
    ).length,
    wisata: data.filter((d) =>
      String(d["Pemanfaatan laut untuk wisata bahari "]).includes("ada")
    ).length,
    tangguh: data.filter((d) =>
      String(d["Status desa termasuk Kampung Pesisir Tangguh "]).includes("termasuk")
    ).length,
  };

  // Tooltip custom untuk pie chart
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

  // Render pie chart per indikator
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
                        ? "#ef4444" // merah untuk "tidak"
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
        <h2 className="text-xl font-bold drop-shadow text-blue-500">
          SDG 14: Ekosistem Lautan
        </h2>
        <p className="text-sm text-gray-200">
          Visualisasi: desa pesisir, pemanfaatan laut (perikanan & wisata), dan status kampung tangguh pesisir
        </p>
      </div>

      {/* Cards Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Desa Pesisir</h4>
          <p className="text-xl font-bold text-blue-400">{summary.pesisir}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Perikanan Tangkap</h4>
          <p className="text-xl font-bold text-blue-400">{summary.perikanan}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Wisata Bahari</h4>
          <p className="text-xl font-bold text-blue-400">{summary.wisata}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Kampung Pesisir Tangguh</h4>
          <p className="text-xl font-bold text-blue-400">{summary.tangguh}</p>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Indikator Pesisir & Laut</h3>
        <div className="grid grid-cols-2 gap-6">
          {renderPieChart("Ada wilayah desa/kelurahan yang berbatasan langsung dengan laut")}
          {renderPieChart("Tempat buang sampah keluarga melalui Sungai/saluran irigasi/danau/laut ")}
          {renderPieChart("Pemanfaatan laut untuk Perikanan tangkap (mencakup seluruh biota laut) ")}
          {renderPieChart("Pemanfaatan laut untuk wisata bahari ")}
          {renderPieChart("Status desa termasuk Kampung Pesisir Tangguh ")}
        </div>
      </div>
    </div>
  );
}

