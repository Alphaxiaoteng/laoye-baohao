import type { RouteObject } from 'react-router-dom'
import FoodHome from './FoodHome'
import FoodMenu from './FoodMenu'
import FoodRecipePage from './FoodRecipePage'

/**
 * 美食模块的专属页面。
 * 三条路由都排在通用路由之前，因此同路径时这里的页面优先：
 *  - /museum/food       模块专属首页（食谱卡片，点「食谱」就地弹窗）
 *  - /museum/food/menu  全部菜品
 *  - /recipe/:id        完整食谱页（卡片不再跳这里，仅保留深链可访问）
 */
export const FoodRoutes: RouteObject[] = [
  { path: '/museum/food', element: <FoodHome /> },
  { path: '/museum/food/menu', element: <FoodMenu /> },
  { path: '/recipe/:id', element: <FoodRecipePage /> },
]
