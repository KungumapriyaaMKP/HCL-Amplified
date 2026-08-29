import zlib from "zlib";

const MAX_CHARS = 4_000; // keep the extraction prompt a reasonable size and well within Groq TPM limits

/**
 * Pure Node.js PDF text extractor that decompresses FlateDecode streams
 * and extracts text tokens without relying on external browser workers.
 */
function extractFromPdfStreams(buffer: Buffer): string {
  const content = buffer.toString("binary");
  const textPieces: string[] = [];

  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(content)) !== null) {
    const rawStream = Buffer.from(match[1], "binary");
    let decompressed: string | null = null;
    try {
      decompressed = zlib.inflateSync(rawStream).toString("latin1");
    } catch {
      try {
        decompressed = zlib.inflateRawSync(rawStream).toString("latin1");
      } catch {
        decompressed = rawStream.toString("latin1");
      }
    }

    if (decompressed) {
      // 1. Tj operators: (Some text) Tj
      const tjMatches = decompressed.matchAll(/\(([^)]*)\)\s*Tj/g);
      for (const m of tjMatches) {
        if (m[1]) textPieces.push(m[1]);
      }

      // 2. TJ array operators: [(Some) 20 (Text)] TJ
      const arrayMatches = decompressed.matchAll(/\[(.*?)\]\s*TJ/g);
      for (const m of arrayMatches) {
        const inner = m[1].matchAll(/\(([^)]*)\)/g);
        for (const im of inner) {
          if (im[1]) textPieces.push(im[1]);
        }
      }

      // 3. Hex string tokens: <48656c6c6f> Tj
      const hexMatches = decompressed.matchAll(/<([0-9a-fA-F]+)>\s*Tj/g);
      for (const m of hexMatches) {
        try {
          const str = Buffer.from(m[1], "hex").toString("utf8");
          if (str && /^[\x20-\x7E\s]+$/.test(str)) {
            textPieces.push(str);
          }
        } catch {}
      }
    }
  }

  // Fallback: search for uncompressed text blocks
  if (textPieces.length === 0) {
    const fallbackMatches = content.matchAll(/\(([^)]+)\)\s*Tj/g);
    for (const m of fallbackMatches) {
      textPieces.push(m[1]);
    }
  }

  return textPieces
    .join(" ")
    .replace(/[\x00\u0000]/g, "")
    .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\([nrtbf()\\])/g, (_, esc) => {
      const map: Record<string, string> = { n: " ", r: " ", t: " ", b: "", f: "", "(": "(", ")": ")", "\\": "\\" };
      return map[esc] || "";
    })
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts plain text from an uploaded resume.
 * Handles PDF files via pure Node.js stream decompression (immune to Next.js worker issues)
 * and plain text files.
 */
export async function extractResumeText(buffer: Buffer, mimeType: string): Promise<string> {
  let text = "";

  if (mimeType === "application/pdf" || buffer.slice(0, 5).toString() === "%PDF-") {
    // 1. Try node pdf-parse if available without worker dependencies
    try {
      const { PDFParse } = await import("pdf-parse/node");
      const parser = new PDFParse({ data: buffer });
      try {
        const res = await parser.getText();
        if (res && res.text && res.text.trim().length > 20) {
          text = res.text;
        }
      } finally {
        await parser.destroy().catch(() => {});
      }
    } catch {
      // Worker issue in Next.js bundler -> proceed to pure stream decoder
    }

    // 2. Pure stream extractor fallback
    if (!text || text.trim().length < 20) {
      try {
        const extracted = extractFromPdfStreams(buffer);
        if (extracted && extracted.trim().length > 0) {
          text = extracted;
        }
      } catch (err) {
        console.error("PDF stream extraction failed:", err);
      }
    }
  } else {
    text = buffer.toString("utf-8");
  }

  return text
    .replace(/[\x00\u0000]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CHARS);
}
