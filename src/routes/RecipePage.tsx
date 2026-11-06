import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  isPlaceholderText,
  normalizeIngredients,
  normalizeSteps,
  PENDING_SOURCE_TEXT,
  recipeById,
} from '../lib/content'
import { useProgressStore } from '../store/progress'
import VerifyBadge from '../components/VerifyBadge'
import StepPager from '../components/StepPager'
import CollectButton from '../components/CollectButton'
import { usePageContext, usePageTitle } from '../lib/usePageContext'

export default function RecipePage() {
  const { id } = useParams<{ id: string }>()
  const recipe = recipeById(id)
  const markRecipe = useProgressStore((s) => s.markRecipe)
  const [stepIndex, setStepIndex] = useState(0)

  usePageTitle(recipe?.name ?? '食谱')
  usePageContext({
    module: 'food',
    moduleTitle: '潮汕美食',
    entryTitle: recipe?.name,
    step: stepIndex + 1,
    stepLabel: '制作步骤',
  })

  useEffect(() => {
    if (recipe) markRecipe(recipe.id)
  }, [recipe, markRecipe])

  if (!recipe) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-10">
        <h1 className="font-serif text-2xl text-ink">没有找到这份食谱</h1>
        <p className="text-sm text-ink-soft">食谱 id「{id}」不在 content/recipes.json 里。</p>
        <Link to="/museum/food" className="btn-primary">
          回到美食模块
        </Link>
      </div>
    )
  }

  const steps = normalizeSteps(recipe)
  const ingredients = normalizeIngredients(recipe)
  const safety = recipe.safety ?? []
  const allPlaceholder = steps.length > 0 && steps.every((s) => isPlaceholderText(s.text))
  const needsSource = recipe.verify === 'pending-source' || allPlaceholder

  return (
    <article className="mx-auto max-w-3xl space-y-7">
      <nav aria-label="面包屑" className="text-sm text-muted">
        <Link to="/museum/food" className="link-inline">
          潮汕美食
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
          {recipe.servings ? <span className="chip">份量：{recipe.servings}</span> : null}
          {recipe.difficulty ? <span className="chip">难度：{recipe.difficulty}</span> : null}
        </div>
        <h1 className="font-serif text-3xl leading-snug text-ink">{recipe.name}</h1>
        {recipe.summary ? <p className="body-text">{recipe.summary}</p> : null}
      </header>

      {needsSource ? (
        <p className="rounded-xl border border-brick/30 bg-brick/5 px-3 py-2 text-sm leading-6 text-brick">
          {PENDING_SOURCE_TEXT}：这份食谱的用料、步骤与安全提示尚未通过核验，页面只展示界面结构，
          <strong className="font-semibold">不构成制作指导</strong>。请勿据此操作。
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="card space-y-2">
          <h2 className="section-title">用料</h2>
          {ingredients.length === 0 ? (
            <p className="text-sm text-muted">用料待补充可靠来源。</p>
          ) : (
            <ul className="space-y-1 text-sm text-ink-soft">
              {ingredients.map((ing) => (
                <li key={ing.name}>
                  {ing.name}
                  {ing.amount ? <span className="text-muted"> · {ing.amount}</span> : null}
                  {ing.note ? <span className="block text-xs text-muted">{ing.note}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card space-y-2">
          <h2 className="section-title">器具</h2>
          {recipe.tools && recipe.tools.length > 0 ? (
            <ul className="flex flex-wrap gap-2 text-sm">
              {recipe.tools.map((tool) => (
                <li key={tool} className="chip">
                  {tool}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">器具待补充可靠来源。</p>
          )}

          {recipe.allergens && recipe.allergens.length > 0 ? (
            <div className="pt-2">
              <p className="text-sm font-medium text-ink">过敏原 / 注意</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                {recipe.allergens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="steps-title" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="steps-title" className="section-title">
            制作步骤
          </h2>
          <span className="text-xs text-muted">共 {steps.length} 步 · 手记只记「了解制作」</span>
        </div>
        <StepPager
          recipeName={recipe.name}
          steps={steps}
          safety={safety}
          onStepChange={setStepIndex}
          onComplete={() => markRecipe(recipe.id)}
        />
      </section>

      <section aria-labelledby="recipe-steps" className="space-y-3">
        <div className="card">
          <p className="text-sm leading-6 text-ink-soft">
            用量与工序按内容库整理；未标注的营养成分本站不填。
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <CollectButton id={recipe.id} label="收藏这份食谱" />
        <Link to="/museum/food" className="btn-quiet">
          返回美食模块
        </Link>
      </div>
    </article>
  )
}
