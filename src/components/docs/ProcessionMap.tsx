/**
 * 巡游队伍结构与地区案例的示意图。
 * 队伍部分取自 features/yinglaoye/data.ts 的 PROCESSION_PARTS（每条都能在条目里找到对应表述）；
 * 案例短名与年份由 CASES 的 region / time 直接截取，是原文年份，不是今年的日程。
 */

export interface ProcessionPartView {
  id: string
  label: string
  /** 只有部分地方、部分年份才有 */
  optional?: boolean
}

export interface CaseChipView {
  id: string
  label: string
  year: string
}

export default function ProcessionMap({
  parts,
  cases,
}: {
  parts: ProcessionPartView[]
  cases: CaseChipView[]
}) {
  const core = parts.filter((part) => !part.optional).slice(0, 4)
  const optional = parts.filter((part) => part.optional).slice(0, 2)

  return (
    <div className="docs-svg-scroll is-wide">
      <svg className="docs-svg" viewBox="0 0 760 330" role="img" aria-labelledby="procession-title">
        <title id="procession-title">营老爷巡游队伍结构与地区案例示意</title>
        <defs>
          <marker id="procession-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path className="dp-arrow" d="M0 0 L8 4 L0 8 z" />
          </marker>
        </defs>
        <rect className="dg-frame" x="0" y="0" width="760" height="330" rx="12" />

        <text className="dg-col" x="36" y="26">
          队伍组成（因村而异）
        </text>

        <path className="dp-road" d="M36 150 H700" markerEnd="url(#procession-arrow)" />
        <text className="dg-axis" x="36" y="170">
          行进方向（示意）
        </text>

        {core.map((part, index) => {
          const x = 54 + index * 162
          return (
            <g key={part.id}>
              <path className="dp-drop" d={`M${x + 66} 126 V146`} />
              <rect
                className={index === 2 ? 'dp-block is-palanquin' : 'dp-block'}
                x={x}
                y="70"
                width="132"
                height="56"
                rx="9"
              />
              <text className="dp-block-label" x={x + 66} y="103">
                {part.label}
              </text>
            </g>
          )
        })}

        {optional.map((part, index) => {
          const x = 190 + index * 280
          return (
            <g key={part.id}>
              <path className="dp-drop is-dashed" d={`M${x + 90} 188 V154`} />
              <rect className="dp-block is-optional" x={x} y="188" width="180" height="46" rx="9" />
              <text className="dp-block-label" x={x + 90} y="208">
                {part.label}
              </text>
              <text className="dp-block-sub" x={x + 90} y="224">
                部分地方 · 部分年份
              </text>
            </g>
          )
        })}

        <path className="dp-rule" d="M36 246 H724" />
        <text className="dg-col" x="36" y="238">
          地区案例（原文年份）
        </text>

        {cases.slice(0, 4).map((item, index) => {
          const x = 24 + index * 180
          return (
            <g key={item.id}>
              <rect className="dp-case" x={x} y="262" width="168" height="50" rx="8" />
              <text className="dp-case-label" x={x + 84} y="283" textAnchor="middle">
                {item.label}
              </text>
              <text className="dp-case-year" x={x + 84} y="300" textAnchor="middle">
                原文 {item.year}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
