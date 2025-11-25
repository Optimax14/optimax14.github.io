import React, { useEffect, useState } from "react";

interface MediaItem {
  type: "image" | "video" | "gif";
  src: string;
  alt: string;
}

interface Publication {
  title: string;
  authors: string;
  venue: string;
  year: number;
  status: "Published" | "Under Review" | "In Progress";
  abstract: string;
  media: MediaItem[];
  links: {
    pdf: string | null;
    arxiv: string | null;
    code: string | null;
  };
}

function MediaCarousel({ media }: { media: MediaItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const videoRefs = React.useRef<{ [key: number]: HTMLVideoElement | null }>({});

  // Handle video playback when slide changes
  useEffect(() => {
    // Pause all videos first
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });

    // Play the current video if it exists
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      const playPromise = currentVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented, handle if needed
        });
      }
    }
  }, [currentIndex]);

  const goToPreviousSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setDirection("left");
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    setTimeout(() => setIsSliding(false), 800); // Increased duration
  };

  const goToNextSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % media.length);
    setTimeout(() => setIsSliding(false), 800); // Increased duration
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousSlide();
      } else if (e.key === 'ArrowRight') {
        goToNextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
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
        {/* Navigation Arrows */}
        <div className="absolute inset-0 flex items-center justify-between p-4 z-10">
          <button
            onClick={goToPreviousSlide}
            className="transform translate-x-[-100%] group-hover:translate-x-0 opacity-0 group-hover:opacity-100 focus:opacity-100 bg-background/80 hover:bg-background text-foreground rounded-full p-3 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button
            onClick={goToNextSlide}
            className="transform translate-x-[100%] group-hover:translate-x-0 opacity-0 group-hover:opacity-100 focus:opacity-100 bg-background/80 hover:bg-background text-foreground rounded-full p-3 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
        
        {/* Media Content */}
        <div className="relative w-full h-full overflow-hidden">
          {media.map((item, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out transform
                ${index === currentIndex ? 'translate-x-0' : 
                  direction === 'right' ? 
                    (index === (currentIndex + 1) % media.length ? 'translate-x-full' : 'translate-x-[-100%]') :
                    (index === (currentIndex - 1 + media.length) % media.length ? 'translate-x-[-100%]' : 'translate-x-full')
                }
              `}
              style={{
                zIndex: index === currentIndex ? 1 : 0,
                opacity: index === currentIndex ? 1 : 0,
                transition: 'all 500ms ease-in-out'
              }}
            >
              {(() => {
                const srcUrl = item.src?.startsWith("/") ? base + item.src.slice(1) : item.src;
                if (item.type === "image" || item.type === "gif") {
                  return (
                    <img
                      src={srcUrl}
                      alt={item.alt}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  );
                }
                if (item.type === "video") {
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
                }
                return null;
              })()}
            </div>
          ))}
        </div>
      </div>

      {/* Media Indicators/Pointers */}
      {media.length > 1 && (
        <div className="flex gap-2 justify-center">
          {media.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-foreground w-8"
                  : "bg-border w-2 hover:bg-muted-foreground"
              }`}
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
      title: "Efficient Path Planning for Mobile Robots in Dynamic Environments",
      authors: "Itay Kadosh, Co-Author 1, Co-Author 2",
      venue: "IEEE International Conference on Robotics and Automation (ICRA)",
      year: 2024,
      status: "Published",
      abstract:
        "This paper presents a novel path planning algorithm that efficiently handles dynamic obstacles while maintaining real-time performance. Our approach combines RRT* with dynamic window approach for robust navigation.",
      media: [
        {
          type: "image",
          src: "/about-photo-1.jpg",
          alt: "Path planning visualization",
        },
        {
          type: "gif",
          src: "/Wow.gif",
          alt: "Robot navigation animation",
        },
        {
          type: "video",
          src: "/IMG_5807.MOV",
          alt: "Path planning demonstration",
        },
      ],
      links: {
        pdf: "#",
        arxiv: "#",
        code: "#",
      },
    },
    {
      title: "Deep Learning-Based Object Detection for Robotic Manipulation",
      authors: "Itay Kadosh, Co-Author 3",
      venue: "Robotics and Autonomous Systems Journal",
      year: 2024,
      status: "Published",
      abstract:
        "We propose an optimized deep learning architecture for real-time object detection on embedded robotic platforms. The model achieves 95% accuracy while maintaining inference speed suitable for robotic control loops.",
      media: [
        {
          type: "image",
          src: "/about-photo-1.jpg",
          alt: "Path planning visualization",
        },
        {
          type: "gif",
          src: "/Wow.gif",
          alt: "Robot navigation animation",
        },
        {
          type: "video",
          src: "/IMG_5807.MOV",
          alt: "Path planning demonstration",
        },
      ],
      links: {
        pdf: "#",
        arxiv: "#",
        code: "#",
      },
    },
    {
      title: "Human-Robot Collaboration in Manufacturing Tasks",
      authors: "Itay Kadosh, Co-Author 4, Co-Author 5",
      venue: "In Preparation",
      year: 2024,
      status: "In Progress",
      abstract:
        "This ongoing work explores safe and efficient collaboration between humans and robots in manufacturing environments. We develop control strategies that adapt to human behavior and ensure workplace safety.",
      media: [
        {
          type: "image",
          src: "/about-photo-1.jpg",
          alt: "Path planning visualization",
        },
        {
          type: "gif",
          src: "/Wow.gif",
          alt: "Robot navigation animation",
        },
        {
          type: "video",
          src: "/IMG_5807.MOV",
          alt: "Path planning demonstration",
        },
      ],
      links: {
        pdf: null,
        arxiv: null,
        code: null,
      },
    },
    {
      title: "Grasp Quality Prediction Using Reinforcement Learning",
      authors: "Itay Kadosh, Co-Author 6",
      venue: "Under Review at IROS 2024",
      year: 2024,
      status: "In Progress",
      abstract:
        "We present a reinforcement learning approach to predict grasp quality for diverse objects. Our method generalizes well across object categories and achieves high success rates in real-world experiments.",
      media: [
        {
          type: "image",
          src: "/about-photo-1.jpg",
          alt: "Path planning visualization",
        },
        {
          type: "gif",
          src: "/Wow.gif",
          alt: "Robot navigation animation",
        },
        {
          type: "video",
          src: "/IMG_5807.MOV",
          alt: "Path planning demonstration",
        },
      ],
      links: {
        pdf: null,
        arxiv: "#",
        code: null,
      },
    },
  ];

  return (
      <section className="section-padding">
        <div className="container max-w-5xl">
          <h1 className="text-4xl font-bold mb-12 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            Publications & Research
          </h1>

          <div className="space-y-16">
            {publications.map((pub, idx) => (
              <div 
                key={idx} 
                className="border border-border rounded-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${(idx + 1) * 200}ms` }}
              >
                {/* Media Section */}
                <div className="p-6 bg-card">
                  <MediaCarousel media={pub.media} />
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-2xl font-semibold leading-tight">
                        {pub.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {pub.authors}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ${
                        pub.status === "Published"
                          ? "bg-foreground text-background"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {pub.status}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {pub.venue} • {pub.year}
                  </p>

                  <p className="text-foreground leading-relaxed">{pub.abstract}</p>

                  <div className="flex flex-wrap gap-3 pt-2">
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
                      <span className="text-sm text-muted-foreground italic">
                        Links coming soon
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-card border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Additional Work</h2>
            <p className="text-muted-foreground">
              For a complete list of publications and research projects, please refer to my CV
              or contact me directly. I'm always happy to discuss my research and ongoing work.
            </p>
          </div>
        </div>
      </section>
  );
}
