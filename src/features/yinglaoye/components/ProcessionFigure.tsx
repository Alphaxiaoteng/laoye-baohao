import { useState } from 'react'

const BRICK = '#A63A2B'
const INK = '#2F4A3A'
const MUTED = '#6B6156'
const LINE = '#D9CFBF'
const CREAM = '#F7F2E8'

interface Props {
  selectedId: string
  onSelect: (id: string) => void
}

/**
 * 队伍示意：全部自绘 SVG，不画神像、不做 3D。
 * 四个主要部分常显，两个「有的地方才有」的部分用虚线画在图下方。
 * 图形本身对屏幕阅读器隐藏，可点选按钮在页面里另有一套，键盘与读屏都靠那套。
 */
export default function ProcessionFigure({ selectedId, onSelect }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null)
  const marked = (id: string) => selectedId === id || hoverId === id

  const partProps = (id: string) => ({
    onClick: () => onSelect(id),
    onMouseEnter: () => setHoverId(id),
    onMouseLeave: () => setHoverId(null),
    onTouchStart: () => setHoverId(id),
    className: 'cursor-pointer',
    role: 'presentation',
  })

  const halo = (id: string, x: number, y: number, width: number, height: number) =>
    marked(id) ? (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={16}
        fill={CREAM}
        fillOpacity={0.7}
        stroke={BRICK}
        strokeWidth={2}
        strokeDasharray="6 4"
      />
    ) : null

  const label = (x: number, text: string) => (
    <text x={x} y={52} textAnchor="middle" fontSize={15} fontWeight={600} fill={INK}>
      {text}
    </text>
  )

  return (
    <figure className="space-y-3">
      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 760 320"
          aria-hidden="true"
          focusable="false"
          className="h-auto w-full min-w-[600px] rounded-2xl border border-line bg-cream-dark/30"
        >
        {/* 地面与行进方向 */}
        <path d="M24 210 H736" stroke={LINE} strokeWidth={2} strokeDasharray="8 8" />
        <path d="M690 210 H734 m-8 -5 l8 5 l-8 5" stroke={MUTED} strokeWidth={2} fill="none" />
        <text x={736} y={230} textAnchor="end" fontSize={12} fill={MUTED}>
          行进方向（示意）
        </text>

        {/* 标旗 */}
        <g {...partProps('flag')}>
          {halo('flag', 26, 60, 112, 148)}
          <line x1={52} y1={76} x2={52} y2={206} stroke={MUTED} strokeWidth={3} strokeLinecap="round" />
          <polygon
            points="52,78 128,90 124,136 52,124"
            fill={BRICK}
            fillOpacity={0.18}
            stroke={BRICK}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <path d="M62 100 H116 M62 110 H116" stroke={BRICK} strokeWidth={1.5} opacity={0.55} />
          <ellipse cx={52} cy={205} rx={11} ry={4} fill={MUTED} opacity={0.35} />
          {label(82, '标旗')}
        </g>

        {/* 仪仗 */}
        <g {...partProps('guard')}>
          {halo('guard', 150, 62, 118, 146)}
          <rect x={168} y={96} width={36} height={56} rx={4} fill={INK} fillOpacity={0.12} stroke={INK} strokeWidth={2} />
          <line x1={186} y1={152} x2={186} y2={206} stroke={MUTED} strokeWidth={3} strokeLinecap="round" />
          <rect x={220} y={84} width={36} height={56} rx={4} fill={BRICK} fillOpacity={0.12} stroke={BRICK} strokeWidth={2} />
          <line x1={238} y1={140} x2={238} y2={206} stroke={MUTED} strokeWidth={3} strokeLinecap="round" />
          <path d="M174 112 H198 M226 100 H250" stroke={MUTED} strokeWidth={1.5} opacity={0.6} />
          {label(212, '仪仗')}
        </g>

        {/* 神轿：只画轿体与轿杠，不画神像 */}
        <g {...partProps('palanquin')}>
          {halo('palanquin', 298, 64, 184, 146)}
          <polygon
            points="318,106 466,106 444,82 340,82"
            fill={BRICK}
            fillOpacity={0.18}
            stroke={BRICK}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <rect x={330} y={106} width={124} height={66} rx={8} fill={CREAM} stroke={BRICK} strokeWidth={2} />
          <path
            d="M350 114 V164 M370 114 V164 M390 114 V164 M410 114 V164 M430 114 V164"
            stroke={BRICK}
            strokeWidth={1.5}
            opacity={0.5}
          />
          <circle cx={390} cy={139} r={9} fill={BRICK} opacity={0.18} />
          <line x1={306} y1={176} x2={478} y2={176} stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <line x1={318} y1={186} x2={466} y2={186} stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <circle cx={318} cy={198} r={8} fill={INK} opacity={0.32} />
          <circle cx={466} cy={198} r={8} fill={INK} opacity={0.32} />
          {label(390, '神轿')}
        </g>

        {/* 鼓乐 */}
        <g {...partProps('drums')}>
          {halo('drums', 504, 62, 140, 146)}
          <rect x={516} y={124} width={64} height={58} rx={14} fill={INK} fillOpacity={0.16} stroke={INK} strokeWidth={2} />
          <path d="M522 136 H574 M522 148 H574 M522 160 H574" stroke={INK} strokeWidth={1.5} opacity={0.45} />
          <line x1={516} y1={182} x2={510} y2={206} stroke={MUTED} strokeWidth={2} />
          <line x1={580} y1={182} x2={586} y2={206} stroke={MUTED} strokeWidth={2} />
          <circle cx={610} cy={112} r={16} fill="none" stroke={BRICK} strokeWidth={2} />
          <circle cx={620} cy={128} r={16} fill="none" stroke={BRICK} strokeWidth={2} opacity={0.7} />
          <line x1={610} y1={128} x2={596} y2={206} stroke={MUTED} strokeWidth={2} />
          <line x1={620} y1={144} x2={636} y2={206} stroke={MUTED} strokeWidth={2} />
          {label(572, '鼓乐')}
        </g>

        {/* 有的地方才有：花队 / 英歌·布马 */}
        <g {...partProps('flowers')}>
          {halo('flowers', 32, 242, 266, 50)}
          <rect
            x={40}
            y={246}
            width={250}
            height={42}
            rx={21}
            fill={BRICK}
            fillOpacity={0.05}
            stroke={BRICK}
            strokeWidth={2}
            strokeDasharray="7 5"
          />
          <circle cx={70} cy={267} r={7} fill={BRICK} opacity={0.25} />
          <circle cx={84} cy={262} r={5} fill={BRICK} opacity={0.25} />
          <circle cx={86} cy={274} r={5} fill={BRICK} opacity={0.25} />
          <text x={168} y={272} textAnchor="middle" fontSize={13} fill={BRICK}>
            花队（有的地方）
          </text>
        </g>

        <g {...partProps('yingge')}>
          {halo('yingge', 304, 242, 336, 50)}
          <rect
            x={312}
            y={246}
            width={328}
            height={42}
            rx={21}
            fill={INK}
            fillOpacity={0.05}
            stroke={INK}
            strokeWidth={2}
            strokeDasharray="7 5"
          />
          <path d="M340 258 l18 18 M358 258 l-18 18" stroke={INK} strokeWidth={2} opacity={0.5} />
          <text x={486} y={272} textAnchor="middle" fontSize={13} fill={INK}>
            英歌 · 布马（有的地方）
          </text>
        </g>
        </svg>
      </div>

      <figcaption className="space-y-1 text-xs leading-6 text-muted">
        <span className="block">
          示例组合，不代表各地都有英歌或相同顺序，也不表示每一处都同时出现这些部分。图上没有神像；虚线框里的部分只有部分地方、部分年份才有。
        </span>
        <span className="block">
          组成与次序依据下方条目登记的来源，常被来源写作“并不固定的部分组成”。
        </span>
      </figcaption>
    </figure>
  )
}
