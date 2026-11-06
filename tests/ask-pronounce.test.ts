import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { prepareAsk, type AskRequest } from '../server/ask'
import { extractPronounceTarget } from '../server/ask-index'
import { loadContent } from '../server/content'
import { parseAskClip, parseEventBlock } from '../src/lib/askClient'
import AskDrawer from '../src/components/AskDrawer'
import Nav from '../src/components/Nav'
import type { ContentBundle } from '../src/types/content'

const content = loadContent()

function req(question: string): AskRequest {
  return { question, context: {}, history: [] }
}

const mini: ContentBundle = {
  entries: [],
  story: [],
  recipes: [],
  audio: [
    {
      id: 'pending',
      category: 'greeting',
      text: '食饱未',
      meaning: '吃饭了吗',
      sourceIds: ['S2'],
    },
    {
      id: 'dup-a',
      category: 'courtesy',
      text: '甲句',
      meaning: '重复词',
      file: '/media/listen/a.mp3',
      sourceIds: ['S2'],
    },
    {
      id: 'dup-b',
      category: 'courtesy',
      text: '乙句',
      meaning: '重复词',
      file: '/media/listen/b.mp3',
      sourceIds: ['S2'],
    },
  ],
  sources: [{ id: 'S2', title: '茶来源', org: '机构乙', url: '', verify: 'fetched' }],
  media: [],
}

describe('怎么说 / 怎么读', () => {
  it('谢谢用潮汕话怎么说：只附上听潮里那一条，并带登记拼音', () => {
    const plan = prepareAsk(req('谢谢用潮汕话怎么说'), content)
    expect(plan.messages).toEqual([])
    expect(plan.direct?.kind).toBe('pronounce')
    expect(plan.direct?.clip).toMatchObject({
      id: 'audio-courtesy-1',
      text: '㩼謝',
      file: '/media/listen/courtesy-zoi-sia.mp3',
      pinyin: 'zoi7 sia7',
      path: '/listen/courtesy',
    })
    expect(plan.direct?.text).toContain('㩼謝')
    expect(plan.direct?.text).toContain('只播一次')
    expect(plan.direct?.text).not.toContain('zoi7')
    expect(plan.direct?.clip?.sourceIds).toEqual(['S504'])
  })

  it('食飽未怎么读、新年快乐怎么说都对上已有词条', () => {
    const read = prepareAsk(req('食飽未怎么读'), content)
    expect(read.direct?.clip?.id).toBe('audio-greeting-1')
    expect(read.direct?.clip?.file).toBe('/media/listen/greeting-sih-pa-bui.mp3')

    const greet = prepareAsk(req('新年快乐怎么说'), content)
    expect(greet.direct?.clip?.text).toBe('新年快樂')
    expect(greet.direct?.clip?.file).toBe('/media/listen/greeting-sing-ni-kuai-lak.mp3')
  })

  it('对不上就不播，也不编读音或句子', () => {
    const plan = prepareAsk(req('火箭怎么说'), content)
    expect(plan.messages).toEqual([])
    expect(plan.direct?.kind).toBe('pronounce')
    expect(plan.direct?.clip).toBeUndefined()
    expect(plan.direct?.text).toBe(
      '资料里没有和「火箭」对得上的听潮录音，不确定该怎么说，也不会另编读音或句子。',
    )
    expect(plan.direct?.text).not.toMatch(/[a-z]+\d/)
    for (const item of content.audio) {
      expect(plan.direct?.text).not.toContain(item.text)
      if (item.pinyin) expect(plan.direct?.text).not.toContain(item.pinyin)
    }
  })

  it('没有写清要说哪一句时也不编', () => {
    const plan = prepareAsk(req('怎么读'), content)
    expect(plan.direct?.clip).toBeUndefined()
    expect(plan.direct?.text).toContain('不确定')
    expect(plan.direct?.text).not.toMatch(/[a-z]+\d/)
  })

  it('没有录音文件、或对上不止一条时都不播放', () => {
    const pending = prepareAsk(req('吃饭了吗怎么说'), mini)
    expect(pending.direct?.clip).toBeUndefined()
    expect(pending.direct?.text).toContain('食饱未')
    expect(pending.direct?.text).toContain('没有可播放的录音')
    expect(pending.direct?.text).not.toMatch(/\/media\//)

    const ambiguous = prepareAsk(req('重复词怎么读'), mini)
    expect(ambiguous.direct?.clip).toBeUndefined()
    expect(ambiguous.direct?.text).toContain('甲句')
    expect(ambiguous.direct?.text).toContain('乙句')
    expect(ambiguous.direct?.text).toContain('先不播')
  })

  it('文化问答和实时问题不会被读音规则截走', () => {
    expect(extractPronounceTarget('英歌和营老爷有什么联系？')).toBeNull()
    expect(extractPronounceTarget('今天英歌几点开始？')).toBeNull()
    expect(extractPronounceTarget('资料里怎么说英歌的起源')).toBeNull()
    expect(extractPronounceTarget('这一步为什么要这样做？')).toBeNull()

    const cross = prepareAsk(req('英歌和营老爷有什么联系？'), content)
    expect(cross.direct?.kind).not.toBe('pronounce')
    expect(cross.direct?.clip).toBeUndefined()

    const live = prepareAsk(req('今天英歌几点开始？'), content)
    expect(live.direct?.kind).toBe('realtime')
    expect(live.direct?.clip).toBeUndefined()
  })
})

describe('听潮片段只接受站内文件', () => {
  it('丢掉外链、空文件和缺词句', () => {
    expect(parseAskClip({ id: 'a', text: '谢谢', file: 'https://example.com/a.mp3' })).toBeUndefined()
    expect(parseAskClip({ id: 'a', text: '谢谢', file: '' })).toBeUndefined()
    expect(parseAskClip({ id: 'a', text: '', file: '/media/listen/a.mp3' })).toBeUndefined()
    expect(
      parseAskClip({
        id: 'audio-courtesy-1',
        text: '㩼謝',
        meaning: '多谢、谢谢',
        file: '/media/listen/courtesy-zoi-sia.mp3',
        pinyin: 'zoi7 sia7',
        path: '/listen/courtesy',
      }),
    ).toMatchObject({
      id: 'audio-courtesy-1',
      file: '/media/listen/courtesy-zoi-sia.mp3',
      pinyin: 'zoi7 sia7',
    })
  })

  it('SSE done 事件带上片段，坏片段则不带', () => {
    const ok = parseEventBlock(
      'event: done\ndata: {"text":"听潮里有这一句","citations":[],"navs":[],"uncertain":false,"direct":true,"clip":{"id":"audio-courtesy-1","text":"㩼謝","meaning":"多谢、谢谢","file":"/media/listen/courtesy-zoi-sia.mp3","path":"/listen/courtesy","pinyin":"zoi7 sia7"}}',
    )
    expect(ok).toMatchObject({
      type: 'done',
      clip: { id: 'audio-courtesy-1', file: '/media/listen/courtesy-zoi-sia.mp3' },
    })

    const bad = parseEventBlock(
      'event: done\ndata: {"text":"不确定","citations":[],"navs":[],"uncertain":true,"direct":true,"clip":{"id":"x","text":"编的","file":"https://evil.test/a.mp3"}}',
    )
    expect(bad).toMatchObject({ type: 'done', uncertain: true })
    expect(bad && 'clip' in bad ? bad.clip : undefined).toBeUndefined()
  })
})

describe('听潮不在潮Bot抽屉里', () => {
  it('顶栏有听潮，抽屉视图只剩问一问', () => {
    const nav = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Nav)))
    expect(nav).toContain('href="/listen"')
    expect(nav).toContain('听潮')
    expect(nav).toContain('英歌舞')
    expect(nav).toContain('工夫茶')
    expect(nav).toContain('href="/docs"')

    const drawer = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(AskDrawer)))
    expect(drawer).toContain('潮Bot 视图')
    expect(drawer).toContain('问一问')
    expect(drawer).not.toContain('听潮')
    expect(drawer).not.toContain('agent-tab-listen')
    expect(drawer).toContain('关闭潮Bot')
  })
})
