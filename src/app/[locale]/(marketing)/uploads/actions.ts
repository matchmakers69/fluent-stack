"use server";

import { z } from "zod";
import pdf from "pdf-parse";
import { insertDocuments } from "@/data/documents";
import { generateEmbeddings } from "@/lib/embeddings";
import { chunkContent } from "@/lib/chunking";

const PdfFileSchema = z
  .instanceof(File)
  .refine((f) => f.type === "application/pdf", { message: "File must be a PDF" });

export async function processPdfFile(
  file: File
): Promise<{ success: true; message: string } | { success: false; error: string }> {
  const parsed = PdfFileSchema.safeParse(file);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid file" };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const pdfData = await pdf(buffer);

    if (!pdfData.text || pdfData.text.trim().length === 0) {
      return { success: false, error: "PDF appears to be empty or has no extractable text" };
    }

    const chunks = await chunkContent(pdfData.text);
    const embeddings = await generateEmbeddings(chunks);

    // Prepare data for database
    const records = chunks.map((chunk, index) => ({
      content: chunk,
      sourceFileName: file.name,
      embedding: embeddings[index],
    }));
    // Insert into database
    await insertDocuments(records);

    return { success: true, message: `Successfully processed ${records.length} chunks` };
  } catch {
    return { success: false, error: "Failed to process PDF" };
  }
}
