import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Recipe } from '../../types/content'
import { entriesOfModule, recipes } from '../../lib/content'
import { usePageContext, usePageTitle } from '../../lib/usePageContext'
import { DishCard, RecipeCard } from './cards'
import RecipeModal from './RecipeModal'

/** 全部菜品：/museum/food/menu */
export default function FoodMenu() {
  const list = entriesOfModule('food')
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null)

  usePageTitle('全部菜品')
  usePageContext({ module: 'food', moduleTitle: '潮汕美食' })

  return (
    <div className="mx-auto max-w-5xl space-y-14">
      <nav aria-label="面包屑" className="text-sm text-muted">
        <Link to="/museum/food" className="link-inline">
          潮汕美食
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span>全部菜品</span>
      </nav>

      <header className="space-y-2">
        <h1 className="font-serif text-3xl text-ink">全部菜品</h1>
      </header>

      <section aria-labelledby="menu-entries" className="space-y-4">
        <h2 id="menu-entries" className="section-title">
          菜
        </h2>
        {list.length === 0 ? (
          <p className="card text-sm text-ink-soft">暂无可展示的菜品。</p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-3">
            {list.map((entry) => (
              <li key={entry.id} className="flex">
                <DishCard entry={entry} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="menu-recipes" className="space-y-4">
        <h2 id="menu-recipes" className="section-title">
          分步食谱
        </h2>
        {recipes.length === 0 ? (
          <p className="card text-sm text-ink-soft">暂无可展示的食谱。</p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2">
            {recipes.map((recipe) => (
              <li key={recipe.id} className="flex">
                <RecipeCard recipe={recipe} onOpenRecipe={setOpenRecipe} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-2 border-t border-line pt-5">
        <Link to="/museum/food" className="btn-secondary">
          回到潮汕美食
        </Link>
        <Link to="/docs" className="btn-quiet">
          阅读历史介绍
        </Link>
      </div>

      {openRecipe ? (
        <RecipeModal recipe={openRecipe} onClose={() => setOpenRecipe(null)} />
      ) : null}
    </div>
  )
}
