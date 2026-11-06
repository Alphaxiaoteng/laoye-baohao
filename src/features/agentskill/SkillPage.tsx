import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../../lib/usePageContext'
import './skill.css'

/** 本站真实回答（/api/ask 对「英歌有哪些阵形？」的 done.text 原样复用，未改写） */
const DEMO_ANSWER =
  '按汕头市地方标准 DB 4405/T 315—2025，潮阳英歌的基础队形共有七种：双列队形、方形阵、双龙出海、田螺阵、麦穗花阵、四海升平、八卦阵；该标准还给出了队员站位与走位图 [S103]。普宁英歌的项目页另列了「双龙出海」「猛虎下山」「麦穗花」「田螺圈」等队列样式 [S101]。\n\n需要注意适用范围：前一组属于潮阳英歌的标准队形，后一组出自普宁资料，不能把它们混成一套全潮汕通用的阵形表。站内资料还提醒，阵形名称只说明某一时刻队员之间的空间关系；同一个名称在不同地区可能走不同路线，人数和走法仍要回到具体队伍的资料 [S103][S101]。\n\n站内条目可看《阵形：名称、路线与边界》。'

const DEMO_SKILL_SUMMARY =
  '已读取 SKILL.md。我学会了 3 件事：① POST /api/ask 站内问答，回答只引用 [S#] 来源；② GET /api/health 看服务与内容概况；③ laoye.sh ask / health 两个子命令。资料里没有的，它会直说没有。'

const DEMO_CITATIONS =
  '来源：S103 汕头市地方标准 DB 4405/T 315—2025《非物质文化遗产 潮阳英歌》；S101 英歌（普宁英歌）· 国家级非物质文化遗产代表性项目'

type TabKey = 'claude' | 'cursor' | 'codex'

interface TabMeta {
  key: TabKey
  label: string
  /** terminal：深色等宽终端；chat：气泡对话 */
  shape: 'terminal' | 'chat'
  where: string
  prompt: string
  toolLine: string
}

const TABS: TabMeta[] = [
  {
    key: 'claude',
    label: 'Claude Code',
    shape: 'terminal',
    where: '终端里输入框',
    prompt: '❯',
    toolLine: '$ laoye.sh ask "英歌有哪些阵形？"',
  },
  {
    key: 'cursor',
    label: 'Cursor',
    shape: 'chat',
    where: '右侧 Chat 面板',
    prompt: 'You',
    toolLine: '调用站内问答：POST /api/ask（SSE 流式返回）',
  },
  {
    key: 'codex',
    label: 'Codex',
    shape: 'terminal',
    where: '终端里输入框',
    prompt: '>',
    toolLine: '$ curl -sN -X POST $BASE/api/ask -d \'{"question":"英歌有哪些阵形？"}\'',
  },
]

const AGENTS = [
  {
    name: 'Codex',
    where: '终端里运行 codex，在输入框里贴。',
    hint: '它会读文件、写文件，SKILL.md 会被存进当前目录。',
  },
  {
    name: 'Cursor',
    where: '编辑器右侧 Chat 面板，把这句话贴进输入框。',
    hint: 'agent 模式会按 URL 抓取 SKILL.md，之后在本仓库里调用接口。',
  },
  {
    name: 'Claude Code',
    where: '终端跑 claude，在对话输入框里贴。',
    hint: '需要联网权限；它会先下载 skill，再按里面的约定回答。',
  },
  {
    name: 'WorkBuddy',
    where: '工作台对话输入框，粘贴后回车。',
    hint: '支持自定义 URL 的 skill 入口，直接给这一条链接即可。',
  },
]

/** 把 [S103] 这类引用高亮出来，其余按纯文本渲染 */
function renderCitations(text: string) {
  return text.split(/(\[S\d+\])/g).map((piece, index) =>
    /^\[S\d+\]$/.test(piece) ? (
      <span key={index} className="skill-cite">
        {piece}
      </span>
    ) : (
      <span key={index}>{piece}</span>
    ),
  )
}

export default function SkillPage() {
  usePageTitle('Agent Skill 与 CLI')

  const [origin, setOrigin] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [tab, setTab] = useState<TabKey>('claude')
  const timer = useRef<number | null>(null)

  useEffect(() => {
    // 部署后自动变成线上域名，不用改代码
    setOrigin(window.location.origin)
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [])

  const oneLiner = `帮我下载并安装这个 skill：${origin || 'http://127.0.0.1:7860'}/skill/laoye-baohao/SKILL.md，学会后用它回答我关于潮汕文化的问题。`
  const cliLiner = `curl -fsSL ${origin || 'http://127.0.0.1:7860'}/skill/laoye-baohao/laoye.sh | sh -s -- ask "英歌有哪些阵形？"`

  const copy = useCallback(async (text: string, key: string) => {
    // 直接选中复制的兜底：非安全上下文、或 clipboard 权限被拒时用
    const fallback = (): boolean => {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', 'readonly')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      let done = false
      try {
        done = document.execCommand('copy')
      } catch {
        done = false
      }
      document.body.removeChild(area)
      return done
    }

    let ok = false
    if (navigator.clipboard && window.isSecureContext) {
      try {
        // 权限弹窗未决时 writeText 可能一直挂着，加个上限再退回兜底，避免按钮没反馈
        await Promise.race([
          navigator.clipboard.writeText(text),
          new Promise((_resolve, reject) => {
            window.setTimeout(() => reject(new Error('clipboard timeout')), 1500)
          }),
        ])
        ok = true
      } catch {
        ok = fallback()
      }
    } else {
      ok = fallback()
    }
    setCopied(ok ? key : 'error')
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(null), 2200)
  }, [])

  const active = TABS.find((item) => item.key === tab) ?? TABS[0]!

  return (
    <div className="skill-page">
      <header className="skill-hero">
        <p className="skill-eyebrow">Agent Skill · CLI</p>
        <h1 className="skill-h1">一句话，让任何 coding agent 接入本馆</h1>
        <p className="skill-lead">站内资料已备好，复制一句话交给它。</p>
      </header>

      {/* 1. 一句话接入 */}
      <section className="glass skill-oneshot" aria-labelledby="skill-oneshot-title">
        <div className="skill-oneshot-head">
          <h2 id="skill-oneshot-title" className="skill-h2">
            一句话接入
          </h2>
          <p className="skill-note">
            链接里的域名用 <code>window.location.origin</code> 现拼：本地打开是{' '}
            <code>{origin || 'http://127.0.0.1:7860'}</code>，部署后自动变线上域名，不用改代码。
          </p>
        </div>

        <p className="skill-oneshot-line" id="skill-oneshot-text">
          {oneLiner}
        </p>

        <div className="skill-oneshot-actions">
          <button
            type="button"
            className="skill-copy"
            onClick={() => copy(oneLiner, 'one')}
            aria-describedby="skill-oneshot-text"
          >
            {copied === 'one' ? '已复制' : copied === 'error' ? '复制失败，请手动选中' : '复制这句话'}
          </button>
          <span className="skill-hint">粘进 agent 的对话输入框，回车即可。</span>
        </div>
      </section>

      {/* 2. 发给谁 */}
      <section className="skill-block" aria-labelledby="skill-agents-title">
        <div className="skill-block-head">
          <h2 id="skill-agents-title" className="skill-h2">
            发给谁
          </h2>
          <p className="skill-note">同一个 URL，四种 agent 都能读。</p>
        </div>

        <ul className="skill-agents">
          {AGENTS.map((agent) => (
            <li key={agent.name} className="skill-agent-card">
              <p className="skill-agent-name">{agent.name}</p>
              <p className="skill-agent-where">{agent.where}</p>
              <p className="skill-agent-hint">{agent.hint}</p>
              <div className="skill-input-mock" aria-hidden="true">
                <span className="skill-input-caret" />
                <span className="skill-input-text">粘贴那句话 …</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. CLI */}
      <section className="skill-block" aria-labelledby="skill-cli-title">
        <div className="skill-block-head">
          <h2 id="skill-cli-title" className="skill-h2">
            或者直接用 CLI
          </h2>
          <p className="skill-note">POSIX sh + curl，不装任何依赖。</p>
        </div>

        <div className="skill-cmd-card">
          <code className="skill-cmd-line">{cliLiner}</code>
          <button type="button" className="skill-copy skill-copy-sm" onClick={() => copy(cliLiner, 'cli')}>
            {copied === 'cli' ? '已复制' : copied === 'error' ? '复制失败' : '复制'}
          </button>
        </div>

        <dl className="skill-cmd-list">
          <div>
            <dt>
              <code>ask "问题"</code>
            </dt>
            <dd>
              问站内资料，边收边打印；结束时列出来源 [S#]。遇 429（每分钟 6 次）自动等 62 秒重试一次。
            </dd>
          </div>
          <div>
            <dt>
              <code>health</code>
            </dt>
            <dd>看服务状态、模型、内容量（条目 27 / 故事 5 / 食谱 4 / 听潮 21 / 来源 99）与并发占用。</dd>
          </div>
          <div>
            <dt>
              <code>LAOYE_BASE</code>
            </dt>
            <dd>
              服务地址，默认 <code>http://127.0.0.1:7860</code>；部署后指到线上域名即可。
            </dd>
          </div>
        </dl>
      </section>

      {/* 4. 演示 */}
      <section className="skill-block" aria-labelledby="skill-demo-title">
        <div className="skill-block-head">
          <h2 id="skill-demo-title" className="skill-h2">
            接上之后，对话长这样
          </h2>
          <p className="skill-note">下面是模拟界面；回答内容来自本站真实输出。</p>
        </div>

        <div className="skill-tabs" role="tablist" aria-label="选择 agent 类型">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              id={`skill-tab-${item.key}`}
              aria-selected={tab === item.key}
              aria-controls="skill-demo-panel"
              className={`skill-tab${tab === item.key ? ' is-active' : ''}`}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          id="skill-demo-panel"
          role="tabpanel"
          aria-labelledby={`skill-tab-${active.key}`}
          className={active.shape === 'terminal' ? 'skill-term' : 'skill-chat'}
        >
          {active.shape === 'terminal' ? (
            <>
              <p className="skill-term-line skill-term-user">
                <span className="skill-term-prompt">{active.prompt}</span> {oneLiner}
              </p>
              <p className="skill-term-line skill-term-tool">
                … 下载 {origin || 'http://127.0.0.1:7860'}/skill/laoye-baohao/SKILL.md
              </p>
              <p className="skill-term-line skill-term-agent">{DEMO_SKILL_SUMMARY}</p>
              <p className="skill-term-line skill-term-user">
                <span className="skill-term-prompt">{active.prompt}</span> 英歌有哪些阵形？
              </p>
              <p className="skill-term-line skill-term-tool">{active.toolLine}</p>
              <p className="skill-term-line skill-term-agent skill-term-answer">{renderCitations(DEMO_ANSWER)}</p>
              <p className="skill-term-line skill-term-cite">{DEMO_CITATIONS}</p>
            </>
          ) : (
            <>
              <div className="skill-bubble skill-bubble-user">
                <p className="skill-bubble-who">{active.prompt}</p>
                <p>{oneLiner}</p>
              </div>
              <div className="skill-bubble skill-bubble-tool">
                <p className="skill-bubble-who">工具</p>
                <p>{active.toolLine}</p>
              </div>
              <div className="skill-bubble skill-bubble-agent">
                <p className="skill-bubble-who">{active.label}</p>
                <p>{DEMO_SKILL_SUMMARY}</p>
              </div>
              <div className="skill-bubble skill-bubble-user">
                <p className="skill-bubble-who">You</p>
                <p>英歌有哪些阵形？</p>
              </div>
              <div className="skill-bubble skill-bubble-agent">
                <p className="skill-bubble-who">{active.label}</p>
                <p className="skill-bubble-answer">{renderCitations(DEMO_ANSWER)}</p>
                <p className="skill-bubble-cite">{DEMO_CITATIONS}</p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 5. 站内试试 */}
      <section className="skill-try">
        <p className="skill-note">不想装东西？先在本站问问，答案是同一套。</p>
        <div className="skill-try-actions">
          <button
            type="button"
            className="skill-try-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('laoye:ask-open'))}
          >
            打开站内「问一问」
          </button>
          <Link className="skill-try-link" to="/museum/yingge">
            先看英歌舞条目 →
          </Link>
        </div>
      </section>

      <footer className="skill-foot">
        <p>
          站内资料只作文化参考：非遗内容以官方发布与传承人说法为准，攻略为个人分享、标注「仅作参考」，
          故事线是原创虚构串联。
        </p>
        <p>
          skill 本身不含任何密钥，也不会把密钥带到前端；调用方需自己承担所接入 agent 的下载、读取与执行行为。
          <code> /api/ask</code> 只读站内资料，不写库、不改内容。
        </p>
      </footer>
    </div>
  )
}
