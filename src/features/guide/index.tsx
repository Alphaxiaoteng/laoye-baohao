import type { RouteObject } from 'react-router-dom'
import GuidePage from './GuidePage'

/** 潮汕攻略：小红书图文经清洗后收录，保留作者与原文链接。 */
export const GuideRoutes: RouteObject[] = [{ path: '/guide', element: <GuidePage /> }]
