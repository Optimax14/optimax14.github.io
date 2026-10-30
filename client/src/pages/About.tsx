import { Link } from "wouter";
import { asset, profile } from "@/data/research";
import { ResourceLinks } from "@/components/ResearchContent";
export default function About() {
  return (
    <div className="page-width">
      <header className="page-header">
        <p className="eyebrow">Background and experience</p>
        <h1>About Itay</h1>
      </header>
      <div className="about-grid">
        <div className="prose-copy">
          <p className="lead">{profile.intro}</p>
          <p>
            Before Florida, I completed dual B.S. degrees in Computer Science
            and Applied Mathematics at the University of Texas at Dallas. At the
            Intelligent Robotics and Vision Lab, I worked on robot perception,
            semantic mapping, and learning-based exploration with Prof. Yu
            Xiang.
          </p>
          <p>
            I am interested in the meeting point of numerical analysis,
            combinatorial algorithms, and scientific computing: how the
            structure of a problem can guide both its mathematical formulation
            and its implementation.
          </p>
          <ResourceLinks links={profile.links} />
        </div>
        <figure className="portrait">
          <img
            src={asset("media/itay.webp")}
            width="700"
            height="850"
            alt="Itay Kadosh"
            decoding="async"
          />
          <figcaption>Outside the lab.</figcaption>
        </figure>
      </div>
      <section className="section" id="experience">
        <p className="eyebrow">Research across disciplines</p>
        <h2>Experience</h2>
        <div className="experience-list">
          <article>
            <p className="eyebrow">University of Florida</p>
            <h3>Ph.D. research · GATAS Lab</h3>
            <p>
              Working with Prof. James P. Fairbanks on structured numerical and
              graph algorithms, sparse computation, GPU implementations, and
              mathematical approaches to multi-agent systems.
            </p>
            <Link href="/research">Research and software →</Link>
          </article>
          <article>
            <p className="eyebrow">Independent AI evaluation</p>
            <h3>Handshake AI</h3>
            <p>
              Design and evaluation of rigorous advanced mathematics and physics
              tasks for frontier AI systems.
            </p>
          </article>
          <article>
            <p className="eyebrow">The University of Texas at Dallas</p>
            <h3>Intelligent Robotics and Vision Lab</h3>
            <p>
              Research with Prof. Yu Xiang on RGB-D perception, persistent
              semantic maps, robot exploration, and perception benchmarks,
              including AutoX-SemMap, RPX, and IntelX.
            </p>
          </article>
          <article>
            <p className="eyebrow">Clemson University · H-CORE REU</p>
            <h3>Human factors and worker performance</h3>
            <p>
              Research on cognitive workload, mental fatigue, and task rotation
              with Prof. Tuğçe Işık and collaborators.
            </p>
            <Link href="/publications#mental-fatigue">
              Presentation details →
            </Link>
          </article>
        </div>
      </section>
      <section className="section">
        <h2>Outside research</h2>
        <p className="section-intro">
          I enjoy hiking, camping, skiing, and teaching mathematics and computer
          science. Helping students work through difficult ideas is a part of my
          life I value alongside research.
        </p>
      </section>
    </div>
  );
}
