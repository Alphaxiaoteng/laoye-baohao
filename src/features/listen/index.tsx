import type { RouteObject } from 'react-router-dom'
import ListenFeaturePage from './ListenPage'
import ListenCategoryPage from './ListenCategoryPage'

/**
 * 听潮独立页面，挂在 App.tsx 的 featureRoutes 扩展位（registry.ts 已登记 ListenRoutes）。
 * 覆盖通用 /listen 页，并增加分类页 /listen/:category。
 */
export const ListenRoutes: RouteObject[] = [
  { path: '/listen', element: <ListenFeaturePage /> },
  { path: '/listen/:category', element: <ListenCategoryPage /> },
]
