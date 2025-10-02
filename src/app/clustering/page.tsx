"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then(m => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });

type DesaPoint = {
  nama_desa: string;
  cluster: number;
  arti_cluster?: string;
  location_village?: { latitude: number; longitude: number } | null;
};

export default function ClusteringPage() {
  const [sdgs, setSdgs] = useState("1");
  const [data, setData] = useState<DesaPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/cluster?sdgs=${sdgs}`)
      .then(res => res.json())
      .then((d) => {
        setData(Array.isArray(d) ? d : []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [sdgs]);

  const center = useMemo<[number, number]>(() => {
    const coords = data
      .map(d => d.location_village)
      .filter((lv): lv is { latitude: number; longitude: number } => !!lv);
    if (coords.length === 0) return [-7.95, 112.35];
    const lat = coords.reduce((a, c) => a + c.latitude, 0) / coords.length;
    const lng = coords.reduce((a, c) => a + c.longitude, 0) / coords.length;
    return [lat, lng];
  }, [data]);

  const colors = ["#e11d48", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#14b8a6"];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Clustering SDGs</h1>

      <div className="flex items-center gap-3">
        <label className="text-sm">Pilih SDGs:</label>
        <select
          value={sdgs}
          onChange={(e) => setSdgs(e.target.value)}
          className="border px-3 py-2 rounded-md bg-white text-black"
        >
          {Array.from({ length: 17 }, (_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              SDGs {i + 1}
            </option>
          ))}
        </select>
        {loading && <span className="text-sm opacity-70">memuat…</span>}
        {error && <span className="text-sm text-red-500">error: {error}</span>}
      </div>

      <div className="h-[520px] w-full rounded-lg overflow-hidden border border-white/10">
        <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.map((desa, idx) => {
            if (!desa.location_village) return null;
            const { latitude, longitude } = desa.location_village;
            const color = colors[desa.cluster % colors.length];
            return (
              <CircleMarker
                key={idx}
                center={[latitude, longitude]}
                radius={10}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.8 }}
              >
                <Popup>
                  <div className="space-y-1">
                    <div className="font-semibold">{desa.nama_desa}</div>
                    <div>Cluster: {desa.cluster}</div>
                    {desa.arti_cluster && <div>{desa.arti_cluster}</div>}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
