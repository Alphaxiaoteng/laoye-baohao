import { usePageContext, usePageTitle } from '../../lib/usePageContext'
import StillStage from '../../components/StillStage'
import Breadcrumb from './components/Breadcrumb'
import RouteDemo from './components/RouteDemo'
import { INTRO_SENTENCE, STAGE_FRAMES } from './data'

const MODULE_TITLE = '营老爷·游神'

/**
 * /museum/yinglaoye 专属首页。
 * 顶上是一场可转视角的巡游示意，下面是实拍横滑带。
 */
export default function YinglaoyeHome() {
  usePageTitle(MODULE_TITLE)
  usePageContext({ module: 'yinglaoye', moduleTitle: MODULE_TITLE })

  return (
    <div>
      <Breadcrumb current={MODULE_TITLE} />

      <header className="mt-6 max-w-xl">
        <h1 className="font-serif text-[30px] font-semibold leading-tight text-ink sm:text-[40px]">
          {MODULE_TITLE}
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-muted">{INTRO_SENTENCE}</p>
      </header>

      <section aria-labelledby="route-demo-title" className="mt-8 space-y-4">
        <h2 id="route-demo-title" className="section-title">
          巡游示意
        </h2>
        <RouteDemo />
      </section>

      <section aria-labelledby="still-stage-title" className="mt-12 space-y-4">
        <h2 id="still-stage-title" className="section-title">
          现场素材（示意）
        </h2>
        <StillStage frames={[...STAGE_FRAMES]} />
      </section>
    </div>
  )
}
