import React, { useEffect, useState, Suspense, lazy } from "react";
import { ModelErrorBoundary } from "@/components/ModelErrorBoundary";

interface MediaItem {
  type: "image" | "video" | "gif" | "model";
  src: string;
  alt: string;
  color?: string;
  background?: string;
}

interface Publication {
  title: string;
  authors: string;
  venue: string;
  year: number;
  monthYear: string;
  status: "Published" | "Under Review" | "In Progress";
  abstract: string;
  media: MediaItem[];
  links: {
    pdf: string | null;
    arxiv: string | null;
    code: string | null;
  };
}

const STLViewer = lazy(() => import("@/components/ThreeSTLViewer"));

function MediaCarousel({ media }: { media: MediaItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const videoRefs = React.useRef<{ [key: number]: HTMLVideoElement | null }>({});

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
    <div className="space-y-4">
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
                        loop
                        preload="metadata"
                      />
                    );
                  case "model":
                    return (
                      <ModelErrorBoundary>
                        <Suspense
                          fallback={
                            <div className="w-full h-full flex items-center justify-center bg-card text-muted-foreground text-sm">
                              Loading 3D model...
                            </div>
                          }
                        >
                          <div className="w-full h-full bg-card border border-border rounded-lg">
                            <STLViewer
                              height="100%"
                              src={srcUrl}
                              color={item.color}
                              background={item.background}
                            />
                          </div>
                        </Suspense>
                      </ModelErrorBoundary>
                    );
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
  const publications: Publication[] = [
    {
      title: "ARMoR: Arm-Based Robot Mobility on a Passive Platform via Reinforcement Learning of Contact-Driven Locomotion",
      authors: "<strong>Itay Kadosh</strong>*, Daniel Kadosh*, Robert Teal*, Keval Shah*",
      venue: "IEEE International Conference on Robotics and Automation (ICRA)",
      year: 2025,
      monthYear: "January 2025",
      status: "Published",
      abstract:
        "This paper presents a novel arm-driven mobility approach where a passive platform is locomoted by coordinated arm motions learned through reinforcement learning, achieving robust contact-driven locomotion.",
      media: [
        { type: "model", src: "/Robot_new.stl", alt: "ARMoR platform 3D model", color: "#ff7f50", background: "#0f172a" },
        { type: "video", src: "/armor.mp4", alt: "ARMoR platform clip" },
        { type: "image", src: "/about-photo-1.jpg", alt: "Path planning visualization" },
        { type: "gif", src: "/Wow.gif", alt: "Robot navigation animation" },
      ],
      links: { pdf: "#", arxiv: "#", code: "#", },
    },
    {
      title: "Deep Learning-Based Object Detection for Robotic Manipulation",
      authors: "Itay Kadosh, Co-Author 3",
      venue: "Robotics and Autonomous Systems Journal",
      year: 2024,
      monthYear: "October 2024",
      status: "Published",
      abstract:
        "We propose an optimized deep learning architecture for real-time object detection on embedded robotic platforms. The model achieves 95% accuracy while maintaining inference speed suitable for robotic control loops.",
      media: [
        { type: "image", src: "/about-photo-1.jpg", alt: "Path planning visualization" },
        { type: "gif", src: "/Wow.gif", alt: "Robot navigation animation" },
        { type: "video", src: "/IMG_5807.MOV", alt: "Path planning demonstration" },
      ],
      links: { pdf: "#", arxiv: "#", code: "#", },
    },
    {
      title: "Human-Robot Collaboration in Manufacturing Tasks",
      authors: "Itay Kadosh, Co-Author 4, Co-Author 5",
      venue: "In Preparation",
      year: 2025,
      monthYear: "February 2025",
      status: "In Progress",
      abstract:
        "This ongoing work explores safe and efficient collaboration between humans and robots in manufacturing environments. We develop control strategies that adapt to human behavior and ensure workplace safety.",
      media: [
        { type: "image", src: "/about-photo-1.jpg", alt: "Path planning visualization" },
        { type: "gif", src: "/Wow.gif", alt: "Robot navigation animation" },
        { type: "video", src: "/IMG_5807.MOV", alt: "Path planning demonstration" },
      ],
      links: { pdf: null, arxiv: null, code: null, },
    },
    {
      title: "Grasp Quality Prediction Using Reinforcement Learning",
      authors: "Itay Kadosh, Co-Author 6",
      venue: "Under Review at IROS 2024",
      year: 2025,
      monthYear: "April 2025",
      status: "In Progress",
      abstract:
        "We present a reinforcement learning approach to predict grasp quality for diverse objects. Our method generalizes well across object categories and achieves high success rates in real-world experiments.",
      media: [
        { type: "image", src: "/about-photo-1.jpg", alt: "Path planning visualization" },
        { type: "gif", src: "/Wow.gif", alt: "Robot navigation animation" },
        { type: "video", src: "/IMG_5807.MOV", alt: "Path planning demonstration" },
      ],
      links: { pdf: null, arxiv: "#", code: null, },
    },
    {
      title: "Reinforcement Learning for Robotics and Autonomous Mobility",
      authors: "<strong>Itay Kadosh</strong> and Hyeonduk Sim",
      venue: "MATH 6335 — Machine Learning and Control Theory (Course Report)",
      year: 2025,
      monthYear: "May 2025",
      status: "Published",
      abstract:
        "A comprehensive course report exploring reinforcement learning techniques for robotics and autonomous mobility. Covers problem formulation, policy optimization, simulation experiments, and analysis of control strategies.",
      media: [
        { type: "image", src: "/report_cover.png", alt: "Report cover" },
      ],
      links: { pdf: "/MATH_6335_Report.pdf", arxiv: null, code: null, },
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
                    className="border border-white/20 rounded-md overflow-hidden transform hover:scale-[1.01] transition-all duration-300 animate-fadeInUp bg-background/30 backdrop-blur-xl backdrop-saturate-150 shadow-[0_14px_40px_rgba(0,0,0,0.22)]"
                    style={{ animationDelay: `${(yearIdx * publicationsByYear[year].length + idx + 1) * 150}ms` }}
                  >
                    <div className="p-4 bg-card">
                      <MediaCarousel media={pub.media} />
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="text-xl font-semibold leading-snug">{pub.title}</h3>
                          <p className="text-sm text-muted-foreground mt-2" dangerouslySetInnerHTML={{ __html: pub.authors }} />
                          {pub.title.startsWith("ARMoR") && (
                            <p className="text-xs text-muted-foreground mt-1 italic">* These authors contributed equally to this work</p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ${
                            pub.status === "Published" ? "bg-foreground text-background" : "bg-muted text-foreground"
                          }`}
                        >
                          {pub.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>{pub.venue}</span>
                        <span>•</span>
                        <span>{pub.monthYear}</span>
                      </div>

                      <p className="text-foreground leading-relaxed text-sm">{pub.abstract}</p>

                      <div className="flex flex-wrap gap-3 pt-1">
                        {pub.links.pdf && (
                          <a
                            href={pub.links.pdf}
                            className="text-sm text-foreground underline hover:text-muted-foreground transition-colors"
                          >
                            PDF
                          </a>
                        )}
                        {pub.links.arxiv && (
                          <a
                            href={pub.links.arxiv}
                            className="text-sm text-foreground underline hover:text-muted-foreground transition-colors"
                          >
                            arXiv
                          </a>
                        )}
                        {pub.links.code && (
                          <a
                            href={pub.links.code}
                            className="text-sm text-foreground underline hover:text-muted-foreground transition-colors"
                          >
                            Code
                          </a>
                        )}
                        {!pub.links.pdf && !pub.links.arxiv && !pub.links.code && (
                          <span className="text-sm text-muted-foreground italic">Links coming soon</span>
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
