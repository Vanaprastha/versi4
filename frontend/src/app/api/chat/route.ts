import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// ✅ gunakan new RegExp supaya tidak bentrok di build
const detectRegex = new RegExp("\\b(1?[0-7]|[1-9])\\b", "g");

function detectTargetTables(question: string): number[] {
  const nums = Array.from(
    new Set((question.match(detectRegex) || []).map((n) => parseInt(n, 10)))
  ).filter((n) => n >= 1 && n <= 17);
  return nums.length ? nums : [1];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question: string = (body?.question || "").toString();
    if (!question) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400 }
      );
    }

    const targets = detectTargetTables(question);
    const previews: Record<string, any[]> = {};
    const totals: Record<string, number> = {};

    for (const n of targets) {
      const table = `sdgs_${n}`;
      const { data, error } = await supabase.from(table).select("*").limit(50);
      if (error) {
        return new Response(
          JSON.stringify({
            error: `Supabase error on ${table}: ${error.message}`,
          }),
          { status: 500 }
        );
      }
      previews[table] = data || [];
      if (data && data.length) {
        const numericKeys = Object.keys(data[0] || {}).filter(
          (k) => k !== "nama_desa"
        );
        let sum = 0;
        for (const row of data as any[]) {
          for (const k of numericKeys) {
            const v = Number((row as any)[k]);
            if (!Number.isNaN(v)) sum += v;
          }
        }
        totals[table] = sum;
      }
    }

    // ✅ aman: pakai array.join dengan escape double-backslash
    const prompt = [
      "Anda adalah asisten data untuk dashboard SDGs desa. Jawab secara ringkas, akurat, dan gunakan bahasa Indonesia yang sopan.",
      `Pertanyaan pengguna: "${question}"`,
      "",
      "Berikut ringkasan data (cuplikan maksimal 50 baris per tabel):",
      Object.entries(previews)
        .map(
          ([table, rows]) =>
            `${table} (contoh 5 baris):\\n${JSON.stringify(
              (rows as any[]).slice(0, 5),
              null,
              2
            )}`
        )
        .join("\\n\\n"),
      "",
      "Total numerik kasar (penjumlahan sederhana kolom numerik, bukan statistik resmi):",
      JSON.stringify(totals, null, 2),
      "",
      "Instruksi:",
      "- Jelaskan jawaban berdasarkan data di atas.",
      "- Jika ada keterbatasan (misal hanya cuplikan), jelaskan singkat.",
      "- Berikan saran visualisasi relevan (bar/pie) bila cocok, tapi jangan kirim kode.",
      "- Jangan mengarang data di luar cuplikan.",
    ].join("\\n");

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return new Response(
      JSON.stringify({ answer, previews, totals, used: targets }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Unknown error" }),
      { status: 500 }
    );
  }
}
