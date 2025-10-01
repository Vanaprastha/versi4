// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip
} from "recharts";

export default function SDG9Page() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sdgs9")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  // Warna kategori
  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6"];

  // Ringkasan untuk cards
  const summary = {
    jalanAspal: data.filter((d) => d["Jenis Permukaan Jalan Utama"] === "Aspal/beton").length,
    sinyal4G: data.filter((d) =>
      String(d["Sinyal internet telepon seluler/handphone di sebagian besar wilayah di desa/kelurahan :"])
        .includes("5G/4G/LTE")
    ).length,
    internetKantor: data.filter((d) => d["Fasilitas internet di kantor kepala desa/lurah"] === "Berfungsi").length,
    aksesSepanjang: data.filter((d) =>
      String(d["Akses jalan darat dari sentra produksi pertanian ke jalan utama dapat dilalui kendaraan roda 4 lebih"])
        .includes("Sepanjang tahun")
    ).length,
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

  // Fungsi untuk generate pie chart
  const renderPieChart = (key: string, title: string) => {
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
                      entry.name.toLowerCase().includes("tidak ada")
                        ? "#ef4444" // merah untuk "tidak ada"
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
        <h2 className="text-xl font-bold drop-shadow text-purple-500">
          SDG 9: Industri, Inovasi, dan Infrastruktur
        </h2>
        <p className="text-sm text-gray-200">
          Infrastruktur desa: kondisi jalan utama, akses jalan pertanian, sinyal internet, dan fasilitas internet desa.
        </p>
      </div>

      {/* Cards Ringkasan */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Jalan Aspal/Beton</h4>
          <p className="text-xl font-bold text-purple-400">{summary.jalanAspal}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Sinyal 4G/5G</h4>
          <p className="text-xl font-bold text-purple-400">{summary.sinyal4G}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Internet Kantor Desa</h4>
          <p className="text-xl font-bold text-purple-400">{summary.internetKantor}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Akses Pertanian Sepanjang Tahun</h4>
          <p className="text-xl font-bold text-purple-400">{summary.aksesSepanjang}</p>
        </div>
        <div className="glass-2 p-4 rounded-xl text-center shadow">
          <h4 className="font-semibold text-sm">Total Desa</h4>
          <p className="text-xl font-bold text-purple-400">{data.length}</p>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="glass-4 p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Indikator Infrastruktur & Akses Desa</h3>
        <div className="grid grid-cols-2 gap-6">
          {renderPieChart("Jenis Permukaan Jalan Utama", "Jenis Permukaan Jalan Utama")}
          {renderPieChart("Akses Jalan darat antar desa/kelurahan dapat dilalui kendaraan bermotor roda 4 atau lebih", "Akses Jalan Antar Desa")}
          {renderPieChart("Sinyal internet telepon seluler/handphone di sebagian besar wilayah di desa/kelurahan :", "Sinyal Internet Seluler")}
          {renderPieChart("Fasilitas internet di kantor kepala desa/lurah", "Fasilitas Internet Kantor Desa")}
          {renderPieChart("Akses jalan darat dari sentra produksi pertanian ke jalan utama dapat dilalui kendaraan roda 4 lebih", "Akses Jalan Sentra Pertanian")}
        </div>
      </div>
    </div>
  );
}

