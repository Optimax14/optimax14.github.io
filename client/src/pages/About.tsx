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
                <div className="w-full h-full rounded-xl border border-white/20 bg-background/20 p-2.5">
                  <img
                    src={srcUrl}
                    alt={current.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto max-w-full object-contain"
                  />
                </div>
              );
            }
            if (current.type === "video") {
              return (
                <div className="w-full h-full rounded-xl border border-white/20 bg-background/20 p-1.5">
                  <video
                    src={srcUrl}
                    className="w-full h-auto max-w-full object-contain"
                    playsInline
                    muted
                    loop
                    controls
                  />
                </div>
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
                I am a Computer Science and Mathematics student at The University of Texas at Dallas, with a strong passion for robotics and
                autonomous systems. My journey into robotics began early into my undergraduate, where I was captivated by the
                potential of machines to perceive, learn, and interact with the world around them.
              </p>

              <p className="text-lg leading-relaxed">
                My research interests revolve around developing general purpose robotic systems that can operate effectively in unstructured, unseen environments. 
                I am interested in creating systems that are rigorously grounded in theory, yet practical and robust enough for real-world applications. 
                My goal is to bring in my background in mathematics to create concrete systems that push the boundaries of what robots can achieve.
              </p>
            </div>
          </div>

          {/* Outside the Lab: Text Left, Photo Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            <div className="space-y-6 order-1 lg:order-1 animate-fadeInUp" style={{ animationDelay: '500ms' }}>
              <h2 className="text-2xl font-bold">Outside the Lab</h2>
              <p className="text-lg leading-relaxed">
                When I'm not working on research or studying, I like to spend my time in nature. Hiking, camping, and exploring the outdoors help me recharge and find inspiration for my work.
              </p>
              <p className="text-lg leading-relaxed">
                I have recently taken up skiing as an annual winter hobby, having already skied in Angel Fire, New Mexico and Wolf Creek, Colorado. I look forward to exploring more ski resorts in the future!
              </p>
              <p className="text-lg leading-relaxed">
                To complement my studies, I have been involved in private teaching for the past four years, helping elementary, middle, high school, as well as college students excel in subjects such as mathematics, physics, and computer science. Teaching has been a rewarding experience that has enhanced my communication skills and deepened my understanding of these subjects.
              </p>
              <p className="text-lg leading-relaxed">
                Working with and helping others has always been a fulfilling part of my life, and I look forward to continuing this journey alongside my graduate studies!
              </p>
            </div>
            <div className="flex justify-center order-2 lg:order-2 animate-scaleIn" style={{ animationDelay: '550ms' }}>
              <MediaCarousel media={hobbiesMedia} />
            </div>
          </div>

          {/* Research Interests Section */}
          <div className="mb-16 p-6 border border-white/20 rounded-md bg-background/30 backdrop-blur-xl backdrop-saturate-150 shadow-[0_14px_40px_rgba(0,0,0,0.22)] transform hover:scale-[1.01] transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '650ms' }}>
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
                    <span>Computer vision and robotic perception</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Advanced Topics</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">-</span>
                    <span>Machine learning and Control theory for robotics</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">-</span>
                    <span>Partial Differential Equations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">-</span>
                    <span>Geometric Deep Learning - Equivarient CNNs</span>
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
                In graduate school, I hope to work on furthering reasoning capabilities for Vision Language Action models (VLAs) in robotics, as well as exploring novel approaches to robot learning and adaptation in complex environments.
              </p>

              <p className="text-lg leading-relaxed">
                I am to enroll in a PhD program in Computer Science or Robotics starting Fall 2026. If you are interested in discussing potential research opportunities or collaborations, please feel free to reach out to me!
              </p>
            </div>
          </div>

          {/* Education Section */}
          <div className="p-6 border border-white/20 rounded-md bg-background/30 backdrop-blur-xl backdrop-saturate-150 shadow-[0_14px_40px_rgba(0,0,0,0.22)] transform hover:scale-[1.01] transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '900ms' }}>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_auto] gap-8 items-center">
              <div className="space-y-5">
                <h2 className="text-2xl font-bold">Education</h2>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">The University of Texas at Dallas</h3>
                  <p className="text-lg leading-relaxed">
                    Currently pursuing a double Bachelor of Science (BS) degree in Computer Science and Mathematics with a focus on machine learning and robotics. Additionally part of
                    the Fast Track program, where I take graduate coursework in Computer science and Mathematics.                    
                  </p>
                  <p className="text-lg leading-relaxed">
                    For more information, see my CV or contact me directly, I am happy to share my transcript.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Collin College</h3>
                  <p className="text-lg leading-relaxed">
                    Finished an Associates of Science (AAS) degree with a focus on foundational computer science and mathematics courses.
                    
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
                  <span className="text-sm text-muted-foreground">Jun 2023 - Dec 2023</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
