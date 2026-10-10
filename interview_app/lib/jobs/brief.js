export function linesOf(value) {
  return String(value || "")
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export function composeDescription({ summary, responsibilities, requirements }) {
  const work = responsibilities.map((line) => `- ${line}`).join("\n");
  const bring = requirements.map((line) => `- ${line}`).join("\n");
  return [summary, work && `What you will do:\n${work}`, bring && `What you bring:\n${bring}`]
    .filter(Boolean)
    .join("\n\n");
}

export function previewLine(job) {
  if (job.summary) return job.summary;
  if (job.preview) return job.preview;
  const first = String(job.description || "")
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);
  return first || "";
}
