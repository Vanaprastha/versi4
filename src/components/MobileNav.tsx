"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/",          label: "Dashboard" },
  { href: "/prediksi",  label: "Prediksi" },
  { href: "/clustering",label: "Clustering" },
  { href: "/chatbot",   label: "Chatbot" },
  { href: "/tentang",   label: "Tentang" },
  { href: "/upload",    label: "Upload" },
  { href: "/penggaturan", label: "Penggaturan" },
] as const;

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="glass-2 sticky top-0 z-30 w-full overflow-x-auto no-scrollbar glass-2 rounded-2xl p-2 mb-3 sticky top-0 z-50">
      <ul className="flex items-center gap-2 py-2 px-2 min-w-full flex gap-2 overflow-x-auto no-scrollbar">
        {items.map(it => {
          const active = pathname === it.href;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={`px-3 py-2 rounded-xl text-sm whitespace-nowrap transition
                  ${active ? "bg-white/20" : "bg-white/10 hover:bg-white/20"}`}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
