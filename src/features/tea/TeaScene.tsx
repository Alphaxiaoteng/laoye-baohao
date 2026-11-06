import { useEffect, useState } from 'react'
import type { BrewStep } from './steps'
import './tea.css'

export type TeaLook = 'real' | 'ink' | 'flat' | 'sketch'

interface TeaSceneProps {
  step: BrewStep
  stepIndex: number
  done: boolean
  /** 茶席画法。默认写实，切换后材质、蒸汽和水流一起变 */
  look?: TeaLook
  /** 首页把步骤名放进下方步骤条，画面里不再另起一行标题 */
  showTitle?: boolean
}

const PHASES = ['warm', 'leaf', 'pour', 'serve', 'offer'] as const

/** 紫砂朱泥壶：壶身、短流、提环、壶盖都用路径 + 渐变 + 泥料噪声绘制 */
function TeapotSvg() {
  return (
    <svg className="pot-svg" viewBox="0 0 220 152" role="presentation" focusable="false">
      <defs>
        <linearGradient id="tea-pot-body" x1="0.24" y1="0.02" x2="0.82" y2="1">
          <stop offset="0" stopColor="#b26440" />
          <stop offset="0.32" stopColor="#94492b" />
          <stop offset="0.68" stopColor="#652a16" />
          <stop offset="1" stopColor="#3a1408" />
        </linearGradient>
        <radialGradient id="tea-pot-glow" cx="0.3" cy="0.18" r="0.62">
          <stop offset="0" stopColor="#ffd9b2" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#ffd9b2" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ffd9b2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tea-pot-spout" x1="0" y1="0" x2="0.55" y2="1">
          <stop offset="0" stopColor="#a65b3a" />
          <stop offset="0.5" stopColor="#7d3820" />
          <stop offset="1" stopColor="#45170b" />
        </linearGradient>
        <linearGradient id="tea-pot-handle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8c4529" />
          <stop offset="0.45" stopColor="#6d2f1a" />
          <stop offset="1" stopColor="#431708" />
        </linearGradient>
        <linearGradient id="tea-pot-lid" x1="0.18" y1="0" x2="0.82" y2="1">
          <stop offset="0" stopColor="#bc6e48" />
          <stop offset="0.55" stopColor="#8f4628" />
          <stop offset="1" stopColor="#521f10" />
        </linearGradient>
        <filter id="tea-pot-noise" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="6" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
        </filter>
        <filter id="tea-pot-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        {/* 紫砂的漫反射高光：范围大、边缘软，不做成塑料亮条 */}
        <radialGradient id="tea-pot-spec" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe4c4" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#ffd9b2" stopOpacity="0.2" />
          <stop offset="1" stopColor="#ffd9b2" stopOpacity="0" />
        </radialGradient>
        <filter id="tea-pot-blur-soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <clipPath id="tea-pot-clip">
          <path d="M52 84C52 60 78 46 112 46C146 46 172 60 172 84C172 105 149 119 112 119C75 119 52 105 52 84Z" />
        </clipPath>
      </defs>

      {/* 桌面投影 */}
      <ellipse className="pot-cast" cx="112" cy="124" rx="58" ry="6.5" fill="#000" opacity="0.5" filter="url(#tea-pot-soft)" />

      {/* 壶嘴（短流） */}
      <path
        className="pot-spout"
        d="M64 92C46 89 30 78 20 58C17 52 22 48 27 52C38 69 50 79 68 84Z"
        fill="url(#tea-pot-spout)"
      />
      <path className="pot-sheen" d="M62 88C49 85 36 76 27 59" stroke="#ffd9b6" strokeOpacity="0.22" strokeWidth="2" fill="none" />
      <ellipse className="pot-mouth" cx="23" cy="55" rx="3.4" ry="2.6" fill="#1c0a05" transform="rotate(-44 23 55)" />

      {/* 提环 */}
      <path
        className="pot-handle"
        d="M169 63C198 67 200 104 162 110"
        fill="none"
        stroke="url(#tea-pot-handle)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        className="pot-sheen"
        d="M170 66C194 70 195 100 165 106"
        fill="none"
        stroke="#ffd6b0"
        strokeOpacity="0.18"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* 壶身 */}
      <path
        className="pot-body"
        d="M52 84C52 60 78 46 112 46C146 46 172 60 172 84C172 105 149 119 112 119C75 119 52 105 52 84Z"
        fill="url(#tea-pot-body)"
      />
      <g clipPath="url(#tea-pot-clip)">
        <ellipse className="pot-soft" cx="112" cy="86" rx="72" ry="52" fill="url(#tea-pot-glow)" />
        <rect className="pot-noise" x="40" y="40" width="150" height="92" filter="url(#tea-pot-noise)" opacity="0.35" />
        {/* 左肩漫反射高光（大而软） */}
        <ellipse
          className="pot-sheen"
          cx="88"
          cy="68"
          rx="30"
          ry="20"
          fill="url(#tea-pot-spec)"
          transform="rotate(-18 88 68)"
          filter="url(#tea-pot-blur-soft)"
        />
        {/* 高光里的一点锐点，模拟釉面/明针压光的亮斑 */}
        <ellipse className="pot-sheen" cx="79" cy="60" rx="4.6" ry="2.6" fill="#fff2e0" opacity="0.32" transform="rotate(-20 79 60)" />
        {/* 左上轮廓的边光 */}
        <path
          className="pot-sheen"
          d="M55 86C55 64 74 49 100 46"
          stroke="#ffd3a9"
          strokeOpacity="0.26"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
        <path className="pot-sheen" d="M150 56C171 64 177 96 152 118" stroke="#2c0f06" strokeOpacity="0.34" strokeWidth="12" fill="none" />
        <path className="pot-sheen" d="M58 101C78 114 146 114 166 101" stroke="#240b04" strokeOpacity="0.3" strokeWidth="8" fill="none" />
        {/* 壶肩转折处的暗部，让球体更立体 */}
        <path className="pot-sheen" d="M60 62C78 50 146 50 164 62" stroke="#3d1207" strokeOpacity="0.22" strokeWidth="10" fill="none" />
      </g>

      {/* 底足 */}
      <ellipse className="pot-foot" cx="112" cy="117" rx="30" ry="5" fill="#3d1509" />
      <ellipse className="pot-foot" cx="112" cy="116" rx="30" ry="4.4" fill="none" stroke="#c0784f" strokeOpacity="0.28" strokeWidth="1.2" />
      <ellipse className="pot-foot" cx="112" cy="118.6" rx="26" ry="2.8" fill="#1f0a04" opacity="0.6" />

      {/* 壶口与壶盖 */}
      <ellipse className="pot-mouth" cx="112" cy="49" rx="33" ry="9" fill="#2c1007" />
      <ellipse className="pot-mouth" cx="112" cy="49" rx="33" ry="9" fill="none" stroke="#c2784f" strokeOpacity="0.45" strokeWidth="1.4" />
      {/* 盖口缝隙的环境光遮蔽 */}
      <ellipse cx="112" cy="51.5" rx="34" ry="9.5" fill="none" stroke="#1c0803" strokeOpacity="0.4" strokeWidth="3.4" />
      <g className="pot-lid-group">
        <path className="pot-lid" d="M79 47C81 34 143 34 145 47Z" fill="url(#tea-pot-lid)" />
        <ellipse className="pot-lid" cx="112" cy="47" rx="33" ry="8" fill="url(#tea-pot-lid)" />
        <ellipse className="pot-sheen" cx="103" cy="45" rx="16" ry="5" fill="#ffdcb6" opacity="0.2" filter="url(#tea-pot-blur-soft)" />
        <ellipse className="pot-lid" cx="112" cy="33" rx="9" ry="7" fill="url(#tea-pot-lid)" />
        <ellipse className="pot-lid" cx="112" cy="33" rx="9" ry="7" fill="none" stroke="#d08a63" strokeOpacity="0.4" strokeWidth="1" />
        <ellipse className="pot-sheen" cx="109" cy="31" rx="3.4" ry="2.2" fill="#ffe6cd" opacity="0.4" />
      </g>
    </svg>
  )
}

/** 白瓷品茗杯 */
function CupSvg({ index }: { index: number }) {
  const ceramic = `cup-ceramic-${index}`
  const inner = `cup-inner-${index}`
  const shadow = `cup-shadow-${index}`
  const glossy = `cup-gloss-${index}`
  const teaFill = `cup-tea-fill-${index}`

  return (
    <svg className="cup-svg" viewBox="0 0 100 74" role="presentation" focusable="false">
      <defs>
        <linearGradient id={ceramic} x1="0.08" y1="0" x2="0.92" y2="1">
          <stop offset="0" stopColor="#b3a189" />
          <stop offset="0.18" stopColor="#fbf6ea" />
          <stop offset="0.42" stopColor="#f6efe2" />
          <stop offset="0.7" stopColor="#e2d6c2" />
          <stop offset="0.88" stopColor="#c9b9a2" />
          <stop offset="1" stopColor="#a3907a" />
        </linearGradient>
        <radialGradient id={inner} cx="0.46" cy="0.34" r="0.72">
          <stop offset="0" stopColor="#4a3b28" />
          <stop offset="0.62" stopColor="#2b2115" />
          <stop offset="1" stopColor="#161009" />
        </radialGradient>
        <linearGradient id={glossy} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={shadow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <radialGradient id={teaFill} cx="0.42" cy="0.3" r="0.78">
          <stop offset="0" stopColor="#f2c07c" />
          <stop offset="0.35" stopColor="#d99247" />
          <stop offset="0.72" stopColor="#a95f21" />
          <stop offset="1" stopColor="#6b3a12" />
        </radialGradient>
      </defs>

      <ellipse className="cup-cast" cx="50" cy="66" rx="24" ry="4" fill="#000" opacity="0.5" filter={`url(#${shadow})`} />

      {/* 杯身 */}
      <path
        className="cup-body"
        d="M22 14C23 34 27 49 36 56C40 59 45 60 50 60C55 60 60 59 64 56C73 49 77 34 78 14Z"
        fill={`url(#${ceramic})`}
      />
      {/* 杯口厚沿 */}
      <ellipse className="cup-rim" cx="50" cy="14" rx="30" ry="7.6" fill="#fdf9f1" />
      <ellipse className="cup-rim" cx="50" cy="14.4" rx="30" ry="7.2" fill="none" stroke="#b7a68d" strokeOpacity="0.5" strokeWidth="1.1" />

      {/* 杯内 */}
      <ellipse className="cup-well" cx="50" cy="14.7" rx="26" ry="5.9" fill={`url(#${inner})`} />
      <ellipse className="cup-tea" cx="50" cy="15" rx="25" ry="5.5" fill={`url(#${teaFill})`} />
      <ellipse className="cup-tea-sheen" cx="43" cy="13.4" rx="6" ry="1.6" fill="#fff6e4" opacity="0.5" />

      {/* 高光与暗部 */}
      <ellipse className="cup-gloss" cx="31" cy="31" rx="5.2" ry="13" fill={`url(#${glossy})`} opacity="0.75" />
      <path className="cup-gloss" d="M71 22C74 32 71 45 63 53" stroke="#7d6a52" strokeOpacity="0.2" strokeWidth="4.5" fill="none" />
      <ellipse className="cup-gloss" cx="50" cy="18.4" rx="23" ry="4.2" fill="#ffffff" opacity="0.05" />

      {/* 圈足 */}
      <path className="cup-foot" d="M34 59C38 62 44 63 50 63C56 63 62 62 66 59L65 63C61 66 55 67 50 67C45 67 39 66 35 63Z" fill="#d8ccb8" />
      <ellipse cx="50" cy="63" rx="16" ry="3.2" fill="#efe5d4" />
      <ellipse cx="50" cy="64.2" rx="16" ry="2.6" fill="none" stroke="#a8967e" strokeOpacity="0.5" strokeWidth="0.9" />
    </svg>
  )
}

/**
 * 拟物茶席：深木茶桌、乌木茶盘、紫砂朱泥壶、白瓷品茗杯与青瓷茶荷。
 * 器物用内联 SVG 路径 + 渐变 + 分形噪声绘制，不加载任何外部图片。
 * 只表达器物相对位置与流程进度，不代表真实器型、尺寸或标准手法。
 */
function FlowLine({ className }: { className: string }) {
  return (
    <div className={className}>
      <span />
      <span />
      <span />
    </div>
  )
}

export default function TeaScene({ step, stepIndex, done, look = 'real', showTitle = true }: TeaSceneProps) {
  const hasTea = stepIndex >= 1
  const warming = stepIndex === 0 && !done
  const pouringIn = stepIndex === 2 && !done
  const serving = stepIndex === 3 && !done
  const offering = stepIndex >= 4 || done
  const [filled, setFilled] = useState(0)

  useEffect(() => {
    if (done || stepIndex > 3) {
      setFilled(3)
      return undefined
    }
    if (stepIndex < 3) {
      setFilled(0)
      return undefined
    }
    setFilled(0)
    const timers = [900, 1900, 2900].map((ms, index) =>
      window.setTimeout(() => setFilled(index + 1), ms),
    )
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [done, stepIndex])
  const phase = done ? 'done' : (PHASES[stepIndex] ?? 'warm')
  const potSteam = warming || pouringIn || offering

  return (
    <div className={`tea-stage tea-look-${look} tea-phase-${phase}`} aria-hidden="true">
      {showTitle ? (
        <div className="scene-title">
          <span className="scene-step-name">{done ? '演示完成' : step.name}</span>
          <span className="scene-step-sub">{done ? '五步走完' : `第 ${stepIndex + 1} 步`}</span>
        </div>
      ) : null}

      <div className="tea-board">
        <div className="board-light" />

        <div className="tea-tray">
          <div className="tray-channel" />
          <div className="tray-ripple" />
        </div>

        <div className="tea-cloth" />

        {/* 紫砂朱泥壶 */}
        <div className="tea-pot">
          <div className="pot-shadow" />
          {pouringIn ? <FlowLine className="pour-stream" /> : null}
          <TeapotSvg />
          {hasTea ? (
            <div className="tea-leaves">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          ) : null}
          {potSteam ? (
            <div className="steam pot-steam">
              <span />
              <span />
              <span />
            </div>
          ) : null}
        </div>

        {/* 三只白瓷品茗杯：出汤前是空的，再一只一只倒满 */}
        <div className="tea-cups">
          {[0, 1, 2].map((i) => {
            const pouringHere = serving && filled === i
            return (
              <div className={`cup cup-${i}${i < filled ? ' is-filled' : ''}${pouringHere ? ' is-pouring' : ''}`} key={i}>
                {pouringHere ? <FlowLine className="cup-pour" /> : null}
                {(warming || (offering && i < filled)) ? (
                  <div className="steam cup-steam">
                    <span />
                    <span />
                  </div>
                ) : null}
                <CupSvg index={i} />
              </div>
            )
          })}
        </div>

        {/* 茶荷 */}
        <div className="leaf-dish">
          <div className="leaf-dish-base" />
          {hasTea ? (
            <div className="dry-leaves">
              <span />
              <span />
              <span />
            </div>
          ) : null}
        </div>

        {done ? (
          <div className="celebrate-glow">
            <span className="glint s1" />
            <span className="glint s2" />
            <span className="glint s3" />
          </div>
        ) : null}
      </div>

      <p className="scene-caption">茶席示意，非某地标准器型或冲泡手法</p>
    </div>
  )
}
