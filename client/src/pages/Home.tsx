import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
const FetchHeroViewer = lazy(() => import("@/components/FetchHeroViewer"));

interface MediaItem {
  type: "image" | "video" | "gif";
  src: string;
  alt: string;
}

interface Update {
  date: string;
  title: string;
  description: string;
  link: {
    text: string;
    href: string;
  };
  media: MediaItem[];
}

//
// Robot hero uses <GLBViewer/>. Provide env override via VITE_ROBOT_MODEL.
//

function MediaCarousel({ media }: { media: MediaItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const videoRefs = React.useRef<{ [key: number]: HTMLVideoElement | null }>({});

  useEffect(() => {
    Object.values(videoRefs.current).forEach(video => {
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

  if (!media || media.length === 0) {
    return null;
  }

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
              {item.type === "image" && (
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
              {item.type === "gif" && (
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
              {item.type === "video" && (
                <video
                  ref={(el: HTMLVideoElement | null) => {
                    if (el) videoRefs.current[index] = el;
                  }}
                  src={item.src}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  loop
                  preload="auto"
                />
              )}
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

export default function Home() { 
  const ANIMATION_ENABLED = true; // toggle to re-enable hero animation in dev
  const initialFirstVisit = !sessionStorage.getItem("heroSeen");
  const [firstVisit, setFirstVisit] = useState(initialFirstVisit); 
  const [compact, setCompact] = useState(() => (!initialFirstVisit ? true : false)); 
  const [showLoader, setShowLoader] = useState(() => initialFirstVisit); 
  const [contentVisible, setContentVisible] = useState(() => !initialFirstVisit); 
  const [introAnimationPlayed, setIntroAnimationPlayed] = useState(() => !initialFirstVisit);
  const [introDone, setIntroDone] = useState(() => !initialFirstVisit); // unlocks head tracking after intro
  const [heroVisible, setHeroVisible] = useState(false);
  const startWaveRef = useRef<(() => void) | null>(null); 
  const SHRINK_DELAY_MS = 1000; // extra time to keep viewport full-screen after intro
  const updatesByYear: Record<string, Update[]> = {
    "2026": [
      {
        date: "November 2026",
        title: "Perception + Planning Demo",
        description: "A focused showcase page for the latest on-device perception and planning demo.",
        link: { text: "Read More", href: "/updates/nova" },
        media: [
          { type: "image", src: "/about-photo-1.jpg", alt: "Perception and planning" },
          { type: "gif", src: "/Wow.gif", alt: "Demo clip" },
        ],
      },
    ],
    "2025": [
      {
        date: "October 2025",
        title: "New Publication at ICRA",
        description: "Our paper on efficient path planning for mobile robots has been accepted at ICRA 2026.",
        link: { text: "Read More", href: "/publications" },
        media: [
          { type: "image", src: "/about-photo-1.jpg", alt: "Path planning visualization" },
          { type: "gif", src: "/Wow.gif", alt: "Robot navigation animation" },
        ],
      },
      {
        date: "September 2025",
        title: "Human-Robot Collaboration",
        description: "Achieved significant milestones in adaptive control strategies for robot-human interaction.",
        link: { text: "Read More", href: "/experience" },
        media: [
          { type: "image", src: "/about-photo-1.jpg", alt: "Research progress" },
          { type: "gif", src: "/Wow.gif", alt: "Robot demonstration" },
        ],
      },
      {
        date: "August 2025",
        title: "Graduate Applications",
        description: "Preparing applications for top robotics programs, focusing on autonomous systems research.",
        link: { text: "Read More", href: "/about" },
        media: [
          { type: "image", src: "/about-photo-1.jpg", alt: "Graduate research" },
          { type: "gif", src: "/Wow.gif", alt: "Research presentation" },
        ],
      },
    ],
    "2024": [
      {
        date: "November 2024",
        title: "Perception + Planning Demo",
        description: "A focused showcase page for the latest on-device perception and planning demo.",
        link: { text: "Read More", href: "/updates/nova" },
        media: [
          { type: "image", src: "/about-photo-1.jpg", alt: "Perception and planning" },
          { type: "gif", src: "/Wow.gif", alt: "Demo clip" },
        ],
      },
    ],
  };

  // First visit: loader -> full screen -> wave -> shrink -> show content 
  const handleLoaded = () => { 
    if (!firstVisit) { 
      setShowLoader(false); 
      setCompact(true);
      setContentVisible(true);
      setIntroDone(true);
      setIntroAnimationPlayed(true);
      return;
    }
    setTimeout(() => {
      setShowLoader(false);
      // start wave once ready
      startWaveRef.current?.();
    }, 1000);
  };

  const handleStartReady = (fn: () => void) => {
    startWaveRef.current = fn; 
  }; 

  const handleWaveComplete = () => { 
    // Allow interaction/head tracking as soon as intro animation finishes
    setIntroDone(true);
    setIntroAnimationPlayed(true);
    // On repeat visits, no animation/loader path; just ensure content is visible
    if (!firstVisit) { 
      setCompact(true); 
      setContentVisible(true); 
      return; 
    } 
    // First visit: wait for animation buffer, then shrink and mark as seen 
    setTimeout(() => { 
      setCompact(true); 
      setContentVisible(true); 
      setFirstVisit(false); 
      sessionStorage.setItem("heroSeen", "1"); 
    }, SHRINK_DELAY_MS); 
  }; 

  // Lazy-mount hero viewer when in viewport to cut initial LCP
  const heroRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHeroVisible(true);
            observer.disconnect();
          }
        });
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );
    if (heroRef.current) {
      observer.observe(heroRef.current);
    } else {
      setHeroVisible(true);
    }
    return () => observer.disconnect();
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      {showLoader && (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
          <div className="text-lg font-semibold text-foreground">Loading experience...</div>
        </div>
      )}
      {/* Hero Section with Photo */}
      <section className="section-padding pt-16 sm:pt-20">
        <div className="container relative">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Left: Interactive Robot Model */} 
            <motion.div 
              className="relative flex justify-center lg:justify-end -mt-2" 
              ref={heroRef}
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }} 
            > 
              <motion.div  
                className="w-full hero-frame"  
                initial={ 
                  firstVisit 
                    ? { scale: 1, width: "100%", height: "100vh", position: "fixed", top: 0, left: 0, zIndex: 40, opacity: 0, y: 12 } 
                    : { scale: 1, width: "100%", height: "48rem", position: "relative", top: 0, left: 0, zIndex: 1, marginTop: "-2rem", opacity: 1, y: 0 }
                }
                animate={
                  compact
                    ? { scale: 1, width: "100%", height: "48rem", position: "relative", top: 0, left: 0, zIndex: 1, marginTop: "-2rem", opacity: 1, y: 0 }
                    : { scale: 1, width: "100%", height: "100vh", position: "fixed", top: 0, left: 0, zIndex: 40, marginTop: "0rem", opacity: 1, y: 0 }
                }
                  transition={{ type: "spring", stiffness: 50, damping: 18, opacity: { duration: 0.4 }, y: { duration: 0.4 } }} 
              > 
                <Suspense fallback={<div className="w-full h-[48rem] bg-muted/30 animate-pulse rounded-lg" />}>
                  {heroVisible && (
                    <FetchHeroViewer 
                      onLoaded={handleLoaded} 
                      onStartReady={handleStartReady} 
                      onWaveComplete={handleWaveComplete} 
                      enableInteraction={!firstVisit ? true : introDone} 
                      enableIntroAnimation={firstVisit && !introAnimationPlayed && ANIMATION_ENABLED}
                    />
                  )}
                </Suspense>
              </motion.div> 
            </motion.div> 

            {/* Right: Text Content (first visit shows after shrink) */}
            {contentVisible && (
              <motion.div
              className="space-y-6 -mt-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              >
                <div>
                  <h1 className="text-5xl sm:text-6xl font-bold mb-4">Itay Kadosh</h1>
                  <p className="text-2xl text-muted-foreground font-light">Robotics Researcher - CS & Math at UTD</p>
                </div>

                <div>
                  <p className="text-lg text-foreground leading-relaxed">
                    Passionate about advancing general purpose robotics through research and development. My research focuses on developing efficient and effective algorithms for robot perception and planning, with a particular emphasis on real-time applications.
                  </p>
                </div>

                <div>
                  <p className="text-lg text-foreground leading-relaxed">
                    Welcome to my personal website. Here you'll find my research, publications, experience, academic background, general updates, and fun things I wanted to share.
                    
                    <br /><br />
                    Currently a senior at the University of Texas at Dallas, pursuing a double degree in Computer Science and Mathematics.
                    I'm seeking opportunities to join a lab as a PhD student at the moment, for all inquires please email <a href="mailto:ixk230032@utdallas.edu" className="text-blue-500 hover:underline">ixk230032@utdallas.edu</a>
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/about">
                    <Button variant="default" className="bg-foreground text-background hover:bg-muted-foreground transform hover:scale-105 transition-all duration-300">
                      Learn More About Me
                    </Button>
                  </Link>
                  <Link href="/publications">
                    <Button variant="outline" className="border-foreground text-foreground hover:bg-card transform hover:scale-105 transition-all duration-300">
                      View My Work
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

             {/* Recent Updates Section - grouped by year */}
      {contentVisible && (
        <section className="section-padding bg-card">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-bold mb-8">Recent Updates</h2>
            <div className="space-y-10">
              {Object.entries(updatesByYear)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([year, items]) => (
                  <div key={year} className="space-y-4">
                    <h3 className="text-2xl font-semibold">{year}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((update, idx) => (
                        <div
                          key={`${year}-${idx}`}
                          className="border border-border rounded-lg bg-background/50 hover:bg-background transition-all duration-300 transform hover:scale-[1.02] overflow-hidden flex flex-col"
                        >
                          <div className="aspect-[4/3] w-full">
                            <MediaCarousel media={update.media} />
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <span className="text-sm font-medium text-muted-foreground">{update.date}</span>
                            <h4 className="text-lg font-semibold mt-1 mb-2">{update.title}</h4>
                            <p className="text-sm text-muted-foreground mb-4 flex-1">{update.description}</p>
                            <Link href={update.link.href} className="self-start">
                              <Button variant="outline" size="sm">{update.link.text}</Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
