import { createDeepAgent } from "deepagents";
import { ChatGroq } from "@langchain/groq";
import { internetSearch } from "./tools/websearch";
// import { createCampaignPlan, getProduct } from "./tools/tools";
// import { campaignPlanSchema } from "./schemas/campaign.schema";
// import { toolStrategy, ToolStrategy } from "langchain";

const model = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY
});


const agent = createDeepAgent({
  model,
  // responseFormat: ToolStrategy.fromSchema(campaignPlanSchema),
  //   tools: [getProduct, createCampaignPlan],
  tools: [internetSearch],
  systemPrompt: `
  You are a helpful research agent.
  `
});

export default agent;