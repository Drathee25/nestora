---
name: lenis-scroll
description: Build smooth-scroll and scroll-driven animations (parallax, pinned/scroll-jacked sections, scroll-scrubbed video, scroll-triggered reveals, GSAP ScrollTrigger sync) using Lenis. Use whenever the user asks for smooth scrolling, scroll animations, scroll-jacking, a scroll-driven hero/video section, or anything referencing lenis.dev. This project already uses Lenis (see client/src/lib/LenisContext.jsx) and a hand-rolled RAF+lerp scroll-jacking pattern (see client/src/components/BuildingScrollSection.jsx) — reuse those patterns before introducing new ones.
metadata:
  source: https://lenis.dev
  homepage: https://github.com/darkroomengineering/lenis
---

# Lenis smooth scroll

Lenis (darkroom.engineering) turns native scroll into a smoothed, controllable
value — under 4kb, zero runtime deps, keeps native scrollbar/sticky/anchor
behavior intact (no scroll hijacking of the scrollbar itself, unlike older
libraries). It's the engine behind most "premium" scroll-driven sites.

Two things it's good for in this codebase:
1. **Global smooth scroll feel** — the inertia/easing on every wheel/touch scroll.
2. **Scroll-driven animation source of truth** — reading scroll position/velocity
   every frame to drive video scrubbing, pinned sections, parallax, GSAP
   ScrollTrigger, etc.

## Already in this project

- **`client/src/lib/LenisContext.jsx`** — a React context provider wrapping a
  single global Lenis instance, with a manual `requestAnimationFrame` loop and
  a `useLenisScroll(callback)` hook to subscribe to scroll events. `window.__lenis`
  is exposed in dev for console debugging.
- **`client/src/components/BuildingScrollSection.jsx`** — the reference
  implementation for scroll-jacked/pinned sections: a tall `<section>` with a
  `sticky top-0 h-screen` inner wrapper, progress computed each RAF frame from
  `getBoundingClientRect()`, and downstream effects (video `currentTime`,
  active "stop" index, text reveal) all driven off that single `progress`
  value. **Reuse this pattern** for any new pinned/scrubbed section rather
  than reinventing it — see "Scroll-jacked pinned section" below.

Before building a new scroll animation, check whether extending one of these
two files is simpler than adding a new library or pattern.

## Installation

```bash
npm install lenis
```

## Setup patterns

### A. Official React integration (`lenis/react`)

Simplest option for a page/app-wide smooth scroll with no custom per-frame logic:

```jsx
import { ReactLenis, useLenis } from 'lenis/react';

// root=true => single global instance on <html>, accessible via useLenis() anywhere
function App() {
  return (
    <ReactLenis root>
      <YourRoutes />
    </ReactLenis>
  );
}

function SomeComponent() {
  const lenis = useLenis((lenis) => {
    // fires every scroll frame
  });
  return <button onClick={() => lenis?.scrollTo('#pricing')}>Jump</button>;
}
```

`root` prop:
- `false` (default) — instance scoped to descendants of `<ReactLenis>`
- `true` — global instance on `<html>`, `useLenis` works anywhere in the app
- `"asChild"` — custom scroll container, still globally accessible

### B. Hand-rolled context (what this project uses)

Use this when you need `window.__lenis` for debugging, or tighter control over
the RAF loop (e.g. driving other per-frame work in the same loop). See
`LenisContext.jsx` for the full pattern:

```jsx
const instance = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
if (import.meta.env.DEV) window.__lenis = instance;

function raf(time) {
  instance.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

### C. Plain JS one-liner (no framework)

```js
const lenis = new Lenis({ autoRaf: true });
lenis.on('scroll', (e) => console.log(e));
```

## Required CSS

Lenis needs this (import `lenis/dist/lenis.css` or add manually):

```css
html.lenis { height: auto; }
html.lenis body { height: auto; overflow: visible; }
html.lenis.lenis-smooth { scroll-behavior: auto; }
```

This project's `index.css` already has the relevant base rules — check there
before adding new global scroll CSS.

## Full API reference

### Constructor options

```js
new Lenis({
  wrapper: window,                 // scroll container
  content: document.documentElement,
  eventsTarget: wrapper,           // element that listens for wheel/touch
  duration: 1.2,                   // seconds, for lenis.scrollTo animations
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',         // 'vertical' | 'horizontal'
  gestureOrientation: 'vertical',  // 'vertical' | 'horizontal' | 'both'
  smoothWheel: true,               // smooth wheel-initiated scroll
  syncTouch: false,                // smooth touch scroll too (can feel laggy on mobile — test before enabling)
  syncTouchLerp: 0.075,
  touchInertiaExponent: 1.7,
  touchMultiplier: 1,
  wheelMultiplier: 1,
  lerp: 0.1,                       // interpolation intensity, 0-1 (alternative to duration/easing)
  infinite: false,
  autoRaf: false,                  // true = Lenis runs its own RAF loop internally
  autoResize: true,                // ResizeObserver-driven
  autoToggle: false,               // auto start/stop based on content overflow
  allowNestedScroll: false,        // auto-detect nested scrollables (perf cost — prefer data-lenis-prevent)
  anchors: false,                  // true, or { offset, onComplete } — handle <a href="#..."> automatically
  respectReducedMotion: true,      // instant scroll + no smoothing under prefers-reduced-motion
  prevent: undefined,              // (node) => boolean, alternative to data-lenis-prevent
  virtualScroll: undefined,        // (data) => data | false, intercept/modify raw scroll input
});
```

### Methods

```js
lenis.raf(time)              // step the internal animation — call every RAF frame if autoRaf: false
lenis.scrollTo(target, opts) // target: number | selector string | HTMLElement | 'top' | 'bottom'
                              // opts: { offset, lerp, duration, easing, immediate, lock, force, onComplete, userData }
lenis.start()                // resume
lenis.stop()                 // pause (e.g. while a modal is open)
lenis.resize()               // recompute dimensions (needed if autoResize: false)
lenis.on(event, cb)
lenis.off(event, cb)
lenis.destroy()
```

### Events

```js
lenis.on('scroll', (lenis) => { /* fires every animation frame while scrolling */ });
lenis.on('virtual-scroll', ({ deltaX, deltaY, event }) => { /* raw wheel/touch, before smoothing */ });
```

### Read-only properties

`animatedScroll`, `actualScroll`, `velocity`, `lastVelocity`, `direction` (1 up / -1 down),
`progress` (0-1), `limit` (max scroll), `isScrolling`, `isStopped`, `isHorizontal`,
`prefersReducedMotion`, `dimensions`.

## Scroll-jacked pinned section (the pattern this project uses)

This is the technique behind `BuildingScrollSection.jsx` — a tall section with
a sticky viewport-height inner wrapper, where scroll progress through the tall
section drives everything else (video time, text swaps, transforms) instead of
the page actually scrolling that content into view.

```jsx
function ScrollDrivenSection() {
  const wrapperRef = useRef(null);
  const videoRef = useRef(null);
  const stateRef = useRef({ current: 0, target: 0 });

  const getProgress = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.min(1, Math.max(0, -rect.top / scrollable));
  }, []);

  useEffect(() => {
    let rafId;
    function tick() {
      rafId = requestAnimationFrame(tick);
      const progress = getProgress(); // 0 -> 1 across the whole pinned section

      // drive anything off `progress` here — video scrub, transforms, active index...
      const vid = videoRef.current;
      if (vid?.duration) {
        const state = stateRef.current;
        state.target = progress * vid.duration;
        state.current += (state.target - state.current) * 0.2; // lerp for smoothness
        if (Math.abs(vid.currentTime - state.current) > 0.01) vid.currentTime = state.current;
      }
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [getProgress]);

  return (
    <section ref={wrapperRef} style={{ height: '450vh' }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden">
        <video ref={videoRef} muted playsInline preload="auto" src="/scene.mp4" />
      </div>
    </section>
  );
}
```

Key points learned building this project's version:
- **Compute `getBoundingClientRect()` fresh every frame** — don't cache scroll
  math, it drifts on resize/content shifts.
- **Lerp (`current += (target - current) * factor`) any value you scrub**
  (video `currentTime`, transforms) — jumping straight to the target reads as
  jittery/laggy. `0.15–0.25` is a good factor range; lower = smoother but more
  lag, higher = snappier but can feel jumpy on noisy scroll input.
- **`translate3d(...)` not `translateX(...)`** for scroll-driven transforms —
  keeps the element on its own GPU compositor layer.
- **Section height in `vh`** sets how much physical scroll maps to `progress`
  0→1. More `vh` = slower/more granular scrub; less = faster.
- **`overflow: hidden` on the sticky wrapper**, not the outer section — the
  outer section needs its full tall height for the scroll math to work.
- **Video scroll-scrubbing needs frequent keyframes.** A video with sparse
  keyframes (e.g. one keyframe for the whole clip) makes arbitrary-time
  seeking slow/impossible — scrubbing will look frozen or stutter badly. When
  encoding source video for this pattern, re-encode with `ffmpeg` using a
  short GOP (e.g. `-g 8 -keyint_min 8`, i.e. a keyframe every 8 frames) —
  keeps seeks near-instant without needing every single frame to be a
  keyframe (which bloats file size). See git history on `hero.mp4` in this
  repo for a worked example of diagnosing and fixing this exact issue.
- **Independent sub-components should NOT be scroll-jacked.** A carousel or
  other self-contained interactive element embedded inside a page should get
  its own native scroll/drag, not have its position driven by page-scroll
  progress — see `PropertyCarouselSection.jsx`, which was split out from the
  scroll-jacked section specifically because binding it to page scroll
  progress made it feel broken/unintuitive to use.

## GSAP ScrollTrigger sync

Let Lenis drive the scroll value, and hand GSAP's ticker control of the RAF loop:

```js
const lenis = new Lenis();

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000); // gsap ticker time is in seconds, Lenis wants ms
});

gsap.ticker.lagSmoothing(0);
```

In React with `lenis/react`, use the `LenisRef` and disable `autoRaf`:

```jsx
const lenisRef = useRef(null);

useEffect(() => {
  gsap.ticker.add((time) => {
    lenisRef.current?.lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}, []);

<ReactLenis root ref={lenisRef} options={{ autoRaf: false }} />
```

## Framer Motion sync

This project already uses Framer Motion for reveals (`BuildingScrollSection.jsx`
stop transitions). If Framer Motion's own scroll-linked animations
(`useScroll`, `useTransform`) ever fight with Lenis's smoothing, sync frames
instead of running two independent RAF loops:

```js
import { frame } from 'framer-motion';

frame.update((data) => {
  lenisRef.current?.lenis?.raf(data.timestamp);
}, true);
```

## Nested scrollable elements

Prefer explicit opt-out over the auto-detecting `allowNestedScroll` (perf cost —
it runs DOM checks on every scroll event):

```html
<div data-lenis-prevent>independently scrollable content, e.g. a modal or dropdown</div>
<div data-lenis-prevent-wheel>...</div>
<div data-lenis-prevent-touch>...</div>
```

Or via JS: `new Lenis({ prevent: (node) => node.id === 'modal' })`.

## Snap plugin

Separate package for scroll-snapping (replaces CSS `scroll-snap`):

```js
import Lenis from 'lenis';
import { Snap } from 'lenis/snap';

const lenis = new Lenis();
new Snap({ lenis });
```

## Gotchas

- **Safari caps at 60fps** (30fps in low-power mode) — scrubbed animations
  will feel a step choppier there than Chrome; don't over-tune for Chrome only.
- **No wheel events over iframes** (embedded maps, etc.) — smooth scroll
  can't extend into them; this is a browser limitation, not fixable from Lenis.
- **`prefers-reduced-motion: reduce` disables smoothing by default**
  (`respectReducedMotion: true`) — scrolls become instant. Don't override this
  default without a real reason; it's an accessibility setting.
- **`window.scrollTo()` fights Lenis** — once Lenis is active, use
  `lenis.scrollTo(...)` for programmatic scrolling, not the native API (its
  RAF loop will otherwise immediately override a native scrollTo).
