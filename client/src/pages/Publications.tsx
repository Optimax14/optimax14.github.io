import { Authors, ResourceLinks } from "@/components/ResearchContent";
import { PublicationStatus, research } from "@/data/research";
export default function Publications() {
  const groups = [
    {
      title: "Accepted",
      status: PublicationStatus.Accepted,
    },
    {
      title: "Submitted manuscripts",
      status: PublicationStatus.Submitted,
    },
    {
      title: "Conference presentations",
      status: PublicationStatus.Presented,
    },
  ];
  return (
    <div className="page-width">
      <header className="page-header">
        <p className="eyebrow">Papers and presentations</p>
        <h1>Publications</h1>
        <p>
          Numerical algorithms, robotics, and evaluation. Code and datasets are
          linked alongside each manuscript.
        </p>
      </header>
      {groups.map(g => (
        <section
          className="publication-group"
          key={g.status}
          aria-labelledby={"group-" + g.status}
        >
          <h2 id={"group-" + g.status}>{g.title}</h2>
          {research
            .filter(r => r.status === g.status)
            .map(r => (
              <article className="publication" id={r.slug} key={r.slug}>
                <p className="eyebrow">
                  {r.status} · {r.venue} · {r.year}
                </p>
                <h3>{r.title}</h3>
                <Authors record={r} />
                <p>{r.summary}</p>
                {r.slug === "rpx" && <p>{r.detail}</p>}
                <ResourceLinks links={r.links} />
              </article>
            ))}
        </section>
      ))}
    </div>
  );
}
