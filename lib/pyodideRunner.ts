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

    // Provide simulated sys.stdin if stdin is passed
    const wrapper = `
import sys
import io

_stdin_data = ${JSON.stringify(stdin)}
if _stdin_data:
    sys.stdin = io.StringIO(_stdin_data)

${code}
`;

    await pyodide.runPythonAsync(wrapper);

    return {
      stdout: stdoutBuffer,
      stderr: stderrBuffer,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      stdout: "",
      stderr: errMsg,
      compileError: errMsg,
    };
  }
}
