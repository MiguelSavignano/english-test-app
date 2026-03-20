"use client";

import { useState } from "react";

interface Question {
  id: number;
  type: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface Props {
  question: Question;
  questionNumber: number;
  total: number;
  onAnswer: (correct: boolean) => void;
}

export default function QuizQuestion({ question, questionNumber, total, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selected === question.answer;

  function handleSubmit() {
    if (!selected) return;
    setSubmitted(true);
    onAnswer(isCorrect);
  }

  const typeLabel: Record<string, string> = {
    "multiple-choice": "Multiple Choice",
    "error-correction": "Error Correction",
    "fill-in-the-blank": "Fill in the Blank",
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Question {questionNumber} of {total}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          {typeLabel[question.type] ?? question.type}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-8">
        <div
          className="h-1.5 bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${(questionNumber / total) * 100}%` }}
        />
      </div>

      {/* Question */}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 leading-relaxed">
        {question.question}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-3 mb-6">
        {question.options.map((option) => {
          let base =
            "cursor-pointer rounded-xl border-2 px-5 py-4 text-left text-base font-medium transition-all duration-150 ";

          if (!submitted) {
            base +=
              selected === option
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20";
          } else {
            if (option === question.answer) {
              base +=
                "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200 dark:border-green-400";
            } else if (option === selected) {
              base +=
                "border-red-400 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200 dark:border-red-400";
            } else {
              base +=
                "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 opacity-60";
            }
          }

          return (
            <button
              key={option}
              className={base}
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

      {/* Explanation */}
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

      {/* Submit button */}
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
          {questionNumber < total ? "Next Question →" : "See Results →"}
        </button>
      )}
    </div>
  );
}
