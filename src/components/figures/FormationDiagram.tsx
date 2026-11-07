import type { CSSProperties } from 'react'

interface Props {
  variant?: 'square' | 'double' | 'ring'
  className?: string
}

const VARIANTS = {
  square: {
    label: '方阵（示意）',
    hint: '把队伍画成几排并列的方块，只是为了说明"可以从队形和站位去观察"。',
  },
  double: {
    label: '双列（示意）',
    hint: '两列相对的示意排布，用来说明队伍行进时的前后关系。',
  },
  ring: {
    label: '环形（示意）',
    hint: '围成环形的示意排布，用来说明观众与队伍之间的空间关系。',
  },
} as const

export const FORMATION_VARIANTS = ['square', 'double', 'ring'] as const

export type FormationVariant = (typeof FORMATION_VARIANTS)[number]

/**
 * 英歌阵形示意图：纯几何示意，不画人物、不画神像，不代表任何一地的真实阵形。
 */
export default function FormationDiagram({ variant = 'square', className = '' }: Props) {
  const info = VARIANTS[variant]

  return (
    <figure className={className}>
      <svg
        viewBox="0 0 320 180"
        role="img"
        aria-label={`英歌阵形示意图：${info.label}`}
        className="h-auto w-full rounded-xl border border-line bg-cream-dark/40"
      >
        <rect x="0" y="0" width="320" height="180" fill="transparent" />
        {/* 地面参考线 */}
        <path d="M20 150 H300" stroke="#D9CFBF" strokeWidth="2" strokeDasharray="6 6" />
        <text x="20" y="168" fill="#6B6156" fontSize="10">
          行进方向 →
        </text>

        {variant === 'square'
          ? [0, 1, 2].map((row) =>
              [0, 1, 2, 3].map((col) => (
                <circle
                  key={`${row}-${col}`}
                  className="figure-dot"
                  cx={84 + col * 44}
                  cy={48 + row * 34}
                  r="9"
                  fill="#A63A2B"
                  opacity={0.8}
                  style={{ '--dot-delay': `${((row * 4 + col) * 0.045).toFixed(2)}s` } as CSSProperties}
                />
              )),
            )
          : null}

        {variant === 'double'
          ? [0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <circle
                  className="figure-dot"
                  cx={90 + i * 30}
                  cy={64}
                  r="9"
                  fill="#A63A2B"
                  opacity={0.8}
                  style={{ '--dot-delay': `${(i * 0.09).toFixed(2)}s` } as CSSProperties}
                />
                <circle
                  className="figure-dot"
                  cx={90 + i * 30}
                  cy={112}
                  r="9"
                  fill="#2F4A3A"
                  opacity={0.8}
                  style={{ '--dot-delay': `${(0.05 + i * 0.09).toFixed(2)}s` } as CSSProperties}
                />
              </g>
            ))
          : null}

        {variant === 'ring'
          ? Array.from({ length: 12 }).map((_, i) => {
              const angle = (Math.PI * 2 * i) / 12 - Math.PI / 2
              return (
                <circle
                  key={i}
                  className="figure-dot"
                  cx={160 + Math.cos(angle) * 74}
                  cy={96 + Math.sin(angle) * 56}
                  r="8"
                  fill={i % 3 === 0 ? '#2F4A3A' : '#A63A2B'}
                  opacity={0.8}
                  style={{ '--dot-delay': `${(i * 0.045).toFixed(2)}s` } as CSSProperties}
                />
              )
            })
          : null}

        {variant === 'ring' ? (
          <circle cx="160" cy="96" r="26" fill="none" stroke="#D9CFBF" strokeWidth="2" strokeDasharray="4 4" />
        ) : null}
      </svg>
      <figcaption className="mt-2 space-y-1 text-xs text-muted">
        <span className="font-medium text-ink-soft">{info.label}</span>
        <span className="block">{info.hint}</span>
        <span className="block">示意图，非某地标准；不画具体人物或神像。</span>
      </figcaption>
    </figure>
  )
}
