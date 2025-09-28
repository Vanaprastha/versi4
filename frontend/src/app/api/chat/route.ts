import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const { q } = await req.json();
  const answer = `Pertanyaan: ${q}\n(Jawaban contoh) SDG terkait: 3, 6, 11.`;
  return NextResponse.json({ answer });
}
