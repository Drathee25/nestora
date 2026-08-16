// Minimal architectural-elevation illustration — a confident solid silhouette
// with sparse, fine gold linework (floor lines, bay divisions) rather than a
// literal window grid, in the vein of how luxury real-estate brands render
// buildings: restrained, mostly negative space, one accent color.
//
// Parallax is driven entirely by CSS: an ancestor writes the `--progress`
// custom property (0-1) via a ref on every Lenis scroll tick, and each layer
// below reads it through calc() with its own `transition` doing the easing —
// no JS animation loop needed here.

// Kept close to the viewBox's horizontal center (800) with a generous
// margin — on narrow/tall mobile viewports, `preserveAspectRatio="slice"`
// crops aggressively to the sides, so anything positioned too far off-center
// gets cut out of frame entirely.
const TOWER_X = 690;
const TOWER_WIDTH = 220;
const TOWER_TOP = 210;
const TOWER_BOTTOM = 660;
const CROWN_TOP = 150;
const PODIUM_BOTTOM = 760;

const SKYLINE = [
  { x: 20, w: 70, h: 130 },
  { x: 120, w: 50, h: 90 },
  { x: 200, w: 85, h: 170 },
  { x: 310, w: 60, h: 110 },
  { x: 400, w: 95, h: 190 },
  { x: 520, w: 55, h: 100 },
  { x: 980, w: 60, h: 110 },
  { x: 1080, w: 90, h: 180 },
  { x: 1200, w: 65, h: 120 },
  { x: 1300, w: 100, h: 200 },
  { x: 1430, w: 70, h: 140 },
  { x: 1530, w: 55, h: 95 },
];

// Sparse floor lines — an architectural cue, not a literal window grid.
const FLOOR_LINES = 6;
// Vertical bay divisions across the facade.
const BAYS = 3;

export default function HeroIllustration() {
  const floorStep = (TOWER_BOTTOM - TOWER_TOP) / (FLOOR_LINES + 1);

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3e8d0" />
          <stop offset="100%" stopColor="#e1d0a9" />
        </linearGradient>
        <radialGradient id="hero-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d97f2e" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#d97f2e" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#hero-sky)" />

      {/* Sun glow — soft, drifts slowly */}
      <circle
        cx="1180"
        cy="200"
        r="220"
        fill="url(#hero-sun)"
        style={{
          transform: 'translateX(calc(var(--progress, 0) * 40px))',
          transition: 'transform 500ms ease-out',
        }}
      />

      {/* Skyline — soft background parallax, kept faint for depth */}
      <g
        style={{
          transform: 'translateY(calc(var(--progress, 0) * -20px))',
          transition: 'transform 450ms ease-out',
        }}
      >
        {SKYLINE.map((b, i) => (
          <rect key={i} x={b.x} y={780 - b.h} width={b.w} height={b.h} fill="#1f4d36" opacity={0.07} />
        ))}
      </g>

      {/* Ground line */}
      <rect x="0" y="780" width="1600" height="1.5" fill="#1f4d36" opacity={0.15} />

      {/* Hero building — fast foreground parallax + subtle scale-in */}
      <g
        style={{
          transformBox: 'fill-box',
          transformOrigin: 'center',
          transform:
            'translate(calc(var(--progress, 0) * -60px), calc(var(--progress, 0) * -26px)) scale(calc(1 + var(--progress, 0) * 0.1))',
          transition: 'transform 500ms ease-out',
        }}
      >
        {/* soft ground shadow */}
        <ellipse cx={TOWER_X + TOWER_WIDTH / 2} cy={782} rx={TOWER_WIDTH * 0.9} ry={10} fill="#12281c" opacity={0.15} />

        {/* podium */}
        <rect x={TOWER_X - 30} y={680} width={TOWER_WIDTH + 60} height={PODIUM_BOTTOM - 680} fill="#1f4d36" />

        {/* tower body */}
        <rect x={TOWER_X} y={TOWER_TOP} width={TOWER_WIDTH} height={TOWER_BOTTOM - TOWER_TOP} fill="#1f4d36" />

        {/* crown (setback top tier) */}
        <rect x={TOWER_X + 34} y={CROWN_TOP} width={TOWER_WIDTH - 68} height={TOWER_TOP - CROWN_TOP} fill="#1f4d36" />
        <rect x={TOWER_X + TOWER_WIDTH / 2 - 1.5} y={CROWN_TOP - 46} width={3} height={46} fill="#d97f2e" opacity={0.85} />

        {/* sparse floor lines — fine architectural linework, not a window grid */}
        {Array.from({ length: FLOOR_LINES }, (_, i) => TOWER_TOP + floorStep * (i + 1)).map((y, i) => (
          <rect key={i} x={TOWER_X} y={y} width={TOWER_WIDTH} height={1.4} fill="#d97f2e" opacity={0.35} />
        ))}

        {/* vertical bay divisions */}
        {Array.from({ length: BAYS - 1 }, (_, i) => TOWER_X + ((i + 1) * TOWER_WIDTH) / BAYS).map((x, i) => (
          <rect key={i} x={x} y={TOWER_TOP} width={1.2} height={TOWER_BOTTOM - TOWER_TOP} fill="#d97f2e" opacity={0.25} />
        ))}

        {/* roofline trim */}
        <rect x={TOWER_X + 30} y={CROWN_TOP - 2} width={TOWER_WIDTH - 60} height={3} fill="#d97f2e" />

        {/* entrance line */}
        <rect x={TOWER_X + TOWER_WIDTH / 2 - 55} y={678} width={110} height={2.5} fill="#d97f2e" opacity={0.8} />
      </g>
    </svg>
  );
}
