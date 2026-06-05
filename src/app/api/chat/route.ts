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
          .map((result, index) => `[${index + 1}] ${result.content}`)
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

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system:
        "You are a helpful assistant for FluentStack, an online English tutoring platform. You are a helpful assistant with access to a knowledge base. When users ask questions, search the knowledge base for relevant information. ALWAYS search before answering if the question might relate to uploaded documents. Base your answers on the search results when available. Give concise answers that correctly answer what the user is asking for. Do not flood them with irrelevant information. If you don't know the answer, say that you don't know. If you are asked a question that is not related to the knowledge base, say that you don't know.",
      stopWhen: stepCountIs(2),
      messages: await convertToModelMessages(messages),
      tools,
    });
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
