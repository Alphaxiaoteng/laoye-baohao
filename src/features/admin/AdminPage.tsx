import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { audioItems, entries, sources } from '../../lib/content'
import { usePageTitle } from '../../lib/usePageContext'
import './admin.css'

type Section = 'overview' | 'knowledge' | 'models' | 'harness' | 'maintenance'
type Config = {
  titleBoost: number
  contextBoost: number
  bigram: boolean
  pinyinAlias: boolean
  rerank: boolean
  model: string
  temperature: number
  autonomy: 'suggest' | 'assisted' | 'guarded'
  dailyAudit: boolean
  autoIndex: boolean
  autoDraft: boolean
}

const DEFAULT_CONFIG: Config = {
  titleBoost: 4,
  contextBoost: 3,
  bigram: true,
  pinyinAlias: true,
  rerank: true,
  model: 'deepseek-v4-1-flash',
  temperature: 0.2,
  autonomy: 'assisted',
  dailyAudit: true,
  autoIndex: true,
  autoDraft: false,
}

const NAV: { id: Section; no: string; label: string; caption: string }[] = [
  { id: 'overview', no: '01', label: '运行总览', caption: 'Native Ops' },
  { id: 'knowledge', no: '02', label: '数据库与知识库', caption: 'Retrieval' },
  { id: 'models', no: '03', label: '模型配置', caption: 'Model Router' },
  { id: 'harness', no: '04', label: 'Agent Harness', caption: 'Permissions' },
  { id: 'maintenance', no: '05', label: '自动化与自维护', caption: 'Autonomy' },
]

const COLLECTIONS = [
  { id: 'yingge', name: '英歌舞', desc: '角色、阵形、器物、板式与锣鼓', count: entries.filter((item) => item.module === 'yingge').length, tone: 'red' },
  { id: 'tea', name: '工夫茶', desc: '器具、用水、冲泡与分茶', count: entries.filter((item) => item.module === 'tea').length, tone: 'green' },
  { id: 'food', name: '潮汕美食', desc: '菜品条目、用料与分步食谱', count: entries.filter((item) => item.module === 'food').length, tone: 'gold' },
  { id: 'yinglaoye', name: '营老爷', desc: '称呼、队伍、时间与地区案例', count: entries.filter((item) => item.module === 'yinglaoye').length, tone: 'brown' },
  { id: 'listen', name: '听潮语音', desc: '词句、潮拼、口音与真人录音', count: audioItems.length, tone: 'blue' },
] as const

function loadConfig(): Config {
  try {
    const raw = localStorage.getItem('laoye:admin-config')
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG
  } catch { return DEFAULT_CONFIG }
}

export default function AdminPage() {
  usePageTitle('AI 内容运营台')
  const [section, setSection] = useState<Section>('overview')
  const [config, setConfig] = useState<Config>(loadConfig)
  const [saved, setSaved] = useState(false)
  const [planReady, setPlanReady] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const modules = useMemo(() => new Set(entries.map((item) => item.module)).size, [])

  function patch<K extends keyof Config>(key: K, value: Config[K]) {
    setConfig((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  function save() {
    try {
      localStorage.setItem('laoye:admin-config', JSON.stringify(config))
      setSaved(true)
    } catch { setSaved(false) }
  }

  function exportConfig() {
    const blob = new Blob([JSON.stringify({ product: 'laoye-ai-native-admin', version: 1, config }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'laoye-agent-harness.config.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-shell">
      <aside className="admin-rail">
        <div className="admin-brand">
          <span className="admin-brand-mark">AI</span>
          <div><strong>老爷保号</strong><span>NATIVE CONSOLE</span></div>
        </div>
        <nav className="admin-nav" aria-label="后台功能">
          {NAV.map((item) => (
            <button key={item.id} type="button" className={section === item.id ? 'is-active' : ''} onClick={() => setSection(item.id)} aria-current={section === item.id ? 'page' : undefined}>
              <span className="admin-nav-no">{item.no}</span>
              <span><strong>{item.label}</strong><small>{item.caption}</small></span>
            </button>
          ))}
        </nav>
        <div className="admin-rail-foot"><i />概念设计预览<br />配置只保存在本机</div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">AI NATIVE OPERATIONS / {NAV.find((item) => item.id === section)?.no}</p>
            <h1>{NAV.find((item) => item.id === section)?.label}</h1>
          </div>
          <div className="admin-top-actions">
            <div className="admin-view-switch" role="group" aria-label="后台视图切换">
              <button type="button" aria-pressed={!reviewMode} onClick={() => setReviewMode(false)}>运营视图</button>
              <button type="button" aria-pressed={reviewMode} onClick={() => setReviewMode(true)}>审核视图</button>
            </div>
            <Link to="/" className="admin-site-switch">返回前台 <span aria-hidden="true">↗</span></Link>
          </div>
        </header>

        <div className="admin-preview-note"><strong>概念设计模式</strong><span>{reviewMode ? '当前聚焦待审核项与人工发布门禁。' : '页面用于确认信息架构与接管边界，不会改数据库、调用模型或自动发布。'}</span></div>

        {section === 'overview' ? <Overview reviewMode={reviewMode} modules={modules} onNavigate={setSection} /> : null}
        {section === 'knowledge' ? <Knowledge config={config} patch={patch} /> : null}
        {section === 'models' ? <Models config={config} patch={patch} /> : null}
        {section === 'harness' ? <Harness config={config} patch={patch} planReady={planReady} setPlanReady={setPlanReady} /> : null}
        {section === 'maintenance' ? <Maintenance config={config} patch={patch} planReady={planReady} /> : null}

        <footer className="admin-savebar">
          <span>{saved ? '配置已保存到本机浏览器' : '未连接线上服务 · 不会触发真实任务'}</span>
          <div><button type="button" className="admin-btn-secondary" onClick={exportConfig}>导出配置 JSON</button><button type="button" className="admin-btn-primary" onClick={save}>保存配置</button></div>
        </footer>
      </main>
    </div>
  )
}

function Overview({ modules, onNavigate, reviewMode }: { modules: number; onNavigate: (id: Section) => void; reviewMode: boolean }) {
  return (
    <div className="admin-stack">
      <section className="admin-metrics" aria-label="内容库概况">
        <Metric label="文化条目" value={entries.length} note={`${modules} 个内容模块`} />
        <Metric label="真人方言录音" value={audioItems.length} note="本地自托管 MP3" />
        <Metric label="证据与授权记录" value={sources.length} note="底层数据保留" />
        <Metric label="发布门禁" value="人工" note="Agent 不可直接上线" accent />
      </section>
      <section className="admin-panel">
        <PanelHead no="01" title="AI Native 内容流水线" caption="先检索，再生成；先校验，再发布" />
        <div className="admin-pipeline">
          {['内容源', '结构化清洗', '混合检索', '模型路由', '事实校验', reviewMode ? '人工审核' : '前端呈现'].map((item, index) => (
            <div className="admin-pipeline-step" key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong>{index < 5 ? <i aria-hidden="true">→</i> : null}</div>
          ))}
        </div>
      </section>
      <div className="admin-two-col">
        <section className="admin-panel">
          <PanelHead no="02" title="建议先做的三件事" caption="按对准确率的影响排序" />
          <ol className="admin-recommendations">
            <li><span>01</span><div><strong>同义词与地区别名进入检索层</strong><p>英歌/英歌舞、工夫茶/功夫茶、粿条/粿條统一映射；潮州、汕头、揭阳保持独立过滤。</p></div></li>
            <li><span>02</span><div><strong>回答前增加结构化重排</strong><p>当前条目、标题命中、地区一致优先；无证据不进入生成上下文。</p></div></li>
            <li><span>03</span><div><strong>自维护默认停在人工审核</strong><p>允许 Agent 自动体检、建索引与起草，不开放自动覆盖正式内容。</p></div></li>
          </ol>
        </section>
        <section className="admin-panel">
          <PanelHead no="03" title="进入配置" caption="分模块设置，不混在一个开关里" />
          <div className="admin-shortcuts">
            <button type="button" onClick={() => onNavigate('knowledge')}><strong>检索与知识库</strong><span>同义词、权重、重排、索引 →</span></button>
            <button type="button" onClick={() => onNavigate('models')}><strong>模型路由</strong><span>生成、评审、超时与并发 →</span></button>
            <button type="button" onClick={() => onNavigate('harness')}><strong>Agent 接管边界</strong><span>工具权限、审批与回滚 →</span></button>
            <button type="button" onClick={() => onNavigate('maintenance')}><strong>自维护任务</strong><span>每日体检、索引、草稿与发布 →</span></button>
          </div>
        </section>
      </div>
    </div>
  )
}

function Metric({ label, value, note, accent = false }: { label: string; value: number | string; note: string; accent?: boolean }) {
  return <article className={accent ? 'admin-metric is-accent' : 'admin-metric'}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>
}
function PanelHead({ no, title, caption }: { no: string; title: string; caption: string }) {
  return <header className="admin-panel-head"><span>{no}</span><div><h2>{title}</h2><p>{caption}</p></div></header>
}
function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (next: boolean) => void }) {
  return <label className="admin-toggle"><span><strong>{label}</strong><small>{hint}</small></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i aria-hidden="true" /></label>
}

function Knowledge({ config, patch }: { config: Config; patch: <K extends keyof Config>(key: K, value: Config[K]) => void }) {
  return (
    <div className="admin-stack">
      <section className="admin-panel">
        <PanelHead no="KB" title="内容集合与索引状态" caption="内容事实与检索配置分开管理" />
        <div className="admin-collections">
          {COLLECTIONS.map((item) => <article key={item.id} className={`admin-collection tone-${item.tone}`}><div><span>{item.id}</span><i>本地集合</i></div><h3>{item.name}</h3><p>{item.desc}</p><footer><strong>{item.count}</strong><span>条内容 · 待重建设定</span></footer></article>)}
        </div>
      </section>
      <div className="admin-two-col">
        <section className="admin-panel">
          <PanelHead no="R1" title="混合检索与重排" caption="目标是更准，不是单纯返回更多" />
          <Range label="标题命中权重" value={config.titleBoost} min={1} max={8} onChange={(value) => patch('titleBoost', value)} />
          <Range label="当前页面权重" value={config.contextBoost} min={0} max={8} onChange={(value) => patch('contextBoost', value)} />
          <Toggle label="中文二字切分" hint="与单字索引并行，减少长词被拆散" checked={config.bigram} onChange={(value) => patch('bigram', value)} />
          <Toggle label="潮拼与方言别名" hint="ziah / 食、工夫茶 / 功夫茶等进入同义词表" checked={config.pinyinAlias} onChange={(value) => patch('pinyinAlias', value)} />
          <Toggle label="生成前结构化重排" hint="地区一致、条目完整、当前页内容优先" checked={config.rerank} onChange={(value) => patch('rerank', value)} />
        </section>
        <section className="admin-panel">
          <PanelHead no="R2" title="准确性验收门禁" caption="每次调整都跑同一组离线评测" />
          <div className="admin-gates">
            <Gate title="召回" text="事实、跨模块、地区与方言问题必须命中正确条目" />
            <Gate title="拒答" text="实时日期、门票、未收录史实不得补写" />
            <Gate title="上下文" text="当前条目与步骤优先，不被其他模块同名内容抢走" />
            <Gate title="可解释" text="返回命中的条目 id、匹配字段与最终重排原因" />
          </div>
          <div className="admin-eval-note">离线评测只读本地内容，不调用模型、不产生费用。真实提升幅度以运行结果为准，本页不预填“提升百分比”。</div>
        </section>
      </div>
    </div>
  )
}

function Range({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (next: number) => void }) {
  return <label className="admin-range"><span><strong>{label}</strong><output>{value.toFixed(1)}×</output></span><input type="range" min={min} max={max} step={0.5} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>
}
function Gate({ title, text }: { title: string; text: string }) {
  return <div className="admin-gate"><span>{title}</span><p>{text}</p><i>必须通过</i></div>
}

function Models({ config, patch }: { config: Config; patch: <K extends keyof Config>(key: K, value: Config[K]) => void }) {
  return (
    <div className="admin-two-col">
      <section className="admin-panel">
        <PanelHead no="LLM" title="模型路由" caption="密钥仍只在服务端环境变量，本页不读取" />
        <label className="admin-field"><span>回答模型</span><select value={config.model} onChange={(event) => patch('model', event.target.value)}><option>deepseek-v4-1-flash</option><option>glm-5.3-flash</option><option>本地离线检索（无生成）</option></select></label>
        <Range label="生成温度" value={config.temperature} min={0} max={1} onChange={(value) => patch('temperature', value)} />
        <div className="admin-route"><span>检索</span><strong>MiniSearch + 结构化过滤</strong><small>不调用模型</small></div>
        <div className="admin-route"><span>回答</span><strong>{config.model}</strong><small>仅接收通过检索门禁的内容</small></div>
        <div className="admin-route"><span>评审</span><strong>规则校验优先，模型复核可选</strong><small>失败则退回草稿，不影响线上</small></div>
      </section>
      <section className="admin-panel">
        <PanelHead no="SAFE" title="稳定性与降级" caption="先保证可用，再追求长答案" />
        <div className="admin-config-grid"><div><span>上游超时</span><strong>20s</strong><small>超时进入可读降级</small></div><div><span>全局并发</span><strong>2</strong><small>避免资源被挤满</small></div><div><span>历史轮数</span><strong>6 轮</strong><small>截断旧上下文</small></div><div><span>无模型时</span><strong>检索直答</strong><small>不伪装实时生成</small></div></div>
        <div className="admin-eval-note">推荐：检索、问答、内容评审分开路由。低成本模型处理草稿，严格规则负责事实与发布门禁。</div>
      </section>
    </div>
  )
}

function Harness({ config, patch, planReady, setPlanReady }: { config: Config; patch: <K extends keyof Config>(key: K, value: Config[K]) => void; planReady: boolean; setPlanReady: (value: boolean) => void }) {
  return (
    <div className="admin-stack">
      <section className="admin-panel">
        <PanelHead no="ACL" title="Agent 接管权限" caption="按工具授权，不给一个无边界的“全自动”开关" />
        <div className="admin-permissions">
          <Toggle label="读取内容与日志" hint="只读 content、检索结果与脱敏错误信息" checked onChange={() => undefined} />
          <Toggle label="自动重建索引" hint="内容变更后重建，失败则保留上一版" checked={config.autoIndex} onChange={(value) => patch('autoIndex', value)} />
          <Toggle label="生成更新草稿" hint="草稿进入人工队列，不覆盖正式内容" checked={config.autoDraft} onChange={(value) => patch('autoDraft', value)} />
          <Toggle label="直接发布与覆盖线上" hint="概念设计中始终关闭，需服务端人工签名才能开放" checked={false} onChange={() => undefined} />
        </div>
      </section>
      <div className="admin-two-col">
        <section className="admin-panel">
          <PanelHead no="MODE" title="接管模式" caption="权限逐级增加，发布门禁不随模式消失" />
          <div className="admin-segments">
            {([['suggest', '建议模式', '只给报告，不执行写入'], ['assisted', '协助模式', '可建索引、写草稿'], ['guarded', '守护模式', '自动体检与回滚建议']] as const).map(([id, title, hint]) => <button type="button" key={id} aria-pressed={config.autonomy === id} onClick={() => patch('autonomy', id)}><strong>{title}</strong><span>{hint}</span></button>)}
          </div>
          <button type="button" className="admin-btn-primary admin-plan-btn" onClick={() => setPlanReady(true)}>生成接管执行计划</button>
        </section>
        <section className="admin-panel">
          <PanelHead no="PLAN" title="本次接管边界" caption="根据当前配置本地生成" />
          {planReady ? <ol className="admin-plan"><li>读取本地内容，核对条数与文件完整性</li><li>{config.autoIndex ? '允许重建检索索引，保留上一版用于回滚' : '只输出索引差异，不执行重建'}</li><li>{config.autoDraft ? '允许生成草稿并进入人工审核队列' : '不生成更新草稿'}</li><li>输出审核清单，等待人工确认后才可发布</li></ol> : <div className="admin-empty">点击「生成接管执行计划」，这里会列出 Agent 能做什么、不能做什么。</div>}
        </section>
      </div>
    </div>
  )
}

function Maintenance({ config, patch, planReady }: { config: Config; patch: <K extends keyof Config>(key: K, value: Config[K]) => void; planReady: boolean }) {
  const jobs = [
    { id: 'audit', title: '内容体检', desc: '检查空正文、失链、重复 id、媒体缺失与许可字段', status: '可自动' },
    { id: 'index', title: '索引自维护', desc: '内容变化后重建；失败不覆盖上一版', status: config.autoIndex ? '已授权' : '仅建议' },
    { id: 'draft', title: '资讯整理草稿', desc: '去重、摘要、标记待审核，不直接发布', status: config.autoDraft ? '已授权' : '未授权' },
    { id: 'habit', title: '匿名使用习惯', desc: '仅使用本机 visited 数据调整当前用户检索权重', status: '本地处理' },
  ]
  return (
    <div className="admin-stack">
      <section className="admin-panel">
        <PanelHead no="CRON" title="自动化任务队列" caption="这里只显示执行策略，不伪造已完成的线上任务" />
        <div className="admin-jobs">{jobs.map((job, index) => <article key={job.id}><span className="admin-job-no">{String(index + 1).padStart(2, '0')}</span><div><h3>{job.title}</h3><p>{job.desc}</p></div><i>{job.status}</i></article>)}</div>
      </section>
      <div className="admin-two-col">
        <section className="admin-panel"><PanelHead no="SAFE" title="自维护安全阀" caption="失败时必须能退回" /><Toggle label="每日内容体检" hint="只读检查，异常写入待审核报告" checked={config.dailyAudit} onChange={(value) => patch('dailyAudit', value)} /><div className="admin-gates"><Gate title="不覆盖" text="任何校验失败都保留上一版正式内容" /><Gate title="不泄露" text="日志只记录脱敏错误，不记录密钥与私人数据" /><Gate title="可回滚" text="索引与草稿都保留版本和生成时间" /></div></section>
        <section className="admin-panel"><PanelHead no="NEXT" title="接管执行单" caption="与 Agent Harness 的配置共用" />{planReady ? <div className="admin-success"><strong>执行计划已生成</strong><p>可以导出 JSON 交给后端实现。当前页面没有触发数据库、模型或发布操作。</p></div> : <div className="admin-empty">请先到「Agent Harness」生成接管执行计划。</div>}</section>
      </div>
    </div>
  )
}
