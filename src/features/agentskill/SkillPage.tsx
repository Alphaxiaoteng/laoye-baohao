import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../../lib/usePageContext'
import './skill.css'

function AgentLogoClaude() {
  return <svg viewBox="0 0 24 24" className="skill-agent-logo" aria-hidden="true"><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" /><path d="M12 4.5v4M12 15.5v4M4.5 12h4M15.5 12h4M6.8 6.8l2.8 2.8M14.4 14.4l2.8 2.8M17.2 6.8l-2.8 2.8M9.6 14.4l-2.8 2.8" /></svg>
}
function AgentLogoCodex() {
  return <svg viewBox="0 0 24 24" className="skill-agent-logo" aria-hidden="true"><path d="M9 7 6 12l3 5M15 7l3 5-3 5" /></svg>
}
function AgentLogoTrae() {
  return <svg viewBox="0 0 24 24" className="skill-agent-logo" aria-hidden="true"><rect x="5" y="6" width="14" height="12" rx="2" /><path d="M9 10h6M9 14h3" /></svg>
}
function AgentLogoDoubao() {
  return <svg viewBox="0 0 24 24" className="skill-agent-logo" aria-hidden="true"><path d="M7 18c-3-5 1-12 6-12 5 1 6 8 3 12-3 2-6 2-9 0Z" /><circle cx="11" cy="10" r="1" fill="currentColor" stroke="none" /></svg>
}
function AgentLogoQwen() {
  return <svg viewBox="0 0 24 24" className="skill-agent-logo" aria-hidden="true"><path d="m12 4 2.2 5.8L20 12l-5.8 2.2L12 20l-2.2-5.8L4 12l5.8-2.2Z" /></svg>
}

const AGENTS = [
  { id: 'claude-code', label: 'Claude Code', folder: '.claude', Logo: AgentLogoClaude },
  { id: 'codex', label: 'Codex', folder: '.agents', Logo: AgentLogoCodex },
  { id: 'trae-work', label: 'Trae Work', folder: '.agents', Logo: AgentLogoTrae },
  { id: 'doubao', label: '豆包工作', folder: '.agents', Logo: AgentLogoDoubao },
  { id: 'qwen', label: '千问办公', folder: '.agents', Logo: AgentLogoQwen },
] as const

type AgentEntry = (typeof AGENTS)[number]

const CASES = [
  { no: '01', tag: '英歌舞', title: '查阵形，不只看名词', question: '英歌的双龙出海和田螺阵有什么区别？', answer: '按站内阵形条目解释队伍如何移动，并给出可以继续查看的阵形互动页。', href: '/museum/yingge/formations' },
  { no: '02', tag: '工夫茶', title: '把冲泡步骤问清楚', question: '工夫茶从温杯到敬茶，分别要做什么？', answer: '按温杯、纳茶、注水、出汤、敬茶的站内顺序说明，器物与步骤可以对应查看。', href: '/museum/tea' },
  { no: '03', tag: '潮汕美食', title: '从菜名走进真实食谱', question: '牛肉粿条汤要准备什么，粿条怎么处理？', answer: '返回用料、份量与分步做法，直接进入分步食谱，不把阅读步骤说成已经亲手完成。', href: '/recipe/recipe-beef-kway-teow-soup' },
  { no: '04', tag: '听潮', title: '问一句，再听潮州口音', question: '「食茶」是什么意思，潮州话怎么读？', answer: '先解释词句含义，再打开听潮对应分类，播放站内登记的真人方言录音。', href: '/listen/tea-food' },
] as const

export default function SkillPage() {
  usePageTitle('Skill')
  const [agentId, setAgentId] = useState<AgentEntry['id']>(AGENTS[0].id)
  const [origin, setOrigin] = useState('http://127.0.0.1:7860')
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)
  const agent = AGENTS.find((item) => item.id === agentId) ?? AGENTS[0]
  const command = useMemo(() => {
    const file = `${origin}/skill/laoye-baohao/SKILL.md`
    const dir = `${agent.folder}/skills/laoye-baohao/`
    return `帮我安装潮汕文化 Skill。文件在 ${file}，请单独放进 ${dir}，不要和其他 Skill 放在一起。`
  }, [agent.folder, origin])

  useEffect(() => {
    setOrigin(window.location.origin)
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [])

  const copy = useCallback(async () => {
    const fallback = () => {
      const area = document.createElement('textarea')
      area.value = command
      area.setAttribute('readonly', 'readonly')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      let done = false
      try { done = document.execCommand('copy') } catch { done = false }
      document.body.removeChild(area)
      return done
    }
    let ok = false
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(command)
        ok = true
      } catch { ok = fallback() }
    } else ok = fallback()
    setCopied(ok)
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1800)
  }, [command])

  return (
    <div className="skill-page">
      <section className="skill-connect" aria-labelledby="skill-title">
        <h1 id="skill-title" className="skill-h1">把潮汕文化交给你的 Agent</h1>
        <p className="skill-lead">选一个 Agent，复制下面这句话，贴进它的对话。</p>
        <div className="skill-agents" role="tablist" aria-label="选择 Agent">
          {AGENTS.map((entry) => {
            const Logo = entry.Logo
            const active = agentId === entry.id
            return (
              <button key={entry.id} type="button" role="tab" aria-selected={active} className={`skill-agent${active ? ' is-active' : ''}`} onClick={() => setAgentId(entry.id)}>
                <Logo /><span>{entry.label}</span>
              </button>
            )
          })}
        </div>

        <div className="skill-terminal" aria-label={`${agent.label} 安装请求`}>
          <div className="skill-terminal-bar">
            <div className="skill-traffic" aria-hidden="true"><i /><i /><i /></div>
            <button type="button" className="skill-copy" onClick={() => void copy()} aria-label={copied ? '已复制安装请求' : '复制安装请求'}>
              {copied ? <IconCheck /> : <IconCopy />}<span>{copied ? '已复制' : '复制这句话'}</span>
            </button>
          </div>
          <code className="skill-command"><span aria-hidden="true">$</span><i className="skill-caret" aria-hidden="true" />{command}</code>
        </div>
        <p className="skill-caption">复制后贴到 {agent.label}。目标文件夹会跟着上面的选择变。</p>
      </section>

      <section className="skill-cases" aria-labelledby="skill-cases-title">
        <div className="skill-cases-head">
          <h2 id="skill-cases-title">接上以后，可以直接这样问</h2>
          <p>下面四组都留在本馆：右边是你要问的，左边是 Agent 按站内资料回的。</p>
        </div>
        <div className="skill-thread">
          {CASES.map((item) => (
            <article className="skill-exchange" key={item.no} aria-label={item.tag}>
              <p className="skill-user">{item.question}</p>
              <div className="skill-reply">
                <p>{item.answer}</p>
                <Link className="link-inline skill-reply-link" to={item.href}>查看这个场景</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function IconCopy() {
  return <svg viewBox="0 0 24 24" className="skill-svg" aria-hidden="true"><rect x="8" y="8" width="11" height="13" rx="2" /><path d="M5 15V5h10" /></svg>
}
function IconCheck() {
  return <svg viewBox="0 0 24 24" className="skill-svg" aria-hidden="true"><path d="M5 12.5 10 17l9-10" /></svg>
}
