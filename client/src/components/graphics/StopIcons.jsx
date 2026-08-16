// Small line-icon accents shown next to each scroll-stop's text.
// Kept as plain stroke-based SVGs (no fills) so they read consistently at
// any size and pick up currentColor from their wrapping element.

const shared = {
  width: 32,
  height: 32,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function InteriorsIcon(props) {
  return (
    <svg {...shared} {...props}>
      <rect x="3" y="4" width="18" height="14" rx="1.5" />
      <path d="M3 11h18" />
      <path d="M12 4v14" />
    </svg>
  );
}

export function LandscapeIcon(props) {
  return (
    <svg {...shared} {...props}>
      <path d="M12 3c3 3 5 6 5 9a5 5 0 0 1-10 0c0-3 2-6 5-9Z" />
      <path d="M12 14v7" />
    </svg>
  );
}

export function LocationIcon(props) {
  return (
    <svg {...shared} {...props}>
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function VerifiedIcon(props) {
  return (
    <svg {...shared} {...props}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export const STOP_ICONS = {
  '01': InteriorsIcon,
  '02': LandscapeIcon,
  '03': LocationIcon,
  '04': VerifiedIcon,
};
