// Decorative campus scene (pure SVG, no images). Marked aria-hidden: it carries no information.
export default function CampusIllustration({ className = '' }) {
  const windows = (x, y, cols, rows, lit = []) =>
    Array.from({ length: cols * rows }, (_, i) => (
      <rect key={i} x={x + (i % cols) * 16} y={y + Math.floor(i / cols) * 18} width="9" height="11" rx="2" fill={lit.includes(i) ? '#5fe3d2' : '#2d4a7a'} opacity={lit.includes(i) ? 0.95 : 0.7} />
    ))
  return (
    <svg viewBox="0 0 640 420" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d1f3c" />
          <stop offset="1" stopColor="#13294f" />
        </linearGradient>
      </defs>
      <rect width="640" height="420" rx="24" fill="url(#sky)" />
      <circle cx="520" cy="80" r="30" fill="#f3ede2" opacity=".92" />
      <circle cx="532" cy="72" r="26" fill="#0d1f3c" opacity=".35" />
      {[[90, 70], [330, 50], [430, 110]].map(([x, y], i) => (
        <g key={i} className="drift" style={{ animationDelay: -i * 6 + 's', animationDuration: 20 + i * 6 + 's' }} opacity=".16">
          <ellipse cx={x} cy={y} rx="46" ry="11" fill="#fff" />
          <ellipse cx={x + 22} cy={y - 8} rx="26" ry="9" fill="#fff" />
        </g>
      ))}
      {/* library (left) */}
      <rect x="36" y="190" width="150" height="150" rx="6" fill="#13294f" />
      <rect x="36" y="180" width="150" height="14" rx="4" fill="#2d4a7a" />
      {windows(52, 208, 7, 5, [2, 9, 17, 25, 30])}
      {/* clock tower (center) */}
      <rect x="262" y="96" width="96" height="244" rx="6" fill="#0d1f3c" stroke="#2d4a7a" strokeWidth="2" />
      <polygon points="254,100 310,44 366,100" fill="#14b8a6" />
      <circle cx="310" cy="140" r="26" fill="#faf7f2" />
      <circle cx="310" cy="140" r="22" fill="none" stroke="#0d1f3c" strokeWidth="2" />
      <path d="M310 140V124M310 140l11 6" stroke="#0d1f3c" strokeWidth="3" strokeLinecap="round" />
      {windows(279, 188, 4, 6, [1, 6, 11, 16, 22])}
      <rect x="292" y="296" width="36" height="44" rx="18" fill="#14b8a6" />
      {/* science block (right) */}
      <rect x="430" y="170" width="170" height="170" rx="6" fill="#13294f" />
      <rect x="430" y="160" width="170" height="14" rx="4" fill="#4fc99a" />
      {windows(448, 190, 8, 6, [3, 11, 14, 22, 30, 37])}
      {/* ground, path, trees */}
      <rect x="0" y="340" width="640" height="80" fill="#08142a" />
      <path d="M262 420 L296 340 H324 L378 420 Z" fill="#e6dccb" opacity=".85" />
      {[[214, 300], [220, 318], [406, 296], [400, 316]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 2} y={y + 8} width="4" height="34" fill="#0d1f3c" />
          <circle cx={x} cy={y} r="22" fill={i % 2 ? '#1f9a6c' : '#4fc99a'} />
        </g>
      ))}
      {[40, 90, 140, 480, 530, 580].map((x) => (
        <rect key={x} x={x} y="372" width="26" height="6" rx="3" fill="#2d4a7a" opacity=".6" />
      ))}
    </svg>
  )
}
