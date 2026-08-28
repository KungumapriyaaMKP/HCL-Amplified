// Dynamically load face-api to avoid Node.js SSR evaluation errors
let faceapiModule: typeof import("@vladmandic/face-api") | null = null;

async function getFaceApi() {
  if (typeof window === "undefined") return null;
  if (!faceapiModule) {
    faceapiModule = await import("@vladmandic/face-api");
  }
  return faceapiModule;
}

// Standard face-api.js threshold: euclidean distance between two 128-d face
// descriptors below this means "same person". Above it, different person
// (or a bad capture - lighting, angle, partial occlusion).
export const MATCH_THRESHOLD = 0.6;

let modelsLoaded: Promise<void> | null = null;

/** Loads the three models we vendored into public/models (tiny face
 * detector, 68-point landmarks for alignment, and the recognition net that
 * produces the descriptor) - once per page load, cached after that. Model
 * files are served from our own app, not an external CDN. */
export async function loadFaceModels(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!modelsLoaded) {
    modelsLoaded = (async () => {
      const faceapi = await getFaceApi();
      if (!faceapi) return;
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
    })();
  }
  return modelsLoaded;
}

export type FaceCapture = { descriptor: number[]; photoDataUrl: string } | null;

/**
 * Grabs the current frame from a live <video> element, detects a single
 * face, and returns its descriptor (for matching) plus a downscaled JPEG
 * data URL (for the reference photo / review). Returns null if no face is
 * detected in the frame - callers treat that as its own signal ("no_face_detected"),
 * distinct from a detected-but-mismatched face.
 */
export async function captureFace(video: HTMLVideoElement): Promise<FaceCapture> {
  if (typeof window === "undefined") return null;
  const faceapi = await getFaceApi();
  if (!faceapi) return null;
  await loadFaceModels();

  const result = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!result) return null;

  const canvas = document.createElement("canvas");
  const targetWidth = 320;
  const scale = targetWidth / video.videoWidth;
  canvas.width = targetWidth;
  canvas.height = video.videoHeight * scale;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return {
    descriptor: Array.from(result.descriptor),
    photoDataUrl: canvas.toDataURL("image/jpeg", 0.7),
  };
}

/** Euclidean distance between two descriptors - lower means more similar.
 * `MATCH_THRESHOLD` is the standard face-api.js cutoff for "same person". */
export function faceDistance(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 1.0;
  return Math.sqrt(a.reduce((sum, val, idx) => sum + Math.pow(val - (b[idx] ?? 0), 2), 0));
}
