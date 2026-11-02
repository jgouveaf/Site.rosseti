import { useEffect, useRef, useState } from "react";

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** Scroll and pointer 3D motion choreography across the whole site. */
export function usePortfolioMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".pf-v2");
    if (!root) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(pointer: fine)");
    const hero = root.querySelector<HTMLElement>(".pf-hero-stage");
    const reel = root.querySelector<HTMLElement>(".pf-reel");
    const track = root.querySelector<HTMLElement>(".pf-reel-track");
    const windowEl = root.querySelector<HTMLElement>(".pf-reel-window");
    const sport = root.querySelector<HTMLElement>(".pf-sport");

    let frame = 0;
    let mouseX = innerWidth / 2;
    let mouseY = innerHeight / 2;
    let activeMagnet: HTMLElement | null = null;
    let magnetBounds: DOMRect | null = null;
    let currentTiltCard: HTMLElement | null = null;

    const resetTilt = () => {
      if (currentTiltCard) {
        currentTiltCard.style.removeProperty("--mouse-tilt-x");
        currentTiltCard.style.removeProperty("--mouse-tilt-y");
        currentTiltCard.style.removeProperty("--glare-x");
        currentTiltCard.style.removeProperty("--glare-y");
        currentTiltCard.classList.remove("is-tilting");
        currentTiltCard = null;
      }
    };

    const update = () => {
      frame = 0;
      const height = innerHeight;
      const heroBounds = hero?.getBoundingClientRect();
      const reelBounds = reel?.getBoundingClientRect();
      const sportBounds = sport?.getBoundingClientRect();
      const maxScroll = document.documentElement.scrollHeight - height;
      const travel =
        track && windowEl
          ? Math.max(0, track.scrollWidth - windowEl.clientWidth)
          : 0;
      const progress = reelBounds
        ? clamp(-reelBounds.top / Math.max(1, reelBounds.height - height))
        : 0;

      root.style.setProperty(
        "--page-progress",
        String(clamp(scrollY / Math.max(1, maxScroll))),
      );
      root.classList.toggle("is-scrolled", scrollY > 70);

      if (reduced.matches) {
        hero?.style.setProperty("--hero-progress", "0");
        reel?.style.setProperty("--reel-x", "0px");
        sport?.style.setProperty("--sport-progress", "0");
        return;
      }

      hero?.style.setProperty(
        "--hero-progress",
        String(
          heroBounds
            ? clamp(-heroBounds.top / Math.max(1, heroBounds.height - height))
            : 0,
        ),
      );
      reel?.style.setProperty(
        "--reel-x",
        innerWidth > 700 ? `${-progress * travel}px` : "0px",
      );
      reel?.style.setProperty("--reel-progress", String(progress));
      sport?.style.setProperty(
        "--sport-progress",
        String(
          sportBounds
            ? clamp((height - sportBounds.top) / (height + sportBounds.height))
            : 0,
        ),
      );

      // Real 3D Perspective Scroll Physics across cards throughout the site
      const cards3D = root.querySelectorAll<HTMLElement>(
        ".pf-3d-card, .pf-game, .pf-project-card, .pf-italian-showcase, .pf-italian-photo-card, .pf-real-portrait, .pf-stats > div, .pf-reel-card, .pf-obi-feature, .pf-history-card"
      );
      cards3D.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.bottom < -120 || rect.top > height + 120) return;
        const centerY = rect.top + rect.height / 2;
        const normalized = (centerY - height / 2) / (height / 2); // -1 (top) to +1 (bottom)
        const tiltX = Math.max(-9, Math.min(9, -normalized * 7.5));
        const depth = Math.max(-24, Math.min(24, (1 - Math.abs(normalized)) * 18));
        card.style.setProperty("--scroll-tilt-x", `${tiltX.toFixed(2)}deg`);
        card.style.setProperty("--scroll-depth", `${depth.toFixed(1)}px`);
      });

      if (fine.matches) {
        if (heroBounds && heroBounds.bottom > 0) {
          hero?.style.setProperty(
            "--look-x",
            `${(mouseX / innerWidth - 0.5) * 16}px`,
          );
          hero?.style.setProperty(
            "--look-y",
            `${(mouseY / height - 0.5) * 10}px`,
          );
        }
        if (activeMagnet && magnetBounds) {
          activeMagnet.style.setProperty(
            "--magnet-x",
            `${(mouseX - magnetBounds.left - magnetBounds.width / 2) * 0.12}px`,
          );
          activeMagnet.style.setProperty(
            "--magnet-y",
            `${(mouseY - magnetBounds.top - magnetBounds.height / 2) * 0.15}px`,
          );
        }
      }
    };

    const queue = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(update);
    };

    const resetMagnet = () => {
      activeMagnet?.style.removeProperty("--magnet-x");
      activeMagnet?.style.removeProperty("--magnet-y");
      activeMagnet = null;
      magnetBounds = null;
    };

    // Robust 3D Interactive Pointer Tilt Handler
    const onPointer = (event: PointerEvent) => {
      if (reduced.matches || event.pointerType === "touch" || !fine.matches) return;
      mouseX = event.clientX;
      mouseY = event.clientY;
      const target = event.target as HTMLElement;

      // Find any 3D interactive element anywhere on the page
      const card = target.closest<HTMLElement>(
        ".pf-3d-card, .pf-game, .pf-project-card, .pf-italian-photo-card, .pf-hero-title, .pf-hero-image, .pf-real-portrait, .pf-stats > div, .pf-reel-card, .pf-obi-feature, .pf-history-card, .pf-italian-showcase"
      );

      if (card !== currentTiltCard) resetTilt();

      if (card) {
        currentTiltCard = card;
        card.classList.add("is-tilting");
        const b = card.getBoundingClientRect();
        const px = (event.clientX - b.left) / Math.max(1, b.width);
        const py = (event.clientY - b.top) / Math.max(1, b.height);
        const rx = (0.5 - py) * 16; // 16 deg max tilt
        const ry = (px - 0.5) * 16;
        card.style.setProperty("--mouse-tilt-x", `${rx.toFixed(2)}deg`);
        card.style.setProperty("--mouse-tilt-y", `${ry.toFixed(2)}deg`);
        card.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
      }

      const magnet = target.closest<HTMLElement>(".pf-hero-cta,.pf-pill");
      if (magnet !== activeMagnet) {
        resetMagnet();
        activeMagnet = magnet;
        magnetBounds = magnet?.getBoundingClientRect() ?? null;
      }
      queue();
    };

    const leave = () => {
      resetMagnet();
      resetTilt();
    };

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("motion-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
    );

    const revealElements = root.querySelectorAll<HTMLElement>(
      ".pf-label,.pf-about-grid h2,.pf-about-grid>div,.pf-stats>div,.pf-section-heading,.pf-project-group-heading,.pf-project-card,.pf-game,.pf-year,.pf-history-item,.pf-reel-heading,.pf-reel-card,.pf-manifesto p,.pf-fecart,.pf-sport-copy,.pf-swimming,.pf-obi-feature",
    );
    revealElements.forEach((el, i) => {
      el.classList.add("motion-reveal");
      el.style.setProperty("--reveal-delay", `${(i % 3) * 65}ms`);
      observer.observe(el);
    });

    root.classList.add("motion-ready");

    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", queue);

    const resize = new ResizeObserver(queue);
    resize.observe(root);
    if (track) resize.observe(track);
    update();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      root.classList.remove("motion-ready");
      removeEventListener("scroll", queue);
      removeEventListener("resize", queue);
      removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", queue);
    };
  }, []);
}

export function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
                const duration = 1200;
        const startTime = performance.now();
        const step = (now: number) => {
          const progress = Math.min(1, (now - startTime) / duration);
          const current = Math.floor(progress * value);
          setDisplay(current);
          if (progress < 1) requestAnimationFrame(step);
          else setDisplay(value);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display}</span>;
}
