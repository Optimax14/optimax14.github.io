import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Authors, ResourceLinks } from "@/components/ResearchContent";
import { asset, research } from "@/data/research";
import { rpx } from "@/data/rpx";
function Showcase() {
  const [started, setStarted] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (started) video.current?.play().catch(() => {});
  }, [started]);
  return (
    <section
      className="rpx-section"
      id="showcase"
      aria-labelledby="showcase-title"
    >
      <h2 id="showcase-title">Perception under manipulation</h2>
      <div className="rpx-video">
        {started ? (
          <video
            ref={video}
            src={asset("research/rpx/showcase.mp4")}
            poster={asset("research/rpx/showcase-poster.webp")}
            width="960"
            height="360"
            controls
            playsInline
            muted
            preload="none"
            aria-label="Silent official RPX dataset showcase showing captured scenes and dataset modalities"
          />
        ) : (
          <>
            <img
              src={asset("research/rpx/showcase-poster.webp")}
              width="1280"
              height="480"
              alt="Paused poster from the official RPX dataset-card showcase"
              decoding="async"
            />
            <Button onClick={() => setStarted(true)}>
              Play RPX showcase <span aria-hidden="true">▶</span>
            </Button>
          </>
        )}
      </div>
      <p className="caption">
        Official dataset showcase · silent, click to play. This web copy is
        resized and compressed from the public RPX video.
      </p>
    </section>
  );
}
export default function RPX() {
  const record = research.find(r => r.slug === "rpx")!;
  return (
    <div className="page-width rpx-page">
      <header className="page-header">
        <Link href="/research" className="back-link">
          ← Research and software
        </Link>
        <p className="eyebrow">
          {record.status} · {record.venue}
        </p>
        <h1>Same Scene, Different Story</h1>
        <p className="rpx-lead">
          A real-world benchmark of perception under manipulation.
        </p>
        <Authors record={record} />
        <ResourceLinks links={rpx.sources} />
      </header>
      <dl className="rpx-stats">
        {rpx.stats.map(stat => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
      <Showcase />
      <section className="rpx-section" aria-labelledby="phases-title">
        <h2 id="phases-title">One scene, changing conditions</h2>
        <p>
          The same scene is recorded before, during, and after manipulation,
          with an additional egocentric view.
        </p>
        <div className="rpx-views">
          {rpx.views.map(view => (
            <figure key={view.slug}>
              <img
                src={asset("research/rpx/" + view.slug + ".webp")}
                width="768"
                height="576"
                loading="lazy"
                decoding="async"
                alt={view.alt}
              />
              <figcaption>
                <strong>{view.label}</strong>
                <span>{view.description}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="caption">
          Illustrative captures from scene 049. These four views are not
          frame-synchronized. They show released observations, not model
          predictions.
        </p>
      </section>
      <section className="rpx-section" aria-labelledby="overview-title">
        <h2 id="overview-title">A shared benchmark across six tasks</h2>
        <figure className="rpx-figure">
          <a
            href={asset(rpx.overview.full)}
            aria-label="Open full-resolution official RPX overview"
          >
            <img
              src={asset(rpx.overview.src)}
              width="1600"
              height="929"
              loading="lazy"
              decoding="async"
              alt={rpx.overview.alt}
            />
          </a>
          <figcaption>
            Official RPX overview, shown without cropping its labels.{" "}
            <a href={asset(rpx.overview.full)}>Open full resolution ↗</a>
          </figcaption>
        </figure>
      </section>
      <section className="rpx-section" aria-labelledby="findings-title">
        <h2 id="findings-title">
          Accuracy and robustness are different questions
        </h2>
        <p>
          How does perception change when hands enter a scene and objects move?
          RPX measures quality within each phase and robustness across phase
          changes. Across the reported 65 model–task evaluations, none meets the
          authors’ thresholds for both accuracy and robustness.
        </p>
        <figure className="rpx-figure">
          <img
            src={asset(rpx.findings.src)}
            width="1600"
            height="988"
            loading="lazy"
            decoding="async"
            alt={rpx.findings.alt}
          />
          <figcaption>
            Public RPX results visualization. Bars summarize mean model quality
            by view; the map compares worst-phase quality with phase robustness.
            These are benchmark-specific aggregate results, not a sample
            prediction.{" "}
            <a href="https://irvlutd.github.io/RPX/toolkit-docs/#what-the-paper-found">
              Methods and source tables ↗
            </a>
          </figcaption>
        </figure>
      </section>
      <section className="rpx-section" aria-labelledby="toolkit-title">
        <h2 id="toolkit-title">
          From model adapters to comparable evaluations
        </h2>
        <p>
          Task-specific adapters connect a model or API to the evaluation
          protocol. The toolkit handles data selection, scoring, and phase-level
          diagnostics. Coverage of the six benchmark tasks does not imply that
          every task ships with pretrained model sweeps.
        </p>
        <figure className="rpx-figure">
          <a
            href={asset(rpx.workflow.src)}
            aria-label="Open the RPX toolkit workflow SVG"
          >
            <img
              src={asset(rpx.workflow.src)}
              width="1440"
              height="670"
              loading="lazy"
              decoding="async"
              alt={rpx.workflow.alt}
            />
          </a>
          <figcaption>
            Official toolkit workflow.{" "}
            <a href={asset(rpx.workflow.src)}>Open the vector diagram ↗</a>
          </figcaption>
        </figure>
        <div
          className="table-scroll"
          role="region"
          aria-label="Six RPX evaluation tasks"
          tabIndex={0}
        >
          <table>
            <caption>Tasks reported in the RPX benchmark</caption>
            <thead>
              <tr>
                <th scope="col">Task</th>
                <th scope="col">Input</th>
                <th scope="col">Evaluation</th>
              </tr>
            </thead>
            <tbody>
              {rpx.tasks.map(task => (
                <tr key={task.name}>
                  <th scope="row">{task.name}</th>
                  <td>{task.input}</td>
                  <td>{task.evaluation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Released data include RGB, metric depth, instance masks, calibrated
          fisheye stereo, and camera pose. See the dataset and toolkit
          documentation for the exact capture and task contracts.
        </p>
        <ResourceLinks links={rpx.sources} />
      </section>
      <aside className="media-credit">
        <h2>Media and project credit</h2>
        <p>
          RPX is joint work by the authors listed above. Scene imagery and the
          showcase are adapted from{" "}
          <a href="https://huggingface.co/datasets/IRVLUTD/RPX">IRVLUTD/RPX</a>,
          whose dataset card specifies{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
          Images were resized and compressed; the video was resized, compressed,
          and stripped of audio. Public overview, findings, and workflow
          graphics are credited to the{" "}
          <a href="https://irvlutd.github.io/RPX/toolkit-docs/">
            RPX project and toolkit authors
          </a>
          .{" "}
          <a href={asset("research/rpx/media-attribution.json")}>
            Source URLs, hashes, and transformations
          </a>
          .
        </p>
      </aside>
    </div>
  );
}
