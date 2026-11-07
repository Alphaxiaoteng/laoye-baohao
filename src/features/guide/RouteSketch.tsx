import type { CSSProperties } from 'react'
import type { GuideRouteSegment } from './knowledge'

/**
 * 旅行线路 SVG：只画结构（顺序、节点、片区），不画地图、不做地理投影。
 * 每个节点占一个固定宽度的格子，长路线靠容器横向滚动，不压缩字号。
 */

const SLOT = 126
const EDGE = 34
const HEIGHT = 140
const AXIS_Y = 52
const NODE_R = 22

export function routeWidth(stops: number): number {
  return EDGE * 2 + Math.max(stops - 1, 0) * SLOT
}

function stopX(index: number): number {
  return EDGE + index * SLOT
}

export default function RouteSketch({
  segment,
  index,
  titleId,
}: {
  segment: GuideRouteSegment
  index: number
  titleId: string
}) {
  const width = routeWidth(segment.stops.length)
  const spoken = segment.stops
    .map((stop, i) => `${i + 1}，${stop.label}${stop.note ? `（${stop.note}）` : ''}`)
    .join('；')

  return (
    <figure className="guide-route">
      <figcaption className="guide-route-head">
        <span className="guide-route-order" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="guide-route-label">{segment.label}</span>
        {segment.area ? <span className="guide-route-area">{segment.area}</span> : null}
      </figcaption>

      <div
        className="guide-route-scroll"
        // 横向滚动区需要能聚焦，键盘用户才能用方向键滚动
        tabIndex={0}
        role="group"
        aria-label={`${segment.label}，可横向滚动查看全部 ${segment.stops.length} 站`}
      >
        <svg
          className="guide-route-svg"
          viewBox={`0 0 ${width} ${HEIGHT}`}
          width={width}
          height={HEIGHT}
          role="img"
          aria-labelledby={titleId}
        >
          <title id={titleId}>{`${segment.label}路线：${spoken}`}</title>

          <line
            className="guide-route-track"
            x1={stopX(0)}
            y1={AXIS_Y}
            x2={stopX(segment.stops.length - 1)}
            y2={AXIS_Y}
          />

          {segment.stops.map((stop, i) => {
            const x = stopX(i)
            const last = i === segment.stops.length - 1
            return (
              <g
                key={`${stop.label}-${i}`}
                className="guide-route-stop"
                style={{ '--stop-delay': `${(i * 0.09).toFixed(2)}s` } as CSSProperties}
              >
                <circle className="guide-route-dot" cx={x} cy={AXIS_Y} r={NODE_R} />
                <text className="guide-route-no" x={x} y={AXIS_Y + 5} textAnchor="middle">
                  {i + 1}
                </text>
                <text className="guide-route-name" x={x} y={AXIS_Y + 44} textAnchor="middle">
                  {stop.label}
                </text>
                {stop.note ? (
                  <text className="guide-route-note" x={x} y={AXIS_Y + 64} textAnchor="middle">
                    {stop.note}
                  </text>
                ) : null}
                {last ? (
                  <path
                    className="guide-route-flag"
                    d={`M${x} ${AXIS_Y - 30} l0 -14 l12 4 l-12 4`}
                    aria-hidden="true"
                  />
                ) : null}
              </g>
            )
          })}
        </svg>
      </div>
    </figure>
  )
}
