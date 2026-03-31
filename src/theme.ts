import type { CSSProperties } from 'react';

export type ResponsiveSuffix = 'Laptop' | 'Tablet' | 'Mobile';

const RESPONSIVE_SUFFIXES: ResponsiveSuffix[] = ['Laptop', 'Tablet', 'Mobile'];

const RESPONSIVE_MEDIA: Record<ResponsiveSuffix, string> = {
  Laptop: '(max-width: 1199px)',
  Tablet: '(max-width: 991px)',
  Mobile: '(max-width: 767px)',
};

/** Base theme keys only — each maps to a single `--ag-*` custom property. */
export const BASE_THEME_VAR_MAP = {
  colorAccent: '--ag-color-accent',
  colorHighlight: '--ag-color-highlight',
  colorSlotMuted: '--ag-color-slot-muted',
  colorBorderMuted: '--ag-color-border-muted',
  shadowGlow: '--ag-shadow-glow',
  shadowNone: '--ag-shadow-none',
  duration: '--ag-duration',
  easing: '--ag-easing',
  iteration: '--ag-iteration',
  imgBlockHeight: '--ag-img-block-height',
  imgBlockWidth: '--ag-img-block-width',
  slotSize: '--ag-slot-size',
  offsetX: '--ag-offset-x',
  scaleCenter: '--ag-scale-center',
  zBack: '--ag-z-back',
  zFront: '--ag-z-front',
  opacityMuted: '--ag-opacity-muted',
  opacityActive: '--ag-opacity-active',
  borderWidth: '--ag-border-width',
  borderRadius: '--ag-border-radius',
} as const;

/** Derived from `--ag-border-width` wherever base theme vars are emitted. */
export const AG_BORDER_WIDTH_DOUBLE = '--ag-border-width-double';
export const AG_BORDER_WIDTH_DOUBLE_VALUE = 'calc(var(--ag-border-width) * 2)';

export type BaseThemeKey = keyof typeof BASE_THEME_VAR_MAP;

/** Base + responsive (`*Laptop` / `*Tablet` / `*Mobile`) keys used by the gallery. */
export interface AnimatedGalleryThemeFull extends Record<BaseThemeKey, string> {
  imgBlockWidthLaptop: string;
  imgBlockWidthTablet: string;
  imgBlockWidthMobile: string;
  slotSizeLaptop: string;
  slotSizeTablet: string;
  slotSizeMobile: string;
  offsetXLaptop: string;
  offsetXTablet: string;
  offsetXMobile: string;
  borderWidthLaptop: string;
  borderWidthTablet: string;
  borderWidthMobile: string;
}

/** Every property is optional; unspecified keys use `DEFAULT_ANIMATED_GALLERY_THEME`. */
export type AnimatedGalleryTheme = Partial<AnimatedGalleryThemeFull>;

export const DEFAULT_ANIMATED_GALLERY_THEME: AnimatedGalleryThemeFull = {
  colorAccent: '#ffc404',
  colorHighlight: '#ffa016',
  colorSlotMuted: 'rgba(255, 255, 255, 0.2)',
  colorBorderMuted: 'transparent',
  shadowGlow:
    '0px 0px 50px rgb(255 196 4 / 70%), inset 0px 0px 0px 6px rgb(225 225 225 / 25%)',
  shadowNone: 'none',
  duration: '10s',
  easing: 'ease-in-out',
  iteration: 'infinite',
  imgBlockHeight: '220px',
  imgBlockWidth: '100%',
  slotSize: '170.43px',
  offsetX: '128px',
  scaleCenter: '1.29',
  zBack: '1',
  zFront: '6',
  opacityMuted: '0.4',
  opacityActive: '1',
  borderWidth: '6px',
  borderRadius: '50%',

  imgBlockWidthLaptop: '100%',
  imgBlockWidthTablet: '100%',
  imgBlockWidthMobile: '100%',
  slotSizeLaptop: '170px',
  slotSizeTablet: '170px',
  slotSizeMobile: '110px',
  offsetXLaptop: '128px',
  offsetXTablet: '128px',
  offsetXMobile: '75px',
  borderWidthLaptop: '6px',
  borderWidthTablet: '4px',
  borderWidthMobile: '2px',
};

function mergeTheme(theme?: AnimatedGalleryTheme): AnimatedGalleryThemeFull {
  return { ...DEFAULT_ANIMATED_GALLERY_THEME, ...theme };
}

/** `imgBlockWidthLaptop` → `{ base: 'imgBlockWidth', suffix: 'Laptop' }` if `imgBlockWidth` is a base key. */
export function parseResponsiveThemeKey(key: string): {
  base: BaseThemeKey;
  suffix: ResponsiveSuffix;
} | null {
  for (const suffix of RESPONSIVE_SUFFIXES) {
    if (!key.endsWith(suffix)) continue;
    const base = key.slice(0, -suffix.length) as BaseThemeKey;
    if (base in BASE_THEME_VAR_MAP) return { base, suffix };
  }
  return null;
}

/**
 * Base `--ag-*` as a React `style` object (no responsive keys).
 * Prefer `themeToScopedCss` in the component so media overrides are not blocked by inline styles.
 */
export function themeToCssVars(theme?: AnimatedGalleryTheme): CSSProperties {
  const merged = mergeTheme(theme);
  const out: Record<string, string> = {};
  for (const baseKey of Object.keys(BASE_THEME_VAR_MAP) as BaseThemeKey[]) {
    const cssVar = BASE_THEME_VAR_MAP[baseKey];
    out[cssVar] = String(merged[baseKey]);
  }
  out[AG_BORDER_WIDTH_DOUBLE] = AG_BORDER_WIDTH_DOUBLE_VALUE;
  return out as CSSProperties;
}

/**
 * For each `*Laptop` / `*Tablet` / `*Mobile` property, emits a `@media` block that sets the
 * corresponding base `--ag-*` variable on `scopeSelector` (e.g. `[data-ag-theme="…"]`).
 */
export function themeToResponsiveCss(
  theme: AnimatedGalleryTheme | undefined,
  scopeSelector: string,
): string {
  const merged = mergeTheme(theme);
  const declarationsByMedia = new Map<string, Map<string, string>>();

  for (const key of Object.keys(merged) as (keyof AnimatedGalleryThemeFull)[]) {
    const parsed = parseResponsiveThemeKey(String(key));
    if (!parsed) continue;
    const cssVar = BASE_THEME_VAR_MAP[parsed.base];
    const media = RESPONSIVE_MEDIA[parsed.suffix];
    const value = merged[key];
    if (value === undefined) continue;

    let decls = declarationsByMedia.get(media);
    if (!decls) {
      decls = new Map();
      declarationsByMedia.set(media, decls);
    }
    decls.set(cssVar, String(value));
  }

  const parts: string[] = [];
  for (const suffix of RESPONSIVE_SUFFIXES) {
    const media = RESPONSIVE_MEDIA[suffix];
    const decls = declarationsByMedia.get(media);
    if (!decls?.size) continue;
    const body = [...decls.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([prop, val]) => `${prop}: ${val};`)
      .join(' ');
    parts.push(`@media ${media} { ${scopeSelector} { ${body} } }`);
  }

  return parts.join('\n');
}

/**
 * Full scoped stylesheet for one instance: base `--ag-*` on `scopeSelector`, then responsive
 * `@media` blocks. Use this instead of putting `themeToCssVars` on `style` — **inline custom
 * properties beat author stylesheets**, so `@media` overrides would never apply if base vars
 * were set inline.
 */
export function themeToScopedCss(
  theme: AnimatedGalleryTheme | undefined,
  scopeSelector: string,
): string {
  const merged = mergeTheme(theme);
  const baseBody = (Object.keys(BASE_THEME_VAR_MAP) as BaseThemeKey[])
    .map((baseKey) => {
      const cssVar = BASE_THEME_VAR_MAP[baseKey];
      return `${cssVar}: ${String(merged[baseKey])};`;
    })
    .join(' ');
  const borderWidthValue = Number(merged.borderWidth.replace('px', ''));
  const borderWidthDoubleValue = borderWidthValue * 2;
  const baseWithDerived = `${baseBody} ${AG_BORDER_WIDTH_DOUBLE}: ${borderWidthDoubleValue}px;`;
  const baseRule = `${scopeSelector} { ${baseWithDerived} }`;
  const responsive = themeToResponsiveCss(theme, scopeSelector);
  return responsive ? `${baseRule}\n${responsive}` : baseRule;
}

