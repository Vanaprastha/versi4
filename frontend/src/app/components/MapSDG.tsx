"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type Props = {
  goal: number; // 1..17
};

const clusterColors: Record<number, string> = { 0: "blue", 1: "green", 2: "red", 3: "orange" };

const getClusterIcon = (cluster: number) => {
  const color = clusterColors[cluster] || "blue";
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

function Legend({ clusters }: { clusters: Record<number, string> }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        right: 16,
        background: "rgba(0,0,0,0.6)",
        color: "white",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Legenda Cluster</div>
      {Object.entries(clusters).map(([k, clr]) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              background: clr,
              borderRadius: 2,
            }}
          />
          <span>Cluster {k}</span>
        </div>
      ))}
    </div>
  );
}

export default function MapSDG({ goal }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/map/${goal}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setData(Array.isArray(d) ? d : []))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [goal]);

  const center: [number, number] = [-7.802, 112.02];

  return (
    <div style={{ position: "relative" }}>
      {loading && (
        <div className="mb-2 text-sm text-neutral-400">Memuat peta SDGs {goal}…</div>
      )}
      {error && (
        <div className="mb-2 text-sm text-red-400">Gagal memuat data: {error}</div>
      )}
      <MapContainer center={center} zoom={13} style={{ height: 420, width: "100%", borderRadius: 12 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {data.map((v, idx) => {
          const lat = Number(v.latitude);
          const lon = Number(v.longitude);
          if (!isFinite(lat) || !isFinite(lon)) return null;
          const icon = getClusterIcon(Number(v.cluster ?? 0));
          return (
            <Marker key={idx} position={[lat, lon]} icon={icon}>
              <Popup>
                <div style={{ fontSize: 12, minWidth: 220 }}>
                  <div style={{ fontWeight: 700 }}>{v.nama_desa}</div>
                  <div><b>Cluster {v.cluster}</b> {v.arti_cluster ? `(${v.arti_cluster})` : ""}</div>
                  <hr />
                  {v.indikator && Object.entries(v.indikator).map(([label, value]: any) => (
                    <div key={String(label)}>{String(label)}: {String(value)}</div>
                  ))}
                </div>
              </Popup>
            </Marker>
          );
        })}
        <Legend clusters={clusterColors} />
        <Legend />
</MapContainer>
    </div>
  );
}


import L from "leaflet";
import { useMap } from "react-leaflet";
import { useEffect } from "react";

function Legend() {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      div.innerHTML = `
        <div style="background: rgba(0,0,0,0.6); color:white; padding:8px; border-radius:6px; font-size:12px">
          <b>Legenda Cluster</b><br/>
          <i style="background:green; width:12px; height:12px; display:inline-block; margin-right:4px"></i> Rendah<br/>
          <i style="background:orange; width:12px; height:12px; display:inline-block; margin-right:4px"></i> Sedang<br/>
          <i style="background:red; width:12px; height:12px; display:inline-block; margin-right:4px"></i> Tinggi
        </div>
      `;
      return div;
    };

    legend.addTo(map);
    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
}
