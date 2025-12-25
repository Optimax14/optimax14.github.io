import React, { useState } from "react";

type MediaItem = {
  type: "image" | "video" | "gif";
  src: string;
  alt: string;
};

function MediaCarousel({ media }: { media: MediaItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  const goToPreviousSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    setTimeout(() => setIsSliding(false), 800);
  };

  const goToNextSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setCurrentIndex((prev) => (prev + 1) % media.length);
    setTimeout(() => setIsSliding(false), 800);
  };

  if (!media || media.length === 0) return null;

  const base = import.meta.env.BASE_URL || "/";
  const current = media[currentIndex];

  return (
    <div className="space-y-4 w-full">
      <div className="relative w-full rounded-lg overflow-hidden shadow-sm group">
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

        <div className="relative w-full h-full overflow-hidden flex items-center justify-center p-2">
          {(() => {
            const srcUrl = current.src?.startsWith("/") ? base + current.src.slice(1) : current.src;
            if (current.type === "image" || current.type === "gif") {
              return (
                <img
                  src={srcUrl}
                  alt={current.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto max-w-full object-contain"
                />
              );
            }
            if (current.type === "video") {
              return (
                <video
                  src={srcUrl}
                  className="w-full h-auto max-w-full object-contain"
                  playsInline
                  muted
                  loop
                  controls
                />
              );
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

export default function About() {
  const introMedia: MediaItem[] = [
    { type: "image", src: "/personal_2.jpg", alt: "Itay Kadosh - About 1" },
    { type: "image", src: "/personal_1.jpg", alt: "Itay Kadosh - About 2" },
  ];
  const researchMedia: MediaItem[] = [
    { type: "image", src: "/grad_school_1.jpg", alt: "Graduate school - Research" },
  ];
  const hobbiesMedia: MediaItem[] = [
    { type: "image", src: "/hobbies_1.jpg", alt: "Hobbies and outdoors 1" },
    { type: "image", src: "/hobbies_2.jpg", alt: "Hobbies and outdoors 2" },
  ];
  return (
    <section className="section-padding">
        <div className="container max-w-6xl">
          <h1 className="text-4xl font-bold mb-12 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            About Me
          </h1>

          {/* First Section: Photo Left, Text Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            <div className="flex justify-center animate-scaleIn" style={{ animationDelay: '200ms' }}>
              <MediaCarousel media={introMedia} />
            </div>

            <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
              <p className="text-lg leading-relaxed">
                I am a passionate robotics researcher dedicated to advancing the field through
                innovative research and practical applications. My work focuses on developing
                intelligent robotic systems that can operate autonomously in complex environments
                and interact effectively with humans.
              </p>

              <p className="text-lg leading-relaxed">
                My research interests span multiple areas of robotics, including autonomous
                navigation, robotic manipulation, perception systems, and human-robot interaction.
                I am particularly interested in how robots can learn from their environment and
                adapt their behavior to accomplish complex tasks more effectively.
              </p>
            </div>
          </div>

          {/* Outside the Lab: Text Left, Photo Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            <div className="space-y-6 order-1 lg:order-1 animate-fadeInUp" style={{ animationDelay: '500ms' }}>
              <h2 className="text-2xl font-bold">Outside the Lab</h2>
              <p className="text-lg leading-relaxed">
                When I’m not building or testing robots, I recharge by getting outdoors and exploring new hobbies.
                I enjoy hiking, photography, and tinkering with DIY electronics projects that blend creativity with hands-on engineering.
              </p>
              <p className="text-lg leading-relaxed">
                I’m also passionate about mentoring and community: sharing what I learn, collaborating on side projects, and staying curious about how technology can enrich everyday life.
              </p>
            </div>
            <div className="flex justify-center order-2 lg:order-2 animate-scaleIn" style={{ animationDelay: '550ms' }}>
              <MediaCarousel media={hobbiesMedia} />
            </div>
          </div>

          {/* Research Interests Section */}
          <div className="mb-16 p-8 bg-card border border-border rounded-lg hover:scale-[1.01] transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '650ms' }}>
            <h2 className="text-2xl font-bold mb-6">Research Interests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Core Areas</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">-</span>
                    <span>Autonomous systems and navigation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">-</span>
                    <span>Robotic manipulation and grasping</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">-</span>
                    <span>Computer vision and perception</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Advanced Topics</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">-</span>
                    <span>Machine learning for robotics</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">-</span>
                    <span>Human-robot interaction</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">-</span>
                    <span>Control systems and dynamics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Graduate School: Photo Left, Text Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            <div className="flex justify-center order-1 lg:order-1 animate-scaleIn" style={{ animationDelay: '750ms' }}>
              <MediaCarousel media={researchMedia} />
            </div>
            <div className="space-y-6 order-2 lg:order-2 animate-fadeInUp" style={{ animationDelay: '800ms' }}>
              <h2 className="text-2xl font-bold">Graduate School Goals</h2>
              <p className="text-lg leading-relaxed">
                I am currently seeking graduate school opportunities to further develop my
                research skills and contribute to the advancement of robotics technology. I am
                excited about the prospect of joining a research group where I can collaborate
                with talented researchers and work on challenging problems that push the
                boundaries of what robots can achieve.
              </p>

              <p className="text-lg leading-relaxed">
                My goal is to conduct research that bridges the gap between theoretical robotics
                and practical applications, creating systems that can make a real-world impact
                in manufacturing, healthcare, exploration, and other critical domains.
              </p>
            </div>
          </div>

          {/* Education Section */}
          <div className="p-8 bg-card border border-border rounded-lg hover:scale-[1.01] transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '900ms' }}>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_auto] gap-8 items-center">
              <div className="space-y-5">
                <h2 className="text-2xl font-bold">Education</h2>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">The University of Texas at Dallas</h3>
                  <p className="text-lg leading-relaxed">
                    Coursework and research focused on robotics, computer vision, machine learning, control systems,
                    and algorithms, building a comprehensive toolkit for applied robotics.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Collin College</h3>
                  <p className="text-lg leading-relaxed">
                    Strong foundations in computer science, mathematics, and engineering principles that shaped my
                    approach to problem solving and experimentation.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-6 items-center self-center text-right mt-2 lg:mt-4">
                <div className="flex flex-col gap-2 items-center">
                  <img
                    src="/UT_Dallas_2_Color_Emblem_-_SVG_Brand_Identity_File.svg.png"
                    alt="UTD logo"
                    className="w-24 h-24 object-contain"
                  />
                  <span className="text-sm text-muted-foreground">Jan 2024 - Jun 2026</span>
                </div>
                <div className="flex flex-col gap-2 items-center">
                  <img
                    src="/CollinCollege-logo.png"
                    alt="Collin College logo"
                    className="w-24 h-24 object-contain"
                  />
                  <span className="text-sm text-muted-foreground">Aug 2021 - Dec 2023</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
