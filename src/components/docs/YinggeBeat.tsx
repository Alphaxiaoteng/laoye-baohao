/**
 * 英歌鼓点循环示意。
 * 循环数与槌数取自 content/entries.yingge.json 的「慢板、中板、快板：节奏怎么分」条目；
 * 圆点只表示「一下鼓点」，不是录音波形，也不对应任何队伍的实际鼓谱。
 */

interface Cycle {
  name: string
  beats: number
  detail: string
}

const CYCLES: Cycle[] = [
  { name: '慢板', beats: 3, detail: '3 下鼓点一循环 · 击槌三下或四下成组，另有「醉槌」' },
  { name: '中板', beats: 5, detail: '5 下鼓点一循环 · 五、七、八、十、十一、十三下槌成组' },
  { name: '快板', beats: 7, detail: '7 下鼓点一循环 · 分对打套式、南山文派与南山武派' },
]

export default function YinggeBeat() {
  return (
    <div className="docs-svg-scroll is-wide">
      <svg className="docs-svg" viewBox="0 0 560 250" role="img" aria-labelledby="beat-title">
        <title id="beat-title">英歌鼓点循环示意：慢板三下、中板五下、快板七下</title>
        <rect className="dg-frame" x="0" y="0" width="560" height="250" rx="12" />

        {/* 双槌互击的小图示 */}
        <g transform="translate(474 28)">
          <g className="dg-club">
            <path d="M6 38 L34 6" />
            <path d="M34 38 L6 6" />
          </g>
          <circle className="dg-dot" cx="6" cy="38" r="4" />
          <circle className="dg-dot" cx="34" cy="6" r="4" />
          <circle className="dg-dot" cx="6" cy="6" r="4" />
          <circle className="dg-dot" cx="34" cy="38" r="4" />
          <text className="dg-axis" x="20" y="60" textAnchor="middle">
            双槌
          </text>
        </g>

        {CYCLES.map((cycle, row) => {
          const y = 52 + row * 64
          return (
            <g key={cycle.name}>
              <text className="dg-title" x="26" y={y + 6}>
                {cycle.name}
              </text>
              {Array.from({ length: cycle.beats }, (_, index) => (
                <circle
                  key={index}
                  className={index === 0 ? 'dg-dot is-accent' : 'dg-dot'}
                  cx={100 + index * 26}
                  cy={y}
                  r="8"
                />
              ))}
              <text className="dg-caption" x="100" y={y + 26}>
                {cycle.detail}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
