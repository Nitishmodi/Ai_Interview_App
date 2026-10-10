import { splitSkills } from "@/lib/format";

function tokens(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((token) => token.length > 2);
}

function years(value) {
  const numbers = String(value || "").match(/\d+(\.\d+)?/g);
  if (!numbers?.length) return null;
  const parsed = numbers.map(Number);
  return { min: Math.min(...parsed), max: Math.max(...parsed) };
}

export function matchJob(candidate, job) {
  const wanted = splitSkills(job.skills).map((skill) => skill.toLowerCase());
  const known = splitSkills(candidate.skills).map((skill) => skill.toLowerCase());
  const overlap = wanted.filter((skill) =>
    known.some((item) => item === skill || item.includes(skill) || skill.includes(item))
  );
  const skillScore = wanted.length ? overlap.length / wanted.length : 0;

  const person = years(candidate.experienceYears);
  const role = years(job.experienceYears);
  let experienceScore = 0.45;
  if (person && role) {
    const point = person.min;
    experienceScore = point >= role.min - 1 && point <= role.max + 1 ? 1 : 0.2;
  }

  const roleTokens = new Set(tokens(`${job.title} ${job.department}`));
  const personTokens = tokens(candidate.targetRole);
  const roleHits = personTokens.filter((token) => roleTokens.has(token));
  const roleScore = personTokens.length ? roleHits.length / personTokens.length : 0;

  const score = Math.round(skillScore * 55 + experienceScore * 25 + roleScore * 20);
  const reasons = [];
  if (overlap.length) reasons.push(`${overlap.length} matching skill${overlap.length === 1 ? "" : "s"}`);
  if (experienceScore === 1) reasons.push("experience fits");
  if (roleHits.length) reasons.push("role lines up");

  return {
    score,
    overlap,
    reasons: reasons.length ? reasons : ["Limited overlap with your profile"],
    band: score >= 70 ? "Strong match" : score >= 40 ? "Possible match" : "Looser match",
  };
}
