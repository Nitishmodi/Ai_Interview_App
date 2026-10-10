"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { finishAttempt, saveCommunicationAnswers, saveMcqAnswers, saveVoiceAnswer } from "@/lib/screening/actions";
import { FormError, inputClass, primaryClass, quietClass } from "@/components/Field";
import { useScreenRail } from "@/components/shell/ScreenRail";

export default function QuestionPaper({ attemptId, jobTitle, paper, saved }) {
  const router = useRouter();
  const [section, setSection] = useState("mcq");
  const [index, setIndex] = useState(0);
  const [mcq, setMcq] = useState(saved.mcq || {});
  const [voice, setVoice] = useState(saved.voice || {});
  const [written, setWritten] = useState(saved.communication || {});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const railApi = useScreenRail();
  const setRail = railApi?.setRail;

  const list = section === "mcq" ? paper.mcq : section === "voice" ? paper.voice : paper.communication;
  const current = list?.[index];

  function sectionList(kind) {
    if (kind === "mcq") return paper.mcq;
    if (kind === "voice") return paper.voice;
    return paper.communication;
  }

  function answered(kind, question) {
    if (kind === "mcq") return mcq[question.id] !== undefined;
    if (kind === "voice") return Boolean(voice[question.id]);
    return String(written[question.id] || "").trim().length >= 30;
  }

  async function jumpTo(nextSection, nextIndex) {
    if (pending) return;
    const order = ["mcq", "voice", "communication"];
    const target = order.indexOf(nextSection);
    for (let step = 0; step < (target === -1 ? order.length : target); step += 1) {
      const kind = order[step];
      if (sectionList(kind).some((question) => !answered(kind, question))) {
        setError("Finish the earlier section before opening that one.");
        return;
      }
    }
    if (nextSection !== "review") {
      const questions = sectionList(nextSection);
      const firstOpen = questions.findIndex((question) => !answered(nextSection, question));
      if (firstOpen !== -1 && nextIndex > firstOpen) {
        setError("Answer the open question in this section first.");
        return;
      }
    }
    setError("");
    if (section === "mcq") await persistMcq(mcq);
    if (section === "communication") {
      const result = await saveCommunicationAnswers(attemptId, written);
      if (result?.error) {
        setError(result.error);
        return;
      }
    }
    setSection(nextSection);
    setIndex(nextSection === "review" ? 0 : nextIndex);
  }

  useEffect(() => {
    if (!setRail) return undefined;
    const kinds = [
      ["mcq", "Skills"],
      ["voice", "Voice"],
      ["communication", "Communication"],
    ];
    const blocks = kinds.map(([id, label]) => ({
      id,
      label,
      items: sectionList(id).map((question, itemIndex) => ({
        index: itemIndex,
        done: answered(id, question),
        current: section === id && index === itemIndex,
      })),
    }));
    const ready = blocks.every((block) => block.items.every((item) => item.done));
    blocks.push({
      id: "review",
      label: "Submit",
      items: [{ index: 0, done: ready, current: section === "review" }],
    });
    setRail({ jobTitle, blocks, jump: jumpTo });
    return undefined;
  }, [section, index, mcq, voice, written, pending, jobTitle, setRail]);

  useEffect(() => () => setRail?.(null), [setRail]);

  async function persistMcq(next) {
    const result = await saveMcqAnswers(attemptId, next);
    if (result?.error) setError(result.error);
  }

  async function go(nextSection, nextIndex = 0) {
    setError("");
    if (section === "mcq") await persistMcq(mcq);
    if (section === "communication") {
      const result = await saveCommunicationAnswers(attemptId, written);
      if (result?.error) {
        setError(result.error);
        return;
      }
    }
    setSection(nextSection);
    setIndex(nextIndex);
  }

  async function submitPaper() {
    setPending(true);
    setError("");
    const result = await finishAttempt(attemptId, written);
    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <p className="text-sm text-[#5d6d7e]">{jobTitle}</p>

      {section === "review" ? (
        <Review
          paper={paper}
          mcq={mcq}
          voice={voice}
          written={written}
          pending={pending}
          error={error}
          onSubmit={submitPaper}
          onBack={() => go("communication", paper.communication.length - 1)}
        />
      ) : (
        <article className="mt-6 rounded-3xl border border-white/10 bg-[#141820] p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9c9890]">
            {section === "mcq" ? "Skill question" : section === "voice" ? "Spoken answer" : "Communication"} {index + 1} of {list.length}
          </p>
          <h1 className="mt-3 text-xl font-semibold leading-7">{current.prompt}</h1>

          {section === "mcq" ? (
            <div className="mt-5 space-y-2">
              {current.options.map((option, optionIndex) => (
                <label key={option} className={`flex cursor-pointer gap-3 rounded-2xl border px-4 py-3 transition hover:-translate-y-0.5 hover:border-white/30 ${mcq[current.id] === optionIndex ? "border-[#ff5a1f] bg-[#2a160f]" : "border-white/10"}`}>
                  <input
                    type="radio"
                    name={current.id}
                    checked={mcq[current.id] === optionIndex}
                    onChange={() => setMcq({ ...mcq, [current.id]: optionIndex })}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          ) : null}

          {section === "voice" ? (
            <VoiceCapture
              key={current.id}
              saved={voice[current.id]}
              onSave={async (audio, mime, transcript) => {
                setPending(true);
                setError("");
                const result = await saveVoiceAnswer(attemptId, current.id, audio, mime, transcript);
                setPending(false);
                if (result?.error) {
                  setError(result.error);
                  return;
                }
                setVoice({ ...voice, [current.id]: { transcript: transcript || "Saved", score: 1 } });
              }}
              pending={pending}
            />
          ) : null}

          {section === "communication" ? (
            <textarea
              className={`${inputClass} mt-5 min-h-40`}
              value={written[current.id] || ""}
              onChange={(event) => setWritten({ ...written, [current.id]: event.target.value })}
              placeholder="Write it the way you would send it to a teammate."
            />
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              className={quietClass}
              onClick={() => {
                if (index > 0) setIndex(index - 1);
                else if (section === "voice") go("mcq", paper.mcq.length - 1);
                else if (section === "communication") go("voice", paper.voice.length - 1);
              }}
            >
              Back
            </button>
            <button
              type="button"
              className={primaryClass}
              disabled={pending}
              onClick={async () => {
                if (section === "mcq" && mcq[current.id] === undefined) {
                  setError("Choose an option.");
                  return;
                }
                if (section === "voice" && !voice[current.id]) {
                  setError("Save a recording before moving on.");
                  return;
                }
                if (section === "communication" && String(written[current.id] || "").trim().length < 30) {
                  setError("Write a little more before moving on.");
                  return;
                }
                if (index < list.length - 1) {
                  setError("");
                  if (section === "mcq") await persistMcq(mcq);
                  if (section === "communication") await saveCommunicationAnswers(attemptId, written);
                  setIndex(index + 1);
                  return;
                }
                if (section === "mcq") go("voice");
                else if (section === "voice") go("communication");
                else go("review");
              }}
            >
              {index < list.length - 1 ? "Next" : section === "communication" ? "Review" : "Continue"}
            </button>
          </div>
          <div className="mt-3">
            <FormError message={error} />
          </div>
        </article>
      )}
    </div>
  );
}

function Review({ paper, mcq, voice, written, pending, error, onSubmit, onBack }) {
  const mcqDone = paper.mcq.every((question) => mcq[question.id] !== undefined);
  const voiceDone = paper.voice.every((question) => voice[question.id]);
  const writtenDone = paper.communication.every((question) => String(written[question.id] || "").trim().length >= 30);

  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-[#141820] p-6">
      <h1 className="text-2xl font-semibold">Submit the screen</h1>
      <ul className="mt-4 space-y-2 text-sm">
        <li>{mcqDone ? "20 skill questions answered." : "Some skill questions are still open."}</li>
        <li>{voiceDone ? "5 recordings saved." : "A recording is still missing."}</li>
        <li>{writtenDone ? "5 communication answers written." : "A communication answer is still short."}</li>
      </ul>
      <p className="mt-4 text-sm leading-6 text-[#c9c4b8]">
        Gemini scores correctness on the MCQs, the recordings, and the written answers. Above 80% in every section, and above 80% overall, is a proceed. Anything short of that is not this time.
      </p>
      <div className="mt-6 flex gap-3">
        <button type="button" className={quietClass} onClick={onBack}>Back</button>
        <button type="button" className={primaryClass} disabled={pending || !mcqDone || !voiceDone || !writtenDone} onClick={onSubmit}>
          {pending ? "Scoring the screen…" : "Submit for scoring"}
        </button>
      </div>
      <div className="mt-3">
        <FormError message={error} />
      </div>
    </section>
  );
}

function VoiceCapture({ saved, onSave, pending }) {
  const recorder = useRef(null);
  const chunks = useRef([]);
  const speech = useRef(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [preview, setPreview] = useState("");
  const [transcript, setTranscript] = useState("");
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    if (!recording) return undefined;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [recording]);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunks.current = [];
    rec.ondataavailable = (event) => {
      if (event.data.size) chunks.current.push(event.data);
    };
    rec.onstop = () => {
      const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
      setPreview(URL.createObjectURL(blob));
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = String(reader.result).split(",")[1];
        setPayload({ audio: base64, mime: rec.mimeType || "audio/webm" });
      };
      reader.readAsDataURL(blob);
      stream.getTracks().forEach((track) => track.stop());
    };
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (Speech) {
      const heard = new Speech();
      heard.continuous = true;
      heard.onresult = (event) => {
        let text = "";
        for (let i = 0; i < event.results.length; i += 1) text += event.results[i][0].transcript;
        setTranscript(text);
      };
      heard.start();
      speech.current = heard;
    }
    recorder.current = rec;
    setSeconds(0);
    setRecording(true);
    rec.start();
  }

  function stop() {
    recorder.current?.stop();
    speech.current?.stop();
    setRecording(false);
  }

  return (
    <div className="mt-5">
      <p className="text-sm text-[#9c9890]">Speak for up to a minute. You can listen back before saving.</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {recording ? (
          <button type="button" className={primaryClass} onClick={stop}>Stop · {seconds}s</button>
        ) : (
          <button type="button" className={primaryClass} onClick={start}>Record</button>
        )}
        {saved ? <span className="text-sm font-medium text-[#8dcea8]">Answer saved</span> : null}
      </div>
      {preview ? <audio className="mt-4 w-full" controls src={preview} /> : null}
      {payload ? (
        <button type="button" className={`${quietClass} mt-4`} disabled={pending} onClick={() => onSave(payload.audio, payload.mime, transcript)}>
          {pending ? "Saving the recording…" : "Save this recording"}
        </button>
      ) : null}
    </div>
  );
}
