import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import HomeHero from '../src/features/home/HomeHero'

/** 首页画廊的 SSR 冒烟与样式隔离回归。 */
function renderHome(): string {
  return renderToString(createElement(MemoryRouter, null, createElement(HomeHero))).replace(
    /<!--\s*-->/g,
    '',
  )
}

describe('首页一屏入口', () => {
  it('两张横幅和四个对得上的进馆入口都能渲染', () => {
    const html = renderHome()
    expect(html).toContain('aria-label="老爷保号首页"')
    expect(html).toContain('/media/home/hero/banner-yingge.webp')
    expect(html).toContain('/media/home/hero/banner-chaoju.webp')
    expect(html).not.toContain('/media/home/hero/panorama-master.webp')
    expect(html).not.toContain('/media/home/gdstwhg/')
    expect(html).not.toContain('/media/home/hero/panel-')
    expect(html).toContain('/media/home/wall/01.webp')
    expect(html).toContain('/media/home/wall/10.webp')
    expect(html).toContain('/media/home/wall/14.webp')
    expect(html).toContain('/media/home/wall/24.webp')
    expect(html).toContain('href="/museum/yingge"')
    expect(html).toContain('href="/museum/tea"')
    expect(html).toContain('href="/museum/food"')
    expect(html).toContain('href="/museum/yinglaoye"')
    expect(html).toContain('>英歌<')
    expect(html).toContain('>工夫茶<')
    expect(html).toContain('>美食<')
    expect(html).toContain('>营老爷<')
    expect(html).not.toContain('开始逛展')
    expect(html).not.toContain('先从一处开始')
    expect(html).not.toContain('class="collage-panel ')
    expect(html).not.toContain('id="home-yingge-title"')
    expect(html).not.toContain('home-beat-rail')
    expect(html).not.toContain('aria-label="首页图片轮播"')
    expect(html).not.toContain('暂停轮播')
    expect(html).not.toContain('继续轮播')
    expect(html).not.toContain('home-wall')
    expect(html).not.toContain('四板块实拍')
    expect(readFileSync('src/features/home/HomeHero.tsx', 'utf8')).toContain('SLIDE_MS = 3000')
    expect(html).toContain('data-ready="false"')
  })

  it('首页 data-reveal 不被其他模块的全局裸选择器藏掉', () => {
    const css = readFileSync('src/features/home/home.css', 'utf8')
    const guard = css.match(/\.home-gallery \[data-reveal\]\s*\{([^}]*)\}/)
    expect(guard?.[1]).toContain('opacity: 1')
  })

  it('横幅叠放，粒子在纸底后面，减少动态时停用过渡', () => {
    const html = renderHome()
    const css = readFileSync('src/features/home/home.css', 'utf8')
    const particles = readFileSync('src/features/home/HomeParticles.tsx', 'utf8')
    const banner = css.match(/\.home-banner img\s*\{([^}]*)\}/)
    expect(banner?.[1]).toContain('object-fit: cover')
    expect(banner?.[1]).toContain('opacity: 0')
    expect(banner?.[1]).toContain('transition: opacity 1.5s ease')
    expect(css).toContain('.home-particles')
    expect(css).toMatch(/\.home-particles\s*\{[^}]*pointer-events:\s*none/)
    expect(particles).toContain("prefers-reduced-motion: reduce")
    expect(particles).toContain('COUNT = 50')
    const preloader = readFileSync('src/features/home/HeroPreloader.tsx', 'utf8')
    expect(preloader).toContain("typeof window === 'undefined'")
    const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'))
    expect(reduced).toContain('.hero-preloader')
    expect(reduced).toContain('.home-banner img { transition: none; }')
    expect(reduced).toContain('scroll-snap-type: none')
    expect(html).not.toMatch(/home-intro-heading[^>]*opacity:\s*0/)
  })
})
