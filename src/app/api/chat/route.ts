import { NextRequest } from "next/server";
import agent from "@/app/services/agent/index";
import { HumanMessage } from "@langchain/core/messages";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      console.log(`\n🚀 Starting Task: "${prompt}"\n`);
      console.log("-------------------------------------------------------------------");

      try {
        const eventStream = await agent.streamEvents(
          {
            messages: [
              new HumanMessage({
                content: prompt || "Research Next.js 15 features and generate a Dockerfile.",
              }),
            ],
          },
          { version: "v2" }
        );

        for await (const event of eventStream) {
          // 1. CAPTURE SUBAGENT DELEGATION INVOCATIONS
          if (event.event === "on_tool_start" && event.name === "task") {
            const { subagent, task } = event.data?.input || {};
            console.log(`\n🔀 [CONTEXT QUARANTINE -> DELEGATING TO SUBAGENT: '${subagent}']`);
            console.log(`📌 Task Description: "${task}"`);
            console.log("-------------------------------------------------------------------\n");
          }

          // CAPUTER WHEN THE LOCALFILES ARE BEING WRITTEN
          if (event.event === "on_tool_start" && event.name === "write_file") {
            console.log("💾 [FILESYSTEM BACKEND -> OFFLOADING TO DISK]");
            console.log(`Path: ${event.data?.input?.path}`);
            console.log("---------------------------------------------------\n");
          }

          // 2. CAPTURE TOOL EXECUTIONS INSIDE SUBAGENTS OR MAIN AGENT
          if (event.event === "on_tool_start" && event.name === "write_todos") {
            console.log("\n📋 [AGENT GENERATED TODO PLAN]");
            console.dir(event.data?.input, { depth: null, colors: true });
            console.log("-------------------------------------------------------------------\n");
          }

          // 3. STREAM TEXT CONTENT BACK TO CLIENT
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