/**
 * Constellation geometry and letter asterisms for 'JOÃO GOUVÊA'
 * Coordinates and stroke paths choreographed so that the shooting star's
 * flight trajectory literally draws and constructs each letter of the constellation.
 */

export interface StarVertex {
  id: string;
  x: number;
  y: number;
  z: number;
  letter: string;
  magnitude: number; // 1 (major Alpha), 2 (mid), 3 (minor)
  ignitionProgress: number; // flight spline progress p (0..1) when star ignites
}

export interface ConstellationEdge {
  from: number; // index in stars array
  to: number;   // index in stars array
  letter: string;
  drawStart: number; // flight spline progress p (0..1) when edge starts drawing
  drawEnd: number;   // flight spline progress p (0..1) when edge finishes drawing
}

export interface ConstellationData {
  stars: StarVertex[];
  edges: ConstellationEdge[];
  strokeWaypoints: { x: number; y: number; z: number }[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

// Letter definitions relative to letter box (width ~ 1.0, height ~ 1.0)
interface RawLetterDef {
  points: [number, number, number?][]; // [x, y, magnitude]
  lines: [number, number][]; // [fromIdx, toIdx]
  strokeOrder: number[]; // order of vertex indices to visit
  width: number;
}

const RAW_LETTERS: Record<string, RawLetterDef> = {
  J: {
    points: [
      [0.85, 1.0, 1],  // 0: top right anchor
      [0.85, 0.65, 2], // 1: spine upper
      [0.85, 0.25, 1], // 2: spine lower
      [0.65, 0.0, 2],  // 3: curve right
      [0.35, 0.0, 2],  // 4: curve left
      [0.15, 0.22, 1], // 5: hook tip
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
    strokeOrder: [0, 1, 2, 3, 4, 5],
    width: 0.9,
  },
  O: {
    points: [
      [0.1, 0.3, 2],   // 0
      [0.1, 0.7, 1],   // 1
      [0.32, 0.98, 2], // 2
      [0.68, 0.98, 1], // 3
      [0.9, 0.7, 2],   // 4
      [0.9, 0.3, 1],   // 5
      [0.68, 0.02, 2], // 6
      [0.32, 0.02, 1], // 7
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 0],
    ],
    strokeOrder: [2, 3, 4, 5, 6, 7, 0, 1, 2],
    width: 1.0,
  },
  A_TILDE: {
    points: [
      [0.05, 0.0, 2],  // 0: left foot
      [0.26, 0.5, 2],  // 1: left mid
      [0.5, 0.98, 1],  // 2: apex (Alpha star)
      [0.74, 0.5, 2],  // 3: right mid
      [0.95, 0.0, 2],  // 4: right foot
      [0.24, 0.38, 2], // 5: crossbar left
      [0.76, 0.38, 2], // 6: crossbar right
      // Tilde ~ wave above
      [0.2, 1.15, 2],  // 7
      [0.38, 1.28, 1], // 8: tilde crest
      [0.62, 1.15, 2], // 9: tilde trough
      [0.8, 1.28, 1],  // 10: tilde crest
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [5, 6],
      // Tilde wave
      [7, 8],
      [8, 9],
      [9, 10],
    ],
    // Tracing: left foot -> apex -> tilde wave -> apex -> right leg -> crossbar
    strokeOrder: [0, 1, 2, 7, 8, 9, 10, 2, 3, 6, 5, 3, 4],
    width: 1.0,
  },
  G: {
    points: [
      [0.85, 0.8, 2],  // 0
      [0.6, 0.98, 1],  // 1
      [0.3, 0.98, 2],  // 2
      [0.1, 0.7, 1],   // 3
      [0.1, 0.3, 2],   // 4
      [0.3, 0.02, 1],  // 5
      [0.65, 0.02, 2], // 6
      [0.9, 0.25, 2],  // 7
      [0.9, 0.5, 1],   // 8
      [0.52, 0.5, 2],  // 9
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [8, 9],
    ],
    strokeOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    width: 1.0,
  },
  U: {
    points: [
      [0.12, 1.0, 1],  // 0
      [0.12, 0.35, 2], // 1
      [0.32, 0.02, 1], // 2
      [0.68, 0.02, 2], // 3
      [0.88, 0.35, 2], // 4
      [0.88, 1.0, 1],  // 5
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
    strokeOrder: [0, 1, 2, 3, 4, 5],
    width: 1.0,
  },
  V: {
    points: [
      [0.1, 1.0, 1],   // 0
      [0.3, 0.45, 2],  // 1
      [0.5, 0.0, 1],   // 2
      [0.7, 0.45, 2],  // 3
      [0.9, 1.0, 1],   // 4
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
    strokeOrder: [0, 1, 2, 3, 4],
    width: 0.95,
  },
  E_CIRC: {
    points: [
      [0.85, 0.98, 2], // 0: top right
      [0.15, 0.98, 1], // 1: top spine
      [0.15, 0.5, 1],  // 2: mid spine
      [0.68, 0.5, 2],  // 3: mid right
      [0.15, 0.02, 1], // 4: bot spine
      [0.85, 0.02, 2], // 5: bot right
      // Circumflex ^ above E
      [0.25, 1.15, 2], // 6
      [0.5, 1.34, 1],  // 7 apex
      [0.75, 1.15, 2], // 8
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4],
      [4, 5],
      // Circumflex
      [6, 7],
      [7, 8],
    ],
    strokeOrder: [6, 7, 8, 1, 0, 1, 2, 3, 2, 4, 5],
    width: 0.95,
  },
  A: {
    points: [
      [0.05, 0.0, 2],  // 0
      [0.26, 0.5, 2],  // 1
      [0.5, 0.98, 1],  // 2: apex
      [0.74, 0.5, 2],  // 3
      [0.95, 0.0, 2],  // 4
      [0.24, 0.38, 2], // 5
      [0.76, 0.38, 2], // 6
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [5, 6],
    ],
    strokeOrder: [0, 1, 2, 3, 6, 5, 3, 4],
    width: 1.0,
  },
};

export function buildConstellationData(isCompact: boolean = false): ConstellationData {
  const stars: StarVertex[] = [];
  const edges: ConstellationEdge[] = [];
  const strokeWaypoints: { x: number; y: number; z: number }[] = [];

  const line1Keys = ['J', 'O', 'A_TILDE', 'O'];
  const line2Keys = ['G', 'O', 'U', 'V', 'E_CIRC', 'A'];

  const scale = isCompact ? 1.05 : 1.35;
  const letterSpacing = isCompact ? 0.28 : 0.34;
  const lineGap = isCompact ? 1.85 : 2.15;

  const calcLineWidth = (keys: string[]) => {
    let w = 0;
    keys.forEach((k, idx) => {
      w += RAW_LETTERS[k].width * scale;
      if (idx < keys.length - 1) w += letterSpacing * scale;
    });
    return w;
  };

  const wLine1 = calcLineWidth(line1Keys);
  const wLine2 = calcLineWidth(line2Keys);

  const startYLine1 = lineGap * 0.55;
  const startYLine2 = -lineGap * 0.65;

  // Track raw indices mapping to global star array
  const letterBaseIndices: { [key: string]: number } = {};

  const placeLine = (
    keys: string[],
    startX: number,
    baseY: number,
    lineLetterNames: string[]
  ) => {
    let curX = startX;
    keys.forEach((key, letterIdx) => {
      const def = RAW_LETTERS[key];
      const letterName = lineLetterNames[letterIdx];
      const baseIndex = stars.length;
      letterBaseIndices[letterName] = baseIndex;

      // Stars
      def.points.forEach((pt, pIdx) => {
        const px = curX + pt[0] * scale;
        const py = baseY + pt[1] * scale;
        const pz = Math.sin(px * 1.7 + py * 2.3) * 0.16;

        stars.push({
          id: `${letterName}-${pIdx}`,
          x: px,
          y: py,
          z: pz,
          letter: letterName,
          magnitude: pt[2] || 2,
          ignitionProgress: 1.0, // will be assigned during stroke choreography
        });
      });

      // Edges
      def.lines.forEach(([from, to]) => {
        edges.push({
          from: baseIndex + from,
          to: baseIndex + to,
          letter: letterName,
          drawStart: 1.0,
          drawEnd: 1.0,
        });
      });

      curX += (def.width + letterSpacing) * scale;
    });
  };

  placeLine(line1Keys, -wLine1 / 2, startYLine1, ['J', 'O1', 'Ã', 'O2']);
  placeLine(line2Keys, -wLine2 / 2, startYLine2, ['G', 'O3', 'U', 'V', 'Ê', 'A']);

  // Choreograph the sequential drawing stroke path across all letters
  // Spline drawing phase occupies p in [0.36, 0.78]
  const pDrawStart = 0.36;
  const pDrawEnd = 0.78;

  const letterSequence = [
    { name: 'J', key: 'J' },
    { name: 'O1', key: 'O' },
    { name: 'Ã', key: 'A_TILDE' },
    { name: 'O2', key: 'O' },
    { name: 'G', key: 'G' },
    { name: 'O3', key: 'O' },
    { name: 'U', key: 'U' },
    { name: 'V', key: 'V' },
    { name: 'Ê', key: 'E_CIRC' },
    { name: 'A', key: 'A' },
  ];

  // Build full stroke traversal
  const strokeGlobalIndices: number[] = [];

  letterSequence.forEach((item, lIdx) => {
    const def = RAW_LETTERS[item.key];
    const baseIdx = letterBaseIndices[item.name];

    def.strokeOrder.forEach((localIdx) => {
      strokeGlobalIndices.push(baseIdx + localIdx);
    });

    // Bridge point to next letter if not last
    if (lIdx < letterSequence.length - 1) {
      // Just let spline interpolate smoothly to next letter's start
    }
  });

  const totalStrokeSteps = strokeGlobalIndices.length;

  strokeGlobalIndices.forEach((globalStarIdx, stepIdx) => {
    const star = stars[globalStarIdx];
    const progress = pDrawStart + (stepIdx / (totalStrokeSteps - 1)) * (pDrawEnd - pDrawStart);

    // If star not yet visited or this visit is earlier, set its ignition progress
    if (progress < star.ignitionProgress) {
      star.ignitionProgress = progress;
    }

    strokeWaypoints.push({ x: star.x, y: star.y, z: star.z });
  });

  // Calculate drawStart and drawEnd for each edge
  edges.forEach((edge) => {
    const sFrom = stars[edge.from];
    const sTo = stars[edge.to];
    const minP = Math.min(sFrom.ignitionProgress, sTo.ignitionProgress);
    const maxP = Math.max(sFrom.ignitionProgress, sTo.ignitionProgress);

    edge.drawStart = minP;
    edge.drawEnd = Math.max(minP + 0.008, maxP);
  });

  // Calculate bounds
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  stars.forEach((s) => {
    if (s.x < minX) minX = s.x;
    if (s.x > maxX) maxX = s.x;
    if (s.y < minY) minY = s.y;
    if (s.y > maxY) maxY = s.y;
  });

  return { stars, edges, strokeWaypoints, bounds: { minX, maxX, minY, maxY } };
}
