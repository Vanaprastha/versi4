import dynamic from "next/dynamic";

const SDGMap = dynamic(() => import("@/src/components/SDGMap"), { ssr: false });

export default function SDGMapPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Peta SDGs 1 &amp; Clustering</h1>
      <p className="text-sm opacity-80">Menampilkan posisi desa dari tabel <code>location_village</code> dan informasi cluster dari <code>sdgs_1</code>.</p>
      <SDGMap />
    </div>
  );
}
