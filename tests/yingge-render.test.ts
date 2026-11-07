import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { YinggeRoutes } from '../src/features/yingge'
import { YINGGE_STORY_REDIRECT } from '../src/features/yingge/pages/Story'

/**
 * 渲染冒烟测试：英歌模块五条路由各渲染一遍。
 * 只断言「页面结构 + 关键声明文案」还在，不断言样式——
 * 换皮时可以改配色与容器，但标题层级与「互动示意 / 合成节拍」的边界说明不能丢。
 */
function render(path: string): string {
  const html = renderToString(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(
        Routes,
        null,
        ...YinggeRoutes.map((route) =>
          createElement(Route, { key: route.path, path: route.path, element: route.element }),
        ),
      ),
    ),
  )
  // React 会用 <!-- --> 分隔相邻文本节点，断言前先去掉，避免误判
  return html.replace(/<!--\s*-->/g, '')
}

describe('英歌模块页面可以渲染', () => {
  it('/museum/yingge 有数字馆、阵形与角色，本页依据在底部', () => {
    const html = render('/museum/yingge')
    expect(html).toContain('<h1')
    expect(html).toContain('英歌舞')
    expect(html).not.toContain('脚步先于槌')
    expect(html).not.toContain('<video')
    expect(html).not.toContain('槌与锣鼓')
    expect(html).not.toContain('只示意循环结构')
    expect(html).not.toContain('培训与节目编排')
    expect(html).toContain('角色')
    expect(html).toContain('阵形')
    expect(html).toContain('上一个')
    expect(html).toContain('下一个')
    expect(html).toContain('/media/yingge/objects/icon-command-flag.webp')
    expect(html).toContain('id="museum"')
    expect(html).toContain('云游英歌舞')
    expect(html).toContain('进入后直接播放展厅')
    expect(html).not.toContain('skipIntro=1')
    const museum = readFileSync('src/features/yingge/pages/HomeV2.tsx', 'utf8')
    expect(museum).toContain("const MUGEDA_PAGE = '/exhibits/yingge/mugeda/index.html'")
    expect(museum).toContain("const MUGEDA_SRC = '/exhibits/yingge/mugeda/index.html?embed=1'")
    expect(museum).toContain("const MUGEDA_ENTRY_PAGE = '15otp1rcl1u'")
    expect(museum).toContain('mugedaEntryPage = MUGEDA_ENTRY_PAGE')
    expect(museum).toContain('setSrc(MUGEDA_SRC)')
    expect(html).toContain('后退')
    expect(html).toContain('前进')
    expect(html).toContain('返回')
    expect(html).toContain('继续探索')
    expect(html).not.toContain('进入第二页')
    expect(html).not.toContain('id="story"')
    expect(html).not.toContain('从「捣珍」到广场')
  })

  it('/museum/yingge/story 重定向到历史介绍叙事锚点，不再渲染第二页', () => {
    expect(YINGGE_STORY_REDIRECT).toBe('/docs#doc-yingge-story')
    const route = YinggeRoutes.find((item) => item.path === '/museum/yingge/story')
    expect(route?.element).toBeTruthy()
    const html = render('/museum/yingge/story')
    expect(html).not.toContain('英歌舞 · 第二页')
    expect(html).not.toContain('进入第二页')
    expect(html).not.toContain('从「捣珍」到广场')
  })

  it('/museum/yingge/formations 有互动示意声明与可切换阵形', () => {
    const html = render('/museum/yingge/formations')
    expect(html).toContain('<h1')
    expect(html).toContain('队伍如何在空间里移动')
    expect(html).toContain('互动示意，不代表某地标准阵形。')
    expect(html).toContain('拖动可旋转视角')
    expect(html).toContain('双龙出海')
    expect(html).toContain('田螺阵')
    expect(html).toContain('自动巡演：开')
    expect(html).toContain('如何读懂一次变阵')
  })

  it('/museum/yingge/roles 有角色表与器物选择', () => {
    const html = render('/museum/yingge/roles')
    expect(html).toContain('<h1')
    expect(html).toContain('他在队伍里做什么')
    expect(html).toContain('一支队伍里的位置')
    expect(html).toContain('头槌、二槌')
    expect(html).toContain('六件器物，逐个看')
    expect(html).toContain('双槌（英歌槌）')
    expect(html).toContain('脸谱')
    expect(html).toContain('aria-pressed="true"')
    // 长描述默认收进 details，页面上以器物图为主
    expect(html).toContain('<details')
    expect(html).toContain('形制与用法')
    // 器物图仍是本站复用的概念器物图
    expect(html).toContain('/media/yingge/objects/icon-clubs.webp')
  })

  it('/museum/yingge/watch 用原生 video，不自动播放', () => {
    const html = render('/museum/yingge/watch')
    expect(html).toContain('<h1')
    expect(html).toContain('动作、声音与队形，同时发生')
    expect(html).toContain('演出片段')
    expect(html).toContain('<video')
    expect(html).toContain('controls=""')
    expect(html).toContain('preload="metadata"')
    expect(html).not.toMatch(/<video[^>]*\bautoplay\b/i)
    expect(html).toContain('/media/yingge/watch/yingge-square-720p.mp4')
    // 画框下的来源说明与静帧说明
    expect(html).toContain('两张静帧')
    expect(html).toContain('素材出处见下方说明')
  })

  it('/museum/yingge/sound 有合成节拍声明与播放控件', () => {
    const html = render('/museum/yingge/sound')
    expect(html).toContain('<h1')
    expect(html).toContain('声音帮助队伍感知同一个节拍')
    expect(html).toContain('合成节拍示意，不是真实锣鼓录音。')
    expect(html).toContain('节拍互动')
    expect(html).toContain('开始合成节拍')
    expect(html).toContain('3 下鼓点一循环')
    expect(html).toContain('锣鼓不是背景音乐')
  })

  it('公开页面不出现原站角色形象名，也不热链外部图片', () => {
    const pages = [
      '/museum/yingge',
      '/museum/yingge/formations',
      '/museum/yingge/roles',
      '/museum/yingge/watch',
      '/museum/yingge/sound',
    ]
    for (const path of pages) {
      const html = render(path)
      expect(html).not.toContain('英歌小槌')
      expect(html).not.toMatch(/<img[^>]+src="https?:\/\//i)
    }
  })
})
