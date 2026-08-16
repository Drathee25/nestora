import { useLayoutEffect, useRef, useState } from 'react';
import { useLenisScroll } from '../lib/LenisContext';

// Recreates lenis.dev's "Enter Lenis" intro, adapted so the "text" is filled
// with the building photo: a fixed, never-transformed photo sits behind a
// black layer with a "NESTORA" -shaped hole cut out of it (an SVG mask). As
// the user scrolls, only that hole — pure vector, so it stays perfectly
// crisp at any zoom — scales up around the "T", widening the window onto the
// untouched photo beneath. The photo itself never scales, so it never blurs.
//
// Scale is driven straight off Lenis scroll ticks — no easing/lerp — since
// the zoom should track scroll exactly, not feel smoothed after it.

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
  const overlayRef = useRef(null);
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
    if (svgRef.current) {
      svgRef.current.style.transformOrigin = `${originRef.current.x}px ${originRef.current.y}px`;
    }
  }, [dims]);

  const handleScroll = () => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;

    if (svgRef.current) {
      const scale = 1 + progress * (MAX_SCALE - 1);
      svgRef.current.style.transform = `scale(${scale})`;
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

        {/* Black layer with a NESTORA-shaped hole, cut via SVG mask. Only
            this (vector) layer scales, revealing more of the crisp photo
            beneath as it zooms into the T. */}
        <svg
          ref={svgRef}
          width={dims.width}
          height={dims.height}
          viewBox={`0 0 ${dims.width} ${dims.height}`}
          className="absolute inset-0"
          style={{ willChange: 'transform, opacity' }}
        >
          <mask id="nestora-cutout" maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width={dims.width} height={dims.height} fill="white" />
            <text
              x="50%"
              y="50%"
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
