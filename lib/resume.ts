import { extractText } from "unpdf";

const MAX_CHARS = 12_000; // keep the extraction prompt a reasonable size

/** Extracts plain text from an uploaded resume. PDF via unpdf (pure JS,
 * zero external worker dependencies - works seamlessly in Next.js Server Components / Turbopack);
 * .txt is read as-is. */
export async function extractResumeText(buffer: Buffer, mimeType: string): Promise<string> {
  let text = "";
  if (mimeType === "application/pdf") {
    try {
      const result = await extractText(new Uint8Array(buffer));
      text = Array.isArray(result.text) ? result.text.join("\n") : (result.text || "");
    } catch (_err) {
      // Fallback decode
      text = buffer.toString("utf-8");
    }
  } else {
    text = buffer.toString("utf-8");
  }
  return text.replace(/\s+/g, " ").trim().slice(0, MAX_CHARS);
}
