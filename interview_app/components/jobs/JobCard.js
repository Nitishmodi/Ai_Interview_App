import Link from "next/link";
import { splitSkills } from "@/lib/format";
import { previewLine } from "@/lib/jobs/brief";

export default function JobCard({ href, job, badge, note, extra }) {
  const skills = splitSkills(job.skills).slice(0, 4);
  const meta = [job.department, job.location, job.experienceYears, extra].filter(Boolean).join(" · ");

  return (
    <Link href={href} className="lift group block rounded-3xl border border-white/10 bg-[#141820] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold tracking-tight">{job.title}</p>
          <p className="mt-1 text-sm text-[#9c9890]">{meta}</p>
        </div>
        {badge}
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#c9c4b8]">{previewLine(job)}</p>
      {skills.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-[#e7e2d8] transition group-hover:bg-white/10">
              {skill}
            </span>
          ))}
        </div>
      ) : null}
      {note ? <p className="mt-3 text-sm text-[#ffb195]">{note}</p> : null}
    </Link>
  );
}
