import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export async function GET() {
  // 1. Ambil data sdgs_1
  const { data: sdgs, error: err1 } = await supabase
    .from("sdgs_1")
    .select("*");

  if (err1) {
    return NextResponse.json({ error: err1.message }, { status: 500 });
  }

  // 2. Ambil data lokasi
  const { data: lokasi, error: err2 } = await supabase
    .from("location_village")
    .select("nama_desa, latitude, longitude");

  if (err2) {
    return NextResponse.json({ error: err2.message }, { status: 500 });
  }

  // 3. Ambil arti kolom
  const { data: labels, error: err3 } = await supabase
    .from("feature_label")
    .select("kode_kolom, arti_data");

  if (err3) {
    return NextResponse.json({ error: err3.message }, { status: 500 });
  }

  // --- Buat dictionary ---
  const lokasiMap: Record<string, any> = {};
  lokasi?.forEach((l) => {
    lokasiMap[l.nama_desa] = { latitude: l.latitude, longitude: l.longitude };
  });

  const labelMap: Record<string, string> = {};
  labels?.forEach((l) => {
    labelMap[l.kode_kolom] = l.arti_data;
  });

  // --- Gabungkan hasil ---
  const result = sdgs?.map((row) => {
    const indikator: Record<string, any> = {};
    ["r710", "r1502_7", "r1502_8", "r1502_4", "r1502_9"].forEach((kode) => {
      if (row[kode] !== undefined) {
        indikator[labelMap[kode] || kode] = row[kode];
      }
    });

    return {
      nama_desa: row.nama_desa,
      cluster: row.cluster,
      arti_cluster: row.arti_cluster,
      r710: row.r710,
      r1502_7: row.r1502_7,
      r1502_8: row.r1502_8,
      r1502_4: row.r1502_4,
      r1502_9: row.r1502_9,
      location_village: lokasiMap[row.nama_desa] || null,
      indikator,
    };
  });

  return NextResponse.json(result);
}

