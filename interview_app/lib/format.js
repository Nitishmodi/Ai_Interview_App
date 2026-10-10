export const PASS_MARK = 80;

export function asId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export function splitSkills(skills) {
  return String(skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function parseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function formatWhen(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function firstName(fullName) {
  return String(fullName || "").trim().split(/\s+/)[0] || "there";
}

export function homeFor(role) {
  return role === "recruiter" ? "/recruiter" : "/candidate";
}

export const statusLabel = {
  draft: "Draft",
  visible: "Visible",
  closed: "Closed",
  in_progress: "In progress",
  submitted: "Scoring",
  reported: "Report ready",
  proceed: "Proceed",
  not_this_time: "Not this time",
  pending: "Awaiting decision",
  move_forward: "Moving forward",
  not_proceeding: "Not proceeding",
};
