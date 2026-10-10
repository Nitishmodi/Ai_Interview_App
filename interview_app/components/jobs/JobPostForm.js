"use client";

import { useFormState } from "react-dom";
import { saveJob } from "@/lib/jobs/actions";
import { Field, FormError, choiceClass, inputClass } from "@/components/Field";
import SubmitButton from "@/components/SubmitButton";

export default function JobPostForm({ job }) {
  const [state, action] = useFormState(saveJob, { error: "" });

  return (
    <form action={action} className="space-y-8">
      {job ? <input type="hidden" name="jobId" value={job.id} /> : null}

      <section className="space-y-5">
        <FormHeading title="The role" copy="The facts a candidate sees before they read the brief." />
        <Field label="Role title">
          <input className={inputClass} name="title" defaultValue={job?.title} placeholder="Backend engineer" required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Department">
            <input className={inputClass} name="department" defaultValue={job?.department} placeholder="Platform" />
          </Field>
          <Field label="Location">
            <input className={inputClass} name="location" defaultValue={job?.location} placeholder="Bengaluru or remote" />
          </Field>
          <Field label="Employment">
            <select className={inputClass} name="employmentType" defaultValue={job?.employmentType || "Full-time"}>
              <option>Full-time</option>
              <option>Contract</option>
              <option>Intern</option>
            </select>
          </Field>
          <Field label="Experience" hint="What you expect, such as 2-4 years.">
            <input className={inputClass} name="experienceYears" defaultValue={job?.experienceYears} placeholder="2-4 years" required />
          </Field>
        </div>
        <Field label="Skills" hint="Comma separated. Matching and the interview both start from this list.">
          <input className={inputClass} name="skills" defaultValue={job?.skills} placeholder="Node.js, PostgreSQL, system design" required />
        </Field>
      </section>

      <section className="space-y-5">
        <FormHeading title="The brief" copy="Write it the way you would hand it to someone joining the team." />
        <Field label="About the role" hint="A short picture of the work. Two or three sentences.">
          <textarea className={`${inputClass} min-h-28`} name="summary" defaultValue={job?.summary || (!job?.responsibilities ? job?.description : "") || ""} required />
        </Field>
        <Field label="What they will do" hint="One responsibility per line.">
          <textarea
            className={`${inputClass} min-h-36`}
            name="responsibilities"
            defaultValue={job?.responsibilities || ""}
            placeholder={"Own the path from a slow query to a shipped fix\nReview designs with the people who page you"}
            required
          />
        </Field>
        <Field label="What they bring" hint="One requirement per line.">
          <textarea
            className={`${inputClass} min-h-36`}
            name="requirements"
            defaultValue={job?.requirements || ""}
            placeholder={"Three or more years shipping backend services\nComfort reading a production incident without a runbook"}
            required
          />
        </Field>
      </section>

      <fieldset>
        <FormHeading title="Who can see it" copy="A draft stays on your desk until you open it." />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={choiceClass}>
            <input type="radio" name="visibility" value="draft" defaultChecked={!job || job.status !== "visible"} className="sr-only" />
            <span className="block font-semibold">Draft</span>
            <span className="mt-1 block text-sm text-[#9c9890]">Hidden from candidates.</span>
          </label>
          <label className={choiceClass}>
            <input type="radio" name="visibility" value="visible" defaultChecked={job?.status === "visible"} className="sr-only" />
            <span className="block font-semibold">Visible</span>
            <span className="mt-1 block text-sm text-[#9c9890]">Shown on matching candidate desks.</span>
          </label>
        </div>
      </fieldset>

      <FormError message={state?.error} />
      <SubmitButton label={job ? "Save role" : "Create role"} pendingLabel="Saving…" />
    </form>
  );
}

function FormHeading({ title, copy }) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-[#9c9890]">{copy}</p>
    </div>
  );
}
