"use client";

import Link from "next/link";
import SDGCard from "@/components/SDGCard";

const dummy = [
  { goalNo: 1, title: "Tanpa Kemiskinan", info: "Informasi:" },
  { goalNo: 2, title: "Tanpa Kelaparan", info: "Informasi: " },
  { goalNo: 3, title: "Kesehatan yang Baik", info: "Informasi: " },
  { goalNo: 4, title: "Pendidikan Berkualitas", info: "Informasi: " },
  { goalNo: 5, title: "Kesetaraan Gender", info: "Informasi:" },
  { goalNo: 6, title: "Air Bersih & Sanitasi", info: "Informasi: " },
  { goalNo: 7, title: "Energi Bersih", info: "Informasi: " },
  { goalNo: 8, title: "Pekerjaan Layak", info: "Informasi: " },
  { goalNo: 9, title: "Industri, Inovasi", info: "Informasi: " },
  { goalNo: 10, title: "Berkurangnya Kesenjangan", info: "Informasi: " },
  { goalNo: 11, title: "Kota & Pemukiman", info: "Informasi: " },
  { goalNo: 12, title: "Konsumsi Bertanggung Jawab", info: "Informasi: " },
  { goalNo: 13, title: "Aksi Iklim", info: "Informasi: " },
  { goalNo: 14, title: "Ekosistem Lautan", info: "Informasi: " },
  { goalNo: 15, title: "Ekosistem Daratan", info: "Informasi: " },
  { goalNo: 16, title: "Institusi Kuat", info: "Informasi: " },
  { goalNo: 17, title: "Kemitraan", info: "Informasi: " },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <header className="glass-2 p-4 rounded-2xl sticky top-0 z-10">
        <h1 className="text-xl font-semibold drop-shadow-md">Ringkasan SDGs</h1>
        <p className="text-sm text-neutral-200/80">
          Pilih wilayah & indikator untuk melihat perkembangan.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dummy.map((d) => (
          <Link key={d.goalNo} href={{ pathname: `/sdg/sdg_${d.goalNo}` }}>
            <SDGCard {...d} />
          </Link>
        ))}
      </section>
    </div>
  );
}

