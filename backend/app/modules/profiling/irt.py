"""
2-Parameter Logistic Item Response Theory (2PL-IRT) estimation.

Computes learner ability parameter theta and its standard error via Maximum
Likelihood Estimation over diagnostic responses.
"""
from __future__ import annotations

import math
from typing import Sequence

import numpy as np
from scipy.optimize import minimize_scalar
from scipy.special import expit


def estimate_theta(
    responses: Sequence[tuple[float, float, bool]]
) -> tuple[float, float]:
    """
    Fit 2PL-IRT ability parameter:
        P(Y=1|theta) = 1 / (1 + e^(-a*(theta - b)))

    Parameters:
        responses: list of (a, b, correct) tuples
            a: item discrimination parameter (a > 0)
            b: item difficulty parameter
            correct: True if response was correct, False otherwise

    Returns:
        (theta_estimate, standard_error)
    """
    if not responses:
        return (0.0, 1.0)

    a_vals = np.array([float(r[0]) for r in responses], dtype=np.float64)
    b_vals = np.array([float(r[1]) for r in responses], dtype=np.float64)
    y_vals = np.array([1.0 if r[2] else 0.0 for r in responses], dtype=np.float64)

    # Negative log-likelihood function
    def neg_log_likelihood(theta: float) -> float:
        z = a_vals * (theta - b_vals)
        # Numerical stability using log-sum-exp or logit
        p = expit(z)
        p = np.clip(p, 1e-12, 1.0 - 1e-12)
        nll = -np.sum(y_vals * np.log(p) + (1.0 - y_vals) * np.log(1.0 - p))
        # Slight L2 regularization prior towards 0.0 to prevent divergence when all correct/incorrect
        prior = 0.1 * (theta ** 2)
        return float(nll + prior)

    # Bounded scalar optimization on [-4.0, 4.0]
    res = minimize_scalar(
        neg_log_likelihood,
        bounds=(-4.0, 4.0),
        method="bounded",
        options={"xatol": 1e-4},
    )

    theta = float(res.x)

    # Compute Fisher Information: I(theta) = sum(a^2 * P * (1-P))
    z = a_vals * (theta - b_vals)
    p = expit(z)
    info = np.sum((a_vals ** 2) * p * (1.0 - p))

    if info > 1e-6:
        se = float(1.0 / math.sqrt(info))
    else:
        se = 1.0

    return (round(theta, 3), round(min(se, 2.0), 3))
