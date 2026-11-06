import { Link } from 'react-router-dom'
import { audioItems, entries, recipes, sources, storyChapters } from '../lib/content'
import { useAudioStore } from '../store/audio'
import { usePageContext, usePageTitle } from '../lib/usePageContext'

export default function AboutPage() {
  usePageTitle('关于')
  usePageContext({ moduleTitle: '关于与说明' })

  const playingId = useAudioStore((s) => s.playingId)
  const requestPlay = useAudioStore((s) => s.requestPlay)
  const stop = useAudioStore((s) => s.stop)
  const failedId = useAudioStore((s) => s.failedId)

  const verified = entries.filter((e) => e.verify === 'verified').length
  const pendingSource = entries.filter((e) => e.verify === 'pending-source').length
  const underReview = entries.filter((e) => e.verify === 'draft-needs-local-review').length
  const playable = audioItems.filter((a) => (a.file ?? '').trim() !== '').length

  const playing = playingId === 'test-tone'

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <p className="text-xs tracking-[0.3em] text-brick">关于</p>
        <h1 className="font-serif text-3xl text-ink">这是什么，不是什么</h1>
        <p className="text-[15px] leading-7 text-ink-soft">
          老爷保号是一个潮汕文化的入门互动馆：用故事建立联系，用条目给出有来源的说明，
          用轻互动帮助理解，再用一个悬浮问答解释当前页面。
        </p>
      </header>

      <section className="card space-y-2">
        <h2 className="section-title">不是什么</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-ink-soft">
          <li>不是全量潮汕百科，也不是旅游攻略、票务或路线规划工具。</li>
          <li>不提供求签、运势、神谕或"保平安"承诺，也不模拟神明发言。</li>
          <li>不做方言识别、跟读评分或语音合成；听潮只有点击播放。</li>
          <li>不是专业英歌或茶艺教学；阵形与斟茶都只是示意。</li>
          <li>本站没有 AI 人物或虚拟主播，问答窗口只是一个解释工具。</li>
        </ul>
      </section>

      <section className="card space-y-2">
        <h2 className="section-title">内容与核验状态</h2>
        <p className="text-sm leading-6 text-ink-soft">
          文化条目由人工提炼成原创短说明，不复制原文大段。
          待补充的条目保留结构并标注"待补充"，不会凭模型常识补写。
        </p>
        <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <li className="rounded-xl border border-line bg-white/60 px-3 py-2">
            <span className="block text-xs text-muted">条目</span>
            <span className="font-serif text-lg text-ink">{entries.length}</span>
          </li>
          <li className="rounded-xl border border-line bg-white/60 px-3 py-2">
            <span className="block text-xs text-muted">已核验</span>
            <span className="font-serif text-lg text-ink">{verified}</span>
          </li>
          <li className="rounded-xl border border-line bg-white/60 px-3 py-2">
            <span className="block text-xs text-muted">待本地审核</span>
            <span className="font-serif text-lg text-ink">{underReview}</span>
          </li>
          <li className="rounded-xl border border-line bg-white/60 px-3 py-2">
            <span className="block text-xs text-muted">待补充</span>
            <span className="font-serif text-lg text-ink">{pendingSource}</span>
          </li>
        </ul>
        <p className="text-xs text-muted">
          当前共 {storyChapters.length} 章故事、{recipes.length} 份食谱、{audioItems.length} 条听潮词条（
          {playable} 条有可播放音频）。
        </p>
      </section>

      <section className="card space-y-2">
        <h2 className="section-title">虚构声明</h2>
        <p className="text-sm leading-6 text-ink-soft">
          故事为原创虚构串联，不对应某地完整仪式流程；故事中的人物与场景不是真实事件记录。
          故事只负责把模块串起来，事实性内容以条目页正文为准。
        </p>
      </section>

      <section className="card space-y-2">
        <h2 className="section-title">隐私</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-ink-soft">
          <li>默认匿名体验，不需要登录，不采集位置、联系人、麦克风或摄像头。</li>
          <li>浏览进度、收藏与手记只保存在本机浏览器（localStorage），不上传；清除浏览器数据会丢失。</li>
          <li>问答会把你的问题、当前页面标签（模块／条目／步骤）和本次对话记录发送到服务端，
              再由服务端转给第三方大模型服务；不会发送整页正文、浏览历史或个人信息。</li>
          <li>服务端日志不记录密钥；密钥只存在于服务端环境变量 LLM_API_KEY。</li>
          <li>"清空"只清除本次对话；问答内容不会被本站保存成可检索的答案库。</li>
        </ul>
      </section>

      <section className="card space-y-2">
        <h2 className="section-title">已知限制</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-ink-soft">
          <li>听潮录音需要手动点击播放，不自动播放；不同地区的口音可能存在差异。</li>
          <li>英歌的角色与阵形细节、美食菜品条目仍等待本地文化审核者补充与校对。</li>
          <li>不提供任何活动日期、实时人流或今年巡游安排，历史记录不能当作日程。</li>
          <li>问答在模型不可用时会显示降级提示，不提供缓存答案冒充实时生成。</li>
        </ul>
      </section>

      <section className="card space-y-3">
        <h2 className="section-title">播放器自检（开发用途）</h2>
        <p className="text-sm leading-6 text-ink-soft">
          下面是程序生成的 1 秒 440Hz 纯音，不是方言录音，只用来验证"单例播放、切页停止、失败可重试"的逻辑。
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className={playing ? 'btn-secondary' : 'btn-primary'}
            onClick={() => {
              if (playing) stop()
              else void requestPlay('test-tone', '/audio/test-tone.mp3')
            }}
          >
            {playing ? '停止自检音' : '播放自检音'}
          </button>
          <span className="text-xs text-muted" role="status">
            {failedId === 'test-tone' ? '暂时无法播放，请重试' : '音频默认不播放，需要手动点击。'}
          </span>
          <a
            href="/audio/test-tone.mp3"
            target="_blank"
            rel="noopener noreferrer"
            className="link-inline text-xs"
          >
            直接打开文件
          </a>
        </div>
      </section>

      <section className="card space-y-2">
        <h2 className="section-title">反馈</h2>
        <p className="text-sm leading-6 text-ink-soft">
          首版没有开通在线反馈表单，也没有收集联系方式的入口。发现内容或授权问题时，
          请直接带上条目 id 反馈给项目维护者。
        </p>
      </section>

      <section className="card space-y-2">
        <h2 className="section-title">技术与无障碍</h2>
        <p className="text-sm leading-6 text-ink-soft">
          前端 Vite + React + TypeScript + Tailwind，后端 Hono 托管静态文件与 /api/ask。
          按钮不小于 44×44 像素，支持键盘操作与 prefers-reduced-motion，320px 宽度不裁切关键按钮。
          主要文字对比度目标 4.5:1。
        </p>
      </section>
    </div>
  )
}
