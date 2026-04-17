import type { Question } from "@/types/question";
import { createMessage } from "@/lib/ollama";

export async function getQuestions(): Promise<Question[]> {
  const data = await import("@/data/questions.json");
  return data.default as Question[];
}

export async function getQuestionsFromOllama(count: number, level: string): Promise<Question[]> {
  const raw = await createMessage(
    `Give me ${count} questions for an ${level} English level test only for Past simple tense.`
  );

  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) {
    throw new Error("No JSON array found in Ollama response");
  }

  return JSON.parse(match[0]) as Question[];
}
