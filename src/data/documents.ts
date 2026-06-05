import { db } from "@/db";
import { documents, type InsertDocument } from "@/db/schema";

// Insert documents into the database
export async function insertDocuments(records: InsertDocument[]) {
  return db.insert(documents).values(records);
}
