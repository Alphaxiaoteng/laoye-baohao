import { entriesOfModule, normalizeSteps, recipes } from '../../lib/content'

export interface FoodFrame {
  src: string
  /** 来自 content 的该步原文 */
  text: string
}

export interface FoodDish {
  id: string
  title: string
  /** 白底主图。有步骤时用最后一步的成品状态。 */
  still: string
  alt: string
  gif?: string
  frames: FoodFrame[]
}

function stepFile(id: string, index: number): string {
  const n = String(index + 1).padStart(2, '0')
  return `/media/food/white/${id}/step-${n}.webp`
}

/**
 * 条目正文里已经写明的工序，按原文切句。
 * 只收录 body 里能原样找到的句子，不另写步骤。
 */
const ENTRY_STEPS: Record<string, readonly string[]> = {
  'food-beef-ball': [
    '取新鲜黄牛后腿肉，去除筋、膜，切成块',
    '用两根铁棒左右开弓反复捶打',
    '中途加入食盐与冰水，再用力搅挞拍打，直到肉浆沾手不掉',
    '然后从虎口挤成丸、用汤勺舀入热水定型',
    '最后以慢火边氽边搅拌煮至熟透，报道中提到氽丸约 8 分钟',
  ],
  'food-kway-teow': [
    '大米洗净后用清水浸泡 3 至 4 小时至变软，沥干后磨成细腻米浆',
    '蒸盘或蒸笼抹油防粘，倒入米浆摊平，旺火蒸 3 至 5 分钟至熟透、表面透明',
    '冷却后从边缘揭下叠放整齐，再切成 3 至 5 厘米宽的条或 1 寸左右的方块',
    '一口锅烧沸水烫粿条',
    '另一口锅用鸡、猪骨等煮汤',
    '肉料在汤中汆熟后倒入事先放了冬菜、鱼露、味精、芹菜珠、葱花或蒜头朥的碗里，再冲上热汤',
  ],
}

function entryFrames(entry: { id: string; summary?: string; body?: string }): FoodFrame[] {
  const quotes = ENTRY_STEPS[entry.id]
  if (!quotes) return []
  const source = `${entry.summary ?? ''}\n${entry.body ?? ''}`
  const frames: FoodFrame[] = []
  quotes.forEach((text, index) => {
    if (!source.includes(text)) return
    frames.push({ src: stepFile(entry.id, index), text })
  })
  return frames
}

/**
 * 美食页可点选的菜：content 里的食谱各成一条（带步骤图），
 * 标题没有被食谱覆盖的条目再各补一条白底主图。
 */
export function buildFoodStage(): FoodDish[] {
  const fromRecipes: FoodDish[] = recipes.flatMap((recipe) => {
    const steps = normalizeSteps(recipe)
    if (steps.length === 0) return []
    const frames = steps.map((step, index) => ({
      src: stepFile(recipe.id, index),
      text: step.text,
    }))
    const still = frames[frames.length - 1]?.src ?? `/media/food/white/${recipe.id}.webp`
    return [
      {
        id: recipe.id,
        title: recipe.name,
        still,
        alt: recipe.name,
        gif: frames.length > 1 ? `/media/food/white/${recipe.id}.gif` : undefined,
        frames,
      },
    ]
  })

  const covered = new Set(fromRecipes.map((dish) => dish.title))
  const fromEntries: FoodDish[] = entriesOfModule('food')
    .filter((entry) => !covered.has(entry.title))
    .map((entry) => {
      const frames = entryFrames(entry)
      return {
        id: entry.id,
        title: entry.title,
        still: `/media/food/white/${entry.id}.webp`,
        alt: entry.title,
        gif: frames.length > 1 ? `/media/food/white/${entry.id}.gif` : undefined,
        frames,
      }
    })

  return [...fromRecipes, ...fromEntries]
}
