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
 * Compute 2D Poincaré disk embeddings for a skill graph DAG without node collisions.
 * Distributes nodes evenly along concentric depth orbits with angular separation.
 */
export function computePoincareLayout(
  nodes: GraphNode[],
  edges: GraphEdge[]
): PoincareGraph {
  // 1. Group nodes by depth levels
  const depthGroups = new Map<number, GraphNode[]>();
  for (const n of nodes) {
    const group = depthGroups.get(n.depth) || [];
    group.push(n);
    depthGroups.set(n.depth, group);
  }

  // 2. Count fanOut for each node
  const fanOutMap = new Map<string, number>();
  for (const edge of edges) {
    fanOutMap.set(edge.from, (fanOutMap.get(edge.from) ?? 0) + 1);
  }

  // 3. Define radius for each depth level (concentric horizons)
  // depth 0: 0.22, depth 1: 0.46, depth 2: 0.68, depth 3+: 0.86
  const depthRadii = [0.24, 0.48, 0.70, 0.86];

  const poincareNodes: PoincareNode[] = [];
  const nodeMap = new Map<string, PoincareNode>();

  // Sort depth levels
  const sortedDepths = Array.from(depthGroups.keys()).sort((a, b) => a - b);

  for (const depth of sortedDepths) {
    const group = depthGroups.get(depth) || [];
    const count = group.length;
    const r = depthRadii[Math.min(depth, depthRadii.length - 1)];

    // Stagger angle phase for each depth level to avoid vertical alignments
    const phaseOffset = depth * 0.45;

    group.forEach((n, idx) => {
      // Calculate evenly spaced angle across 360 degrees
      const angle = (2 * Math.PI * idx) / Math.max(1, count) + phaseOffset;

      const u = Number((r * Math.cos(angle)).toFixed(4));
      const v = Number((r * Math.sin(angle)).toFixed(4));

      const pNode: PoincareNode = {
        id: n.id,
        name: n.name,
        category: n.category,
        depth,
        fanOut: fanOutMap.get(n.id) ?? 0,
        u,
        v,
        radius: Number(r.toFixed(3)),
        angle: Number(angle.toFixed(3)),
      };

      poincareNodes.push(pNode);
      nodeMap.set(pNode.id, pNode);
    });
  }

  // 4. Build edge distances
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
