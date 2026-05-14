import { useState } from 'react'
import Wheel from './components/Wheel.jsx'
import CharacterSheet from './components/CharacterSheet.jsx'

// ─── DnD Data ──────────────────────────────────────────────────────────────
const STEPS = [
  {
    key: 'race',
    label: 'Раса',
    subtitle: 'Кем ты рождён в этом мире?',
    icon: '🧬',
    options: ['Человек','Эльф','Дварф','Полурослик','Гном','Полуорк','Тифлинг','Драконорождённый','Полуэльф'],
  },
  {
    key: 'class',
    label: 'Класс',
    subtitle: 'Каков твой путь?',
    icon: '⚔️',
    options: ['Воин','Маг','Плут','Жрец','Следопыт','Паладин','Варвар','Бард','Друид','Монах','Чародей','Колдун'],
  },
  {
    key: 'background',
    label: 'Предыстория',
    subtitle: 'Откуда ты пришёл?',
    icon: '📜',
    options: ['Прислужник','Преступник','Народный герой','Дворянин','Мудрец','Солдат','Чужеземец','Артист','Отшельник','Торговец'],
  },
  {
    key: 'alignment',
    label: 'Мировоззрение',
    subtitle: 'Каковы твои принципы?',
    icon: '⚖️',
    options: ['Законопослушный добрый','Нейтральный добрый','Хаотичный добрый','Законопослушный нейтральный','Истинно нейтральный','Хаотичный нейтральный','Законопослушный злой','Нейтральный злой','Хаотичный злой'],
  },
]

// ─── Dice Utils ─────────────────────────────────────────────────────────────
function roll4d6dropLowest() {
  const dice = [1, 2, 3, 4].map(() => Math.ceil(Math.random() * 6))
  dice.sort((a, b) => b - a)
  return dice[0] + dice[1] + dice[2]
}

function rollStats() {
  return {
    STR: roll4d6dropLowest(),
    DEX: roll4d6dropLowest(),
    CON: roll4d6dropLowest(),
    INT: roll4d6dropLowest(),
    WIS: roll4d6dropLowest(),
    CHA: roll4d6dropLowest(),
  }
}

// ─── Gradient Background ────────────────────────────────────────────────────
function GradientBg() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e8f0f8 100%)',
      pointerEvents: 'none',
      zIndex: 0,
    }} />
  )
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [resultIdx, setResultIdx] = useState(null)
  const [character, setCharacter] = useState({})
  const [phase, setPhase] = useState('roll') // 'roll' | 'sheet'
  const [aiData, setAiData] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentStep = STEPS[step]
  const N = currentStep.options.length

  // ── Spin logic ──────────────────────────────────────────────────────────
  const handleSpin = () => {
    if (spinning || resultIdx !== null) return
    const spins = (6 + Math.floor(Math.random() * 5)) * 360
    const extra = Math.floor(Math.random() * 360)
    const newRot = rotation + spins + extra
    setRotation(newRot)
    setSpinning(true)
    setTimeout(() => {
      setSpinning(false)
      const seg = 360 / N
      const finalMod = newRot % 360
      const idx = Math.floor(((360 - (finalMod === 0 ? 360 : finalMod)) % 360) / seg) % N
      setResultIdx(idx)
    }, 4600)
  }

  // ── Next step ───────────────────────────────────────────────────────────
  const handleNext = () => {
    const chosen = currentStep.options[resultIdx]
    const newChar = { ...character, [currentStep.key]: chosen }
    setResultIdx(null)

    if (step < STEPS.length - 1) {
      setCharacter(newChar)
      setStep(step + 1)
      setRotation(0)
    } else {
      const fullChar = { ...newChar, stats: rollStats() }
      setCharacter(fullChar)
      setPhase('sheet')
    }
  }

  // ── Generate with Claude API ─────────────────────────────────────────────
  const handleGenerate = async () => {
    setAiLoading(true)
    const { race, class: cls, background, alignment } = character
    const prompt = `Ты мастер DnD 5e. Персонаж: Раса ${race}, Класс ${cls}, Предыстория ${background}, Мировоззрение ${alignment}. Ответь ТОЛЬКО валидным JSON без markdown-блоков и без пояснений: {"name":"<красивое имя для этого персонажа>","backstory":"<3-4 предложения на русском — история персонажа, откуда он пришёл, что им движет>","imagePrompt":"<30-50 words English visual description for image generation: character appearance, equipment, setting, artistic style — fantasy, cinematic>"}`
    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await response.json()
      const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('')
      const clean = text.replace(/```json|```/g, '').trim()
      setAiData(JSON.parse(clean))
    } catch (err) {
      console.error('API error:', err)
      setAiData({
        name: 'Безымянный странник',
        backstory: 'История этого искателя приключений хранится в тени. Судьба привела его на этот путь — и лишь время откроет, куда он ведёт.',
        imagePrompt: `${character.race} ${character.class} adventurer, detailed fantasy armor, dramatic lighting, cinematic composition, digital art, DnD 5e style`,
      })
    }
    setAiLoading(false)
  }

  const handleCopy = () => {
    if (!aiData) return
    navigator.clipboard.writeText(aiData.imagePrompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleRestart = () => {
    setStep(0); setRotation(0); setSpinning(false); setResultIdx(null)
    setCharacter({}); setPhase('roll'); setAiData(null); setAiLoading(false)
  }

  // ── Character Sheet ──────────────────────────────────────────────────────
  if (phase === 'sheet') {
    return (
      <>
        <GradientBg />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <CharacterSheet
            character={character}
            aiData={aiData}
            onGenerate={handleGenerate}
            aiLoading={aiLoading}
            onCopy={handleCopy}
            copied={copied}
            onRestart={handleRestart}
          />
        </div>
      </>
    )
  }

  // ── Roll Phase ───────────────────────────────────────────────────────────
  return (
    <>
      <GradientBg />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingTop: '1rem' }}>
          <div style={{ fontSize: 12, color: '#5a6b7f', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif", marginBottom: 8, fontWeight: 500 }}>
            Dungeons &amp; Dragons 5e
          </div>
          <h1 style={{ fontFamily: "'Space Mono', monospace", fontSize: 32, fontWeight: 700, color: '#1a1a1a', margin: 0, letterSpacing: '0.02em' }}>
            Character Roulette
          </h1>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 6, width: '100%', maxWidth: 380, marginBottom: '2rem' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i < step ? '#2563eb' : i === step ? '#93c5fd' : '#d1d5db',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>

        {/* Step header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 12, color: '#5a6b7f', letterSpacing: '0.1em', fontFamily: "'Inter', sans-serif", marginBottom: 6, fontWeight: 500 }}>
            Step {step + 1} of {STEPS.length}
          </div>
          <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px', letterSpacing: '0.01em' }}>
            {currentStep.icon} {currentStep.label}
          </h2>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0, fontFamily: "'Inter', sans-serif" }}>
            {currentStep.subtitle}
          </p>
        </div>

        {/* Wheel */}
        <Wheel
          options={currentStep.options}
          rotation={rotation}
          spinning={spinning}
          onSpin={handleSpin}
          disabled={spinning || resultIdx !== null}
          resultIdx={resultIdx}
        />

        {/* Result panel */}
        {resultIdx !== null && (
          <div style={{
            marginTop: 32, width: '100%', maxWidth: 360,
            border: '2px solid #3b82f6',
            borderRadius: 12,
            padding: '24px',
            background: '#eff6ff',
            textAlign: 'center',
            animation: 'slideUp 0.3s ease',
          }}>
            <div style={{ fontSize: 11, color: '#5a6b7f', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif", marginBottom: 12, fontWeight: 600 }}>Fate decides</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 26, fontWeight: 700, color: '#1e40af', marginBottom: 20 }}>
              {currentStep.options[resultIdx]}
            </div>
            <button
              onClick={handleNext}
              style={{
                padding: '12px 28px', borderRadius: 8,
                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.02em',
                cursor: 'pointer',
                background: '#2563eb', color: '#fff', border: 'none',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => e.target.style.background = '#1d4ed8'}
              onMouseOut={e => e.target.style.background = '#2563eb'}
            >
              {step < STEPS.length - 1 ? 'Next →' : 'View Character →'}
            </button>
          </div>
        )}

        {/* Already chosen */}
        {Object.keys(character).length > 0 && (
          <div style={{ marginTop: 32, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 380 }}>
            {Object.entries(character).map(([k, v]) => (
              <span key={k} style={{
                fontSize: 12, padding: '6px 12px', borderRadius: 6,
                border: '1px solid #e5e7eb', color: '#4b5563',
                fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em',
                background: '#f3f4f6'
              }}>{v}</span>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
