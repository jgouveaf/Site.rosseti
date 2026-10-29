import { lazy, Suspense } from "react";
import { Portfolio } from "./Portfolio";

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
  return <Portfolio />;
}
