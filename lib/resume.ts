import { PDFParse } from "pdf-parse";

const MAX_CHARS = 12_000; // keep the extraction prompt a reasonable size

/** Extracts plain text from an uploaded resume. PDF via pdf-parse (pure JS,
 * no native bindings - matters on Windows); .txt is read as-is. */
export async function extractResumeText(buffer: Buffer, mimeType: string): Promise<string> {
  let text: string;
  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      text = result.text;
    } finally {
      await parser.destroy();
    }
  } else {
    text = buffer.toString("utf-8");
  }
  return text.replace(/\s+/g, " ").trim().slice(0, MAX_CHARS);
}
