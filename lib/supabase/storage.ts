import "server-only";
import { createServerSupabase, PATTERN_PDFS_BUCKET } from "./server";

/**
 * Upload a PDF file to the pattern-pdfs bucket and return its public path (for signed URL or storage URL).
 * File is stored as: {projectId}/{uniqueId}.pdf
 */
export async function uploadPatternPdf(
  projectId: string,
  file: File | { arrayBuffer: () => Promise<ArrayBuffer>; name: string }
): Promise<string> {
  const supabase = createServerSupabase();
  const arrayBuffer =
    "arrayBuffer" in file
      ? await file.arrayBuffer()
      : await (file as File).arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext =
    "name" in file ? (file.name.endsWith(".pdf") ? ".pdf" : "") : ".pdf";
  const path = `${projectId}/${crypto.randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(PATTERN_PDFS_BUCKET)
    .upload(path, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) throw error;

  return path;
}

/**
 * Download file bytes from Storage by URL (for text extraction).
 * Use the path derived from the stored URL or pass the path segment.
 */
export async function downloadStorageFile(path: string): Promise<Buffer> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.storage
    .from(PATTERN_PDFS_BUCKET)
    .download(path);

  if (error) throw error;
  if (!data) throw new Error("No file data returned");
  return Buffer.from(await data.arrayBuffer());
}
