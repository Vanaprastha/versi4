"use client";

import { Row } from "@/types";
import { useState, useEffect } from "react";

export default function SDG8Page() {
  const [data, setData] = useState<Row[]>([]);

  useEffect(() => {
    fetch("/api/sdgs8")
      .then((res) => res.json())
      .then((d: Row[]) => {
        if (d.length > 0) {
          d.sort((a: Row, b: Row) => {
            const va = Number(a["jumlah surat keterangan miskin diterbitkan"]) || 0;
            const vb = Number(b["jumlah surat keterangan miskin diterbitkan"]) || 0;
            return va - vb;
          });
        }
        setData(d);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">SDG 8 Detail</h2>
      {data.length === 0 ? (
        <p>Belum ada data untuk ditampilkan.</p>
      ) : (
        <pre className="bg-black/30 p-4 rounded-lg text-sm overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}