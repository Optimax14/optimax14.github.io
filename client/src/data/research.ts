// Content checked 2026-10-30. See PORTFOLIO_CHANGELOG.md for provenance.
export enum PublicationStatus {
  Accepted = "Accepted",
  Submitted = "Submitted",
  Presented = "Presented",
}
export type ResearchLink = { label: string; href: string };
export type ResearchRecord = {
  slug: string;
  shortTitle: string;
  title: string;
  authors: { name: string; equal?: boolean }[];
  status: PublicationStatus;
  venue: string;
  year: number;
  summary: string;
  detail?: string;
  contribution?: string;
  links: ResearchLink[];
  media?: {
    src: string;
    alt: string;
    caption: string;
    source?: ResearchLink;
    video?: string;
    width?: number;
    height?: number;
  };
  featured?: boolean;
  detailPath?: string;
  lastVerified: string;
  verificationNote?: string;
};
const authors = (...names: string[]) => names.map(name => ({ name }));
export const asset = (path: string) =>
  import.meta.env.BASE_URL + path.replace(/^\/+/, "");
export const profile = {
  name: "Itay Kadosh",
  role: "Ph.D. Student · University of Florida",
  heroIntro: [
    "I’m a Ph.D. student in Mechanical and Aerospace Engineering at the University of Florida, advised by Prof. James P. Fairbanks in the GATAS Lab. My research focuses on sparse numerical algorithms, GPU computing, graph algorithms, and robotic perception. I also work on rigorous evaluation of AI in scientific and embodied settings.",
  ],
  tagline:
    "Numerical algorithms, high-performance scientific computing, AI, and robotics.",
  intro:
    "I am a Ph.D. student in Mechanical and Aerospace Engineering at the University of Florida, advised by Prof. James P. Fairbanks in the GATAS Lab. I develop efficient algorithms for structured computational problems, spanning sparse numerical linear algebra, GPU computing, graph algorithms, and intelligent robotic systems. I also work on rigorous evaluation of AI models in scientific and embodied settings.",
  email: "itaykadosh@ufl.edu",
  links: [
    { label: "GitHub", href: "https://github.com/Optimax14" },
    {
      label: "Google Scholar",
      href: "https://scholar.google.com/citations?user=1ZLE5jsAAAAJ&hl=en",
    },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/itay-kadosh/" },
  ] satisfies ResearchLink[],
};
export const cv = {
  currentAvailable: false,
  archivedDate: "December 2025",
  notice:
    "An updated research CV is pending. The available PDF is the December 2025 archive and predates my UF Ph.D. and current research. Please email me for a current CV.",
};
export const rpxFacts = {
  scenes: 100,
  objects: 70,
  frames: 133121,
  models: 49,
  evaluations: 65,
  phases: 3,
};
export const research: ResearchRecord[] = [
  {
    slug: "pathpack",
    shortTitle: "PATHPACK.jl",
    title: "Direct Solution of Algebraic Path Problems",
    authors: authors("Richard Samuelson", "Itay Kadosh", "James P. Fairbanks"),
    status: PublicationStatus.Submitted,
    venue: "Research manuscript",
    year: 2026,
    summary:
      "Semiring-based sparse algebraic path algorithms unify shortest paths, widest paths, and reachability, with open-source Julia implementations for CPUs and NVIDIA GPUs.",
    detail:
      "PATHPACK.jl is the accompanying software for this manuscript. Its documentation includes algorithms, examples, and the CPU and GPU interfaces.",
    links: [
      { label: "Code", href: "https://github.com/AlgebraicJulia/PATHPACK.jl" },
      {
        label: "Docs",
        href: "https://algebraicjulia.github.io/PATHPACK.jl/dev/how-it-works",
      },
    ],
    media: {
      src: "research/pathpack-project.webp",
      width: 1600,
      height: 850,
      alt: "The public PATHPACK explainer showing an illustrative graph and its reordered sparse matrix",
      caption: "Illustrative graph ordering and sparse matrix structure",
      source: {
        label: "PATHPACK.jl documentation",
        href: "https://algebraicjulia.github.io/PATHPACK.jl/dev/",
      },
    },
    featured: true,
    lastVerified: "2026-10-30",
    verificationNote:
      "Author order and submission supplied by Itay. No private manuscript or benchmark material distributed.",
  },
  {
    slug: "autox-semmap",
    shortTitle: "Build Once, Monitor Continuously",
    title:
      "Build Once, Monitor Continuously: Persistent Semantic Mapping via Autonomous Exploration and Open-Vocabulary Object Updates",
    authors: authors(
      "Sai Haneesh Allu",
      "Itay Kadosh",
      "Tyler Summers",
      "Yu Xiang"
    ),
    status: PublicationStatus.Accepted,
    venue: "IROS 2026 WORLDS Workshop",
    year: 2026,
    summary:
      "A Fetch robot builds a geometric map once, then updates an open-vocabulary semantic object graph across revisits as objects move, appear, or disappear.",
    contribution:
      "My contributions include the RGB-D open-vocabulary perception pipeline and semantic object association and update logic.",
    links: [
      { label: "Paper", href: "https://arxiv.org/abs/2409.15493" },
      { label: "Code", href: "https://github.com/IRVLUTD/AutoX-SemMap" },
      {
        label: "Project & demos",
        href: "https://irvlutd.github.io/SemanticMapping/",
      },
    ],
    media: {
      src: "media/autox.webp",
      width: 1000,
      height: 668,
      alt: "AutoX-SemMap overview showing Fetch robot mapping and semantic object updates",
      caption: "Persistent semantic mapping system",
      source: {
        label: "AutoX-SemMap team",
        href: "https://irvlutd.github.io/SemanticMapping/",
      },
    },
    featured: true,
    lastVerified: "2026-10-30",
    verificationNote:
      "Title and authors: arXiv v4. Workshop acceptance supplied by Itay, not IROS main track.",
  },
  {
    slug: "rpx",
    detailPath: "/research/rpx",
    shortTitle: "Same Scene, Different Story · RPX",
    title:
      "Same Scene, Different Story: Evaluating Robot Perception Across Scene Phases in the Wild",
    authors: [
      { name: "Jishnu Jaykumar P", equal: true },
      { name: "Itay Kadosh", equal: true },
      { name: "Narendhiran Vijayakumar", equal: true },
      ...authors(
        "Srinanditha Kamath",
        "Sai Haneesh Allu",
        "Govind Tyagi Rangappa",
        "Animesh Maheshwari",
        "Jikai Wang",
        "Yu Xiang"
      ),
    ],
    status: PublicationStatus.Submitted,
    venue: "ICRA 2027",
    year: 2026,
    summary: `A real-world perception benchmark across scene changes: ${rpxFacts.scenes} scenes, ${rpxFacts.objects} objects, and ${rpxFacts.frames.toLocaleString("en-US")} frames, with ${rpxFacts.models} models tested in ${rpxFacts.evaluations} model–task evaluations.`,
    detail:
      "Six tasks cover image depth, video depth, object tracking, relative camera pose, general VQA, and in-context VQA. The dataset includes over 5.2 million VQA question records.",
    links: [
      { label: "Dataset", href: "https://huggingface.co/datasets/IRVLUTD/RPX" },
      { label: "Code", href: "https://github.com/IRVLUTD/RPX" },
      { label: "Project", href: "https://irvlutd.github.io/RPX/" },
    ],
    media: {
      src: "research/rpx/card-poster.webp",
      video: "research/rpx/showcase.mp4",
      width: 640,
      height: 240,
      alt: "Paused frame from the official RPX dataset showcase",
      caption: "Official RPX dataset showcase",
      source: {
        label: "RPX authors · CC BY 4.0",
        href: "https://huggingface.co/datasets/IRVLUTD/RPX",
      },
    },
    featured: true,
    lastVerified: "2026-10-30",
    verificationNote:
      "Nine authors and three equal-contribution marks from public README and CITATION.cff. Submission supplied by Itay. No download count claimed.",
  },
  {
    slug: "intelx",
    shortTitle: "IntelX",
    title:
      "IntelX: Autonomous Indoor Exploration via Local Coverage Gain Prediction and Structure-Aware Planning",
    authors: authors("Saurav Dosi", "Itay Kadosh", "Yu Xiang"),
    status: PublicationStatus.Submitted,
    venue: "ICRA 2027",
    year: 2026,
    summary:
      "A U-Net predicts local coverage gain from partial maps, guiding memory- and structure-aware planning for efficient indoor robot exploration.",
    detail:
      "The public implementation connects coverage-gain heatmaps to candidate exploration directions, junction-aware planning, and frontier fallbacks.",
    links: [
      { label: "Code", href: "https://github.com/IRVLUTD/IntelX" },
      { label: "Project & demo", href: "https://irvlutd.github.io/IntelX/" },
    ],
    media: {
      src: "research/intelx-predictions.webp",
      width: 1030,
      height: 612,
      alt: "Official IntelX coverage-gain targets and predictions, with a direction-ranking failure case",
      caption:
        "Coverage-gain targets and predictions, including a failure case",
      source: {
        label: "IntelX team",
        href: "https://irvlutd.github.io/IntelX/",
      },
    },
    featured: true,
    lastVerified: "2026-10-30",
    verificationNote:
      "Title, authors and U-Net method: official repository. Submission supplied by Itay.",
  },
  {
    slug: "cellular-sheaves",
    shortTitle: "Coordination on Cellular Sheaves",
    title:
      "A Layered Control Architecture for Multi-Agent Coordination on Cellular Sheaves with a Conic Constrained Harmonic Extension",
    authors: authors("Itay Kadosh", "Richard Samuelson", "James P. Fairbanks"),
    status: PublicationStatus.Submitted,
    venue: "ACC 2027 cycle",
    year: 2026,
    summary:
      "A layered approach to multi-agent coordination using cellular sheaves and constrained harmonic extension. CellularSheaves.jl provides companion software.",
    links: [
      {
        label: "Companion code",
        href: "https://github.com/AlgebraicJulia/CellularSheaves.jl",
      },
    ],
    media: {
      src: "media/sheaves.webp",
      width: 1000,
      height: 759,
      alt: "Layered cellular-sheaf architecture with coordination, reference filtering, and agent execution",
      caption: "Coordination through mathematical structure",
    },
    lastVerified: "2026-10-30",
    verificationNote:
      "ACC-cycle submission supplied by Itay. Current review status unconfirmed; no L-CSS review claim.",
  },
  {
    slug: "mental-fatigue",
    shortTitle: "Mental Fatigue and Task Rotations",
    title:
      "Measuring the Effects of Mental Fatigue on Worker Performance Through Task Rotations",
    authors: authors(
      "Shirin Ghasemi",
      "Tuğçe Işık",
      "David Neyens",
      "Toni Dismuke",
      "Itay Kadosh",
      "Emily Yuan"
    ),
    status: PublicationStatus.Presented,
    venue: "IISE Annual Conference & Expo",
    year: 2026,
    summary:
      "An experimental study of how task rotation and cognitive workload affect mental fatigue, worker errors, and task completion times.",
    links: [],
    lastVerified: "2026-10-30",
    verificationNote:
      "Presentation: Shirin Ghasemi public report. Author order supplied by Itay. Proceedings publication unconfirmed.",
  },
];
export const themes = [
  {
    title: "Sparse and GPU algorithms",
    text: "Sparse linear algebra, algebraic path problems, and parallel numerical methods that use computational structure efficiently.",
  },
  {
    title: "Mathematical and combinatorial computation",
    text: "Graph algorithms, elimination orderings, and structured mathematical representations for scientific problems.",
  },
  {
    title: "AI and embodied systems",
    text: "Robot perception, exploration, and rigorous evaluation of AI in scientific and embodied settings.",
  },
];
export const ongoing = [
  "GPU-accelerated tensor-network contraction for quantum circuit simulation.",
  "Dynamic sparse Cholesky factorization on GPUs.",
  "GPU nested dissection with minimum-fill ordering for leaf problems.",
  "Minimum-degree ordering complexity analysis: proposed O(mn) time and linear space; proof in progress.",
  "GPU-accelerated C-set homomorphism search for typed structured graphs.",
];
export const updates = [
  {
    label: "2026 · Workshop acceptance",
    text: "Build Once, Monitor Continuously accepted at the IROS 2026 WORLDS Workshop.",
    slug: "autox-semmap",
  },
  {
    label: "2026 · Open software",
    text: "PATHPACK.jl is public, with CPU and NVIDIA GPU algorithms and documentation.",
    slug: "pathpack",
  },
  {
    label: "2026 · Benchmark release",
    text: "RPX data and evaluation tools are available on Hugging Face and GitHub.",
    slug: "rpx",
  },
];

export const software = [
  {
    slug: "pathpack",
    name: "PATHPACK.jl",
    manuscriptSlug: "pathpack",
    language: "Julia",
    platform: "CPU / NVIDIA GPU",
    summary:
      "Sparse algebraic path algorithms expressed through semiring linear algebra.",
    method:
      "Algorithms for shortest paths, widest paths, reachability, and related graph problems, with CPU and NVIDIA GPU implementations.",
    links: [
      {
        label: "Repository",
        href: "https://github.com/AlgebraicJulia/PATHPACK.jl",
      },
      {
        label: "Documentation & interactive examples",
        href: "https://algebraicjulia.github.io/PATHPACK.jl/dev/",
      },
    ],
  },
  {
    slug: "cellular-sheaves",
    name: "CellularSheaves.jl",
    manuscriptSlug: "cellular-sheaves",
    language: "Julia",
    platform: "Sparse mathematical computation",
    summary:
      "A library for constructing and computing with cellular sheaves and sheaf Laplacians.",
    method:
      "Supports global sections, harmonic extension, and sheaf-based formulations of dynamical systems and coordination problems.",
    links: [
      {
        label: "Repository",
        href: "https://github.com/AlgebraicJulia/CellularSheaves.jl",
      },
      {
        label: "Documentation",
        href: "https://algebraicjulia.github.io/CellularSheaves.jl/",
      },
    ],
  },
];
