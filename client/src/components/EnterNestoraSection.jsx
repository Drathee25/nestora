import { useLayoutEffect, useRef, useState } from 'react';
import { useLenisScroll } from '../lib/LenisContext';

// Recreates lenis.dev's "Enter Lenis" intro, adapted so the "text" is filled
// with the building photo: a fixed, never-transformed photo sits behind a
// black layer with a "NESTORA" -shaped hole cut out of it (an SVG mask). As
// the user scrolls, that hole scales up around the screen's center, widening
// the window onto the untouched photo beneath. The photo itself never
// scales, so it never blurs.
//
// The zoom is done by shrinking the SVG's `viewBox` rather than a CSS
// `transform: scale()`. A CSS transform on an SVG element gets composited by
// rasterizing the element once and stretching that texture for the
// animation — which blurs vector content just like a bitmap at high zoom
// factors. Changing `viewBox` instead makes the browser genuinely re-render
// the mask and text at the new zoom level every frame, so it stays crisp at
// any scale.
//
// Zoom origin is the screen's exact center (not the "T" glyph's actual
// position) — with the "keep origin fixed on screen" viewBox formula below,
// an off-center origin makes the whole view visibly drift toward it as scale
// increases. Centering on the screen instead keeps the zoom perfectly
// symmetric with zero drift; since "NESTORA" itself is centered on screen,
// this still reads as zooming into the middle of the word.
//
// Progress through the pinned section is split into three phases: a HOLD
// where the wordmark just sits still and readable, a ZOOM where the scale
// ramps up and the overlay fades, and a short tail before the next section
// takes over — kept small so scrolling past this section doesn't feel like
// dead space once the zoom has finished.

const SECTION_HEIGHT_VH = 240;
const MAX_SCALE = 16;
const HOLD_END = 0.18; // wordmark stays fully still through this point
const SCALE_END = 0.9; // scale finishes ramping here
const OVERLAY_FADE_START = 0.72; // overlay fade runs inside the back half of the zoom
const OVERLAY_FADE_END = 0.9;
const CAPTION_FADE_END = 0.14; // caption fades out just as the hold ends

export default function EnterNestoraSection() {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);
  const captionRef = useRef(null);

  const [dims, setDims] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));

  useLayoutEffect(() => {
    function onResize() {
      setDims({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleScroll = () => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;

    if (svgRef.current) {
      const zoomT = Math.min(1, Math.max(0, (progress - HOLD_END) / (SCALE_END - HOLD_END)));
      const scale = 1 + zoomT * (MAX_SCALE - 1);

      // Origin is the screen center, so this always resolves to a
      // perfectly centered viewBox at every scale — no drift.
      const originX = dims.width / 2;
      const originY = dims.height / 2;
      const visibleW = dims.width / scale;
      const visibleH = dims.height / scale;
      const minX = originX * (1 - 1 / scale);
      const minY = originY * (1 - 1 / scale);
      svgRef.current.setAttribute('viewBox', `${minX} ${minY} ${visibleW} ${visibleH}`);

      const fadeT = Math.min(
        1,
        Math.max(0, (progress - OVERLAY_FADE_START) / (OVERLAY_FADE_END - OVERLAY_FADE_START))
      );
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
              NESTORA
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
