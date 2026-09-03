import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { buildAgent } from "@/lib/agent/graph";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessages = body.messages as Array<{ role: string; content: string }>;

    if (!userMessages || userMessages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const agent = await buildAgent();

    const inputMessages = userMessages.map((m) => {
      if (m.role === "assistant") {
        return new AIMessage(m.content);
      }
      return new HumanMessage(m.content);
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const eventStream = await agent.streamEvents(
            { messages: inputMessages },
            {
              version: "v2",
              streamMode: ["updates", "messages"],
            }
          );

          for await (const event of eventStream) {
            if (event.event === "on_llm_new_token") {
              const token = event.data?.chunk?.content || "";
              if (token) {
                controller.enqueue(encoder.encode(`0:"${token.replace(/"/g, '\\"')}"\n`));
              }
            } else if (event.event === "on_llm_end") {
              const text = event.data?.output?.content || "";
              if (text && typeof text === "string") {
                controller.enqueue(encoder.encode(`0:"${text.replace(/"/g, '\\"')}"\n`));
              }
            }
          }

          controller.enqueue(encoder.encode('[DONE]\n'));
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `0:"Error: ${err instanceof Error ? err.message : "Unknown error"}"\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
