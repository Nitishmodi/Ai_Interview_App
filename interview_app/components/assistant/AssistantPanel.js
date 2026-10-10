"use client";

import { useState } from "react";
import { askAssistant } from "@/lib/assistant/actions";
import { FormError } from "@/components/Field";

const prompts = {
  recruiter: [
    "Draft a short brief for a backend engineer.",
    "What should I look at on a scorecard before I decide?",
    "When should a role stay a draft?",
  ],
  candidate: [
    "How are open roles ordered for me?",
    "What happens after I apply?",
    "What belongs on my profile?",
  ],
};

export default function AssistantPanel({ role }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function send(text) {
    const question = text.trim();
    if (!question || pending) return;
    setError("");
    setPending(true);
    setDraft("");
    setMessages((current) => [...current, { from: "you", text: question }]);
    const result = await askAssistant(question);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setMessages((current) => [...current, { from: "assistant", text: result.reply }]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5d6d7e]">Try</p>
        {prompts[role].map((prompt) => (
          <button key={prompt} type="button" className="lift block w-full rounded-2xl border border-[#d5e0ea] bg-white px-3 py-3 text-left text-sm" onClick={() => send(prompt)}>
            {prompt}
          </button>
        ))}
      </aside>
      <section className="flex min-h-[420px] flex-col rounded-3xl border border-[#d5e0ea] bg-white">
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
          {messages.length ? messages.map((message, index) => (
            <p key={`${message.from}-${index}`} className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.from === "you" ? "ml-auto bg-[#0e7c74] text-white" : "bg-[#eef3f7] text-[#152033]"}`}>
              {message.text}
            </p>
          )) : <p className="text-sm leading-6 text-[#5d6d7e]">Ask about a role, a scorecard, or how this desk works. It will not write interview answers for you.</p>}
          {pending ? <p className="text-sm text-[#5d6d7e]">Writing…</p> : null}
        </div>
        <form
          className="border-t border-[#e4ebf2] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
        >
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="w-full rounded-full border border-[#d5e0ea] bg-white px-4 py-2.5 text-sm text-[#152033] outline-none focus:border-[#0e7c74]"
              placeholder="Ask the assistant"
            />
            <button type="submit" disabled={pending} className="rounded-full bg-[#0e7c74] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              Send
            </button>
          </div>
          <div className="mt-2">
            <FormError message={error} />
          </div>
        </form>
      </section>
    </div>
  );
}
