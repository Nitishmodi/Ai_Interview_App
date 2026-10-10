import AssistantPanel from "@/components/assistant/AssistantPanel";

export const metadata = { title: "Assistant" };

export default function CandidateAssistantPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Assistant</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#5d6d7e]">Ask how matching and the interview work. It will not write your answers.</p>
      <div className="mt-6">
        <AssistantPanel role="candidate" />
      </div>
    </div>
  );
}
