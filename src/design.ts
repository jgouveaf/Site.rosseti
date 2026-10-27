import design from '../design-system.json';

export const palette = design.colors;
export const material = design.materials;
export const motion = design.motion;

export function applyDesignTokens() {
  const root = document.documentElement;
  for (const [name, value] of Object.entries(palette)) root.style.setProperty(`--${name}`, value);
  root.style.setProperty('--bg', palette.background);
  root.style.setProperty('--primary', palette.foreground);
  root.style.setProperty('--secondary', palette.muted);
  root.style.setProperty('--ease-cinematic', motion.cinematic);
  root.style.setProperty('--ease-interface', motion.interface);
}
