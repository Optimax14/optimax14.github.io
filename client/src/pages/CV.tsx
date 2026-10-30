import { Button } from "@/components/ui/button";
import { asset, cv, profile } from "@/data/research";
import { trackEvent } from "@/utils/analytics";
export default function CV() {
  return (
    <div className="page-width">
      <header className="page-header">
        <p className="eyebrow">Curriculum vitae</p>
        <h1>Itay Kadosh</h1>
        <p>{profile.role}</p>
      </header>
      <section className="cv-notice" aria-labelledby="cv-status">
        <h2 id="cv-status">Updated CV pending</h2>
        <p>{cv.notice}</p>
        <Button asChild>
          <a
            href={
              "mailto:" + profile.email + "?subject=Current%20research%20CV"
            }
          >
            Request current CV <span aria-hidden="true">↗</span>
          </a>
        </Button>
      </section>
      <section className="cv-archive">
        <h2>Archived CV</h2>
        <p>
          The December 2025 PDF is retained for reference. It is not the current
          research CV.
        </p>
        <div className="cv-actions">
          <a
            href={asset("cv.pdf")}
            download
            onClick={() =>
              trackEvent("cv_download", {
                file: "/cv.pdf",
                version: "2025-12-archive",
              })
            }
          >
            Download December 2025 archive (PDF) ↓
          </a>
          <a href={asset("cv.pdf")}>Open archived PDF ↗</a>
        </div>
        <details className="cv-preview">
          <summary>Preview archived CV · {cv.archivedDate}</summary>
          <object
            data={asset("cv.pdf")}
            type="application/pdf"
            aria-label="December 2025 archived curriculum vitae"
          >
            <p>
              <a href={asset("cv.pdf")}>Open the archived CV</a> if PDF preview
              is unavailable.
            </p>
          </object>
        </details>
      </section>
    </div>
  );
}
