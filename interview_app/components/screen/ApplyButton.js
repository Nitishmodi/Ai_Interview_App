"use client";

import { useFormState } from "react-dom";
import { startAttempt } from "@/lib/screening/actions";
import { FormError } from "@/components/Field";
import SubmitButton from "@/components/SubmitButton";

export default function ApplyButton({ jobId, label = "Apply and start the screen" }) {
  const [state, action] = useFormState(startAttempt, { error: "" });

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="jobId" value={jobId} />
      <SubmitButton label={label} pendingLabel="Writing your questions…" />
      <FormError message={state?.error} />
    </form>
  );
}
