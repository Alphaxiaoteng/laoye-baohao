import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-cream-dark/60">
      <div className="mx-auto grid max-w-content gap-6 px-4 py-10 text-sm text-muted sm:grid-cols-3">
        <div>
          <p className="font-serif text-base font-semibold text-ink">老爷保号</p>
          <p className="mt-2 leading-6">
            跟着故事，走进潮汕文化。首版为文化入门体验，不是百科全书，也不提供旅游预订、路线规划或求签。
          </p>
        </div>
        <div>
          <p className="font-serif text-base font-semibold text-ink">内容与边界</p>
          <ul className="mt-2 space-y-1 leading-6">
            <li>故事为原创虚构串联，不对应某地完整仪式流程。</li>
            <li>所有文化条目标注来源与核验状态，未核验内容会注明待补充。</li>
            <li>站内图示均为自绘示意图，非某地标准。</li>
          </ul>
        </div>
        <div>
          <p className="font-serif text-base font-semibold text-ink">本站</p>
          <ul className="mt-2 space-y-1 leading-6">
            <li>
              <Link className="link-inline" to="/sources">
                资料来源与核验状态
              </Link>
            </li>
            <li>
              <Link className="link-inline" to="/about">
                关于、隐私与已知限制
              </Link>
            </li>
            <li>手记只保存在本机浏览器，清除浏览器数据会丢失。</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line/70 px-4 py-4 text-center text-xs text-muted">
        本站不使用真人或神明形象素材；音频默认不播放，需手动点击。
      </div>
    </footer>
  )
}
