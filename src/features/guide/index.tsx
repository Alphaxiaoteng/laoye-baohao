import type { RouteObject } from 'react-router-dom'
import GuidePage from './GuidePage'

/** 潮汕攻略：站内原创编辑指南，正文与结构见 ./knowledge.ts，不再跳转外站。 */
export const GuideRoutes: RouteObject[] = [{ path: '/guide', element: <GuidePage /> }]
