
import dynamic from "next/dynamic";
const MapSDG = dynamic(() => import("@/src/app/components/MapSDG"), { ssr: false });

export default function DashboardPage() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Peta SDGs 1 dengan Cluster</h1>
      <MapSDG />
    </main>
  );
}
