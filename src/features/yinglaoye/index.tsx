import type { RouteObject } from 'react-router-dom'
import YinglaoyeHome from './HomePage'
import ProcessionPage from './ProcessionPage'
import CasesPage from './CasesPage'

/**
 * yinglaoye 模块的专属页面。只在本目录内开发，路由一律挂在 /museum/yinglaoye/... 之下。
 * 通用条目详情页 /museum/yinglaoye/:entry 仍由 EntryPage 提供，这里不拦截。
 */
export const YinglaoyeRoutes: RouteObject[] = [
  { path: '/museum/yinglaoye', element: <YinglaoyeHome /> },
  { path: '/museum/yinglaoye/procession', element: <ProcessionPage /> },
  { path: '/museum/yinglaoye/cases', element: <CasesPage /> },
]
