import * as THREE from 'three';

function height(x: number, y: number) {
  const grain = Math.sin(x * .43 + Math.sin(y * .11)) * Math.cos(y * .37 - x * .16);
  const broad = Math.sin(x * .08 + y * .04) * Math.cos(y * .1);
  const fleck = Math.sin(x * 2.7 + y * 1.4) * .18;
  return grain * .55 + broad * .36 + fleck;
}

export function createSurfaceMaps() {
  const size = 128;
  const normal = new Uint8Array(size * size * 4);
  const roughness = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const offset = (y * size + x) * 4;
    const dx = height((x + 1) % size, y) - height((x + size - 1) % size, y);
    const dy = height(x, (y + 1) % size) - height(x, (y + size - 1) % size);
    const vector = new THREE.Vector3(-dx * .8, -dy * .8, 1).normalize();
    normal[offset] = Math.round((vector.x * .5 + .5) * 255);
    normal[offset + 1] = Math.round((vector.y * .5 + .5) * 255);
    normal[offset + 2] = Math.round((vector.z * .5 + .5) * 255);
    normal[offset + 3] = 255;
    const wear = Math.round(145 + Math.abs(height(x, y)) * 75);
    roughness[offset] = wear;
    roughness[offset + 1] = wear;
    roughness[offset + 2] = wear;
    roughness[offset + 3] = 255;
  }
  const normalMap = new THREE.DataTexture(normal, size, size);
  const roughnessMap = new THREE.DataTexture(roughness, size, size);
  for (const texture of [normalMap, roughnessMap]) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.repeat.set(3, 4);
    texture.needsUpdate = true;
  }
  return { normalMap, roughnessMap };
}
