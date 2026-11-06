import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import DocsPage from '../src/routes/Docs'
import { audioItems } from '../src/lib/content'

function render(): string {
  const html = renderToString(
    createElement(MemoryRouter, { initialEntries: ['/docs'] }, createElement(DocsPage)),
  )
  return html.replace(/<!--\s*-->/g, '')
}

describe('历史介绍', () => {
  it('五个板块的原文、食谱、故事和听潮词句都排在同一页', () => {
    const html = render()

    expect(html).toContain('历史介绍')
    expect(html).not.toContain('文档介绍')
    expect(html).toContain('id="doc-yingge"')
    expect(html).toContain('id="doc-tea"')
    expect(html).toContain('id="doc-food"')
    expect(html).toContain('id="doc-yinglaoye"')
    expect(html).toContain('id="doc-listen"')
    expect(html).toContain('id="doc-yingge-story"')

    expect(html).toContain('国家级非遗名录里的英歌')
    expect(html).toContain('中国非物质文化遗产网项目页列明')
    expect(html).toContain('手打牛肉丸是潮汕地区常见的丸类小食')
    expect(html).toContain('潮州话里')
    expect(html).toContain('本故事为原创虚构串联')
    expect(html).toContain('牛肉粿条汤')
    expect(html).toContain('烫粿条：把粿条放进沸水锅烫熟')

    expect(html).toContain('食飽未')
    expect(html).toContain('吃饱了没有？（字面：食＝吃，飽＝饱，未＝没有）')
    expect(html).toContain('ziah8 ba2 bhuê7')
    expect(html).toContain('食暝昏')
    expect(html).toContain('㩼謝')
    expect(html).toContain('汕頭')
    // 词条会随 content/audio.listen.json 增补；断言「全部词条都排进页面」，并保底不少于 21 条
    expect(audioItems.length).toBeGreaterThanOrEqual(21)
    expect(html.match(/class="docs-phrase"/g)?.length).toBe(audioItems.length)

    expect(html).toContain('/media/home/yingge-dance-1.webp')
    expect(html).toContain('/media/home/teochew-kanghu-tea.webp')
    expect(html).toContain('/media/food/white/food-beef-ball.webp')
    expect(html).toContain('/media/photos/yinglaoye-chaoyang-sedan.jpg')
    expect(html).toContain('/media/yingge/objects/objects-archive.webp')
  })

  it('不再出现来源编号与来源区', () => {
    const html = render()

    expect(html).not.toContain('[S500]')
    expect(html).not.toContain('/sources')
    expect(html).not.toContain('docs-sources')
  })

  it('章节与小节使用统一的序号', () => {
    const html = render()

    // 五章号：01–05，同时出现在左侧目录与总览带
    expect(html).toContain('01')
    expect(html).toContain('02')
    expect(html).toContain('03')
    expect(html).toContain('04')
    expect(html).toContain('05')

    // 连续小节号：英歌 01.01–01.08、工夫茶 02.01、美食 03.01 与食谱 03.04、营老爷 04.01
    expect(html).toContain('01.01')
    expect(html).toContain('01.08')
    expect(html).toContain('02.01')
    expect(html).toContain('03.01')
    expect(html).toContain('03.04')
    expect(html).toContain('04.01')
    expect(html).toContain('04.11')

    // 听潮：分类 05.01–05.04，词条再细分到 05.01.01
    expect(html).toContain('05.01')
    expect(html).toContain('05.04')
    expect(html).toContain('05.01.01')
    expect(html).toContain('05.04.08')
  })

  it('顶部有五章总览导览带', () => {
    const html = render()

    expect(html).toContain('aria-label="五章总览"')
    expect(html).toContain('class="docs-overview"')
    expect(html).toContain('docs-overview-card')
    expect(html).toContain('docs-overview-num')
    expect(html).toContain('href="#doc-yingge"')
    expect(html).toContain('href="#doc-tea"')
    expect(html).toContain('href="#doc-food"')
    expect(html).toContain('href="#doc-yinglaoye"')
    expect(html).toContain('href="#doc-listen"')
    expect(html).toContain('docs-nav-num')
  })

  it('五章各有内联 SVG 图解', () => {
    const html = render()

    // 英歌：阵形点位 + 鼓点循环
    expect(html).toContain('英歌阵形点位示意')
    expect(html).toContain('英歌鼓点循环示意')
    expect(html).toContain('docs-tab')

    // 工夫茶：冲泡环节关系
    expect(html).toContain('工夫茶冲泡环节关系示意')
    expect(html).toContain('提铫高冲')

    // 美食：食材 → 处理 → 成菜
    expect(html).toContain('潮汕食谱的食材、处理与成菜关系示意')
    expect(html).toContain('食材（据食谱）')

    // 营老爷：队伍结构 + 地区案例
    expect(html).toContain('营老爷巡游队伍结构与地区案例示意')
    expect(html).toContain('地区案例（原文年份）')
    expect(html).toContain('四地案例对照')

    // 听潮：四类词条结构
    expect(html).toContain('听潮四类词条数量结构')
    expect(html).toContain('不表示时长或声波')

    // 内联 SVG 不引外部依赖
    expect(html).not.toContain('<img src="data:image/svg')
    expect(html.match(/role="img"/g)?.length).toBeGreaterThanOrEqual(5)
  })
})
