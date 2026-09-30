import { createDeepAgent, FilesystemBackend, StateBackend } from "deepagents";
import { ChatGroq } from "@langchain/groq";
import { internetSearch } from "./tools/websearch";
import { writeTodosTool } from "./tools/todo";
import { ChatGoogle } from "@langchain/google";
import path from "path";
// import { createCampaignPlan, getProduct } from "./tools/tools";
// import { campaignPlanSchema } from "./schemas/campaign.schema";
// import { toolStrategy, ToolStrategy } from "langchain";

// const model = new ChatGroq({
//   model: "openai/gpt-oss-120b",
//   temperature: 0,
//   apiKey: process.env.GROQ_API_KEY
// });

const model = new ChatGoogle({
  model: "gemini-1.5-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY
})

const researchSubagent = {
  name: "researcher",
  description: "Specialized subagent for deep web research, gathering facts, and summarizing external documentation.",
  systemPrompt: `You are a Senior Technical Researcher. 
Your goal is to gather detailed information using search tools, filter out irrelevant data, and return a clean, highly structured markdown summary. 
Do not include intermediate scratchpad steps in your final answer.`,
  tools: [internetSearch]
}

const codeSubagent = {
  name: "coder",
  description:
    "Specialized subagent for code analysis, architecture design, and generating clean TypeScript/Docker configurations.",
  systemPrompt: `You are a Principal Software Architect. 
Analyze requirements, apply software design patterns, and produce production-ready code snippets with concise architectural commentary.`,
  tools: [],
};

const workspacePath = path.join(process.cwd(), "agent_workspace");
export const agent = createDeepAgent({
  model,
  // responseFormat: ToolStrategy.fromSchema(campaignPlanSchema),
  // backend: new StateBackend(), // Keeps memory clean in state
  backend: new FilesystemBackend({
    rootDir: workspacePath,
  }),
  tools: [writeTodosTool],
  subagents: [researchSubagent, codeSubagent], // 🔑 Attach subagents here
  systemPrompt: `You are an AI Engineer with a local virtual filesystem workspace at your disposal.
OFFLOADING PROTOCOL:
1. When you fetch large web search results or documentation, write the raw content to a file (e.g., 'research.txt') using 'write_file'.
2. Use 'grep' or 'read_file' to inspect specific sections instead of pasting huge texts into conversation history.
3. Keep active message context clean and concise.`,
});

export default agent;