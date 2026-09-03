import { StateGraph, Annotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (left: BaseMessage[], right: BaseMessage[] | BaseMessage) => {
      const arr = Array.isArray(right) ? right : [right];
      return left.concat(arr);
    },
    default: () => [],
  }),
  intermediateSteps: Annotation<any[]>({
    reducer: (left: any[], right: any[] | any) => {
      const arr = Array.isArray(right) ? right : [right];
      return left.concat(arr);
    },
    default: () => [],
  }),
});

export type AgentState = typeof StateAnnotation.State;

const DEFAULT_MODEL = process.env.AGENT_MODEL_NAME || "gpt-4o-mini";

function createModel() {
  return new ChatOpenAI({
    modelName: DEFAULT_MODEL,
    streaming: true,
    temperature: 0.7,
    maxTokens: 4096,
  });
}

function createTools() {
  const { calculatorTool, currentTimeTool, searchTool } = require("./tools");
  return [calculatorTool, currentTimeTool, searchTool];
}

export async function buildAgent() {
  const model = createModel();
  const tools = createTools();
  const modelWithTools = model.bindTools(tools);

  const workflow = new StateGraph(StateAnnotation)
    .addNode("agent", async (state) => {
      const response = await modelWithTools.invoke(state.messages);
      return { messages: [response] };
    })
    .addNode("tools", async (state) => {
      const lastMessage = state.messages[state.messages.length - 1];
      if (!lastMessage || !("toolCalls" in lastMessage) || !lastMessage.toolCalls) {
        return { messages: [] };
      }

      const toolMessages: any[] = [];
      const toolCalls = lastMessage.toolCalls as any[];
      for (const toolCall of toolCalls) {
        const tool = tools.find((t: any) => t.name === toolCall.name);
        if (!tool) {
          toolMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `Error: Tool ${toolCall.name} not found.`,
          });
          continue;
        }
        try {
          const result = await tool.invoke(toolCall.args);
          toolMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: typeof result === "string" ? result : JSON.stringify(result),
          });
        } catch (err) {
          toolMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `Error executing ${toolCall.name}: ${err instanceof Error ? err.message : "Unknown error"}`,
          });
        }
      }
      return { messages: toolMessages };
    })
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", (state) => {
      const lastMessage = state.messages[state.messages.length - 1];
      const toolCalls = lastMessage && "toolCalls" in lastMessage ? lastMessage.toolCalls as any[] : [];
      if (lastMessage && toolCalls.length > 0) {
        return "tools";
      }
      return "__end__";
    })
    .addEdge("tools", "agent");

  return workflow.compile();
}
