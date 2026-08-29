import { extractResumeText } from "./lib/resume";

async function test() {
  const sampleTxt = Buffer.from("Experienced full-stack engineer with expertise in TypeScript, React, Python and PostgreSQL.", "utf-8");
  const res = await extractResumeText(sampleTxt, "text/plain");
  console.log("Extracted text successfully:", res);
}

test().catch(console.error);
