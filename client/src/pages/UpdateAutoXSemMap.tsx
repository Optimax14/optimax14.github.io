import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/utils/analytics";

export default function UpdateAutoXSemMap() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Jul 2024 - Sep 2024 - IRVL</p>
          <h1 className="text-4xl font-bold">AutoX-SemMap</h1>
          <p className="text-lg text-muted-foreground">
            Autonomous exploration and semantic map updates for large-scale indoor environments with mobile robots.
          </p>
        </div>

        <div className="space-y-4 text-foreground leading-relaxed">
          <p>GroundingDINO/SAMv2 open-set detection and segmentation with RGB-D fusion into a global map.</p>
          <p>Dynamic object association to match existing map entries or register new objects.</p>
          <p>Paper under review at ICRA 2026.</p>
        </div>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/publications">Back to Publications</Link>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://arxiv.org/abs/2409.15493"
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent("external_link", { link_url: "https://arxiv.org/abs/2409.15493", link_text: "arXiv" })}
            >
              View arXiv
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
