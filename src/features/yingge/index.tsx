import type { RouteObject } from 'react-router-dom'
import YinggeHome from './pages/HomeV2'
import YinggeStory from './pages/Story'
import YinggeFormations from './pages/Formations'
import YinggeRoles from './pages/Roles'
import YinggeWatch from './pages/Watch'
import YinggeSound from './pages/Sound'

/**
 * yingge 模块的专属页面。
 * 主结构只有两页：/museum/yingge（五要素下滑）与 /museum/yingge/story（叙事 + 数字馆）。
 * formations / roles / watch / sound 保留为可直达的深链页，供旧链接与站内检索使用，
 * 主页面不再逐一跳转。条目页（/museum/yingge/:entry）仍由通用 EntryPage 处理。
 */
export const YinggeRoutes: RouteObject[] = [
  { path: '/museum/yingge', element: <YinggeHome /> },
  { path: '/museum/yingge/story', element: <YinggeStory /> },
  { path: '/museum/yingge/formations', element: <YinggeFormations /> },
  { path: '/museum/yingge/roles', element: <YinggeRoles /> },
  { path: '/museum/yingge/watch', element: <YinggeWatch /> },
  { path: '/museum/yingge/sound', element: <YinggeSound /> },
]
