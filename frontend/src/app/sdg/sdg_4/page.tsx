// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LabelList, PieChart, Pie, Cell
} from "recharts";

export default function SDG4Page() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sdgs4")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#eab308"]; // tanpa merah, merah khusus "tidak ada"

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
        <h2 className="text-xl font-bold drop-shadow text-blue-500">
          SDG 4: Pendidikan Berkualitas
        </h2>
        <p className="text-sm text-gray-200">
          Visualisasi: Akses pendidikan dasar, PAUD, program keaksaraan, paket A/B/C, dan lembaga keterampilan komputer
        </p>
      </div>

      {/* Bar Chart: Lembaga Keterampilan Komputer */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Jumlah Lembaga Keterampilan Komputer</h3>
        <div className="w-full h-96">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis dataKey="nama_desa" stroke="#fff" tick={{ fill: "#fff" }} />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip content={<CustomTooltipBar />} />
              <Legend />
              <Bar
                dataKey="Lembaga_Keterampilan_Komputer"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              >
                <LabelList dataKey="Lembaga_Keterampilan_Komputer" position="top" fill="#fff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Charts untuk indikator kualitatif */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Indikator Kualitatif Pendidikan</h3>
        <div className="grid grid-cols-2 gap-6">
          {[
            "Aksesibilitas_SD_Terdekat",
            "Jarak_PAUD_Terdekat",
            "Program_Pendidikan_Keaksaraan",
            "Program_Pendidikan_Paket_A/B/C"
          ].map((key, idx) => {
            // Hitung jumlah per kategori
            const counts: Record<string, number> = {};
            data.forEach((row) => {
              const val = String(row[key]);
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
                        {pieData.map((entry, i) => {
                          const fillColor =
                            entry.name.toLowerCase().includes("tidak ada")
                              ? "#ef4444" // merah khusus "tidak ada"
                              : COLORS[i % COLORS.length];
                          return <Cell key={i} fill={fillColor} />;
                        })}
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

