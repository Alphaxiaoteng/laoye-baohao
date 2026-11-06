import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePageContext, usePageTitle } from '../../lib/usePageContext'
import { useProgressStore } from '../../store/progress'
import { STEP_COUNT, stepLabel } from './steps'
import StepGuide from './StepGuide'
import TeaScene from './TeaScene'
import SoundToggle from './SoundToggle'
import { useBrewFlow } from './useBrewFlow'
import { useBrewKeyboard } from './useBrewKeyboard'

/** /museum/tea/brew：点击 / 触屏 / 键盘完成的分步冲茶演示 */
export default function TeaBrew() {
  const flow = useBrewFlow('tea:brew')
  const visitModule = useProgressStore((s) => s.visitModule)

  usePageTitle('分步冲茶')
  usePageContext({
    module: 'tea',
    moduleTitle: '工夫茶',
    step: flow.done ? STEP_COUNT : flow.stepIndex + 1,
    stepLabel: stepLabel(flow.stepIndex, flow.done),
  })
  useBrewKeyboard(flow.next, flow.prev, flow.reset)

  useEffect(() => {
    visitModule('tea')
  }, [visitModule])

  return (
    <div className="space-y-7">
      <nav aria-label="面包屑" className="text-sm text-muted">
        <Link to="/museum" className="link-inline">
          文化馆
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <Link to="/museum/tea" className="link-inline">
          工夫茶
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span>分步冲茶</span>
      </nav>

      <header className="max-w-2xl space-y-2">
        <p className="text-sm tracking-[0.2em] text-brick">五步演示</p>
        <h1 className="font-serif text-3xl text-ink">分步冲茶</h1>
        <p className="text-[15px] leading-7 text-ink-soft">
          温杯热罐、纳茶洗茶、高冲注水、出汤分茶、敬茶闻香。按项目页记录的环节顺序走一遍，
          仅作流程示意，不作唯一标准。
        </p>
        <p className="text-xs leading-5 text-muted">
          点「下一步」、触屏点按，或按空格 / → 前进，← 后退，R 重来。不需要摄像头。
        </p>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="tea-stage-panel">
          <TeaScene step={flow.step} stepIndex={flow.stepIndex} done={flow.done} />
        </div>

        <div className="tea-panel">
          <StepGuide
            step={flow.step}
            stepIndex={flow.stepIndex}
            done={flow.done}
            onNext={flow.next}
            onPrev={flow.prev}
            onReset={flow.reset}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <SoundToggle />
        <div className="flex flex-wrap gap-2">
          <Link to="/museum/tea" className="btn-quiet !min-h-[40px] !text-sm">
            回到工夫茶首页
          </Link>
          <Link to="/museum/tea/gesture" className="btn-quiet !min-h-[40px] !text-sm">
            用手势翻步
          </Link>
        </div>
      </div>

      <p className="text-xs leading-5 text-muted">
        演示步骤依据条目
        <Link to="/museum/tea/tea-steps" className="link-inline mx-1">
          「冲泡环节示例（据项目页）」
        </Link>
        （来源 S2）；未给出时长、水温与次数。
      </p>
    </div>
  )
}
