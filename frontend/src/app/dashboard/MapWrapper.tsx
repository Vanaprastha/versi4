"use client";

import dynamic from "next/dynamic";

const MapSDG = dynamic(() => import("../components/MapSDG"), { ssr: false });

export default function MapWrapper({ goal }: { goal: number }) {
  return <MapSDG goal={goal} />;
}
