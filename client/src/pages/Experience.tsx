import React, { useState } from "react";

type MediaItem = {
  type: "image" | "video" | "gif";
  src: string;
  alt: string;
};

function MediaCarousel({ media }: { media: MediaItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  if (!media || media.length === 0) return null;
  const base = import.meta.env.BASE_URL || "/";
  const current = media[currentIndex];

  const goToPreviousSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    setTimeout(() => setIsSliding(false), 600);
  };

  const goToNextSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setCurrentIndex((prev) => (prev + 1) % media.length);
    setTimeout(() => setIsSliding(false), 600);
  };

  return (
    <div className="space-y-3 w-full">
      <div className="relative w-full rounded-lg overflow-hidden shadow-sm h-[320px] sm:h-[420px] bg-transparent">
        <div className="absolute inset-0 flex items-center justify-between p-3 z-10">
          <button
            onClick={goToPreviousSlide}
            className="bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow transition"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button
            onClick={goToNextSlide}
            className="bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow transition"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
        <div className="w-full h-full flex items-center justify-center">
          {(() => {
            const srcUrl = current.src?.startsWith("/") ? base + current.src.slice(1) : current.src;
            if (current.type === "image" || current.type === "gif") {
              return <img src={srcUrl} alt={current.alt} className="w-full h-auto max-h-full object-contain" loading="lazy" />;
            }
            if (current.type === "video") {
              return <video src={srcUrl} className="w-full h-auto max-h-full object-contain" playsInline muted loop controls />;
            }
            return null;
          })()}
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

export default function Experience() {
  const utdMainMedia: MediaItem[] = [
    { type: "image", src: "/soccer_irvl.jpg", alt: "UTD lab work 1" },
    { type: "image", src: "/personal_2.jpg", alt: "UTD lab work 2" },
  ];
  const utdSecondaryMedia: MediaItem[] = [
    { type: "image", src: "/hobbies_1.jpg", alt: "UTD project landscape 1" },
    { type: "image", src: "/hobbies_2.jpg", alt: "UTD project landscape 2" },
  ];
  return (
    <div className="min-h-screen">
      <section className="section-padding">
        <div className="container max-w-5xl">
          <h1 className="text-4xl font-bold mb-12">Experience</h1>

          {/* UTD Robotics Researcher Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-8">Robotics Researcher at UTD</h2>

            {/* Photo Left, Text Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  <MediaCarousel media={utdMainMedia} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-semibold">Research Assistant</h3>
                    <p className="text-lg text-muted-foreground">
                      University of Texas at Dallas - Robotics Lab
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap font-medium">
                    2023 - Present
                  </span>
                </div>

                <p className="text-foreground leading-relaxed">
                  Conducting cutting-edge research on autonomous navigation systems and developing
                  advanced algorithms for robot path planning in dynamic environments.
                </p>

                <div className="space-y-3 mt-6">
                  <h4 className="font-semibold text-foreground">Key Contributions</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start text-foreground">
                      <span className="mr-3">→</span>
                      <span>Developed ROS-based navigation stack for autonomous mobile robots</span>
                    </li>
                    <li className="flex items-start text-foreground">
                      <span className="mr-3">→</span>
                      <span>Implemented advanced SLAM algorithms for real-time localization</span>
                    </li>
                    <li className="flex items-start text-foreground">
                      <span className="mr-3">→</span>
                      <span>Collaborated with team on real-world robot deployment and testing</span>
                    </li>
                    <li className="flex items-start text-foreground">
                      <span className="mr-3">→</span>
                      <span>Published research findings in peer-reviewed conferences</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Additional Photo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-4 order-2 lg:order-1">
                <h4 className="font-semibold text-foreground">Research Focus</h4>
                <p className="text-foreground leading-relaxed">
                  My research at UTD focuses on developing robust autonomous navigation systems
                  that can handle complex, dynamic environments. I work on perception, planning,
                  and control algorithms that enable robots to navigate safely and efficiently
                  while avoiding obstacles and adapting to changing conditions.
                </p>

                <p className="text-foreground leading-relaxed">
                  This work has direct applications in autonomous vehicles, warehouse automation,
                  and search-and-rescue robotics. I'm particularly interested in how machine
                  learning can improve navigation performance in novel environments.
                </p>
              </div>

              <div className="flex justify-center order-1 lg:order-2">
                <div className="w-full max-w-2xl">
                  <MediaCarousel media={utdSecondaryMedia} />
                </div>
              </div>
            </div>
          </div>

          {/* Clemson Visiting Researcher Section */}
          <div className="mb-20 pt-12 border-t border-border">
            <h2 className="text-3xl font-bold mb-8 mt-12">Visiting Summer Researcher at Clemson</h2>

            {/* Photo Right, Text Left */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-semibold">Visiting Researcher</h3>
                    <p className="text-lg text-muted-foreground">
                      Clemson University - Robotics & Automation Lab
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap font-medium">
                    Summer 2023
                  </span>
                </div>

                <p className="text-foreground leading-relaxed">
                  Spent an intensive summer conducting research on robotic manipulation and
                  computer vision systems for object recognition and grasping.
                </p>

                <div className="space-y-3 mt-6">
                  <h4 className="font-semibold text-foreground">Key Contributions</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start text-foreground">
                      <span className="mr-3">→</span>
                      <span>Developed deep learning models for object detection and classification</span>
                    </li>
                    <li className="flex items-start text-foreground">
                      <span className="mr-3">→</span>
                      <span>Optimized inference for real-time performance on robotic platforms</span>
                    </li>
                    <li className="flex items-start text-foreground">
                      <span className="mr-3">→</span>
                      <span>Implemented grasp quality prediction algorithms</span>
                    </li>
                    <li className="flex items-start text-foreground">
                      <span className="mr-3">→</span>
                      <span>Tested and validated perception systems on physical robot hardware</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-md bg-muted rounded-lg overflow-hidden border border-border shadow-sm">
                  <img
                    src="/about-photo-1.jpg"
                    alt="Clemson Research"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Additional Photo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="flex justify-center">
                <div className="w-full max-w-md bg-muted rounded-lg overflow-hidden border border-border shadow-sm">
                  <img
                    src="/about-photo-1.jpg"
                    alt="Clemson Lab Work"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Research Outcomes</h4>
                <p className="text-foreground leading-relaxed">
                  During my time at Clemson, I gained valuable experience working with state-of-the-art
                  robotic arms and vision systems. The research focused on bridging the gap between
                  computer vision and robotic manipulation, enabling robots to autonomously grasp
                  and manipulate diverse objects.
                </p>

                <p className="text-foreground leading-relaxed">
                  This experience was instrumental in developing my understanding of the complete
                  pipeline from perception to action in robotic systems. I collaborated with
                  experienced researchers and contributed to publications that advanced the field.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Experience Section */}
          <div className="pt-12 border-t border-border">
            <h2 className="text-2xl font-bold mb-8 mt-12">Additional Experience</h2>
            <div className="space-y-6">
              <div className="p-6 border border-border rounded-lg bg-card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">Undergraduate Researcher</h3>
                    <p className="text-muted-foreground">Computer Vision Lab</p>
                  </div>
                  <span className="text-sm text-muted-foreground">2022 - 2023</span>
                </div>
                <p className="text-foreground">
                  Worked on computer vision projects focusing on object detection and pose estimation
                  for robotic applications.
                </p>
              </div>

              <div className="p-6 border border-border rounded-lg bg-card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">Robotics Club President</h3>
                    <p className="text-muted-foreground">University Robotics Club</p>
                  </div>
                  <span className="text-sm text-muted-foreground">2022 - 2023</span>
                </div>
                <p className="text-foreground">
                  Led a team of 15+ students in designing and building competition robots for various
                  robotics competitions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
