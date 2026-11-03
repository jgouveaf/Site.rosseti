/**
 * Constellation geometry and letter asterisms for 'JOÃO GOUVÊA'
 * Coordinates designed to form astronomical constellation figures
 * with real star vertices, varying magnitudes, and connecting celestial lines.
 */

export interface StarVertex {
  id: string;
  x: number;
  y: number;
  z: number;
  letter: string;
  magnitude: number; // 1 (major brightest), 2 (mid), 3 (minor)
  ignitionOrder: number; // 0 to 1 relative timing when shooting star ignites it
}

export interface ConstellationEdge {
  from: number; // index in StarVertex array
  to: number;   // index in StarVertex array
  letter: string;
}

export interface ConstellationData {
  stars: StarVertex[];
  edges: ConstellationEdge[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

// Letter definitions relative to letter box (width ~ 1.0, height ~ 1.0)
const RAW_LETTERS: Record<
  string,
  {
    points: [number, number, number?][];
    lines: [number, number][];
    width: number;
  }
> = {
  J: {
    points: [
      [0.85, 1.0, 1], // 0: top right anchor (mag 1)
      [0.85, 0.65, 2],
      [0.85, 0.25, 1],
      [0.65, 0.0, 2],
      [0.35, 0.0, 2],
      [0.15, 0.22, 1], // hook tip
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
    width: 0.9,
  },
  O: {
    points: [
      [0.1, 0.3, 2],
      [0.1, 0.7, 1],
      [0.32, 0.98, 2],
      [0.68, 0.98, 1],
      [0.9, 0.7, 2],
      [0.9, 0.3, 1],
      [0.68, 0.02, 2],
      [0.32, 0.02, 1],
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
    width: 1.0,
  },
  A_TILDE: {
    points: [
      [0.05, 0.0, 2], // 0: left foot
      [0.26, 0.5, 2], // 1: left mid
      [0.5, 0.98, 1], // 2: apex star (Alpha)
      [0.74, 0.5, 2], // 3: right mid
      [0.95, 0.0, 2], // 4: right foot
      [0.24, 0.38, 2], // 5: bar left
      [0.76, 0.38, 2], // 6: bar right
      // Tilde ~ wave above
      [0.2, 1.15, 2], // 7
      [0.38, 1.28, 1], // 8 crest
      [0.62, 1.15, 2], // 9 trough
      [0.8, 1.28, 1], // 10 crest
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
    width: 1.0,
  },
  G: {
    points: [
      [0.85, 0.8, 2],
      [0.6, 0.98, 1],
      [0.3, 0.98, 2],
      [0.1, 0.7, 1],
      [0.1, 0.3, 2],
      [0.3, 0.02, 1],
      [0.65, 0.02, 2],
      [0.9, 0.25, 2],
      [0.9, 0.5, 1], // crossbar corner
      [0.52, 0.5, 2], // crossbar inside
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
    width: 1.0,
  },
  U: {
    points: [
      [0.12, 1.0, 1],
      [0.12, 0.35, 2],
      [0.32, 0.02, 1],
      [0.68, 0.02, 2],
      [0.88, 0.35, 2],
      [0.88, 1.0, 1],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
    width: 1.0,
  },
  V: {
    points: [
      [0.1, 1.0, 1],
      [0.3, 0.45, 2],
      [0.5, 0.0, 1], // vertex
      [0.7, 0.45, 2],
      [0.9, 1.0, 1],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
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
    width: 0.95,
  },
  A: {
    points: [
      [0.05, 0.0, 2],
      [0.26, 0.5, 2],
      [0.5, 0.98, 1],
      [0.74, 0.5, 2],
      [0.95, 0.0, 2],
      [0.24, 0.38, 2],
      [0.76, 0.38, 2],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [5, 6],
    ],
    width: 1.0,
  },
};

export function buildConstellationData(isCompact: boolean = false): ConstellationData {
  const stars: StarVertex[] = [];
  const edges: ConstellationEdge[] = [];

  const line1Keys = ['J', 'O', 'A_TILDE', 'O'];
  const line2Keys = ['G', 'O', 'U', 'V', 'E_CIRC', 'A'];

  // Scale and spacing
  const scale = isCompact ? 1.05 : 1.35;
  const letterSpacing = isCompact ? 0.28 : 0.34;
  const lineGap = isCompact ? 1.85 : 2.15;

  // Calculate widths
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

  let globalOrder = 0;

  // Helper to place a line of letters
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
      const baseVertexIndex = stars.length;

      // Add points
      def.points.forEach((pt, pIdx) => {
        const px = curX + pt[0] * scale;
        const py = baseY + pt[1] * scale;
        // Subtle organic celestial depth
        const pz = ((Math.sin(px * 1.7 + py * 2.3) * 0.18) + (Math.cos(pIdx * 1.5) * 0.1));

        stars.push({
          id: `${letterName}-${pIdx}`,
          x: px,
          y: py,
          z: pz,
          letter: letterName,
          magnitude: pt[2] || 2,
          ignitionOrder: globalOrder++,
        });
      });

      // Add edges
      def.lines.forEach(([from, to]) => {
        edges.push({
          from: baseVertexIndex + from,
          to: baseVertexIndex + to,
          letter: letterName,
        });
      });

      curX += (def.width + letterSpacing) * scale;
    });
  };

  placeLine(line1Keys, -wLine1 / 2, startYLine1, ['J', 'O1', 'Ã', 'O2']);
  placeLine(line2Keys, -wLine2 / 2, startYLine2, ['G', 'O3', 'U', 'V', 'Ê', 'A']);

  // Normalize ignition order 0..1
  const totalStars = stars.length;
  stars.forEach((s) => {
    s.ignitionOrder = s.ignitionOrder / Math.max(1, totalStars - 1);
  });

  // Calculate bounds
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  stars.forEach((s) => {
    if (s.x < minX) minX = s.x;
    if (s.x > maxX) maxX = s.x;
    if (s.y < minY) minY = s.y;
    if (s.y > maxY) maxY = s.y;
  });

  return { stars, edges, bounds: { minX, maxX, minY, maxY } };
}
