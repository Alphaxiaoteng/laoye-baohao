import { useEffect, useState } from 'react'
import FormationDiagram, {
  FORMATION_VARIANTS,
  type FormationVariant,
} from '../figures/FormationDiagram'
import { useProgressStore } from '../../store/progress'

const NAMES: Record<FormationVariant, string> = {
  square: '方阵',
  double: '双列',
  ring: '环形',
}

export function FormationExplorer() {
  const [variant, setVariant] = useState<FormationVariant>('square')
  const [touched, setTouched] = useState(false)
  const markInteraction = useProgressStore((s) => s.markInteraction)

  function choose(next: FormationVariant) {
    setVariant(next)
    if (!touched) {
      setTouched(true)
      markInteraction('yingge:formation')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="切换阵形示意">
        {FORMATION_VARIANTS.map((v) => (
          <button
            key={v}
            type="button"
            className={v === variant ? 'btn-primary !min-h-[40px] !px-4 !text-sm' : 'btn-secondary !min-h-[40px] !px-4 !text-sm'}
            onClick={() => choose(v)}
            aria-pressed={v === variant}
          >
            {NAMES[v]}
          </button>
        ))}
      </div>
      <FormationDiagram variant={variant} />
      <p className="text-sm text-ink-soft" role="status">
        {touched ? '完成体验：你切换过一种阵形示意。' : '切换任意一种阵形即可完成这次体验。'}
      </p>
    </div>
  )
}

const BEATS = 8

export function BeatTap() {
  const [hits, setHits] = useState(0)
  const markInteraction = useProgressStore((s) => s.markInteraction)
  const done = hits >= BEATS

  useEffect(() => {
    if (hits >= BEATS) markInteraction('yingge:beat')
  }, [hits, markInteraction])

  function tap() {
    if (done) return
    setHits((h) => Math.min(BEATS, h + 1))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" aria-hidden="true">
        {Array.from({ length: BEATS }).map((_, i) => (
          <span
            key={i}
            className={[
              'beat-pip h-6 w-6 rounded-full border',
              i < hits ? 'border-brick bg-brick/70' : 'border-line bg-white/70',
            ].join(' ')}
            data-lit={i < hits ? 'true' : 'false'}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" onClick={tap} disabled={done}>
          {done ? '完成体验' : `跟着点一下（${hits}/${BEATS}）`}
        </button>
        <button
          type="button"
          className="btn-quiet !min-h-[40px] !text-sm"
          onClick={() => setHits(0)}
          disabled={hits === 0}
        >
          重来
        </button>
      </div>
      <p className="text-xs text-muted" role="status">
        {done
          ? '完成体验：你跟着点完了一组节拍。这只是节奏点击，不评价动作是否标准。'
          : '点满 8 下即完成体验；不涉及录音、评分或动作评价。'}
      </p>
    </div>
  )
}
