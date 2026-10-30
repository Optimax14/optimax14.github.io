import { Link } from "wouter";
import { ResourceLinks } from "@/components/ResearchContent";
import { research, software } from "@/data/research";
export default function Software() {
  return (
    <div className="page-width">
      <header className="page-header">
        <p className="eyebrow">Open scientific computing</p>
        <h1>Research software</h1>
        <p>
          Software is part of the research: implementations of the algorithms
          and mathematical structures behind the manuscripts.
        </p>
      </header>
      <div className="software-list">
        {software.map(item => {
          const paper = research.find(r => r.slug === item.manuscriptSlug)!;
          return (
            <article className="software-entry" id={item.slug} key={item.slug}>
              <div className="software-name">
                <p className="eyebrow">
                  {item.language} · {item.platform}
                </p>
                <h2>{item.name}</h2>
              </div>
              <div>
                <p className="software-description">{item.summary}</p>
                <p className="software-method">{item.method}</p>
                <p className="software-paper">
                  Companion software for{" "}
                  <Link href={"/publications#" + paper.slug}>
                    {paper.title}
                  </Link>
                  .{" "}
                  <span>
                    {paper.status} · {paper.year}.
                  </span>
                </p>
                <ResourceLinks links={item.links} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
