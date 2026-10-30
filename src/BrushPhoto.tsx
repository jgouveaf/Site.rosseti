import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

type Mode = "paint" | "restore";
type Point = { x: number; y: number };
const COLUMNS = 18;
const ROWS = 14;
const BRUSH = 0.115;

function drawCircle(ctx: CanvasRenderingContext2D, gray: HTMLCanvasElement, point: Point, width: number, height: number, mode: Mode) {
  const x = point.x * width;
  const y = point.y * height;
  const radius = BRUSH * Math.min(width, height);
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  if (mode === "paint") {
    ctx.clip();
    ctx.drawImage(gray, 0, 0);
  } else {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fill();
  }
  ctx.restore();
}

export function BrushPhoto({ src, alt }: { src: string; alt: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const grayRef = useRef<HTMLCanvasElement | null>(null);
  const modeRef = useRef<Mode>("paint");
  const strokesRef = useRef<Point[]>([]);
  const coveredRef = useRef(new Set<number>());
  const previousRef = useRef<Point | null>(null);
  const [mode, setMode] = useState<Mode>("paint");
  const [progress, setProgress] = useState(0);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const gray = grayRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !gray || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (modeRef.current === "restore") ctx.drawImage(gray, 0, 0);
    for (const point of strokesRef.current) drawCircle(ctx, gray, point, canvas.width, canvas.height, modeRef.current);
  }, []);

  const prepare = useCallback(() => {
    const frame = frameRef.current;
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!frame || !image || !canvas || !image.complete || !image.naturalWidth) return;
    const scale = Math.min(devicePixelRatio || 1, 2);
    frame.style.setProperty("--brush-diameter", `${BRUSH * 2 * Math.min(frame.clientWidth, frame.clientHeight)}px`);
    const width = Math.max(1, Math.round(frame.clientWidth * scale));
    const height = Math.max(1, Math.round(frame.clientHeight * scale));
    if (canvas.width === width && canvas.height === height && grayRef.current) return;
    canvas.width = width;
    canvas.height = height;
    const gray = document.createElement("canvas");
    gray.width = width;
    gray.height = height;
    const ctx = gray.getContext("2d");
    if (!ctx) return;
    const sourceRatio = image.naturalWidth / image.naturalHeight;
    const targetRatio = width / height;
    const sourceWidth = sourceRatio > targetRatio ? image.naturalHeight * targetRatio : image.naturalWidth;
    const sourceHeight = sourceRatio > targetRatio ? image.naturalHeight : image.naturalWidth / targetRatio;
    const sourceX = (image.naturalWidth - sourceWidth) / 2;
    const sourceY = (image.naturalHeight - sourceHeight) / 2;
    ctx.filter = "grayscale(1)";
    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
    grayRef.current = gray;
    redraw();
  }, [redraw]);

  useEffect(() => {
    const image = imageRef.current;
    const frame = frameRef.current;
    if (!image || !frame) return;
    image.addEventListener("load", prepare);
    const resize = new ResizeObserver(prepare);
    resize.observe(frame);
    prepare();
    return () => {
      image.removeEventListener("load", prepare);
      resize.disconnect();
    };
  }, [prepare]);

  const finish = () => {
    const canvas = canvasRef.current;
    const gray = grayRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !gray || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (modeRef.current === "paint") {
      ctx.drawImage(gray, 0, 0);
      modeRef.current = "restore";
      setMode("restore");
    } else {
      modeRef.current = "paint";
      setMode("paint");
    }
    strokesRef.current = [];
    coveredRef.current.clear();
    previousRef.current = null;
    setProgress(0);
  };

  const markCoverage = (point: Point, width: number, height: number) => {
    const radius = BRUSH * Math.min(width, height) * 0.78;
    for (let row = 0; row < ROWS; row++) {
      for (let column = 0; column < COLUMNS; column++) {
        const dx = ((column + 0.5) / COLUMNS - point.x) * width;
        const dy = ((row + 0.5) / ROWS - point.y) * height;
        if (dx * dx + dy * dy <= radius * radius) coveredRef.current.add(row * COLUMNS + column);
      }
    }
    const count = coveredRef.current.size;
    setProgress(Math.round((count / (COLUMNS * ROWS)) * 100));
    if (count === COLUMNS * ROWS) finish();
  };

  const stroke = (event: PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    const gray = grayRef.current;
    const ctx = canvas?.getContext("2d");
    if (!frame || !canvas || !gray || !ctx) return;
    const bounds = frame.getBoundingClientRect();
    const point = {
      x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
      y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
    };
    const cursor = cursorRef.current;
    if (cursor) {
      cursor.style.left = `${point.x * 100}%`;
      cursor.style.top = `${point.y * 100}%`;
    }
    if (event.pointerType === "touch" && event.buttons !== 1) return;
    const startingMode = modeRef.current;
    const previous = previousRef.current ?? point;
    const distance = Math.hypot((point.x - previous.x) * canvas.width, (point.y - previous.y) * canvas.height);
    const steps = Math.max(1, Math.ceil(distance / (BRUSH * Math.min(canvas.width, canvas.height) * 0.4)));
    for (let step = 1; step <= steps; step++) {
      const current = { x: previous.x + (point.x - previous.x) * step / steps, y: previous.y + (point.y - previous.y) * step / steps };
      drawCircle(ctx, gray, current, canvas.width, canvas.height, modeRef.current);
      strokesRef.current.push(current);
      markCoverage(current, canvas.width, canvas.height);
      if (modeRef.current !== startingMode) break;
    }
    previousRef.current = point;
  };

  return <div className="pf-brush-photo" ref={frameRef} role="button" tabIndex={0}
    aria-label={`${alt}. Passe o mouse ou arraste o dedo para pintar a foto em preto e branco. Depois de completar, repita para devolver as cores.`}
    data-mode={mode}
    onPointerEnter={() => { frameRef.current?.classList.add("is-brushing"); previousRef.current = null; }}
    onPointerLeave={() => { frameRef.current?.classList.remove("is-brushing"); previousRef.current = null; }}
    onPointerDown={(event) => { if (event.pointerType !== "mouse") frameRef.current?.setPointerCapture(event.pointerId); stroke(event); }}
    onPointerMove={stroke}
    onPointerUp={() => { previousRef.current = null; }}
    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); finish(); } }}>
    <img ref={imageRef} src={src} alt={alt} fetchPriority="high" draggable={false} />
    <canvas ref={canvasRef} aria-hidden="true" />
    <span className="pf-brush-cursor" ref={cursorRef} aria-hidden="true" />
    <span className="pf-brush-instruction" aria-live="polite">
      <strong>{mode === "paint" ? "PASSE O PINCEL → P&B" : "AGORA REPASSE → COR"}</strong>
      <span>{progress}%</span>
    </span>
  </div>;
}
