"use client";

interface Props {
  score: number;
  total: number;
  onRestart: () => void;
}

export default function QuizResults({ score, total, onRestart }: Props) {
  const percentage = Math.round((score / total) * 100);

  const getMessage = () => {
    if (percentage >= 90) return { text: "Excellent!", sub: "You have a strong grasp of the Past Simple!", color: "text-green-600 dark:text-green-400" };
    if (percentage >= 70) return { text: "Good job!", sub: "You know the Past Simple well, but review your mistakes.", color: "text-blue-600 dark:text-blue-400" };
    if (percentage >= 50) return { text: "Keep practising!", sub: "Review the Past Simple rules and try again.", color: "text-yellow-600 dark:text-yellow-400" };
    return { text: "Needs more work", sub: "Study the Past Simple forms and uses carefully before retrying.", color: "text-red-600 dark:text-red-400" };
  };

  const msg = getMessage();

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Quiz Complete!</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-10">Past Simple – Form and Use (A2)</p>

      {/* Circular score */}
      <div className="flex justify-center mb-8">
        <div className="relative w-36 h-36">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={percentage >= 70 ? "#22c55e" : percentage >= 50 ? "#eab308" : "#ef4444"}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{percentage}%</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{score}/{total}</span>
          </div>
        </div>
      </div>

      <p className={`text-2xl font-bold mb-2 ${msg.color}`}>{msg.text}</p>
      <p className="text-gray-600 dark:text-gray-400 mb-10">{msg.sub}</p>

      {/* Stats */}
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
        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
