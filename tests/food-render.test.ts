import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { FoodRoutes } from '../src/features/food'

/**
 * 渲染冒烟测试：把美食模块三条路由各渲染一遍，
 * 确认没有运行时异常，并且关键界面元素（返回、步数、了解制作、计时说明）真的出现。
 */
function render(path: string): string {
  const html = renderToString(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(
        Routes,
        null,
        ...FoodRoutes.map((route) =>
          createElement(Route, { key: route.path, path: route.path, element: route.element }),
        ),
      ),
    ),
  )
  // React 会用 <!-- --> 分隔相邻文本节点，断言前先去掉，避免误判
  return html.replace(/<!--\s*-->/g, '')
}

describe('美食模块页面可以渲染', () => {
  it('/museum/food 有菜品带、步骤条与「食谱」卡片', () => {
    const html = render('/museum/food')
    expect(html).toContain('潮汕美食')
    expect(html).toContain('牛肉粿条汤')
    expect(html).toContain('潮州卤鹅')
    // 首页把食谱展开成可点选的步骤条，不再在卡片上写「共 N 步」
    expect(html).toContain('牛肉粿条汤的步骤')
    expect(html).toContain('aria-label="第 1 步：')
    expect(html).toContain('暂停')
    expect(html).not.toContain('连播')
    // 无弹窗时页面不渲染 dialog
    expect(html).not.toContain('aria-modal')
    // 菜品图是站内白底食物图，不热链，也不再用旧的示意素材
    expect(html).toContain('/media/food/white/recipe-beef-kway-teow-soup/step-06.webp')
    expect(html).not.toContain('/media/photos/food-')
    expect(html).not.toContain('/media/food/dish-')
    expect(html).not.toMatch(/https?:\/\/[^"']*\.(jpg|jpeg|png|webp)/i)
  })

  it('/museum/food/menu 列出全部菜品与食谱', () => {
    const html = render('/museum/food/menu')
    expect(html).toContain('全部菜品')
    expect(html).toContain('牛肉粿条汤')
    expect(html).toContain('潮州卤鹅')
    expect(html).toContain('潮汕手打牛肉丸')
    // 卤鹅条目现在复用站内白底成品图，不再有单独的 illus 插画
    expect(html).toContain('/media/food/white/recipe-chaozhou-braised-goose/step-07.webp')
    expect(html).toContain('共 6 步')
    expect(html).not.toContain('/media/photos/food-')
    expect(html).not.toContain('/media/food/dish-')
  })

  it('/recipe/:id 有分步界面、份量调整与计时说明', () => {
    const html = render('/recipe/recipe-beef-kway-teow-soup')
    expect(html).toContain('牛肉粿条汤')
    expect(html).toContain('第')
    expect(html).toContain('/ 6 步')
    expect(html).toContain('上一步')
    expect(html).toContain('查看全部步骤')
    expect(html).toContain('调整份量')
    expect(html).toContain('计时只是提醒，不代表食物已熟')
    expect(html).toContain('50 g')
    // 步骤图是站内白底成品/步骤图，不再用旧的示意 SVG
    expect(html).toContain('/media/food/white/recipe-beef-kway-teow-soup/step-01.webp')
    expect(html).not.toContain('/media/food/step-01-cut.svg')
  })

  it('未知食谱 id 给出可回到菜单的兜底页，不崩', () => {
    const html = render('/recipe/not-exist')
    expect(html).toContain('没有找到这份食谱')
    expect(html).toContain('/museum/food/menu')
  })
})
