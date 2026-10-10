"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { setJobVisibility } from "@/lib/jobs/actions";
import { FormError, quietClass } from "@/components/Field";

const options = [
  ["visible", "Show to candidates"],
  ["draft", "Hide as draft"],
  ["closed", "Close role"],
];

export default function VisibilityForm({ jobId, status }) {
  const router = useRouter();
  const [state, action] = useFormState(setJobVisibility, { error: "" });

  useEffect(() => {
    if (state?.saved) router.refresh();
  }, [state?.saved, router]);

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="jobId" value={jobId} />
      {options
        .filter(([value]) => value !== status)
        .map(([value, label]) => (
          <button key={value} type="submit" name="status" value={value} className={quietClass}>
            {label}
          </button>
        ))}
      <FormError message={state?.error} />
    </form>
  );
}
