export const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0c0e12] px-3 py-2.5 text-[15px] text-[#f3f0e8] outline-none transition placeholder:text-[#6f6b64] focus:border-[#ff5a1f] focus:shadow-[0_0_0_3px_rgba(255,90,31,0.15)]";

export const primaryClass =
  "press inline-flex items-center justify-center rounded-full bg-[#ff5a1f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#ff6a36] disabled:cursor-wait disabled:opacity-60";

export const quietClass =
  "press inline-flex items-center justify-center rounded-full border border-white/15 bg-transparent px-4 py-2.5 text-sm font-semibold text-[#f3f0e8] hover:border-white/40 disabled:opacity-60";

export const choiceClass =
  "choice lift cursor-pointer rounded-2xl border border-white/10 bg-[#141820] px-4 py-3 has-[:checked]:border-[#ff5a1f] has-[:checked]:bg-[#2a160f]";

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-[#f3f0e8]">{label}</span>
      {hint ? <span className="mt-1 block text-sm leading-5 text-[#9c9890]">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-[#ffb4a8]">
      {message}
    </p>
  );
}
