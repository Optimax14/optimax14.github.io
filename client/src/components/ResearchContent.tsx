import { Link } from "wouter";
import { useState } from "react";
import {
  asset,
  ongoing,
  profile,
  themes,
  type ResearchLink,
  type ResearchRecord,
} from "@/data/research";
export function ResourceLinks({ links }: { links: ResearchLink[] }) {
  return (
    <div className="resource-links">
      {links.map(link => (
        <a key={link.href} href={link.href}>
          {link.label}
          <span aria-hidden="true"> ↗</span>
        </a>
      ))}
    </div>
  );
}
export function Authors({ record }: { record: ResearchRecord }) {
  return (
    <>
      <p className="authors">
        {record.authors.map((a, i) => (
          <span key={a.name}>
            {i > 0 && ", "}
            {a.name === profile.name ? <strong>{a.name}</strong> : a.name}
            {a.equal && <sup>*</sup>}
          </span>
        ))}
      </p>
      {record.authors.some(a => a.equal) && (
        <p className="equal-note">* Equal contribution</p>
      )}
    </>
  );
}
export function ResearchFigure({
  record: r,
  fullSize = false,
}: {
  record: ResearchRecord;
  fullSize?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const media = r.media;
  if (!media) return null;
  const image = (
    <img
      src={asset(media.src)}
      width={media.width || 1000}
      height={media.height || 600}
      alt={media.alt}
      loading="lazy"
      decoding="async"
    />
  );
  return (
    <figure>
      <div className="research-media">
        {playing && media.video ? (
          <video
            src={asset(media.video)}
            poster={asset(media.src)}
            autoPlay
            muted
            playsInline
            controls
            aria-label={r.shortTitle + " official showcase"}
          />
        ) : (
          <>
            {fullSize ? (
              <a
                className="research-image-link"
                href={asset(media.src)}
                aria-label={"Open full-size figure: " + r.shortTitle}
              >
                {image}
              </a>
            ) : (
              <Link
                className="research-image-link"
                href={r.detailPath || "/research#" + r.slug}
                aria-label={"Research details: " + r.title}
              >
                {image}
              </Link>
            )}
            {media.video && (
              <button
                className="research-play"
                aria-label={"Play video: " + r.shortTitle}
                onClick={() => setPlaying(true)}
              >
                Play video <span aria-hidden="true">▶</span>
              </button>
            )}
          </>
        )}
      </div>
      <figcaption>
        {media.caption}
        {media.source && (
          <>
            {" "}
            · <a href={media.source.href}>{media.source.label}</a>
          </>
        )}
        {fullSize && (
          <>
            {" "}
            · <a href={asset(media.src)}>Full-size figure ↗</a>
          </>
        )}
      </figcaption>
    </figure>
  );
}
export function ResearchEntry({
  record: r,
  expanded = false,
}: {
  record: ResearchRecord;
  expanded?: boolean;
}) {
  const href = r.detailPath || "/research#" + r.slug;
  return (
    <article
      className={"research-entry " + (expanded ? "expanded" : "")}
      id={expanded ? r.slug : undefined}
    >
      <div className="research-visual">
        <ResearchFigure record={r} fullSize={expanded} />
        {expanded && r.slug === "autox-semmap" && (
          <details className="demo">
            <summary>Watch the Fetch exploration demo</summary>
            <video
              src={asset("exploration.mp4")}
              poster={asset("media/fetch.webp")}
              preload="none"
              controls
              playsInline
              aria-label="Silent Fetch robot exploration demonstration"
            />
            <p className="caption">
              A silent recording of the robot exploring and building an indoor
              map.
            </p>
          </details>
        )}
      </div>
      <div className="research-copy">
        <p className="publication-meta">
          <span>{r.status}</span> · {r.venue} · {r.year}
        </p>
        <h3>
          <Link href={href}>{r.title}</Link>
        </h3>
        <Authors record={r} />
        <p className="research-summary">{r.summary}</p>
        {expanded && r.detail && <p className="research-summary">{r.detail}</p>}
        {expanded && r.contribution && (
          <p className="research-summary">{r.contribution}</p>
        )}
        <ResourceLinks links={r.links} />
        {r.detailPath && (
          <Link className="project-detail-link" href={r.detailPath}>
            Figures, findings, and demonstration{" "}
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </article>
  );
}
export function Themes() {
  return (
    <section className="section" aria-labelledby="directions-title">
      <div className="section-heading">
        <h2 id="directions-title">Research directions</h2>
        <span className="quiet-label">Connected questions</span>
      </div>
      <div className="themes">
        {themes.map(t => (
          <div key={t.title}>
            <h3>{t.title}</h3>
            <p>{t.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
export function OngoingResearch() {
  return (
    <section className="section" aria-labelledby="ongoing-title">
      <div className="section-heading">
        <h2 id="ongoing-title">Ongoing research</h2>
        <span className="quiet-label">Work in progress</span>
      </div>
      <p className="section-intro">
        Questions and implementations under active investigation.
      </p>
      <ul className="ongoing-list">
        {ongoing.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
