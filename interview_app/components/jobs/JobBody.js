import { splitSkills } from "@/lib/format";
import { linesOf } from "@/lib/jobs/brief";

export default function JobBody({ job }) {
  const responsibilities = linesOf(job.responsibilities);
  const requirements = linesOf(job.requirements);
  const skills = splitSkills(job.skills);
  const structured = Boolean(job.summary || responsibilities.length || requirements.length);

  return (
    <div className="space-y-8">
      {skills.length ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="rounded-full border border-white/10 bg-[#141820] px-3 py-1 text-sm">
              {skill}
            </span>
          ))}
        </div>
      ) : null}
      {structured ? (
        <>
          {job.summary ? <Block title="About the role" copy={job.summary} /> : null}
          {responsibilities.length ? <Points title="What you will do" items={responsibilities} /> : null}
          {requirements.length ? <Points title="What you bring" items={requirements} /> : null}
        </>
      ) : (
        <Block title="About the role" copy={job.description} />
      )}
    </div>
  );
}

function Block({ title, copy }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#ffb195]">{title}</h2>
      <p className="mt-3 max-w-3xl whitespace-pre-wrap text-[15px] leading-7 text-[#e7e2d8]">{copy}</p>
    </section>
  );
}

function Points({ title, items }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#ffb195]">{title}</h2>
      <ul className="mt-3 max-w-3xl space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[15px] leading-7 text-[#e7e2d8]">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff5a1f]" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
