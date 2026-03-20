import { getQuestions } from "@/lib/questions";
import Quiz from "@/components/Quiz";

export default async function Home() {
  const questions = await getQuestions();
  return <Quiz allQuestions={questions} />;
}
