import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Experience from "./pages/Experience";
import Publications from "./pages/Publications";
import CV from "./pages/CV";
import Fonts from "./pages/Fonts";
import Navigation from "./components/Navigation";
import Model from "./pages/Model";
import ScrollProgress from "./components/ScrollProgress";
import { motion } from "framer-motion";
import { useEffect } from "react";
import FetchDemo from "./pages/FetchDemo";
import UpdateAurora from "./pages/UpdateAurora";
import UpdateZephyr from "./pages/UpdateZephyr";
import UpdateSolstice from "./pages/UpdateSolstice";
import UpdateNova from "./pages/UpdateNova";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />
      <Route path={"/experience"} component={Experience} />
      <Route path={"/publications"} component={Publications} />
      <Route path={"/cv"} component={CV} />
      <Route path={"/fonts"} component={Fonts} />
      <Route path={"/model"} component={Model} />
      <Route path={"/fetch"} component={FetchDemo} />
      <Route path={"/updates/aurora"} component={UpdateAurora} />
      <Route path={"/updates/zephyr"} component={UpdateZephyr} />
      <Route path={"/updates/solstice"} component={UpdateSolstice} />
      <Route path={"/updates/nova"} component={UpdateNova} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
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
                <Router />
              </motion.div>
            </main>
            <footer className="border-t border-border py-8 mt-16">
              <div className="container">
                <p className="text-center text-muted-foreground text-sm">
                  © 2024 Itay Kadosh. All rights reserved.
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
