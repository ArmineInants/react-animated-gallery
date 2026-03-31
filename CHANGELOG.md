# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4] - 2026-03-31

### Docs
- npm metadata: `author`, `homepage` (Vercel demo), `style` field; README npm/license badges and links table.

## [0.1.3] - 2026-03-31

### Fixed
- Synchronize slot update timing with resolved CSS `--ag-duration` to reduce CSS/JS drift in host apps.
- Improve SSR/hydration alignment by pausing animation until mount, then starting timers in sync.

### Improved
- Smooth keyframe pacing and animation rendering hints for less abrupt motion.

### Docs
- Add Next.js usage guidance with `dynamic(..., { ssr: false })` for client-only rendering.
- Improve README demo/publishing guidance and add live demo link.

## [0.1.0] - 2026-03-31

### Added
- Initial `AnimatedGallery` component package with TypeScript types and bundled CSS.
- Multi-slide slot rotation logic (3 visible slots, continuous looping through larger slide sets).
- Theme API with responsive keys (`*Laptop`, `*Tablet`, `*Mobile`).
- `borderRadius` theme token (default `50%`).
- Demo application and npm-oriented README with props/theme documentation.
