"use client";

import { useState } from "react";
import type { Question } from "@/types/question";
import config from "@/data/config.json";
import QuizStart from "@/components/QuizStart";
import QuizQuestion from "@/components/QuizQuestion";
import QuizResults from "@/components/QuizResults";

type Stage = "start" | "quiz" | "results";

function prepareQuestions(all: Question[]): Question[] {
  const pool = config.shuffleQuestions
    ? [...all].sort(() => Math.random() - 0.5)
    : [...all];
  const count = Math.min(config.questionsCount, pool.length);
  return pool.slice(0, count);
}

export default function Quiz({ allQuestions }: { allQuestions: Question[] }) {
  const [stage, setStage] = useState<Stage>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [questions, setQuestions] = useState(() => prepareQuestions(allQuestions));

  function handleStart() {
    setQuestions(prepareQuestions(allQuestions));
    setStage("quiz");
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
  }

  function handleAnswer(correct: boolean) {
    if (!answered) {
      if (correct) setScore((s) => s + 1);
      setAnswered(true);
    } else {
      if (currentIndex + 1 >= questions.length) {
        setStage("results");
      } else {
        setCurrentIndex((i) => i + 1);
        setAnswered(false);
      }
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white dark:bg-gray-950">
      {stage === "start" && (
        <QuizStart total={questions.length} onStart={handleStart} />
      )}

      {stage === "quiz" && (
        <QuizQuestion
          key={currentIndex}
          question={questions[currentIndex]}
          questionNumber={currentIndex + 1}
          total={questions.length}
          onAnswer={handleAnswer}
        />
      )}

      {stage === "results" && (
        <QuizResults
          score={score}
          total={questions.length}
          onRestart={handleStart}
        />
      )}
    </main>
  );
}
