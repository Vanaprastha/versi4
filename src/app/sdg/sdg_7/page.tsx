// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LabelList, PieChart, Pie, Cell
} from "recharts";

export default function SDG7Page() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sdgs7")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  // Hitung ringkasan total
  const totals = data.reduce(
    (acc, row) => {
      acc.tanpaListrik += row["Jumlah Keluarga Tanpa Listrik"] || 0;
      acc.waduk += row["Pemanfaatan Waduk Untuk Listrik"] || 0;
      return acc;
    },
    { tanpaListrik: 0, waduk: 0 }
  );

  // Tooltip custom bar
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

  // Tooltip custom pie
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

  return (
    <div className="p-6 space-y-6">
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold drop-shadow text-yellow-500">
          SDG 7: Energi Bersih dan Terjangkau
        </h2>
        <p className="text-sm text-gray-200">
          Visualisasi: Keluarga tanpa listrik, energi terbarukan, biogas, sarana energi, dan Pemanfaatan Waduk Untuk Listrik
        </p>
      </div>

      {/* Cards Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Keluarga Tanpa Listrik</h4>
          <p className="text-xl font-bold text-yellow-400">{totals.tanpaListrik}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Pemanfaatan Waduk Untuk Listrik</h4>
          <p className="text-xl font-bold text-yellow-400">{totals.waduk}</p>
        </div>
      </div>

      {/* Bar Chart utama */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Indikator SDG 7 per Desa</h3>
        <div className="w-full h-96">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis dataKey="nama_desa" stroke="#fff" tick={{ fill: "#fff" }} />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip content={<CustomTooltipBar />} />
              <Legend />

              <Bar dataKey="Jumlah Keluarga Tanpa Listrik" fill="#ef4444">
                <LabelList dataKey="Jumlah Keluarga Tanpa Listrik" position="top" fill="#fff" />
              </Bar>
              <Bar dataKey="Pemanfaatan Waduk Untuk Listrik" fill="#3b82f6">
                <LabelList dataKey="Pemanfaatan Waduk Untuk Listrik" position="top" fill="#fff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Indikator Kualitatif Energi</h3>
        <div className="grid grid-cols-2 gap-6">
          {[
            "Keberadaan program pengembangan energi terbarukan",
            "Penggunaan Biogas",
            "Keberadaan program kegiatan pembangunan masyarakat untuk Sarana prasarana energi"
          ].map((key, idx) => {
            // Hitung jumlah kategori
            const counts: Record<string, number> = {};
            data.forEach((row) => {
              const val = row[key];
              if (val) counts[val] = (counts[val] || 0) + 1;
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
                              entry.name.toLowerCase() === "ada"
                                ? "#22c55e" // hijau
                                : entry.name.toLowerCase() === "tidak ada"
                                ? "#ef4444" // merah
                                : "#3b82f6" // default biru
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
          })}
        </div>
      </div>
    </div>
  );
}

