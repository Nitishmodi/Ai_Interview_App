"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { signIn } from "@/lib/actions/auth";
import { Field, FormError, inputClass } from "@/components/Field";
import SubmitButton from "@/components/SubmitButton";

export default function SignInForm() {
  const [state, action] = useFormState(signIn, { error: "" });

  return (
    <form action={action} className="space-y-5">
      <Field label="Email">
        <input className={inputClass} name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password">
        <input className={inputClass} name="password" type="password" autoComplete="current-password" required />
      </Field>
      <FormError message={state?.error} />
      <SubmitButton label="Sign in" pendingLabel="Signing in…" />
      <p className="text-sm text-[#9c9890]">
        New here?{" "}
        <Link href="/sign-up" className="font-semibold text-white underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
