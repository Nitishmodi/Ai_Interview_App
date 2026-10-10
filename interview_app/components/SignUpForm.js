"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { Field, FormError, choiceClass, inputClass } from "@/components/Field";
import SubmitButton from "@/components/SubmitButton";

export default function SignUpForm() {
  const [state, action] = useFormState(signUp, { error: "" });
  const [role, setRole] = useState("");

  return (
    <form action={action} className="space-y-5">
      <Field label="Full name">
        <input className={inputClass} name="fullName" autoComplete="name" required />
      </Field>
      <Field label="Email">
        <input className={inputClass} name="email" type="email" autoComplete="email" required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" hint="At least 8 characters.">
          <input className={inputClass} name="password" type="password" autoComplete="new-password" required />
        </Field>
        <Field label="Confirm password">
          <input className={inputClass} name="confirm" type="password" autoComplete="new-password" required />
        </Field>
      </div>
      <fieldset>
        <legend className="text-sm font-semibold">Profile</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {[
            ["recruiter", "Recruiter", "Post roles, read scorecards, decide who moves on."],
            ["candidate", "Candidate", "See matching roles and take the screen."],
          ].map(([value, title, copy]) => (
            <label key={value} className={choiceClass}>
              <input className="sr-only" type="radio" name="role" value={value} required checked={role === value} onChange={() => setRole(value)} />
              <span className="block font-semibold">{title}</span>
              <span className="mt-1 block text-sm leading-5 text-[#9c9890]">{copy}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {role === "candidate" ? (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#141820] p-4">
          <Field label="Role you want" hint="Used to rank open jobs.">
            <input className={inputClass} name="targetRole" placeholder="Backend engineer" />
          </Field>
          <Field label="Years of experience">
            <input className={inputClass} name="experienceYears" placeholder="3" />
          </Field>
          <Field label="Skills" hint="Comma separated.">
            <input className={inputClass} name="skills" placeholder="Node.js, PostgreSQL, React" />
          </Field>
        </div>
      ) : null}
      <FormError message={state?.error} />
      <SubmitButton label="Create account" pendingLabel="Creating account…" />
      <p className="text-sm text-[#9c9890]">
        Already registered?{" "}
        <Link href="/sign-in" className="font-semibold text-white underline">Sign in</Link>
      </p>
    </form>
  );
}
