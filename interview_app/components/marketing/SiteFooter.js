import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      ["#product", "What it is"],
      ["#path", "How a role moves"],
      ["#questions", "Questions"],
    ],
  },
  {
    title: "Desks",
    links: [
      ["#teams", "Hiring teams"],
      ["#candidates", "Candidates"],
      ["/sign-up", "Create a profile"],
    ],
  },
  {
    title: "Account",
    links: [
      ["/sign-in", "Sign in"],
      ["/sign-up", "Create account"],
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#090b0e]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="text-lg font-semibold text-white">DevPilot AI</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-[#9c9890]">
            A hiring product for the people posting the role and the people applying to it.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ffb195]">{column.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-[#d5d1c8]">
              {column.links.map(([href, label]) => (
                <li key={label}>
                  {href.startsWith("/") ? (
                    <Link href={href} className="transition hover:text-white">{label}</Link>
                  ) : (
                    <a href={href} className="transition hover:text-white">{label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-sm text-[#8d897f]">
          <p>© {new Date().getFullYear()} DevPilot AI</p>
          <div className="flex flex-wrap gap-5">
            <a className="hover:text-white" href="mailto:nitishmodi200@gmail.com">nitishmodi200@gmail.com</a>
            <a className="hover:text-white" href="https://github.com/Nitishmodi/Ai_Interview_App">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
