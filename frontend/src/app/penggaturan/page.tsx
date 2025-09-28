"use client";
import { useEffect, useRef, useState } from "react";

function readStored<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (!v) return fallback;
    return JSON.parse(v);
  } catch {
    const v = localStorage.getItem(key);
    return (v as unknown as T) ?? fallback;
  }
}

export default function PenggaturanPage() {
  // Pending (belum diterapkan ke dokumen)
  const [pendingTheme, setPendingTheme] = useState<"light"|"dark">("dark");
  const [pendingBg, setPendingBg] = useState<string>("");

  // Snapshot yang sudah diterapkan (untuk info kecil)
  const [appliedTheme, setAppliedTheme] = useState<"light"|"dark">("dark");
  const [appliedBg, setAppliedBg] = useState<string>("");

  const fileRef = useRef<HTMLInputElement>(null);

  // Load preferensi awal
  useEffect(() => {
    try {
      const t = readStored<"light"|"dark">("sdgs_theme", "dark");
      const b = readStored<string>("sdgs_bg", "");
      setPendingTheme(t);
      setPendingBg(b || "");
      setAppliedTheme(t);
      setAppliedBg(b || "");
    } catch {}
  }, []);

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPendingBg(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function applySettings() {
    const html = document.documentElement;
    html.classList.remove("theme-light", "theme-dark");
    html.classList.add(pendingTheme === "light" ? "theme-light" : "theme-dark");

    if (pendingBg) {
      html.style.setProperty("--bg-url", `url(${pendingBg})`);
      localStorage.setItem("sdgs_bg", JSON.stringify(pendingBg));
    } else {
      html.style.setProperty("--bg-url", `url(/assets/background.webp)`);
      localStorage.removeItem("sdgs_bg");
    }

    localStorage.setItem("sdgs_theme", JSON.stringify(pendingTheme));

    setAppliedTheme(pendingTheme);
    setAppliedBg(pendingBg);

    // Mini feedback sederhana
    try {
      const btn = document.getElementById("btn-terapkan");
      if (btn) {
        const original = btn.textContent;
        btn.textContent = "Terapkan ✓";
        setTimeout(() => (btn.textContent = original || "Terapkan"), 1000);
      }
    } catch {}
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Penggaturan</h1>
      <p className="text-sm opacity-80">
        Ubah tema dan latar belakang sesuai selera. Setelah memilih, klik <b>Terapkan</b> biar perubahan diterapkan di seluruh dashboard. 😄
      </p>

      {/* Status ringkas */}
      <div className="glass-1 p-3 rounded-lg text-xs opacity-80">
        <div>Aktif sekarang: <b>{appliedTheme === "light" ? "Light" : "Dark"}</b> • Background: <b>{appliedBg ? "Kustom" : "Default"}</b></div>
      </div>

      {/* Tema (pending) */}
      <section className="glass-1 p-4 rounded-xl space-y-3">
        <h2 className="font-medium">Tema</h2>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={pendingTheme === "dark"}
              onChange={() => setPendingTheme("dark")}
            />
            <span>Dark</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={pendingTheme === "light"}
              onChange={() => setPendingTheme("light")}
            />
            <span>Light</span>
          </label>
        </div>
      </section>

      {/* Background (pending) */}
      <section className="glass-1 p-4 rounded-xl space-y-3">
        <h2 className="font-medium">Background</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <button
            onClick={() => setPendingBg("")}
            className="glass-2 rounded-lg p-3 text-left hover:opacity-90 transition"
          >
            <p className="font-medium">Default</p>
            <p className="text-xs opacity-70">Gunakan background bawaan</p>
          </button>

          <button
            onClick={() => setPendingBg("https://images.unsplash.com/photo-1503264116251-35a269479413?w=1600")}
            className="glass-2 rounded-lg p-3 text-left hover:opacity-90 transition"
          >
            <p className="font-medium">Pemandangan</p>
            <p className="text-xs opacity-70">gambar online (Unsplash)</p>
          </button>

          <div className="glass-2 rounded-lg p-3">
            <p className="font-medium mb-2">Upload Gambar Sendiri</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} />
            <p className="text-xs opacity-70 mt-1">Silahkan unggah file berformat .webp maksimal 400 kb</p>
          </div>
        </div>

        {pendingBg && (
          <div className="mt-4">
            <p className="text-sm mb-2">Pratinjau (belum diterapkan):</p>
            <div className="rounded-lg overflow-hidden border border-white/10">
              <img src={pendingBg} alt="Preview" className="w-full max-h-64 object-cover" />
            </div>
          </div>
        )}
      </section>

      <div className="flex items-center gap-3">
        <button
          id="btn-terapkan"
          onClick={applySettings}
          className="px-4 py-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 transition text-black font-medium"
          aria-label="Terapkan pengaturan tema & background"
        >
          Terapkan
        </button>
        <button
          onClick={() => { setPendingTheme(appliedTheme); setPendingBg(appliedBg); }}
          className="px-4 py-2 rounded-lg glass-2 hover:opacity-90 transition"
        >
          Kembalikan ke setelan awal
        </button>
      </div>
    </div>
  );
}
