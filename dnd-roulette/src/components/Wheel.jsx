const SEGMENT_COLORS = [
  { fill: '#2D1B69', stroke: '#7C3AED', text: '#DDD6FE' },
  { fill: '#1A3A1F', stroke: '#16A34A', text: '#BBF7D0' },
  { fill: '#3B1515', stroke: '#DC2626', text: '#FECACA' },
  { fill: '#1A2E4A', stroke: '#2563EB', text: '#BFDBFE' },
  { fill: '#3B2A0A', stroke: '#D97706', text: '#FDE68A' },
  { fill: '#2D1033', stroke: '#9333EA', text: '#E9D5FF' },
  { fill: '#1A3A35', stroke: '#0D9488', text: '#99F6E4' },
  { fill: '#3B1A1A', stroke: '#E11D48', text: '#FECDD3' },
  { fill: '#1E2A10', stroke: '#65A30D', text: '#D9F99D' },
  { fill: '#1A1A3B', stroke: '#4F46E5', text: '#C7D2FE' },
  { fill: '#3B2A10', stroke: '#B45309', text: '#FDE68A' },
  { fill: '#2A1033', stroke: '#C026D3', text: '#F0ABFC' },
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
    const fontSize = N <= 8 ? 11 : N <= 10 ? 10 : 9
    const label = name.length > 12 ? name.slice(0, 11) + '…' : name
    return { path, tx, ty, midDeg, col, label, fontSize }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      {/* Pointer arrow */}
      <div style={{ position: 'relative', zIndex: 10, marginBottom: -12 }}>
        <div style={{
          width: 0, height: 0,
          borderLeft: '14px solid transparent',
          borderRight: '14px solid transparent',
          borderTop: '28px solid #C9A84C',
          filter: 'drop-shadow(0 2px 8px rgba(201,168,76,0.6))',
          position: 'relative', zIndex: 10
        }} />
      </div>

      {/* Wheel SVG */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: -4,
          borderRadius: '50%',
          boxShadow: `0 0 40px rgba(201,168,76,0.15), 0 0 80px rgba(124,58,237,0.1)`,
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
          <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.4" />
          <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.6" />

          {/* Segments */}
          {segments.map((s, i) => (
            <g key={i}>
              <path d={s.path} fill={s.col.fill} stroke={s.col.stroke} strokeWidth="1.5" />
              <g transform={`translate(${s.tx},${s.ty}) rotate(${s.midDeg + 90})`}>
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={s.fontSize}
                  fontWeight="600"
                  fontFamily="'Raleway', sans-serif"
                  fill={s.col.text}
                  style={{ userSelect: 'none', letterSpacing: '0.02em' }}
                >
                  {s.label}
                </text>
              </g>
            </g>
          ))}

          {/* Center hub */}
          <circle cx={cx} cy={cy} r={26} fill="#0d0d1a" stroke="#C9A84C" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={20} fill="#0d0d1a" stroke="#C9A84C" strokeWidth="0.5" opacity="0.5" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="18" style={{ userSelect: 'none' }}>⚔️</text>
        </svg>
      </div>

      {/* Spin button */}
      <button
        onClick={onSpin}
        disabled={disabled}
        style={{
          marginTop: 28,
          padding: '14px 44px',
          borderRadius: 4,
          fontFamily: "'Cinzel', serif",
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: disabled ? '1px solid #333' : '1px solid #C9A84C',
          background: disabled ? '#111' : 'linear-gradient(180deg, #1a1200 0%, #0d0900 100%)',
          color: disabled ? '#555' : '#C9A84C',
          transition: 'all 0.2s',
          boxShadow: disabled ? 'none' : '0 0 20px rgba(201,168,76,0.2), inset 0 1px 0 rgba(201,168,76,0.1)',
        }}
      >
        {spinning ? '✦ Вращается...' : '🎲 Вращать колесо'}
      </button>
    </div>
  )
}
