declare module "pdf-parse" {
  interface PdfData {
    text: string;
    numpages: number;
    info?: unknown;
    metadata?: unknown;
  }
  function pdfParse(buffer: Buffer): Promise<PdfData>;
  export default pdfParse;
}
