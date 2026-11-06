/**
 * 8787 原版「英歌小槌」人物：透明底 8 帧雪碧图（4 列 × 2 行，每帧 384×512）。
 * idle = 待机浮动；think = 回答中。纯 CSS steps 播放，无 JS 定时器。
 */
import type { CSSProperties } from 'react'
const IDLE_SRC = '/exhibits/yingge/assets/xiaochui-idle-transparent-v3.png'
const THINK_SRC = '/exhibits/yingge/assets/xiaochui-think-transparent-v3.png'

interface Props {
  /** 显示高度（px），宽按 3:4 比例自动算 */
  height?: number
  /** 回答中切思考动作 */
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
        } as CSSProperties
      }
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : '英歌小槌'}
      aria-hidden={decorative ? true : undefined}
    />
  )
}
