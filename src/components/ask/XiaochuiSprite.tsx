/**
 * 8787 原版「英歌小槌」人物：透明底 8 帧雪碧图（4 列 × 2 行，每帧 384×512）。
 * 平时停在待机第一帧。busy 时切到思考姿势（托腮那一帧），
 * 位移只走 CSS transform，不逐帧跳雪碧。
 */
import type { CSSProperties } from 'react'
const IDLE_SRC = '/exhibits/yingge/assets/xiaochui-idle-transparent-v3.png'
const THINK_SRC = '/exhibits/yingge/assets/xiaochui-think-transparent-v3.png'

interface Props {
  /** 显示高度（px），宽按 3:4 比例自动算 */
  height?: number
  /** 问答请求进行中：换思考姿势，并交给 .is-busy 做小幅摇摆 */
  busy?: boolean
  decorative?: boolean
}

export function XiaochuiSprite({ height = 96, busy = false, decorative = true }: Props) {
  const width = Math.round(height * 0.75)
  return (
    <span
      className={`xiaochui-sprite${busy ? ' is-busy' : ''}`}
      style={
        {
          '--xcw': `${width}px`,
          '--xch': `${height}px`,
          backgroundImage: `url(${busy ? THINK_SRC : IDLE_SRC})`,
          // 4 列雪碧：0 第一帧站立；66.666% 是思考图第三帧（托腮）
          backgroundPosition: busy ? '66.666% 0' : '0 0',
        } as CSSProperties
      }
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : '英歌小槌'}
      aria-hidden={decorative ? true : undefined}
    />
  )
}
