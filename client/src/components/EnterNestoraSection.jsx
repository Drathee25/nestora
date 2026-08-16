import { useLayoutEffect, useRef, useState } from 'react';
import { useLenisScroll } from '../lib/LenisContext';

// Recreates lenis.dev's "Enter Lenis" intro, adapted so the "text" is filled
// with the building photo: a fixed, never-transformed photo sits behind a
// black layer with a "NESTORA" -shaped hole cut out of it (an SVG mask). As
// the user scrolls, that hole scales up around the "T", widening the window
// onto the untouched photo beneath. The photo itself never scales, so it
// never blurs.
//
// The zoom is done by shrinking the SVG's `viewBox` rather than a CSS
// `transform: scale()`. A CSS transform on an SVG element gets composited by
// rasterizing the element once and stretching that texture for the
// animation — which blurs vector content just like a bitmap at high zoom
// factors. Changing `viewBox` instead makes the browser genuinely re-render
// the mask and text at the new zoom level every frame, so it stays crisp at
// any scale. Driven straight off Lenis scroll ticks, no easing/lerp, so the
// zoom tracks scroll exactly rather than feeling smoothed after it.

const SECTION_HEIGHT_VH = 300;
const MAX_SCALE = 16;
// The black/text mask fades out over this tail of the zoom, guaranteeing a
// clean "fully revealed photo" end state regardless of exact mask geometry.
const OVERLAY_FADE_START = 0.85;
const CAPTION_FADE_END = 0.12;

export default function EnterNestoraSection() {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);
  const tSpanRef = useRef(null);
  const captionRef = useRef(null);
  const originRef = useRef({ x: 0, y: 0 });

  const [dims, setDims] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));

  useLayoutEffect(() => {
    function onResize() {
      setDims({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Re-measure the "T" glyph's position whenever size changes — SVG text
  // gives pixel-accurate getBBox(), so the zoom origin is exact at any
  // viewport size with no percentage guesswork.
  useLayoutEffect(() => {
    const t = tSpanRef.current;
    if (!t) return;
    const box = t.getBBox();
    originRef.current = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }, [dims]);

  const handleScroll = () => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;

    if (svgRef.current) {
      const scale = 1 + progress * (MAX_SCALE - 1);
      const { x: originX, y: originY } = originRef.current;
      const visibleW = dims.width / scale;
      const visibleH = dims.height / scale;
      // Keep the origin point (the T) at the same screen position it holds
      // at rest, rather than always centering the viewBox on it — the T
      // isn't exactly centered in "NESTORA" (4th of 7 letters), so a pure
      // "always centered on the T" viewBox is offset from 0,0 even at
      // scale=1, leaving a gap of unmasked photo down one edge. This
      // formula gives minX=0/minY=0 exactly at scale=1 and only converges
      // toward centering on the T as scale grows.
      const minX = originX * (1 - 1 / scale);
      const minY = originY * (1 - 1 / scale);
      svgRef.current.setAttribute('viewBox', `${minX} ${minY} ${visibleW} ${visibleH}`);
      const fadeT = Math.min(1, Math.max(0, (progress - OVERLAY_FADE_START) / (1 - OVERLAY_FADE_START)));
      svgRef.current.style.opacity = 1 - fadeT;
    }
    if (captionRef.current) {
      const captionT = Math.min(1, Math.max(0, progress / CAPTION_FADE_END));
      captionRef.current.style.opacity = 1 - captionT;
    }
  };

  useLenisScroll(handleScroll);
  useLayoutEffect(() => {
    handleScroll();
  });

  const fontSize = dims.width * 0.18;

  return (
    <section ref={wrapperRef} className="relative bg-black" style={{ height: `${SECTION_HEIGHT_VH}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        {/* Fixed background photo — never transformed, so it never blurs */}
        <img
          src="/hero/scene-0.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Black layer with a NESTORA-shaped hole, cut via SVG mask. Zoom is
            done via viewBox (not a CSS transform) so the vector content is
            genuinely re-rendered crisp at every zoom level. */}
        <svg
          ref={svgRef}
          width={dims.width}
          height={dims.height}
          viewBox={`0 0 ${dims.width} ${dims.height}`}
          className="absolute inset-0"
          style={{ willChange: 'opacity' }}
        >
          <mask id="nestora-cutout" maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width={dims.width} height={dims.height} fill="white" />
            <text
              x={dims.width / 2}
              y={dims.height / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="'Manrope', system-ui, sans-serif"
              fontWeight="800"
              fontSize={fontSize}
              letterSpacing={-fontSize * 0.03}
              fill="black"
            >
              NES
              <tspan ref={tSpanRef}>T</tspan>
              ORA
            </text>
          </mask>
          <rect x="0" y="0" width={dims.width} height={dims.height} fill="black" mask="url(#nestora-cutout)" />
        </svg>

        <p
          ref={captionRef}
          className="absolute left-0 right-0 text-center text-sm md:text-base tracking-[0.3em] uppercase text-[#faf3e7]/70"
          style={{ top: `calc(50% + ${fontSize * 0.42}px)` }}
        >
          by Akash Khatri
        </p>
      </div>
    </section>
  );
}
