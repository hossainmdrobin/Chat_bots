import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const calculatorTool = tool(
  (input: { expression: string }) => {
    try {
      const sanitized = input.expression.replace(/[^0-9+\-*/().%\s]/g, "");
      const result = Function(`"use strict"; return (${sanitized})`)();
      return `Result: ${result}`;
    } catch {
      return "Error: Invalid mathematical expression.";
    }
  },
  {
    name: "calculator",
    description: "Evaluate a mathematical expression. Use this for any arithmetic, percentages, or calculations.",
    schema: z.object({
      expression: z.string().describe("The mathematical expression to evaluate, e.g. '2 + 2 * 4'"),
    }),
  }
);

export const currentTimeTool = tool(
  () => {
    const now = new Date();
    return `Current time: ${now.toLocaleString()}`;
  },
  {
    name: "current_time",
    description: "Get the current date and time. Use this when asked about the current time or date.",
    schema: z.object({}),
  }
);

export const searchTool = tool(
  (input: { query: string }) => {
    return `Search results for "${input.query}": (simulated) This is a simulated search result. In production, connect this to a real search API like Tavily, SerpAPI, or Bing.`;
  },
  {
    name: "search",
    description: "Search the web for information. Use this when you need up-to-date information or facts not in your training data.",
    schema: z.object({
      query: z.string().describe("The search query string"),
    }),
  }
);

export const agentTools = [calculatorTool, currentTimeTool, searchTool];
