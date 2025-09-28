// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LabelList, PieChart, Pie, Cell
} from "recharts";

export default function SDG3Page() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sdgs3")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b"];

  // === Hitung total untuk card ===
  const totalPuskesmas = data.reduce(
    (sum, row) => sum + (parseFloat(row["Jumlah Puskesmas dengan sarana Rawat Inap"]) || 0),
    0
  );
  const totalPosyandu = data.reduce(
    (sum, row) => sum + (parseFloat(row["Jumlah Posyandu Aktif"]) || 0),
    0
  );
  const totalKader = data.reduce(
    (sum, row) => sum + (parseFloat(row["Jumlah Kader KB/KIA"]) || 0),
    0
  );

  // Tooltip custom untuk bar chart
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
      const desaList = data
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold drop-shadow text-green-500">
          SDG 3: Kesehatan yang Baik dan Kesejahteraan
        </h2>
        <p className="text-sm text-gray-200">
          Visualisasi: Puskesmas Rawat Inap, Posyandu Aktif, Kader KB/KIA, dan Program Jaminan Kesehatan
        </p>
      </div>

      {/* Cards Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-2 p-6 rounded-xl text-center shadow">
          <h4 className="font-semibold text-lg mb-2">Total Puskesmas Rawat Inap</h4>
          <p className="text-3xl font-extrabold text-red-400">{totalPuskesmas}</p>
        </div>
        <div className="glass-2 p-6 rounded-xl text-center shadow">
          <h4 className="font-semibold text-lg mb-2">Total Posyandu Aktif</h4>
          <p className="text-3xl font-extrabold text-blue-400">{totalPosyandu}</p>
        </div>
        <div className="glass-2 p-6 rounded-xl text-center shadow">
          <h4 className="font-semibold text-lg mb-2">Total Kader KB/KIA</h4>
          <p className="text-3xl font-extrabold text-green-400">{totalKader}</p>
        </div>
      </div>

      {/* Bar Chart untuk fasilitas kesehatan */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Fasilitas Kesehatan per Desa</h3>
        <div className="w-full h-96">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis dataKey="nama_desa" stroke="#fff" tick={{ fill: "#fff" }} />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip content={<CustomTooltipBar />} />
              <Legend />
              <Bar
                dataKey="Jumlah Puskesmas dengan sarana Rawat Inap"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              >
                <LabelList dataKey="Jumlah Puskesmas dengan sarana Rawat Inap" position="top" fill="#fff" />
              </Bar>
              <Bar
                dataKey="Jumlah Posyandu Aktif"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              >
                <LabelList dataKey="Jumlah Posyandu Aktif" position="top" fill="#fff" />
              </Bar>
              <Bar
                dataKey="Jumlah Kader KB/KIA"
                fill="#22c55e"
                radius={[6, 6, 0, 0]}
              >
                <LabelList dataKey="Jumlah Kader KB/KIA" position="top" fill="#fff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Charts untuk program jaminan */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Program Jaminan Kesehatan</h3>
        <div className="grid grid-cols-2 gap-6">
          {[
            "ketersediaan program jaminan layanan kesehatan khusus untuk ibu hamil",
            "ketersediaan jaminan layanan kesehatan untuk anak baduta"
          ].map((key, idx) => {
            // Hitung jumlah per kategori
            const counts: Record<string, number> = {};
            data.forEach((row) => {
              const val = row[key];
              if (val) {
                counts[val] = (counts[val] || 0) + 1;
              }
            });
            const pieData = Object.entries(counts).map(([name, value]) => ({
              name,
              value,
              key,
            }));

            return (
              <div key={idx} className="glass-2 p-4 rounded-xl shadow">
                <h4 className="text-md font-semibold mb-4 text-center">{key}</h4>
                <div className="w-full h-72 flex justify-center">
                  <ResponsiveContainer>
                    <PieChart margin={{ top: 10, right: 10, bottom: 40, left: 10 }}>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                        label
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend
                        verticalAlign="bottom"
                        layout="horizontal"
                        align="center"
                        wrapperStyle={{ marginTop: "20px" }}
                      />
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

