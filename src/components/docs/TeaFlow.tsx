import type { CSSProperties, ReactNode } from 'react'

/**
 * 工夫茶冲泡环节的关系示意。
 * 环节名称按 content/entries.tea.json 的「冲泡环节示例（据项目页）」原文；
 * 页面原文写的是「二十余个环节」，这里只取其中七环连成示意图，不是唯一标准流程。
 */

interface BrewStep {
  name: string
  glyph: ReactNode
}

const GLYPH_PROPS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const STEPS: BrewStep[] = [
  {
    name: '生火煮水',
    glyph: (
      <g {...GLYPH_PROPS}>
        <path d="M12 20c-3.6 0-5.6-2.3-5.6-5 0-2.4 1.7-3.7 2.7-5.8.6 1.3 1.6 1.9 2.3 3 .4-2.4 1.5-4.2 2.9-5.2.2 2.3 3.3 4.3 3.3 8 0 2.7-2 5-5.6 5z" />
      </g>
    ),
  },
  {
    name: '热罐温盅',
    glyph: (
      <g {...GLYPH_PROPS}>
        <path d="M5 13h11l-1.2 7H6.2z" />
        <path d="M16 15.5h2.4a1.8 1.8 0 0 1 0 3.6H16" />
        <path d="M8.4 10.4c0-1.4 1.3-1.6 1.3-2.8" />
        <path d="M12.4 10.4c0-1.4 1.3-1.6 1.3-2.8" />
      </g>
    ),
  },
  {
    name: '纳茶与洗茶',
    glyph: (
      <g {...GLYPH_PROPS}>
        <path d="M4.5 11.5h15" />
        <path d="M6 11.5c.6 4.6 2.6 7.8 6 7.8s5.4-3.2 6-7.8" />
        <path d="M12 8.4c-1.5-1.4-1.1-3.4.7-4.4.1 1.6 1.6 2.4 1.6 3.8 0 .9-.8 1.5-1.8 1.5s-1.6-.4-1.6-1z" />
      </g>
    ),
  },
  {
    name: '提铫高冲',
    glyph: (
      <g {...GLYPH_PROPS}>
        <path d="M4 12.6h9.2l-1.4 5.6H5.6z" />
        <path d="M13 13.4h2.6l2.4-5.2" />
        <path d="M6.2 12.4V9.8" />
        <path d="M17.6 5.6c1.6 1.8 2.2 3.6 2 5.4" strokeDasharray="2 2" className="dt-steam" />
      </g>
    ),
  },
  {
    name: '刮沫淋盖',
    glyph: (
      <g {...GLYPH_PROPS}>
        <path d="M4.6 13.6h14.8" />
        <path d="M6.4 13.6c.7 3.8 2.5 6.2 5.6 6.2s4.9-2.4 5.6-6.2" />
        <path d="M9 10.6c2-1.6 4.2-2.2 6.4-2" />
        <path d="M17.6 9.2l2.6-1.8" />
        <path d="M19.2 13.8c0-1.6.6-2.8 1.6-3.6" strokeDasharray="2 2" className="dt-steam" />
      </g>
    ),
  },
  {
    name: '低洒分茶',
    glyph: (
      <g {...GLYPH_PROPS}>
        <path d="M3.4 15.4h4.6l-.7 3.2H4.1z" />
        <path d="M9.6 15.4h4.6l-.7 3.2H10.3z" />
        <path d="M15.8 15.4h4.6l-.7 3.2h-3.2z" />
        <path d="M12 8.2v4.2" />
        <path d="M9.4 11.2 12 13.4l2.6-2.2" />
      </g>
    ),
  },
  {
    name: '敬请品味',
    glyph: (
      <g {...GLYPH_PROPS}>
        <path d="M6 12.6h12" />
        <path d="M7.4 12.6c.6 4.2 2.3 6.8 4.6 6.8s4-2.6 4.6-6.8" />
        <path d="M12 9.6c0-1.4 1.4-1.6 1.4-2.8" />
        <path d="M15.4 5.4l1 1" />
      </g>
    ),
  },
]

const ROW_ONE = STEPS.slice(0, 4)
const ROW_TWO = STEPS.slice(4)

export default function TeaFlow() {
  return (
    <div className="docs-svg-scroll is-wide">
      <svg className="docs-svg" viewBox="0 0 720 258" role="img" aria-labelledby="tea-flow-title">
        <title id="tea-flow-title">
          工夫茶冲泡环节关系示意：生火煮水、热罐温盅、纳茶与洗茶、提铫高冲、刮沫淋盖、低洒分茶、敬请品味
        </title>
        <defs>
          <marker id="tea-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path className="dt-arrow" d="M0 0 L8 4 L0 8 z" />
          </marker>
        </defs>
        <rect className="dg-frame" x="0" y="0" width="720" height="258" rx="12" />

        {ROW_ONE.map((step, index) => {
          const x = 16 + index * 174
          const y = 26
          const sub = index + 1
          return (
            <g
              key={step.name}
              className="dt-step"
              style={{ '--step-delay': `${(index * 0.09).toFixed(2)}s` } as CSSProperties}
            >
              <rect className="dt-node" x={x} y={y} width={158} height={66} rx="10" />
              <g transform={`translate(${x + 12} ${y + 21})`} className="dt-glyph">
                <g
                  className="dt-glyph-inner"
                  style={{ '--glyph-delay': `${(index * 0.35).toFixed(2)}s` } as CSSProperties}
                >
                  {step.glyph}
                </g>
              </g>
              <text className="dt-index" x={x + 12} y={y + 58}>
                {String(sub).padStart(2, '0')}
              </text>
              <text className="dt-label" x={x + 52} y={y + 40}>
                {step.name}
              </text>
              {index < ROW_ONE.length - 1 ? (
                <path className="dt-link" d={`M${x + 162} ${y + 33} H${x + 172}`} markerEnd="url(#tea-arrow)" />
              ) : null}
            </g>
          )
        })}

        {/* 从第一行末环折回第二行首环 */}
        <path className="dt-link" d="M617 92 V112 H95 V148" markerEnd="url(#tea-arrow)" />

        {ROW_TWO.map((step, index) => {
          const x = 16 + index * 174
          const y = 152
          const sub = index + 5
          return (
            <g
              key={step.name}
              className="dt-step"
              style={{ '--step-delay': `${(0.4 + index * 0.09).toFixed(2)}s` } as CSSProperties}
            >
              <rect className="dt-node" x={x} y={y} width={158} height={66} rx="10" />
              <g transform={`translate(${x + 12} ${y + 21})`} className="dt-glyph">
                <g
                  className="dt-glyph-inner"
                  style={{ '--glyph-delay': `${(index * 0.35).toFixed(2)}s` } as CSSProperties}
                >
                  {step.glyph}
                </g>
              </g>
              <text className="dt-index" x={x + 12} y={y + 58}>
                {String(sub).padStart(2, '0')}
              </text>
              <text className="dt-label" x={x + 52} y={y + 40}>
                {step.name}
              </text>
              {index < ROW_TWO.length - 1 ? (
                <path className="dt-link" d={`M${x + 162} ${y + 33} H${x + 172}`} markerEnd="url(#tea-arrow)" />
              ) : null}
            </g>
          )
        })}

        <text className="dg-axis" x="16" y="244">
          环节顺序按项目页原文排列，仅作关系示意
        </text>
      </svg>
    </div>
  )
}
