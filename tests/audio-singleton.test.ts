import { beforeEach, describe, expect, it } from 'vitest'
import { attachAudioSink, useAudioStore, type AudioSink } from '../src/store/audio'

const calls: string[] = []

const sink: AudioSink = {
  play: async (file: string) => {
    calls.push(`play:${file}`)
  },
  stop: () => {
    calls.push('stop')
  },
}

function reset(): void {
  useAudioStore.setState({ playingId: null, currentFile: null, failedId: null })
  calls.length = 0
  attachAudioSink(sink)
}

describe('听潮播放器（全局单例）', () => {
  beforeEach(reset)

  it('开始新一条时先停掉上一条', async () => {
    const store = useAudioStore.getState()
    await store.requestPlay('a', '/audio/a.mp3')
    expect(useAudioStore.getState().playingId).toBe('a')

    await useAudioStore.getState().requestPlay('b', '/audio/b.mp3')
    expect(calls).toEqual(['play:/audio/a.mp3', 'stop', 'play:/audio/b.mp3'])
    expect(useAudioStore.getState().playingId).toBe('b')
  })

  it('file 为空的词条不能播放', async () => {
    const ok = await useAudioStore.getState().requestPlay('empty', '')
    expect(ok).toBe(false)
    expect(calls).toEqual([])
    expect(useAudioStore.getState().playingId).toBeNull()
  })

  it('播放中再次请求同一条前先停止（按钮变停止由 UI 处理）', async () => {
    await useAudioStore.getState().requestPlay('a', '/audio/a.mp3')
    useAudioStore.getState().stop()
    expect(calls).toEqual(['play:/audio/a.mp3', 'stop'])
    expect(useAudioStore.getState().playingId).toBeNull()
  })

  it('播放失败时记录 failedId 供重试', async () => {
    attachAudioSink({
      play: async () => {
        throw new Error('decode error')
      },
      stop: () => calls.push('stop'),
    })
    const ok = await useAudioStore.getState().requestPlay('bad', '/audio/bad.mp3')
    expect(ok).toBe(false)
    const state = useAudioStore.getState()
    expect(state.playingId).toBeNull()
    expect(state.failedId).toBe('bad')
  })

  it('播放结束自动停止', async () => {
    await useAudioStore.getState().requestPlay('a', '/audio/a.mp3')
    useAudioStore.getState().handleEnded('a')
    expect(useAudioStore.getState().playingId).toBeNull()
  })

  it('重试成功会清掉失败标记', async () => {
    useAudioStore.setState({ failedId: 'a', playingId: null, currentFile: null })
    calls.length = 0
    attachAudioSink(sink)
    const ok = await useAudioStore.getState().retry('a', '/audio/a.mp3')
    expect(ok).toBe(true)
    expect(useAudioStore.getState().failedId).toBeNull()
    expect(useAudioStore.getState().playingId).toBe('a')
  })
})
