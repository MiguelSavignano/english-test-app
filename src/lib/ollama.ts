const { OLLAMA_API_URL, OLLAMA_MODEL } = process.env;

const systemContext = `
You are an english teacher.
Answer in JSON format with the following structure:
  [{
    "id": 1,
    "type": "multiple-choice",
    "question": "She _____ to school yesterday.",
    "options": ["go", "goes", "went", "gone"],
    "answer": "went",
    "explanation": "'Went' is the irregular past simple form of 'go'. We use the past simple for completed actions in the past. 'Go' and 'goes' are present tense forms; 'gone' is the past participle used with 'have'."
  }]
`;


export async function createMessage(
  message: string,
): Promise<string> {
  const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        {
          role: 'system',
          content: systemContext,
        },
        { role: 'user', content: message },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.statusText}`);
  }

  const data = await response.json();

  console.log('Ollama response data:', data);
  return data.message?.content ?? '';
}
