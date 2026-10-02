import { ChatOllama } from "@langchain/ollama";

const titleModel = new ChatOllama({
    model: "qwen3:1.7b",
    temperature: 0,
});

export async function generateChatTitle(message: string) {
    const response = await titleModel.invoke([
        {
            role: "system",
            content: `
Generate a short title for this conversation.

Rules:
- Maximum 6 words
- 2-6 words preferred
- No quotes
- No punctuation at the end
- Return only the title
      `,
        },
        {
            role: "user",
            content: message,
        },
    ]);

    return response.content.toString().trim();
}