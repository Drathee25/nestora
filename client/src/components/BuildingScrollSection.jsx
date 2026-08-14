import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const stops = [
  { at: 0, align: 'left', isHero: true },
  { at: 0.2, align: 'right', num: '01', title: 'Premium Interiors', body: 'Light-filled floors, balconies on every home, and finishes built to last generations.' },
  { at: 0.4, align: 'left', num: '02', title: 'Landscaped Grounds', body: 'Courtyards, paved walkways, and greenery around every tower — designed for everyday life, not just the lobby.' },
  { at: 0.6, align: 'right', num: '03', title: 'Prime Locations', body: 'Walk to metro, markets, and parks in every neighbourhood we list across the capital.' },
  { at: 0.8, align: 'left', num: '04', title: 'Verified & Transparent', body: 'RERA-registered projects, clear legal titles, and transparent pricing — invest with complete peace of mind.' },
];

const SECTION_HEIGHT_VH = 450;

export default function BuildingScrollSection() {
  const wrapperRef = useRef(null);
  const videoRef = useRef(null);
  // Lerped currentTime: current is the displayed value, target is where scroll wants to be
  const videoStateRef = useRef({ current: 0, target: 0 });
  const [activeStop, setActiveStop] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  // Compute scroll progress fresh from the DOM — no stale cache
  const getProgress = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.min(1, Math.max(0, -rect.top / scrollable));
  }, []);

  // RAF loop: drives video currentTime with lerp + updates carousel + active stop
  useEffect(() => {
    const state = videoStateRef.current;
    let rafId;

    function tick() {
      rafId = requestAnimationFrame(tick);

      const progress = getProgress();

      // Update active stop (cheap integer compare avoids re-renders)
      const idx = [...stops].reverse().findIndex((s) => progress >= s.at);
      const resolved = idx === -1 ? 0 : stops.length - 1 - idx;
      setActiveStop((prev) => (prev === resolved ? prev : resolved));

      // Video scrub with lerp — slightly snappier catch-up than before
      const vid = videoRef.current;
      if (vid && vid.duration) {
        state.target = progress * vid.duration;
        state.current += (state.target - state.current) * 0.2;
        if (Math.abs(vid.currentTime - state.current) > 0.01) {
          vid.currentTime = state.current;
        }
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [getProgress]);

  const isHero = activeStop === 0;

  return (
    <section ref={wrapperRef} className="relative" style={{ height: `${SECTION_HEIGHT_VH}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#1f4d36]">
        <div className="absolute inset-0" style={{ transform: 'translateZ(0)' }}>
          <img
            src="/hero-poster.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <video
            ref={videoRef}
            src="/hero.mp4"
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setVideoReady(true)}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out"
            style={{ willChange: 'contents, opacity', opacity: videoReady ? 1 : 0 }}
          />
        </div>

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#12281c]/75 via-[#12281c]/25 to-[#12281c]/80" />

        <div className="relative z-10 h-full flex flex-col justify-between px-6 md:px-12 py-12">
          {!isHero && (
            <p className="text-xs tracking-[0.3em] uppercase text-[#d97f2e] font-medium pointer-events-none">
              Walk Around the Property
            </p>
          )}

          {isHero ? (
            <div className="flex-1 flex flex-col justify-center">
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-xs tracking-[0.3em] uppercase text-[#d97f2e] font-medium mb-4"
              >
                Nestora by Akash Khatri &middot; Your Trusted Real Estate Partner
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-display text-5xl md:text-7xl tracking-tight text-[#faf3e7] max-w-2xl"
              >
                Find your next home
                <br />
                in the Capital
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-5 text-[#faf3e7]/70 max-w-md"
              >
                Curated apartments, villas, and plots across Delhi NCR — from South Delhi
                to Gurugram and Noida.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-8 flex gap-4"
              >
                <Link
                  to="/listings"
                  className="px-7 py-3 bg-[#d97f2e] text-[#1f4d36] rounded-full text-sm font-medium tracking-wide hover:bg-[#e89249] transition-colors"
                >
                  Browse Listings
                </Link>
                <Link
                  to="/map"
                  className="px-7 py-3 border border-[#faf3e7]/30 text-[#faf3e7] rounded-full text-sm tracking-wide hover:bg-[#faf3e7]/10 transition-colors"
                >
                  View Map
                </Link>
              </motion.div>
            </div>
          ) : (
            <div
              className={`max-w-xl pointer-events-none ${
                stops[activeStop].align === 'right' ? 'self-end text-right' : 'self-start text-left'
              }`}
            >
              {stops.map(
                (s, i) =>
                  i === activeStop && (
                    <motion.div
                      key={s.title}
                      initial={{ opacity: 0, x: s.align === 'right' ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ willChange: 'transform, opacity' }}
                    >
                      <span className="font-display text-sm text-[#d97f2e]">{s.num}</span>
                      <h3 className="font-display text-5xl md:text-7xl text-[#faf3e7] mt-2">
                        {s.title}
                      </h3>
                      <p className="mt-4 text-[#faf3e7]/70">{s.body}</p>
                    </motion.div>
                  )
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-2 justify-center md:justify-start">
              {stops.map((s, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    activeStop === i ? 'w-10 bg-[#d97f2e]' : 'w-4 bg-[#faf3e7]/30'
                  }`}
                />
              ))}
            </div>

            {isHero && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 8, 0] }}
                transition={{ opacity: { delay: 0.8 }, y: { repeat: Infinity, duration: 1.8 } }}
                className="text-[#faf3e7]/50 text-xs tracking-widest uppercase"
              >
                Scroll
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
