import { useEffect, useRef, useState } from "react";

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** Scroll changes are batched into one frame. No wheel interception or scroll hijack. */
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
    const pointer = root.querySelector<HTMLElement>(".pf-pointer");
    let frame = 0;
    let mouseX = innerWidth / 2;
    let mouseY = innerHeight / 2;
    let activeMagnet: HTMLElement | null = null;
    let magnetBounds: DOMRect | null = null;
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
      if (fine.matches) {
        pointer?.style.setProperty("--cursor-x", `${mouseX}px`);
        pointer?.style.setProperty("--cursor-y", `${mouseY}px`);
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
    const onPointer = (event: PointerEvent) => {
      if (reduced.matches || event.pointerType === "touch" || !fine.matches)
        return;
      mouseX = event.clientX;
      mouseY = event.clientY;
      const target = event.target as HTMLElement;
      pointer?.classList.toggle(
        "is-visible",
        !!target.closest(".pf-photo,.pf-gallery-card,.pf-cert-card button"),
      );
      const magnet = target.closest<HTMLElement>(".pf-hero-cta,.pf-pill");
      if (magnet !== activeMagnet) {
        resetMagnet();
        activeMagnet = magnet;
        magnetBounds = magnet?.getBoundingClientRect() ?? null;
      }
      queue();
    };
    const leave = () => {
      pointer?.classList.remove("is-visible");
      resetMagnet();
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
      ".pf-label,.pf-about-grid h2,.pf-about-grid>div,.pf-stats>div,.pf-section-heading,.pf-project,.pf-year,.pf-fecart,.pf-sport-copy,.pf-explore h2",
    );
    revealElements.forEach((el, i) => {
      el.classList.add("motion-reveal");
      el.style.setProperty("--reveal-delay", `${(i % 3) * 65}ms`);
      observer.observe(el);
    });
    root.classList.add("motion-ready");
    const refreshMotion = () => {
      leave();
      queue();
    };
    // A card reached by keyboard must become visible even when translated off-screen.
    const onFocus = (event: FocusEvent) => {
      if (!(event.target as HTMLElement).matches(":focus-visible")) return;
      const card = (event.target as HTMLElement).closest<HTMLElement>(
        ".pf-reel-card",
      );
      if (!card || !reel || !track || reduced.matches || innerWidth <= 700)
        return;
      const distance = track.scrollWidth - (windowEl?.clientWidth ?? 0);
      if (distance <= 0) return;
      const fraction = clamp(card.offsetLeft / distance);
      const start = reel.getBoundingClientRect().top + scrollY;
      scrollTo({
        top: start + fraction * (reel.offsetHeight - innerHeight),
        behavior: "instant",
      });
      queue();
    };
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", refreshMotion);
    root.addEventListener("focusin", onFocus);
    reduced.addEventListener("change", refreshMotion);
    fine.addEventListener("change", refreshMotion);
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
      document.removeEventListener("visibilitychange", refreshMotion);
      root.removeEventListener("focusin", onFocus);
      reduced.removeEventListener("change", refreshMotion);
      fine.removeEventListener("change", refreshMotion);
      resetMagnet();
    };
  }, []);
}

export function AnimatedNumber({ value }: { value: number }) {
  const element = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const target = element.current;
    if (!target) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const finish = () => {
      cancelAnimationFrame(frame);
      setDisplay(value);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        if (media.matches) {
          finish();
          return;
        }
        const start = performance.now();
        const tick = (now: number) => {
          const progress = clamp((now - start) / 1100);
          setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(target);
    media.addEventListener("change", finish);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      media.removeEventListener("change", finish);
    };
  }, [value]);
  return (
    <span ref={element} className="pf-number" aria-label={String(value)}>
      <span aria-hidden="true">{String(display).padStart(2, "0")}</span>
    </span>
  );
}
