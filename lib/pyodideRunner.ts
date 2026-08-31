"use client";

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackagesFromImports: (code: string) => Promise<void>;
  setStdout: (options: { batched: (output: string) => void }) => void;
  setStderr: (options: { batched: (output: string) => void }) => void;
}

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
    __pyodideInstance?: PyodideInterface;
    __pyodideLoadingPromise?: Promise<PyodideInterface>;
  }
}

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/";

async function initPyodide(): Promise<PyodideInterface> {
  if (typeof window === "undefined") {
    throw new Error("Pyodide runner is only available client-side");
  }

  if (window.__pyodideInstance) {
    return window.__pyodideInstance;
  }

  if (window.__pyodideLoadingPromise) {
    return window.__pyodideLoadingPromise;
  }

  window.__pyodideLoadingPromise = new Promise<PyodideInterface>((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${PYODIDE_CDN}pyodide.js"]`);
    const onScriptLoaded = async () => {
      try {
        if (!window.loadPyodide) {
          throw new Error("loadPyodide not found on window");
        }
        const pyodide = await window.loadPyodide({ indexURL: PYODIDE_CDN });
        window.__pyodideInstance = pyodide;
        resolve(pyodide);
      } catch (err) {
        reject(err);
      }
    };

    if (existingScript && window.loadPyodide) {
      onScriptLoaded();
    } else {
      const script = document.createElement("script");
      script.src = `${PYODIDE_CDN}pyodide.js`;
      script.async = true;
      script.onload = onScriptLoaded;
      script.onerror = (e) => reject(new Error(`Failed to load Pyodide CDN: ${e}`));
      document.body.appendChild(script);
    }
  });

  return window.__pyodideLoadingPromise;
}

function cleanPyodideTraceback(rawError: string): string {
  if (!rawError) return "";
  const lines = rawError.split("\n");
  const filtered: string[] = [];

  for (const line of lines) {
    if (
      line.includes("_pyodide") ||
      line.includes("CodeRunner") ||
      line.includes("eval_code_async") ||
      line.includes("coroutine = eval(")
    ) {
      continue;
    }
    // Replace <exec> with main.py for clean presentation
    const cleaned = line.replace(/File "<exec>"/g, 'File "main.py"');
    filtered.push(cleaned);
  }

  const result = filtered.join("\n").trim();
  return result || rawError;
}

export async function runPythonInBrowser(
  code: string,
  stdin = ""
): Promise<{ stdout: string; stderr: string; compileError?: string }> {
  try {
    const pyodide = await initPyodide();
    let stdoutBuffer = "";
    let stderrBuffer = "";

    pyodide.setStdout({
      batched: (text: string) => {
        stdoutBuffer += (stdoutBuffer ? "\n" : "") + text;
      },
    });

    pyodide.setStderr({
      batched: (text: string) => {
        stderrBuffer += (stderrBuffer ? "\n" : "") + text;
      },
    });

    // Auto-load common packages (numpy, math, etc.) if imported
    await pyodide.loadPackagesFromImports(code);

    // Format stdin with trailing newline so readline / input() behaves as terminal input
    const formattedStdin = stdin ? (stdin.endsWith("\n") ? stdin : stdin + "\n") : "";

    // Reset sys.stdin cleanly before executing user code
    const setupScript = `
import sys
import io
sys.stdin = io.StringIO(${JSON.stringify(formattedStdin)})
`;
    await pyodide.runPythonAsync(setupScript);

    // Run user code directly so line numbers match user editor line numbers
    await pyodide.runPythonAsync(code);

    return {
      stdout: stdoutBuffer,
      stderr: cleanPyodideTraceback(stderrBuffer),
    };
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    const cleaned = cleanPyodideTraceback(rawMsg);
    return {
      stdout: "",
      stderr: cleaned,
      compileError: cleaned,
    };
  }
}
