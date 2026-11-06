import { useId } from 'react'

/**
 * 自绘英歌形象：脸谱 + 双槌。
 *
 * 只借用紧凑吉祥物头像的构图思路（平涂、胶囊眼、少量识别性道具、深色底），
 * 图形全部为本项目手绘 SVG，不复制任何第三方图片资产，也不沿用原站吉祥物名称。
 * 配色限定在 8787 底座：墨青 / 珊瑚红 / 鹿棕 / 米白。
 */
export interface YinggeAvatarProps {
  /** 渲染尺寸（px），宽高相同 */
  size?: number
  className?: string
  /** 作为内容图片时的可访问名称 */
  label?: string
  /** 纯装饰（旁边已有文字）时置为 true，避免重复朗读 */
  decorative?: boolean
  /**
   * 小尺寸入口图标用：裁到脸谱特写，避免 38px 时细节糊成一团。
   * 完整形象（含双槌与肩线）留给面板顶部的形象槽位。
   */
  compact?: boolean
}

export function YinggeAvatar({
  size = 64,
  className,
  label = '英歌脸谱与双槌形象',
  decorative = false,
  compact = false,
}: YinggeAvatarProps) {
  // useId 生成的 id 带冒号，放进 url(#...) 前去掉，避免个别浏览器解析异常
  const uid = useId().replace(/:/g, '')
  const bgId = `yg-bg-${uid}`
  const maskId = `yg-mask-${uid}`
  const coralId = `yg-coral-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox={compact ? '22 14 52 52' : '0 0 96 96'}
      className={className}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
      focusable="false"
    >
      {decorative ? null : <title>{label}</title>}
      <defs>
        <radialGradient id={bgId} cx="38%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#3a4d3d" />
          <stop offset="62%" stopColor="#2a3a2e" />
          <stop offset="100%" stopColor="#1b2620" />
        </radialGradient>
        <linearGradient id={maskId} x1="26" y1="20" x2="70" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f7f2e7" />
          <stop offset="100%" stopColor="#e3d8c3" />
        </linearGradient>
        <linearGradient id={coralId} x1="28" y1="18" x2="70" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff6a56" />
          <stop offset="100%" stopColor="#d63c2d" />
        </linearGradient>
      </defs>

      {/* 深色圆底 + 一圈鹿棕刻度，和站内毛玻璃层保持同一套色 */}
      <circle cx="48" cy="48" r="46.5" fill={`url(#${bgId})`} stroke="rgba(240,74,58,0.28)" />
      <circle
        cx="48"
        cy="48"
        r="40.5"
        fill="none"
        stroke="#de7622"
        strokeOpacity="0.34"
        strokeWidth="1"
        strokeDasharray="2 7"
      />

      {/* 头、脸谱、眼与头饰整体轻微侧倾，保留头像的手绘感 */}
      <g transform="rotate(7 48 54)">
        {/* 肩与对襟衣领：只在底部留一小段，说明这是扮相而不是漂浮的面具 */}
        <path d="M18 96c2.4-13 12.6-19.5 30-19.5S75.6 83 78 96Z" fill="#3f503b" />
        <path d="M43.5 76.5h9v10h-9z" fill="#b47b4d" />
        <path d="M40 77.5 48 88l8-10.5" fill="none" stroke="#f04a3a" strokeWidth="2.4" />
        <path d="M48 88v8" stroke="#de7622" strokeWidth="1.6" />

        {/* 脸谱轮廓 */}
        <path
          d="M48 17.5c14.8 0 23.2 9.7 23.2 23.2 0 15-10.2 27.6-23.2 27.6S24.8 55.7 24.8 40.7c0-13.5 8.4-23.2 23.2-23.2Z"
          fill={`url(#${maskId})`}
          stroke="#de7622"
          strokeWidth="1.6"
        />

        {/* 额头珊瑚纹样 */}
        <path d="M48 23.5 55 33H41Z" fill={`url(#${coralId})`} opacity="0.92" />
        <path d="M48 35.5v4.5" stroke="#f04a3a" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M34 36.5c4-2.4 8.4-3 12.6-2.2M62 36.5c-4-2.4-8.4-3-12.6-2.2"
          stroke="#de7622"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* 胶囊眼：平涂、无高光，两只等大平行 */}
        <rect x="35.6" y="41.5" width="6.6" height="16.5" rx="3.3" fill="#243229" />
        <rect x="53.8" y="41.5" width="6.6" height="16.5" rx="3.3" fill="#243229" />
        {/* 两颊胭脂：只做两道，不铺满整张脸 */}
        <ellipse cx="36.4" cy="62.5" rx="4.6" ry="2.4" fill="#f04a3a" opacity="0.78" />
        <ellipse cx="59.6" cy="62.5" rx="4.6" ry="2.4" fill="#f04a3a" opacity="0.78" />

        {/* 头饰：珊瑚额带 + 鹿棕翎子 + 一枚小坠 */}
        <path
          d="M29 30.5c9-8 29-8 38 0"
          fill="none"
          stroke={`url(#${coralId})`}
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <path
          d="M63.5 24.5c6.6-8.6 13.4-10.6 16.4-8.6-3.6 2-6.4 5.4-7.6 10.2Z"
          fill="#de7622"
        />
        <path
          d="M64.8 26.5c4-2 8.4-3.4 13-3.6"
          fill="none"
          stroke="#f2f1ea"
          strokeOpacity="0.5"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path d="M31 30.5c-.6 3.4-1.4 5.6-3.4 7.6" stroke="#f04a3a" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="27.2" cy="39.4" r="1.8" fill="#f04a3a" />
      </g>

      {/* 双槌交叉在胸前：两枝都能看见，末端留米白槌头；不画手 */}
      <g strokeLinecap="round">
        <path d="M25 92 45 72" stroke="#de7622" strokeWidth="4.6" />
        <path d="M45 72 41.8 75.2" stroke="#f2f1ea" strokeWidth="4.6" />
        <path d="M71 92 51 72" stroke="#de7622" strokeWidth="4.6" />
        <path d="M51 72 54.2 75.2" stroke="#f2f1ea" strokeWidth="4.6" />
      </g>

      {/* 左上高光：让深色底不糊成一团 */}
      <path
        d="M17 33c5.4-9.6 14.2-15.6 24.6-17.4"
        fill="none"
        stroke="#f2f1ea"
        strokeOpacity="0.16"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
