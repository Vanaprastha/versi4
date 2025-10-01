
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("sdgs_1")
    .select(`
      nama_desa,
      cluster,
      arti_cluster,
      r710,
      r1502_7,
      r1502_8,
      r1502_4,
      r1502_9,
      location_village ( latitude, longitude )
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: labels, error: labelErr } = await supabase
    .from("feature_label")
    .select("kode_kolom, arti_data");

  if (labelErr) {
    return NextResponse.json({ error: labelErr.message }, { status: 500 });
  }

  const mapping: Record<string, string> = {};
  (labels || []).forEach((row: any) => { mapping[row.kode_kolom] = row.arti_data; });

  const keys = ["r710","r1502_7","r1502_8","r1502_4","r1502_9"];
  const transformed = (data || []).map((row: any) => {
    const indikator: Record<string, number> = {};
    for (const k of keys) indikator[mapping[k] || k] = row[k];
    return { ...row, indikator };
  });

  return NextResponse.json(transformed);
}
