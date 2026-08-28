import type { GraphNode, GraphEdge } from "./skillGraph";

export interface PoincareNode {
  id: string;
  name: string;
  category: string;
  depth: number;
  fanOut: number;
  u: number;
  v: number;
  radius: number;
  angle: number;
}

export interface PoincareEdge {
  from: string;
  to: string;
  hyperbolicDist: number;
}

export interface PoincareGraph {
  nodes: PoincareNode[];
  edges: PoincareEdge[];
}

/**
 * Poincaré disk metric:
 * d_H(x, y) = arcosh(1 + 2 * ||x-y||^2 / ((1-||x||^2)(1-||y||^2)))
 */
export function hyperbolicDist(u1: number, v1: number, u2: number, v2: number): number {
  const norm1Sq = u1 * u1 + v1 * v1;
  const norm2Sq = u2 * u2 + v2 * v2;
  const diffSq = (u1 - u2) ** 2 + (v1 - v2) ** 2;

  const denom = (1.0 - norm1Sq) * (1.0 - norm2Sq);
  if (denom <= 1e-9) {
    return 5.0;
  }

  const delta = Math.max(1.0, 1.0 + (2.0 * diffSq) / denom);
  return Math.acosh(delta);
}

/**
 * Compute 2D Poincaré disk embeddings for a skill graph DAG.
 * Depth maps to hyperbolic radius r = tanh(alpha * depth), preserving tree distances.
 */
export function computePoincareLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  alpha = 0.32
): PoincareGraph {
  const categories = Array.from(new Set(nodes.map((n) => n.category))).sort();
  const catCount = Math.max(1, categories.length);
  const categoryAngleBase = new Map<string, number>();
  categories.forEach((cat, i) => {
    categoryAngleBase.set(cat, (2 * Math.PI * i) / catCount);
  });

  const fanOutMap = new Map<string, number>();
  for (const edge of edges) {
    fanOutMap.set(edge.from, (fanOutMap.get(edge.from) ?? 0) + 1);
  }

  const categoryCounts = new Map<string, number>();
  const poincareNodes: PoincareNode[] = [];
  const nodeMap = new Map<string, PoincareNode>();

  for (const n of nodes) {
    const depth = n.depth;
    const fanOut = fanOutMap.get(n.id) ?? 0;

    // Hyperbolic radius in [0, 0.88] based on depth
    let rHyperbolic = Math.tanh(alpha * depth);
    rHyperbolic = Math.min(0.88, rHyperbolic);

    // Angular distribution within category sector
    const idxInCat = categoryCounts.get(n.category) ?? 0;
    categoryCounts.set(n.category, idxInCat + 1);

    const sectorSpan = ((2 * Math.PI) / catCount) * 0.8;
    const angle = (categoryAngleBase.get(n.category) ?? 0) + ((idxInCat * 0.23) % sectorSpan);

    const u = Number((rHyperbolic * Math.cos(angle)).toFixed(4));
    const v = Number((rHyperbolic * Math.sin(angle)).toFixed(4));

    const pNode: PoincareNode = {
      id: n.id,
      name: n.name,
      category: n.category,
      depth,
      fanOut,
      u,
      v,
      radius: Number(rHyperbolic.toFixed(3)),
      angle: Number(angle.toFixed(3)),
    };
    poincareNodes.push(pNode);
    nodeMap.set(pNode.id, pNode);
  }

  const poincareEdges: PoincareEdge[] = [];
  for (const e of edges) {
    const src = nodeMap.get(e.from);
    const tgt = nodeMap.get(e.to);
    if (!src || !tgt) continue;

    const dist = hyperbolicDist(src.u, src.v, tgt.u, tgt.v);
    poincareEdges.push({
      from: e.from,
      to: e.to,
      hyperbolicDist: Number(dist.toFixed(3)),
    });
  }

  return {
    nodes: poincareNodes,
    edges: poincareEdges,
  };
}
