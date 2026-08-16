import { useEffect, useRef } from 'react';
import { useLenisScroll } from '../lib/LenisContext';

// Recreates lenis.dev's "Enter Lenis" intro: giant type fills the screen,
// then the camera zooms into the negative space right next to one letter's
// stroke until the black hero gives way entirely to the next (light)
// section underneath. Scale is driven straight off Lenis scroll ticks —
// no easing/lerp here, since the zoom should feel exactly scrubbed to the
// scroll, not smoothed after it.

const SECTION_HEIGHT_VH = 300;
const MAX_SCALE = 16;
// Reveal the cream section starting this far into the zoom, finishing at 1.
const REVEAL_START = 0.72;

export default function EnterNestoraSection() {
  const wrapperRef = useRef(null);
  const zoomRef = useRef(null);
  const tRef = useRef(null);
  const revealRef = useRef(null);

  // Anchor the zoom on the "T" — measured once (at rest, scale 1) as a
  // percentage of the heading's own box, so it stays correct at any
  // viewport size without per-frame recomputation.
  useEffect(() => {
    function measure() {
      const container = zoomRef.current;
      const letter = tRef.current;
      if (!container || !letter) return;
      const c = container.getBoundingClientRect();
      const t = letter.getBoundingClientRect();
      const originX = ((t.left + t.width / 2 - c.left) / c.width) * 100;
      const originY = ((t.top + t.height / 2 - c.top) / c.height) * 100;
      container.style.transformOrigin = `${originX}% ${originY}%`;
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const handleScroll = () => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;

    if (zoomRef.current) {
      const scale = 1 + progress * (MAX_SCALE - 1);
      zoomRef.current.style.transform = `scale(${scale})`;
    }
    if (revealRef.current) {
      const revealT = Math.min(1, Math.max(0, (progress - REVEAL_START) / (1 - REVEAL_START)));
      revealRef.current.style.opacity = revealT;
    }
  };

  useLenisScroll(handleScroll);
  useEffect(() => {
    handleScroll();
  }, []);

  return (
    <section ref={wrapperRef} className="relative bg-black" style={{ height: `${SECTION_HEIGHT_VH}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-black flex flex-col items-center justify-center">
        <div ref={zoomRef} className="flex flex-col items-center" style={{ willChange: 'transform' }}>
          <h1
            className="font-display text-[18vw] leading-none tracking-tight select-none"
            style={{
              backgroundImage: "url('/hero/scene-0.webp')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
            }}
          >
            NES
            <span ref={tRef}>T</span>
            ORA
          </h1>
          <p className="mt-4 text-sm md:text-base tracking-[0.3em] uppercase text-[#faf3e7]/70">
            by Akash Khatri
          </p>
        </div>

        <div ref={revealRef} className="absolute inset-0 bg-[#faf3e7] pointer-events-none" style={{ opacity: 0 }} />
      </div>
    </section>
  );
}
