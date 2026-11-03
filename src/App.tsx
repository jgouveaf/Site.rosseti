import { lazy, Suspense, useState, useEffect } from "react";
import { Portfolio } from "./Portfolio";
import { TheConstellationIntro } from "./experience/TheConstellationIntro";

const Neymar = lazy(() =>
  import("./NeymarExperience").then((m) => ({ default: m.NeymarExperience })),
);

export function App() {
  const path = location.pathname;
  if (/\/neymar\/?$/.test(path)) {
    return (
      <Suspense fallback={<p>Carregando experiência…</p>}>
        <Neymar />
      </Suspense>
    );
  }

  // Check if user has already seen the intro in this session, or requested replay via URL (?intro=1)
  const [showIntro, setShowIntro] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("intro") === "1" || urlParams.get("replay") === "1") {
        return true;
      }
      return !sessionStorage.getItem("hasSeenConstellationIntro");
    } catch {
      return true;
    }
  });

  // Listen for custom replay event dispatched from portfolio
  useEffect(() => {
    const handleReplay = () => {
      setShowIntro(true);
    };
    window.addEventListener("replay-constellation-intro", handleReplay);
    return () => window.removeEventListener("replay-constellation-intro", handleReplay);
  }, []);

  return (
    <>
      {showIntro && (
        <TheConstellationIntro onComplete={() => setShowIntro(false)} />
      )}
      <Portfolio />
    </>
  );
}
