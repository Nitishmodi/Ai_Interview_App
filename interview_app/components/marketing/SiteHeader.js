"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  ["#product", "Product"],
  ["#teams", "For teams"],
  ["#candidates", "For candidates"],
  ["#path", "How it runs"],
  ["#questions", "Questions"],
];

export default function SiteHeader({ signedIn, deskHref }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c0e12]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="text-[15px] font-semibold tracking-tight text-white">
          DevPilot AI
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-[#c8c6bf] md:flex">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="nav-link hover:text-white">
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {signedIn ? (
            <Link href={deskHref} className="press rounded-full bg-[#ff5a1f] px-4 py-2 text-sm font-semibold text-white">
              Open desk
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="px-3 py-2 text-sm font-medium text-[#e7e4dc]">
                Sign in
              </Link>
              <Link href="/sign-up" className="press rounded-full bg-[#ff5a1f] px-4 py-2 text-sm font-semibold text-white">
                Create account
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white md:hidden"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open ? (
        <div className="border-t border-white/10 px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm text-[#e7e4dc]">
            {links.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
            {signedIn ? (
              <Link href={deskHref} className="press mt-2 w-fit rounded-full bg-[#ff5a1f] px-4 py-2 font-semibold text-white">
                Open desk
              </Link>
            ) : (
              <div className="mt-2 flex gap-3">
                <Link href="/sign-in" className="rounded-full border border-white/15 px-4 py-2">Sign in</Link>
                <Link href="/sign-up" className="press rounded-full bg-[#ff5a1f] px-4 py-2 font-semibold text-white">Create account</Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
