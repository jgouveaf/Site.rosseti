import * as THREE from "three";

export type TunnelGeometryData = {
  curve: THREE.CatmullRomCurve3;
  tubeGeometry: THREE.BufferGeometry;
  longitudinalGeometry: THREE.BufferGeometry;
  ringGeometries: THREE.BufferGeometry[];
  ringPositions: { position: THREE.Vector3; rotation: THREE.Euler }[];
  totalLength: number;
};

/**
 * Procedural CatmullRomCurve3 Tunnel Generator with Frenet-Serret frames.
 * Creates the authentic Hoyojerez tubular wireframe:
 * - Curving organic spline path
 * - Longitudinal lines converging to vanishing point
 * - Transverse rib rings encircling the tunnel
 * - Semi-translucent depth-occluding inner membrane
 */
export function createHoyojerezTunnel(
  radius: number = 3.6,
  tubularSegments: number = 100,
  radialSegments: number = 20,
  length: number = 160
): TunnelGeometryData {
  // 1. Generate organic 3D winding curve control points
  const points: THREE.Vector3[] = [];
  const pointCount = 14;
  for (let i = 0; i <= pointCount; i++) {
    const t = i / pointCount;
    const z = -t * length;
    // Sinuous organic S-curves on X and Y
    const x = Math.sin(t * Math.PI * 3.2) * (radius * 0.42) + Math.sin(t * Math.PI * 7.5) * 0.35;
    const y = Math.cos(t * Math.PI * 2.8) * (radius * 0.32) + Math.cos(t * Math.PI * 5.5) * 0.28;
    points.push(new THREE.Vector3(x, y, z));
  }

  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);

  // 2. Sample points & Frenet frames along the curve
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const { tangents, normals, binormals } = frames;

  // 3. Generate vertices for every ring and longitudinal line
  // grid[s][j] = Vector3
  const grid: THREE.Vector3[][] = [];
  for (let s = 0; s <= tubularSegments; s++) {
    const u = s / tubularSegments;
    const center = curve.getPointAt(u);
    const N = normals[s];
    const B = binormals[s];

    const ringPoints: THREE.Vector3[] = [];
    for (let j = 0; j < radialSegments; j++) {
      const theta = (j / radialSegments) * Math.PI * 2;
      // Slight ellipse variation for organic structure
      const r = radius * (1 + Math.sin(theta * 4 + u * 12) * 0.04);
      const v = new THREE.Vector3()
        .copy(center)
        .addScaledVector(N, Math.cos(theta) * r)
        .addScaledVector(B, Math.sin(theta) * r);
      ringPoints.push(v);
    }
    grid.push(ringPoints);
  }

  // 4. Longitudinal lines geometry (continuous rails running down the tunnel)
  const longLinePositions: number[] = [];
  for (let j = 0; j < radialSegments; j++) {
    for (let s = 0; s < tubularSegments; s++) {
      const p1 = grid[s][j];
      const p2 = grid[s + 1][j];
      longLinePositions.push(p1.x, p1.y, p1.z);
      longLinePositions.push(p2.x, p2.y, p2.z);
    }
  }
  const longitudinalGeometry = new THREE.BufferGeometry();
  longitudinalGeometry.setAttribute("position", new THREE.Float32BufferAttribute(longLinePositions, 3));

  // 5. Transverse rib rings (spaced every 2 or 3 steps)
  const ringGeometries: THREE.BufferGeometry[] = [];
  const ringPositions: { position: THREE.Vector3; rotation: THREE.Euler }[] = [];
  const ringStep = Math.max(1, Math.floor(tubularSegments / 36));

  for (let s = 0; s <= tubularSegments; s += ringStep) {
    const ringPts: number[] = [];
    for (let j = 0; j <= radialSegments; j++) {
      const p = grid[s][j % radialSegments];
      ringPts.push(p.x, p.y, p.z);
    }
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute("position", new THREE.Float32BufferAttribute(ringPts, 3));
    ringGeometries.push(ringGeo);

    const u = s / tubularSegments;
    const center = curve.getPointAt(u);
    const tangent = tangents[s];
    const rot = new THREE.Euler().setFromRotationMatrix(
      new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), tangent, binormals[s])
    );
    ringPositions.push({ position: center, rotation: rot });
  }

  // 6. Translucent tubular membrane (mesh quads)
  const tubePositions: number[] = [];
  const tubeIndices: number[] = [];
  const tubeUvs: number[] = [];

  for (let s = 0; s <= tubularSegments; s++) {
    for (let j = 0; j <= radialSegments; j++) {
      const p = grid[s][j % radialSegments];
      tubePositions.push(p.x, p.y, p.z);
      tubeUvs.push(j / radialSegments, s / tubularSegments * 8);
    }
  }

  for (let s = 0; s < tubularSegments; s++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = s * (radialSegments + 1) + j;
      const b = (s + 1) * (radialSegments + 1) + j;
      const c = (s + 1) * (radialSegments + 1) + (j + 1);
      const d = s * (radialSegments + 1) + (j + 1);

      // Two triangles per quad
      tubeIndices.push(a, b, d);
      tubeIndices.push(b, c, d);
    }
  }

  const tubeGeometry = new THREE.BufferGeometry();
  tubeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(tubePositions, 3));
  tubeGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(tubeUvs, 2));
  tubeGeometry.setIndex(tubeIndices);
  tubeGeometry.computeVertexNormals();

  return {
    curve,
    tubeGeometry,
    longitudinalGeometry,
    ringGeometries,
    ringPositions,
    totalLength: length,
  };
}
