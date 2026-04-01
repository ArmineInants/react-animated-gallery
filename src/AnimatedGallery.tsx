import type { HTMLAttributes } from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import styles from './gallery.module.css';
import {
  DEFAULT_ANIMATED_GALLERY_THEME,
  themeToScopedCss,
  type AnimatedGalleryTheme,
} from './theme';

export type GallerySlide = {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt?: string;
};

/**
 * Which slot to update each tick: left → center → right → …
 * Use names and map to tuple indices so we never confuse tuple order with slot order.
 * Tuple `indices` is always [leftIdx, centerIdx, rightIdx] into `slides`.
 */
const SLOT_UPDATE_SEQUENCE = ['left', 'center', 'right'] as const;
const DEFAULT_SLOT_INTERVAL_MS = 3333;

function durationToMs(value: string): number | null {
  const raw = value.trim().toLowerCase();
  const match = raw.match(/^(\d*\.?\d+)\s*(ms|s)$/);
  if (!match) return null;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return match[2] === 's' ? amount * 1000 : amount;
}

function resolveDurationMs(
  root: HTMLDivElement | null,
  themeDuration: string | undefined,
): number {
  if (root) {
    // Read the resolved custom property first, so external CSS overrides stay in sync with JS.
    const cssVarDuration = getComputedStyle(root).getPropertyValue('--ag-duration');
    const resolvedFromCss = durationToMs(cssVarDuration);
    if (resolvedFromCss !== null) return resolvedFromCss;
  }
  const resolvedFromTheme = durationToMs(
    themeDuration ?? DEFAULT_ANIMATED_GALLERY_THEME.duration,
  );
  if (resolvedFromTheme !== null) return resolvedFromTheme;
  return DEFAULT_SLOT_INTERVAL_MS * 3;
}

function slotNameToTupleIndex(
  slot: (typeof SLOT_UPDATE_SEQUENCE)[number],
): 0 | 1 | 2 {
  switch (slot) {
    case 'left':
      return 0;
    case 'center':
      return 1;
    case 'right':
      return 2;
  }
}

/**
 * When `n === 3` every slide index is already used, so there is no unused index to assign to
 * `pos`. Rotating all three slots made the **left** image change first (0→1), which looked wrong
 * when the tick targeted **right**. Swap `pos` with `(pos + 2) % 3` so the intended slot gets a
 * different slide: for `pos === 2` (right) this swaps center ↔ right and leaves **left** unchanged.
 */
function swapSlotsFallback(
  prev: [number, number, number],
  pos: 0 | 1 | 2,
): [number, number, number] {
  const other = ((pos + 2) % 3) as 0 | 1 | 2;
  const next: [number, number, number] = [...prev];
  [next[pos], next[other]] = [next[other], next[pos]];
  return next;
}

/**
 * Pick a new index for `pos` so all three indices stay distinct; prefer changing the slot.
 *
 * For `n >= 4` we walk forward from the current index, wrapping around, and pick the first index
 * that is not used by the other two slots. This guarantees we eventually visit every slide (0…n-1)
 * while still keeping the three-visible constraint.
 *
 * For `n === 3` there is no unused index, so we fall back to `swapSlotsFallback`.
 */
function nextIndices(
  prev: [number, number, number],
  pos: 0 | 1 | 2,
  n: number,
): [number, number, number] {
  const others: [number, number] = [prev[0], prev[1], prev[2]].filter(
    (_, i) => i !== pos,
  ) as [number, number];
  // Try to advance this slot around the ring of slides, skipping indices currently used by others.
  for (let step = 1; step < n; step++) {
    const candidate = (prev[pos] + step) % n;
    if (!others.includes(candidate)) {
      const next: [number, number, number] = [...prev];
      next[pos] = candidate;
      return next;
    }
  }
  // `n` must be 3 here: every index is already used somewhere, so just swap with a neighbour.
  return swapSlotsFallback(prev, pos);
}

export type AnimatedGalleryProps = {
  /** At least three slides. Left / center / right show three different slides; every 3s the next slot in order (right → center → left) updates to another slide not used by the other two. */
  slides: GallerySlide[];
  theme?: AnimatedGalleryTheme;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export function AnimatedGallery({
  slides,
  className,
  theme,
  style,
  ...rest
}: AnimatedGalleryProps) {
  if (slides.length < 3) {
    throw new Error('AnimatedGallery requires at least 3 slides');
  }

  const n = slides.length;
  /** [leftSlideIndex, centerSlideIndex, rightSlideIndex] — matches DOM: imageLeft / imageCenter / imageRight */
  const [indices, setIndices] = useState<[number, number, number]>([0, 1, 2]);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [syncEpoch, setSyncEpoch] = useState(0);
  const tickRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rootRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    function onVisibilityChange() {
      const nextVisible = !document.hidden;
      const prevVisible = visibleRef.current;
      visibleRef.current = nextVisible;
      setIsVisible(nextVisible);
      // When returning to a visible tab, force a fresh phase for both CSS and JS.
      if (nextVisible && !prevVisible) {
        setSyncEpoch((v) => v + 1);
      }
    }

    visibleRef.current = !document.hidden;
    setIsVisible(visibleRef.current);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    if (!isMounted || !isVisible) return;
    setIndices([0, 1, 2]);
    tickRef.current = 0;

    function applyTick() {
      const slot =
        SLOT_UPDATE_SEQUENCE[tickRef.current % SLOT_UPDATE_SEQUENCE.length]!;
      tickRef.current += 1;
      const pos = slotNameToTupleIndex(slot);
      setIndices((prev) => nextIndices(prev, pos, n));
    }

    function scheduleNext(delayMs: number) {
      timerRef.current = window.setTimeout(() => {
        applyTick();
        const durationMs = resolveDurationMs(rootRef.current, theme?.duration);
        const slotIntervalMs = Math.max(16, durationMs / 3);
        scheduleNext(slotIntervalMs);
      }, delayMs);
    }

    const rafId = window.requestAnimationFrame(() => {
      // Wait one paint so computed CSS vars are settled before first scheduling.
      const settledDurationMs = resolveDurationMs(rootRef.current, theme?.duration);
      const settledSlotIntervalMs = Math.max(16, settledDurationMs / 3);
      scheduleNext(Math.max(16, settledSlotIntervalMs / 8));
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [isMounted, isVisible, n, syncEpoch, theme?.duration]);

  const [il, ic, ir] = indices;
  const left = slides[il]!;
  const center = slides[ic]!;
  const right = slides[ir]!;

  const rootClass = [styles.imgBlock, className].filter(Boolean).join(' ');

  const scopeId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const scopeSelector = `[data-ag-theme="${scopeId}"]`;
  const scopedCss = useMemo(
    () => themeToScopedCss(theme, scopeSelector),
    [theme, scopeSelector],
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div
        key={syncEpoch}
        ref={rootRef}
        data-ag-theme={scopeId}
        data-ag-mounted={isMounted ? 'true' : 'false'}
        data-ag-visible={isVisible ? 'true' : 'false'}
        className={rootClass}
        style={style}
        {...rest}
      >
        <div className={styles.imageLeft}>
          <img
            key={`${il}-${left.src}`}
            src={left.src}
            srcSet={left.srcSet}
            sizes={left.sizes}
            alt={left.alt ?? ''}
            decoding="async"
            loading="lazy"
          />
        </div>
        <div className={styles.imageCenter}>
          <img
            key={`${ic}-${center.src}`}
            src={center.src}
            srcSet={center.srcSet}
            sizes={center.sizes}
            alt={center.alt ?? ''}
            decoding="async"
            loading="lazy"
          />
        </div>
        <div className={styles.imageRight}>
          <img
            key={`${ir}-${right.src}`}
            src={right.src}
            srcSet={right.srcSet}
            sizes={right.sizes}
            alt={right.alt ?? ''}
            decoding="async"
            loading="lazy"
          />
        </div>
      </div>
    </>
  );
}

export type {
  AnimatedGalleryTheme,
  AnimatedGalleryThemeFull,
  ResponsiveSuffix,
} from './theme';
export {
  AG_BORDER_WIDTH_DOUBLE,
  AG_BORDER_WIDTH_DOUBLE_VALUE,
  BASE_THEME_VAR_MAP,
  DEFAULT_ANIMATED_GALLERY_THEME,
  parseResponsiveThemeKey,
  themeToCssVars,
  themeToResponsiveCss,
  themeToScopedCss,
} from './theme';
