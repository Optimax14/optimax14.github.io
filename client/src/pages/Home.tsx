import { Link } from "wouter";
import {
  ResearchEntry,
  ResourceLinks,
  Themes,
} from "@/components/ResearchContent";
import OptionalFetch from "@/components/OptionalFetch";
import { profile, research, updates, software } from "@/data/research";
export default function Home() {
  return (
    <div className="page-width">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="identity">
            <h1 id="hero-title">{profile.name}</h1>
            <p className="hero-role">{profile.role}</p>
          </div>
          <div className="hero-intro">
            {profile.heroIntro.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <ResourceLinks
            links={[
              { label: "CV", href: "/cv" },
              ...profile.links,
              { label: "Email", href: "mailto:" + profile.email },
            ]}
          />
        </div>
        <OptionalFetch />
      </section>
      <section className="section featured" aria-labelledby="featured-title">
        <div className="section-heading">
          <div>
            <h2 id="featured-title">Selected research</h2>
          </div>
          <Link href="/research">
            All research <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="research-list">
          {research
            .filter(r => r.featured)
            .map(r => (
              <ResearchEntry key={r.slug} record={r} />
            ))}
        </div>
      </section>
      <section
        className="section home-software"
        aria-labelledby="software-title"
      >
        <div className="section-heading">
          <h2 id="software-title">Research software</h2>
          <Link href="/software">Software & documentation ↗</Link>
        </div>
        <div className="software-preview">
          {software.map(item => (
            <div key={item.slug}>
              <Link href={"/software#" + item.slug}>{item.name}</Link>
              <p>{item.summary}</p>
            </div>
          ))}
        </div>
      </section>
      <Themes />
      <section className="section" aria-labelledby="updates-title">
        <div className="section-heading">
          <h2 id="updates-title">Recent updates</h2>
          <span className="quiet-label">Selected milestones</span>
        </div>
        <div className="updates">
          {updates.map(u => (
            <div key={u.slug}>
              <p className="eyebrow">{u.label}</p>
              <p>
                <Link href={"/research#" + u.slug}>{u.text}</Link>
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
