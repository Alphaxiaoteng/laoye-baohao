import type { CSSProperties } from 'react'

interface Props {
  className?: string
}

/**
 * 队伍示意：只画方块与箭头，说明"队伍可能由不同部分组成"。
 * 不画人物、不画神像，也不声称所有地方都是同样的排列。
 */
export default function ProcessionDiagram({ className = '' }: Props) {
  const blocks = [
    { label: '标旗', x: 22, tone: '#A63A2B' },
    { label: '仪仗', x: 88, tone: '#2F4A3A' },
    { label: '轿', x: 154, tone: '#A63A2B' },
    { label: '鼓乐', x: 220, tone: '#2F4A3A' },
  ]
  return (
    <figure className={className}>
      <svg
        viewBox="0 0 320 150"
        role="img"
        aria-label="巡境队伍组成示意图：标旗、仪仗、轿、鼓乐等方块依次排列"
        className="h-auto w-full rounded-xl border border-line bg-cream-dark/40"
      >
        <path d="M16 118 H304" stroke="#D9CFBF" strokeWidth="2" strokeDasharray="6 6" />
        <path
          className="figure-flow"
          d="M272 118 l12 0 m-6 -4 l6 4 l-6 4"
          stroke="#6B6156"
          strokeWidth="2"
          fill="none"
        />
        <text x="16" y="138" fontSize="10" fill="#6B6156">
          行进方向（示意）
        </text>

        {blocks.map((b, index) => (
          <g
            key={b.label}
            className="figure-block"
            style={{ '--block-delay': `${(index * 0.35).toFixed(2)}s` } as CSSProperties}
          >
            <rect
              x={b.x}
              y={48}
              width={54}
              height={50}
              rx="8"
              fill={b.tone}
              opacity="0.16"
              stroke={b.tone}
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <text
              x={b.x + 27}
              y={78}
              fontSize="12"
              fill={b.tone}
              textAnchor="middle"
              fontWeight="600"
            >
              {b.label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 space-y-1 text-xs text-muted">
        <span className="block">
          示意图，非某地标准。队伍组成因村、因年份而异，不代表所有地方都有相同排列，也不表示每处都必有英歌。
        </span>
      </figcaption>
    </figure>
  )
}
