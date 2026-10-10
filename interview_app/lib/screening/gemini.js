import { GoogleGenerativeAI } from "@google/generative-ai";
import { randomUUID } from "crypto";

function readJson(text) {
  const trimmed = String(text || "").trim().replace(/^```json\s*/i, "").replace(/```$/, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("Gemini returned something that was not a scorecard.");
  return JSON.parse(trimmed.slice(start, end + 1));
}

function asList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value.split("\n").map((line) => line.replace(/^[-*]\s*/, "").trim()).filter(Boolean);
  }
  return [];
}

function apiKey() {
  const key = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key) throw new Error("Add GEMINI_API_KEY in interview_app/.env.local, then try again.");
  return key;
}

async function ask(prompt, temperature = 0.7) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey());
    const active = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
      generationConfig: { temperature },
    });
    const result = await active.generateContent(prompt);
    return readJson(result.response.text());
  } catch (error) {
    if (String(error?.message || "").includes("GEMINI_API_KEY")) throw error;
    if (error instanceof SyntaxError) throw new Error("Gemini returned something that was not a scorecard.");
    throw new Error("Gemini could not finish that step. Try again in a moment.");
  }
}

export async function talk(prompt) {
  const genAI = new GoogleGenerativeAI(apiKey());
  const active = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    generationConfig: { temperature: 0.5 },
  });
  const result = await active.generateContent(prompt);
  const text = result.response.text().trim();
  if (!text) throw new Error("The assistant did not reply. Try again.");
  return text;
}

function shuffleOptions(options, answer) {
  const rows = options.map((text, index) => ({ text: String(text), correct: index === answer }));
  for (let index = rows.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [rows[index], rows[swap]] = [rows[swap], rows[index]];
  }
  return { options: rows.map((row) => row.text), answer: rows.findIndex((row) => row.correct) };
}

export async function buildQuestionPaper({ job, candidate }) {
  const raw = await ask(`You are writing a hiring screen for one candidate. Make it specific to this role and this person.
Another candidate must not receive the same paper. Variation token: ${randomUUID()}.
Write questions the way a hiring panel would today: practical scenarios, not trivia and not textbook definitions.
Return only JSON:
{
  "mcq": [{ "skill": string, "prompt": string, "options": [string, string, string, string], "answer": number }],
  "voice": [{ "prompt": string, "listensFor": string }],
  "communication": [{ "prompt": string, "listensFor": string }]
}
Counts are exact: 20 mcq, 5 voice, 5 communication.
mcq tests the skills on the role. answer is the index of the correct option, 0 to 3. Only one option is correct.
voice prompts are spoken answers of about one minute: debugging, design, or a tradeoff.
communication prompts are written: explain a decision, write a short update, or clarify a requirement for someone who does not share the candidate's specialty.
listensFor is a private grading note.

Role: ${job.title}
Experience asked: ${job.experienceYears}
Skills: ${job.skills}
Job description:
${String(job.description).slice(0, 7000)}

Candidate target role: ${candidate.targetRole || job.title}
Candidate experience: ${candidate.experienceYears || "not stated"}
Candidate skills: ${candidate.skills || job.skills}`);

  const mcq = (Array.isArray(raw.mcq) ? raw.mcq : [])
    .map((question, index) => {
      const options = Array.isArray(question?.options) ? question.options.map((option) => String(option).trim()).filter(Boolean) : [];
      const answer = Number(question?.answer);
      if (options.length !== 4 || answer < 0 || answer > 3) return null;
      const shuffled = shuffleOptions(options, answer);
      return {
        id: `m${index + 1}`,
        skill: String(question?.skill || "General").trim(),
        prompt: String(question?.prompt || "").trim(),
        options: shuffled.options,
        answer: shuffled.answer,
      };
    })
    .filter((question) => question?.prompt)
    .slice(0, 20);

  const voice = (Array.isArray(raw.voice) ? raw.voice : [])
    .map((question, index) => ({
      id: `v${index + 1}`,
      prompt: String(question?.prompt || "").trim(),
      listensFor: String(question?.listensFor || "").trim(),
    }))
    .filter((question) => question.prompt)
    .slice(0, 5);

  const communication = (Array.isArray(raw.communication) ? raw.communication : [])
    .map((question, index) => ({
      id: `c${index + 1}`,
      prompt: String(question?.prompt || "").trim(),
      listensFor: String(question?.listensFor || "").trim(),
    }))
    .filter((question) => question.prompt)
    .slice(0, 5);

  if (mcq.length < 20 || voice.length < 5 || communication.length < 5) {
    throw new Error("Gemini did not return a full paper. Try again.");
  }

  return { mcq, voice, communication };
}

export async function gradeRecording({ prompt, listensFor, audioBase64, mimeType, transcript }) {
  const instruction = `Grade this spoken interview answer from 0 to 100. Be strict about correctness.
Return only JSON: { "transcript": string, "score": number, "note": string }
The note is two sentences a recruiter can read.
Question: ${prompt}
What a strong answer includes: ${listensFor || "A specific, correct answer."}`;

  const genAI = new GoogleGenerativeAI(apiKey());
  const active = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    generationConfig: { temperature: 0.2 },
  });

  try {
    const parts = [{ text: instruction }];
    if (audioBase64) {
      parts.push({ inlineData: { mimeType: mimeType || "audio/webm", data: audioBase64 } });
    } else if (transcript) {
      parts[0] = { text: `${instruction}\n\nTranscript:\n${transcript}` };
    } else {
      throw new Error("Record an answer before saving it.");
    }
    const result = await active.generateContent(parts);
    const raw = readJson(result.response.text());
    return {
      transcript: String(raw.transcript || transcript || "").trim(),
      score: Math.max(0, Math.min(100, Math.round(Number(raw.score) || 0))),
      note: String(raw.note || "").trim(),
    };
  } catch (error) {
    if (transcript) {
      const raw = await ask(`${instruction}\n\nTranscript:\n${transcript}`, 0.2);
      return {
        transcript: String(raw.transcript || transcript).trim(),
        score: Math.max(0, Math.min(100, Math.round(Number(raw.score) || 0))),
        note: String(raw.note || "").trim(),
      };
    }
    if (String(error?.message || "").includes("GEMINI_API_KEY") || String(error?.message || "").includes("Record an answer")) {
      throw error;
    }
    throw new Error("That recording could not be graded. Try it once more.");
  }
}

export async function gradeWrittenAnswers({ job, questions }) {
  const packed = questions
    .map((question, index) => `Question ${index + 1}: ${question.prompt}\nLooking for: ${question.listensFor}\nAnswer: ${question.answer}`)
    .join("\n\n");
  const raw = await ask(`Grade these written communication answers for a hiring screen. Score each from 0 to 100 for clarity, structure, and whether the content is right.
Return only JSON: { "grades": [{ "score": number, "note": string }] }
One grade per question, same order. The note is one or two sentences.
Role: ${job.title}

${packed}`, 0.2);
  const grades = Array.isArray(raw.grades) ? raw.grades : [];
  return questions.map((_, index) => ({
    score: Math.max(0, Math.min(100, Math.round(Number(grades[index]?.score) || 0))),
    note: String(grades[index]?.note || "No note returned.").trim(),
  }));
}

export async function explainScorecard({ job, candidate, scores, recommendation }) {
  const raw = await ask(`Write the narrative for a hiring scorecard. Do not change the scores. They are final.
Return only JSON: { "summary": string, "strengths": string[], "gaps": string[] }
summary is one tight paragraph.
If recommendation is "proceed", say they cleared every section above 80 and can go to the next step.
If recommendation is "not_this_time", say this is not the right time, and they may be considered for a future role. Do not soften a failed section.

Candidate: ${candidate.fullName}
Role: ${job.title}
Skills MCQ: ${scores.mcq}
Voice: ${scores.voice}
Communication: ${scores.communication}
Overall: ${scores.overall}
Recommendation: ${recommendation}`, 0.3);

  return {
    summary: String(raw.summary || "The scorecard was saved without a written summary.").trim(),
    strengths: asList(raw.strengths).slice(0, 5),
    gaps: asList(raw.gaps).slice(0, 5),
  };
}
