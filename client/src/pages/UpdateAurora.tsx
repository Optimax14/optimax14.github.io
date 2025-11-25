import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function UpdateAurora() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">October 2025</p>
          <h1 className="text-4xl font-bold">New Publication at ICRA</h1>
          <p className="text-lg text-muted-foreground">
            Deep dive into our latest paper on efficient path planning for mobile robots, accepted to ICRA 2026.
          </p>
        </div>

        <div className="space-y-4 text-foreground leading-relaxed">
          <p>
            This work presents a novel approach to reducing computational overhead in dynamic environments while maintaining robust safety margins.
            We benchmarked against classic RRT* and modern learning‑based planners, showing consistent improvements in convergence speed and path optimality.
          </p>
          <p>
            The method integrates a lightweight heuristic that prioritizes collision‑free corridors and adapts to on‑board compute limits, making it suitable for field
            deployments and resource‑constrained platforms.
          </p>
          <p>
            Implementation details, ablation studies, and open‑source code will be linked here once the camera‑ready version is finalized.
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/publications">Back to Publications</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
