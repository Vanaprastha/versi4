// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LabelList, PieChart, Pie, Cell
} from "recharts";

export default function SDG2Page() {
  const [dataSDG2, setDataSDG2] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sdgs2")
      .then(res => res.json())
      .then(d => {
        if (d.length > 0) {
          // urutkan berdasarkan penderita gizi buruk
          d.sort((a, b) => {
            const va = parseFloat(a["Jumlah penderita gizi buruk"]) || 0;
            const vb = parseFloat(b["Jumlah penderita gizi buruk"]) || 0;
            return va - vb;
          });
        }
        setDataSDG2(d);
      })
      .catch(err => console.error(err));
  }, []);

  const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b"];

  // === Hitung Ringkasan ===
  const totalGiziBuruk = dataSDG2.reduce(
    (sum, row) => sum + (parseFloat(row["Jumlah penderita gizi buruk"]) || 0),
    0
  );

  const totalLuasPertanian = dataSDG2.reduce(
    (sum, row) => sum + (parseFloat(row["Luas areal pertanian yang terdampak bencana alam"]) || 0),
    0
  );

  // Tooltip custom untuk bar chart numerik
  const CustomTooltipBar = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 text-white p-2 rounded-lg text-sm">
          <p className="font-semibold">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Tooltip custom untuk pie chart
  const CustomTooltipPie = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const category = payload[0].name;
      const key = payload[0].payload.key;
      const desaList = dataSDG2
        .filter((row) => row[key] === category)
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold drop-shadow text-yellow-500">
          SDG 2: Tanpa Kelaparan
        </h2>
        <p className="text-sm text-gray-200">
          Informasi: Gizi Buruk, Luas Areal Pertanian Terdampak, Kerawanan Pangan, Pupuk Organik, Akses Jalan Pertanian
        </p>
      </div>

      {/* Cards Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-2 p-6 rounded-xl text-center shadow">
          <h4 className="font-semibold text-lg mb-2">Total Penderita Gizi Buruk</h4>
          <p className="text-3xl font-extrabold text-red-400">{totalGiziBuruk}</p>
        </div>
        <div className="glass-2 p-6 rounded-xl text-center shadow">
          <h4 className="font-semibold text-lg mb-2">Total Luas Areal Pertanian Terdampak</h4>
          <p className="text-3xl font-extrabold text-blue-400">{totalLuasPertanian}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Jumlah Gizi Buruk & Luas Areal Pertanian Terdampak per Desa</h3>
        <div className="w-full h-96">
          <ResponsiveContainer>
            <BarChart data={dataSDG2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis dataKey="nama_desa" stroke="#fff" tick={{ fill: "#fff" }} />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip content={<CustomTooltipBar />} />
              <Legend />
              <Bar
                dataKey="Jumlah penderita gizi buruk"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              >
                <LabelList dataKey="Jumlah penderita gizi buruk" position="top" fill="#fff" />
              </Bar>
              <Bar
                dataKey="Luas areal pertanian yang terdampak bencana alam"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              >
                <LabelList dataKey="Luas areal pertanian yang terdampak bencana alam" position="top" fill="#fff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Indikator Kualitatif</h3>
        <div className="grid grid-cols-2 gap-6">
          {[
            "Kejadian Kearawanan Pangan",
            "Penggalakan penggunaan pupuk organik di lahan pertanian",
            "Akses jalan darat dari sentra produksi pertanian ke jalan utama dapat dilalui kendaraan roda 4 lebih"
          ].map((key, idx) => {
            const counts: Record<string, number> = {};
            dataSDG2.forEach((row) => {
              const val = row[key];
              if (val) counts[val] = (counts[val] || 0) + 1;
            });
            const pieData = Object.entries(counts).map(([name, value]) => ({ name, value, key }));

            return (
              <div key={idx} className="glass-2 p-4 rounded-xl shadow">
                <h4 className="text-md font-semibold mb-2 text-center">{key}</h4>
                <div className="w-full h-64 flex justify-center">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                        label
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip content={<CustomTooltipPie />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

