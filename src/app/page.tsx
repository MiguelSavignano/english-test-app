"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type VerbEntry = {
  present: string;
  pastSimple: string;
  pastParticiple: string;
};

type QuestionType = "identify" | "produce-past" | "produce-participle" | "match";

type VerbQuestion = {
  id: number;
  type: QuestionType;
  typeLabel: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

const VERBS: VerbEntry[] = [
  { present: "go", pastSimple: "went", pastParticiple: "gone" },
  { present: "eat", pastSimple: "ate", pastParticiple: "eaten" },
  { present: "drink", pastSimple: "drank", pastParticiple: "drunk" },
  { present: "see", pastSimple: "saw", pastParticiple: "seen" },
  { present: "come", pastSimple: "came", pastParticiple: "come" },
  { present: "do", pastSimple: "did", pastParticiple: "done" },
  { present: "make", pastSimple: "made", pastParticiple: "made" },
  { present: "take", pastSimple: "took", pastParticiple: "taken" },
  { present: "give", pastSimple: "gave", pastParticiple: "given" },
  { present: "get", pastSimple: "got", pastParticiple: "got" },
  { present: "write", pastSimple: "wrote", pastParticiple: "written" },
  { present: "buy", pastSimple: "bought", pastParticiple: "bought" },
  { present: "think", pastSimple: "thought", pastParticiple: "thought" },
  { present: "know", pastSimple: "knew", pastParticiple: "known" },
  { present: "have", pastSimple: "had", pastParticiple: "had" },
  { present: "say", pastSimple: "said", pastParticiple: "said" },
  { present: "run", pastSimple: "ran", pastParticiple: "run" },
  { present: "speak", pastSimple: "spoke", pastParticiple: "spoken" },
  { present: "break", pastSimple: "broke", pastParticiple: "broken" },
  { present: "bring", pastSimple: "brought", pastParticiple: "brought" },
  { present: "find", pastSimple: "found", pastParticiple: "found" },
  { present: "grow", pastSimple: "grew", pastParticiple: "grown" },
  { present: "begin", pastSimple: "began", pastParticiple: "begun" },
  { present: "sing", pastSimple: "sang", pastParticiple: "sung" },
  { present: "sit", pastSimple: "sat", pastParticiple: "sat" },
  { present: "sleep", pastSimple: "slept", pastParticiple: "slept" },
  { present: "swim", pastSimple: "swam", pastParticiple: "swum" },
  { present: "send", pastSimple: "sent", pastParticiple: "sent" },
  { present: "teach", pastSimple: "taught", pastParticiple: "taught" },
  { present: "catch", pastSimple: "caught", pastParticiple: "caught" },
  { present: "leave", pastSimple: "left", pastParticiple: "left" },
  { present: "meet", pastSimple: "met", pastParticiple: "met" },
  { present: "feel", pastSimple: "felt", pastParticiple: "felt" },
  { present: "lose", pastSimple: "lost", pastParticiple: "lost" },
  { present: "pay", pastSimple: "paid", pastParticiple: "paid" },
  { present: "hear", pastSimple: "heard", pastParticiple: "heard" },
  { present: "keep", pastSimple: "kept", pastParticiple: "kept" },
  { present: "stand", pastSimple: "stood", pastParticiple: "stood" },
  { present: "understand", pastSimple: "understood", pastParticiple: "understood" },
  { present: "drive", pastSimple: "drove", pastParticiple: "driven" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateQuestions(): VerbQuestion[] {
  const questions: VerbQuestion[] = [];
  let id = 0;
  const shuffled = shuffle(VERBS);

  // Type 1 — Identify the form
  // Only use verbs with 3 fully distinct forms to avoid ambiguity
  const identifyPool = shuffled.filter(
    (v) =>
      v.pastSimple !== v.present &&
      v.pastParticiple !== v.present &&
      v.pastSimple !== v.pastParticiple
  );
  for (const verb of identifyPool.slice(0, 6)) {
    const askPP = Math.random() > 0.5;
    const form = askPP ? verb.pastParticiple : verb.pastSimple;
    const answer = askPP ? "past participle" : "past simple";
    questions.push({
      id: id++,
      type: "identify",
      typeLabel: "Identify the Form",
      question: `What form is the word "${form}"?\n(verb: to ${verb.present})`,
      options: shuffle(["present", "past simple", "past participle"]),
      answer,
      explanation: `"${form}" is the ${answer} of "to ${verb.present}". → ${verb.present} / ${verb.pastSimple} / ${verb.pastParticiple}`,
    });
  }

  // Type 2 — Produce past simple
  for (const verb of shuffled.slice(0, 7)) {
    const others = shuffle(VERBS.filter((v) => v !== verb));
    const distractors = [...new Set(others.map((v) => v.pastSimple))]
      .filter((f) => f !== verb.pastSimple)
      .slice(0, 3);
    if (distractors.length < 3) continue;
    questions.push({
      id: id++,
      type: "produce-past",
      typeLabel: "Past Simple",
      question: `What is the past simple of "to ${verb.present}"?`,
      options: shuffle([verb.pastSimple, ...distractors]),
      answer: verb.pastSimple,
      explanation: `Past simple of "to ${verb.present}" → "${verb.pastSimple}".  Full forms: ${verb.present} / ${verb.pastSimple} / ${verb.pastParticiple}`,
    });
  }

  // Type 2 — Produce past participle
  for (const verb of shuffled.slice(7, 14)) {
    const others = shuffle(VERBS.filter((v) => v !== verb));
    const distractors = [...new Set(others.map((v) => v.pastParticiple))]
      .filter((f) => f !== verb.pastParticiple)
      .slice(0, 3);
    if (distractors.length < 3) continue;
    questions.push({
      id: id++,
      type: "produce-participle",
      typeLabel: "Past Participle",
      question: `What is the past participle of "to ${verb.present}"?`,
      options: shuffle([verb.pastParticiple, ...distractors]),
      answer: verb.pastParticiple,
      explanation: `Past participle of "to ${verb.present}" → "${verb.pastParticiple}".  Full forms: ${verb.present} / ${verb.pastSimple} / ${verb.pastParticiple}`,
    });
  }

  // Type 3 — Match: choose correct "past simple / past participle" pair
  for (const verb of shuffled.slice(14, 21)) {
    const others = shuffle(VERBS.filter((v) => v !== verb)).slice(0, 3);
    const correctPair = `${verb.pastSimple}  /  ${verb.pastParticiple}`;
    const wrongPairs = others.map((v) => `${v.pastSimple}  /  ${v.pastParticiple}`);
    questions.push({
      id: id++,
      type: "match",
      typeLabel: "Match the Forms",
      question: `Choose the correct past simple and past participle for "to ${verb.present}":`,
      options: shuffle([correctPair, ...wrongPairs]),
      answer: correctPair,
      explanation: `"to ${verb.present}": past simple → "${verb.pastSimple}", past participle → "${verb.pastParticiple}"`,
    });
  }

  return shuffle(questions).slice(0, 20);
}

const TYPE_COLORS: Record<QuestionType, string> = {
  "identify": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "produce-past": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "produce-participle": "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "match": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

function QuestionCard({
  question,
  index,
  total,
  onAnswer,
}: {
  question: VerbQuestion;
  index: number;
  total: number;
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = selected === question.answer;

  function handleSubmit() {
    if (!selected) return;
    setSubmitted(true);
    onAnswer(isCorrect);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Question {index + 1} of {total}
        </span>
        <span className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${TYPE_COLORS[question.type]}`}>
          {question.typeLabel}
        </span>
      </div>

      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-8">
        <div
          className="h-1.5 bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 leading-relaxed whitespace-pre-line">
        {question.question}
      </h2>

      <div className="flex flex-col gap-3 mb-6">
        {question.options.map((option) => {
          let cls =
            "cursor-pointer rounded-xl border-2 px-5 py-4 text-left text-base font-medium transition-all duration-150 ";
          if (!submitted) {
            cls +=
              selected === option
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20";
          } else {
            if (option === question.answer) {
              cls += "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200 dark:border-green-400";
            } else if (option === selected) {
              cls += "border-red-400 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200 dark:border-red-400";
            } else {
              cls += "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 opacity-60";
            }
          }

          return (
            <button
              key={option}
              className={cls}
              onClick={() => !submitted && setSelected(option)}
              disabled={submitted}
            >
              <span className="flex items-center gap-3">
                {submitted && option === question.answer && (
                  <span className="text-green-500 text-lg">✓</span>
                )}
                {submitted && option === selected && option !== question.answer && (
                  <span className="text-red-500 text-lg">✗</span>
                )}
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {submitted && (
        <div
          className={`rounded-xl p-5 mb-6 border-l-4 ${
            isCorrect
              ? "bg-green-50 border-green-500 dark:bg-green-900/20"
              : "bg-red-50 border-red-400 dark:bg-red-900/20"
          }`}
        >
          <p className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-200">
            {isCorrect ? "Correct!" : `Incorrect — the answer is: "${question.answer}"`}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Check Answer
        </button>
      ) : (
        <button
          onClick={() => onAnswer(isCorrect)}
          className="w-full py-3 rounded-xl bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 font-semibold text-base hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
        >
          {index + 1 < total ? "Next Question →" : "See Results →"}
        </button>
      )}
    </div>
  );
}

function Results({
  score,
  total,
  onRestart,
}: {
  score: number;
  total: number;
  onRestart: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const msg =
    pct >= 90
      ? { text: "Excellent!", sub: "You really know your irregular verbs!", color: "text-green-600 dark:text-green-400" }
      : pct >= 70
      ? { text: "Good job!", sub: "Keep practising the forms you missed.", color: "text-blue-600 dark:text-blue-400" }
      : pct >= 50
      ? { text: "Keep going!", sub: "Review the verb table and try again.", color: "text-yellow-600 dark:text-yellow-400" }
      : { text: "Keep practising!", sub: "Study the irregular verbs list and try again.", color: "text-red-600 dark:text-red-400" };

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Practice Complete!</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-10">Irregular Verbs — Past Simple & Past Participle</p>

      <div className="flex justify-center mb-8">
        <div className="relative w-36 h-36">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={pct >= 70 ? "#22c55e" : pct >= 50 ? "#eab308" : "#ef4444"}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{pct}%</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{score}/{total}</span>
          </div>
        </div>
      </div>

      <p className={`text-2xl font-bold mb-2 ${msg.color}`}>{msg.text}</p>
      <p className="text-gray-600 dark:text-gray-400 mb-10">{msg.sub}</p>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{score}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Correct</div>
        </div>
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4">
          <div className="text-2xl font-bold text-red-500 dark:text-red-400">{total - score}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Incorrect</div>
        </div>
        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{total}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</div>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 transition-colors mb-4"
      >
        Practice Again
      </button>
      <Link
        href="/aiquestions"
        className="block w-full py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold text-base hover:border-gray-400 transition-colors text-center"
      >
        Try AI Questions →
      </Link>
    </div>
  );
}

type Stage = "start" | "quiz" | "results";

export default function VerbsPage() {
  const [stage, setStage] = useState<Stage>("start");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [questions, setQuestions] = useState<VerbQuestion[]>(() => generateQuestions());

  function start() {
    setQuestions(generateQuestions());
    setIndex(0);
    setScore(0);
    setAnswered(false);
    setStage("quiz");
  }

  function handleAnswer(correct: boolean) {
    if (!answered) {
      if (correct) setScore((s) => s + 1);
      setAnswered(true);
    } else {
      if (index + 1 >= questions.length) {
        setStage("results");
      } else {
        setIndex((i) => i + 1);
        setAnswered(false);
      }
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white dark:bg-gray-950">
      {stage === "start" && (
        <div className="w-full max-w-2xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
            Verb Practice
          </p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            Past Simple &amp; Past Participle
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Practice irregular verbs with three types of questions: identify verb forms,
            produce the correct form, and match past simple with past participle.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
            <div className="rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400 mb-1">Type 1</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">Identify if a form is present, past simple, or past participle.</p>
            </div>
            <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Type 2</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">Given a verb, choose the correct past simple or past participle.</p>
            </div>
            <div className="rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-orange-600 dark:text-orange-400 mb-1">Type 3</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">Match the verb with its correct past simple and past participle pair.</p>
            </div>
          </div>

          <button
            onClick={start}
            className="w-full py-4 rounded-xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition-colors mb-4"
          >
            Start Practice — {questions.length} Questions
          </button>
          <Link
            href="/aiquestions"
            className="block w-full py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold text-base hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center"
          >
            Try AI Questions →
          </Link>
        </div>
      )}

      {stage === "quiz" && questions[index] && (
        <QuestionCard
          key={index}
          question={questions[index]}
          index={index}
          total={questions.length}
          onAnswer={handleAnswer}
        />
      )}

      {stage === "results" && (
        <Results score={score} total={questions.length} onRestart={start} />
      )}
    </main>
  );
}
