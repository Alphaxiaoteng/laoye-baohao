import type { ReactNode } from 'react'
import type { FoodGlyphKind } from './knowledge'

/**
 * 食物小图谱：抽象线稿，只表示「这是哪一类东西」，不是菜品照片。
 * 全部当前色描边，尺寸固定 32×32，颜色由 CSS 给（--ink-soft / --coral）。
 */

const GLYPHS: Record<FoodGlyphKind, ReactNode> = {
  hotpot: (
    <>
      <path d="M5 16h22c0 6.2-4.6 9.5-11 9.5S5 22.2 5 16Z" />
      <path d="M11 12c0-2.2 1.8-2.4 1.8-4.6M17 12c0-2.2 1.8-2.4 1.8-4.6" />
      <path d="M9 16h14" opacity="0.45" />
    </>
  ),
  beefball: (
    <>
      <path d="M4 17h24c0 5.6-4.8 8.6-12 8.6S4 22.6 4 17Z" />
      <circle cx="11" cy="13" r="3" />
      <circle cx="18" cy="11.5" r="2.6" />
      <circle cx="20.6" cy="15.4" r="2.2" />
    </>
  ),
  kwayteow: (
    <>
      <path d="M4 16h24c0 6.2-4.8 9.5-12 9.5S4 22.2 4 16Z" />
      <path d="M9 12.4c2.4-2 4.8 2 7.2 0s4.6 2 6.8 0" />
      <path d="M9 8.6c2.4-2 4.8 2 7.2 0s4.6 2 6.8 0" opacity="0.55" />
    </>
  ),
  goose: (
    <>
      <path d="M21.4 10.2c-1 3-2.2 4.2-4.4 5.2" />
      <circle cx="22.6" cy="7.8" r="2.6" />
      <path d="M25.2 7.2l2.6-1" />
      <path d="M17 15.6c4.2 0 6.4 2.8 6.4 5S19.6 25 15.8 25c-4.6 0-8.2-1.9-8.2-4.8 0-2.2 2.2-4.6 5.4-4.6Z" />
      <path d="M7.6 20.2l-3-2.2" />
    </>
  ),
  oyster: (
    <>
      <path d="M16 26c-6 0-10.6-4.8-10.6-10.4 0-1.8 1.8-2.6 3.4-1.8 1-1.8 3.2-1.8 4.2-.6.8-1.2 2.8-1.2 3.6 0 1-1.2 3.2-1.2 4.2.6 1.6-.8 3.4 0 3.4 1.8C24.2 21.2 22 26 16 26Z" />
      <path d="M16 24V13M11.6 22.4l2.4-6M20.4 22.4l-2.4-6" opacity="0.5" />
    </>
  ),
  tea: (
    <>
      <path d="M7 13h13a4 4 0 0 1 0 8H7z" />
      <path d="M7 13c0-1.8 2.4-2.6 6.5-2.6S20 11.2 20 13" />
      <path d="M20 15h2.2a2.6 2.6 0 0 1 0 5.2H20" />
      <path d="M9 25.4c1 1.6 2.6 1.6 3.6 0M14.6 25.4c1 1.6 2.6 1.6 3.6 0" />
    </>
  ),
  porridge: (
    <>
      <path d="M4 16h22c0 6.2-4.4 9.4-11 9.4S4 22.2 4 16Z" />
      <path d="M19 14.6L25.4 5" />
      <path d="M23.4 4.2a2.6 2.6 0 0 1 3.6 3.4" />
      <path d="M9 16c1.6-1.3 3.2 1.3 4.8 0s3.2 1.3 4.8 0" opacity="0.5" />
    </>
  ),
  'rice-roll': (
    <>
      <rect x="6" y="10" width="20" height="12" rx="6" />
      <path d="M11 10v12M16 10v12M21 10v12" opacity="0.4" />
      <path d="M4 24h24" />
    </> 
  ),
}

export default function FoodGlyph({ kind }: { kind: FoodGlyphKind }) {
  return (
    <svg viewBox="0 0 32 32" className="guide-food-glyph" aria-hidden="true" focusable="false">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {GLYPHS[kind]}
      </g>
    </svg>
  )
}
