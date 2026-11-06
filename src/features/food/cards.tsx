import { Link } from 'react-router-dom'
import type { Entry, Recipe } from '../../types/content'
import { entryHref, normalizeSteps } from '../../lib/content'
import { dishImage } from './assets'
import { shortDescription } from './lib/copy'

const CARD =
  'group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/12 bg-white/[0.05] transition duration-200 ease-exhibit'

const PHOTO = 'aspect-[16/10] w-full overflow-hidden bg-white/5'
const PHOTO_IMG = 'h-full w-full object-cover transition duration-500 ease-exhibit group-hover:scale-[1.04]'

interface RecipeCardProps {
  recipe: Recipe
  onOpenRecipe: (recipe: Recipe) => void
}

/** 食谱卡：图 + 菜名 + 步数 + 「食谱」按钮（点开弹窗，不跳页） */
export function RecipeCard({ recipe, onOpenRecipe }: RecipeCardProps) {
  const image = dishImage(recipe.id)
  const stepCount = normalizeSteps(recipe).length

  return (
    <article className={CARD}>
      {image ? (
        <div className={PHOTO}>
          <img
            src={image.src}
            alt={image.alt}
            width={640}
            height={400}
            loading="lazy"
            className={PHOTO_IMG}
          />
        </div>
      ) : null}
      <div className="flex flex-1 items-end justify-between gap-3 p-4">
        <div className="min-w-0 space-y-1">
          <h3 className="font-serif text-lg leading-snug text-ink">{recipe.name}</h3>
          <p className="text-xs text-muted">共 {stepCount} 步</p>
        </div>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => onOpenRecipe(recipe)}
          className="btn-secondary shrink-0 !px-4 !text-sm"
        >
          食谱
        </button>
      </div>
    </article>
  )
}

/** 菜品条目卡：图 + 菜名 + 一句短描述，整卡进条目页 */
export function DishCard({ entry }: { entry: Entry }) {
  const image = dishImage(entry.id)
  const line = shortDescription(entry.summary)

  return (
    <Link to={entryHref(entry)} className={`${CARD} no-underline hover:border-coral/40`}>
      {image ? (
        <div className={PHOTO}>
          <img
            src={image.src}
            alt={image.alt}
            width={640}
            height={400}
            loading="lazy"
            className={PHOTO_IMG}
          />
        </div>
      ) : null}
      <div className="flex flex-1 items-end justify-between gap-3 p-4">
        <div className="min-w-0 space-y-1">
          <h3 className="font-serif text-lg leading-snug text-ink">{entry.title}</h3>
          {line ? <p className="text-xs leading-5 text-muted">{line}</p> : null}
        </div>
        <span
          aria-hidden="true"
          className="shrink-0 text-coral transition duration-200 ease-exhibit group-hover:translate-x-0.5"
        >
          →
        </span>
      </div>
    </Link>
  )
}
