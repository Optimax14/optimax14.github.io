# Research portfolio refresh — October 30, 2026

Branch: refresh/research-portfolio. Built and validated locally; this branch does not deploy the public website.

## Design and page changes

The final design combines a figure-led academic bibliography with a restrained editorial layout: ivory background, navy links, locally hosted Newsreader headings and Inter body text. No gradients, glass panels, entry animations, or research card grid. The references informed presentation principles; their layouts and branding were not copied.

- **Home /**: immediate name, UF affiliation, research introduction, CV/profile/contact links, secondary original Fetch robot, and four substantial research entries. Each entry pairs a complete, uncropped figure with the actual title, authors, status, summary, and available resources. Followed by research software, three directions, and verified milestones.
- **Research /research**: expanded contributions with stable anchors #pathpack, #autox-semmap, #rpx, #intelx, #cellular-sheaves. Supporting coursework is separated from manuscripts; five ongoing algorithm projects are explicitly unfinished.
- **RPX /research/rpx**: official overview, manual-play showcase, four labelled views, accuracy-versus-robustness findings, six-task table, toolkit workflow, and visible source/license credits. No synchronization claim or fabricated prediction examples.
- **Publications /publications**: bibliography grouped into accepted work, submitted manuscripts, and conference presentations. Ordered authors and verified equal-contribution marks; unavailable papers have no invented links. Removed the requested “Author’s presentation report” link from the interface.
- **Software /software**: PATHPACK.jl and CellularSheaves.jl connected to their manuscripts, implementation details, repositories, and documentation.
- **About /about** and preserved **/experience**: UF/Fairbanks/GATAS, dual UTD degrees, IRVL, Clemson REU, and the authorized general description of scientific AI-evaluation work. Genuine personal photographs remain secondary.
- **CV /cv**: current CV explicitly pending. The unchanged December 2025 PDF remains at /cv.pdf as a clearly dated archive, with optional embedded preview and direct download/open fallbacks.
- All five existing /updates/ URLs remain usable. AutoX draws from current shared data; unsupported old announcement bodies were retired.

## Audit and engineering

The designated workspace initially contained only a Vite cache. Retrieved upstream commit 806bf2832cb5d13cee89e5e15112c7f1c64d78b9, restored the checkout, and created the refresh branch. No AGENTS.md or latest research CV was found.

Audited pages, navigation, router, dependencies, assets, viewer, analytics, SEO, and both Pages workflows. Corrected duplicated research arrays, obsolete RPX scope/tasks/authors, IntelX’s old ResNet description, L-CSS review claims, workshop-as-published claims, placeholder resources, unsupported update pages, applicant wording, external fonts, loader/session dependencies, and mobile navigation. The original lockfile failed clean installation because platform dependencies were missing; repaired it.

Preserved React/Vite/TypeScript/Tailwind, Wouter, reusable UI primitives, existing asset URLs, and GitHub Pages. Research content lives in client/src/data/research.ts; route metadata in data/pages.ts; RPX presentation derives shared counts. Generic components handle authors, resources, media, and entries.

Build-time React rendering emits 13 useful route documents, individual metadata/canonicals, sitemap, robots policy, and a 404 SPA fallback. Core content renders without JavaScript. Direct routes and root-relative assets are validated locally. The existing deployment workflow remains, with typecheck and content/output validation; the competing second Pages workflow was removed. No remote workflow was run.

Removed inactive viewer experiments, duplicated page bodies, unused viewer wrappers, and unused R3F/Drei/model-viewer runtime packages. Asset conversion and browser QA tools remain development dependencies.

## Original Fetch model and performance

Restored the original model geometry, joints, resting pose, wave, pointer-following head, and studio lighting. Converted the existing URDF into a compressed GLB without mesh simplification: 790,680 bytes versus approximately 22 MB of original model resources. The exact restored model supplies the static poster.

The viewer is a separate lazy chunk. On desktop it starts after the text has painted; mobile, reduced-motion, data-saving, and slow connections keep the static fallback until requested. It has keyboard rotation/zoom, reset/hide controls, error fallback, cached model decoding, offscreen suspension, and demand rendering. No animation frames are consumed when settled. Reduced motion disables automatic wave/head tracking.

Lighting is a local 131 KB HDR; Draco decoders are local with licenses. The original large public assets remain available for old links but are no longer requested by the viewer.

Initial application JavaScript is about 72 KB gzip, CSS about 20 KB gzip. The optional Three viewer is about 155 KB gzip; Vite reports its uncompressed chunk above 500 KB. Homepage research video is absent from the DOM until played. RPX’s full public showcase is compressed to approximately 754 KB at 960×360 with no audio. Research images use WebP, intrinsic dimensions, lazy loading, and informative alternatives.

## Research corrections and sources

- **AutoX**: [arXiv](https://arxiv.org/abs/2409.15493), [project](https://irvlutd.github.io/SemanticMapping/). Correct full title and Allu/Kadosh/Summers/Xiang order. Accepted at IROS 2026 WORLDS Workshop, per the user; no main-conference claim.
- **PATHPACK**: [repository](https://github.com/AlgebraicJulia/PATHPACK.jl), [documentation](https://algebraicjulia.github.io/PATHPACK.jl/dev/). Samuelson/Kadosh/Fairbanks; submitted manuscript per the user. CPU/NVIDIA GPU semiring software, not a separate publication. No private PDF, manuscript-extracted figure, or manuscript-only speedup claim.
- **RPX**: [repository](https://github.com/IRVLUTD/RPX), [dataset](https://huggingface.co/datasets/IRVLUTD/RPX), [toolkit](https://irvlutd.github.io/RPX/toolkit-docs/). Current title; nine authors, first three equal contributors; 100 scenes, 70 objects, 133,121 frames, six tasks, 49 models, 65 model–task evaluations, over 5.2M VQA records. ICRA 2027 submission per user. Obsolete object/background counts and task lists removed; no live download claim.
- **IntelX**: [repository](https://github.com/IRVLUTD/IntelX), [official project](https://irvlutd.github.io/IntelX/). Dosi/Kadosh/Xiang; U-Net coverage-gain prediction with memory/structure-aware planning. ICRA 2027 submission per user. No ResNet planner or unsupported performance claim.
- **Layered control**: full conic-constrained harmonic-extension title and Kadosh/Samuelson/Fairbanks order per user. Submitted in the ACC 2027 cycle; no assertion of current review or L-CSS review. [CellularSheaves.jl](https://github.com/AlgebraicJulia/CellularSheaves.jl) is companion software.
- **Mental fatigue**: six-author order per user, no equal-author marks. [Author’s public IISE report](https://www.linkedin.com/posts/shirin-ghasemi-0793a5190_iise2026-industrialengineering-humanfactors-activity-7463675026429440000-amnE) establishes a 2026 conference presentation, not a proceedings publication. This supporting source is retained here, not as a website resource link.
- GitHub and Google Scholar identify Itay; LinkedIn is corroborated by the original CV and official project author links. LinkedIn blocks automated requests with HTTP 999; other checked research/profile destinations returned HTTP 200.

## Asset provenance

Read the supplied media-kit manifests and downloader. Manuscript-extracted anonymous figures were not published. The featured RPX downloader retrieved all ten selected public assets; upstream hashes were checked where published.

- PATHPACK lead: actual graph/matrix canvases from its public Reorder explainer, arranged without cropping and labelled. An illustrative example, not experimental results. Reproduction scripts: export-pathpack-panels.mjs and prepare-pathpack-figure.py.
- AutoX: compressed real public system overview and existing robot demo, credited to the team.
- RPX: public dataset/doc assets, locally optimized. Full overview, one findings theme, four views, toolkit SVG, and click-to-play showcase. Credit, CC BY 4.0 link, change notes, original hashes, and upstream provenance retained.
- IntelX: official coverage-gain target/prediction figure, including a failure example; not a fabricated performance plot.
- About: existing real photographs, compressed.
- Fetch: existing portfolio geometry and animation; local studio-light derivative and source credits.
- Fonts: self-hosted Inter and Newsreader with OFL licenses.

Machine-readable provenance: client/public/research/asset-sources.json, research/rpx/media-attribution.json, research/rpx/upstream-provenance.json, and research/fetch/credits.json.

## Local validation and preview

Local production preview: http://localhost:3000/ . Public GitHub Pages is unchanged.

Use Node 20.19+ or a supported newer release. Commands:

```sh
npm ci
npm run check
npm run build
npm test
npm run test:browser -- 1440
npm run test:browser -- 768
npm run test:browser -- 390
node scripts/viewer-check.mjs
node scripts/check-interactions.mjs
```

Browser checks use installed Chrome (CHROME_PATH can override its path). The page and viewer checks start a separate production server on port 3100; run those sequentially. The interaction/review scripts use the running preview on 3000. Screenshots and reports go into ignored artifacts/.

Typecheck, production build, and nine content/media/output tests pass. Browser coverage includes Home, Research, Publications, Software, About, RPX, and CV at 1440/768/390 px; mobile navigation, direct refresh/anchors, PDF response/signature, no-JavaScript content, and unopened heavy-media requests. Axe checks cover WCAG A/AA rules. Additional viewer checks cover rendering, keyboard input, cached reopening, idle rendering, close/unmount, and WebGL/model failure. Interaction checks cover the wave, pointer tracking, and click-to-play video.

No lint script exists; use Prettier for changed sources and git diff --check. GitHub Pages itself has not been deployed or tested remotely. The latest CV and other precise unresolved editorial questions are in NEEDS_CONFIRMATION.md.
