import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { asset } from "@/data/research";
import { ModelErrorBoundary } from "./ModelErrorBoundary";
import type { FetchActions } from "./FetchHeroViewer";
const Viewer = lazy(() => import("./FetchHeroViewer"));
export default function OptionalFetch() {
  const [active, setActive] = useState(false),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [reduced, setReduced] = useState(false);
  const actions = useRef<FetchActions | null>(null),
    closed = useRef(false);
  const handleLoaded = useCallback(() => setReady(true), []);
  const handleError = useCallback(() => {
    setFailed(true);
    setActive(false);
  }, []);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    // Start only after the readable page has painted, on desktop without reduced
    // motion or data-saving requests. Mobile keeps a static fallback until asked.
    const timer = window.setTimeout(() => {
      if (
        !closed.current &&
        !query.matches &&
        innerWidth >= 960 &&
        !connection?.saveData &&
        connection?.effectiveType !== "2g"
      )
        setActive(true);
    }, 1200);
    return () => {
      clearTimeout(timer);
      query.removeEventListener("change", update);
    };
  }, []);
  useEffect(() => {
    if (!active || ready || failed) return;
    const timer = setTimeout(handleError, 15000);
    return () => clearTimeout(timer);
  }, [active, ready, failed, handleError]);
  return (
    <aside className="fetch-aside" aria-label="Interactive Fetch robot">
      <div className="fetch-media">
        <img
          src={asset("research/fetch/poster.webp")}
          alt="The original interactive Fetch robot in its resting pose"
          width="658"
          height="720"
          className={active && ready ? "fetch-poster hidden" : "fetch-poster"}
        />
        {active && !failed && (
          <div
            className="fetch-canvas"
            role="region"
            aria-label="Interactive Fetch robot. Drag to rotate, scroll to zoom."
          >
            <ModelErrorBoundary>
              <Suspense fallback={null}>
                <Viewer
                  onLoaded={handleLoaded}
                  onError={handleError}
                  actionsRef={actions}
                />
              </Suspense>
            </ModelErrorBoundary>
          </div>
        )}
      </div>
      <div className="fetch-caption">
        <div>
          <span className="fetch-name">Fetch</span>
          <span className="fetch-description">Interactive model</span>
        </div>
        <div className="fetch-actions">
          {ready && !reduced && (
            <button onClick={() => actions.current?.wave()}>
              Wave <span aria-hidden="true">↗</span>
            </button>
          )}
          {ready && (
            <button onClick={() => actions.current?.reset()}>Reset</button>
          )}
          <button
            aria-label={active ? "Close 3D viewer" : "Explore Fetch in 3D"}
            onClick={() => {
              closed.current = true;
              setReady(false);
              setFailed(false);
              setActive(!active);
            }}
          >
            {active ? "Hide" : "Explore Fetch in 3D"}
          </button>
        </div>
      </div>
      <p className="viewer-status" role="status">
        {failed
          ? "3D is unavailable. Project demos remain accessible."
          : active
            ? ready
              ? "Drag or arrow keys to rotate · +/− to zoom"
              : "Loading the interactive model…"
            : "A mobile manipulator for robotics research"}
      </p>
    </aside>
  );
}
