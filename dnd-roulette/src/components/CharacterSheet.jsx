function StatBox({ stat, value }) {
  const mod = Math.floor((value - 10) / 2)
  const modStr = (mod >= 0 ? '+' : '') + mod
  return (
    <div style={{
      border: '1px solid #2a2418',
      borderRadius: 6,
      padding: '10px 4px',
      textAlign: 'center',
      background: '#0d0d1a',
    }}>
      <div style={{ fontSize: 9, color: '#7a6a50', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4, fontFamily: "'Raleway', sans-serif" }}>{stat}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#e8e0d4', lineHeight: 1, fontFamily: "'Cinzel', serif" }}>{value}</div>
      <div style={{ fontSize: 13, color: '#C9A84C', fontWeight: 600, marginTop: 3, fontFamily: "'Cinzel', serif" }}>{modStr}</div>
    </div>
  )
}

const ATTR_COLORS = [
  { bg: '#2D1B69', border: '#7C3AED', label: '#A78BFA', val: '#DDD6FE' },
  { bg: '#1A3A1F', border: '#16A34A', label: '#6EE7B7', val: '#BBF7D0' },
  { bg: '#3B1515', border: '#B91C1C', label: '#FCA5A5', val: '#FECACA' },
  { bg: '#1A2E4A', border: '#1D4ED8', label: '#93C5FD', val: '#BFDBFE' },
]

export default function CharacterSheet({ character, aiData, onGenerate, aiLoading, onCopy, copied, onRestart }) {
  const stats = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
  const attrs = [
    ['race', 'Раса'],
    ['class', 'Класс'],
    ['background', 'Предыстория'],
    ['alignment', 'Мировоззрение'],
  ]

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem', background: '#080810' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: 11, color: '#7a6a50', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'Raleway', sans-serif", marginBottom: 6 }}>Лист персонажа</div>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 28, fontWeight: 900, color: '#C9A84C', margin: 0, lineHeight: 1, textShadow: '0 0 30px rgba(201,168,76,0.3)' }}>
              {aiData ? aiData.name : '— — —'}
            </h1>
          </div>
          <button
            onClick={onRestart}
            style={{
              padding: '8px 16px', borderRadius: 4, cursor: 'pointer',
              fontFamily: "'Raleway', sans-serif", fontSize: 12, letterSpacing: '0.05em',
              background: 'transparent', border: '1px solid #2a2418', color: '#7a6a50',
            }}
          >↺ Заново</button>
        </div>

        {/* Gold divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)', marginBottom: '1.5rem', opacity: 0.4 }} />

        {/* Attributes grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          {attrs.map(([key, label], i) => {
            const c = ATTR_COLORS[i]
            return (
              <div key={key} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: '10px 14px', opacity: 0.9 }}>
                <div style={{ fontSize: 9, color: c.label, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Raleway', sans-serif", marginBottom: 4, opacity: 0.7 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.val, fontFamily: "'Raleway', sans-serif", lineHeight: 1.3 }}>{character[key]}</div>
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: '1.75rem' }}>
          {stats.map(s => <StatBox key={s} stat={s} value={character.stats[s]} />)}
        </div>

        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)', marginBottom: '1.5rem', opacity: 0.2 }} />

        {/* AI section */}
        {!aiData ? (
          <button
            onClick={onGenerate}
            disabled={aiLoading}
            style={{
              width: '100%', padding: '16px', borderRadius: 4,
              fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.08em',
              cursor: aiLoading ? 'wait' : 'pointer',
              border: aiLoading ? '1px solid #333' : '1px solid #C9A84C',
              background: aiLoading ? '#111' : 'transparent',
              color: aiLoading ? '#555' : '#C9A84C',
              textTransform: 'uppercase',
              boxShadow: aiLoading ? 'none' : '0 0 20px rgba(201,168,76,0.1)',
              transition: 'all 0.3s'
            }}
          >
            {aiLoading ? '✦ Генерируем предысторию...' : '✦ Сгенерировать предысторию и промпт'}
          </button>
        ) : (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: 10, color: '#7a6a50', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'Raleway', sans-serif", marginBottom: 8 }}>Предыстория</div>
              <p style={{
                fontSize: 14, lineHeight: 1.75, color: '#c8bfa8',
                background: '#0d0d18', border: '1px solid #1e1a12',
                borderRadius: 6, padding: '14px 16px', fontFamily: "'Raleway', sans-serif",
                fontStyle: 'italic', margin: 0
              }}>
                {aiData.backstory}
              </p>
            </div>

            <div>
              <div style={{ fontSize: 10, color: '#7a6a50', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'Raleway', sans-serif", marginBottom: 8 }}>
                Промпт для изображения
                <span style={{ fontSize: 9, marginLeft: 8, color: '#4a4030', textTransform: 'none', letterSpacing: 0 }}>Midjourney / DALL-E / Stable Diffusion</span>
              </div>
              <div style={{ background: '#0a0a10', border: '1px solid #1e1a12', borderRadius: 6, padding: '12px 14px', marginBottom: 8 }}>
                <p style={{ fontSize: 12, fontFamily: 'monospace', lineHeight: 1.65, color: '#9b9b7a', margin: 0 }}>{aiData.imagePrompt}</p>
              </div>
              <button
                onClick={onCopy}
                style={{
                  width: '100%', padding: '10px',
                  fontFamily: "'Raleway', sans-serif", fontSize: 12, letterSpacing: '0.05em',
                  background: 'transparent', border: '1px solid #2a2418',
                  borderRadius: 4, color: copied ? '#C9A84C' : '#7a6a50',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {copied ? '✓ Скопировано' : '📋 Скопировать промпт'}
              </button>
            </div>
          </div>
        )}

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}
