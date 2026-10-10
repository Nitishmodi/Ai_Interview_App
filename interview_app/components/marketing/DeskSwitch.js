"use client";

import { useState } from "react";

const modes = {
  recruiter: {
    label: "Recruiter desk",
    meta: "Platform · Bengaluru",
    status: "Open",
    title: "Platform engineer",
    copy: "Own the path from a slow query to a change that ships. Three to five years.",
    note: "2 scorecards waiting. Voice is the weak section on one of them.",
    action: "Open scorecard",
  },
  candidate: {
    label: "Candidate desk",
    meta: "Matched to you",
    status: "Strong",
    title: "Platform engineer",
    copy: "Your profile lines up on Node and Postgres. Applying starts the interview.",
    note: "One question is spoken. The rest are written from this role, not a generic bank.",
    action: "Apply",
  },
};

export default function DeskSwitch() {
  const [mode, setMode] = useState("recruiter");
  const view = modes[mode];

  return (
    <div className="drift rounded-[28px] border border-white/10 bg-[#141820]/90 p-5 shadow-[0_40px_90px_rgba(0,0,0,0.4)] backdrop-blur">
      <div className="flex gap-2">
        {Object.entries(modes).map(([id, item]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${mode === id ? "bg-[#ff5a1f] text-white" : "bg-white/5 text-[#c9c4b8] hover:bg-white/10"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between text-xs text-[#9c9890]">
        <span>{view.meta}</span>
        <span className="rounded-full bg-[#1c2a22] px-2 py-1 text-[#8dcea8]">{view.status}</span>
      </div>
      <p className="mt-4 text-2xl font-semibold">{view.title}</p>
      <p className="mt-2 text-sm leading-6 text-[#c9c4b8]">{view.copy}</p>
      <div className="mt-5 rounded-2xl border border-white/10 bg-[#0c0e12] p-4">
        <p className="text-sm leading-6">{view.note}</p>
        <span className="mt-4 inline-flex rounded-full bg-[#ff5a1f] px-3 py-1.5 text-xs font-semibold text-white">{view.action}</span>
      </div>
    </div>
  );
}
