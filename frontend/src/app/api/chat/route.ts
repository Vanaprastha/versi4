import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- fungsi deteksi SDG yang ditanya
function detectTargetTables(question: string): number[] {
  const nums = Array.from(
    new Set(
      (question.match(/\b(1?[0-7]|[1-9])\b/g) || []).map((n) =>
        parseInt(n, 10)
      )
    )
  ).filter((n) => n >= 1 && n <= 17);

  // 👉 Kalau tidak ada angka SDG ditemukan, ambil SEMUA SDG 1–17
  return nums.length ? nums : Array.from({ length: 17 }, (_, i) => i + 1);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question: string = (body?.q || body?.question || "").toString();

    if (!question.trim()) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400 }
      );
    }

    const targets = detectTargetTables(question);
    const previews: Record<string, any[]> = {};

    for (const n of targets) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/sdgs${n}`
        );
        if (!res.ok) continue; // skip kalau endpoint gak ada
        const data = await res.json();
        previews[`sdgs_${n}`] = data;
      } catch {
        // kalau ada error fetch, lanjut ke sdg lain
        continue;
      }
    }

    const prompt = [
      "Anda adalah asisten data untuk dashboard SDGs desa.",
      `Pertanyaan pengguna: "${question}"`,
      "",
      "Berikut cuplikan data hasil mapping label dari berbagai SDG:",
      Object.entries(previews)
        .map(
          ([table, rows]) =>
            `${table} (contoh hasil untuk 8 desa):\n${JSON.stringify(
              (rows as any[]).slice(0, 8),
              null,
              2
            )}`
        )
        .join("\n\n"),
      "",
      "Instruksi:",
      "- Jawablah dengan bahasa informatif dan runtut.",
      "- Jika pertanyaan umum (misalnya 'apa saja yang kamu ketahui'), berikan gambaran ringkas untuk semua SDG yang tersedia (1–17), sebutkan indikator penting yang ada di tiap tabel.",
      "- Jika pertanyaan menyebut SDG tertentu, fokuslah menjawab dengan data dari SDG tersebut.",
      "- Selalu gunakan nama kolom yang jelas (bukan kode) dan jelaskan makna datanya.",
      "- Tutup jawaban dengan pertanyaan balik seperti: 'Apakah ada SDG tertentu yang ingin Anda gali lebih dalam?'"
    ].join("\n");

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return new Response(
      JSON.stringify({ answer, previews, used: targets }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Unknown error" }),
      { status: 500 }
    );
  }
}

