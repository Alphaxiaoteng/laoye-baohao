import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Recipe } from '../../types/content'
import { recipes, sourcesOfModule } from '../../lib/content'
import { useProgressStore } from '../../store/progress'
import { usePageContext, usePageTitle } from '../../lib/usePageContext'
import { RecipeCard } from './cards'
import RecipeModal from './RecipeModal'

/** 美食模块专属首页：/museum/food */
export default function FoodHome() {
  const visitModule = useProgressStore((s) => s.visitModule)
  const foodSources = sourcesOfModule('food')
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null)

  usePageTitle('潮汕美食')
  usePageContext({ module: 'food', moduleTitle: '潮汕美食' })

  useEffect(() => {
    visitModule('food')
  }, [visitModule])

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <nav aria-label="面包屑" className="text-sm text-muted">
        <Link to="/museum" className="link-inline">
          文化馆
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span>潮汕美食</span>
      </nav>

      <header className="space-y-2">
        <p className="text-xs tracking-[0.3em] text-brick">潮汕美食</p>
        <h1 className="font-serif text-3xl leading-snug text-ink">四道菜，点开看做法</h1>
        <p className="text-sm text-muted">
          {recipes.length} 份食谱 · 已登记 {foodSources.length} 条来源
        </p>
      </header>

      {recipes.length === 0 ? (
        <p className="card text-sm text-ink-soft">暂无可展示的食谱。</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {recipes.map((recipe) => (
            <li key={recipe.id} className="flex">
              <RecipeCard recipe={recipe} onOpenRecipe={setOpenRecipe} />
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs leading-5 text-faint">
        材料与步骤逐条摘自媒体登记的标准与政府门户，本站不补写来源里没有的比例。
        看会步骤不等于真的做过，火候与刀工仍需现场练。
      </p>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <Link to="/museum/food/menu" className="btn-secondary">
          全部菜品
        </Link>
        <Link to="/sources" className="btn-quiet">
          核对来源
        </Link>
      </div>

      {openRecipe ? (
        <RecipeModal recipe={openRecipe} onClose={() => setOpenRecipe(null)} />
      ) : null}
    </div>
  )
}
