import "server-only";

/**
 * Extract plain text from a PDF buffer (server-only).
 * Uses pdf-parse; throws on invalid PDF or extraction failure.
 */
export async function extractTextFromPdfBuffer(
  buffer: Buffer
): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  const text = typeof data?.text === "string" ? data.text.trim() : "";
  if (!text) throw new Error("PDF produced no extractable text");
  return text;
}
