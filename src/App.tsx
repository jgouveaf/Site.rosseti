import { lazy, Suspense } from "react";
import { Portfolio } from "./Portfolio";
const Neymar = lazy(() =>
  import("./NeymarExperience").then((m) => ({ default: m.NeymarExperience })),
);
const Archive = lazy(() =>
  import("./ObsidianApp").then(async (m) => {
    await import("./styles.css");
    return { default: m.ObsidianApp };
  }),
);
export function App() {
  const path = location.pathname;
  if (/\/neymar\/?$/.test(path))
    return (
      <Suspense fallback={<p>Carregando experiência…</p>}>
        <Neymar />
      </Suspense>
    );
  if (/\/exploracao\/?$/.test(path))
    return (
      <Suspense fallback={<p>Carregando exploração…</p>}>
        <Archive />
      </Suspense>
    );
  return <Portfolio />;
}
