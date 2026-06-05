import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 20,
  separators: [" "],
});

export async function chunkContent(content: string) {
  const chunks = await textSplitter.splitText(content.trim());
  return chunks;
}
