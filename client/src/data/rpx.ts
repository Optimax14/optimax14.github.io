import { rpxFacts } from "./research";
// Public RPX documentation and dataset card, verified 2026-10-30.
// Source hashes and transformations: /research/rpx/media-attribution.json.
export const rpx = {
  stats: [
    { value: String(rpxFacts.scenes), label: "real scenes" },
    { value: rpxFacts.phases + " + ego", label: "phases and view" },
    { value: String(rpxFacts.objects), label: "single objects" },
    {
      value: rpxFacts.models + " / " + rpxFacts.evaluations,
      label: "models / model–task evaluations",
    },
  ],
  overview: {
    src: "research/rpx/overview.webp",
    full: "research/rpx/overview-full.webp",
    alt: "Official RPX overview: capture phases, 70 objects, released sensor modalities, and six evaluation tasks.",
  },
  findings: {
    src: "research/rpx/findings.webp",
    alt: "Official RPX results: mean quality by scene phase and 65 evaluations plotted by worst-phase quality and phase robustness.",
  },
  workflow: {
    src: "research/rpx/toolkit-overview.svg",
    alt: "RPX toolkit workflow connecting captured data, task-specific model adapters, evaluators, metrics, and robustness diagnostics.",
  },
  views: [
    {
      slug: "clutter",
      label: "Clutter",
      description: "Before manipulation",
      alt: "RPX scene 049 with objects in a cluttered arrangement before manipulation.",
    },
    {
      slug: "interaction",
      label: "Interaction",
      description: "During manipulation",
      alt: "RPX scene 049 while hands interact with objects.",
    },
    {
      slug: "clean",
      label: "Clean",
      description: "After manipulation",
      alt: "RPX scene 049 after the objects have been organized.",
    },
    {
      slug: "ego",
      label: "Ego",
      description: "Egocentric view",
      alt: "An egocentric view of interaction in RPX scene 049.",
    },
  ],
  tasks: [
    {
      name: "Image depth",
      input: "RGB image",
      evaluation: "Metric-depth accuracy",
    },
    {
      name: "Video depth",
      input: "RGB sequence",
      evaluation: "Depth accuracy and temporal consistency",
    },
    {
      name: "Object tracking",
      input: "Video and initialization",
      evaluation: "Tracking and identity consistency",
    },
    {
      name: "Relative camera pose",
      input: "Image pairs",
      evaluation: "Relative-pose errors and threshold AUC",
    },
    {
      name: "General VQA",
      input: "Image and question",
      evaluation: "Visual grounding and localization",
    },
    {
      name: "In-context VQA",
      input: "Image, question, and reference",
      evaluation: "Reference-conditioned localization",
    },
  ],
  sources: [
    { label: "Dataset", href: "https://huggingface.co/datasets/IRVLUTD/RPX" },
    {
      label: "Toolkit documentation",
      href: "https://irvlutd.github.io/RPX/toolkit-docs/",
    },
    { label: "GitHub", href: "https://github.com/IRVLUTD/RPX" },
    { label: "Project", href: "https://irvlutd.github.io/RPX/" },
  ],
};
