import { NextRequest } from "next/server";\nimport { createClient } from "@supabase/supabase-js";\nimport { GoogleGenerativeAI } from "@google/generative-ai";\n\nexport const runtime = "nodejs";\n\nconst supabase = createClient(\n  process.env.NEXT_PUBLIC_SUPABASE_URL as string,\n  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string\n);\n\nconst genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);\nconst model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });\n\nfunction detectTargetTables(question: string): number[] {\n  const nums = Array.from(new Set((question.match(/\b(1?[0-7]|[1-9])\b/g) || []).map(n => parseInt(n, 10))))\n    .filter(n => n >= 1 && n <= 17);\n  return nums.length ? nums : [1];\n}\n\nexport async function POST(req: NextRequest) {\n  try {\n    const body = await req.json();\n    const question: string = (body?.question || "").toString();\n    if (!question) {\n      return new Resimport { NextRequest } from "next/server";
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
ponse(JSON.stringify({ error: "Question is required" }), { status: 400 });\n    }\n\n    const targets = detectTargetTables(question);\n    const previews: Record<string, any[]> = {};\n    const totals: Record<string, number> = {};\n\n    for (const n of targets) {\n      const table = `sdgs_${n}`;\n      const { data, error } = await supabase.from(table).select("*").limit(50);\n      if (error) {\n        return new Response(JSON.stringify({ error: `Supabase error on ${table}: ${error.message}` }), { status: 500 });\n      }\n      previews[table] = data || [];\n      if (data && data.length) {\n        const numericKeys = Object.keys(data[0] || {}).filter(k => k !== "nama_desa");\n        let sum = 0;\n        for (const row of data as any[]) {\n          for (const k of numericKeys) {\n            const v = Number((row as any)[k]);\n            if (!Number.isNaN(v)) sum += v;\n          }\n        }\n        totals[table] = sum;\n      }\n    }\n\n    const prompt = [\n      "Anda adalah asisten data untuk dashboard SDGs desa. Jawab secara ringkas, akurat, dan gunakan bahasa Indonesia yang sopan.",\n      `Pertanyaan pengguna: "${question}"`,\n      "",\n      "Berikut ringkasan data (cuplikan maksimal 50 baris per tabel):",\n      Object.entries(previews).map(([table, rows]) => `${table} (contoh 5 baris):\n${JSON.stringify((rows as any[]).slice(0,5), null, 2)}`).join("\n\n"),\n      "",\n      "Total numerik kasar (penjumlahan sederhana kolom numerik, bukan statistik resmi):",\n      JSON.stringify(totals, null, 2),\n      "",\n      "Instruksi:",\n      "- Jelaskan jawaban berdasarkan data di atas.",\n      "- Jika ada keterbatasan (misal hanya cuplikan), jelaskan singkat.",\n      "- Berikan saran visualisasi relevan (bar/pie) bila cocok, tapi jangan kirim kode.",\n      "- Jangan mengarang data di luar cuplikan."\n    ].join("\n");\n\n    const result = await model.generateContent(prompt);\n    const answer = result.response.text();\n\n    return new Response(JSON.stringify({ answer, previews, totals, used: targets }), { status: 200 });\n  } catch (err: any) {\n    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), { status: 500 });\n  }\n}
