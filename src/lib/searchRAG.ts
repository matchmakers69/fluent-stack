import { db } from "@/db";
import { documents } from "@/db/schema";
import { cosineDistance, sql, gt, desc } from "drizzle-orm";
import { getEmbedding } from "./embeddings";

export async function searchDocuments(query: string, limit: number = 5, threshold: number = 0.5) {
  const embedding = await getEmbedding(query);
  const similarity = sql<number>`1 - (${cosineDistance(documents.embedding, embedding)})`;

  const similarDocuments = await db
    .select({
      id: documents.id,
      content: documents.content,
      sourceFileName: documents.sourceFileName,
      similarity,
    })
    .from(documents)
    .where(gt(similarity, threshold))
    .orderBy(desc(similarity))
    .limit(limit);
  return similarDocuments;
}
