import { Button } from "@/components/ui/button";

export default function CV() {
  return (
    <div className="min-h-screen">
      <section className="section-padding">
        <div className="container max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Itay Kadosh</h1>
              <p className="text-muted-foreground">
                Curriculum Vitae • Robotics Researcher & Graduate School Applicant
              </p>
            </div>
            <Button
              variant="default"
              className="bg-foreground text-background hover:bg-muted-foreground w-full sm:w-auto"
              asChild
            >
              <a href="/cv.pdf" download>
                Download PDF
              </a>
            </Button>
          </div>
          <div className="w-full" style={{ height: "calc(100vh - 200px)" }}>
            <object
              data="/cv.pdf"
              type="application/pdf"
              className="w-full h-full rounded-lg"
            >
              <p>Your browser does not support PDFs. Please download the PDF to view it.</p>
            </object>
          </div>
        </div>
      </section>
    </div>
  );
}
