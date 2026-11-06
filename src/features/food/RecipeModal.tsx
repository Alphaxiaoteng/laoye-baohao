import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { Recipe } from '../../types/content'
import { normalizeIngredients, normalizeSteps } from '../../lib/content'
import { dishImage } from './assets'
import { servingsText } from './lib/servings'

/** 可聚焦元素：Tab 在这个集合里循环，焦点不会跑出弹窗 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface Props {
  recipe: Recipe
  onClose: () => void
}

/**
 * 食谱弹窗：卡片上点「食谱」就在这里看份量、材料与编号步骤。
 * 打开时锁 body 滚动、把焦点放到关闭键；Esc / 点遮罩 / 右上 X 都能关；
 * Tab 在弹窗内循环，关闭后焦点回到原来的按钮。
 */
export default function RecipeModal({ recipe, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()

  const image = dishImage(recipe.id)
  const ingredients = normalizeIngredients(recipe)
  const steps = normalizeSteps(recipe)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      previous?.focus?.()
    }
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (nodes.length === 0) {
        event.preventDefault()
        return
      }
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (!event.shiftKey && (active === last || !active || !panel.contains(active))) {
        event.preventDefault()
        first.focus()
        return
      }
      if (event.shiftKey && (active === first || !active || !panel.contains(active))) {
        event.preventDefault()
        last.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // 挂到 body 上：页面主体有入场动画（transform）会自建层叠上下文，
  // 留在 main 里 z-50 也压不住顶部导航；SSR 阶段（无 document）不渲染弹窗。
  const dialog = (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-[#0d1510]/85 backdrop-blur-sm"
        onMouseDown={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border border-white/15 bg-[#1a241d]/95 text-ink shadow-[0_30px_90px_rgba(0,0,0,0.55)] sm:rounded-[24px]"
      >
        <header className="relative shrink-0 border-b border-white/10 px-5 pb-4 pt-5">
          {image ? (
            <img
              src={image.src}
              alt={image.alt}
              width={1024}
              height={1024}
              className="mb-4 h-48 w-full rounded-xl border border-line bg-white object-contain"
            />
          ) : null}
          <p className="text-[11px] tracking-[0.3em] text-brick">食谱</p>
          <h2 id={titleId} className="mt-1 pr-12 font-serif text-2xl leading-snug">
            {recipe.name}
          </h2>
          <p className="mt-1 text-xs text-muted">
            共 {steps.length} 步 · {servingsText(recipe.servings)}
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="关闭食谱"
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-ink transition duration-200 ease-exhibit hover:border-coral/60 hover:text-coral"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              ×
            </span>
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
          <section aria-labelledby={`${titleId}-ingredients`}>
            <h3
              id={`${titleId}-ingredients`}
              className="text-[11px] tracking-[0.28em] text-muted"
            >
              材料
            </h3>
            {ingredients.length === 0 ? (
              <p className="mt-2 text-sm text-muted">材料待补充可靠来源。</p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-sm">
                {ingredients.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-1.5 last:border-0"
                  >
                    <span className="text-ink-soft">{item.name}</span>
                    {item.amount ? (
                      <span className="shrink-0 text-coral">{item.amount}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby={`${titleId}-steps`}>
            <h3 id={`${titleId}-steps`} className="text-[11px] tracking-[0.28em] text-muted">
              步骤
            </h3>
            {steps.length === 0 ? (
              <p className="mt-2 text-sm text-muted">步骤待补充可靠来源。</p>
            ) : (
              <ol className="mt-3 space-y-4">
                {steps.map((step, index) => (
                  <li key={`${index}-${step.text.slice(0, 8)}`} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-coral/15 text-xs font-semibold text-coral">
                      {index + 1}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <p className="text-[15px] leading-6 text-ink">{step.text}</p>
                      {step.note ? (
                        <p className="text-xs leading-5 text-faint">{step.note}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 px-5 py-3">
          <Link to={`/recipe/${recipe.id}`} className="link-inline text-sm">
            打开完整页
          </Link>
          <button type="button" onClick={onClose} className="btn-quiet !min-h-[36px] !text-sm">
            关闭
          </button>
        </footer>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(dialog, document.body)
}
