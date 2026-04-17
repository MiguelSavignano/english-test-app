"use client";

import Link from "next/link";

interface Props {
  total: number;
  onStart: () => void;
}

export default function QuizStart({ total, onStart }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-sm font-semibold mb-6">
        A2 Level · Grammar
      </div>
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4 leading-tight">
        Past Simple
        <br />
        <span className="text-blue-600 dark:text-blue-400">Form &amp; Use</span>
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-md mx-auto leading-relaxed">
        Test your knowledge of the Past Simple tense — regular &amp; irregular verbs, negatives,
        questions, and common errors.
      </p>

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{total}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Questions</div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">3</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Types</div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">A2</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Level</div>
        </div>
      </div>

      {/* Question types */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {["Multiple Choice", "Error Correction", "Fill in the Blank"].map((t) => (
          <span
            key={t}
            className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium"
          >
            {t}
          </span>
        ))}
      </div>

      <button
        onClick={onStart}
        className="w-full py-4 rounded-xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 mb-4"
      >
        Start Test
      </button>
      <Link
        href="/"
        className="block w-full py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold text-base hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center"
      >
        ← Back to Verb Practice
      </Link>
    </div>
  );
}
