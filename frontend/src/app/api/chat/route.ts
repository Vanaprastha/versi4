import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });


// --- fungsi deteksi SDG yang ditanya
function detectTargetTables(question: string): number[] {
  const nums = Array.from(new Set((question.match(/\b(1?[0-7]|[1-9])\b/g) || []).map(n => parseInt(n, 10))))
    .filter(n => n >= 1 && n <= 17);
  return nums.length ? nums : [1];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question: string = (body?.question || "").toString();
    if (!question) {
      return new Response(JSON.stringify({ error: "Question is required" }), { status: 400 });
    }

    const targets = detectTargetTables(question);
    const previews: Record<string, any[]> = {};

    for (const n of targets) {
      // 🔑 Ambil dari endpoint API kita sendiri
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/sdgs${n}`);
      const data = await res.json();
      previews[`sdgs_${n}`] = data;
    }

    const prompt = [
      "Anda adalah asisten data untuk dashboard SDGs desa.",
      `Pertanyaan pengguna: "${question}"`,
      "",
      "Berikut cuplikan data hasil mapping label:",
      Object.entries(previews)
        .map(([table, rows]) => `${table} (Hasil untuk 8 desa tersedia):\n${JSON.stringify((rows as any[]).slice(0, 8), null, 2)}`)
        .join("\n\n"),
      "",
      "Instruksi:",
      "- Jelaskan jawaban berdasarkan data di atas.",
      "- Gunakan nama kolom yang sudah jelas (bukan kode).",
    ].join("\n");

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return new Response(JSON.stringify({ answer, previews, used: targets }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), { status: 500 });
  }
}

