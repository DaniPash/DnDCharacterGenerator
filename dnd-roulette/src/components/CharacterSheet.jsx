function StatBox({ stat, value }) {
  const mod = Math.floor((value - 10) / 2)
  const modStr = (mod >= 0 ? '+' : '') + mod
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: '12px 8px',
      textAlign: 'center',
      background: '#f9fafb',
    }}>
      <div style={{ fontSize: 10, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{stat}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', lineHeight: 1, fontFamily: "'Space Mono', monospace" }}>{value}</div>
      <div style={{ fontSize: 13, color: '#2563eb', fontWeight: 600, marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{modStr}</div>
    </div>
  )
}

const ATTR_COLORS = [
  { bg: '#eff6ff', border: '#2563eb', label: '#1e3a8a', val: '#1e40af' },
  { bg: '#f0fdf4', border: '#16a34a', label: '#15803d', val: '#15803d' },
  { bg: '#fef2f2', border: '#dc2626', label: '#b91c1c', val: '#b91c1c' },
  { bg: '#fffbeb', border: '#f59e0b', label: '#b45309', val: '#b45309' },
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
    <div style={{ minHeight: '100vh', padding: '2rem 1rem', background: 'linear-gradient(135deg, #f5f5f5 0%, #e8f0f8 100%)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', paddingTop: '1rem' }}>
          <div>
            <div style={{ fontSize: 12, color: '#5a6b7f', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif", marginBottom: 8, fontWeight: 500 }}>Character Sheet</div>
            <h1 style={{ fontFamily: "'Space Mono', monospace", fontSize: 32, fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1 }}>
              {aiData ? aiData.name : '— — —'}
            </h1>
          </div>
          <button
            onClick={onRestart}
            style={{
              padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", fontSize: 12, letterSpacing: '0.02em',
              background: 'transparent', border: '1px solid #d1d5db', color: '#6b7280',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.target.style.background = '#f3f4f6'}
            onMouseOut={e => e.target.style.background = 'transparent'}
          >↺ Again</button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#e5e7eb', marginBottom: '1.5rem' }} />

        {/* Attributes grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {attrs.map(([key, label], i) => {
            const c = ATTR_COLORS[i]
            return (
              <div key={key} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 10, color: c.label, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif", marginBottom: 6, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.val, fontFamily: "'Inter', sans-serif", lineHeight: 1.3 }}>{character[key]}</div>
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: '2rem' }}>
          {stats.map(s => <StatBox key={s} stat={s} value={character.stats[s]} />)}
        </div>

        <div style={{ height: 1, background: '#e5e7eb', marginBottom: '2rem' }} />

        {/* AI section */}
        {!aiData ? (
          <button
            onClick={onGenerate}
            disabled={aiLoading}
            style={{
              width: '100%', padding: '16px', borderRadius: 8,
              fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15, letterSpacing: '0.02em',
              cursor: aiLoading ? 'wait' : 'pointer',
              border: 'none',
              background: aiLoading ? '#d1d5db' : '#2563eb',
              color: aiLoading ? '#9ca3af' : '#fff',
              transition: 'all 0.2s',
              boxShadow: aiLoading ? 'none' : '0 4px 12px rgba(37,99,235,0.25)',
              opacity: aiLoading ? 0.6 : 1,
            }}
            onMouseOver={e => !aiLoading && (e.target.style.background = '#1d4ed8')}
            onMouseOut={e => !aiLoading && (e.target.style.background = '#2563eb')}
          >
            {aiLoading ? '⟳ Generating story...' : '✨ Generate Story & Image Prompt'}
          </button>
        ) : (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 11, color: '#5a6b7f', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif", marginBottom: 10, fontWeight: 600 }}>Backstory</div>
              <p style={{
                fontSize: 14, lineHeight: 1.7, color: '#374151',
                background: '#f9fafb', border: '1px solid #e5e7eb',
                borderRadius: 8, padding: '16px', fontFamily: "'Inter', sans-serif",
                margin: 0
              }}>
                {aiData.backstory}
              </p>
            </div>

            <div>
              <div style={{ fontSize: 11, color: '#5a6b7f', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif", marginBottom: 10, fontWeight: 600 }}>
                Image Prompt
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px', marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontFamily: 'monospace', lineHeight: 1.6, color: '#4b5563', margin: 0 }}>{aiData.imagePrompt}</p>
              </div>
              <button
                onClick={onCopy}
                style={{
                  width: '100%', padding: '12px',
                  fontFamily: "'Inter', sans-serif", fontSize: 13, letterSpacing: '0.02em',
                  background: 'transparent', border: '1px solid #e5e7eb',
                  borderRadius: 8, color: copied ? '#2563eb' : '#6b7280',
                  cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500
                }}
                onMouseOver={e => e.target.style.background = '#f3f4f6'}
                onMouseOut={e => e.target.style.background = 'transparent'}
              >
                {copied ? '✓ Copied' : '📋 Copy Prompt'}
              </button>
            </div>
          </div>
        )}

        <div style={{ height: 48 }} />
      </div>
    </div>
  )
}
