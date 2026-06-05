import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  streamText,
  UIMessage,
  tool,
  InferUITools,
  UIDataTypes,
  stepCountIs,
} from "ai";
import { z } from "zod";
import { searchDocuments } from "@/lib/searchRAG";

export type ChaTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChaTools>;

const tools = {
  searchKnowledgeBase: tool({
    description: "Search knowledge base for relevant information.",
    inputSchema: z.object({
      query: z.string().describe("The search query to find relevant documents."),
    }),
    execute: async ({ query }) => {
      try {
        const results = await searchDocuments(query, 3, 0.5);
        if (results.length === 0) {
          return "No relevant documents found";
        }
        const formattedResults = results
          .map((result, index) => {
            const source = result.sourceFileName ? ` (source: ${result.sourceFileName})` : "";
            return `[${index + 1}]${source}\n${result.content}`;
          })
          .join("\n\n");

        return formattedResults;
      } catch (error) {
        console.error("Error searching knowledge base:", error);
        return "Failed to search knowledge base";
      }
    },
  }),
};

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const trimmedMessages = messages.slice(-10);

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system:
        "You are a helpful assistant for FluentStack, an online English tutoring platform. You have access to a knowledge base of uploaded documents.\n\n" +
        "Search the knowledge base when the user asks about course content, lessons, materials, or anything that might be covered in uploaded documents. You may search more than once if a question requires multiple lookups.\n\n" +
        "Do NOT search for simple greetings or questions clearly unrelated to tutoring.\n\n" +
        "When search results are available, base your answer on them and mention the source document name if provided. Keep answers concise and focused — do not add information not found in the search results. If no relevant results are found, say so honestly.",
      stopWhen: stepCountIs(4),
      messages: await convertToModelMessages(trimmedMessages),
      tools,
    });
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
