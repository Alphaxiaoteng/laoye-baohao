interface Props {
  poured?: number
  className?: string
}

/**
 * 茶具示意：壶 + 三只杯的几何图形。
 * 只表达器物相对位置，不画具体器型纹样，不声称是某地标准配置。
 */
export default function TeaSetDiagram({ poured = 0, className = '' }: Props) {
  const cups = [0, 1, 2]
  return (
    <figure className={className}>
      <svg
        viewBox="0 0 320 170"
        role="img"
        aria-label="工夫茶茶具示意图：一只茶壶与三只茶杯"
        className="h-auto w-full rounded-xl border border-line bg-cream-dark/40"
      >
        <path d="M20 140 H300" stroke="#D9CFBF" strokeWidth="2" strokeDasharray="6 6" />

        {/* 壶身 */}
        <g>
          <ellipse cx="96" cy="112" rx="42" ry="26" fill="#2F4A3A" opacity="0.12" />
          <path d="M58 96 Q96 82 134 96 L128 122 Q96 134 64 122 Z" fill="#2F4A3A" opacity="0.75" />
          <path d="M134 100 q16 4 14 16" stroke="#2F4A3A" strokeWidth="4" fill="none" />
          <path d="M58 98 q-14 6 -10 16" stroke="#2F4A3A" strokeWidth="4" fill="none" />
          <rect x="82" y="78" width="28" height="10" rx="4" fill="#2F4A3A" opacity="0.85" />
          <text x="96" y="152" fontSize="11" fill="#6B6156" textAnchor="middle">
            壶（示意）
          </text>
        </g>

        {/* 三只杯 */}
        {cups.map((i) => {
          const filled = i < poured
          return (
            <g key={i}>
              <path
                d={`M${178 + i * 46} 108 l4 22 h24 l4 -22 z`}
                fill={filled ? '#A63A2B' : '#FFFFFF'}
                stroke="#A63A2B"
                strokeWidth="2.5"
                opacity={filled ? 0.85 : 1}
              />
              <text
                x={192 + i * 46}
                y={152}
                fontSize="10"
                fill="#6B6156"
                textAnchor="middle"
              >
                杯 {i + 1}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption className="mt-2 text-xs text-muted">
        示意图，非某地标准。图示只表达壶与杯的相对位置，不代表真实器型、尺寸或冲泡手法。
      </figcaption>
    </figure>
  )
}
