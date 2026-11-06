/**
 * 听潮四类的结构图：每个圆点代表一条词条。
 * 只表达「分类」与「数量」，不画声波、不表示时长——录音授权状态按词条内容标注。
 */

export interface ListenGroupView {
  slug: string
  label: string
  count: number
}

const COLUMNS = 4

export default function ListenMap({ groups, total }: { groups: ListenGroupView[]; total: number }) {
  const columns = groups.slice(0, COLUMNS)

  return (
    <div className="docs-svg-scroll is-wide">
      <svg className="docs-svg" viewBox="0 0 720 300" role="img" aria-labelledby="listen-map-title">
        <title id="listen-map-title">
          听潮四类词条数量结构：{columns.map((group) => `${group.label} ${group.count} 条`).join('，')}
        </title>
        <rect className="dg-frame" x="0" y="0" width="720" height="300" rx="12" />

        {columns.map((group, index) => {
          const cx = 96 + index * 176
          const rows = Math.ceil(group.count / COLUMNS)
          const countY = 96 + Math.max(rows, 1) * 18 + 12
          return (
            <g key={group.slug}>
              <text className="dl-index" x={cx} y="34" textAnchor="middle">
                05.{String(index + 1).padStart(2, '0')}
              </text>
              <text className="dl-label" x={cx} y="60" textAnchor="middle">
                {group.label}
              </text>
              {group.count === 0 ? (
                <text className="dg-empty" x={cx} y="104" textAnchor="middle">
                  内容待补充
                </text>
              ) : (
                Array.from({ length: group.count }, (_, dot) => (
                  <circle
                    key={dot}
                    className="dl-dot"
                    cx={cx - 36 + (dot % COLUMNS) * 24}
                    cy={96 + Math.floor(dot / COLUMNS) * 18}
                    r="5"
                  />
                ))
              )}
              <text className="dl-count" x={cx} y={countY} textAnchor="middle">
                {group.count} 条
              </text>
              <path className="dl-leader" d={`M${cx} ${countY + 10} V206`} />
            </g>
          )
        })}

        <rect className="dl-hub" x="200" y="206" width="320" height="56" rx="10" />
        <text className="dl-hub-total" x="360" y="230" textAnchor="middle">
          {total} 条词句 · {columns.length} 个分类
        </text>
        <text className="dl-hub-sub" x="360" y="250" textAnchor="middle">
          每点 = 1 条，不表示时长或声波
        </text>
      </svg>
    </div>
  )
}
