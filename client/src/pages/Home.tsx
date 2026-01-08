import React, { Suspense, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
const LazyFetchHeroViewer = React.lazy(() => import("@/components/FetchHeroViewer"));

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

function HeroFallback() {
  return (
    <div
      className="w-full h-full rounded-2xl border border-border bg-card/60 backdrop-blur-md flex items-center justify-center text-muted-foreground"
    >
      <div className="text-center px-6">
        <div className="text-xs uppercase tracking-[0.3em]">Interactive Model</div>
        <div className="text-sm mt-2">Loading 3D viewer...</div>
      </div>
    </div>
  );
}

//
// Robot hero uses <GLBViewer/>. Provide env override via VITE_ROBOT_MODEL.
//

function MediaCarousel({ media, reduceMotion = false }: { media: MediaItem[]; reduceMotion?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const videoRefs = React.useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const slideCooldownMs = reduceMotion ? 0 : 800;
  const transitionMs = reduceMotion ? 0 : 500;
  const visibleIndices = new Set(
    reduceMotion || media.length <= 1
      ? [currentIndex]
      : [currentIndex, (currentIndex + 1) % media.length, (currentIndex - 1 + media.length) % media.length]
  );

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
    setTimeout(() => setIsSliding(false), slideCooldownMs);
  };

  const goToNextSlide = () => {
    if (isSliding) return;
    setIsSliding(true);
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % media.length);
    setTimeout(() => setIsSliding(false), slideCooldownMs);
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
          {media.map((item, index) => {
            if (!visibleIndices.has(index)) return null;
            return (
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
                transition: reduceMotion ? "none" : `transform ${transitionMs}ms ease-in-out, opacity ${transitionMs}ms ease-in-out`
              }}
            >
              {item.type === "image" && (
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
              )}
              {item.type === "gif" && (
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
              )}
              {item.type === "video" && (
                <video
                  ref={(el: HTMLVideoElement | null) => {
                    videoRefs.current[index] = el;
                  }}
                  src={item.src}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  loop
                  preload={index === currentIndex ? "metadata" : "none"}
                />
              )}
            </div>
            );
          })}
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
  const prefersReducedMotion = useReducedMotion();
  const [lowPerfMode] = useState(() => {
    const nav = navigator as any;
    const connection = nav?.connection || nav?.mozConnection || nav?.webkitConnection;
    const saveData = Boolean(connection?.saveData);
    const effectiveType = connection?.effectiveType;
    const deviceMemory = nav?.deviceMemory ?? 8;
    const cores = nav?.hardwareConcurrency ?? 8;
    return saveData || effectiveType === "2g" || effectiveType === "slow-2g" || deviceMemory <= 4 || cores <= 4;
  });
  const reduceMotion = prefersReducedMotion || lowPerfMode;
  const allowRichMotion = ANIMATION_ENABLED && !reduceMotion;
  const initialFirstVisit = !sessionStorage.getItem("heroSeen");
  const [firstVisit, setFirstVisit] = useState(initialFirstVisit); 
  const [compact, setCompact] = useState(() => (!initialFirstVisit || !allowRichMotion ? true : false)); 
  const [showLoader, setShowLoader] = useState(() => initialFirstVisit && allowRichMotion); 
  const [contentVisible, setContentVisible] = useState(() => !initialFirstVisit || !allowRichMotion); 
  const [introAnimationPlayed, setIntroAnimationPlayed] = useState(() => !initialFirstVisit || !allowRichMotion);
  const [introDone, setIntroDone] = useState(() => !initialFirstVisit || !allowRichMotion); // unlocks head tracking after intro
  const [heroVisible, setHeroVisible] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const startWaveRef = useRef<(() => void) | null>(null); 
  const shrinkDelayMs = allowRichMotion ? 1000 : 0; // extra time to keep viewport full-screen after intro
  const loaderDelayMs = allowRichMotion ? 1000 : 0;
  useEffect(() => {
    document.body.dataset.lowMotion = reduceMotion ? "true" : "false";
    return () => {
      delete document.body.dataset.lowMotion;
    };
  }, [reduceMotion]);
  const featuredUpdates: Update[] = [
    {
      date: "Featured",
      title: "ARMoR Platform Demo",
      description: "Our arm-driven mobility policy in real world deployment.",
      link: { text: "See more", href: "/publications" },
      media: [
        { type: "video", src: "/armor.mp4", alt: "ARMoR clip" },
      ],
    },
  ];
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

  const socialLinks = [
    {
      label: "Google Scholar",
      href: "https://scholar.google.com/citations?user=1ZLE5jsAAAAJ&hl=en",
      icon: (
        <img
          src="/google_scholar.svg"
          alt="Google Scholar"
          className="w-5 h-5"
          style={{ filter: "invert(1)" }}
        />
      ),
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/itay-kadosh",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5" fill="currentColor">
          <path d="M100.28 448H7.4V148.9h92.88zm-46.44-341a53.64 53.64 0 1 1 53.64-53.64 53.64 53.64 0 0 1-53.64 53.64zM447.9 448h-92.4V302.4c0-34.7-.7-79.2-48.29-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.5V148.9h88.8v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.2 61.9 111.2 142.3z" />
        </svg>
      ),
    },
    {
      label: "GitHub",
      href: "https://github.com/Optimax14",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" className="w-5 h-5" fill="currentColor">
          <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.2.3-5.5-1.3-5.5-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.5 1.3 5.5 3.6zm-31-4.4c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.5 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244 8C106.4 8 0 113.3 0 250.6c0 107.1 69.8 198 166.5 230.3 12.2 2.3 16.6-5.2 16.6-11.6 0-5.5-.3-49.9-.3-76 0 0-67.7 14.5-81.9-28.9 0 0-11-28.2-26.9-35.4 0 0-22-15 1.6-14.7 0 0 23.8 1.6 37 24.9 21 37 56.2 26.4 70 20.1 2.3-15.3 8.3-26.4 15-32.4-54-6.2-110.8-13.7-110.8-106.5 0-26.4 7.3-39.6 22.6-56.5-2.6-6.5-11-33.3 2.6-67.9 20.7-6.5 68 26.1 68 26.1 19.8-5.5 41-8.3 62.1-8.3s42.3 2.9 62.1 8.3c0 0 47.3-32.6 68-26.1 13.6 34.7 5.2 61.4 2.6 67.9 15.3 16.9 24.9 30.1 24.9 56.5 0 92.9-56.2 100-110.1 106.5 8.6 7.6 16 22.5 16 45.4 0 32.4-.3 72.5-.3 80.8 0 6.5 4.3 14.2 16.6 11.6C426.2 448.6 496 357.7 496 250.6 496 113.3 383.5 8 244 8z" />
        </svg>
      ),
    },
  ];

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
    }, loaderDelayMs);
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
    }, shrinkDelayMs); 
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

  // Hide loader once assets are fully fetched
  useEffect(() => {
    if (!showLoader) return;
    // Hide once mostly loaded (softer threshold) or after a short timeout fallback
    const ready = loadProgress >= 0.8;
    const timer = setTimeout(() => setShowLoader(false), ready ? 200 : 1800);
    return () => clearTimeout(timer);
  }, [loadProgress, showLoader]);
  return (
    <div className="min-h-screen flex flex-col">
      {showLoader && (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
          <div className="text-lg font-semibold text-neutral-800">Loading experience...</div>
        </div>
      )}
      {/* Hero Section with Photo */}
      <section className="section-padding pt-16 sm:pt-20">
        <div className="container relative">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            initial={allowRichMotion ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={allowRichMotion ? { duration: 0.5, ease: "easeOut" } : { duration: 0 }}
          >
            {/* Left: Interactive Robot Model */} 
            <motion.div 
              className="relative flex justify-center lg:justify-end -mt-2" 
              ref={heroRef}
              initial={allowRichMotion ? { opacity: 0, y: 12 } : false} 
              animate={{ opacity: 1, y: 0 }} 
              transition={allowRichMotion ? { duration: 0.5, ease: "easeOut", delay: 0.05 } : { duration: 0 }} 
            > 
              <motion.div  
                className="w-full hero-frame"  
                initial={ 
                  allowRichMotion && firstVisit 
                    ? { scale: 1, width: "100%", height: "100vh", position: "fixed", top: 0, left: 0, zIndex: 40, opacity: 0, y: 12 } 
                    : { scale: 1, width: "100%", height: "48rem", position: "relative", top: 0, left: 0, zIndex: 1, marginTop: "-2rem", opacity: 1, y: 0 }
                }
                animate={
                  compact
                    ? { scale: 1, width: "100%", height: "48rem", position: "relative", top: 0, left: 0, zIndex: 1, marginTop: "-2rem", opacity: 1, y: 0 }
                    : { scale: 1, width: "100%", height: "100vh", position: "fixed", top: 0, left: 0, zIndex: 40, marginTop: "0rem", opacity: 1, y: 0 }
                }
                  transition={allowRichMotion ? { type: "spring", stiffness: 50, damping: 18, opacity: { duration: 0.4 }, y: { duration: 0.4 } } : { duration: 0 }} 
              > 
                {heroVisible && (
                  reduceMotion ? (
                    <HeroFallback />
                  ) : (
                    <Suspense fallback={<HeroFallback />}>
                      <LazyFetchHeroViewer 
                        onLoaded={handleLoaded} 
                        onStartReady={handleStartReady} 
                        onWaveComplete={handleWaveComplete} 
                        enableInteraction={!firstVisit ? true : introDone} 
                        enableIntroAnimation={firstVisit && !introAnimationPlayed && allowRichMotion}
                        performanceMode="high"
                        onProgress={(p) => setLoadProgress(p)}
                      />
                    </Suspense>
                  )
                )}
              </motion.div> 
            </motion.div> 

            {/* Right: Text Content (first visit shows after shrink) */}
            {contentVisible && (
            <motion.div
            className="space-y-6 -mt-4"
                initial={allowRichMotion ? { opacity: 0, y: 12 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={allowRichMotion ? { duration: 0.5, ease: "easeOut", delay: 0.1 } : { duration: 0 }}
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

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/20 bg-background/30 backdrop-blur-md text-foreground hover:bg-background/60 transition-colors"
                    >
                      {social.icon}
                      <span className="text-sm font-medium">{social.label}</span>
                    </a>
                  ))}
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
        <section className="section-padding bg-card/15 backdrop-blur-md">
          <div className="container max-w-5xl">
              <h2 className="text-3xl font-bold mb-8">Recent Updates</h2>
              {/* Featured updates */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  Featured
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-foreground text-background">Featured</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredUpdates.map((update, idx) => (
                    <div
                      key={`featured-${idx}`}
                      className="border border-border rounded-lg bg-card/85 backdrop-blur-md hover:bg-card transition-all duration-300 transform hover:scale-[1.02] overflow-hidden flex flex-col"
                    >
                      <div className="aspect-[4/3] w-full">
                        <MediaCarousel media={update.media} reduceMotion={reduceMotion} />
                      </div>
                      <div className="p-4 flex flex-col flex-1 relative">
                        <span className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full bg-foreground text-background">Featured</span>
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

              {/* By-year updates */}
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
                          className="border border-border rounded-lg bg-card/85 backdrop-blur-md hover:bg-card transition-all duration-300 transform hover:scale-[1.02] overflow-hidden flex flex-col"
                        >
                          <div className="aspect-[4/3] w-full">
                            <MediaCarousel media={update.media} reduceMotion={reduceMotion} />
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
