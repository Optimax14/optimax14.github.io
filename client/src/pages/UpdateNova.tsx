import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function UpdateNova() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">November 2025</p>
          <h1 className="text-4xl font-bold">Showcase: Perception + Planning Demo</h1>
          <p className="text-lg text-muted-foreground">
            A dedicated page for the latest demo combining fast perception with motion planning on the fetch platform.
          </p>
        </div>

        <div className="space-y-4 text-foreground leading-relaxed">
          <p>
            This demo highlights the end-to-end loop: camera input, lightweight scene understanding, and a planner that
            commits to smooth trajectories while respecting joint limits. It runs fully on-device to match the constraints
            of the target hardware.
          </p>
          <p>
            We also stress-tested lighting changes and partial occlusions to validate robustness. Early results show stable
            execution with tight latency budgets.
          </p>
          <p>
            I will publish video captures and a short writeup here as soon as the polishing pass is done.
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/">Back Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/publications">Go to Publications</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
