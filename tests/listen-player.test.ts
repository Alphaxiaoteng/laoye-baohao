import { beforeEach, describe, expect, it } from 'vitest'
import {
  attachAudioSink,
  stopAudioOnNavigate,
  useAudioStore,
  type AudioSink,
} from '../src/store/audio'

const calls: string[] = []
let shouldFail = false

const sink: AudioSink = {
  play: async (file: string) => {
    calls.push(`play:${file}`)
    if (shouldFail) throw new Error('blocked')
  },
  stop: () => {
    calls.push('stop')
  },
}

function reset(): void {
  useAudioStore.setState({ playingId: null, currentFile: null, failedId: null })
  calls.length = 0
  shouldFail = false
  attachAudioSink(sink)
}

const A = { id: 'audio-greeting-1', file: '/media/listen/greeting-sih-pa-bui.mp3' }
const B = { id: 'audio-greeting-2', file: '/media/listen/greeting-sing-ni-kuai-lak.mp3' }

describe('听潮播放（复用全局单例 store）', () => {
  beforeEach(reset)

  it('新一条会停掉上一条，全局只有一个 playingId', async () => {
    const okA = await useAudioStore.getState().requestPlay(A.id, A.file)
    expect(okA).toBe(true)
    expect(useAudioStore.getState().playingId).toBe(A.id)

    const okB = await useAudioStore.getState().requestPlay(B.id, B.file)
    expect(okB).toBe(true)
    expect(calls).toEqual([`play:${A.file}`, 'stop', `play:${B.file}`])
    expect(useAudioStore.getState().playingId).toBe(B.id)
    expect(useAudioStore.getState().currentFile).toBe(B.file)
  })

  it('切换页面会停止播放（AudioPlayerProvider 调用 stopAudioOnNavigate）', async () => {
    await useAudioStore.getState().requestPlay(A.id, A.file)
    stopAudioOnNavigate()
    expect(calls).toEqual([`play:${A.file}`, 'stop'])
    expect(useAudioStore.getState().playingId).toBeNull()
    expect(useAudioStore.getState().currentFile).toBeNull()
  })

  it('没有授权文件的词条不会发起播放请求', async () => {
    const ok = await useAudioStore.getState().requestPlay('audio-pending', '')
    expect(ok).toBe(false)
    expect(calls).toEqual([])
    expect(useAudioStore.getState().playingId).toBeNull()
  })

  it('播放失败时提示可重试，但不自动重复请求', async () => {
    shouldFail = true
    const ok = await useAudioStore.getState().requestPlay(A.id, A.file)
    expect(ok).toBe(false)
    expect(calls).toEqual([`play:${A.file}`])
    const state = useAudioStore.getState()
    expect(state.playingId).toBeNull()
    expect(state.failedId).toBe(A.id)
  })

  it('重试成功后清掉失败标记，仍然只播一条', async () => {
    shouldFail = true
    await useAudioStore.getState().requestPlay(A.id, A.file)
    expect(useAudioStore.getState().failedId).toBe(A.id)

    shouldFail = false
    const ok = await useAudioStore.getState().retry(A.id, A.file)
    expect(ok).toBe(true)
    expect(useAudioStore.getState().failedId).toBeNull()
    expect(useAudioStore.getState().playingId).toBe(A.id)
    expect(calls.filter((call) => call.startsWith('play:'))).toHaveLength(2)
  })

  it('主动停止后状态清空，再播新条目不会残留旧 id', async () => {
    await useAudioStore.getState().requestPlay(A.id, A.file)
    useAudioStore.getState().stop()
    expect(useAudioStore.getState().playingId).toBeNull()

    await useAudioStore.getState().requestPlay(B.id, B.file)
    expect(useAudioStore.getState().playingId).toBe(B.id)
    expect(useAudioStore.getState().failedId).toBeNull()
  })
})
