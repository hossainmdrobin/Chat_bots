import { tool } from "langchain";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";

export const internetSearch = tool(
  async ({ query, maxResults = 5, topic = "general", includeRawContent = false }) => {
    const tavilySearch = new TavilySearch({
      maxResults,
      tavilyApiKey: process.env.TAVILY_API_KEY,
      includeRawContent,
    //   topic,
    });
    return await tavilySearch.invoke({ query });
  },
  {
    name: "internet_search",
    description: "Run a web search",
    schema: z.object({ 
        query:z.string(),
        maxResults : z.number().default(3),
        topic:z.string(),
        includeRawContent:z.boolean().default(false)
    }),
  }
);
