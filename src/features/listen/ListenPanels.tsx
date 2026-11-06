import { Link } from 'react-router-dom'
import { sources } from '../../lib/content'
import { AUDIO_PENDING_LABEL, LISTEN_CATEGORIES } from './catalog'

/** 需求说明：什么条件的录音才会被本站采用 */
export function ListenLicensingNote() {
  return (
    <section className="card space-y-3" aria-labelledby="listen-licensing">
      <h2 id="listen-licensing" className="section-title">
        录音授权需求
      </h2>
      <p className="text-sm leading-6 text-ink-soft">
        本站不自动播放，也不用语音合成凑数。要新增一条可播放的词句，需要同时满足：
      </p>
      <ul className="space-y-2 text-sm leading-6 text-ink-soft">
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-brick">
            ·
          </span>
          <span>
            母语者本人录音，并在文件里注明具体口音（例如汕头、潮州府城、普宁、潮阳、揭阳、澄海、饶平），
            不把粤语或泛闽南语录音当作潮汕话。
          </span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-brick">
            ·
          </span>
          <span>
            书面授权：允许本站展示与再分发（写清是否允许商业使用），并同意按 CC BY-SA 4.0
            或更宽松的许可分享。
          </span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-brick">
            ·
          </span>
          <span>署名方式：录音者姓名或化名，以及希望展示的来源链接。</span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-brick">
            ·
          </span>
          <span>
            每条录音需由另一位母语者复核词句与读音；复核完成前，卡片保持「{AUDIO_PENDING_LABEL}」。
          </span>
        </li>
      </ul>
    </section>
  )
}

/** 外链：去已有来源站点核对发音，不搬运对方音频 */
export function ListenSourceCheck() {
  const picks = sources.filter(
    (source) => source.module === 'tingchao' && ['S9', 'S10', 'S11'].includes(source.id),
  )

  return (
    <section className="card space-y-3" aria-labelledby="listen-source-check">
      <h2 id="listen-source-check" className="section-title">
        去听潮来源核对发音
      </h2>
      <p className="text-sm leading-6 text-ink-soft">
        本站只链到来源站点，不下载、不热链对方的音频。听到的读音仍以来源页当时的内容为准。
      </p>
      {picks.length === 0 ? (
        <p className="text-sm text-muted">来源表里暂时没有登记可用于核对发音的站点。</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-3">
          {picks.map((source) => (
            <li key={source.id}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] flex-col justify-center rounded-xl border border-line bg-white/70 px-4 py-3 no-underline transition-colors hover:border-brick hover:text-brick"
              >
                <span className="text-sm font-medium text-ink">{source.title}</span>
                <span className="mt-1 text-xs text-muted">
                  {source.org}
                  {source.region ? ` · ${source.region}` : ''}
                </span>
                <span className="mt-2 text-xs text-brick">新窗口打开来源 ↗</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** 已上线录音的署名、许可与核对边界 */
export function ListenAttribution() {
  return (
    <section className="card space-y-3" aria-labelledby="listen-attribution">
      <h2 id="listen-attribution" className="section-title">
        录音来源与许可
      </h2>
      <p className="text-sm leading-6 text-ink-soft">
        可播放录音来自 Wikimedia Commons，作者为 Austin Zhang（20 条）与 Oh! Tea（1 条），共 21 条，
        许可为 CC BY-SA 4.0，本站只把原始 Ogg / WAV 转码为 MP3，未剪辑读音。
      </p>
      <p className="text-xs leading-5 text-muted">
        署名格式：<span className="text-ink-soft">Austin Zhang, CC BY-SA 4.0, via Wikimedia Commons</span>；
        许可全文：
        <a
          className="link-inline ml-1"
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          creativecommons.org/licenses/by-sa/4.0 ↗
        </a>
      </p>
      <p className="text-xs leading-5 text-muted">
        逐条原文件 URL、作者、许可与 SHA-256 记录在
        <a className="link-inline mx-1" href="/media/listen/ASSETS.md" target="_blank" rel="noopener noreferrer">
          public/media/listen/ASSETS.md
        </a>
        。录音尚未请潮汕母语者逐条复核；如发现不符会先下线该条。
      </p>
      <p className="text-xs leading-5 text-muted">
        词义按来源页标注的汉字直译，标「字面」的只解释汉字对应关系，不代表完整语用。
        完整来源清单见
        <Link className="link-inline mx-1" to="/sources#S500">
          资料来源页
        </Link>
        。
      </p>
    </section>
  )
}

/** 分类页底部的上一类 / 下一类导航 */
export function ListenCategoryJump({ current }: { current: string }) {
  const index = LISTEN_CATEGORIES.findIndex((category) => category.slug === current)
  const prev = index > 0 ? LISTEN_CATEGORIES[index - 1] : undefined
  const next = index >= 0 && index < LISTEN_CATEGORIES.length - 1 ? LISTEN_CATEGORIES[index + 1] : undefined

  return (
    <nav aria-label="听潮分类导航" className="flex flex-wrap items-center justify-between gap-3">
      {prev ? (
        <Link to={`/listen/${prev.slug}`} className="btn-secondary">
          ← {prev.label}
        </Link>
      ) : (
        <Link to="/listen" className="btn-secondary">
          ← 全部词句
        </Link>
      )}
      {next ? (
        <Link to={`/listen/${next.slug}`} className="btn-secondary">
          {next.label} →
        </Link>
      ) : (
        <Link to="/listen" className="btn-secondary">
          全部词句 →
        </Link>
      )}
    </nav>
  )
}
