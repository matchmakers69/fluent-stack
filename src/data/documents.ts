import { db } from "@/shared/db";
import { documents, type InsertDocument } from "@/shared/db/schema";

// Insert documents into the database
export async function insertDocuments(records: InsertDocument[]) {
  return db.insert(documents).values(records);
}
