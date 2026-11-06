/**
 * 美食模块素材映射。
 *
 * 页面上的食物图在 `public/media/food/white/`：白底、1:1，按馆内实拍改绘。
 * 原实拍仍留在 `public/media/photos/`，作者与许可登记在 ASSETS.md。
 * `illus-*.webp` 与 `dish-*.svg`、`step-*.svg` 不再给页面用。
 */

export interface FoodImage {
  src: string
  alt: string
}

/** 菜品卡片图：白底食物图 */
export const DISH_IMAGES: Record<string, FoodImage> = {
  'food-beef-ball': {
    src: '/media/food/white/food-beef-ball.webp',
    alt: '白底：一碗牛肉丸汤',
  },
  'food-kway-teow': {
    src: '/media/food/white/food-kway-teow.webp',
    alt: '白底：一叠粿条',
  },
  'food-braised-goose': {
    src: '/media/food/white/recipe-chaozhou-braised-goose/step-07.webp',
    alt: '白底：切件卤鹅与蒜泥醋',
  },
  'recipe-beef-kway-teow-soup': {
    src: '/media/food/white/recipe-beef-kway-teow-soup/step-06.webp',
    alt: '白底：一碗牛肉粿条汤',
  },
  'recipe-chaozhou-beef-ball': {
    src: '/media/food/white/recipe-chaozhou-beef-ball/step-08.webp',
    alt: '白底：凉在架子上的牛肉丸',
  },
  'recipe-chaoshan-hao-lao': {
    src: '/media/food/white/recipe-chaoshan-hao-lao/step-07.webp',
    alt: '白底：装盘的蚝烙',
  },
  'recipe-chaozhou-braised-goose': {
    src: '/media/food/white/recipe-chaozhou-braised-goose/step-07.webp',
    alt: '白底：切件卤鹅与蒜泥醋',
  },
}

const STEP_DIRS = new Set([
  'recipe-beef-kway-teow-soup',
  'recipe-chaozhou-beef-ball',
  'recipe-chaoshan-hao-lao',
  'recipe-chaozhou-braised-goose',
])

/** 分步示意图，下标与步骤序号对应（自绘 SVG，只指示动作） */
export const STEP_IMAGES: FoodImage[] = [
  {
    src: '/media/food/step-01-cut.svg',
    alt: '步骤示意图：砧板上把牛肉切成薄片，并把粿条切成条',
  },
  {
    src: '/media/food/step-02-bowl-base.svg',
    alt: '步骤示意图：空碗里先放鱼露和味精',
  },
  {
    src: '/media/food/step-03-noodles.svg',
    alt: '步骤示意图：粿条放进沸水锅烫熟，用漏勺捞出',
  },
  {
    src: '/media/food/step-04-beef.svg',
    alt: '步骤示意图：牛肉片放进滚沸的牛骨汤里烫',
  },
  {
    src: '/media/food/step-05-garnish.svg',
    alt: '步骤示意图：南姜末、芹菜珠与调味料撒在牛肉上，淋热汤',
  },
  {
    src: '/media/food/step-06-serve.svg',
    alt: '步骤示意图：装碗上桌，旁边标着「2 分钟内」的时钟',
  },
]

export function dishImage(id: string | undefined): FoodImage | undefined {
  if (!id) return undefined
  return DISH_IMAGES[id]
}

export function stepImage(index: number, recipeId?: string): FoodImage | undefined {
  if (!Number.isInteger(index) || index < 0) return undefined
  if (recipeId && STEP_DIRS.has(recipeId)) {
    const n = String(index + 1).padStart(2, '0')
    return {
      src: `/media/food/white/${recipeId}/step-${n}.webp`,
      alt: `白底步骤图 ${n}`,
    }
  }
  return STEP_IMAGES[index]
}
