import { normalizeIngredients, normalizeSteps } from '../../lib/content'
import type { Recipe } from '../../types/content'

/**
 * 食材 → 处理 → 成菜的关系图。
 * 三段文字全部取自 content/recipes.food.json：食材名、步骤数与各食谱的首个工序词，
 * 不在这里补写做法、口味或时长。
 */

function trimName(name: string): string {
  return name.split('（')[0].trim()
}

function foodRow(recipe: Recipe, index: number) {
  const ingredients = normalizeIngredients(recipe)
  const steps = normalizeSteps(recipe)
  const names = ingredients.map((item) => trimName(item.name)).filter(Boolean)
  const shown = names.slice(0, 2).join(' · ')
  const foodList = shown.length > 13 ? `${names[0]} 等` : shown
  const firstStep = steps[0]?.text ?? ''
  const verb = firstStep.includes('：') ? firstStep.split('：')[0].trim() : ''
  const action = verb && verb.length <= 5 ? verb : '工序'
  return {
    id: recipe.id,
    index,
    foodList,
    total: names.length,
    action,
    steps: steps.length,
    name: recipe.name,
    region: (recipe.region ?? '').split('（')[0].trim(),
  }
}

export default function FoodMap({ recipes }: { recipes: Recipe[] }) {
  const rows = recipes.map(foodRow)

  return (
    <div className="docs-svg-scroll is-wide">
      <svg className="docs-svg" viewBox="0 0 760 400" role="img" aria-labelledby="food-map-title">
        <title id="food-map-title">
          潮汕食谱的食材、处理与成菜关系示意，共 {rows.length} 道
        </title>
        <defs>
          <marker id="food-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path className="df-arrow" d="M0 0 L8 4 L0 8 z" />
          </marker>
        </defs>
        <rect className="dg-frame" x="0" y="0" width="760" height="400" rx="12" />

        <text className="dg-col" x="16" y="30">
          食材（据食谱）
        </text>
        <text className="dg-col" x="292" y="30">
          处理（据步骤）
        </text>
        <text className="dg-col" x="532" y="30">
          成菜
        </text>

        {rows.length === 0 ? (
          <text className="dg-empty" x="380" y="210" textAnchor="middle">
            内容待补充
          </text>
        ) : null}

        {rows.map((row) => {
          const y = 52 + row.index * 84
          return (
            <g key={row.id}>
              <rect className="df-node" x="16" y={y} width="232" height="66" rx="10" />
              <text className="df-main" x="30" y={y + 27}>
                {row.foodList}
              </text>
              <text className="df-sub" x="30" y={y + 50}>
                共 {row.total} 种
              </text>

              <path className="df-link" d={`M252 ${y + 33} H288`} markerEnd="url(#food-arrow)" />

              <rect className="df-node is-mid" x="292" y={y} width="196" height="66" rx="10" />
              <text className="df-main" x="306" y={y + 27}>
                {row.action}
              </text>
              <text className="df-sub" x="306" y={y + 50}>
                {row.steps} 步
              </text>

              <path className="df-link" d={`M492 ${y + 33} H528`} markerEnd="url(#food-arrow)" />

              <rect className="df-node is-dish" x="532" y={y} width="212" height="66" rx="10" />
              <text className="df-dish" x="546" y={y + 28}>
                {row.name}
              </text>
              <text className="df-sub" x="546" y={y + 50}>
                {row.region}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
