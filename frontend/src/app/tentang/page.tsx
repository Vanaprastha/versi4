import Image from "next/image";

const team = [
  { name: "Vana Prastha Sulthon Naillendra Agung", role: "-", photo: "/assets/team/athaa.webp" },
  { name: "Anas Wicaksono", role: "-", photo: "/assets/team/budi.webp" },
  { name: "Dea Kayla Putri Darusman", role: "-", photo: "/assets/team/citra.webp" },
  { name: "Muhammad Zaki Zain Fanuruddin Putra", role: "-", photo: "/assets/team/dwi.webp" },
];

export default function TentangPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold drop-shadow-md">Tentang</h1>

      <section className="glass-4 p-4 rounded-2xl space-y-2 text-sm text-neutral-200/90 leading-relaxed">
        <p><b>Dashboard SDGs Pemda</b> adalah web app untuk memantau capaian indikator SDGs daerah, lengkap dengan modul prediksi, clustering, dan chatbot LLM.</p>
      </section>

      <section className="glass-4 p-4 rounded-2xl">
        <h2 className="font-semibold mb-4 drop-shadow">Tim Pengembang</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {team.map((m) => (
            <div key={m.name} className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
              <Image src={m.photo} alt={m.name} width={160} height={160} className="mx-auto rounded-full border border-white/20" />
              <p className="mt-3 font-semibold">{m.name}</p>
              <p className="text-xs text-neutral-300">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-4 p-4 rounded-2xl">
        <h2 className="font-semibold mb-3 drop-shadow">Keunggulan Web App</h2>
        <ul className="grid sm:grid-cols-2 gap-3 text-sm text-neutral-200/90">
          <li className="bg-black/35 p-3 rounded-xl border border-white/10">🎯 Fokus 17 SDGs: kartu berwarna sesuai palet resmi, tetap nyaman di background gelap.</li>
          <li className="bg-black/35 p-3 rounded-xl border border-white/10">📈 Analitik & Prediksi: siap dihubungkan ke model ML (ARIMA/Prophet/LSTM).</li>
          <li className="bg-black/35 p-3 rounded-xl border border-white/10">🧩 Clustering: segmentasi wilayah/indikator (K-Means/DBSCAN) dengan visual interaktif.</li>
          <li className="bg-black/35 p-3 rounded-xl border border-white/10">🤖 Chatbot LLM: tanya jawab indikator, definisi, dan kebijakan dengan retrieval dokumen.</li>
          <li className="bg-black/35 p-3 rounded-xl border border-white/10">⚡ Performa: Next.js + Tailwind, glassmorphism adaptif, responsive sampai mobile.</li>
          <li className="bg-black/35 p-3 rounded-xl border border-white/10">🔐 Siap Produksi: mudah tambahkan auth, logging, dan koneksi ke DB (Supabase/PG).</li>
        </ul>
      </section>
    </div>
  );
}
