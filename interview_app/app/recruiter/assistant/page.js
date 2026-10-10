import AssistantPanel from "@/components/assistant/AssistantPanel";

export const metadata = { title: "Assistant" };

export default function RecruiterAssistantPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Assistant</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#5d6d7e]">Draft a brief, or ask how to read a scorecard. It does not hire anyone.</p>
      <div className="mt-6">
        <AssistantPanel role="recruiter" />
      </div>
    </div>
  );
}
