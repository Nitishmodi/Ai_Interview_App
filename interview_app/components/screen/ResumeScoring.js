"use client";

import { useState } from "react";
import { finishAttempt } from "@/lib/screening/actions";
import { FormError, primaryClass } from "@/components/Field";

export default function ResumeScoring({ attemptId, answers }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#141820] p-6">
      <h1 className="text-2xl font-semibold">The answers are saved</h1>
      <p className="mt-2 text-sm text-[#9c9890]">The scorecard did not finish. You can run it again without retaking the screen.</p>
      <button
        type="button"
        className={`${primaryClass} mt-5`}
        disabled={pending}
        onClick={async () => {
          setPending(true);
          const result = await finishAttempt(attemptId, answers);
          if (result?.error) {
            setError(result.error);
            setPending(false);
          }
        }}
      >
        {pending ? "Scoring the screen…" : "Write the scorecard"}
      </button>
      <div className="mt-3">
        <FormError message={error} />
      </div>
    </div>
  );
}
