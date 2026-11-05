import { useMemo } from 'react'
import {
  AUDIO_CATEGORY_ORDER,
  audioCategoryLabel,
  audioItems,
} from '../lib/content'
import AudioCard from '../components/AudioCard'
import { usePageContext, usePageTitle } from '../lib/usePageContext'

export default function ListenPage() {
  usePageTitle('听潮')
  usePageContext({ module: 'tingchao', moduleTitle: '听潮' })

  const groups = useMemo(() => {
    const map = new Map<string, typeof audioItems>()
    for (const item of audioItems) {
      const key = (item.category || '').trim() || '未分类'
      const list = map.get(key) ?? []
      list.push(item)
      map.set(key, list)
    }
    const ordered: { key: string; label: string; items: typeof audioItems }[] = []
    for (const key of AUDIO_CATEGORY_ORDER) {
      const list = map.get(key)
      if (list && list.length > 0) {
        ordered.push({ key, label: audioCategoryLabel(key), items: list })
        map.delete(key)
      }
    }
    for (const [key, list] of map) {
      ordered.push({ key, label: audioCategoryLabel(key), items: list })
    }
    return ordered
  }, [])

  const playable = audioItems.filter((a) => (a.file ?? '').trim() !== '').length
  const missingText = audioItems.filter((a) => (a.text ?? '').trim() === '').length

  return (
    <div className="space-y-8">
      <header className="max-w-2xl space-y-3">
        <p className="text-xs tracking-[0.3em] text-brick">听潮</p>
        <h1 className="mt-1 font-serif text-3xl text-ink">基础潮汕话词句</h1>
        <p className="text-[15px] leading-7 text-ink-soft">
          点一次播放，播放中按钮变"停止"；开始新一条会停掉上一条，切换页面也会停止。
          本站不做录音、跟读评分、识别或语音合成，也没有自动播放。
        </p>
        <p className="text-xs leading-5 text-muted">
          口音以词条标注为准；没有取得授权的录音不会上线，对应卡片会写明"音频待授权录制"。
        </p>
      </header>

      {audioItems.length === 0 ? (
        <div className="card">
          <p className="text-sm text-ink-soft">
            听潮词条待登记（content/audio.json 还没有内容）。播放器逻辑已实现，等授权录音到位后即可使用。
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted">
            共 {audioItems.length} 条词句，其中 {playable} 条有可播放音频。
            {missingText > 0 ? `另有 ${missingText} 条词句本身仍待补充可靠来源。` : ''}
          </p>

          {groups.map((group) => (
            <section key={group.key} aria-labelledby={`cat-${group.key}`} className="space-y-3">
              <h2 id={`cat-${group.key}`} className="section-title">
                {group.label}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {group.items.map((item) => (
                  <AudioCard key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}

      <section className="card space-y-2">
        <h2 className="section-title">为什么有的卡片不能播</h2>
        <p className="text-sm leading-6 text-ink-soft">
          潮汕话有口音差异，本站不拿机器合成或来源不明的录音凑数。没有本地录音与展示授权时，
          卡片只保留词句结构，播放按钮保持禁用，避免让人误以为听到的是核对过的读音。
        </p>
      </section>
    </div>
  )
}
