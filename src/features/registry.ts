import type { RouteObject } from 'react-router-dom'
import { YinggeRoutes } from './yingge'
import { TeaRoutes } from './tea'
import { FoodRoutes } from './food'
import { YinglaoyeRoutes } from './yinglaoye'
import { ListenRoutes } from './listen'

/** 各模块专属路由；排在通用路由之前，同路径时模块页面优先 */
export const featureRoutes: RouteObject[] = [
  ...YinggeRoutes,
  ...TeaRoutes,
  ...FoodRoutes,
  ...YinglaoyeRoutes,
  ...ListenRoutes,
]
