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

// ─── Starfield Background ────────────────────────────────────────────────────
function Stars() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.4 + 0.1,
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          borderRadius: '50%',
          background: '#fff',
          opacity: s.opacity,
        }} />
      ))}
    </div>
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
        <Stars />
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
      <Stars />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 11, color: '#7a6a50', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: "'Raleway', sans-serif", marginBottom: 8 }}>
            Dungeons &amp; Dragons 5e
          </div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 900, color: '#C9A84C', margin: 0, letterSpacing: '0.05em', textShadow: '0 0 30px rgba(201,168,76,0.3)' }}>
            Character Roulette
          </h1>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 6, width: '100%', maxWidth: 380, marginBottom: '1.5rem' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              flex: 1, height: 2, borderRadius: 1,
              background: i < step ? '#C9A84C' : i === step ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.07)',
              transition: 'background 0.4s',
              boxShadow: i <= step ? '0 0 8px rgba(201,168,76,0.3)' : 'none'
            }} />
          ))}
        </div>

        {/* Step header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 11, color: '#7a6a50', letterSpacing: '0.1em', fontFamily: "'Raleway', sans-serif", marginBottom: 4 }}>
            Шаг {step + 1} из {STEPS.length}
          </div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: '#e8e0d4', margin: '0 0 4px', letterSpacing: '0.05em' }}>
            {currentStep.icon} {currentStep.label}
          </h2>
          <p style={{ fontSize: 13, color: '#7a6a50', margin: 0, fontFamily: "'Raleway', sans-serif", fontStyle: 'italic' }}>
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
            marginTop: 24, width: '100%', maxWidth: 360,
            border: '1px solid #C9A84C',
            borderRadius: 6,
            padding: '18px 20px',
            background: 'rgba(201,168,76,0.05)',
            textAlign: 'center',
            boxShadow: '0 0 30px rgba(201,168,76,0.1)',
          }}>
            <div style={{ fontSize: 10, color: '#7a6a50', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: "'Raleway', sans-serif", marginBottom: 8 }}>Судьба решила</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: '#C9A84C', marginBottom: 16, textShadow: '0 0 20px rgba(201,168,76,0.4)' }}>
              {currentStep.options[resultIdx]}
            </div>
            <button
              onClick={handleNext}
              style={{
                padding: '11px 32px', borderRadius: 4,
                fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer',
                background: '#C9A84C', color: '#080810', border: 'none',
                boxShadow: '0 4px 20px rgba(201,168,76,0.25)',
              }}
            >
              {step < STEPS.length - 1 ? 'Дальше →' : 'Лист персонажа →'}
            </button>
          </div>
        )}

        {/* Already chosen */}
        {Object.keys(character).length > 0 && (
          <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 380 }}>
            {Object.entries(character).map(([k, v]) => (
              <span key={k} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 20,
                border: '1px solid #2a2418', color: '#7a6a50',
                fontFamily: "'Raleway', sans-serif", letterSpacing: '0.03em'
              }}>{v}</span>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
