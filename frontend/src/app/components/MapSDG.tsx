"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type Props = { goal: number };

// Warna cluster
const clusterColors: Record<number, string> = {
  0: "blue",
  1: "green",
  2: "orange",
  3: "red",
};

// Icon marker sesuai cluster
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

// === LegendControl sebagai kontrol Leaflet ===
function LegendControl() {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      div.style.background = "rgba(0,0,0,0.6)";
      div.style.color = "white";
      div.style.padding = "8px 12px";
      div.style.borderRadius = "8px";
      div.style.fontSize = "12px";

      div.innerHTML = "<b>Legenda Cluster</b><br/>";
      Object.entries(clusterColors).forEach(([k, clr]) => {
        div.innerHTML += `
          <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
            <span style="display:inline-block;width:10px;height:10px;background:${clr};border-radius:2px;"></span>
            Cluster ${k}
          </div>`;
      });
      return div;
    };

    legend.addTo(map);
    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
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
        <div className="mb-2 text-sm text-neutral-400">
          Memuat peta SDGs {goal}…
        </div>
      )}
      {error && (
        <div className="mb-2 text-sm text-red-400">
          Gagal memuat data: {error}
        </div>
      )}
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: 420, width: "100%", borderRadius: 12 }}
      >
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
                  <div>
                    <b>Cluster {v.cluster}</b>{" "}
                    {v.arti_cluster ? `(${v.arti_cluster})` : ""}
                  </div>
                  <hr />
                  {v.indikator && (
                    <div style={{ marginTop: 4 }}>
                      {Array.isArray(v.indikator) ? (
                        v.indikator.map((item: string, i: number) => (
                          <div key={i}>{item}</div>
                        ))
                      ) : (
                        <div>{String(v.indikator)}</div>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Legend selalu menempel di pojok kanan bawah */}
        <LegendControl />
      </MapContainer>
    </div>
  );
}

