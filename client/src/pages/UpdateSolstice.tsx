import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function UpdateSolstice() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">August 2025</p>
          <h1 className="text-4xl font-bold">Graduate Applications & Next Steps</h1>
          <p className="text-lg text-muted-foreground">
            A dedicated note on programs I&apos;m targeting and the research directions I want to pursue.
          </p>
        </div>

        <div className="space-y-4 text-foreground leading-relaxed">
          <p>
            I&apos;m focusing on labs working in manipulation, autonomous mobile robotics, and human-robot interaction.
            My goal is to contribute to planning and control methods that transfer smoothly from simulation to hardware.
          </p>
          <p>
            If you&apos;re interested in collaborating or have suggestions on programs, feel free to reach out—contact details are on the About page.
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/about">Back to About</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
