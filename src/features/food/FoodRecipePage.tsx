import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  isPlaceholderText,
  normalizeIngredients,
  normalizeSteps,
  PENDING_SOURCE_TEXT,
  recipeById,
} from '../../lib/content'
import { useProgressStore } from '../../store/progress'
import VerifyBadge from '../../components/VerifyBadge'
import CollectButton from '../../components/CollectButton'
import { SourceList } from '../../components/SourceBadge'
import { usePageContext, usePageTitle } from '../../lib/usePageContext'
import FoodStepPager from './FoodStepPager'
import { dishImage } from './assets'
import {
  factorLabel,
  parseServings,
  scaleAmount,
  SERVING_FACTORS,
  servingsSummary,
  type ServingFactor,
} from './lib/servings'
import { stepLabel } from './lib/steps'

/**
 * 美食模块专属的食谱页（/recipe/:id）。
 * 挂在 featureRoutes 里，因此优先于通用的 RecipePage。
 */
export default function FoodRecipePage() {
  const { id } = useParams<{ id: string }>()
  const recipe = recipeById(id)
  const markRecipe = useProgressStore((s) => s.markRecipe)
  const [stepIndex, setStepIndex] = useState(0)
  const [factor, setFactor] = useState<ServingFactor>(1)

  const steps = useMemo(() => (recipe ? normalizeSteps(recipe) : []), [recipe])
  const ingredients = useMemo(() => (recipe ? normalizeIngredients(recipe) : []), [recipe])

  usePageTitle(recipe?.name ?? '食谱')
  usePageContext({
    module: 'food',
    moduleTitle: '潮汕美食',
    entryId: recipe?.id,
    entryTitle: recipe?.name,
    step: recipe ? stepIndex + 1 : undefined,
    stepLabel: recipe ? stepLabel(steps[stepIndex]?.text, stepIndex) : undefined,
  })

  useEffect(() => {
    if (recipe) markRecipe(recipe.id)
  }, [recipe, markRecipe])

  if (!recipe) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-10">
        <h1 className="font-serif text-2xl text-ink">没有找到这份食谱</h1>
        <p className="text-sm text-ink-soft">
          食谱 id「{id}」不在内容库里。可能是链接过期，或者这份食谱还没登记。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/museum/food/menu" className="btn-primary">
            看看全部菜品
          </Link>
          <Link to="/museum/food" className="btn-quiet">
            回到潮汕美食
          </Link>
        </div>
      </div>
    )
  }

  const baseServings = parseServings(recipe.servings)
  // 来源写的是「按 1 kg 牛肉计」这类工艺份量时，直接照抄，不要折算成「1 人份」
  const rawServings = typeof recipe.servings === 'string' ? recipe.servings.trim() : ''
  const servingsLabel =
    rawServings && !/^\d+(\.\d+)?\s*人份?$/.test(rawServings)
      ? rawServings
      : servingsSummary(baseServings, factor)
  const safety = recipe.safety ?? []
  const allergens = recipe.allergens ?? []
  const image = dishImage(recipe.id)
  const hasPlaceholderStep = steps.some((step) => isPlaceholderText(step.text))
  const needsSource = recipe.verify === 'pending-source' || steps.length === 0 || hasPlaceholderStep

  return (
    <article className="mx-auto max-w-3xl space-y-7">
      <nav aria-label="面包屑" className="text-sm text-muted">
        <Link to="/museum/food" className="link-inline">
          潮汕美食
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <Link to="/museum/food/menu" className="link-inline">
          全部菜品
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span>{recipe.name}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <VerifyBadge verify={recipe.verify} />
          {recipe.region ? <span className="chip">地区：{recipe.region}</span> : null}
          {recipe.difficulty ? <span className="chip">难度：{recipe.difficulty}</span> : null}
          <span className="chip">共 {steps.length} 步</span>
        </div>
        <h1 className="font-serif text-3xl leading-snug text-ink">{recipe.name}</h1>
        {recipe.summary ? <p className="body-text">{recipe.summary}</p> : null}
        <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          {recipe.prepTime ? (
            <div className="rounded-xl border border-line bg-white/60 px-3 py-2">
              <dt className="text-xs text-muted">准备</dt>
              <dd className="text-ink">{recipe.prepTime}</dd>
            </div>
          ) : null}
          {recipe.cookTime ? (
            <div className="rounded-xl border border-line bg-white/60 px-3 py-2">
              <dt className="text-xs text-muted">制作</dt>
              <dd className="text-ink">{recipe.cookTime}</dd>
            </div>
          ) : null}
          <div className="rounded-xl border border-line bg-white/60 px-3 py-2">
            <dt className="text-xs text-muted">份量</dt>
            <dd className="text-ink">{servingsLabel}</dd>
          </div>
        </dl>
      </header>

      {image ? (
        <figure className="space-y-2">
          <img
            src={image.src}
            alt={image.alt}
            width={480}
            height={300}
            className="max-h-[420px] w-full rounded-2xl border border-line object-cover"
          />
          <figcaption className="text-xs text-muted">
            实拍照片，作者与许可见 ASSETS.md；用料与步骤以文末来源为准。
          </figcaption>
        </figure>
      ) : null}

      {needsSource ? (
        <p className="rounded-xl border border-brick/30 bg-brick/5 px-3 py-2 text-sm leading-6 text-brick">
          {PENDING_SOURCE_TEXT}：这份食谱的用料、步骤与安全提示尚未通过核验，页面只展示界面结构，
          <strong className="font-semibold">不构成制作指导</strong>，请勿据此操作。
        </p>
      ) : null}

      {/* 份量调整：只做确定的整数/分数倍换算 */}
      <section aria-labelledby="servings-title" className="card space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="servings-title" className="section-title">
            调整份量
          </h2>
          <p className="text-sm text-ink-soft">{servingsSummary(baseServings, factor)}</p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="份量倍数">
          {SERVING_FACTORS.map((value) => (
            <button
              key={value}
              type="button"
              className={value === factor ? 'btn-primary !min-h-[44px] !px-4 !text-sm' : 'btn-secondary !min-h-[44px] !px-4 !text-sm'}
              aria-pressed={value === factor}
              onClick={() => setFactor(value)}
            >
              ×{value === 0.5 ? '0.5' : value} {factorLabel(value)}
            </button>
          ))}
        </div>
        <p className="text-xs leading-5 text-muted">
          只把用料数字按整数或分数倍换算，火候、刀工、步骤顺序与时间都不变。原始用量取自来源里的
          {rawServings || (baseServings === 1 ? ' 1 人份' : ` ${baseServings} 人份`)}配比，没有的成分不会凭空补。
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="card space-y-2">
          <h2 className="section-title">用料</h2>
          {ingredients.length === 0 ? (
            <p className="text-sm text-muted">用料待补充可靠来源。</p>
          ) : (
            <ul className="space-y-2 text-sm text-ink-soft">
              {ingredients.map((item) => {
                const amount = scaleAmount(item.amount, factor)
                return (
                  <li key={item.name} className="border-b border-line/60 pb-1 last:border-0">
                    <span className="font-medium text-ink">{item.name}</span>
                    {amount ? <span className="text-brick"> · {amount}</span> : null}
                    {item.note ? <span className="block text-xs text-muted">{item.note}</span> : null}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <div className="card space-y-2">
            <h2 className="section-title">器具</h2>
            {recipe.tools && recipe.tools.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {recipe.tools.map((tool) => (
                  <li key={tool} className="chip">
                    {tool}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">器具待补充可靠来源。</p>
            )}
          </div>

          <div className="card space-y-2">
            <h2 className="section-title">过敏原 / 饮食注意</h2>
            {allergens.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
                {allergens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">来源未标注过敏原信息，处理含鱼露、芝麻等食材时请自行确认。</p>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="steps-title" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="steps-title" className="section-title">
            了解制作
          </h2>
          <span className="text-xs text-muted">共 {steps.length} 步 · 手记只记「了解制作」</span>
        </div>
        <FoodStepPager
          recipeId={recipe.id}
          recipeName={recipe.name}
          steps={steps}
          ingredients={ingredients}
          factor={factor}
          safety={safety}
          allergens={allergens}
          onStepChange={setStepIndex}
          onComplete={() => markRecipe(recipe.id)}
        />
      </section>

      {safety.length > 0 ? (
        <section aria-labelledby="safety-title" className="card space-y-2">
          <h2 id="safety-title" className="section-title">
            处理安全提示
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-ink-soft">
            {safety.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="recipe-sources" className="space-y-3">
        <h2 id="recipe-sources" className="section-title">
          这份食谱的来源
        </h2>
        <div className="card">
          <SourceList ids={recipe.sourceIds} />
          <p className="mt-3 text-xs leading-5 text-muted">
            用量与工序按来源逐条整理，未标注的营养成分本站不填。
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <CollectButton id={recipe.id} label="收藏这份食谱" />
        <Link to="/museum/food/menu" className="btn-quiet">
          返回全部菜品
        </Link>
      </div>
    </article>
  )
}
