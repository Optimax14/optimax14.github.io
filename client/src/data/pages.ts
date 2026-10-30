export const origin = "https://optimax14.github.io";
export const pages: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Itay Kadosh · Algorithms, scientific computing & robotics",
    description:
      "Itay Kadosh is a Ph.D. researcher at the University of Florida working on numerical algorithms, GPU scientific computing, graph algorithms, AI, and robotics.",
  },
  "/research": {
    title: "Research & software · Itay Kadosh",
    description:
      "PATHPACK.jl, AutoX-SemMap, RPX, IntelX, cellular sheaves, and ongoing research in GPU and combinatorial algorithms.",
  },
  "/research/rpx": {
    title: "RPX · Same Scene, Different Story · Itay Kadosh",
    description:
      "A real-world robot-perception benchmark: scene phases, official showcase, accuracy and robustness findings, and task-specific evaluation tools.",
  },
  "/publications": {
    title: "Publications · Itay Kadosh",
    description:
      "Papers and presentations with precise workshop acceptance and submission statuses, ordered authors, code, datasets, and project links.",
  },
  "/software": {
    title: "Research software · Itay Kadosh",
    description:
      "PATHPACK.jl and CellularSheaves.jl: open-source Julia implementations connected to research in algebraic paths and cellular sheaves.",
  },
  "/about": {
    title: "About & experience · Itay Kadosh",
    description:
      "Research at UF GATAS, prior robotics work at UT Dallas IRVL, Clemson H-CORE REU, and independent scientific AI evaluation.",
  },
  "/experience": {
    title: "Experience · Itay Kadosh",
    description:
      "Research experience in scientific computing, robotics, and scientific AI evaluation.",
  },
  "/cv": {
    title: "Curriculum vitae · Itay Kadosh",
    description:
      "Request Itay Kadosh’s current research CV or download the clearly dated December 2025 archived PDF.",
  },
};
export const legacyPaths = [
  "/updates/aurora",
  "/updates/zephyr",
  "/updates/solstice",
  "/updates/nova",
  "/updates/autox-semmap",
];
export function pageMetadata(path: string) {
  return (
    pages[path] ?? {
      title: "Research updates · Itay Kadosh",
      description: pages["/research"].description,
    }
  );
}
