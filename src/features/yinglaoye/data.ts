/**
 * 营老爷模块的页面元数据。
 *
 * 这里只描述「哪个条目配哪张卡、案例的原文时间与要点、队伍示意里有哪些部分」，
 * 文化事实本身一律写在 content/entries.yinglaoye.json，并挂 sources.yinglaoye.json 的来源编号。
 * 新增条目时先补内容与来源，再回到这里登记，避免页面比内容先说话。
 */

/** 首页一句入门解释（只概括来源写到的范围，不宣称任何超自然效果） */
export const INTRO_SENTENCE =
  '营老爷，是潮汕一些村镇在年初抬着神轿绕村巡游的民间活动，当地也写作“游神”；这里只整理来源里写到的称呼、队伍与几个地区的做法。'

/** 首页推荐知识卡：条目 id + 卡片上必须显眼的地区与年份标签 */
export interface IntroCardMeta {
  entryId: string
  /** 地区标签，措辞跟内容里的 region 一致 */
  regionLabel: string
  /** 原文年份，用 · 分隔多处来源 */
  years: string
}

export const INTRO_CARDS: IntroCardMeta[] = [
  {
    entryId: 'ylr-name',
    regionLabel: '潮州（2025 年文章）· 潮汕（2017 年记录）',
    years: '2025 · 2017',
  },
  {
    entryId: 'ylr-xunjing',
    regionLabel: '普宁（2021 年发布）· 元巷村（2019 年 2 月）',
    years: '2021 · 2019',
  },
  {
    entryId: 'ylr-team',
    regionLabel: '普宁 · 元巷村 · 澄海（三篇来源，年份不同）',
    years: '2021 · 2019 · 2017',
  },
  {
    entryId: 'ylr-time',
    regionLabel: '潮州（2025）· 潮汕（2019）· 普宁（2021 发布）',
    years: '2025 · 2019 · 2021',
  },
]

/** 地区案例对照：字段固定为地区 / 时间（原文年份）/ 活动要点 / 来源 */
export interface CaseMeta {
  entryId: string
  region: string
  /** 原文里的日期或年份表述；不换算成今年的日程 */
  time: string
  points: string[]
  sourceIds: string[]
}

export const CASES: CaseMeta[] = [
  {
    entryId: 'ylr-case-puning',
    region: '普宁（页面未限定单一村落）',
    time: '2021 年 11 月 24 日发布；原文说一般在农历正月，各村轮流“闹热”',
    points: [
      '原文说这项活动在晚上进行',
      '村里青壮年抬着八抬大轿，走遍村里的大路和小巷',
      '队伍包括标手（扛标旗）、牌手（举牌）、轿夫、乐手',
      '民间以此祈愿风调雨顺、全村平安',
    ],
    sourceIds: ['S3'],
  },
  {
    entryId: 'ylr-case-chaozhou',
    region: '潮州·青龙古庙全城巡游',
    time: '2025 年 2 月 8 日文章；原文记为农历正月二十四，2014 年起恢复出巡',
    points: [
      '原文称这是潮州最有名且规模最大的营老爷',
      '自 2014 年恢复安济王及夫人圣驾出巡',
      '原文记巡游队伍 1000 多人，文化踩街约 4 小时',
      '沿途展示潮州民俗与工艺',
    ],
    sourceIds: ['S4'],
  },
  {
    entryId: 'ylr-case-yuanxiang',
    region: '潮州市潮安区江东镇元巷村',
    time: '2019 年 2 月 12 日（原文报道日期）',
    points: [
      '早上村里用传统饰物装饰，家家拿出五牲、红桃粿祭拜',
      '现场有本地木偶戏团助兴',
      '午后，队伍在潮州音乐的鼓点声中出发',
      '队伍由标旗、仪仗队、大锣鼓、潮乐队、迎神花队等组成，巡遍村中各主要道路',
    ],
    sourceIds: ['S5'],
  },
  {
    entryId: 'ylr-case-shantou',
    region: '汕头市澄海区前沟乡',
    time: '2017 年正月初六（作者走访记录，文章同年 5 月 10 日发布）',
    points: [
      '年轻力壮的男青年抬着“老爷”像，走在游神队伍中间',
      '原文说有时也会请来乐队、英歌舞队、布马队助兴',
      '队伍所到之处有鞭炮锣鼓相迎',
    ],
    sourceIds: ['S6'],
  },
]

/** 队伍示意的可点击部分。optional = 只有部分地方、部分年份才有 */
export interface ProcessionPart {
  id: string
  label: string
  /** 图上该部分的简短说明，严格按来源措辞 */
  blurb: string
  /** 展示在右侧面板里的条目 id，必须存在于 entries.yinglaoye.json */
  entries: string[]
  optional?: boolean
}

export const PROCESSION_PARTS: ProcessionPart[] = [
  {
    id: 'flag',
    label: '标旗',
    blurb: '扛在肩上的长条旗。普宁页面写作“标手（扛标旗）”，元巷村的队伍里也有标旗。',
    entries: ['ylr-team', 'ylr-case-yuanxiang'],
  },
  {
    id: 'guard',
    label: '仪仗',
    blurb: '牌手举牌、仪仗队前导。普宁页面列“牌手”，元巷村记“仪仗队”，写法不尽相同。',
    entries: ['ylr-team', 'ylr-case-yuanxiang'],
  },
  {
    id: 'palanquin',
    label: '神轿',
    blurb: '把神像请上轿，由青壮年抬着走。普宁页面写作“八抬大轿”，潮州文章写作“神舆”。',
    entries: ['ylr-case-puning', 'ylr-xunjing', 'ylr-team'],
  },
  {
    id: 'drums',
    label: '鼓乐',
    blurb: '队伍里的乐手、大锣鼓与潮乐队；澄海前沟乡的记录里也提到请乐队。',
    entries: ['ylr-team', 'ylr-case-yuanxiang'],
  },
  {
    id: 'flowers',
    label: '花队',
    blurb: '元巷村队伍里有“迎神花队”，澄海隆都的记录里是担着花篮的女孩。只有部分地方写到。',
    entries: ['ylr-team', 'ylr-case-yuanxiang'],
    optional: true,
  },
  {
    id: 'yingge',
    label: '英歌 · 布马',
    blurb: '澄海前沟乡 2017 年的记录说“有时”请来乐队、英歌舞队、布马队助兴，并不是每处都有。',
    entries: ['ylr-team', 'ylr-case-shantou'],
    optional: true,
  },
]

/** 对照页顶部的阅读提示（每条都能在 S3–S6 里找到对应表述） */
export const CASE_READING_NOTES: string[] = [
  '四处都在年初举行、队伍绕行村中或城中道路，但日期、规模与队伍组成各不相同。',
  '普宁与元巷村的记述来自政府页面与报纸报道，潮州全城巡游与澄海前沟乡来自署名文章与走访记录，口径不完全一样。',
  '页面里的年份是来源的发表或记录时间，不是今年的活动日程；需要当天信息请查当地公告。',
]

/** 实拍图的统一标注：照片只作地区示例，不对应某一个村的某一场 */
export const PHOTO_NOTE = '图为潮汕地区营老爷实拍，不特指某村某场'

/**
 * 三城真图案例：潮州 / 汕头 / 揭阳各取一份已有条目。
 * 实拍图在 public/media/photos/ 下（CC BY-SA 4.0，登记见 registry.json 与 PHOTO_CREDITS）；
 * 时间与年份照来源原文，不换算成今年的日程。
 */
export interface CityCase {
  /** 潮汕三市之一，卡片上的城市名 */
  city: string
  /** 对应条目 id，点击卡片进条目详情 */
  entryId: string
  /** 实拍图路径，均在 /media/photos/ 下 */
  image: string
  /** 图片真实像素宽高，先占位避免加载后跳动 */
  width: number
  height: number
  alt: string
  /** 竖幅照片的裁切焦点（CSS object-position），留空则居中 */
  focus?: string
  /** 原文里的农历时间表述，照原文抄 */
  time: string
  /** 原文年份与出处，写在时间后面 */
  year: string
  /** 一句要点，≤30 字，只转述来源写到的事 */
  point: string
}

export const CITY_CASES: CityCase[] = [
  {
    city: '潮州',
    entryId: 'ylr-case-chaozhou',
    image: '/media/photos/yinglaoye-procession.jpg',
    width: 1920,
    height: 1080,
    alt: '潮汕营老爷实拍：巡游队伍中敲鼓的鼓手',
    time: '农历正月二十四',
    year: '2025 年文章所述',
    point: '青龙古庙全城巡游，队伍一千多人，踩街约四小时',
  },
  {
    city: '汕头',
    entryId: 'ylr-case-shantou',
    image: '/media/photos/yinglaoye-chaoyang-walk.jpg',
    width: 1600,
    height: 2400,
    alt: '潮汕营老爷巡游实拍：队伍抬着神轿行进',
    time: '正月初六',
    year: '2017 年记录',
    point: '澄海前沟乡游神，老爷像走在队伍中间，有时请英歌队',
  },
  {
    city: '揭阳',
    entryId: 'ylr-case-puning',
    image: '/media/photos/yinglaoye-yingge.jpg',
    width: 1920,
    height: 1080,
    alt: '潮汕营老爷实拍：现场的英歌装扮',
    time: '农历正月，各村轮流“闹热”',
    year: '2021 年 11 月发布',
    point: '普宁夜里抬八抬大轿，走遍村里的大路小巷',
  },
]

/** 模块首页可切换的四张静图 */
export const STAGE_FRAMES = [
  {
    id: 'sedan',
    src: '/media/photos/yinglaoye-chaoyang-sedan.jpg',
    alt: '潮阳双忠营老爷实拍：神轿与抬轿的人',
    caption: '潮阳双忠，神轿',
    focus: 'center 30%',
  },
  {
    id: 'drum',
    src: '/media/photos/yinglaoye-procession.jpg',
    alt: '潮汕营老爷实拍：巡游队伍中敲鼓的鼓手',
    caption: '巡游队伍里的鼓',
  },
  {
    id: 'walk',
    src: '/media/photos/yinglaoye-chaoyang-walk.jpg',
    alt: '潮阳双忠营老爷实拍：队伍抬着神轿行进',
    caption: '潮阳双忠，队伍行进',
    focus: 'center 30%',
  },
  {
    id: 'yingge',
    src: '/media/photos/yinglaoye-yingge.jpg',
    alt: '潮汕营老爷实拍：现场的英歌装扮',
    caption: '现场的英歌装扮',
  },
] as const

/** 实拍图授权登记：照 public/media/photos/registry.json 抄录，用于页面署名 */
export interface PhotoCredit {
  /** 图片说明，同时用作列表里的名字 */
  label: string
  author: string
  license: string
  /** Commons 文件页，新窗口打开 */
  source: string
}

export const PHOTO_CREDITS: PhotoCredit[] = [
  {
    label: '潮阳双忠神轿',
    author: '0754Hombee',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:%E6%BD%AE%E9%98%B3%E5%8F%8C%E5%BF%A0%E8%90%A5%E8%80%81%E7%88%B72.jpg',
  },
  {
    label: '巡游鼓手',
    author: 'Zoemonday',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:%E6%BD%AE%E6%B1%95%E8%90%A5%E8%80%81%E7%88%B7.jpg',
  },
  {
    label: '潮阳双忠巡游',
    author: '0754Hombee',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:%E6%BD%AE%E9%98%B3%E5%8F%8C%E5%BF%A0%E8%90%A5%E8%80%81%E7%88%B71.jpg',
  },
  {
    label: '现场英歌装扮',
    author: 'Zoemonday',
    license: 'CC BY-SA 4.0',
    source:
      'https://commons.wikimedia.org/wiki/File:%E6%BD%AE%E6%B1%95%E8%90%A5%E8%80%81%E7%88%B7%E8%8B%B1%E6%AD%8C%E8%88%9E%E7%8E%B0%E5%9C%BA.jpg',
  },
]
