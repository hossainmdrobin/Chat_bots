import { NextRequest } from "next/server";
import agent from "@/app/services/agent/index"; // Adjust path to your agent.ts
import { HumanMessage } from "@langchain/core/messages";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        const eventStream = await agent.streamEvents(
          {
            messages: [
              new HumanMessage({
                content: prompt || "Default prompt here...",
              }),
            ],
          },
          { version: "v2" }
        );

        for await (const event of eventStream) {
          if (event.event === "on_chat_model_stream") {
            const content = event.data?.chunk?.content;
            if (typeof content === "string" && content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        }
      } catch (error) {
        console.error("Streaming error:", error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}