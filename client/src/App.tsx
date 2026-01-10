import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navigation from "./components/Navigation";
import ScrollProgress from "./components/ScrollProgress";
import { motion } from "framer-motion";
import { Suspense, lazy, useEffect, useRef } from "react";
import { logVisit } from "./utils/visitLogger";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Experience = lazy(() => import("./pages/Experience"));
const Publications = lazy(() => import("./pages/Publications"));
const CV = lazy(() => import("./pages/CV"));
const UpdateAurora = lazy(() => import("./pages/UpdateAurora"));
const UpdateZephyr = lazy(() => import("./pages/UpdateZephyr"));
const UpdateSolstice = lazy(() => import("./pages/UpdateSolstice"));
const UpdateNova = lazy(() => import("./pages/UpdateNova"));
const UpdateAutoXSemMap = lazy(() => import("./pages/UpdateAutoXSemMap"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />
      <Route path={"/experience"} component={Experience} />
      <Route path={"/publications"} component={Publications} />
      <Route path={"/cv"} component={CV} />
      <Route path={"/updates/aurora"} component={UpdateAurora} />
      <Route path={"/updates/zephyr"} component={UpdateZephyr} /> 
      <Route path={"/updates/solstice"} component={UpdateSolstice} /> 
      <Route path={"/updates/nova"} component={UpdateNova} /> 
      <Route path={"/updates/autox-semmap"} component={UpdateAutoXSemMap} />
      <Route path={"/404"} component={NotFound} /> 
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function RouteFallback() {
  return (
    <div className="section-padding">
      <div className="container">
        <div className="text-sm text-muted-foreground">Loading page...</div>
      </div>
    </div>
  );
}

function App() {
  const [location] = useLocation();
  const initialPageview = useRef(true);
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [location]);
  useEffect(() => {
    logVisit(location);
  }, [location]);
  useEffect(() => {
    if (initialPageview.current) {
      initialPageview.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const gtag = (window as any).gtag;
    if (typeof gtag !== "function") return;
    gtag("event", "page_view", {
      page_path: location,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [location]);
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen flex flex-col text-foreground">
            <ScrollProgress />
            <Navigation />
            <main className="flex-1">
              <motion.div
                key={location}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Suspense fallback={<RouteFallback />}>
                  <Router />
                </Suspense>
              </motion.div>
            </main>
            <footer className="border-t border-border py-8 mt-16">
              <div className="container">
                <p className="text-center text-muted-foreground text-sm">
                  © 2026 Itay Kadosh. All rights reserved.
                </p>
              </div>
            </footer>
            {/* Progress bar kept; extras removed per request */}
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
