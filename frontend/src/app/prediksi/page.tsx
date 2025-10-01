"use client";
import { useState } from "react";
import Revenue from "@/components/Revenue";

export default function PrediksiPage() {
  const [indikator, setIndikator] = useState("stunting");
  const [wilayah, setWilayah] = useState("Kota A");
  const [tahun, setTahun] = useState(2026);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold drop-shadow-md">
        Prediksi Indikator
      </h1>

      <div className="glass-4 p-4 rounded-2xl grid md:grid-cols-3 gap-4">
        {/* Dropdown indikator */}
        <select
          className="bg-black text-white border border-white/20 rounded-lg px-2 py-2 text-sm"
          value={indikator}
          onChange={(e) => setIndikator(e.target.value)}
        >
          <option value="stunting">Stunting (%)</option>
          <option value="air-bersih">Akses Air Bersih (%)</option>
          <option value="kemiskinan">Kemiskinan (%)</option>
        </select>

        {/* Input wilayah */}
        <input
          type="text"
          className="bg-black text-white border border-white/20 rounded-lg px-2 py-2 text-sm"
          value={wilayah}
          onChange={(e) => setWilayah(e.target.value)}
          placeholder="Wilayah"
        />

        {/* Input tahun */}
        <input
          type="number"
          className="bg-black text-white border border-white/20 rounded-lg px-2 py-2 text-sm"
          value={tahun}
          onChange={(e) => setTahun(+e.target.value)}
        />
      </div>

      <div className="glass-4 p-4 rounded-2xl">
        <h2 className="font-semibold mb-2 drop-shadow">
          Hasil Prediksi ({indikator} - {wilayah} - {tahun})
        </h2>
        <Revenue />
      </div>
    </div>
  );
}

