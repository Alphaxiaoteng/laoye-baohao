import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AskClip } from '../../lib/askClient'
import { useAudioStore } from '../../store/audio'
import { useProgressStore } from '../../store/progress'

/** 同一条回答只发起一次播放。抽屉重渲染、严格模式重跑 effect 都不再播第二遍。 */
const started = new Set<string>()

interface Props {
  messageId: string
  clip: AskClip
  /** 回答到达时抽屉仍开着才自动播；关着则只显示词卡，不补播 */
  autoplay: boolean
}

/**
 * 助手气泡里的听潮词卡：一句现成词、一条波形。
 * 波形只在这一次播放期间动，播完停住，不循环。
 */
export function AskPhraseClip({ messageId, clip, autoplay }: Props) {
  const playingId = useAudioStore((s) => s.playingId)
  const failedId = useAudioStore((s) => s.failedId)
  const requestPlay = useAudioStore((s) => s.requestPlay)
  const [used, setUsed] = useState(() => started.has(messageId))
  const playing = playingId === clip.id
  const failed = failedId === clip.id

  useEffect(() => {
    if (!autoplay || started.has(messageId)) return
    started.add(messageId)
    setUsed(true)
    let cancelled = false
    void requestPlay(clip.id, clip.file).then((ok) => {
      const drawer = document.getElementById('ask-drawer')
      if (drawer?.classList.contains('hidden')) {
        useAudioStore.getState().stop()
        return
      }
      if (cancelled) return
      if (ok) useProgressStore.getState().markAudio(clip.id)
    })
    return () => {
      cancelled = true
    }
  }, [autoplay, clip.file, clip.id, messageId, requestPlay])

  function playOnce() {
    if (started.has(messageId) || playing) return
    started.add(messageId)
    setUsed(true)
    void requestPlay(clip.id, clip.file).then((ok) => {
      if (ok) useProgressStore.getState().markAudio(clip.id)
    })
  }

  const status = playing
    ? '正在播放，只此一次'
    : failed
      ? '暂时无法播放'
      : used
        ? '这句话只播一次'
        : '听潮里的这一句'

  return (
    <figure className="ask-phrase">
      <div className="ask-phrase-copy">
        <p className="ask-phrase-text">{clip.text}</p>
        {clip.meaning ? <p className="ask-phrase-meaning">{clip.meaning}</p> : null}
        {clip.pinyin ? <p className="ask-phrase-pinyin">登记拼音 {clip.pinyin}</p> : null}
      </div>
      <div className={playing ? 'ask-phrase-wave is-playing' : 'ask-phrase-wave'} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <p className="ask-phrase-status" role="status">
        {status}
      </p>
      {autoplay || used ? null : (
        <button type="button" className="ask-phrase-play" onClick={playOnce}>
          播放一次
        </button>
      )}
      <Link to={clip.path} className="ask-phrase-link">
        在听潮里查看
      </Link>
    </figure>
  )
}
