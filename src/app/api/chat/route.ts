import { NextRequest } from "next/server";
import agent from "@/app/services/agent/index"; // Adjust path to your agent.ts
import { HumanMessage } from "@langchain/core/messages";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      console.log(`\n🚀 Starting Deep Agent Task: "${prompt}"\n`);
      console.log("-------------------------------------------------------------------");
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
          // 1. DIRECT TOOL EXECUTION CHECK: Intercept when the agent executes write_todos
          if (event.event === "on_tool_start" && event.name === "write_todos") {
            console.log("\n📋 [AGENT GENERATED TODO PLAN]");
            console.dir(event.data?.input, { depth: null, colors: true });
            console.log("-------------------------------------------------------------------\n");
          }
          // 4. Capture when the model emits a tool call for write_todos
          if (event.event == "on_chat_model_end" && event.data?.output?.tool_calls) {
            const toolCalls = event.data.output.tool_calls
            for (const call of toolCalls) {
              if (call.name === "write_todos") {
                console.log("\n📋 [AGENT GENERATED TODO PLAN]");
                console.dir(call.args, { depth: null, colors: true });
                console.log("-------------------------------------------------------------------\n");
              }
            }
          }

          // 5. Capture final response text tokens from the stream
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