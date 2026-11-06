import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import GuidePage, { GuideReader } from '../src/features/guide/GuidePage'
import { guideArticles } from '../src/features/guide/knowledge'
import guides from '../content/guides.json'
import entriesFood from '../content/entries.food.json'
import entriesTea from '../content/entries.tea.json'
import entriesYingge from '../content/entries.yingge.json'
import entriesYinglaoye from '../content/entries.yinglaoye.json'

/**
 * 攻略页的渲染与边界测试。
 *
 * 关注四件事：
 * 1. 列表直接铺开全部指南，不再有城市 / 主题筛选标签组；
 * 2. 阅读视图真的渲染出正文标题、SVG 线路、食物小图谱与配图；
 * 3. 页面里没有「帖子 / 原帖 / 小红书」这类内容，也没有外站跳转或图片热链；
 * 4. 每篇指南的事实依据（evidenceIds / stationRefs）与图片文件都真实存在。
 */

const PROJECT_ROOT = fileURLToPath(new URL('..', import.meta.url))

function render(node: ReturnType<typeof createElement>): string {
  return renderToString(createElement(MemoryRouter, null, node)).replace(/<!--\s*-->/g, '')
}

function renderList(): string {
  return render(createElement(GuidePage))
}

function renderArticle(index: number): string {
  return render(
    createElement(GuideReader, {
      article: guideArticles[index],
      onBack: () => {},
    }),
  )
}

const guideIds = new Set((guides as { id: string }[]).map((item) => item.id))
const stationIds = new Set(
  [...entriesFood, ...entriesTea, ...entriesYingge, ...entriesYinglaoye].map(
    (item) => (item as { id: string }).id,
  ),
)

describe('攻略页是站内指南，不是帖子目录', () => {
  it('至少 10 篇完整指南，首屏直接铺开，没有筛选标签组', () => {
    expect(guideArticles.length).toBeGreaterThanOrEqual(10)
    expect(guideArticles.length).toBeLessThanOrEqual(12)

    const html = renderList()
    expect(html).toContain('把潮汕走成一条线')

    for (const article of guideArticles) {
      expect(html).toContain(article.title)
      expect(html).toContain(article.dek)
    }

    // 筛选胶囊已移除：没有筛选分组、没有 aria-pressed 切换按钮
    expect(html).not.toContain('guide-chip')
    expect(html).not.toContain('guide-filters')
    expect(html).not.toContain('aria-pressed')
    expect(html).not.toContain('筛选')
    expect(html).not.toContain('全部类型')
  })

  it('阅读视图有 h1 层级、分段正文、SVG 线路与配图', () => {
    for (const [index, article] of guideArticles.entries()) {
      const html = renderArticle(index)

      // 标题层级：一篇指南一个 h1，小节用 h2
      expect(html).toContain(`<h1 class="guide-reader-title">${article.title}</h1>`)
      expect(html).toMatch(/<h2[^>]*>/)
      expect(article.sections.length).toBeGreaterThanOrEqual(3)
      for (const section of article.sections) {
        expect(html).toContain(section.heading)
      }

      // 线路：每个分段一张 role="img" 的 SVG，带 <title> 描述
      expect(article.route.segments.length).toBeGreaterThan(0)
      for (const segment of article.route.segments) {
        expect(segment.stops.length).toBeGreaterThanOrEqual(2)
        expect(html).toContain(segment.label)
        expect(html).toContain(segment.stops[0].label)
      }
      expect(html).toContain('role="img"')
      expect(html).toContain('guide-route-svg')
      expect(html).toContain('<title id="')

      // 食物小图谱：有就逐个画，是线稿不能冒充照片；没有就不硬凑这一栏
      if (article.food.length > 0) {
        expect(html.match(/class="guide-food-glyph"/g)?.length).toBe(article.food.length)
        expect(html).toContain('不是菜品照片')
      } else {
        expect(html).not.toContain('guide-food-glyph')
      }

      // 现场：有实拍就有准确 alt；没有就明说
      if (article.photos.length > 0) {
        expect(article.photos.length).toBeLessThanOrEqual(4)
        for (const photo of article.photos) {
          expect(photo.alt.length).toBeGreaterThan(8)
          expect(html).toContain(photo.src)
          expect(html).toContain(`alt="${photo.alt}"`)
        }
      } else {
        expect(article.photosNote).toBeTruthy()
        expect(html).toContain(article.photosNote as string)
      }

      // 注意事项只写通用提醒，并明确不是实时信息
      expect(article.cautions.length).toBeGreaterThan(0)
      expect(html).toContain('以现场公告为准')
    }
  })
})

describe('攻略页的内容与链接边界', () => {
  it('不出现帖子 / 原帖 / 小红书字段，也不跳外站', () => {
    const pages = [renderList(), ...guideArticles.map((_, index) => renderArticle(index))]

    for (const html of pages) {
      expect(html).not.toContain('小红书')
      expect(html).not.toContain('原帖')
      expect(html).not.toContain('帖子')
      expect(html).not.toContain('target="_blank"')
      expect(html).not.toMatch(/https?:\/\//)
    }
  })

  it('图片全部站内自托管，且不用第三方攻略封面', () => {
    const pages = [renderList(), ...guideArticles.map((_, index) => renderArticle(index))]

    for (const html of pages) {
      expect(html).not.toMatch(/src="https?:/i)
      expect(html).not.toContain('/media/guide/')
      for (const match of html.matchAll(/src="(\/media\/[^"]+)"/g)) {
        expect(match[1].startsWith('/media/photos/') || match[1].startsWith('/media/home/')).toBe(
          true,
        )
      }
    }
  })
})

describe('攻略页的数据可追溯', () => {
  it('每篇都能回指旧数据（guides.json 或 entries.*.json）', () => {
    for (const article of guideArticles) {
      const traces = article.evidenceIds.length + (article.stationRefs?.length ?? 0)
      expect(traces, `${article.id} 没有任何来源依据`).toBeGreaterThan(0)

      for (const id of article.evidenceIds) {
        expect(guideIds.has(id), `${article.id} 引用了不存在的条目 ${id}`).toBe(true)
      }
      for (const id of article.stationRefs ?? []) {
        expect(stationIds.has(id), `${article.id} 引用了不存在的站内条目 ${id}`).toBe(true)
      }
    }

    // 合计要覆盖到那批原始条目里的一大片，而不是只挂一两条做样子
    const cited = new Set(guideArticles.flatMap((article) => article.evidenceIds))
    expect(cited.size).toBeGreaterThanOrEqual(20)
  })

  it('引用的图片文件真实存在于 public/', () => {
    const sources = new Set<string>()
    for (const article of guideArticles) {
      if (article.cover) sources.add(article.cover.src)
      for (const photo of article.photos) sources.add(photo.src)
    }

    expect(sources.size).toBeGreaterThanOrEqual(8)
    for (const src of sources) {
      const file = `${PROJECT_ROOT}public${src}`
      expect(existsSync(file), `缺少图片文件 ${src}`).toBe(true)
    }
  })
})
