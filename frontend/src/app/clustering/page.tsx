"use client";

import { useMemo, useState } from "react";
import MapWrapper from "../dashboard/MapWrapper";

const goals = Array.from({ length: 17 }, (_, index) => index + 1);

export default function ClusteringPage() {
  const [selectedGoal, setSelectedGoal] = useState<number>(1);

  const goalOptions = useMemo(
    () => goals.map(goal => ({ value: goal, label: `SDGs ${goal}` })),
    []
  );

  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold mb-2">Peta Clustering SDGs</h1>
        <p className="text-sm text-gray-600">
          Pilih tujuan pembangunan berkelanjutan (SDGs) untuk melihat sebaran
          cluster desa pada peta.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="sdg-select" className="text-sm font-medium">
          Pilihan SDGs
        </label>
        <select
          id="sdg-select"
          value={selectedGoal}
          onChange={event => setSelectedGoal(Number(event.target.value))}
          className="w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {goalOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <MapWrapper goal={selectedGoal} />
      </div>
    </main>
  );
}
