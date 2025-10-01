"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Location = {
  latitude: number;
  longitude: number;
};

type DesaData = {
  nama_desa: string;
  cluster: number | string;
  arti_cluster: string;
  r710?: number;
  r1502_7?: number;
  r1502_8?: number;
  r1502_4?: number;
  r1502_9?: number;
  location_village: Location;
};

function colorForCluster(c: number | string | undefined): string {
  if (c === undefined || c === null) return "#888";
  const n = typeof c === "string" ? parseInt(c, 10) : c;
  // deterministic palette for cluster ids 0..9
  const palette = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
                   "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
  if (!Number.isFinite(n)) return "#888";
  const idx = Math.abs(n as number) % palette.length;
  return palette[idx];
}

export default function SDGMap() {
  const [data, setData] = useState<DesaData[]>([]);
  const [center, setCenter] = useState<[number, number]>([-8.26, 112.35]);

  useEffect(() => {
    fetch("/api/sdgs1_map")
      .then((res) => res.json())
      .then((d) => {
        setData(d || []);
        // auto center if possible
        if (d && d.length > 0) {
          const lat = d[0]?.location_village?.latitude ?? -8.26;
          const lon = d[0]?.location_village?.longitude ?? 112.35;
          if (typeof lat === "number" && typeof lon === "number") {
            setCenter([lat, lon]);
          }
        }
      })
      .catch(() => setData([]));
  }, []);

  const markers = useMemo(() => (data ?? []).filter(
    (x) => x?.location_village?.latitude && x?.location_village?.longitude
  ), [data]);

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((desa, idx) => {
          const lat = desa.location_village.latitude;
          const lon = desa.location_village.longitude;
          const color = colorForCluster(desa.cluster);
          return (
            <CircleMarker
              key={`${desa.nama_desa}-${idx}`}
              center={[lat, lon]}
              radius={10}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.8 }}
            >
              <Popup>
                <div className="text-sm space-y-1">
                  <div className="font-semibold">{desa.nama_desa}</div>
                  <div>Cluster: <b>{desa.cluster}</b> ({desa.arti_cluster})</div>
                  {typeof desa.r710 !== "undefined" && <div>SKTM (r710): {desa.r710}</div>}
                  <div className="opacity-80">
                    r1502_7: {String(desa.r1502_7 ?? "-")},{" "}
                    r1502_8: {String(desa.r1502_8 ?? "-")},{" "}
                    r1502_4: {String(desa.r1502_4 ?? "-")},{" "}
                    r1502_9: {String(desa.r1502_9 ?? "-")}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
