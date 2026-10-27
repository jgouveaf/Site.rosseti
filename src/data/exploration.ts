import source from './exploration-data.json';

export type InteractiveRecord = {
  id: string;
  title: string;
  eyebrow: string;
  position: [number, number, number];
  camera: { position: [number, number, number]; target: [number, number, number] };
  detailCamera: { position: [number, number, number]; target: [number, number, number] };
  radius: number;
  accent: 'signal' | 'accent';
  action: string;
  activeAction: string;
  summary: string;
  detail: string;
  unlock: 'always' | string;
};

// Original illustrations shared by the physical gallery and the memory viewer.
export function memoryArtwork(record: InteractiveRecord) {
  const index = explorationData.interactives.findIndex(item => item.id === record.id);
  const color = record.accent === 'signal' ? '#82c9ce' : '#c99d70';
  const lines = Array.from({ length: 16 }, (_, i) => `<path d="M0 ${235 + i * 9} Q160 ${100 + i * 14} 320 ${235 + i * 7} T640 ${210 + i * 11}"/>`).join('');
  const motif = index === 0 ? '<path d="M275 275L299 58L341 58L365 275Z" fill="#29383c"/><path d="M307 75L299 260M331 75L341 260M294 155H345M287 218H353"/>'
    : index === 1 ? '<ellipse cx="320" cy="160" rx="115" ry="53" transform="rotate(-32 320 160)"/><ellipse cx="320" cy="160" rx="100" ry="63" transform="rotate(44 320 160)"/><circle cx="320" cy="160" r="26"/>'
    : index === 2 ? Array.from({ length: 7 }, (_, i) => `<path d="M${230 + i * 12} ${100 + i * 12}l108 -35l45 67l-108 35Z" fill="#15272d"/>`).join('')
    : '<path d="M220 280V115Q320 -12 420 115V280M243 280V121Q320 24 397 121V280M314 80V280M326 80V280"/><circle cx="320" cy="175" r="38"/>';
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><defs><radialGradient id="g"><stop stop-color="#203037"/><stop offset="1" stop-color="#080e13"/></radialGradient></defs><path fill="url(#g)" d="M0 0H640V400H0Z"/><g fill="none" stroke="${color}" stroke-width="1" opacity=".22">${lines}<path d="M32 200H608M320 30V370"/><circle cx="320" cy="180" r="145" stroke-dasharray="2 7"/></g><g fill="none" stroke="${color}" stroke-width="2">${motif}</g><g fill="${color}" font-family="monospace" font-size="10" letter-spacing="3"><text x="26" y="28">OBSIDIAN / FIELD MEMORY 0${index + 1}</text><text x="26" y="377">${record.id.toUpperCase()}</text><text x="505" y="377">LIVE SCAN</text></g><path d="M14 48V14H48M592 14H626V48M14 352V386H48M592 386H626V352" fill="none" stroke="${color}" opacity=".5"/></svg>`)}`;
}

export const explorationData = source as {
  version: number;
  world: { title: string; navigation: 'cinematic' };
  interactives: InteractiveRecord[];
};
