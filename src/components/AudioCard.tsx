import type { AudioItem } from '../types/content'
import { useAudioStore } from '../store/audio'
import { useProgressStore } from '../store/progress'
import { SourceBadges } from './SourceBadge'

interface Props {
  item: AudioItem
}

/**
 * 听潮词句卡片。
 * - file 为空（未取得授权录音）时按钮禁用并提示「音频待授权录制」。
 * - 播放中按钮变"停止"，失败提示可重试，不自动重发请求。
 */
export default function AudioCard({ item }: Props) {
  const playingId = useAudioStore((s) => s.playingId)
  const failedId = useAudioStore((s) => s.failedId)
  const requestPlay = useAudioStore((s) => s.requestPlay)
  const stop = useAudioStore((s) => s.stop)
  const retry = useAudioStore((s) => s.retry)
  const markAudio = useProgressStore((s) => s.markAudio)

  const hasFile = Boolean(item.file && item.file.trim())
  const playing = playingId === item.id
  const failed = failedId === item.id

  async function handleClick() {
    if (!hasFile) return
    if (playing) {
      stop()
      return
    }
    const ok = failed ? await retry(item.id, item.file) : await requestPlay(item.id, item.file)
    if (ok) markAudio(item.id)
  }

  return (
    <li className="card flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-serif text-xl text-ink">{item.text || '（词句待补充）'}</p>
        {item.pinyin ? <span className="text-sm text-muted">{item.pinyin}</span> : null}
      </div>

      {item.meaning ? <p className="text-sm leading-6 text-ink-soft">{item.meaning}</p> : null}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {item.accent ? <span className="chip">口音：{item.accent}</span> : null}
        {item.license ? <span className="chip">授权：{item.license}</span> : null}
        {item.recorder ? <span className="chip">录音：{item.recorder}</span> : null}
        {!hasFile ? <span className="chip border-brick/40 text-brick">音频待授权录制</span> : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={playing ? 'btn-secondary' : 'btn-primary'}
          onClick={handleClick}
          disabled={!hasFile}
          aria-pressed={playing}
          aria-label={`${playing ? '停止播放' : '播放'}：${item.text}`}
        >
          <span aria-hidden="true">{playing ? '■' : '▶'}</span>
          {playing ? '停止' : failed ? '重试播放' : '播放'}
        </button>

        {!hasFile ? (
          <span className="text-xs text-muted">该词句还没有取得可播放的授权录音。</span>
        ) : null}

        {failed ? (
          <span role="status" className="text-sm text-brick">
            暂时无法播放，请重试
          </span>
        ) : null}
      </div>

      <SourceBadges ids={item.sourceIds} />
    </li>
  )
}
