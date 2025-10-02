import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as tf from "@tensorflow/tfjs";
import { KMeans, setBackend } from "scikitjs";

export const runtime = "nodejs";
await setBackend(tf);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

function parseBool(v: string | null, def=false) {
  if (v === null) return def;
  const s = v.toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sdgs = (searchParams.get("sdgs") || "1").trim();
  const k = Math.max(2, Math.min(8, Number(searchParams.get("k") || 2)));
  const persist = parseBool(searchParams.get("persist"), false);

  if (!/^([1-9]|1[0-7])$/.test(sdgs)) {
    return NextResponse.json({ error: "sdgs must be 1..17" }, { status: 400 });
  }
  const table = `sdgs_${sdgs}`;

  // Base data
  const { data, error } = await supabase.from(table).select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ error: "No data" }, { status: 404 });

  // Locations
  const { data: lokasi, error: err2 } = await supabase
    .from("location_village")
    .select("nama_desa, latitude, longitude");
  if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });

  const lokasiMap: Record<string, {latitude:number; longitude:number}> = {};
  (lokasi || []).forEach((l: any) => {
    lokasiMap[l.nama_desa] = { latitude: l.latitude, longitude: l.longitude };
  });

  // Numeric columns
  const cols = Object.keys(data[0]).filter(
    (c) => !["nama_desa", "cluster", "arti_cluster"].includes(c)
  );
  const X = data.map((row: any) => cols.map((c) => Number(row[c] ?? 0)));

  // KMeans
  const km = new KMeans({ k, maxIter: 200, randomState: 42 });
  const fit = km.fit(X);
  const nameFor = (idx: number) => (idx === 0 ? "Indikator Lebih Tinggi" : "Indikator Lebih Rendah");

  const result = data.map((row: any, i: number) => ({
    nama_desa: row.nama_desa,
    cluster: fit.labels[i],
    arti_cluster: nameFor(fit.labels[i]),
    location_village: lokasiMap[row.nama_desa] || null,
    indikator: Object.fromEntries(cols.map((c, j) => [c, X[i][j]])),
  }));

  if (persist) {
    const updates = result.map((r) => ({
      nama_desa: r.nama_desa,
      cluster: r.cluster,
      arti_cluster: r.arti_cluster,
    }));
    const { error: upErr } = await supabase.from(table).upsert(updates, { onConflict: "nama_desa" });
    if (upErr) {
      return NextResponse.json({ error: "Persist failed: " + upErr.message, result }, { status: 500 });
    }
  }

  return NextResponse.json(result);
}
