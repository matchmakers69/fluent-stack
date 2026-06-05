import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

export async function getEmbedding(text: string) {
  const input = text.replace("\n ", " ");
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: input,
  });

  return embedding;
}

// Embeds multiple text chunks in parallel. Use this when seeding/upserting documents.
export async function generateEmbeddings(texts: string[]) {
  const inputs = texts.map((t) => t.replace("\n ", " "));
  const { embeddings } = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values: inputs,
  });

  return embeddings;
}
