"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNav({ items }) {
  const path = usePathname();
  const groups = [];
  items.forEach((item) => {
    const name = item.group || "Desk";
    const group = groups.find((entry) => entry.name === name);
    if (group) group.items.push(item);
    else groups.push({ name, items: [item] });
  });

  return (
    <div className="flex gap-4 lg:flex-col lg:gap-6">
      {groups.map((group) => (
        <div key={group.name}>
          <p className="mb-2 hidden px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40 lg:block">{group.name}</p>
          <nav className="flex gap-1 lg:flex-col">
            {group.items.map((item) => {
              const current = item.exact
                ? path === item.href
                : item.href.endsWith("/jobs")
                  ? path === item.href || /\/jobs\/\d+/.test(path)
                  : path === item.href || path.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${current ? "bg-[#0e7c74] text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}
