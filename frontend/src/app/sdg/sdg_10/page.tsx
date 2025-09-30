// @ts-nocheck
"use client";

import { useEffect, useState } from "react";

export default function SDG10Page() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sdgs10")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">SDG 10 Detail</h2>
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
