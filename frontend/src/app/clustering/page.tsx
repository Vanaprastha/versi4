"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Scatter from "./scatter";

const MapSDG = dynamic(() => import("../components/MapSDG"), { ssr: false });

const sdgOptions = Array.from({ length: 17 }, (_, i) => i + 1);

export default function ClusteringPage() {
  const [goal, setGoal] = useState<number>(1);

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Clustering SDGs</h1>
          <p className="text-sm text-neutral-400">Pilih SDGs untuk melihat peta cluster & scatter</p>
        </div>
        <label className="text-sm">
          <span className="mr-2">Pilih SDGs:</span>
          <select
            className="bg-black/40 border border-white/10 rounded-md px-3 py-2"
            value={goal}
            onChange={(e) => setGoal(parseInt(e.target.value, 10))}
          >
            {sdgOptions.map((g) => (
              <option key={g} value={g}>
                SDGs {g}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-white/10">
        <MapSDG goal={goal} />
      </div>

      {/* Scatter */}
      <div className="rounded-xl overflow-hidden border border-white/10">
        <Scatter goal={goal} />
      </div>
    </main>
  );
}
