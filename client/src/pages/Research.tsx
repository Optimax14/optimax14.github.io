import { Link } from "wouter";
import {
  ResearchEntry,
  OngoingResearch,
  ResourceLinks,
} from "@/components/ResearchContent";
import { asset, research } from "@/data/research";
export default function Research() {
  return (
    <div className="page-width">
      <header className="page-header">
        <p className="eyebrow">
          Algorithms · scientific computing · embodied AI
        </p>
        <h1>Research</h1>
        <p>
          I work on efficient algorithms for structured computational problems,
          and on robotic systems that connect perception with action.
        </p>
        <nav className="page-resources" aria-label="Research pages">
          <Link href="/publications">Publication list ↗</Link>
          <Link href="/software">Research software ↗</Link>
        </nav>
      </header>
      <nav className="research-index" aria-label="Research projects">
        {research
          .filter(r => r.slug !== "mental-fatigue")
          .map(r => (
            <a key={r.slug} href={"#" + r.slug}>
              {r.shortTitle}
            </a>
          ))}
      </nav>
      <div className="research-list">
        {research
          .filter(r => r.slug !== "mental-fatigue")
          .map(r => (
            <ResearchEntry key={r.slug} record={r} expanded />
          ))}
      </div>
      <OngoingResearch />
      <section className="section">
        <div className="section-heading">
          <h2>Selected projects</h2>
          <span className="quiet-label">Coursework and experiments</span>
        </div>
        <div className="themes">
          <div>
            <h3>ARMoR</h3>
            <p>
              A robotics course project exploring arm-driven mobility on a
              passive omni-wheel platform, with simulation in NVIDIA Isaac Sim.
            </p>
            <ResourceLinks
              links={[{ label: "Project video", href: asset("armor.mp4") }]}
            />
          </div>
          <div>
            <h3>Mathematical computing</h3>
            <p>
              A graduate coursework report, kept separately from the research
              publication list.
            </p>
            <ResourceLinks
              links={[
                {
                  label: "Course report (PDF, 17 MB)",
                  href: asset("MATH_6335_Report.pdf"),
                },
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
