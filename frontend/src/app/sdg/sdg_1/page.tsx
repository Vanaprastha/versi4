// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LabelList, PieChart, Pie, Cell
} from "recharts";

export default function SDG1Page() {
  const [dataSDG1, setDataSDG1] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sdgs1")
      .then(res => res.json())
      .then(d => {
        if (d.length > 0) {
          d.sort((a, b) => {
            const va = parseFloat(a["jumlah surat keterangan miskin diterbitkan"]) || 0;
            const vb = parseFloat(b["jumlah surat keterangan miskin diterbitkan"]) || 0;
            return va - vb;
          });
        }
        setDataSDG1(d);
      })
      .catch(err => console.error(err));
  }, []);

  // Ambil semua kolom selain nama_desa dan SKTM
  const availabilityKeys =
    dataSDG1.length > 0
      ? Object.keys(dataSDG1[0]).filter(
          (k) => k !== "nama_desa" && k !== "jumlah surat keterangan miskin diterbitkan"
        )
      : [];

  const COLORS = ["#22c55e", "#ef4444"];

  // === Hitung Ringkasan ===
  const totalSKTM = dataSDG1.reduce(
    (sum, row) => sum + (parseFloat(row["jumlah surat keterangan miskin diterbitkan"]) || 0),
    0
  );

  // Tooltip untuk SKTM (nama desa + jumlah SKTM)
  const CustomTooltipSKTM = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 text-white p-2 rounded-lg text-sm">
          <p className="font-semibold">{label}</p>
          <p>Jumlah SKTM: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  // Tooltip untuk Pie Chart (daftar desa per kategori)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const category = payload[0].name;
      const key = payload[0].payload.key;
      const desaList = dataSDG1
        .filter((row) => {
          const val = row[key];
          if (category === "Ada") return val === "ada";
          if (category === "Tidak Ada") return val === "tidak ada";
          return false;
        })
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
        <h2 className="text-xl font-bold drop-shadow text-red-500">
          SDG 1: Tanpa Kemiskinan
        </h2>
        <p className="text-sm text-gray-200">
          Informasi : Jumlah SKTM diterbitkan, status keberadaan layanan stunting
        </p>
      </div>

      {/* Cards Ringkasan per Layanan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availabilityKeys.map((key, idx) => {
          let adaCount = 0;
          let tidakCount = 0;
          dataSDG1.forEach((row) => {
            if (row[key] === "ada") adaCount++;
            else if (row[key] === "tidak ada") tidakCount++;
          });

          return (
            <div key={idx} className="glass-2 p-4 rounded-xl shadow text-center">
              <h4 className="font-semibold text-sm mb-2">{key}</h4>
              <div className="flex justify-around">
                <div>
                  <p className="text-green-400 font-bold">{adaCount}</p>
                  <p className="text-xs">Desa Ada</p>
                </div>
                <div>
                  <p className="text-red-400 font-bold">{tidakCount}</p>
                  <p className="text-xs">Desa Tidak Ada</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Ringkasan Total SKTM (dipindah ke bawah) */}
      <div className="grid grid-cols-1">
        <div className="glass-2 p-6 rounded-xl text-center shadow col-span-1 md:col-span-3">
          <h4 className="font-semibold text-lg mb-2">Total SKTM</h4>
          <p className="text-3xl font-extrabold text-red-400">{totalSKTM}</p>
        </div>
      </div>

      {/* Bar Chart SKTM */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Jumlah SKTM per Desa</h3>
        <div className="w-full h-96">
          <ResponsiveContainer>
            <BarChart data={dataSDG1}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis dataKey="nama_desa" stroke="#fff" tick={{ fill: "#fff" }} />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip content={<CustomTooltipSKTM />} />
              <Legend />
              <Bar
                dataKey="jumlah surat keterangan miskin diterbitkan"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              >
                <LabelList
                  dataKey="jumlah surat keterangan miskin diterbitkan"
                  position="top"
                  fill="#fff"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid Pie Charts untuk layanan */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Keberadaan Layanan Terkait Stunting</h3>
        <div className="grid grid-cols-2 gap-6">
          {availabilityKeys.map((key, idx) => {
            const counts = { ada: 0, "tidak ada": 0 };
            dataSDG1.forEach((row) => {
              if (row[key] === "ada") counts.ada++;
              else if (row[key] === "tidak ada") counts["tidak ada"]++;
            });
            const pieData = [
              { name: "Ada", value: counts.ada, key },
              { name: "Tidak Ada", value: counts["tidak ada"], key },
            ];
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
                        {pieData.map((entry, i) => {
                          const fillColor =
                            entry.name === "Tidak Ada" ? "#ef4444" : "#22c55e";
                          return <Cell key={i} fill={fillColor} />;
                        })}
                      </Pie>
                      <Legend />
                      <Tooltip content={<CustomTooltip />} />
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

