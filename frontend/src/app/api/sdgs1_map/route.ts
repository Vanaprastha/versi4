import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export async function GET() {
  // Join sdgs_1 with location_village by nama_desa (FK required)
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
      location_village (
        latitude,
        longitude
      )
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // Filter out rows without coordinates
  const cleaned = (data ?? []).filter((d: any) => d?.location_village?.latitude && d?.location_village?.longitude);
  return NextResponse.json(cleaned);
}
