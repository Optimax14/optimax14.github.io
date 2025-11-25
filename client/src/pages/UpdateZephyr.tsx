import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function UpdateZephyr() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">September 2025</p>
          <h1 className="text-4xl font-bold">Human-Robot Collaboration Milestone</h1>
          <p className="text-lg text-muted-foreground">
            A focused update on adaptive control strategies for safe, responsive collaboration.
          </p>
        </div>

        <div className="space-y-4 text-foreground leading-relaxed">
          <p>
            We implemented intent-aware motion primitives that react to human proximity and gesture cues,
            improving task completion times while reducing unexpected contact.
          </p>
          <p>
            The pipeline blends impedance control with vision-based intention estimation, allowing smoother hand-offs and shared workspace navigation.
          </p>
          <p>
            Next steps: expand the dataset for gesture recognition, stress-test under varied lighting, and publish a short paper on the controller blend.
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/experience">Back to Experience</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
