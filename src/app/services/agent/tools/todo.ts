import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Define the schema for a single todo item
const todoSchema = z.object({
  id: z.string().describe("Unique identifier for the task, e.g., '1', '2'"),
  task: z.string().describe("Clear, actionable description of what needs to be done"),
  status: z
    .enum(["pending", "in_progress", "completed"])
    .describe("Current state of execution for this task"),
});

// Create the structured LangChain tool
export const writeTodosTool = tool(
  async ({ todos }) => {
    // In-memory update or state tracking hook
    const completedCount = todos.filter((t) => t.status === "completed").length;
    
    return JSON.stringify({
      success: true,
      message: `Updated task plan: ${completedCount}/${todos.length} tasks completed.`,
      todos,
    });
  },
  {
    name: "write_todos",
    description:
      "Manage and track step-by-step project TODOs. Use this tool at the start of complex tasks or when updating task statuses.",
    schema: z.object({
      todos: z.array(todoSchema).describe("List of todos with statuses"),
    }),
  }
);