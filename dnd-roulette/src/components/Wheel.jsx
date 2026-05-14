const SEGMENT_COLORS = [
  { fill: '#eff6ff', stroke: '#2563eb', text: '#1e40af' },
  { fill: '#f0fdf4', stroke: '#16a34a', text: '#15803d' },
  { fill: '#fef2f2', stroke: '#dc2626', text: '#b91c1c' },
  { fill: '#fffbeb', stroke: '#f59e0b', text: '#d97706' },
  { fill: '#f5f3ff', stroke: '#a855f7', text: '#7e22ce' },
  { fill: '#ecfdf5', stroke: '#0d9488', text: '#0f766e' },
  { fill: '#fef3c7', stroke: '#ca8a04', text: '#92400e' },
  { fill: '#f3e8ff', stroke: '#9333ea', text: '#6b21a8' },
  { fill: '#dbeafe', stroke: '#3b82f6', text: '#1e3a8a' },
  { fill: '#fce7f3', stroke: '#ec4899', text: '#831843' },
  { fill: '#e0f2fe', stroke: '#0284c7', text: '#0c2d6b' },
  { fill: '#f9fafb', stroke: '#6b7280', text: '#374151' },
]

export default function Wheel({ options, rotation, spinning, onSpin, disabled, resultIdx }) {
  const N = options.length
  const SIZE = 340
  const cx = SIZE / 2
  const cy = SIZE / 2
  const r = SIZE / 2 - 10

  const segments = options.map((name, i) => {
    const seg = 360 / N
    const s1 = (i * seg - 90) * Math.PI / 180
    const s2 = ((i + 1) * seg - 90) * Math.PI / 180
    const x1 = (cx + r * Math.cos(s1)).toFixed(2)
    const y1 = (cy + r * Math.sin(s1)).toFixed(2)
    const x2 = (cx + r * Math.cos(s2)).toFixed(2)
    const y2 = (cy + r * Math.sin(s2)).toFixed(2)
    const large = seg > 180 ? 1 : 0
    const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2}Z`
    const midDeg = i * seg - 90 + seg / 2
    const midRad = midDeg * Math.PI / 180
    const tr = r * 0.62
    const tx = (cx + tr * Math.cos(midRad)).toFixed(2)
    const ty = (cy + tr * Math.sin(midRad)).toFixed(2)
    const col = SEGMENT_COLORS[i % SEGMENT_COLORS.length]
    const fontSize = N <= 8 ? 12 : N <= 10 ? 11 : 10
    const label = name.length > 12 ? name.slice(0, 11) + '…' : name
    return { path, tx, ty, midDeg, col, label, fontSize }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      {/* Pointer arrow */}
      <div style={{ position: 'relative', zIndex: 10, marginBottom: -14 }}>
        <div style={{
          width: 0, height: 0,
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          borderTop: '24px solid #3b82f6',
          filter: 'drop-shadow(0 2px 6px rgba(37,99,235,0.4))',
          position: 'relative', zIndex: 10
        }} />
      </div>

      {/* Wheel SVG */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: -8,
          borderRadius: '50%',
          boxShadow: '0 8px 32px rgba(37,99,235,0.15)',
          pointerEvents: 'none'
        }} />
        <svg
          width={SIZE} height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 4.5s cubic-bezier(0.05, 0.8, 0.1, 1)' : 'none',
            display: 'block'
          }}
        >
          {/* Outer decorative ring */}
          <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="#2563eb" strokeWidth="1.5" opacity="0.6" />
          <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#93c5fd" strokeWidth="0.5" opacity="0.4" />

          {/* Segments */}
          {segments.map((s, i) => (
            <g key={i}>
              <path d={s.path} fill={s.col.fill} stroke={s.col.stroke} strokeWidth="2" />
              <g transform={`translate(${s.tx},${s.ty}) rotate(${s.midDeg + 90})`}>
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={s.fontSize}
                  fontWeight="700"
                  fontFamily="'Space Mono', monospace"
                  fill={s.col.text}
                  style={{ userSelect: 'none', letterSpacing: '0.01em' }}
                >
                  {s.label}
                </text>
              </g>
            </g>
          ))}

          {/* Center hub */}
          <circle cx={cx} cy={cy} r={28} fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={20} fill="#eff6ff" stroke="#93c5fd" strokeWidth="1" opacity="0.6" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="20" style={{ userSelect: 'none' }}>⚔️</text>
        </svg>
      </div>

      {/* Spin button */}
      <button
        onClick={onSpin}
        disabled={disabled}
        style={{
          marginTop: 36,
          padding: '14px 40px',
          borderRadius: 8,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: '0.02em',
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: 'none',
          background: disabled ? '#d1d5db' : '#2563eb',
          color: disabled ? '#9ca3af' : '#fff',
          transition: 'all 0.2s',
          boxShadow: disabled ? 'none' : '0 4px 12px rgba(37,99,235,0.25)',
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseOver={e => !disabled && (e.target.style.background = '#1d4ed8')}
        onMouseOut={e => !disabled && (e.target.style.background = '#2563eb')}
      >
        {spinning ? '⟳ Spinning...' : '🎲 Spin'}
      </button>
    </div>
  )
}
