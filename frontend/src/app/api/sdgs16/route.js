import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

export async function GET() {
  const { data: rows, error } = await supabase.from("sdgs_16").select("*");
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const { data: labels } = await supabase
    .from("feature_label")
    .select("kode_kolom,nama_kolom,arti_data");

  const labelMap = {}
  if (labels) {
    labels.forEach((l) => {
      labelMap[l.kode_kolom] = { nama: l.nama_kolom, arti: l.arti_data };
    });
  }

  const mapped = rows.map((row) => {
    const newRow = { nama_desa: row.nama_desa };
    Object.keys(row).forEach((k) => {
      if (k !== "nama_desa" && labelMap[k]) {
        const artiData = labelMap[k].arti;
        if (artiData && artiData.includes("=")) {
          const mapping = {}
          artiData.split(",").forEach((p) => {
            const [val, label] = p.split("=");
            if (val && label) mapping[val.trim()] = label.trim();
          });
          newRow[labelMap[k].nama] = mapping[row[k]] || row[k];
        } else {
          newRow[labelMap[k].nama] = row[k];
        }
      }
    });
    return newRow;
  });

  return new Response(JSON.stringify(mapped), { status: 200 });
}
