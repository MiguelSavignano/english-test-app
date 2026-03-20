"use client";

import { useState } from "react";
import questionsData from "@/data/questions.json";
import config from "@/data/config.json";
import QuizStart from "@/components/QuizStart";
import QuizQuestion from "@/components/QuizQuestion";
import QuizResults from "@/components/QuizResults";

type Stage = "start" | "quiz" | "results";

function prepareQuestions() {
  const pool = config.shuffleQuestions
    ? [...questionsData].sort(() => Math.random() - 0.5)
    : [...questionsData];
  const count = Math.min(config.questionsCount, pool.length);
  return pool.slice(0, count);
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [questions, setQuestions] = useState(prepareQuestions);

  function handleStart() {
    setQuestions(prepareQuestions());
    setStage("quiz");
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
  }

  function handleAnswer(correct: boolean) {
    if (!answered) {
      // First call: user submitted an answer
      if (correct) setScore((s) => s + 1);
      setAnswered(true);
    } else {
      // Second call: user clicked "Next"
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
