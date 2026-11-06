import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ListenRoutes } from '../src/features/listen'
import audioJson from '../content/audio.listen.json'
import type { AudioItem } from '../src/types/content'

const audio = audioJson as unknown as AudioItem[]

function render(path: string): string {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(
        Routes,
        null,
        ...ListenRoutes.map((route) =>
          createElement(Route, { key: route.path, path: route.path, element: route.element }),
        ),
      ),
    ),
  )
}

describe('听潮页面渲染', () => {
  it('/listen 渲染四个分类与全部词句，不自动播放', () => {
    const html = render('/listen')
    for (const label of ['打招呼', '喝茶吃饭', '日常礼貌', '文化词语']) {
      expect(html).toContain(label)
    }
    for (const entry of audio) {
      expect(html, `缺少词句 ${entry.id}`).toContain(entry.text)
    }
    // 服务端渲染不注入 <audio>，也没有进度条 / 倍速 / 录音等控件
    expect(html).not.toContain('<audio')
    expect(html).not.toContain('type="range"')
    expect(html).not.toContain('1.5x')
    expect(html).not.toContain('开始录音')
    expect(html).not.toContain('跟读评分</')
  })

  it('每个可播放词条都有播放按钮、口音与许可，不显示来源入口', () => {
    const html = render('/listen')
    for (const entry of audio) {
      expect(html).toContain(`播放：${entry.text}`)
      expect(html).toContain(entry.accent ?? '')
      expect(html).toContain(entry.license ?? '')
    }
    expect(html).toContain('CC BY-SA 4.0')
    expect(html).not.toContain('/sources#S500')
    expect(html).not.toContain('资料来源')
  })

  it('分类页只渲染该分类的词句', () => {
    const html = render('/listen/courtesy')
    const courtesy = audio.filter((entry) => entry.category === 'courtesy')
    // 「潮州」既出现在文化词语词条，也出现在口音说明「潮州话」里，无法用子串区分
    const others = audio.filter(
      (entry) => entry.category !== 'courtesy' && entry.text !== '潮州',
    )
    for (const entry of courtesy) expect(html).toContain(entry.text)
    for (const entry of others) expect(html).not.toContain(entry.text)
    expect(html).toContain('日常礼貌')
  })

  it('未知分类显示兜底页与分类入口，不崩溃', () => {
    const html = render('/listen/opera')
    expect(html).toContain('这个分类还没有登记')
    for (const label of ['打招呼', '喝茶吃饭', '日常礼貌', '文化词语']) {
      expect(html).toContain(label)
    }
  })

  it('录音使用说明仍在，但不再跳转外部核对站点', () => {
    const html = render('/listen')
    expect(html).not.toContain('去听潮来源核对发音')
    expect(html).toContain('录音授权需求')
    expect(html).toContain('音频待授权录制')
    expect(html).not.toContain('https://www.chaofayin.com/')
    expect(html).not.toContain('https://www.mogher.com/')
  })
})
