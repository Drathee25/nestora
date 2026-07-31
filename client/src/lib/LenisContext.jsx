import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

const LenisContext = createContext(null);

export function LenisProvider({ children }) {
  const lenisRef = useRef(null);
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = instance;
    setLenis(instance);
    if (import.meta.env.DEV) window.__lenis = instance;

    function raf(time) {
      instance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export function useLenisInstance() {
  return useContext(LenisContext);
}

// Subscribes to Lenis scroll updates. Falls back to native scroll events if Lenis isn't ready yet.
export function useLenisScroll(onScroll) {
  const lenis = useLenisInstance();

  useEffect(() => {
    if (!lenis) return;
    lenis.on('scroll', onScroll);
    return () => lenis.off('scroll', onScroll);
  }, [lenis, onScroll]);
}
