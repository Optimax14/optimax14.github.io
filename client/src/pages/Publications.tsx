import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "wouter";
import { ModelErrorBoundary } from "@/components/ModelErrorBoundary";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/utils/analytics";

const STLViewer = lazy(() => import("@/components/ThreeSTLViewer"));

interface MediaItem {
  type: "image" | "video" | "gif" | "model";
  src: string;
  alt: string;
  viewerOptions?: {
    color?: string;
    background?: string;
    metalness?: number;
    roughness?: number;
    height?: string | number;
  };
}

interface Publication {
  title: string;
  authors: string;
  venue: string;
  year: number;
  monthYear: string;
  status: "Published" | "Under Review" | "In Progress" | "Finished";
  abstract: string;
  media: MediaItem[];
  readMore?: string;
  links: {
    pdf: string | null;
    arxiv: string | null;
    code: string | null;
  };
}

function SpinningQuestion() {
  const cycle = ["Coming soon", "Coming soon.", "Coming soon..", "Coming soon..."];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((prev) => (prev + 1) % cycle.length);
    }, 1100);
    return () => clearInterval(t);
  }, [cycle.length]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div
        className="w-24 h-24 rounded-full shadow-lg flex items-center justify-center text-white text-4xl font-black"
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #8b5cf6 50%, #22d3ee 100%)",
          animation: "spin 1.8s linear infinite",
          boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
        }}
        aria-label="Coming soon"
      >
        ?
      </div>
      <div className="text-lg font-semibold tracking-wide">
        <span>{cycle[idx]}</span>
      </div>
    </div>
  );
}

function MediaCarousel({ media }: { media: MediaItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isPaused, setIsPaused] = useState(false);
  const videoRefs = React.useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const autoCycleMs = 15000;
  const currentItem = media[currentIndex];
  const isVideo = currentItem?.type === "video";

  useEffect(() => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });

    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      const playPromise = currentVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    if (media.length <= 1 || isPaused || isVideo) return;
    const id = window.setInterval(() => {
      setDirection("right");
      setCurrentIndex((prev) => (prev + 1) % media.length);
    }, autoCycleMs);
    return () => window.clearInterval(id);
  }, [autoCycleMs, isPaused, isVideo, media.length, currentIndex]);

  const goToPreviousSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setDirection("left");
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    setTimeout(() => setIsSliding(false), 800);
  };

  const goToNextSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % media.length);
    setTimeout(() => setIsSliding(false), 800);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPreviousSlide();
      else if (e.key === "ArrowRight") goToNextSlide();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [media.length]);

  if (!media || media.length === 0) {
    return (
      <div className="w-full bg-muted rounded-lg overflow-hidden border border-border shadow-sm aspect-video flex items-center justify-center">
        <p className="text-muted-foreground">No media available</p>
      </div>
    );
  }

  const base = import.meta.env.BASE_URL || "/";

  return (
    <div
      className="space-y-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="relative w-full bg-muted rounded-lg overflow-hidden border border-border shadow-sm aspect-video group">
        <div className="absolute inset-0 flex items-center justify-between p-4 z-10 pointer-events-none">
          <button
            onClick={goToPreviousSlide}
            className="pointer-events-auto transform translate-x-[-100%] group-hover:translate-x-0 opacity-0 group-hover:opacity-100 focus:opacity-100 bg-background/80 hover:bg-background text-foreground rounded-full p-3 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={goToNextSlide}
            className="pointer-events-auto transform translate-x-[100%] group-hover:translate-x-0 opacity-0 group-hover:opacity-100 focus:opacity-100 bg-background/80 hover:bg-background text-foreground rounded-full p-3 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        <div className="relative w-full h-full overflow-hidden">
          {media.map((item, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out transform ${
                index === currentIndex
                  ? "translate-x-0"
                  : direction === "right"
                  ? index === (currentIndex + 1) % media.length
                    ? "translate-x-full"
                    : "translate-x-[-100%]"
                  : index === (currentIndex - 1 + media.length) % media.length
                  ? "translate-x-[-100%]"
                  : "translate-x-full"
              }`}
              style={{
                zIndex: index === currentIndex ? 1 : 0,
                opacity: index === currentIndex ? 1 : 0,
                transition: "all 500ms ease-in-out",
              }}
            >
              {(() => {
                const srcUrl = item.src?.startsWith("/") ? base + item.src.slice(1) : item.src;
                switch (item.type) {
                  case "image":
                  case "gif":
                    if (!item.src) {
                      return (
                        <div className="w-full h-full flex items-center justify-center bg-background text-foreground">
                          <SpinningQuestion />
                        </div>
                      );
                    }
                    return (
                      <img
                        src={srcUrl}
                        alt={item.alt}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain bg-background"
                      />
                    );
                  case "video":
                    return (
                      <video
                        ref={(el: HTMLVideoElement | null) => {
                          if (el) videoRefs.current[index] = el;
                        }}
                        src={index === currentIndex ? srcUrl : undefined}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                        loop={false}
                        onEnded={() => {
                          if (isPaused) return;
                          goToNextSlide();
                        }}
                        preload="metadata"
                      />
                    );
                  case "model": {
                    const opts = item.viewerOptions || {};
                    return (
                      <ModelErrorBoundary>
                        <Suspense
                          fallback={
                            <div className="w-full h-full flex items-center justify-center bg-background text-muted-foreground">
                              Loading 3D model...
                            </div>
                          }
                        >
                          <STLViewer
                            src={srcUrl}
                            background={opts.background ?? "#0b0f1a"}
                            color={opts.color ?? "#ff7a00"}
                            metalness={opts.metalness}
                            roughness={opts.roughness}
                            height={opts.height ?? "100%"}
                          />
                        </Suspense>
                      </ModelErrorBoundary>
                    );
                  }
                  default:
                    return null;
                }
              })()}
            </div>
          ))}
        </div>
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 justify-center">
          {media.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${idx === currentIndex ? "bg-foreground w-8" : "bg-border w-2 hover:bg-muted-foreground"}`}
              aria-label={`Go to media ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Publications() {
  const trackExternal = (url: string, label: string) => {
    if (!url.startsWith("http")) return;
    trackEvent("external_link", { link_url: url, link_text: label });
  };
  const publications: Publication[] = [
    {
      title: "ARMoR: Arm-Based Robot Mobility on a Passive Platform via Reinforcement Learning of Contact-Driven Locomotion",
      authors: "<strong>Itay Kadosh</strong>*, Daniel Kadosh*, Robert Teal*, Keval Shah*",
      venue: "Coming soon",
      year: 2025,
      monthYear: "Jan 2025",
      status: "In Progress",
      abstract:
        "This project presents a novel arm-driven mobility approach where a passive platform is locomoted by coordinated arm motions learned through reinforcement learning, achieving robust contact-driven locomotion. ",
      media: [
        {
          type: "model",
          src: "/armor.stl",
          alt: "ARMoR platform 3D model",
          viewerOptions: { color: "#ff7a00", background: "#0b0f1a", height: "100%" },
        },
        { type: "video", src: "/armor.mp4", alt: "ARMoR platform clip" },
      ],
      links: { pdf: null, arxiv: null, code: null },
    },
    {
      title: "AutoX-SemMap: Autonomous Exploration and Semantic Updating of Large-Scale Indoor Environments with Mobile Robots",
      authors: "Sai Haneesh Allu, <strong>Itay Kadosh</strong>, Tyler Summers, Yu Xiang",
      venue: "ICRA 2026 (Under Review) - IRVL",
      year: 2024,
      monthYear: "Sep 2024",
      status: "Under Review",
      abstract:
        "Autonomous exploration + semantic map updates for large indoor spaces. GroundingDINO/SAMv2 RGB-D fusion with dynamic object association; under review at ICRA 2026.",
      media: [
        { type: "image", src: "/autox_main_fig.png", alt: "AutoX-SemMap system overview" },
        { type: "video", src: "/exploration.mp4", alt: "AutoX-SemMap exploration demo" },
      ],
      readMore: "/updates/autox-semmap",
      links: { pdf: "https://arxiv.org/pdf/2409.15493.pdf", arxiv: "https://arxiv.org/abs/2409.15493", code: "https://github.com/IRVLUTD/AutoX-SemMap" },
    },
    {
      title: "IntelX: Coverage Prediction for Efficient Indoor Robot Exploration",
      authors: "Saurav Dosi, <strong>Itay Kadosh</strong>, Yu Xiang",
      venue: "Intelligent Robotics and Vision Laboratory (IRVL)",
      year: 2025,
      monthYear: "Present",
      status: "In Progress",
      abstract:
        "This work presents a novel approach to indoor exploration using coverage prediction models to optimize robot paths. Using a Unet Segmentation Regression approach for map coverage prediction locally as well as a novel global planner, we demonstrate improved exploration efficiency in complex indoor environments.",
      media: [
        { type: "image", src: "", alt: "Coming soon" },
      ],
      readMore: "#",
      links: { pdf: null, arxiv: null, code: null },
    },



    {
      title: "RPX (Robot Perception X): Benchmark & Dataset for Robotics Perception Tasks",
      authors: "<strong>Itay Kadosh</strong>*, Jishnu Jaykumar*, Sai Haneesh Allu, Yu Xiang",
      venue: "Intelligent Robotics and Vision Laboratory (IRVL)",
      year: 2025,
      monthYear: "Present",
      status: "In Progress",
      abstract:
        "This work presents RPX, a comprehensive real-world perception benchmark and dataset for evaluating robotics perception tasks including object detection, segmentation, pose estimation, and other tasks in indoor environments. RPX aims to facilitate advancements in robotic perception by providing diverse scenarios and standardized evaluation metrics.",
      media: [
        { type: "image", src: "", alt: "Coming soon" },
      ],
      links: { pdf: null, arxiv: null, code: null },
    },

    {
      title: "Measuring the Effects of Mental Fatigue on Worker Performance Through Task Rotations",
      authors: "Toni Dismuke*, <strong>Itay Kadosh</strong>*, Emily Yuan*, Shirin Ghasemi, David Neyens, Tugce Isik",
      venue: "Department of Industrial Engineering, Clemson University",
      year: 2025,
      monthYear: "Nov 2025",
      status: "Under Review",
      abstract:
        "Experimental study on how task rotations impact mental fatigue and worker performance using multimodal measures. Full paper under review; coming soon.",
      media: [
        { type: "image", src: "/hcore_final_poster.png", alt: "HCORE REU final poster" },
      ],
      links: { pdf: "/HCORE-poster-final.pdf", arxiv: null, code: null },
    },

    {
      title: "Reinforcement Learning for Robotics and Autonomous Mobility",
      authors: "<strong>Itay Kadosh</strong> and Hyeonduk Sim",
      venue: "MATH 6335 - Machine Learning and Control Theory (Course Report)",
      year: 2025,
      monthYear: "May 2025",
      status: "Finished",
      abstract:
        "A comprehensive course report exploring reinforcement learning techniques for robotics and autonomous mobility. Covers problem formulation, policy optimization, simulation experiments, and analysis of control strategies.",
      media: [
        { type: "image", src: "/report_cover.png", alt: "Report cover" },
      ],
      links: { pdf: "/MATH_6335_Report.pdf", arxiv: null, code: null },
    },
  ];

  const publicationsByYear = publications.reduce<Record<number, Publication[]>>((acc, pub) => {
    acc[pub.year] = acc[pub.year] ? [...acc[pub.year], pub] : [pub];
    return acc;
  }, {});
  const sortedYears = Object.keys(publicationsByYear).map(Number).sort((a, b) => b - a);

  return (
    <section className="section-padding">
        <div className="container max-w-8xl">
        <h1 className="text-4xl font-bold mb-12 animate-fadeInUp" style={{ animationDelay: "100ms" }}>
          Publications & Research
        </h1>

        <div className="space-y-16">
          {sortedYears.map((year, yearIdx) => (
            <div key={year}>
              <h2 className="text-2xl font-bold mb-6">{year}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {publicationsByYear[year].map((pub, idx) => (
                  <div
                    key={`${year}-${idx}`}
                    className="border border-white/20 rounded-md overflow-hidden transform hover:scale-[1.01] transition-all duration-300 animate-fadeInUp bg-background/30 backdrop-blur-xl backdrop-saturate-150 shadow-[0_14px_40px_rgba(0,0,0,0.22)] flex flex-col"
                    style={{ animationDelay: `${(yearIdx * publicationsByYear[year].length + idx + 1) * 150}ms` }}
                  >
                    <div className="p-4 bg-card">
                      <MediaCarousel media={pub.media} />
                    </div>

                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="text-xl font-semibold leading-snug">{pub.title}</h3>
                          <p className="text-sm text-muted-foreground mt-2" dangerouslySetInnerHTML={{ __html: pub.authors }} />
                          {pub.authors.includes("*") && (
                            <p className="text-xs text-muted-foreground mt-1 italic">* These authors contributed equally to this work</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ${
                              pub.status === "Published" || pub.status === "Finished" ? "bg-foreground text-background" : "bg-muted text-foreground"
                            }`}
                          >
                            {pub.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>{pub.venue}</span>
                        <span>•</span>
                        <span>{pub.monthYear}</span>
                      </div>

                      <p className="text-foreground leading-relaxed text-sm">{pub.abstract}</p>

                      <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
                        {pub.links.pdf && (
                          <a
                            href={pub.links.pdf}
                            className="text-sm text-foreground underline hover:text-muted-foreground transition-colors"
                            onClick={() => trackExternal(pub.links.pdf as string, pub.links.pdf.toLowerCase().includes("poster") ? "Poster" : "PDF")}
                          >
                            {pub.links.pdf.toLowerCase().includes("poster") ? "Poster" : "PDF"}
                          </a>
                        )}
                        {pub.links.pdf?.toLowerCase().includes("poster") && (
                          <span className="text-sm text-muted-foreground">Paper coming soon</span>
                        )}
                        {pub.links.arxiv && (
                          <a
                            href={pub.links.arxiv}
                            className="text-sm text-foreground underline hover:text-muted-foreground transition-colors"
                            onClick={() => trackExternal(pub.links.arxiv as string, "arXiv")}
                          >
                            arXiv
                          </a>
                        )}
                        {pub.links.code && (
                          <a
                            href={pub.links.code}
                            className="text-sm text-foreground underline hover:text-muted-foreground transition-colors"
                            onClick={() => trackExternal(pub.links.code as string, "Code")}
                          >
                            Code
                          </a>
                        )}
                        {!pub.links.pdf && !pub.links.arxiv && !pub.links.code && (
                          <span className="text-sm text-muted-foreground italic">Links and paper coming soon</span>
                        )}
                        {pub.readMore && (
                          pub.readMore === "#" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-auto bg-muted/60 text-foreground border-border/60 disabled:opacity-70"
                              disabled
                            >
                              Read More (coming soon)
                            </Button>
                          ) : (
                            <Button asChild size="sm" className="ml-auto">
                              <Link href={pub.readMore}>Read More</Link>
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-background/30 backdrop-blur-xl backdrop-saturate-150 border border-white/20 rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <h2 className="text-xl font-semibold mb-3">Additional Work</h2>
          <p className="text-muted-foreground">
            For a complete list of publications and research projects, please refer to my CV or contact me directly. I'm
            always happy to discuss my research and ongoing work.
          </p>
        </div>
      </div>
    </section>
  );
}
