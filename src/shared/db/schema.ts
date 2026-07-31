import { pgTable, serial, text, vector, index } from "drizzle-orm/pg-core";

// Stores text chunks and their vector embeddings for RAG (retrieval-augmented generation).
export const documents = pgTable(
  "documents",
  {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    sourceFileName: text("source_file_name"),
    // 1536 dimensions matches OpenAI text-embedding-3-small output.
    embedding: vector("embedding", { dimensions: 1536 }),
  },
  // HNSW index enables fast approximate nearest-neighbour search at query time.
  // vector_cosine_ops = cosine similarity, correct for normalised embeddings.
  (table) => [index("embeddingIndex").using("hnsw", table.embedding.op("vector_cosine_ops"))]
);

export type InsertDocument = typeof documents.$inferInsert;
export type SelectDocument = typeof documents.$inferSelect;
