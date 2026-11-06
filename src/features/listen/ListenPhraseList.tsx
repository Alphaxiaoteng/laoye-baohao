import type { AudioItem } from '../../types/content'
import { useAudioStore } from '../../store/audio'
import { useProgressStore } from '../../store/progress'
import { SourceBadges } from '../../components/SourceBadge'
import { AUDIO_PENDING_LABEL, shortMeaning } from './catalog'

interface Props {
  items: AudioItem[]
}

/**
 * 听潮词句列表（精简版）：一行只留大字词句、播放按钮和一句话释义。
 * 拼音、口音、录音者与许可收进「信息」折叠区，法定署名不删除；
 * 「口音 / 授权」不再出现在主列表的可见文案里。
 */
export function ListenPhraseList({ items }: Props) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <ListenPhraseRow key={item.id} item={item} />
      ))}
    </ul>
  )
}

function ListenPhraseRow({ item }: { item: AudioItem }) {
  const playingId = useAudioStore((s) => s.playingId)
  const failedId = useAudioStore((s) => s.failedId)
  const requestPlay = useAudioStore((s) => s.requestPlay)
  const stop = useAudioStore((s) => s.stop)
  const retry = useAudioStore((s) => s.retry)
  const markAudio = useProgressStore((s) => s.markAudio)

  const hasFile = Boolean(item.file && item.file.trim())
  const playing = playingId === item.id
  const failed = failedId === item.id
  const short = shortMeaning(item.meaning)
  const full = (item.meaning ?? '').trim()
  const detailMeaning = full && full !== short ? full : ''

  async function handlePlay() {
    if (!hasFile) return
    if (playing) {
      stop()
      return
    }
    const ok = failed ? await retry(item.id, item.file) : await requestPlay(item.id, item.file)
    if (ok) markAudio(item.id)
  }

  return (
    <li className="rounded-[16px] border border-white/12 bg-white/[0.05] px-3.5 py-3">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="break-words font-serif text-[23px] font-semibold leading-tight text-ink">
            {item.text || '（词句待补充）'}
          </p>
          {short ? (
            <p className="mt-1 truncate text-[13px] leading-5 text-muted">{short}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => void handlePlay()}
          disabled={!hasFile}
          aria-pressed={playing}
          aria-label={`${playing ? '停止播放' : '播放'}：${item.text}`}
          className={[
            'grid h-11 w-11 shrink-0 place-items-center rounded-full border text-[15px] transition-colors duration-200 ease-exhibit focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-40',
            playing
              ? 'border-white/30 bg-white/[0.14] text-ink'
              : 'border-coral/70 bg-coral text-white hover:bg-[#ff5c4b]',
          ].join(' ')}
        >
          <span aria-hidden="true">{playing ? '■' : '▶'}</span>
        </button>
      </div>

      {failed ? (
        <p role="status" className="mt-2 text-xs text-brick">
          暂时无法播放，点一下再试
        </p>
      ) : null}

      <details className="mt-2">
        <summary className="inline-flex min-h-[32px] cursor-pointer list-none items-center gap-1 text-[11px] text-faint transition-colors duration-200 ease-exhibit hover:text-ink">
          <span aria-hidden="true">ⓘ</span>
          信息
        </summary>
        <dl className="mt-1 space-y-1 text-[11px] leading-5 text-muted">
          {item.pinyin ? (
            <div className="flex gap-2">
              <dt className="shrink-0 text-faint">拼音</dt>
              <dd className="min-w-0 break-words">{item.pinyin}</dd>
            </div>
          ) : null}
          {item.accent ? (
            <div className="flex gap-2">
              <dt className="shrink-0 text-faint">口音</dt>
              <dd className="min-w-0 break-words">{item.accent}</dd>
            </div>
          ) : null}
          {item.recorder ? (
            <div className="flex gap-2">
              <dt className="shrink-0 text-faint">录音</dt>
              <dd className="min-w-0 break-words">{item.recorder}</dd>
            </div>
          ) : null}
          {item.license ? (
            <div className="flex gap-2">
              <dt className="shrink-0 text-faint">许可</dt>
              <dd className="min-w-0 break-words">{item.license}</dd>
            </div>
          ) : null}
          {detailMeaning ? (
            <div className="flex gap-2">
              <dt className="shrink-0 text-faint">释义</dt>
              <dd className="min-w-0 break-words">{detailMeaning}</dd>
            </div>
          ) : null}
          {!hasFile ? (
            <div className="flex gap-2">
              <dt className="shrink-0 text-faint">状态</dt>
              <dd>{AUDIO_PENDING_LABEL}</dd>
            </div>
          ) : null}
          <div className="flex gap-2">
            <dt className="shrink-0 text-faint">复核</dt>
            <dd>录音尚未请潮汕母语者逐条复核</dd>
          </div>
        </dl>
        <SourceBadges ids={item.sourceIds} className="mt-1.5" />
      </details>
    </li>
  )
}
