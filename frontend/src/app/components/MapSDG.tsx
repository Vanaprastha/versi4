
"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";

const clusterColors: Record<number, string> = { 0: "blue", 1: "green", 2: "red", 3: "orange" };

const getClusterIcon = (cluster: number) => {
  const color = clusterColors[cluster] || "blue";
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

type Village = {
  nama_desa: string;
  cluster: number;
  arti_cluster: string;
  indikator: Record<string, number>;
  location_village: { latitude: number; longitude: number };
};

function Legend({ clusters }: { clusters: Record<number, string> }) {
  const map = useMap();
  useEffect(() => {
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      div.setAttribute("style", "background:#fff;padding:8px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.15);font-size:12px");
      div.innerHTML = "<strong>Cluster</strong><br/>";
      Object.entries(clusters).forEach(([key, color]) => {
        div.innerHTML += `<div style="display:flex;align-items:center;margin:4px 0;">
          <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png" style="width:14px;height:22px;margin-right:6px;" />
          <span>Cluster ${key}</span></div>`;
      });
      return div;
    };
    legend.addTo(map);
    return () => legend.remove();
  }, [map, clusters]);
  return null;
}

export default function MapSDG() {
  const [data, setData] = useState<Village[]>([]);

  useEffect(() => {
    fetch("/api/sdgs1_map").then(r => r.json()).then(setData).catch(() => setData([]));
  }, []);

  const center: [number, number] = [-8.2609867, 112.3566442];

  return (
      // @ts-ignore
    <MapContainer center={center as any} zoom={13} style={{ height: "600px", width: "100%" }}>
      // @ts-ignore
      <TileLayer
        // @ts-ignore
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {data.map((v, i) => (
        <Marker
          key={`${v.nama_desa}-${i}`}
          position={[v.location_village.latitude, v.location_village.longitude]}
          icon={getClusterIcon(v.cluster)}
        >
          <Popup>
            <div style={{ fontSize: 12, minWidth: 220 }}>
              <div style={{ fontWeight: 700 }}>{v.nama_desa}</div>
              <div><b>Cluster {v.cluster}</b> ({v.arti_cluster})</div>
              <hr />
              {Object.entries(v.indikator).map(([label, value]) => (
                <div key={label}>{label}: {String(value)}</div>
              ))}
            </div>
          </Popup>
        </Marker>
      ))}
      <Legend clusters={clusterColors} />
    </MapContainer>
  );
}