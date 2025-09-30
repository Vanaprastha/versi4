// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LabelList, PieChart, Pie, Cell
} from "recharts";

export default function SDG6Page() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sdgs6")
      .then((res) => res.json())
      .then((d) => {
        // Urutkan descending berdasarkan Jumlah Lembaga pengelolaan air
        d.sort(
          (a: any, b: any) =>
            (b["Jumlah Lembaga pengelolaan air"] || 0) -
            (a["Jumlah Lembaga pengelolaan air"] || 0)
        );
        setData(d);
      })
      .catch((err) => console.error(err));
  }, []);

  const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#a855f7"];

  // Ringkasan untuk card
  const totals = {
    airAman: data.filter((d) => String(d["Akses Air Minum Aman"]).toLowerCase() === "ada").length,
    airTidak: data.filter((d) => String(d["Akses Air Minum Aman"]).toLowerCase() === "tidak ada").length,
    jambanSendiri: data.filter(
      (d) =>
        String(d["Penggunaan fasilitas buang air besar sebagian besar keluarga di desa/kelurahan:"]) ===
        "Jamban sendiri"
    ).length,
    pencemaranAda: data.filter((d) => String(d["Pencemaran Limbah Sungai"]).toLowerCase() === "ada").length,
    pencemaranTidak: data.filter(
      (d) =>
        String(d["Pencemaran Limbah Sungai"]).toLowerCase() === "tidak ada" ||
        d["Pencemaran Limbah Sungai"] === 0
    ).length,
  };

  // Tooltip custom Bar
  const CustomTooltipBar = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 text-white p-2 rounded-lg text-sm">
          <p className="font-semibold">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Tooltip custom Pie
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

  return (
    <div className="p-6 space-y-6">
      {/* Judul */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold drop-shadow text-cyan-500">
          SDG 6: Air Bersih dan Sanitasi Layak
        </h2>
        <p className="text-sm text-gray-200">
          Visualisasi: akses air minum aman, sanitasi, pencemaran limbah sungai, dan lembaga pengelolaan air
        </p>
      </div>

      {/* Cards Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Air Minum Aman</h4>
          <p className="text-xl font-bold text-cyan-400">{totals.airAman}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Air Minum Tidak Aman</h4>
          <p className="text-xl font-bold text-cyan-400">{totals.airTidak}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Jamban Sendiri</h4>
          <p className="text-xl font-bold text-cyan-400">{totals.jambanSendiri}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Pencemaran Ada</h4>
          <p className="text-xl font-bold text-cyan-400">{totals.pencemaranAda}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Pencemaran Tidak Ada</h4>
          <p className="text-xl font-bold text-cyan-400">{totals.pencemaranTidak}</p>
        </div>
      </div>

      {/* Bar Chart Jumlah Lembaga Pengelolaan Air */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Jumlah Lembaga Pengelolaan Air per Desa</h3>
        <div className="w-full h-96">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis dataKey="nama_desa" stroke="#fff" tick={{ fill: "#fff" }} />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip content={<CustomTooltipBar />} />
              <Legend />
              <Bar
                dataKey="Jumlah Lembaga pengelolaan air"
                fill="#06b6d4"
                radius={[6, 6, 0, 0]}
              >
                <LabelList dataKey="Jumlah Lembaga pengelolaan air" position="top" fill="#fff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Charts untuk indikator kualitatif */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Indikator Kualitatif Sanitasi & Air</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            "Akses Air Minum Aman",
            "Penggunaan fasilitas buang air besar sebagian besar keluarga di desa/kelurahan:",
            "Pencemaran Limbah Sungai",
            "Tempat/saluran pembuangan limbah cair dari air mandi/cuci sebagian besar keluarga:"
          ].map((key, idx) => {
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
                    <PieChart>
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

