import { createDeepAgent, StateBackend } from "deepagents";
import { ChatGroq } from "@langchain/groq";
import { internetSearch } from "./tools/websearch";
import { writeTodosTool } from "./tools/todo";
import { ChatGoogle } from "@langchain/google";
// import { createCampaignPlan, getProduct } from "./tools/tools";
// import { campaignPlanSchema } from "./schemas/campaign.schema";
// import { toolStrategy, ToolStrategy } from "langchain";

// const model = new ChatGroq({
//   model: "openai/gpt-oss-120b",
//   temperature: 0,
//   apiKey: process.env.GROQ_API_KEY
// });

const model = new ChatGoogle({
  model:"gemini-3.8-flash",
  temperature:0,
  apiKey:process.env.GOOGLE_API_KEY
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


export const agent = createDeepAgent({
  model,
  // responseFormat: ToolStrategy.fromSchema(campaignPlanSchema),
  backend: new StateBackend(), // Keeps memory clean in state
  tools:[writeTodosTool],
  subagents: [researchSubagent, codeSubagent], // 🔑 Attach subagents here
  systemPrompt: `You are a Lead AI Architect managing specialized subagents.
For complex tasks:
1. Always use 'write_todos' first to create an execution plan.
2. Delegate deep research tasks to the 'researcher' subagent to keep your main conversation context clean.
3. Delegate code architecture tasks to the 'coder' subagent.
4. Synthesize the subagent reports into your final response.`,
});

export default agent;