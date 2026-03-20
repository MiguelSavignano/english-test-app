import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function createMessage(message: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    system: 'You are a english teacher.',
    max_tokens: 1024,
    messages: [{ role: 'user', content: message }],
  });

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}
