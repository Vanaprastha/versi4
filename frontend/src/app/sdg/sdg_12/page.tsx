// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip
} from "recharts";

export default function SDG12Page() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sdgs12")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6"];

  // Ringkasan Cards
  const summary = {
    daurUlang: data.filter(
      (d) =>
        d["Kegiatan Pengolahan/daur ulang sampah/limbah (reuse, recycle) oleh masyarakat desa/kelurahan"] === "Ada"
    ).length,
    bankSampah: data.filter((d) => d["status keberadaan bank sampah di desa/kelurahan:"] === "ada").length,
    pemilahan: data.filter(
      (d) => d["Partisipasi Pemilahan sampah membusuk dan sampah kering:"] !== "Tidak ada"
    ).length,
    pengangkutan: data.filter(
      (d) => d["Frekuensi pengangkutan sampah dalam 1 minggu"] !== "tidak ada pengangkutan sampah"
    ).length,
  };

  // Tooltip custom untuk Pie Chart
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

  // Fungsi untuk render pie chart
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
        <h2 className="text-xl font-bold drop-shadow text-yellow-500">
          SDG 12: Konsumsi dan Produksi yang Bertanggung Jawab
        </h2>
        <p className="text-sm text-gray-200">
          Visualisasi: Daur ulang sampah, bank sampah, pemilahan, tempat buang sampah, dan frekuensi pengangkutan
        </p>
      </div>

      {/* Cards Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Daur Ulang Sampah (Ada)</h4>
          <p className="text-xl font-bold text-yellow-400">{summary.daurUlang}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Bank Sampah (Ada)</h4>
          <p className="text-xl font-bold text-yellow-400">{summary.bankSampah}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Pemilahan Sampah</h4>
          <p className="text-xl font-bold text-yellow-400">{summary.pemilahan}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Pengangkutan (Ada)</h4>
          <p className="text-xl font-bold text-yellow-400">{summary.pengangkutan}</p>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Indikator Pengelolaan Sampah</h3>
        <div className="grid grid-cols-2 gap-6">
          {renderPieChart("Kegiatan Pengolahan/daur ulang sampah/limbah (reuse, recycle) oleh masyarakat desa/kelurahan")}
          {renderPieChart("status keberadaan bank sampah di desa/kelurahan:")}
          {renderPieChart("Partisipasi Pemilahan sampah membusuk dan sampah kering:")}
          {renderPieChart("Tempat buang sampah sebagian besar keluarga")}
          {renderPieChart("Frekuensi pengangkutan sampah dalam 1 minggu")}
        </div>
      </div>
    </div>
  );
}

