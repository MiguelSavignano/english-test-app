import type { Question } from "@/types/question";

export async function getQuestions(): Promise<Question[]> {
  // Swap this implementation to fetch from a DB, API, or CMS
  const data = await import("@/data/questions.json");
  return data.default as Question[];
}
