import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { ScreenRail } from "@/components/shell/ScreenRail";
import SideNav from "@/components/shell/SideNav";
import { brand } from "@/lib/brand";

export default function AppShell({ user, items, children }) {
  return (
    <div className="desk min-h-screen bg-[#e7eef5] text-[#152033]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-[#10243f] px-4 py-6 text-white lg:flex">
        <Link href={items[0].href} className="px-3 text-[15px] font-semibold tracking-tight">
          {brand}
        </Link>
        <p className="mt-1 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8ee0d6]">
          {user.role === "recruiter" ? "Recruiter" : "Candidate"}
        </p>
        <div className="mt-8 min-h-0 flex-1 overflow-y-auto pb-6">
          <SideNav items={items} />
          <ScreenRail />
        </div>
        <div className="border-t border-white/10 px-3 pt-4">
          <p className="truncate text-sm font-medium">{user.fullName}</p>
          <p className="truncate text-xs text-white/50">{user.email}</p>
          <form action={signOut} className="mt-3">
            <button type="submit" className="text-sm text-white/70 hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-[#d5e0ea] bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-8">
            <p className="text-sm font-semibold lg:hidden">{brand}</p>
            <p className="hidden text-sm text-[#5d6d7e] lg:block">{user.role === "recruiter" ? "Hiring desk" : "Your desk"}</p>
            <div className="ml-auto flex items-center gap-4 lg:hidden">
              <p className="text-sm font-medium">{user.fullName}</p>
              <form action={signOut}>
                <button type="submit" className="text-sm text-[#5d6d7e]">Sign out</button>
              </form>
            </div>
          </div>
          <div className="overflow-x-auto border-t border-[#e4ebf2] bg-[#10243f] px-4 py-2 lg:hidden">
            <SideNav items={items} />
          </div>
          <ScreenRail placement="top" />
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
