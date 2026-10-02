import { createDeepAgent, FilesystemBackend } from "deepagents";
import { internetSearch } from "./tools/websearch";
import { writeTodosTool } from "./tools/todo";
import path from "path";
import fs from "fs";

// 1. Updated Google AI model string
// import { ChatOllama } from "@langchain/ollama";
import { ChatGroq } from "@langchain/groq";

// const model = new ChatOllama({
//   model: "qwen3:1.7b",
//   temperature: 0,
// });
const model = new ChatGroq({
  model: "openai/gpt-oss-20b",
  apiKey:process.env.GROQ_API_KEY,
  temperature: 0,
});

// 2. Ensure agent_workspace exists on local disk
const workspacePath = path.join(process.cwd(), "agent_workspace");
if (!fs.existsSync(workspacePath)) {
  fs.mkdirSync(workspacePath, { recursive: true });
}

// 3. Initialize workspace backend
const backend = new FilesystemBackend({
  rootDir: workspacePath,
});

const researchSubagent = {
  name: "researcher",
  description: "Specialized subagent for web research and documentation summarization.",
  systemPrompt: `You are a Senior Technical Researcher. Gather detailed information using search tools and return a clean markdown summary.`,
  tools: [internetSearch],
};

const codeSubagent = {
  name: "coder",
  description: "Specialized subagent for code architecture and TypeScript/Docker generation.",
  systemPrompt: `You are a Principal Software Architect. Produce production-ready code directly.`,
  tools: [],
};

export const agent = createDeepAgent({
  model,
  backend,
  tools: [internetSearch, writeTodosTool],
  subagents: [researchSubagent, codeSubagent],
  systemPrompt: `You are an AI Architect with access to a virtual filesystem in your workspace.

OFFLOADING PROTOCOL:
1. Whenever you fetch web research or generate code/documentation, you MUST explicitly call the 'write_file' tool to save the content (e.g., 'write_file({ path: "research.txt", content: "..." })').
2. Do not just output raw text in your response if you are instructed to create or save a file. Use 'write_file' FIRST.`,
});

export default agent;