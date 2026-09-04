import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { agent } from "@/lib/agent/main.agent";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessages = body.messages as Array<{ role: string; content: string }>;

    if (!userMessages || userMessages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }
    const result = await agent.invoke({
      messages: [{ role: "user", content: "What is langgraph?" }],
    });

    // Print the agent's response
    console.log(result.messages[result.messages.length - 1].content);
    return NextResponse.json(result);
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
