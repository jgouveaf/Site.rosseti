import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { buildConstellationData, ConstellationData } from "./constellationData";
import "./constellation-intro.css";

interface TheConstellationIntroProps {
  onComplete: () => void;
}

export const TheConstellationIntro: React.FC<TheConstellationIntroProps> = ({
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blackoutRef = useRef<HTMLDivElement>(null);

  const [soundEnabled, setSoundEnabled] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Audio system state refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const soundEnabledRef = useRef(false);

  // Animation timeline ref
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Cleanup lock
  const isDestroyedRef = useRef(false);

  // Toggle Audio
  const toggleAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Sub bass cosmic drone
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(55, ctx.currentTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(110, ctx.currentTime);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 1.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        droneGainRef.current = gain;
      } catch (err) {
        console.warn("AudioContext not supported", err);
      }
    }

    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }

    setSoundEnabled((prev) => {
      const next = !prev;
      soundEnabledRef.current = next;
      if (droneGainRef.current && audioCtxRef.current) {
        droneGainRef.current.gain.setTargetAtTime(
          next ? 0.14 : 0.0001,
          audioCtxRef.current.currentTime,
          0.1
        );
      }
      return next;
    });
  }, []);

  // Play celestial chime when a constellation letter vertex is ignited
  const playStellarChime = useCallback((pitchMultiplier: number = 1.0) => {
    if (!soundEnabledRef.current || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = 528 * pitchMultiplier;
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.038, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    } catch {
      // Audio fallback silent
    }
  }, []);

  // Skip or Finish handler
  const finishIntro = useCallback(() => {
    if (isDestroyedRef.current) return;
    isDestroyedRef.current = true;

    // Fade out audio smoothly
    if (droneGainRef.current && audioCtxRef.current) {
      try {
        droneGainRef.current.gain.linearRampToValueAtTime(
          0.0001,
          audioCtxRef.current.currentTime + 0.3
        );
        setTimeout(() => audioCtxRef.current?.close(), 350);
      } catch {
        // Safe close
      }
    }

    // Kill timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }

    // Record session
    try {
      sessionStorage.setItem("hasSeenConstellationIntro", "true");
    } catch {
      // Storage unavailable
    }

    // Fade out root overlay smoothly
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 650);
  }, [onComplete]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        finishIntro();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [finishIntro]);

  // Main Three.js Scene Setup & Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      finishIntro();
      return;
    }

    // Three.js Core
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020307");
    scene.fog = new THREE.FogExp2("#020307", 0.008);

    const isCompact = window.innerWidth < 768;
    const cameraZ = isCompact ? 14.8 : 11.8;

    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );
    camera.position.set(0, 0, cameraZ);

    // Dynamic sizing based on viewport
    const constellationData: ConstellationData = buildConstellationData(isCompact);

    // Helper: generate soft circular star texture with golden radial falloff
    const createStarTexture = () => {
      const size = 128;
      const cv = document.createElement("canvas");
      cv.width = size;
      cv.height = size;
      const ctx = cv.getContext("2d")!;
      const center = size / 2;

      const grad = ctx.createRadialGradient(
        center,
        center,
        0,
        center,
        center,
        center
      );
      grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      grad.addColorStop(0.12, "rgba(255, 245, 220, 0.95)");
      grad.addColorStop(0.35, "rgba(223, 184, 120, 0.45)");
      grad.addColorStop(0.7, "rgba(145, 166, 211, 0.12)");
      grad.addColorStop(1, "rgba(2, 3, 7, 0.0)");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    // Helper: generate 4-point cross diffraction lens flare
    const createFlareTexture = () => {
      const size = 256;
      const cv = document.createElement("canvas");
      cv.width = size;
      cv.height = size;
      const ctx = cv.getContext("2d")!;
      const c = size / 2;

      // Center glow
      const radGrad = ctx.createRadialGradient(c, c, 0, c, c, c * 0.45);
      radGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
      radGrad.addColorStop(0.2, "rgba(255, 235, 185, 0.85)");
      radGrad.addColorStop(0.6, "rgba(223, 184, 120, 0.2)");
      radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, size, size);

      // Horizontal ray
      const hGrad = ctx.createLinearGradient(0, c, size, c);
      hGrad.addColorStop(0, "rgba(255, 220, 150, 0)");
      hGrad.addColorStop(0.48, "rgba(255, 245, 225, 0.9)");
      hGrad.addColorStop(0.5, "rgba(255, 255, 255, 1)");
      hGrad.addColorStop(0.52, "rgba(255, 245, 225, 0.9)");
      hGrad.addColorStop(1, "rgba(255, 220, 150, 0)");
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, c - 2.5, size, 5);

      // Vertical ray
      const vGrad = ctx.createLinearGradient(c, 0, c, size);
      vGrad.addColorStop(0, "rgba(255, 220, 150, 0)");
      vGrad.addColorStop(0.48, "rgba(255, 245, 225, 0.9)");
      vGrad.addColorStop(0.5, "rgba(255, 255, 255, 1)");
      vGrad.addColorStop(0.52, "rgba(255, 245, 225, 0.9)");
      vGrad.addColorStop(1, "rgba(255, 220, 150, 0)");
      ctx.fillStyle = vGrad;
      ctx.fillRect(c - 2.5, 0, 5, size);

      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const starTexture = createStarTexture();
    const flareTexture = createFlareTexture();

    // 1. Deep Celestial Starfield (3 Depth Layers)
    const starCount = isCompact ? 1100 : 2200;
    const starfieldGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    const colorWarmWhite = new THREE.Color("#F8F5E9");
    const colorIcyBlue = new THREE.Color("#91A6D3");
    const colorGold = new THREE.Color("#DFB878");

    for (let i = 0; i < starCount; i++) {
      const radius = 25 + Math.pow(Math.random(), 1.5) * 110;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = -radius * Math.abs(Math.cos(phi)) - 5;

      starPositions[i * 3] = x;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = z;

      const pick = Math.random();
      const col =
        pick < 0.7 ? colorWarmWhite : pick < 0.9 ? colorIcyBlue : colorGold;
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;

      starSizes[i] = (Math.random() * 0.35 + 0.15) * (isCompact ? 1.0 : 1.4);
    }

    starfieldGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3)
    );
    starfieldGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    starfieldGeo.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));

    const starfieldMat = new THREE.PointsMaterial({
      size: isCompact ? 0.65 : 0.85,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starfieldMesh = new THREE.Points(starfieldGeo, starfieldMat);
    scene.add(starfieldMesh);

    // 2. The Constellation Stars & Connecting Lines
    const constStarGroup = new THREE.Group();
    scene.add(constStarGroup);

    interface ConstellationStarNode {
      mesh: THREE.Sprite;
      flareMesh: THREE.Sprite;
      light: THREE.PointLight;
      targetScale: number;
      ignited: boolean;
      data: (typeof constellationData.stars)[0];
    }

    const starNodes: ConstellationStarNode[] = [];

    constellationData.stars.forEach((star) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(star.x, star.y, star.z);

      const baseScale =
        star.magnitude === 1 ? 0.55 : star.magnitude === 2 ? 0.38 : 0.25;

      const spriteMat = new THREE.SpriteMaterial({
        map: starTexture,
        color: star.magnitude === 1 ? 0xffffff : 0xf8f5e9,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const starSprite = new THREE.Sprite(spriteMat);
      starSprite.scale.set(baseScale, baseScale, 1);
      nodeGroup.add(starSprite);

      const flareMat = new THREE.SpriteMaterial({
        map: flareTexture,
        color: 0xdfb878,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const flareSprite = new THREE.Sprite(flareMat);
      flareSprite.scale.set(baseScale * 2.8, baseScale * 2.8, 1);
      nodeGroup.add(flareSprite);

      const pointLight = new THREE.PointLight(0xdfb878, 0, 3.5);
      nodeGroup.add(pointLight);

      constStarGroup.add(nodeGroup);

      starNodes.push({
        mesh: starSprite,
        flareMesh: flareSprite,
        light: pointLight,
        targetScale: baseScale,
        ignited: false,
        data: star,
      });
    });

    // Constellation Connecting Lines (Dynamic progressive growth buffer)
    const numEdges = constellationData.edges.length;
    const linePositions = new Float32Array(numEdges * 6);

    // Initialize all lines collapsed at their origin star
    constellationData.edges.forEach((edge, i) => {
      const sFrom = constellationData.stars[edge.from];
      linePositions[i * 6 + 0] = sFrom.x;
      linePositions[i * 6 + 1] = sFrom.y;
      linePositions[i * 6 + 2] = sFrom.z;
      linePositions[i * 6 + 3] = sFrom.x;
      linePositions[i * 6 + 4] = sFrom.y;
      linePositions[i * 6 + 5] = sFrom.z;
    });

    const constLineGeo = new THREE.BufferGeometry();
    const constLinePosAttr = new THREE.BufferAttribute(linePositions, 3);
    constLineGeo.setAttribute("position", constLinePosAttr);

    const constLineMat = new THREE.LineBasicMaterial({
      color: 0xdfb878,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      linewidth: isCompact ? 1.5 : 2,
      depthWrite: false,
    });

    const constLineMesh = new THREE.LineSegments(constLineGeo, constLineMat);
    scene.add(constLineMesh);

    // 3. The Protagonist Shooting Star & Luminous Trail
    // Assemble the complete spline including the detailed stroke waypoints of the letters
    const flightControlPoints: THREE.Vector3[] = [
      new THREE.Vector3(0, 0, -55),    // 0.0: Awakening in cosmic distance
      new THREE.Vector3(3, 1, -40),    // Early acceleration
      new THREE.Vector3(14, 5, -22),   // Curve sweeping past camera
      new THREE.Vector3(-12, -3, -10), // Deep space pursuit
      new THREE.Vector3(-6, 3, -3),    // Approaching canvas plane
    ];

    // Append every stroke waypoint in order
    constellationData.strokeWaypoints.forEach((pt) => {
      flightControlPoints.push(new THREE.Vector3(pt.x, pt.y, pt.z));
    });

    // Crown apex hover and contraction
    flightControlPoints.push(
      new THREE.Vector3(0, 0.35, 0.1),
      new THREE.Vector3(0, 0.35, 0.1)
    );

    const starFlightSpline = new THREE.CatmullRomCurve3(
      flightControlPoints,
      false,
      "catmullrom",
      0.18
    );

    // Shooting Star Head Group
    const shootingStarHead = new THREE.Group();
    scene.add(shootingStarHead);

    const headCoreMat = new THREE.SpriteMaterial({
      map: starTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const headCore = new THREE.Sprite(headCoreMat);
    headCore.scale.set(1.4, 1.4, 1);
    shootingStarHead.add(headCore);

    const headFlareMat = new THREE.SpriteMaterial({
      map: flareTexture,
      color: 0xffd285,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const headFlare = new THREE.Sprite(headFlareMat);
    headFlare.scale.set(4.5, 4.5, 1);
    shootingStarHead.add(headFlare);

    const headLight = new THREE.PointLight(0xffdf99, 0, 18);
    shootingStarHead.add(headLight);

    // Trail Buffer (Sliding Ribbon / Line Trail)
    const TRAIL_LENGTH = 120;
    const trailPositions = new Float32Array(TRAIL_LENGTH * 3);
    const trailColors = new Float32Array(TRAIL_LENGTH * 3);

    const initialPoint = starFlightSpline.getPointAt(0);
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      trailPositions[i * 3] = initialPoint.x;
      trailPositions[i * 3 + 1] = initialPoint.y;
      trailPositions[i * 3 + 2] = initialPoint.z;

      const alpha = Math.pow(1 - i / TRAIL_LENGTH, 1.8);
      trailColors[i * 3] = 1.0 * alpha;
      trailColors[i * 3 + 1] = 0.82 * alpha;
      trailColors[i * 3 + 2] = 0.48 * alpha;
    }

    const trailGeo = new THREE.BufferGeometry();
    const trailPosAttr = new THREE.BufferAttribute(trailPositions, 3);
    trailGeo.setAttribute("position", trailPosAttr);
    trailGeo.setAttribute("color", new THREE.BufferAttribute(trailColors, 3));

    const trailMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      linewidth: isCompact ? 2 : 3,
      depthWrite: false,
    });

    const trailMesh = new THREE.Line(trailGeo, trailMat);
    scene.add(trailMesh);

    // Trailing golden sparks / cosmic dust embers
    const EMBER_COUNT = 70;
    const emberPositions = new Float32Array(EMBER_COUNT * 3);
    const emberVelocities: THREE.Vector3[] = [];
    const emberAges = new Float32Array(EMBER_COUNT);

    for (let i = 0; i < EMBER_COUNT; i++) {
      emberPositions[i * 3] = initialPoint.x;
      emberPositions[i * 3 + 1] = initialPoint.y;
      emberPositions[i * 3 + 2] = initialPoint.z;
      emberVelocities.push(new THREE.Vector3());
      emberAges[i] = 1.0;
    }

    const emberGeo = new THREE.BufferGeometry();
    const emberPosAttr = new THREE.BufferAttribute(emberPositions, 3);
    emberGeo.setAttribute("position", emberPosAttr);

    const emberMat = new THREE.PointsMaterial({
      size: 0.35,
      map: starTexture,
      color: 0xffd285,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const emberMesh = new THREE.Points(emberGeo, emberMat);
    scene.add(emberMesh);

    // GSAP Controlled State Values
    const animState = {
      splineProgress: 0,
      starGlowOpacity: 0,
      starGlowScale: 0.2,
      trailOpacity: 0,
      cameraMode: 0, // 0: awaken, 1: chase, 2: pull back, 3: full view
      constellationContraction: 0,
    };

    // 4. Master 9-Second GSAP Timeline
    const tl = gsap.timeline({
      onComplete: () => {
        if (blackoutRef.current) {
          blackoutRef.current.classList.add("active");
        }
        setTimeout(() => {
          finishIntro();
        }, 280);
      },
    });
    timelineRef.current = tl;

    // FASE 1 | 0 - 1.0s: O DESPERTAR
    // Point of light awakens, pulses twice gently
    tl.to(
      animState,
      {
        starGlowOpacity: 0.95,
        starGlowScale: 1.1,
        duration: 0.5,
        ease: "power2.out",
      },
      0
    );
    tl.to(
      animState,
      {
        starGlowScale: 0.55,
        duration: 0.25,
        ease: "sine.inOut",
      },
      0.5
    );
    tl.to(
      animState,
      {
        starGlowScale: 1.6,
        starGlowOpacity: 1.0,
        duration: 0.25,
        ease: "power2.in",
      },
      0.75
    );

    // FASE 2 | 1.0 - 2.5s: ACELERAÇÃO
    // Dispara em curva 3D, passa perto da câmera, rastro luminoso
    tl.to(
      animState,
      {
        splineProgress: 0.22,
        trailOpacity: 1.0,
        cameraMode: 1, // transition to chase cam
        duration: 1.5,
        ease: "power2.inOut",
      },
      1.0
    );

    // FASE 3 | 2.5 - 3.8s: PERSEGUIÇÃO ESPACIAL
    // Câmera acompanha de perto, curvas cósmicas fluidas
    tl.to(
      animState,
      {
        splineProgress: 0.36,
        duration: 1.3,
        ease: "sine.inOut",
      },
      2.5
    );

    // FASE 4 | 3.8 - 7.3s: O DESENHO DA CONSTELAÇÃO
    // A estrela percorre fisicamente cada letra de "JOÃO GOUVÊA"!
    // Câmera afasta-se suavemente para vista frontal orbital
    tl.to(
      animState,
      {
        cameraMode: 2, // pull back to frame constellation
        duration: 0.8,
        ease: "power2.out",
      },
      3.8
    );

    tl.to(
      animState,
      {
        splineProgress: 0.80, // desenha JOÃO e GOUVÊA
        duration: 3.5,
        ease: "none", // velocidade de escrita uniforme
      },
      3.8
    );

    // FASE 5 | 7.3 - 8.2s: A REVELAÇÃO & CONTEMPLAÇÃO
    // Estrela sobe para o ápice central, subtítulo surge, constelação completa brilha
    tl.to(
      animState,
      {
        splineProgress: 0.92,
        cameraMode: 3, // enquadramento contemplativo estável
        duration: 0.9,
        ease: "power2.out",
      },
      7.3
    );

    tl.call(
      () => {
        setSubtitleVisible(true);
        playStellarChime(1.25);
      },
      undefined,
      7.4
    );

    // FASE 6 | 8.2 - 9.0s: TRANSIÇÃO
    // Brilho converge para a estrela central, prepara blackout
    tl.to(
      animState,
      {
        constellationContraction: 1.0,
        trailOpacity: 0.1,
        starGlowScale: 2.6,
        duration: 0.75,
        ease: "power3.in",
      },
      8.2
    );

    // 5. Render Loop (Synchronized with Timeline & Three.js)
    let lastTime = performance.now();
    let emberSpawnIdx = 0;

    const tick = (now: number) => {
      if (isDestroyedRef.current) return;
      animationFrameRef.current = requestAnimationFrame(tick);

      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const p = Math.max(0, Math.min(1, animState.splineProgress));

      // Current shooting star position & tangent
      const currentStarPos = starFlightSpline.getPointAt(p);
      const tangent = starFlightSpline.getTangentAt(p).normalize();

      // Update shooting star head
      shootingStarHead.position.copy(currentStarPos);
      headCoreMat.opacity = animState.starGlowOpacity;
      headFlareMat.opacity = animState.starGlowOpacity * 0.9;
      headLight.intensity = animState.starGlowOpacity * 2.8;

      const headScale = animState.starGlowScale;
      headCore.scale.set(1.4 * headScale, 1.4 * headScale, 1);
      headFlare.scale.set(4.5 * headScale, 4.5 * headScale, 1);

      // Update Trail Ribbon
      trailMat.opacity = animState.trailOpacity * 0.92;
      for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
        trailPositions[i * 3] = trailPositions[(i - 1) * 3];
        trailPositions[i * 3 + 1] = trailPositions[(i - 1) * 3 + 1];
        trailPositions[i * 3 + 2] = trailPositions[(i - 1) * 3 + 2];
      }
      trailPositions[0] = currentStarPos.x;
      trailPositions[1] = currentStarPos.y;
      trailPositions[2] = currentStarPos.z;
      trailPosAttr.needsUpdate = true;

      // Spawn drifting embers
      if (animState.trailOpacity > 0.1) {
        emberMat.opacity = animState.trailOpacity * 0.85;
        for (let k = 0; k < 2; k++) {
          const eIdx = emberSpawnIdx % EMBER_COUNT;
          emberPositions[eIdx * 3] = currentStarPos.x + (Math.random() - 0.5) * 0.15;
          emberPositions[eIdx * 3 + 1] = currentStarPos.y + (Math.random() - 0.5) * 0.15;
          emberPositions[eIdx * 3 + 2] = currentStarPos.z + (Math.random() - 0.5) * 0.15;
          emberVelocities[eIdx].set(
            -tangent.x * 0.8 + (Math.random() - 0.5) * 0.4,
            -tangent.y * 0.8 + (Math.random() - 0.5) * 0.4,
            -tangent.z * 0.8 + (Math.random() - 0.5) * 0.4
          );
          emberAges[eIdx] = 0;
          emberSpawnIdx++;
        }
      }

      // Update embers
      for (let i = 0; i < EMBER_COUNT; i++) {
        emberAges[i] += delta * 1.5;
        if (emberAges[i] < 1.0) {
          emberPositions[i * 3] += emberVelocities[i].x * delta;
          emberPositions[i * 3 + 1] += emberVelocities[i].y * delta;
          emberPositions[i * 3 + 2] += emberVelocities[i].z * delta;
        }
      }
      emberPosAttr.needsUpdate = true;

      // Camera Rig Choreography
      if (animState.cameraMode === 0) {
        camera.position.set(0, 0, cameraZ);
        camera.lookAt(0, 0, -25);
      } else if (animState.cameraMode === 1) {
        // Space Chase Cam
        const chaseOffset = new THREE.Vector3()
          .copy(currentStarPos)
          .addScaledVector(tangent, -4.8)
          .add(new THREE.Vector3(1.2, 0.8, 1.8));

        camera.position.lerp(chaseOffset, 0.12);
        const lookTarget = new THREE.Vector3()
          .copy(currentStarPos)
          .addScaledVector(tangent, 3.5);
        camera.lookAt(lookTarget);
      } else if (animState.cameraMode === 2) {
        // Pull Back to Constellation Plane
        const targetCam = new THREE.Vector3(0, 0, cameraZ);
        camera.position.lerp(targetCam, 0.08);
        camera.lookAt(0, 0, 0);
      } else {
        // Stable constellation framing with gentle cosmic drift
        camera.position.set(0, 0, cameraZ + Math.sin(now * 0.0006) * 0.15);
        camera.lookAt(0, 0, 0);
      }

      // Progressive Constellation Lines Growth
      // As the shooting star flies across the letters, lines physically grow behind it!
      const edges = constellationData.edges;
      const stars = constellationData.stars;
      const cContract = animState.constellationContraction;

      for (let i = 0; i < numEdges; i++) {
        const edge = edges[i];
        const sFrom = stars[edge.from];
        const sTo = stars[edge.to];

        if (p < edge.drawStart) {
          // Edge not yet drawn: collapsed at origin
          linePositions[i * 6 + 0] = sFrom.x;
          linePositions[i * 6 + 1] = sFrom.y;
          linePositions[i * 6 + 2] = sFrom.z;
          linePositions[i * 6 + 3] = sFrom.x;
          linePositions[i * 6 + 4] = sFrom.y;
          linePositions[i * 6 + 5] = sFrom.z;
        } else if (p >= edge.drawEnd) {
          // Edge fully drawn: connected
          linePositions[i * 6 + 0] = sFrom.x;
          linePositions[i * 6 + 1] = sFrom.y;
          linePositions[i * 6 + 2] = sFrom.z;
          linePositions[i * 6 + 3] = sTo.x;
          linePositions[i * 6 + 4] = sTo.y;
          linePositions[i * 6 + 5] = sTo.z;
        } else {
          // Edge currently being drawn by the shooting star: growing tip
          const frac = (p - edge.drawStart) / Math.max(0.001, edge.drawEnd - edge.drawStart);
          linePositions[i * 6 + 0] = sFrom.x;
          linePositions[i * 6 + 1] = sFrom.y;
          linePositions[i * 6 + 2] = sFrom.z;
          linePositions[i * 6 + 3] = sFrom.x + (sTo.x - sFrom.x) * frac;
          linePositions[i * 6 + 4] = sFrom.y + (sTo.y - sFrom.y) * frac;
          linePositions[i * 6 + 5] = sFrom.z + (sTo.z - sFrom.z) * frac;
        }
      }
      constLinePosAttr.needsUpdate = true;
      constLineMat.opacity = Math.max(0, 0.95 * (1.0 - cContract * 1.5));

      // Constellation Stars Activation & Twinkle in lockstep with shooting star
      starNodes.forEach((node, idx) => {
        const starData = stars[idx];
        const isBorn = p >= starData.ignitionProgress;

        if (isBorn && !node.ignited) {
          node.ignited = true;
          // Flare flash on ignition
          node.mesh.material.opacity = 1.0;
          node.flareMesh.material.opacity = 1.0;
          node.mesh.scale.set(node.targetScale * 2.5, node.targetScale * 2.5, 1);
          node.light.intensity = 2.4;
          playStellarChime(0.75 + (starData.ignitionProgress - 0.35) * 1.6);
        }

        if (node.ignited) {
          // Settle scale smoothly down to target
          node.mesh.scale.lerp(new THREE.Vector3(node.targetScale, node.targetScale, 1), 0.1);
          node.light.intensity = THREE.MathUtils.lerp(node.light.intensity, 0.35, 0.08);

          // Subtle stellar twinkling & respiration
          const twinkle = 0.85 + Math.sin(now * 0.003 + starData.x * 2.5) * 0.15;
          const targetOpacity = Math.max(0, 1.0 - cContract * 1.2) * twinkle;

          node.mesh.material.opacity = targetOpacity;
          node.flareMesh.material.opacity = targetOpacity * 0.75;

          // Contract stars towards center at final phase
          if (cContract > 0) {
            node.mesh.parent?.position.lerp(new THREE.Vector3(0, 0.35, 0), cContract * 0.08);
          }
        }
      });

      // Background Starfield gentle rotation
      starfieldMesh.rotation.y = now * 0.00004;
      starfieldMesh.rotation.x = Math.sin(now * 0.00003) * 0.05;

      renderer.render(scene, camera);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    // Responsive Resize Handler
    const onResize = () => {
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", onResize);

    // Cleanup Everything
    return () => {
      isDestroyedRef.current = true;
      window.removeEventListener("resize", onResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      // Dispose Three.js resources
      renderer.dispose();
      starfieldGeo.dispose();
      starfieldMat.dispose();
      constLineGeo.dispose();
      constLineMat.dispose();
      trailGeo.dispose();
      trailMat.dispose();
      emberGeo.dispose();
      emberMat.dispose();
      starTexture.dispose();
      flareTexture.dispose();

      starNodes.forEach((node) => {
        node.mesh.material.dispose();
        node.flareMesh.material.dispose();
      });
    };
  }, [finishIntro, playStellarChime]);

  return (
    <div
      ref={containerRef}
      className={`constellation-intro-root ${isFadingOut ? "fade-out" : ""}`}
      aria-label="Abertura cinematográfica The Constellation: João Gouvêa"
    >
      {/* Three.js WebGL Canvas */}
      <div className="constellation-canvas-wrap">
        <canvas ref={canvasRef} className="constellation-canvas" />
      </div>

      {/* Cinematic Letterbox Bars */}
      <div className="constellation-letterbox-top" aria-hidden="true" />
      <div className="constellation-letterbox-bottom" aria-hidden="true" />

      {/* 250ms Blackout Curtain */}
      <div ref={blackoutRef} className="constellation-blackout" aria-hidden="true" />

      {/* UI Controls Overlay */}
      <div className="constellation-ui">
        {/* Top bar with audio toggle */}
        <div className="constellation-top-bar">
          <button
            type="button"
            className="constellation-btn"
            onClick={toggleAudio}
            aria-label={soundEnabled ? "Desativar áudio" : "Ativar áudio"}
          >
            {soundEnabled ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <span>SOM: ATIVO</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
                <span>SOM: ATIVAR</span>
              </>
            )}
          </button>
        </div>

        {/* Bottom bar with subtitle and skip button */}
        <div className="constellation-bottom-bar">
          <p className={`constellation-subtitle ${subtitleVisible ? "visible" : ""}`}>
            A journey written in the stars
          </p>

          <button
            type="button"
            className="constellation-skip-btn"
            onClick={finishIntro}
            aria-label="Pular introdução cinematográfica"
          >
            <span>PULAR INTRO</span>
            <kbd className="constellation-skip-kbd">ESC</kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
