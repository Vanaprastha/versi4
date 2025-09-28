// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LabelList, PieChart, Pie, Cell
} from "recharts";

export default function SDG16Page() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sdgs16")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  // Ringkasan total
  const totals = {
    inisiatif: data.filter(d =>
      d["kegiatan pengaktifan sistem keamanan lingkungan berasal dari inisiatif warga"] === "ada"
    ).length,
    regu: data.filter(d =>
      d["Pembentukan/pengaturan regu keamanan oleh warga untuk menjaga keamanan lingkungan di desa/kelurahan"] === "ada"
    ).length,
    pos: data.filter(d =>
      d["Kegiatan Pembangunan/pemeliharaan pos keamanan lingkungan oleh warga"] === "ada"
    ).length,
    lembaga: data.reduce((acc, d) => acc + (d["Jumlah jenis lembaga adat"] || 0), 0),
    konflik: data.reduce((acc, d) => acc + (d["Jumlah kejadian perkelahian Kelompok masyarakat dengan aparat keamanan"] || 0), 0)
  };

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

  // Fungsi untuk hitung data pie
  const countCategory = (key: string) => {
    const counts: Record<string, number> = {};
    data.forEach(row => {
      const val = String(row[key]);
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value, key }));
  };

  const pieInisiatif = countCategory("kegiatan pengaktifan sistem keamanan lingkungan berasal dari inisiatif warga");
  const pieRegu = countCategory("Pembentukan/pengaturan regu keamanan oleh warga untuk menjaga keamanan lingkungan di desa/kelurahan");
  const piePos = countCategory("Kegiatan Pembangunan/pemeliharaan pos keamanan lingkungan oleh warga");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold drop-shadow text-blue-500">
          SDG 16: Perdamaian, Keadilan, dan Kelembagaan yang Tangguh
        </h2>
        <p className="text-sm text-gray-200">
          Visualisasi: Inisiatif keamanan, regu keamanan, pos keamanan, lembaga adat, dan konflik
        </p>
      </div>

      {/* Cards Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Inisiatif Keamanan</h4>
          <p className="text-xl font-bold text-blue-400">{totals.inisiatif}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Regu Keamanan</h4>
          <p className="text-xl font-bold text-blue-400">{totals.regu}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Pos Keamanan</h4>
          <p className="text-xl font-bold text-blue-400">{totals.pos}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Lembaga Adat</h4>
          <p className="text-xl font-bold text-blue-400">{totals.lembaga}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Kejadian Konflik</h4>
          <p className="text-xl font-bold text-blue-400">{totals.konflik}</p>
        </div>
      </div>

      {/* Bar Chart untuk lembaga adat */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Jumlah jenis lembaga adat</h3>
        <div className="w-full h-96">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
              <XAxis dataKey="nama_desa" stroke="#fff" tick={{ fill: "#fff" }} />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip content={<CustomTooltipBar />} />
              <Bar dataKey="Jumlah jenis lembaga adat" fill="#3b82f6">
                <LabelList dataKey="Jumlah jenis lembaga adat" position="top" fill="#fff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Charts kualitatif */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Indikator Keamanan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[{ title: "kegiatan pengaktifan sistem keamanan lingkungan berasal dari inisiatif warga", data: pieInisiatif },
            { title: "Pembentukan/pengaturan regu keamanan oleh warga untuk menjaga keamanan lingkungan di desa/kelurahan", data: pieRegu },
            { title: "Kegiatan Pembangunan/pemeliharaan pos keamanan lingkungan oleh warga", data: piePos }].map((item, idx) => (
            <div key={idx} className="glass-2 p-4 rounded-xl shadow">
              <h4 className="text-md font-semibold mb-4 text-center">{item.title}</h4>
              <div className="w-full h-72 flex justify-center">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={item.data}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      {item.data.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={
                            entry.name.toLowerCase().includes("tidak")
                              ? "#ef4444"
                              : "#22c55e"
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
          ))}
        </div>
      </div>
    </div>
  );
}

