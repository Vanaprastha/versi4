// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip
} from "recharts";

export default function SDG17Page() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sdgs17")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  // Hitung summary untuk cards
  const summary = {
    kerjasamaAntar: data.filter(d => d["Keberadaan kerjasama antar desa"] === "ada").length,
    kerjasamaPihak: data.filter(d => d["Keberadaan kerjasama desa dengan pihak ketiga"] === "ada").length,
    proklim: data.filter(d => d["Status desa termasuk Program Kampung Iklim (Proklim)"] === "termasuk").length,
    perhutanan: data.filter(d => d["Keberadaan Program perhutanan sosial"] === "ada").length,
    siaran: data.filter(d => d["status penerimaan program siaran televisi/radio swasta"] === "bisa diterima").length,
  };

  // Tooltip custom untuk Pie
  const CustomTooltipPie = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value, key } = payload[0].payload;
      const desaList = data.filter(row => String(row[key]) === name).map(row => row.nama_desa);

      return (
        <div className="bg-black/80 text-white p-2 rounded-lg text-sm max-w-xs">
          <p className="font-semibold">{name} ({value})</p>
          <p className="italic">Desa:</p>
          <ul className="list-disc list-inside">
            {desaList.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      );
    }
    return null;
  };

  // Fungsi untuk render PieChart per indikator
  const renderPieChart = (key: string, title: string) => {
    const counts: Record<string, number> = {};
    data.forEach(row => {
      const val = String(row[key]);
      counts[val] = (counts[val] || 0) + 1;
    });
    const pieData = Object.entries(counts).map(([name, value]) => ({ name, value, key }));

    return (
      <div className="glass-2 p-4 rounded-xl shadow">
        <h4 className="text-md font-semibold mb-4 text-center">{title}</h4>
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
                        ? "#ef4444" // merah untuk tidak ada/tidak termasuk
                        : "#22c55e" // hijau untuk ada/bisa diterima
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
        <h2 className="text-xl font-bold drop-shadow text-purple-500">
          SDG 17: Kemitraan untuk Mencapai Tujuan
        </h2>
        <p className="text-sm text-gray-200">
          Visualisasi: Kerjasama antar desa, pihak ketiga, Proklim, perhutanan sosial, dan siaran swasta
        </p>
      </div>

      {/* Cards Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Kerjasama Antar Desa</h4>
          <p className="text-xl font-bold text-purple-400">{summary.kerjasamaAntar}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Kerjasama dgn Pihak Ketiga</h4>
          <p className="text-xl font-bold text-purple-400">{summary.kerjasamaPihak}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Program Proklim</h4>
          <p className="text-xl font-bold text-purple-400">{summary.proklim}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Perhutanan Sosial</h4>
          <p className="text-xl font-bold text-purple-400">{summary.perhutanan}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Akses Siaran Swasta</h4>
          <p className="text-xl font-bold text-purple-400">{summary.siaran}</p>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Indikator SDG 17</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderPieChart("Keberadaan kerjasama antar desa", "Keberadaan kerjasama antar desa")}
          {renderPieChart("Keberadaan kerjasama desa dengan pihak ketiga", "Keberadaan kerjasama desa dengan pihak ketiga")}
          {renderPieChart("Status desa termasuk Program Kampung Iklim (Proklim)", "Status desa termasuk Program Kampung Iklim (Proklim)")}
          {renderPieChart("Keberadaan Program perhutanan sosial", "Keberadaan Program perhutanan sosial")}
          {renderPieChart("status penerimaan program siaran televisi/radio swasta", "Status penerimaan siaran televisi/radio swasta")}
        </div>
      </div>
    </div>
  );
}

