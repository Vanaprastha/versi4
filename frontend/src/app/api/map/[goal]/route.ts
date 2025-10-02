import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "";

function hasEnv() {
  return Boolean(url && key);
}

export async function GET(req: NextRequest, { params }: { params: { goal: string } }) {
  const goalStr = params.goal?.toString() || "1";
  const goal = parseInt(goalStr, 10);
  if (isNaN(goal) || goal < 1 || goal > 17) {
    return NextResponse.json({ error: "goal harus 1..17" }, { status: 400 });
  }

  if (!hasEnv()) {
    // Fallback demo data
    const demo = [
      { nama_desa: "RINGIN REJO", latitude: -7.806, longitude: 112.017, cluster: 0, arti_cluster: "Rendah", indikator: { "Contoh indikator A": 64, "Contoh indikator B": 1 } },
      { nama_desa: "SUKOREJO", latitude: -7.805, longitude: 112.020, cluster: 1, arti_cluster: "Sedang", indikator: { "Contoh indikator A": 21, "Contoh indikator B": 1 } },
      { nama_desa: "TUGU REJO", latitude: -7.800, longitude: 112.025, cluster: 2, arti_cluster: "Tinggi", indikator: { "Contoh indikator A": 78, "Contoh indikator B": 1 } },
      { nama_desa: "WATES", latitude: -7.803, longitude: 112.015, cluster: 0, arti_cluster: "Rendah", indikator: { "Contoh indikator A": 8, "Contoh indikator B": 1 } },
      { nama_desa: "TULUNGREJO", latitude: -7.799, longitude: 112.010, cluster: 1, arti_cluster: "Sedang", indikator: { "Contoh indikator A": 35, "Contoh indikator B": 1 } },
      { nama_desa: "PURWOREJO", latitude: -7.807, longitude: 112.030, cluster: 3, arti_cluster: "Sangat Tinggi", indikator: { "Contoh indikator A": 90, "Contoh indikator B": 1 } },
      { nama_desa: "SUMBERARUM", latitude: -7.802, longitude: 112.018, cluster: 0, arti_cluster: "Rendah", indikator: { "Contoh indikator A": 11, "Contoh indikator B": 1 } },
      { nama_desa: "MOJOREJO", latitude: -7.804, longitude: 112.022, cluster: 1, arti_cluster: "Sedang", indikator: { "Contoh indikator A": 21, "Contoh indikator B": 1 } },
    ];
    return NextResponse.json(demo);
  }

  const supabase = createClient(url, key);
  const tableName = `sdgs_${goal}`;

  // Ambil semua kolom dari tabel sdgs_{goal}
  const { data: sdgs, error: err1 } = await supabase.from(tableName).select("*");
  if (err1) {
    return NextResponse.json({ error: err1.message, tableName }, { status: 500 });
  }
  if (!sdgs || sdgs.length === 0) {
    return NextResponse.json([]);
  }

  // Ambil lokasi
  const { data: lokasi, error: err2 } = await supabase.from("location_village").select("*");
  if (err2) {
    return NextResponse.json({ error: err2.message }, { status: 500 });
  }
  const lokasiMap: Record<string, any> = {};
  (lokasi || []).forEach((row: any) => {
    lokasiMap[(row.nama_desa || "").trim().toUpperCase()] = { lat: row.latitude, lon: row.longitude };
  });

  // Dapatkan daftar kode_kolom dinamis dari tabel sdgs_{goal}
  const sample = sdgs[0];
  const fieldNames = Object.keys(sample).filter(k => !["nama_desa","cluster","arti_cluster"].includes(k));
  if (fieldNames.length === 0) {
    return NextResponse.json(sdgs.map((row: any) => ({
      nama_desa: row.nama_desa,
      latitude: lokasiMap[(row.nama_desa||"").trim().toUpperCase()]?.lat ?? null,
      longitude: lokasiMap[(row.nama_desa||"").trim().toUpperCase()]?.lon ?? null,
      cluster: row.cluster ?? null,
      arti_cluster: row.arti_cluster ?? "",
      indikator: {}
    })));
  }

  // Ambil label dari feature_label
  const { data: labels, error: err3 } = await supabase
    .from("feature_label")
    .select("kode_kolom, arti_data")
    .in("kode_kolom", fieldNames);
  if (err3) {
    return NextResponse.json({ error: err3.message }, { status: 500 });
  }
  const labelMap: Record<string, string> = {};
  (labels || []).forEach((r: any) => (labelMap[(r.kode_kolom || "").toLowerCase()] = r.arti_data || r.kode_kolom));

  // Bentuk payload final
  const result = sdgs.map((row: any) => {
    const indikator: Record<string, any> = {};
    fieldNames.forEach((k) => {
      const pretty = labelMap[k.toLowerCase()] || k;
      indikator[pretty] = row[k];
    });
    const lv = lokasiMap[(row.nama_desa || "").trim().toUpperCase()] || {};
    return {
      nama_desa: row.nama_desa,
      latitude: lv.lat ?? null,
      longitude: lv.lon ?? null,
      cluster: row.cluster ?? null,
      arti_cluster: row.arti_cluster ?? "",
      indikator,
    };
  });

  return NextResponse.json(result);
}
