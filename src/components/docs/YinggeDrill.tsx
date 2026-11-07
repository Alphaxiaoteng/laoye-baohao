import { useState } from 'react'

/**
 * 英歌阵形点位示意（可切换）。
 * 队形名称与走位说明取自 content/entries.yingge.json 的「阵形：名称、路线与边界」条目；
 * 点位只是几何示意，不代表任何一支队伍的实际走位，也不对应具体人数。
 */

interface Point {
  x: number
  y: number
}

interface Formation {
  id: string
  name: string
  note: string
  points: Point[]
  drum?: Point
}

function ring(cx: number, cy: number, rx: number, ry: number, count: number, offset = -Math.PI / 2): Point[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = offset + (Math.PI * 2 * index) / count
    return { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry }
  })
}

const FORMATIONS: Formation[] = [
  {
    id: 'double',
    name: '双列',
    note: '两列队伍平行对称向前流动，也是最基础的巡游队形。',
    points: Array.from({ length: 10 }, (_, index) => ({
      x: index % 2 === 0 ? 148 : 212,
      y: 42 + Math.floor(index / 2) * 42,
    })),
  },
  {
    id: 'square',
    name: '方形阵',
    note: '两列为一组分两组并排，形成方形。',
    points: Array.from({ length: 16 }, (_, index) => ({
      x: 102 + (index % 4) * 52,
      y: 60 + Math.floor(index / 4) * 46,
    })),
  },
  {
    id: 'dragon',
    name: '双龙出海',
    note: '对称的两列或四列同向移动，再从队伍中间分裂，逐渐向左右两侧展开。',
    points: Array.from({ length: 12 }, (_, index) => {
      const step = Math.floor(index / 2) / 5
      return { x: index % 2 === 0 ? 168 - 74 * step : 192 + 74 * step, y: 216 - 164 * step }
    }),
  },
  {
    id: 'spiral',
    name: '田螺阵',
    note: '全队合成一列，由队首向里或向外盘旋成圈。',
    points: Array.from({ length: 19 }, (_, index) => {
      const angle = index * 0.62
      const radius = 10 + index * 5.2
      return { x: 180 + Math.cos(angle) * radius, y: 134 + Math.sin(angle) * radius * 0.9 }
    }),
  },
  {
    id: 'wheat',
    name: '麦穗花阵',
    note: '一列首尾相接成大圆，另一列以小圆反向穿插流动。',
    points: [
      ...ring(180, 134, 100, 92, 16),
      ...ring(180, 134, 44, 40, 8, Math.PI / 2),
    ],
  },
  {
    id: 'four',
    name: '四海升平',
    note: '把人数均等的四列各自接成圆圈，按十字方位对称。',
    points: [
      ...ring(180, 48, 30, 26, 5),
      ...ring(180, 220, 30, 26, 5),
      ...ring(74, 134, 30, 26, 5),
      ...ring(286, 134, 30, 26, 5),
    ],
  },
  {
    id: 'bagua',
    name: '八卦阵',
    note: '由内外两圈组成，乐队以 S 型站在内圈。',
    points: [...ring(180, 134, 104, 96, 16), ...ring(180, 134, 48, 44, 8, Math.PI / 8)],
    drum: { x: 180, y: 134 },
  },
]

/** 点位槽位固定为最多点数的阵形，切换阵形时同一批 DOM 只换 transform，才能平滑过渡 */
const MAX_POINTS = FORMATIONS.reduce((max, item) => Math.max(max, item.points.length), 0)

export default function YinggeDrill() {
  const [activeId, setActiveId] = useState(FORMATIONS[0].id)
  const active = FORMATIONS.find((item) => item.id === activeId) ?? FORMATIONS[0]

  return (
    <div className="docs-drill">
      <div className="docs-tabs" role="group" aria-label="切换英歌阵形示意">
        {FORMATIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="docs-tab"
            aria-pressed={item.id === activeId}
            onClick={() => setActiveId(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="docs-drill-body">
        <div className="docs-svg-scroll is-narrow">
          <svg className="docs-svg" viewBox="0 0 360 270" role="img" aria-labelledby="drill-title">
            <title id="drill-title">英歌阵形点位示意：{active.name}</title>
            <rect className="dg-frame" x="0" y="0" width="360" height="270" rx="12" />
            <path className="dg-ground" d="M24 244 H336" />
            <g className="dg-drill-arrow">
              <text className="dg-axis" x="24" y="260">
                前进方向 →
              </text>
            </g>
            {Array.from({ length: MAX_POINTS }, (_, index) => {
              const point = active.points[index]
              // 多余槽位停在最后一个点位上缩起来，避免从原点飞入
              const anchor = point ?? active.points[active.points.length - 1]
              return (
                <g
                  key={index}
                  className="dg-dot-slot"
                  style={{
                    transform: `translate(${anchor.x.toFixed(2)}px, ${anchor.y.toFixed(2)}px)`,
                    opacity: point ? 1 : 0,
                  }}
                >
                  <circle className="dg-dot" r="7" />
                </g>
              )
            })}
            {active.drum ? (
              <g
                className="dg-drum-group"
                style={{
                  transform: `translate(${active.drum.x.toFixed(2)}px, ${active.drum.y.toFixed(2)}px)`,
                }}
              >
                <circle className="dg-ripple" r="12" />
                <circle className="dg-ripple is-late" r="12" />
                <circle className="dg-drum" r="12" />
                <text className="dg-drum-label" x="0" y="4">
                  鼓
                </text>
              </g>
            ) : null}
          </svg>
        </div>
        <div className="docs-drill-note">
          <p className="docs-drill-name">{active.name}</p>
          <p className="docs-drill-desc">{active.note}</p>
          <p className="docs-drill-hint">点位示意，不代表具体队伍的人数与实拍走位。</p>
        </div>
      </div>
    </div>
  )
}
