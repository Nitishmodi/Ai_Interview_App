export function SectionPie({ mcq, voice, communication }) {
  const slices = [
    { label: "Skills", value: mcq, color: "#ff5a1f" },
    { label: "Voice", value: voice, color: "#f3f0e8" },
    { label: "Communication", value: communication, color: "#7f8cff" },
  ];
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let cursor = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 140 140" className="h-36 w-36" aria-hidden="true">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#2a2e36" strokeWidth="16" />
        {slices.map((slice) => {
          const length = (slice.value / total) * circumference;
          const dash = `${length} ${circumference - length}`;
          const offset = cursor;
          cursor += length;
          return (
            <circle
              key={slice.label}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth="16"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
            />
          );
        })}
      </svg>
      <ul className="space-y-2 text-sm">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: slice.color }} />
            <span>{slice.label}</span>
            <span className="font-semibold tabular-nums">{slice.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScoreBars({ rows, mark = 80 }) {
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="font-medium">{row.label}</span>
            <span className="tabular-nums">{row.value}%</span>
          </div>
          <div className="relative h-2 rounded-full bg-white/10">
            <div className="absolute bottom-0 top-0 w-px bg-[#ff5a1f]" style={{ left: `${mark}%` }} />
            <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(0, Math.min(100, row.value))}%` }} />
          </div>
        </div>
      ))}
      <p className="text-xs text-[#9c9890]">The orange line is {mark}%. A section has to clear it.</p>
    </div>
  );
}
