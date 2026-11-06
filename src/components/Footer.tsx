import { Link } from 'react-router-dom'
import { YINGGE_JOURNEY_LOCAL } from '../features/yingge-static'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-[#1c2820]/70 px-0 pb-10 pt-12 text-sm text-muted">
      <div className="page-x mx-auto max-w-exhibit">
        <div className="grid gap-9 sm:grid-cols-[1.1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img
                src="/exhibits/yingge/assets/museum-mark-v3.svg"
                alt=""
                aria-hidden="true"
                className="h-8 w-8 shrink-0"
              />
              <p className="font-serif text-lg font-semibold text-ink">老爷保号</p>
            </div>
            <p className="mt-4 max-w-xs leading-7">
              跟着故事，走进潮汕文化。首版是文化入门体验，不是百科全书，也不提供旅游预订、路线规划或求签。
            </p>
          </div>

          <div>
            <p className="exhibit-no">内容与边界</p>
            <ul className="mt-3 space-y-1.5 leading-7">
              <li>故事为原创虚构串联，不对应某地完整仪式流程。</li>
              <li>站内内容与图示全部本地托管；外部链接只作来源署名与核对入口，不是内容终点。</li>
              <li>条目均标注来源与核验状态，未核验内容会注明待补充。</li>
              <li>站内图示与互动都是示意，非某地标准。</li>
            </ul>
          </div>

          <div>
            <p className="exhibit-no">本站</p>
            <ul className="mt-3 space-y-1.5 leading-7">
              <li>
                <Link className="link-inline" to="/museum">
                  文化馆
                </Link>
              </li>
              <li>
                <Link className="link-inline" to="/guide">
                  潮汕攻略
                </Link>
              </li>
              <li>
                <Link className="link-inline" to="/story">
                  故事线
                </Link>
              </li>
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
              <li>
                <Link className="link-inline" to="/skill">
                  Agent 接入（skill / CLI）
                </Link>
              </li>
              <li>
                <a className="link-inline" href="/exhibits/yingge/index.html">
                  英歌舞（原生展）
                </a>
              </li>
              <li>
                <a className="link-inline" href={YINGGE_JOURNEY_LOCAL}>
                  云游英歌（本地镜像）
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-4 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>本站不使用真人或神明形象素材；音频默认不播放，需手动点击。</p>
          <p className="font-mono tracking-[0.14em]">LAOYE BAOHAO · 潮汕文化入门</p>
        </div>
      </div>
    </footer>
  )
}
