import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 150,
  separators: ["\n\n", "\n", " ", ""],
});

export async function chunkContent(content: string) {
  const chunks = await textSplitter.splitText(content.trim());
  return chunks;
}
