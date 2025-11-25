export default function About() {
  return (
    <section className="section-padding">
        <div className="container max-w-5xl">
          <h1 className="text-4xl font-bold mb-12 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            About Me
          </h1>

          {/* First Section: Photo Left, Text Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            <div className="flex justify-center animate-scaleIn" style={{ animationDelay: '200ms' }}>
              <div className="w-full max-w-md aspect-square bg-muted rounded-lg overflow-hidden border border-border shadow-sm hover:scale-[1.02] transition-all duration-300">
                <img
                  src="/about-photo-1.jpg"
                  alt="Itay Kadosh - About"
                  className="w-full h-full object-cover"
                />
              </div>
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

          {/* Research Interests Section */}
          <div className="mb-16 p-8 bg-card border border-border rounded-lg hover:scale-[1.01] transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
            <h2 className="text-2xl font-bold mb-6">Research Interests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Core Areas</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">•</span>
                    <span>Autonomous systems and navigation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">•</span>
                    <span>Robotic manipulation and grasping</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">•</span>
                    <span>Computer vision and perception</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Advanced Topics</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">•</span>
                    <span>Machine learning for robotics</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">•</span>
                    <span>Human-robot interaction</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">•</span>
                    <span>Control systems and dynamics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Second Section: Text Left, Photo Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            <div className="space-y-6 order-2 lg:order-1 animate-fadeInUp" style={{ animationDelay: '500ms' }}>
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

            <div className="flex justify-center order-1 lg:order-2 animate-scaleIn" style={{ animationDelay: '600ms' }}>
              <div className="w-full max-w-md aspect-square bg-muted rounded-lg overflow-hidden border border-border shadow-sm hover:scale-[1.02] transition-all duration-300">
                <img
                  src="/about-photo-1.jpg"
                  alt="Itay Kadosh - Research"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div className="p-8 bg-card border border-border rounded-lg hover:scale-[1.01] transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '700ms' }}>
            <h2 className="text-2xl font-bold mb-6">Education</h2>
            <p className="text-lg leading-relaxed mb-4">
              I hold a strong foundation in computer science, mathematics, and engineering
              principles. My academic background has equipped me with the theoretical knowledge
              and practical skills necessary to conduct cutting-edge robotics research.
            </p>
            <p className="text-lg leading-relaxed">
              Through coursework in robotics, computer vision, machine learning, control systems,
              and algorithms, I have developed a comprehensive understanding of the field and
              am prepared to tackle complex research challenges.
            </p>
          </div>
        </div>
      </section>
  );
}
