import type { RouteObject } from 'react-router-dom'
import TeaHome from './TeaHome'
import TeaBrew from './TeaBrew'
import TeaGesture from './TeaGesture'

/**
 * tea 模块的专属页面。只在本目录内开发，路由一律挂在 /museum/tea/... 之下。
 * 通用 ModulePage / EntryPage 仍负责 /museum/tea/:entry 条目页。
 */
export const TeaRoutes: RouteObject[] = [
  { path: '/museum/tea', element: <TeaHome /> },
  { path: '/museum/tea/brew', element: <TeaBrew /> },
  { path: '/museum/tea/gesture', element: <TeaGesture /> },
]
