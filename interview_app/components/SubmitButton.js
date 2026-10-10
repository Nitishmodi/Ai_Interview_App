"use client";

import { useFormStatus } from "react-dom";
import { primaryClass } from "@/components/Field";

export default function SubmitButton({ label, pendingLabel, className = primaryClass }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : label}
    </button>
  );
}
