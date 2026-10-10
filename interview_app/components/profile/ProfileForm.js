"use client";

import { useFormState } from "react-dom";
import { saveAccount } from "@/lib/profile/actions";
import { Field, FormError, inputClass } from "@/components/Field";
import SubmitButton from "@/components/SubmitButton";

export default function ProfileForm({ user }) {
  const [state, action] = useFormState(saveAccount, { error: "" });
  const candidate = user.role === "candidate";

  return (
    <form action={action} className="max-w-xl space-y-8">
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="mt-1 text-sm text-[#5d6d7e]">This is the name and email on the desk, and the email you sign in with.</p>
        </div>
        <Field label="Name">
          <input className={inputClass} name="fullName" defaultValue={user.fullName || ""} required />
        </Field>
        <Field label="Email">
          <input className={inputClass} type="email" name="email" defaultValue={user.email || ""} required />
        </Field>
      </section>

      {candidate ? (
        <section className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Matching</h2>
            <p className="mt-1 text-sm text-[#5d6d7e]">Open roles are ordered from the work you want, your years, and your skills.</p>
          </div>
          <Field label="Role you want">
            <input className={inputClass} name="targetRole" defaultValue={user.targetRole || ""} required />
          </Field>
          <Field label="Years of experience">
            <input className={inputClass} name="experienceYears" defaultValue={user.experienceYears || ""} required />
          </Field>
          <Field label="Skills" hint="Comma separated.">
            <input className={inputClass} name="skills" defaultValue={user.skills || ""} required />
          </Field>
        </section>
      ) : null}

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold">Password</h2>
          <p className="mt-1 text-sm text-[#5d6d7e]">Leave these blank to keep the password you have.</p>
        </div>
        <Field label="Current password">
          <input className={inputClass} type="password" name="currentPassword" autoComplete="current-password" />
        </Field>
        <Field label="New password">
          <input className={inputClass} type="password" name="nextPassword" autoComplete="new-password" />
        </Field>
        <Field label="Confirm new password">
          <input className={inputClass} type="password" name="confirmPassword" autoComplete="new-password" />
        </Field>
      </section>

      <FormError message={state?.error} />
      {state?.saved ? <p className="text-sm font-medium text-[#0c6e66]">Saved. The desk is using this profile.</p> : null}
      <SubmitButton label="Save profile" pendingLabel="Saving…" />
    </form>
  );
}
