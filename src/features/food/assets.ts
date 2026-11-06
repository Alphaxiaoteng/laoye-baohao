/**
 * 美食模块素材映射。
 *
 * 菜品图一律用 `public/media/photos/` 里的实拍照片（Wikimedia Commons，CC 授权），
 * 不再用自绘 SVG 冒充菜品照片。作者、许可与原始页面逐张登记在 ASSETS.md。
 * 分步图仍是本站自绘 SVG，只用来指示动作，不当成成品照片。
 */

export interface FoodImage {
  src: string
  alt: string
}

/** 菜品卡片图：真实照片 */
export const DISH_IMAGES: Record<string, FoodImage> = {
  'food-beef-ball': {
    src: '/media/photos/food-beef-ball-soup.jpg',
    alt: '实拍：一碗牛肉丸汤，汤面浮着几颗牛肉丸',
  },
  'food-kway-teow': {
    src: '/media/photos/food-kway-teow.jpg',
    alt: '实拍：一碗粿条汤，粿条配肉料与青菜',
  },
  'food-braised-goose': {
    src: '/media/photos/food-braised-goose.jpg',
    alt: '实拍：切件装盘的潮州卤鹅',
  },
  'recipe-beef-kway-teow-soup': {
    src: '/media/photos/food-beef-kway-teow.jpg',
    alt: '实拍：潮汕牛肉丸粿条汤，牛肉丸与粿条浸在清汤里',
  },
  'recipe-chaozhou-beef-ball': {
    src: '/media/photos/food-beef-ball-soup.jpg',
    alt: '实拍：一碗牛肉丸汤，汤面浮着几颗牛肉丸',
  },
  'recipe-chaoshan-hao-lao': {
    src: '/media/photos/food-oyster-omelette.jpg',
    alt: '实拍：一盘蚝烙，表面煎得金黄，蚝粒嵌在蛋饼里',
  },
  'recipe-chaozhou-braised-goose': {
    src: '/media/photos/food-braised-goose.jpg',
    alt: '实拍：切件装盘的潮州卤鹅',
  },
}

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

export function stepImage(index: number): FoodImage | undefined {
  if (!Number.isInteger(index) || index < 0) return undefined
  return STEP_IMAGES[index]
}
