import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * Runs learner-submitted practice code for the in-app compiler.
 *
 * Originally this shelled out to the public Piston sandbox API
 * (emkc.org) - as of Feb 2026 that endpoint went whitelist-only
 * ("Public Piston API is now whitelist only..."), so it 401s for
 * everyone else now. There's no other free, keyless code-execution API
 * with the same reach, so this runs the code in a local subprocess
 * instead (this dev machine already has node/python installed).
 *
 * IMPORTANT: this is a bare subprocess, not a real sandbox (no seccomp,
 * container, or network isolation) - it's appropriate for a local
 * single-user hackathon demo, not for a multi-tenant deployment with
 * untrusted users. A real deployment should swap this for an isolated
 * sandbox (Docker/gVisor/Firecracker/isolated-vm) behind the same
 * runCode() signature before going anywhere near the public internet.
 */

const RUNNERS: Record<string, { file: string; command: string; args: (file: string) => string[] }> = {
  javascript: { file: "main.js", command: "node", args: (f) => [f] },
  typescript: { file: "main.ts", command: "node", args: (f) => [f] }, // Node 24 strips types natively
  python: { file: "main.py", command: "python", args: (f) => [f] },
};

export type RunResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  compileError?: string;
};

const MAX_OUTPUT = 20_000;
const TIMEOUT_MS = 8000;

export async function runCode(language: string, code: string, stdin = ""): Promise<RunResult> {
  const runner = RUNNERS[language];
  if (!runner) throw new Error(`Unsupported language for the practice compiler: ${language}`);

  const dir = await mkdtemp(path.join(tmpdir(), "pathwise-run-"));
  const filePath = path.join(dir, runner.file);

  try {
    await writeFile(filePath, code, "utf-8");

    return await new Promise<RunResult>((resolve) => {
      const child = spawn(runner.command, runner.args(filePath), { cwd: dir });
      let stdout = "";
      let stderr = "";
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill("SIGKILL");
      }, TIMEOUT_MS);

      child.stdin.write(stdin);
      child.stdin.end();

      child.stdout.on("data", (chunk) => {
        if (stdout.length < MAX_OUTPUT) stdout += chunk.toString();
      });
      child.stderr.on("data", (chunk) => {
        if (stderr.length < MAX_OUTPUT) stderr += chunk.toString();
      });

      child.on("error", (err) => {
        clearTimeout(timer);
        resolve({ stdout: "", stderr: "", exitCode: null, compileError: `Could not start ${runner.command}: ${err.message}` });
      });

      child.on("close", (code) => {
        clearTimeout(timer);
        resolve({
          stdout: stdout.slice(0, MAX_OUTPUT),
          stderr: timedOut ? `${stderr}\n[Execution timed out after ${TIMEOUT_MS / 1000}s]` : stderr.slice(0, MAX_OUTPUT),
          exitCode: code,
        });
      });
    });
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
