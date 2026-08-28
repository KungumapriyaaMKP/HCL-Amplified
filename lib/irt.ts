/**
 * 2-Parameter Logistic Item Response Theory (2PL-IRT) estimation.
 *
 * Computes learner ability parameter theta and its standard error via Maximum
 * Likelihood Estimation over diagnostic and practice responses.
 */

export interface IRTItemResponse {
  a: number; // discrimination parameter (a > 0, default 1.0)
  b: number; // difficulty parameter (default 0.0)
  correct: boolean;
}

export interface IRTEstimate {
  theta: number; // ability estimate clamped to [-4.0, 4.0]
  standardError: number;
  score: number; // 0..100 mapped mastery score for backward compatibility
}

function sigmoid(z: number): number {
  if (z > 30) return 1.0;
  if (z < -30) return 0.0;
  return 1.0 / (1.0 + Math.exp(-z));
}

/**
 * Fit 2PL-IRT ability parameter:
 *   P(Y=1|theta) = 1 / (1 + e^(-a*(theta - b)))
 *
 * Uses bounded scalar optimization (Golden Section Search) on [-4.0, 4.0].
 */
export function estimateTheta(responses: IRTItemResponse[]): IRTEstimate {
  if (!responses || responses.length === 0) {
    return {
      theta: 0.0,
      standardError: 1.0,
      score: 50,
    };
  }

  const items = responses.map((r) => ({
    a: Math.max(0.01, r.a ?? 1.0),
    b: r.b ?? 0.0,
    y: r.correct ? 1.0 : 0.0,
  }));

  const negLogLikelihood = (theta: number): number => {
    let nll = 0.0;
    for (const item of items) {
      const z = item.a * (theta - item.b);
      const p = Math.max(1e-12, Math.min(1.0 - 1e-12, sigmoid(z)));
      nll -= item.y * Math.log(p) + (1.0 - item.y) * Math.log(1.0 - p);
    }
    // Slight L2 regularization prior towards 0.0 to prevent divergence
    const prior = 0.1 * (theta * theta);
    return nll + prior;
  };

  // Golden Section Search on [-4.0, 4.0]
  let a = -4.0;
  let b = 4.0;
  const phi = (1 + Math.sqrt(5)) / 2;
  const resphi = 2 - phi;

  let c = a + resphi * (b - a);
  let d = b - resphi * (b - a);
  let fc = negLogLikelihood(c);
  let fd = negLogLikelihood(d);

  const tol = 1e-4;
  while (Math.abs(b - a) > tol) {
    if (fc < fd) {
      b = d;
      d = c;
      fd = fc;
      c = a + resphi * (b - a);
      fc = negLogLikelihood(c);
    } else {
      a = c;
      c = d;
      fc = fd;
      d = b - resphi * (b - a);
      fd = negLogLikelihood(d);
    }
  }

  const rawTheta = (a + b) / 2;
  const theta = Number(Math.max(-4.0, Math.min(4.0, rawTheta)).toFixed(3));

  // Compute Fisher Information: I(theta) = sum(a^2 * P * (1-P))
  let info = 0.0;
  for (const item of items) {
    const z = item.a * (theta - item.b);
    const p = sigmoid(z);
    info += item.a * item.a * p * (1.0 - p);
  }

  let se = 1.0;
  if (info > 1e-6) {
    se = Number(Math.min(2.0, 1.0 / Math.sqrt(info)).toFixed(3));
  }

  const score = thetaToScore(theta);

  return {
    theta,
    standardError: se,
    score,
  };
}

/**
 * Maps theta in [-4.0, 4.0] to a 0..100 percentage score for legacy consumers.
 */
export function thetaToScore(theta: number): number {
  const p = sigmoid(theta * 0.9);
  return Math.round(Math.max(0, Math.min(100, p * 100)));
}
