# animated-gallery

Animated React gallery for multi-image collections that renders exactly three images at a time, with smooth, low-distraction slot updates.

## Demo video

![Animated Gallery demo](https://raw.githubusercontent.com/ArmineInants/react-animated-gallery/main/docs/Recording_animated_gallery.gif)

## Why this gallery is unique

- Accepts **multiple images** and keeps the UI focused by showing only **three slots** at once (left, center, right).
- Uses **slot-based replacement** instead of page-like carousel jumps.
- Replaces only one slot per step, creating a **smooth, subtle transition** that is easy to follow.
- Keeps the center slot visually emphasized while cycling through all provided slides.
- Supports **3+ slides**, loops continuously, and wraps from the last slide back to the first.
- Includes a strongly typed **theme API** with responsive (`*Laptop`, `*Tablet`, `*Mobile`) overrides.

## Install

```bash
npm install animated-gallery
```

Peer dependencies:

- `react` (18 or 19)
- `react-dom` (18 or 19)

## Quick start

```tsx
import { AnimatedGallery, type GallerySlide } from 'animated-gallery';
import 'animated-gallery/style.css';

const slides: GallerySlide[] = [
  { src: '/a.jpg', alt: 'A' },
  { src: '/b.jpg', alt: 'B' },
  { src: '/c.jpg', alt: 'C' },
  { src: '/d.jpg', alt: 'D' },
];

export function Hero() {
  return <AnimatedGallery slides={slides} />;
}
```

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `slides` | `GallerySlide[]` | Yes | - | Slide data. Must contain at least 3 items. |
| `theme` | `AnimatedGalleryTheme` | No | `DEFAULT_ANIMATED_GALLERY_THEME` | Theme overrides for colors, timing, sizes, shadows, opacity, borders, **border radius**, z-index, and responsive variants. |
| `className` | `string` | No | `undefined` | Extra class name applied to the root gallery element. |
| `style` | `React.CSSProperties` | No | `undefined` | Inline styles for the root gallery element. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | No | - | Any other valid div attributes (for example `id`, `data-*`, `aria-*`, `onClick`). |

### `GallerySlide`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `src` | `string` | Yes | Image URL. |
| `srcSet` | `string` | No | Responsive image sources. |
| `sizes` | `string` | No | Sizes hint used with `srcSet`. |
| `alt` | `string` | No | Alt text (defaults to `''`). |

## Theme customization

Import CSS once, then pass `theme` overrides:

```tsx
<AnimatedGallery
  slides={slides}
  theme={{
    colorAccent: '#00c4ff',
    colorHighlight: '#0066ff',
    duration: '8s',
    borderRadius: '50%',
    borderWidthMobile: '2px',
  }}
/>
```

The theme is typed as `Partial<AnimatedGalleryThemeFull>` (`AnimatedGalleryTheme`).

### Theme keys and defaults

**Base keys**

| Key | Default | Description |
| --- | --- | --- |
| `colorAccent` | `#ffc404` | Accent color for active borders and focus. |
| `colorHighlight` | `#ffa016` | Background color for the center/active slot. |
| `colorSlotMuted` | `rgba(255, 255, 255, 0.2)` | Background for side slots. |
| `colorBorderMuted` | `transparent` | Border color for side slots. |
| `shadowGlow` | `0px 0px 50px rgb(255 196 4 / 70%), inset 0px 0px 0px 6px rgb(225 225 225 / 25%)` | Shadow for the center/active slot. |
| `shadowNone` | `none` | Shadow for side slots. |
| `duration` | `10s` | Duration of the CSS keyframe loop. |
| `easing` | `ease-in-out` | Easing function for the keyframe loop. |
| `iteration` | `infinite` | Iteration count for the keyframe loop. |
| `imgBlockHeight` | `220px` | Overall gallery block height. |
| `imgBlockWidth` | `43%` | Overall gallery block width. |
| `slotSize` | `170.43px` | Diameter of the image circles. |
| `offsetX` | `128px` | Horizontal offset of side slots from center. |
| `scaleCenter` | `1.29` | Scale factor applied to the center slot. |
| `zBack` | `1` | Z-index for side slots. |
| `zFront` | `6` | Z-index for the center slot. |
| `opacityMuted` | `0.4` | Opacity for side slots. |
| `opacityActive` | `1` | Opacity for the center slot. |
| `borderWidth` | `6px` | Border width for all slots. |
| `borderRadius` | `50%` | Border radius for slots (circle by default). |

**Responsive keys**

These override the matching base keys at breakpoints (`Laptop`, `Tablet`, `Mobile`):

| Key | Default |
| --- | --- |
| `imgBlockWidthLaptop` | `40%` |
| `imgBlockWidthTablet` | `441px` |
| `imgBlockWidthMobile` | `100%` |
| `slotSizeLaptop` | `170px` |
| `slotSizeTablet` | `170px` |
| `slotSizeMobile` | `110px` |
| `offsetXLaptop` | `128px` |
| `offsetXTablet` | `128px` |
| `offsetXMobile` | `75px` |
| `borderWidthLaptop` | `6px` |
| `borderWidthTablet` | `4px` |
| `borderWidthMobile` | `2px` |

## Behavior notes

- At least **3 slides** are required.
- The gallery renders **3 distinct images at a time** (left/center/right).
- Slots update in sequence and loop forever, wrapping from the last slide back to the first.
- Only one slot is replaced on each step, so changes feel smooth and unobtrusive.

## Local demo (repo only)

```bash
npm install
npm run demo
```

This starts the demo app from `demo/`. The published package ships `dist/` only.

## Before publishing

Use this checklist before your first GitHub release and `npm publish`:

- Verify package metadata in `package.json`: `name`, `version`, `description`, `license`, `repository`, `homepage`, `bugs`.
- Confirm build output is current: run `npm run build`.
- Verify what will be published: run `npm pack --dry-run` and check contents (`dist/`, `README.md`, `LICENSE`, `package.json`).
- Validate install experience in a fresh project using the generated `.tgz` package.
- Make sure README examples match the current API (`slides`, `theme`, and `style.css` import).
- Ensure `.npmignore` / `files` only include intended publish artifacts.
- Commit all changes and push to GitHub; create a release tag (for example `v0.1.0`).
- Authenticate to npm: `npm login` and verify with `npm whoami`.
- Publish:
  - unscoped package: `npm publish`
  - scoped public package: `npm publish --access public`

Optional but recommended:

- Add badges (npm version, downloads, license) to README.
- Keep a `CHANGELOG.md` and update it per release.

## License

MIT
