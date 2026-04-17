import { getQuestions, getQuestionsFromOllama } from "@/lib/questions";
import Quiz from "@/components/Quiz";
import config from "@/data/config.json";

export default async function Home() {
  const { questionsCount, level } = config;
  let questions;
  if (process.env.QUESTION_PAGE_PROVIDER === "ollama") {
    try {
      questions = await getQuestionsFromOllama(questionsCount, level);
      console.log("Questions fetched from Ollama successfully.");
    } catch (error) {
      console.error("Ollama failed, falling back to local questions:");
      questions = await getQuestions();
    }
  } else {
    questions = await getQuestions();
  }
  return <Quiz allQuestions={questions} />;
}
