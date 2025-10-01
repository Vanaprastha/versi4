// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LabelList
} from "recharts";

export default function SDG5Page() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sdgs5")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  // Hitung ringkasan total
  const totals = data.reduce(
    (acc, row) => {
      acc.kader += row["Jumlah Kader KB/KIA"] || 0;
      acc.pmi += row["Jumlah PMI Perempuan 2024"] || 0;
      acc.calonPmi += row["Jumlah calon PMI dengan surat rekomendasi desa/lurah untuk kerja ke luar negeri"] || 0;
      acc.pembunuhan += row["Jumlah Korban Pembunuhan Perempuan"] || 0;
      acc.bunuhDiri += row["Jumlah Korban Bunuh Diri Perempuan"] || 0;
      return acc;
    },
    { kader: 0, pmi: 0, calonPmi: 0, pembunuhan: 0, bunuhDiri: 0 }
  );

  // Tooltip custom
  const CustomTooltip = ({ active, payload, label }: any) => {
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

  const indikator = [
    { key: "Jumlah Kader KB/KIA", color: "#3b82f6", short: "Kader KB/KIA" },
    { key: "Jumlah PMI Perempuan 2024", color: "#22c55e", short: "PMI Perempuan" },
    { key: "Jumlah calon PMI dengan surat rekomendasi desa/lurah untuk kerja ke luar negeri", color: "#eab308", short: "Calon PMI" },
    { key: "Jumlah Korban Pembunuhan Perempuan", color: "#ef4444", short: "Pembunuhan" },
    { key: "Jumlah Korban Bunuh Diri Perempuan", color: "#f59e0b", short: "Bunuh Diri" }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold drop-shadow text-pink-500">
          SDG 5: Kesetaraan Gender
        </h2>
        <p className="text-sm text-gray-200">
          Visualisasi: Kader KB/KIA, PMI Perempuan, calon PMI, korban pembunuhan, dan bunuh diri perempuan
        </p>
      </div>

      {/* Cards Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Kader KB/KIA</h4>
          <p className="text-xl font-bold text-pink-400">{totals.kader}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">PMI Perempuan</h4>
          <p className="text-xl font-bold text-pink-400">{totals.pmi}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Calon PMI</h4>
          <p className="text-xl font-bold text-pink-400">{totals.calonPmi}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Korban Pembunuhan</h4>
          <p className="text-xl font-bold text-pink-400">{totals.pembunuhan}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Korban Bunuh Diri</h4>
          <p className="text-xl font-bold text-pink-400">{totals.bunuhDiri}</p>
        </div>
      </div>

      {/* Bar Chart Utama */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Indikator SDG 5 per Desa</h3>
        <div className="w-full h-96">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis dataKey="nama_desa" stroke="#fff" tick={{ fill: "#fff" }} />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {indikator.map((ind, idx) => (
                <Bar key={idx} dataKey={ind.key} fill={ind.color}>
                  <LabelList dataKey={ind.key} position="top" fill="#fff" />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid 2x2: Bar Chart per Indikator */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Indikator per Desa (Detail)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {indikator.map((ind, idx) => (
            <div key={idx} className="glass-2 p-4 rounded-xl shadow">
              <h4 className="text-md font-semibold mb-2 text-center">{ind.short}</h4>
              <div className="w-full h-72">
                <ResponsiveContainer>
                  <BarChart data={data} margin={{ bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
                    <XAxis
                      dataKey="nama_desa"
                      stroke="#fff"
                      tick={{ fill: "#fff", fontSize: 10 }}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      height={60}
                    />
                    <YAxis stroke="#fff" tick={{ fill: "#fff", fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey={ind.key} fill={ind.color} radius={[6, 6, 0, 0]}>
                      <LabelList dataKey={ind.key} position="top" fill="#fff" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

