/**
 * 潮汕攻略知识层。
 *
 * 这里不再保存「帖子卡片」，而是把 content/guides.json 里登记的要点、
 * 与封面图上可读到的路线信息，重新整理成可以整篇读完的站内指南。
 *
 * 取舍规则（改内容时请一起遵守）：
 * 1. 只写能追溯的事实：`evidenceIds` 指向 content/guides.json 的条目 id，
 *    `stationRefs` 指向站内 entries.*.json 已登记的条目 id；两个字段都不渲染给用户。
 * 2. 不写门票价、开放时间、班次、电话、实时路况——这类信息改成「以现场为准」的提醒。
 * 3. 不复制原帖长文，正文是重新组织的编辑短句。
 * 4. 配图只用 public/media 下已登记许可的实拍；没有可靠实拍就只留 SVG，不补 AI 图。
 */

export type GuideCity = '潮州' | '汕头' | '揭阳' | '潮汕'
export type GuideTheme = '古城' | '海岛' | '民俗' | '美食' | '路线'

/** 食物小图谱用到的抽象线稿，只是结构说明，不是菜品照片 */
export type FoodGlyphKind =
  | 'hotpot'
  | 'beefball'
  | 'kwayteow'
  | 'goose'
  | 'oyster'
  | 'tea'
  | 'porridge'
  | 'rice-roll'

export interface GuideFact {
  label: string
  value: string
}

export interface GuideSection {
  heading: string
  body: string[]
  /** 可选站内深链（不外链） */
  link?: { to: string; label: string }
}

export interface GuideStop {
  label: string
  note?: string
}

export interface GuideRouteSegment {
  label: string
  /** 路线所在的地区 / 片区说明 */
  area?: string
  stops: GuideStop[]
}

export interface GuideRoute {
  intro: string
  segments: GuideRouteSegment[]
}

export interface GuideFoodItem {
  glyph: FoodGlyphKind
  name: string
  note: string
}

export interface GuidePhoto {
  src: string
  alt: string
  caption: string
  /** 许可与作者，纯文本展示，不做外链 */
  credit: string
}

export interface GuideArticle {
  id: string
  city: GuideCity
  theme: GuideTheme
  eyebrow: string
  title: string
  dek: string
  duration: string
  season: string
  /** 封面（站内已登记实拍）；没有可靠实拍时为 undefined，卡片改用 SVG 头图 */
  cover?: GuidePhoto
  facts: GuideFact[]
  sections: GuideSection[]
  route: GuideRoute
  /** 可以为空：没有合适吃食的篇目就不硬凑 */
  food: GuideFoodItem[]
  photos: GuidePhoto[]
  /** 没有额外实拍时给读者的说明，避免用示意图冒充现场 */
  photosNote?: string
  cautions: string[]
  evidenceIds: string[]
  stationRefs?: string[]
}

const GUANGJI_BRIDGE: GuidePhoto = {
  src: '/media/home/chaozhou-guangji-bridge-20191211-2.webp',
  alt: '潮州广济桥：江面上由一排梭船连成的桥身，尽头是桥亭',
  caption: '广济桥中段由梭船连成，晴天时桥面与桥亭的影子落在江上。',
  credit: 'Akira CA / Wikimedia Commons · CC BY-SA 4.0',
}

const CHAOZHOU_ALLEY: GuidePhoto = {
  src: '/media/home/chaozhou-jiadiwan.webp',
  alt: '潮州古城里的一条旧巷：两侧是斑驳的白墙与老门楼，石板路通向巷子深处',
  caption: '古城里的小巷比主街安静，门楼、门联和石板路都还在用。',
  credit: 'Sgnpkd / Wikimedia Commons · CC BY-SA 4.0',
}

const KANGHU_TEA: GuidePhoto = {
  src: '/media/home/teochew-kanghu-tea.webp',
  alt: '潮汕工夫茶：小茶壶与三只白瓷茶杯摆在茶盘上',
  caption: '工夫茶用的是小杯，一轮三杯，茶汤浓。',
  credit: 'Kandukuru Nagarjun / Wikimedia Commons · CC BY 2.0',
}

const CUISINE_TABLE: GuidePhoto = {
  src: '/media/home/chaoshan-cuisine3.webp',
  alt: '潮汕牛肉火锅：圆桌上摆着多盘切好的牛肉片、牛肉丸与配菜，中间是清汤锅',
  caption: '牛肉火锅按部位分盘，盘上标着名称。',
  credit: 'Clarayyt / Wikimedia Commons · CC BY-SA 4.0',
}

const BRAISED_GOOSE: GuidePhoto = {
  src: '/media/photos/food-braised-goose.jpg',
  alt: '潮州卤鹅：几只卤好的整鹅挂在档口的铁钩上，表皮呈琥珀色',
  caption: '卤鹅在档口挂着卖，可以按部位切。',
  credit: '0754Hombee / Wikimedia Commons · CC BY-SA 4.0',
}

const OYSTER_OMELETTE: GuidePhoto = {
  src: '/media/photos/food-oyster-omelette.jpg',
  alt: '蚝烙：铁板上正在煎的一整块金黄色蚝烙，旁边放着锅铲',
  caption: '蚝烙在铁板上摊开煎，边缘会先脆起来。',
  credit: '水餃喵 / Wikimedia Commons · CC BY-SA 4.0',
}

const BEEF_KWAY_TEOW: GuidePhoto = {
  src: '/media/photos/food-beef-kway-teow.jpg',
  alt: '牛肉粿条汤：碗里是宽扁的粿条、牛肉片与清汤',
  caption: '粿条是米做的，汤粿条是最常见的一碗。',
  credit: 'N509FZ / Wikimedia Commons · CC BY-SA 4.0',
}

const BEEF_BALL_SOUP: GuidePhoto = {
  src: '/media/photos/food-beef-ball-soup.jpg',
  alt: '牛肉丸汤：清汤碗里浮着几颗牛肉丸，撒了葱花或芹菜末',
  caption: '牛肉丸汤是清汤路线，靠丸子本身的弹性。',
  credit: 'DragonSamYU / Wikimedia Commons · CC BY-SA 4.0',
}

const YINGGE_DETAIL: GuidePhoto = {
  src: '/media/photos/yingge-performance.jpg',
  alt: '英歌队员近景：两位画着脸谱、戴头饰的队员手持鼓槌，身前挂着鼓',
  caption: '英歌的脸谱、头饰和鼓，在现场比照片更密；图为潮汕地区实拍。',
  credit: 'Zoemonday / Wikimedia Commons · CC BY-SA 4.0',
}

const YINGGE_PARADE: GuidePhoto = {
  src: '/media/photos/yingge-parade.jpg',
  alt: '英歌队沿街行进：队员穿戏服、画脸谱，手持木槌列队走过路口',
  caption: '英歌队行进时，锣鼓和脚步是同一个节拍；图为潮汕地区实拍，不特指某支队伍。',
  credit: 'Zoemonday / Wikimedia Commons · CC BY-SA 4.0',
}

const YINGLAOYE_PROCESSION: GuidePhoto = {
  src: '/media/photos/yinglaoye-procession.jpg',
  alt: '营老爷巡游：队伍抬着神轿穿过村镇街道，两旁是围观的人群',
  caption: '营老爷是潮汕村里的仪式，图为潮汕地区实拍，不特指某一村某一场。',
  credit: 'Zoemonday / Wikimedia Commons · CC BY-SA 4.0',
}

/* 以下封面是 2026-11 从 Wikimedia Commons 检索后自托管的 16:10 裁切图，
   原图、作者与许可见同目录 ASSETS.md；没有热链，也没有 AI 生成。 */

const PAIFANGJIE: GuidePhoto = {
  src: '/media/guide/covers/paifangjie.webp',
  alt: '潮州牌坊街：街心立着石牌坊，两侧是骑楼与商铺，行人走在石板路上',
  caption: '牌坊街是古城主街，牌坊一座接一座。',
  credit: 'Sgnpkd / Wikimedia Commons · CC BY-SA 4.0',
}

const GUANGJI_TOWER: GuidePhoto = {
  src: '/media/guide/covers/guangji-tower.webp',
  alt: '潮州广济楼：红墙灰瓦的三层城楼立在城墙上，中间是拱形城门',
  caption: '广济楼与城墙连在一起，楼下就是过街的城门洞。',
  credit: '燕难飞 / Wikimedia Commons · CC BY-SA 3.0',
}

const KAIYUAN_TEMPLE: GuidePhoto = {
  src: '/media/guide/covers/kaiyuan-temple.webp',
  alt: '潮州开元寺俯瞰：成片红瓦屋顶围出几进院落，院子里有树与石塔',
  caption: '从高处看开元寺，能看清几进院落的关系。',
  credit: 'Windmemories / Wikimedia Commons · CC BY-SA 4.0',
}

const XIAOGONGYUAN: GuidePhoto = {
  src: '/media/guide/covers/xiaogongyuan.webp',
  alt: '汕头小公园：环形广场中间的亭子与四周的骑楼群，广场上有人走动',
  caption: '小公园亭是这片骑楼街区的中心。',
  credit: 'Sgnpkd / Wikimedia Commons · CC BY-SA 4.0',
}

const NANAO_LIGHTHOUSE: GuidePhoto = {
  src: '/media/guide/covers/nanao-changshanwei.webp',
  alt: '南澳岛长山尾灯塔：红色灯塔立在码头边，远处是跨海的南澳大桥',
  caption: '长山尾灯塔在桥头附近，远处就是南澳大桥。',
  credit: 'Windmemories / Wikimedia Commons · CC BY-SA 4.0',
}

const QINGAO_BAY: GuidePhoto = {
  src: '/media/guide/covers/qingao-bay.webp',
  alt: '南澳岛海湾：岸线堆着大片浅色礁石，远处是起伏的山与海面',
  caption: '南澳的海岸多为礁石，走的时候注意脚下。',
  credit: '燕难飞 / Wikimedia Commons · CC BY-SA 3.0',
}

const JINXIAN_GATE: GuidePhoto = {
  src: '/media/guide/covers/jinxian-gate.webp',
  alt: '揭阳进贤门：绿瓦红柱的城楼立在石砌城台上，中间是拱门，檐下挂着红灯笼',
  caption: '进贤门是老城最好认的起点。',
  credit: 'Thyj / Wikimedia Commons · CC BY-SA 4.0',
}

const REUSED_CAUTION = '日期、班次与开放安排以现场公告为准，本文不提供实时信息。'

export const guideArticles: GuideArticle[] = [
  {
    id: 'chaozhou-old-town',
    city: '潮州',
    theme: '古城',
    eyebrow: '古城步行 · 一天',
    title: '潮州古城一天：广济桥、牌坊街与开元寺一带',
    dek: '古城的精华几乎都挤在两条街、一座桥之间。这条走法把步行段和过江段分开，中间留出坐下来吃东西的时间。',
    duration: '1 天（步行约 6 公里＋两段短途打车）',
    season: '全年；秋冬日间更舒服，夏天把正午留给室内',
    cover: CHAOZHOU_ALLEY,
    facts: [
      { label: '范围', value: '牌坊街、开元寺、广济楼、广济桥都在韩江西岸的古城里，彼此步行可达' },
      {
        label: '步行距离',
        value: '牌坊街到开元寺约 7 分钟，开元寺到广济楼约 3 分钟，广济楼到广济桥约 1 分钟',
      },
      { label: '过江', value: '韩文公祠、泰佛殿在韩江东岸，需要过桥或打车衔接' },
      { label: '吃街', value: '西马路小吃街与南较路美食街都在古城边缘，适合放在午后和夜里' },
      { label: '住哪', value: '住古城附近最省时间，多数点位步行就能到' },
    ],
    sections: [
      {
        heading: '上午：先把牌坊街走一遍',
        body: [
          '牌坊街是古城的主街，牌坊、骑楼和小吃摊挤在同一条路上。上午人少、光也柔，适合先把它从头走到尾，再拐进旁边的开元寺。',
          '街边卖的东西密度很高，别在第一家就停下——留一点胃口给后面。',
        ],
      },
      {
        heading: '开元寺与广济楼',
        body: [
          '开元寺在牌坊街侧后，殿宇、庭院和廊下的石刻保存得完整，进门之后会突然安静下来。',
          '出寺往东是广济楼，城楼和城墙连在一起，是这一带最好认的地标。上楼可以看古城屋顶，楼前就是韩江。',
        ],
      },
      {
        heading: '广济桥：中间一段是浮船',
        body: [
          '广济桥横在韩江上，最特别的是中段由一排梭船连成，桥面靠船托着。站在桥上看江，比在岸上看桥更有意思。',
          '桥与广济楼只隔一条街，过马路就到，不需要另外安排交通。',
        ],
      },
      {
        heading: '过江：韩文公祠与泰佛殿',
        body: [
          '从广济桥往东岸走，可以接上韩文公祠；再往东南是泰佛殿，金色尖顶和古城的中式屋顶完全是两种样子。',
          '这两段建议打车衔接，把体力留给返程。傍晚回到江边，正好接上夜景。',
        ],
      },
      {
        heading: '收尾：西湖与夜里的吃街',
        body: [
          '傍晚往城西北走到潮州西湖，绕湖一圈不长，树多、风也凉。',
          '晚上回到牌坊街一带，西马路小吃街和南较路美食街可以一路吃过去；吃完再走一段江边，古城的一天就算走完了。',
        ],
      },
      {
        heading: '怎么到这里',
        body: [
          '高铁到潮汕站，再转公交或打车进古城。飞机落地揭阳潮汕机场，机场有进城的快线。',
          '班次和打车时间每天都可能不一样，出发前查一次当天信息。',
        ],
      },
    ],
    route: {
      intro: '按「先城内步行、再过江、最后回城吃」的顺序排，三段之间各有一段短途车。',
      segments: [
        {
          label: '上午 · 城内步行',
          area: '韩江西岸 · 古城',
          stops: [
            { label: '牌坊街', note: '主街' },
            { label: '开元寺', note: '步行约 7 分钟' },
            { label: '广济楼', note: '步行约 3 分钟' },
            { label: '广济桥', note: '步行约 1 分钟' },
          ],
        },
        {
          label: '下午 · 过江再回城',
          area: '韩江东岸 → 城西北',
          stops: [
            { label: '韩文公祠' },
            { label: '泰佛殿', note: '打车衔接' },
            { label: '潮州西湖', note: '傍晚' },
          ],
        },
        {
          label: '晚上 · 回城吃东西',
          area: '古城西侧',
          stops: [
            { label: '西马路小吃街' },
            { label: '南较路美食街' },
            { label: '江边夜景', note: '灯光安排以现场为准' },
          ],
        },
      ],
    },
    food: [
      { glyph: 'hotpot', name: '牛肉火锅', note: '按部位点，涮的时间问店家，别自己掐表' },
      { glyph: 'beefball', name: '牛肉丸', note: '街边小摊和火锅店都有，咬开看断面' },
      { glyph: 'kwayteow', name: '粿条', note: '米浆蒸出来的主食，汤、炒、干拌都常见' },
      { glyph: 'rice-roll', name: '肠粉', note: '早餐和宵夜都能买到，酱汁偏甜' },
      { glyph: 'goose', name: '卤鹅', note: '潮州卤味的主角，配蒜泥醋解腻' },
      { glyph: 'tea', name: '工夫茶', note: '走累了坐下来喝一轮，三个小杯' },
    ],
    photos: [GUANGJI_BRIDGE, KANGHU_TEA],
    cautions: [
      '广济桥是收费景区，票价、开放时段和临时检修都以现场公告为准。',
      '韩文公祠等场馆可能要求线上预约，出发前查官方渠道。',
      '夜间的灯光与演出属于临时安排，本文不写具体时间。',
      '步行距离来自公开攻略里标注的估算，门牌与街巷会变，以现场指示为准。',
    ],
    evidenceIds: [
      'guide-65cd9710000000000b00de02',
      'guide-62da1f210000000012005912',
      'guide-66eea372000000000c018336',
      'guide-6860fc69000000001c033f46',
      'guide-6892fadc000000002203b7c4',
    ],
  },
  {
    id: 'guangji-bridge',
    city: '潮州',
    theme: '古城',
    eyebrow: '古城地标 · 半日',
    title: '广济桥与广济楼：一座浮桥怎么走',
    dek: '广济楼在岸上，广济桥在江上，两者只隔一条街。看完桥再看楼，或者反过来，都不超过两个小时。',
    duration: '2–3 小时（含过江）',
    season: '全年；晴天看桥身倒影，夜里看灯',
    cover: GUANGJI_BRIDGE,
    facts: [
      { label: '位置', value: '广济楼在西岸，广济桥横跨韩江，楼与桥隔街相对' },
      { label: '结构', value: '桥的中段由一排梭船连成，桥面靠船托着，可以步行通过' },
      { label: '过江', value: '过桥是韩江东岸，韩文公祠、泰佛殿在这一侧' },
      { label: '衔接', value: '从牌坊街步行到广济楼约 3 分钟，再 1 分钟就到桥头' },
      { label: '遮阴', value: '桥面几乎没有遮阴，正午和雨天不适合久留' },
    ],
    sections: [
      {
        heading: '先看桥，还是先看楼',
        body: [
          '楼在岸上，可以上去看屋顶和江面；桥在江上，要走一遍才知道它的长度。',
          '晴天先楼后桥，光线顺；逆光时反过来走，桥亭的轮廓会更清楚。',
        ],
      },
      {
        heading: '桥中间那排船',
        body: [
          '广济桥最特别的是中段：一排梭船并排连成浮桥，桥面就架在船上。',
          '桥面不宽，人多的时候不要停在中间拍照，往后走几步再停。',
        ],
      },
      {
        heading: '过江之后往哪走',
        body: [
          '过桥就是东岸，韩文公祠在这一侧，再往东南是泰佛殿。',
          '不想走远，就在桥头看江、看对岸的城墙线，也够了。',
        ],
      },
      {
        heading: '什么时候来',
        body: [
          '早上人少、光线平，适合拍照；傍晚可以等灯亮。',
          '灯光与开放时段每年会调整，出发前看一次景区公告。',
        ],
      },
    ],
    route: {
      intro: '一条很短的线：楼、桥、江对岸，中间只有步行。',
      segments: [
        {
          label: '西岸到桥上',
          area: '韩江西岸',
          stops: [
            { label: '广济楼', note: '先上楼' },
            { label: '广济桥', note: '步行约 1 分钟' },
            { label: '浮桥段', note: '梭船连成' },
            { label: '桥头', note: '看江' },
          ],
        },
        {
          label: '过江之后',
          area: '韩江东岸',
          stops: [
            { label: '韩文公祠' },
            { label: '泰佛殿', note: '打车衔接' },
          ],
        },
      ],
    },
    food: [
      { glyph: 'tea', name: '工夫茶', note: '江边走完坐下来喝一轮' },
      { glyph: 'kwayteow', name: '粿条', note: '回城路上最顺手的一碗' },
    ],
    photos: [CHAOZHOU_ALLEY],
    cautions: [
      '广济桥是收费景区，票价、开放时段与临时关闭都以现场公告为准。',
      '桥面靠船托着，雨天湿滑，穿防滑的鞋。',
      '桥上风大，带小孩时牵好手。',
      REUSED_CAUTION,
    ],
    evidenceIds: [
      'guide-65cd9710000000000b00de02',
      'guide-62da1f210000000012005912',
      'guide-6860fc69000000001c033f46',
    ],
  },
  {
    id: 'paifang-street',
    city: '潮州',
    theme: '古城',
    eyebrow: '古城步行 · 半天',
    title: '牌坊街、开元寺与两条吃街',
    dek: '牌坊街是古城的主街，开元寺在它侧后，西马路和南较路在两端。半天走完，剩下时间用来吃。',
    duration: '半天（3–4 小时）',
    season: '全年；夜里街上更热闹',
    cover: CHAOZHOU_ALLEY,
    facts: [
      { label: '主街', value: '牌坊街是古城主街，牌坊、骑楼和小吃摊在同一条路上' },
      { label: '开元寺', value: '在牌坊街侧后，从主街步行约 7 分钟' },
      { label: '吃街', value: '西马路小吃街与南较路美食街分在古城两侧，都在步行范围' },
      { label: '顺路点位', value: '青龙古庙、许驸马府、海阳儒学宫在攻略地图上也标在附近' },
      { label: '节奏', value: '街上小吃密度高，别在第一家吃满' },
    ],
    sections: [
      {
        heading: '牌坊街：白天看牌坊，晚上看灯',
        body: [
          '牌坊一座接一座立在街心，两侧是骑楼。白天看清石刻与字，晚上看灯和人气。',
          '同一段街白天和晚上是两种样子，时间够就走两遍。',
        ],
      },
      {
        heading: '开元寺：进门会安静下来',
        body: [
          '从主街拐进去几分钟就到。殿宇、庭院、廊下的石刻都在，进门之后音量会自然降低。',
          '寺里不要大声说话，也不要对着礼佛的人举相机。',
        ],
      },
      {
        heading: '西马路与南较路：两条吃街怎么分',
        body: [
          '西马路小吃街偏小吃，边走边吃；南较路美食街更像坐下来吃一顿的地方。',
          '两条街分在古城两端，不用一次走完，按当天的胃口选一条。',
        ],
      },
      {
        heading: '顺路的小点位',
        body: [
          '青龙古庙、许驸马府、海阳儒学宫在攻略地图上标得很近，走累了就挑一个进去歇脚。',
          '这些点位的开放情况会变，到门口看告示。',
        ],
      },
    ],
    route: {
      intro: '主街一条，吃街两条，中间用步行串起来。',
      segments: [
        {
          label: '步行主线',
          area: '古城中部',
          stops: [
            { label: '牌坊街' },
            { label: '开元寺', note: '步行约 7 分钟' },
            { label: '青龙古庙', note: '顺路' },
          ],
        },
        {
          label: '两条吃街',
          area: '古城两端',
          stops: [
            { label: '西马路小吃街', note: '边走边吃' },
            { label: '南较路美食街', note: '坐下来吃' },
          ],
        },
      ],
    },
    food: [
      { glyph: 'beefball', name: '牛肉丸', note: '小摊上最常见的一串' },
      { glyph: 'rice-roll', name: '肠粉', note: '早餐摊的常客，酱汁偏甜' },
      { glyph: 'goose', name: '卤鹅', note: '切一盘配茶' },
      { glyph: 'tea', name: '工夫茶', note: '街边铺子就能坐下喝' },
    ],
    photos: [KANGHU_TEA],
    cautions: [
      '寺内与庙内请勿大声喧哗，拍摄前先征得同意。',
      '小吃摊的营业时间不固定，早市与夜市差别很大。',
      '街上人多，注意随身物品。',
      REUSED_CAUTION,
    ],
    evidenceIds: [
      'guide-65cd9710000000000b00de02',
      'guide-62da1f210000000012005912',
      'guide-66eea372000000000c018336',
      'guide-6a184f50000000003701dc08',
    ],
  },
  {
    id: 'shantou-old-city',
    city: '汕头',
    theme: '古城',
    eyebrow: '老城步行 · 一天',
    title: '汕头老城一天：小公园骑楼、开埠街区与英歌',
    dek: '汕头的好，一半在骑楼的灰塑和窗棂里，一半在街边那碗汤里。这条线几乎全程步行，只在最后坐一次轮渡。',
    duration: '1 天（步行 6–8 公里）',
    season: '全年；春末与秋天最舒服，夏天避开正午',
    cover: YINGGE_PARADE,
    facts: [
      { label: '核心', value: '老城以小公园亭为中心，骑楼街从这里放射出去' },
      {
        label: '步行动线',
        value: '汕头旅社、邮政总局、老妈宫戏台、开埠文化陈列馆、西堤公园都在步行范围',
      },
      { label: '过海', value: '广场轮渡是当地人也会坐的过海交通，班次以码头公告为准' },
      { label: '另排半天', value: '潮博馆、礐石风景区在海湾另一侧，和这条线不在同一片' },
      { label: '民俗', value: '英歌与营老爷是这一带年节最常见的两种场面，日子按村社和年份定' },
    ],
    sections: [
      {
        heading: '从小公园开始',
        body: [
          '小公园亭是这片街区的中心，几条骑楼街从亭子四周放射出去。先绕亭一圈看立面，再随便挑一条街走进去。',
          '骑楼的好看处在二楼：灰塑、彩色玻璃、旧招牌和铁栏杆，走在骑楼下反而容易错过。',
        ],
      },
      {
        heading: '四条老街串起来',
        body: [
          '老妈宫戏台、邮政总局、汕头旅社、开埠文化陈列馆彼此只隔几个路口，顺着走一遍就是半天。',
          '戏台前的空地常有人坐着聊天；邮政总局的钟楼和立面是这一带最好认的地标。',
        ],
      },
      {
        heading: '走到西堤看海',
        body: [
          '西堤公园在海边，傍晚风大，适合收尾。旁边的潮人码头和广场轮渡可以连成一段。',
          '坐船过海再回来，是看老城天际线的另一种角度，票价和班次以码头现场为准。',
        ],
      },
      {
        heading: '年节才有的场面',
        body: [
          '正月前后，英歌队会在街头列队行进，鼓点一起，整条街都会让开。脸谱、双槌和步法是同一套节奏里的东西。',
          '英歌在 2006 年以「英歌」列入第一批国家级非遗名录；同一时期各村社也会营老爷，队伍抬着神轿走遍村中道路。',
        ],
        link: { to: '/museum/yingge', label: '去英歌展厅看脸谱、双槌与阵形' },
      },
      {
        heading: '吃：一锅牛肉，一碗粿条',
        body: [
          '汕头人吃牛肉火锅讲究部位和下锅顺序，中午前后到店更容易坐到位置。',
          '街上粿条汤、蚝烙、卤鹅都好找，夜里还有白粥配小炒。',
        ],
      },
    ],
    route: {
      intro: '整条线从北往南走，最后在海边收尾；只有过海那一段需要坐船或打车。',
      segments: [
        {
          label: '上午 · 骑楼老城',
          area: '小公园一带',
          stops: [
            { label: '老妈宫戏台' },
            { label: '汕头小公园', note: '亭子周边' },
            { label: '邮政总局' },
            { label: '汕头旅社' },
          ],
        },
        {
          label: '下午 · 开埠街区到海边',
          area: '老城西南 → 西堤',
          stops: [
            { label: '开埠文化陈列馆' },
            { label: '西堤公园', note: '海边' },
            { label: '潮人码头' },
            { label: '广场轮渡', note: '过海' },
          ],
        },
      ],
    },
    food: [
      { glyph: 'hotpot', name: '牛肉火锅', note: '按部位分盘，先瘦后肥，汤底别一直滚' },
      { glyph: 'beefball', name: '牛肉丸', note: '手打工艺 2018 年列入广东省级非遗' },
      { glyph: 'kwayteow', name: '粿条汤', note: '一碗下去最顶饱，早餐到宵夜都有' },
      { glyph: 'oyster', name: '蚝烙', note: '地瓜粉、蚝与蛋，趁热吃' },
      { glyph: 'porridge', name: '夜粥', note: '白粥配杂咸和小炒，夜里才热闹' },
      { glyph: 'tea', name: '工夫茶', note: '吃完油腻的菜，一泡茶正好' },
    ],
    photos: [YINGGE_DETAIL, BEEF_BALL_SOUP],
    cautions: [
      '英歌、营老爷按村社与年份安排，本文不写具体日期和场次。',
      '广场轮渡的班次与票价以码头公告为准。',
      '骑楼街区仍有人居住，拍照前打个招呼，不要堵在门口。',
      '老城部分路段在修缮，绕行以现场指示为准。',
    ],
    evidenceIds: [
      'guide-694fa85b0000000022032cab',
      'guide-6860fc69000000001c033f46',
      'guide-689314b3000000002501d2a5',
      'guide-6a1c24fe0000000008002808',
      'guide-68272733000000002102f017',
      'guide-699d0efc000000000903a4c0',
      'guide-69ce81f5000000001a0267d5',
    ],
    stationRefs: ['yingge-intro', 'yingge-in-yinglaoye', 'ylr-time'],
  },
  {
    id: 'nanao-island',
    city: '汕头',
    theme: '海岛',
    eyebrow: '海岛 · 一天到两天',
    title: '南澳岛看海：过桥之后，按西线东线走',
    dek: '南澳的看点沿环岛路一字排开，顺序比速度重要。这篇只排点位与节奏，不写船班和实时路况。',
    duration: '1 天环岛，或 2 天住一晚',
    season: '春末到秋天看海最好；冬天风大，体感偏冷',
    facts: [
      { label: '进岛', value: '走南澳大桥进岛，桥很长，过桥本身就是一段风景' },
      { label: '分布', value: '灯塔、地质公园和沙滩分在西线、东线两段，中间隔着山路' },
      { label: '交通', value: '岛内以自驾或包车为主，也有环岛公交；班次以现场为准' },
      { label: '沙滩', value: '青澳湾在北回归线标志塔附近，沙滩开阔、人也最多' },
      { label: '公路', value: '2 号公路是沿海的一段路，风景在路上，不在某个点' },
    ],
    sections: [
      {
        heading: '先过桥，再往西线走',
        body: [
          '过南澳大桥之后先别急着赶路，桥和桥下的海值得看一会儿。',
          '西线的节奏是灯塔接灯塔：长山尾灯塔在桥头附近，田仔地质公园是礁石海岸，再往前是钱澳湾灯塔、海丝广场和海泉湾。',
        ],
      },
      {
        heading: '东线：三囱崖、自然之门、青澳湾',
        body: [
          '东线更开阔。三囱崖灯塔立在崖边，自然之门是北回归线标志，再往前就是青澳湾的沙滩。',
          '风车山和 2 号公路放在回程路上，适合当作收尾，不用专门折返。',
        ],
      },
      {
        heading: '节奏：一天看得完，两天才够慢',
        body: [
          '一天环岛能把主要点位走完，但大部分时间在车上。',
          '住一晚的好处是能赶一次日出或日落，也不用担心回程太晚。岛上住宿在旺季紧张，尽量提前订。',
        ],
      },
      {
        heading: '天气比行程更重要',
        body: [
          '海岛的风浪、能见度和体感变化都很快。出发前看天气预报，遇到大风或降雨就把灯塔段换成镇上的行程。',
          '海边拍照别踩湿滑的礁石，浪打上来的时间没有规律。',
        ],
      },
    ],
    route: {
      intro: '过桥之后按「西线 → 东线 → 回程公路」的顺序走，两个方向不要来回折返。',
      segments: [
        {
          label: '西线 · 过桥之后',
          area: '桥头 → 西岸',
          stops: [
            { label: '南澳大桥' },
            { label: '长山尾灯塔' },
            { label: '田仔地质公园' },
            { label: '钱澳湾灯塔' },
            { label: '海丝广场' },
            { label: '海泉湾' },
          ],
        },
        {
          label: '东线 · 看海与回程',
          area: '东岸 → 环岛路',
          stops: [
            { label: '三囱崖灯塔' },
            { label: '自然之门', note: '北回归线标志' },
            { label: '青澳湾沙滩' },
            { label: '风车山' },
            { label: '2 号公路', note: '沿海路段' },
            { label: '彩虹海' },
          ],
        },
      ],
    },
    food: [
      { glyph: 'oyster', name: '蚝与贝类', note: '岛上和汕头市区都好找，注意新鲜度' },
      { glyph: 'porridge', name: '海鲜粥', note: '一锅粥配几样小炒，适合玩完水之后' },
      { glyph: 'kwayteow', name: '粿条', note: '岛上也有，早餐最稳' },
    ],
    photos: [],
    photosNote:
      '站内没有可用的南澳海岸实拍，所以这篇不配照片，也不用示意图冒充现场——只看路线与文字。',
    cautions: [
      '过桥、轮渡与环岛公交的时刻和是否运营以当天公告为准，本文不写班次。',
      '没有救生员的区域不要下水，礁石湿滑，浪况变化快。',
      '旺季岛上加油、充电与住宿都紧张，行程要留余量。',
      '大风或强降雨时，部分路段与观景台会临时封闭。',
    ],
    evidenceIds: [
      'guide-6a0595970000000038034924',
      'guide-6860fc69000000001c033f46',
      'guide-69ce81f5000000001a0267d5',
      'guide-6897480b0000000022021a2d',
      'guide-67dbecb0000000001e007e24',
    ],
  },
  {
    id: 'jieyang-old-city',
    city: '揭阳',
    theme: '古城',
    eyebrow: '古城半日 · 老城',
    title: '揭阳古城半日：进贤门与骑楼老街',
    dek: '揭阳常被当成中转站，其实老城本身就值得留半天。城门、骑楼和年节民俗都在步行范围里。',
    duration: '半天（3–4 小时）',
    season: '全年；春节前后民俗最集中，人也最多',
    cover: YINGLAOYE_PROCESSION,
    facts: [
      { label: '落地', value: '揭阳潮汕机场就在揭阳市境内，不少行程从落地揭阳开始' },
      { label: '老城', value: '看点集中在进贤门一带，步行加短途打车就能串完' },
      { label: '接驳', value: '潮汕站与机场之间有大巴，班次与是否收费以现场为准' },
      { label: '民俗', value: '年节期间英歌、营老爷会在老城与周边村社出现，日子各村不同' },
      { label: '衔接', value: '机场到潮州约 40 分钟车程，适合把揭阳放在第一天或最后一天' },
    ],
    sections: [
      {
        heading: '从进贤门进城',
        body: [
          '进贤门是老城最容易被认出的门楼，穿过它就算进了老城。门前有一小片空地，早上有早点摊。',
          '城门本身不大，但它是这条半日线的起点，也是最好找的集合点。',
        ],
      },
      {
        heading: '骑楼街的日常',
        body: [
          '老城的骑楼街没有太多为游客准备的店，更多是布行、杂货和修车铺。',
          '抬头看二楼：栏杆、窗棂和外墙的旧字，才是这条街最好看的部分。',
        ],
      },
      {
        heading: '年节再来一次',
        body: [
          '春节前后，老城和周边村社会出现英歌、营老爷之类的场面，锣鼓和队伍会占掉半条街。',
          '这类活动的日期每年不同，只有看当地公告才知道；碰上了就停下来看完一段。',
        ],
        link: { to: '/museum/yinglaoye', label: '站内「营老爷」章节：仪式、队伍与观礼提醒' },
      },
      {
        heading: '顺路衔接',
        body: [
          '揭阳和潮州、汕头都在一小时上下，最合适的用法是「落地先进老城，再往南走」。',
          '如果只有半天，别硬塞景点，进贤门到骑楼街这一段走完就够了。',
        ],
      },
    ],
    route: {
      intro: '城内是连续的步行段；年节那一段的路线每年都不同，只给位置性质，不给具体日期。',
      segments: [
        {
          label: '城内步行',
          area: '进贤门一带',
          stops: [
            { label: '进贤门', note: '起点' },
            { label: '老城骑楼街', note: '沿街慢走' },
            { label: '沿街小吃', note: '早点与粿品' },
          ],
        },
        {
          label: '年节加一段',
          area: '老城与周边村社',
          stops: [
            { label: '民俗巡游', note: '日期与路线以当年公告为准' },
            { label: '村社庙口', note: '按村安排' },
          ],
        },
      ],
    },
    food: [
      { glyph: 'kwayteow', name: '粿条与粿品', note: '早餐摊最常见，米做的，顶饱' },
      { glyph: 'goose', name: '卤鹅', note: '潮汕各地都吃，切盘配蒜泥醋' },
      { glyph: 'beefball', name: '牛肉丸', note: '汤里、火锅里都常见' },
      { glyph: 'tea', name: '工夫茶', note: '街边铺子里就能坐下来喝一轮' },
    ],
    photos: [],
    photosNote:
      '站内只有题图这一张潮汕营老爷实拍（不特指揭阳），没有更多可用的揭阳老城照片，所以不再重复放图。',
    cautions: [
      '民俗活动按村社与年份安排，本文不写日期、路线与场次。',
      '潮汕站到机场的接驳方式与是否收费会调整，出发前确认。',
      '老城仍是居民区，进入巷子拍摄前先征得同意。',
      '部分老建筑在修缮，能否入内以现场为准。',
    ],
    evidenceIds: [
      'guide-69971f03000000000b011c86',
      'guide-6a16c2dd0000000007022760',
      'guide-697b1eab000000002801e824',
      'guide-699e8835000000001a028254',
      'guide-68843f26000000001c03271d',
      'guide-699d0efc000000000903a4c0',
    ],
    stationRefs: ['ylr-xunjing', 'ylr-time', 'ylr-visit'],
  },
  {
    id: 'puning-night-procession',
    city: '揭阳',
    theme: '民俗',
    eyebrow: '民俗 · 夜里',
    title: '普宁营老爷：夜里的绕村队伍',
    dek: '普宁的营老爷多在夜里进行，青壮年抬着神轿走遍村里的大路小巷。看的时候，站边上就好。',
    duration: '一晚（按当年日程）',
    season: '农历正月前后，各村轮流',
    cover: YINGLAOYE_PROCESSION,
    facts: [
      { label: '词义', value: '潮州话里「老爷」指神，「营」是环绕、周游' },
      { label: '时间', value: '普宁的营老爷在晚上进行，一般从农历正月开始，各村轮流「闹热」' },
      { label: '队伍', value: '青壮年抬八抬大轿，队伍里有标手、牌手、轿夫、乐手' },
      { label: '路线', value: '走遍村里的大路和小巷，不是固定的一条舞台动线' },
      { label: '年份', value: '具体日子按村与年份定，没有全潮汕通用的日程' },
    ],
    sections: [
      {
        heading: '「营」是绕着走',
        body: [
          '潮州话里「老爷」是神，「营」是环绕、周游。营老爷就是抬着神像绕村巡游，祈求平安。',
          '正因为是绕着走，队伍会经过住家、巷口和庙前，路线本身就是仪式的一部分。',
        ],
      },
      {
        heading: '队伍里都有谁',
        body: [
          '普宁的页面写到标手（扛标旗）、牌手（举牌）、轿夫、乐手，青壮年抬八抬大轿。',
          '各村组合不完全一样，有的地方还会请乐队或英歌队助兴。',
        ],
      },
      {
        heading: '站在哪里看',
        body: [
          '站在路边、让出中间的路，是最稳妥的位置。不要挡轿、不要挤进队伍，也不要伸手去碰神像与器物。',
          '这是村民为祈愿办的仪式，不是为游客表演的节目；看完一段就可以离开。',
        ],
      },
      {
        heading: '怎么知道哪天有',
        body: [
          '只能看当地公告与村口通知。同一个镇里各村轮流，日期前后能差好几天。',
          '本文不写任何具体日期，也不写今年谁家「闹热」。',
        ],
        link: { to: '/museum/yinglaoye', label: '站内「营老爷」章节：称呼、队伍与观礼提示' },
      },
    ],
    route: {
      intro: '夜里的一条环线：从庙口出发，绕村一周再回来。具体走法每年按村安排。',
      segments: [
        {
          label: '夜里的绕村',
          area: '普宁 · 村内',
          stops: [
            { label: '庙口', note: '集合与起驾' },
            { label: '村中大路' },
            { label: '村中小巷' },
            { label: '回到庙口', note: '按村安排' },
          ],
        },
      ],
    },
    food: [
      { glyph: 'goose', name: '卤鹅', note: '年节供桌上常见，也会切盘待客' },
      { glyph: 'kwayteow', name: '粿条', note: '夜里收队后最顺手的一碗' },
      { glyph: 'tea', name: '工夫茶', note: '等队伍时，主人家会递一杯' },
    ],
    photos: [],
    photosNote:
      '题图是潮汕地区营老爷的实拍，不特指普宁某村某场；站内没有第二张可用的夜间记录，就不再重复放图。',
    cautions: [
      '活动日期、起驾时间与路线以各村的当年公告为准，本文不写具体日程。',
      '夜间村道照明有限，跟队伍时注意脚下与摩托。',
      '不要挡轿、不要进入队伍、不要触碰神像与标旗。',
      '拍摄前先征得同意，尤其不要用闪光灯直打脸。',
    ],
    evidenceIds: [
      'guide-69971f03000000000b011c86',
      'guide-699d0efc000000000903a4c0',
      'guide-697ca9d2000000002202ca44',
    ],
    stationRefs: ['ylr-case-puning', 'ylr-team', 'ylr-time', 'ylr-visit', 'ylr-name'],
  },
  {
    id: 'yingge-watch',
    city: '汕头',
    theme: '民俗',
    eyebrow: '民俗 · 现场',
    title: '英歌怎么看：脸谱、双槌与队伍',
    dek: '英歌不只是「一支舞」：脸谱、双槌、锣鼓和队形同时发生。先看身体怎么动，再听声音怎么给。',
    duration: '一场巡游（按现场）',
    season: '年节期间最常见',
    cover: YINGGE_PARADE,
    facts: [
      { label: '名录', value: '2006 年以「英歌」列入第一批国家级非遗名录，编号 Ⅲ—8' },
      { label: '构成', value: '双槌、步法、锣鼓与队形同时发生，缺一样都不完整' },
      { label: '节奏', value: '潮阳英歌按节奏分慢板、中板、快板三类，鼓点循环与成组槌数不同' },
      { label: '队形', value: '双列、方形阵、双龙出海等队形名称出自汕头市地方标准' },
      { label: '角色', value: '头槌、二槌、引舞、指挥、舞队与乐队各司其职' },
    ],
    sections: [
      {
        heading: '先看脸谱与头饰',
        body: [
          '脸谱把角色写在脸上，头饰和戏服再把身份补齐。近看能分辨出不同的谱式，远看则是一片色块在移动。',
          '别只盯着最前面的人，队伍里每个人的妆都不一样。',
        ],
      },
      {
        heading: '双槌怎么打',
        body: [
          '英歌队员手里是两根木槌，敲击成组，配合鼓点循环。槌声是节奏，不是伴奏。',
          '看的时候留意「成组」：一组几下、什么时候换边，比单看动作更容易跟上。',
        ],
      },
      {
        heading: '队形与指挥',
        body: [
          '队形会随路段变化，引舞和指挥在前头给信号。双列、方形阵这些名字来自汕头市地方标准列出的基础队形。',
          '不同队伍的鼓谱与阵形并不统一，同一个名字在两地可能长得不一样。',
        ],
      },
      {
        heading: '看的时候注意',
        body: [
          '站在路两侧，把中间让出来。队伍行进时不突然横穿，也不要伸手去碰槌和头饰。',
          '锣鼓声很响，带小孩或对声音敏感的人往后退两步。',
        ],
        link: { to: '/museum/yingge', label: '站内「英歌」展厅：角色、阵形与器物拆解' },
      },
    ],
    route: {
      intro: '不是地理路线，是队伍行进时的前后位置——站对了地方，能看到完整的节奏。',
      segments: [
        {
          label: '队伍的行进顺序',
          area: '巡游现场',
          stops: [
            { label: '引舞与指挥', note: '队首' },
            { label: '头槌与二槌' },
            { label: '舞队', note: '双列或方阵' },
            { label: '锣鼓队', note: '节奏' },
          ],
        },
      ],
    },
    food: [],
    photos: [YINGGE_DETAIL],
    cautions: [
      '英歌出场按村社与年份安排，本文不写日期、场次与队伍名。',
      '巡游路段会临时管制，绕行以现场指示为准。',
      '不要进入队伍、不要挡镜头给队员造成干扰。',
      '锣鼓声大，注意保护听力与小孩。',
    ],
    evidenceIds: [
      'guide-699d0efc000000000903a4c0',
      'guide-699e8835000000001a028254',
      'guide-6860fc69000000001c033f46',
    ],
    stationRefs: ['yingge-intro', 'yingge-watch', 'yingge-schools', 'yingge-formation', 'yingge-role'],
  },
  {
    id: 'kungfu-tea',
    city: '潮汕',
    theme: '民俗',
    eyebrow: '日常 · 一泡茶',
    title: '工夫茶：三个杯，一泡茶的顺序',
    dek: '潮汕人吃完饭要喝一泡茶。器具不大，环节不少；在别人家喝茶，跟着主人的节奏就好。',
    duration: '一泡茶（20–30 分钟）',
    season: '全年',
    cover: KANGHU_TEA,
    facts: [
      {
        label: '名录',
        value: '2008 年以「潮州工夫茶艺」列入第二批国家级非遗名录（编号 Ⅹ-107），申报地区为潮州市',
      },
      { label: '茶品', value: '以乌龙茶为主要茶品' },
      {
        label: '环节',
        value: '项目页把冲泡拆成二十余个环节：净手、生火煮水、热罐温盅、纳茶洗茶、高冲、刮沫淋盖、烫杯、低洒分茶、闻香等',
      },
      { label: '器物', value: '泥炉、砂铫、榄炭、茶罐、茶盅、壶与杯' },
      { label: '说法', value: '分茶动作被称作「关公巡城」「韩信点兵」' },
    ],
    sections: [
      {
        heading: '三个杯，一轮',
        body: [
          '茶盘上通常只摆三个小杯，一轮喝完再冲下一泡。杯子小，是为了让茶汤浓、凉得快。',
          '喝的时候一口或两口喝完，把杯子放回茶盘，主人会接着冲。',
        ],
      },
      {
        heading: '家里常做的那几步',
        body: [
          '项目页列了二十余个环节，家里日常会简化：温杯、纳茶、洗茶、高冲、分茶。',
          '高冲是为了让茶叶翻滚，分茶要低、要匀，壶底最后几滴也要分完。',
        ],
      },
      {
        heading: '在别人家喝茶',
        body: [
          '接杯可以用双手，喝完放回茶盘靠中间的位置。不要自己伸手去拿壶。',
          '不想再喝就把杯子留在盘上，主人自然明白，不必反复推辞。',
        ],
      },
      {
        heading: '想看完整的程式',
        body: [
          '站内工夫茶模块把器物、步骤和动作名拆开讲，看一遍再去喝会更明白。',
          '不同家庭、不同茶庄的做法并不统一，本文只写公开资料里共同出现的部分。',
        ],
        link: { to: '/museum/tea', label: '站内「工夫茶」模块：器物、步骤与分茶说法' },
      },
    ],
    route: {
      intro: '一泡茶的顺序，用节点表示；实际动手时环节可以合并。',
      segments: [
        {
          label: '一泡茶的顺序',
          area: '茶盘上',
          stops: [
            { label: '温杯', note: '热罐温盅' },
            { label: '纳茶', note: '投茶' },
            { label: '洗茶', note: '快速出汤' },
            { label: '高冲', note: '提铫' },
            { label: '分茶', note: '低洒、分匀' },
          ],
        },
      ],
    },
    food: [{ glyph: 'tea', name: '工夫茶', note: '乌龙茶为主，三个小杯一轮' }],
    photos: [],
    photosNote: '题图就是站内已登记的工夫茶实拍（茶壶与三只杯）；没有第二张可用的茶席照片，就不再重复放图。',
    cautions: [
      '项目页列出的环节与器物是名录描述，不等于每个家庭的做法。',
      '热壶热水，递给别人时先提醒；小孩不要自己倒。',
      '空腹喝浓茶容易不适，按自己的量来。',
      REUSED_CAUTION,
    ],
    evidenceIds: [],
    stationRefs: ['tea-intro', 'tea-steps', 'tea-ware', 'tea-pour', 'tea-spread'],
  },
  {
    id: 'first-trip',
    city: '潮汕',
    theme: '路线',
    eyebrow: '行程 · 三地怎么选',
    title: '第一次来潮汕：三地怎么选',
    dek: '潮州看古城，汕头看老城与海，揭阳看日常与年节。先决定这趟要哪一种，再谈排几天。',
    duration: '选线（配 2–5 天）',
    season: '全年；春节民俗最集中，暑假最热',
    cover: CHAOZHOU_ALLEY,
    facts: [
      { label: '落地', value: '主要入口是揭阳潮汕机场和潮汕站（在潮州潮安）' },
      { label: '接驳', value: '机场到潮州约 40 分钟车程，机场与潮汕站之间有大巴' },
      { label: '移动', value: '潮州、汕头、揭阳三地互相之间都在一小时上下' },
      { label: '三地差异', value: '潮州偏古城、汕头偏老城与海、揭阳偏日常与年节民俗' },
      { label: '住哪', value: '住古城或老城附近最省时间，换酒店次数越少越轻松' },
    ],
    sections: [
      {
        heading: '潮州：古城能走',
        body: [
          '牌坊街、开元寺、广济楼、广济桥挤在步行范围里，一天就能走完主干。',
          '喜欢古建、街巷和慢慢吃的人，把潮州当第一站最合适。',
        ],
      },
      {
        heading: '汕头：老城与海',
        body: [
          '小公园一带是骑楼老城，往南走到西堤就是海，广场轮渡可以过海。',
          '想同时看城市和海岸线，选汕头；想看沙滩，再从汕头去南澳。',
        ],
      },
      {
        heading: '揭阳：日常与年节',
        body: [
          '进贤门一带的老城商业气更淡，骑楼街还是本地人的日常。',
          '年节时民俗最集中，但它不是「景点密度高」的城市，留半天到一天就够。',
        ],
      },
      {
        heading: '怎么决定',
        body: [
          '只有一天：选潮州，走古城。想要海：选汕头加南澳。想过年看民俗：选揭阳或潮州。',
          '具体到每天怎么排，另有一篇按天数给顺序。',
        ],
      },
    ],
    route: {
      intro: '这不是先后顺序，是按兴趣三选一的对照；虚线之外的那一段才是三地串联。',
      segments: [
        {
          label: '按兴趣三选一',
          area: '潮州 / 汕头 / 揭阳',
          stops: [
            { label: '潮州古城', note: '古建与街巷' },
            { label: '汕头老城', note: '骑楼与海' },
            { label: '揭阳老城', note: '日常与年节' },
          ],
        },
        {
          label: '三地怎么串',
          area: '机场 → 潮州 → 汕头 → 南澳',
          stops: [
            { label: '揭阳潮汕机场' },
            { label: '潮州古城' },
            { label: '汕头老城' },
            { label: '南澳岛', note: '可选' },
          ],
        },
      ],
    },
    food: [
      { glyph: 'hotpot', name: '牛肉火锅', note: '三地都有，汕头与潮州更集中' },
      { glyph: 'kwayteow', name: '粿条', note: '早餐首选，几乎每条街都有' },
      { glyph: 'goose', name: '卤鹅', note: '切一盘当加菜' },
      { glyph: 'tea', name: '工夫茶', note: '吃完饭坐下来喝一轮' },
    ],
    photos: [KANGHU_TEA, CUISINE_TABLE],
    cautions: [
      '班次、票价与开放时间都会变，本文只给选择依据，不给时刻。',
      '节假日酒店与过桥车流明显增加，行程要留余量。',
      '跨市打车可能加价，上车前先确认。',
      '海岛段受天气影响最大，出发前看预报。',
    ],
    evidenceIds: [
      'guide-6860fc69000000001c033f46',
      'guide-6897480b0000000022021a2d',
      'guide-699d0efc000000000903a4c0',
      'guide-62da1f210000000012005912',
      'guide-68843f26000000001c03271d',
      'guide-6831ac7c000000002100ebb6',
    ],
  },
  {
    id: 'route-plan',
    city: '潮汕',
    theme: '路线',
    eyebrow: '行程 · 2–3 天',
    title: '2–3 天怎么排：潮州、汕头、南澳的顺序',
    dek: '三天的常见排法是潮州、汕头、南澳各一天。顺序怎么换，取决于你落在哪个站。',
    duration: '2–3 天',
    season: '全年；海岛放行程末尾更有弹性',
    cover: CUISINE_TABLE,
    facts: [
      { label: '三天分法', value: '公开攻略里最常见的是潮州一天、汕头一天、南澳一天' },
      { label: '落地口', value: '揭阳潮汕机场落潮州约 40 分钟车程；潮汕站在潮州潮安' },
      { label: '顺序', value: '海岛受天气影响大，放最后一天更容易调整' },
      { label: '住宿', value: '两天住一处最省事，三天可以在汕头老城住一晚' },
      { label: '代价', value: '每天换城市意味着每天收行李、找寄存，时间会被吃掉' },
    ],
    sections: [
      {
        heading: '2 天怎么排',
        body: [
          '第一种：潮州一天走古城，第二天汕头走老城，晚上从汕头返程。',
          '第二种：汕头一天，第二天直接去南澳环岛。两种都别再加第三个城市。',
        ],
      },
      {
        heading: '3 天怎么排',
        body: [
          '潮州 → 汕头 → 南澳是最顺的一条：先古城、再老城、最后看海。',
          '反过来走也行，但南澳放前面的话，天气一变就得临时改行程。',
        ],
      },
      {
        heading: '4–5 天加什么',
        body: [
          '多出来的时间给揭阳半天，或者在南澳住一晚看日出。',
          '四天以上就别每天换酒店：潮汕三地车程不长，但退房、寄存、再入住很消耗时间。',
        ],
      },
      {
        heading: '移动与住',
        body: [
          '三地之间打车、公交和自驾都能到，一小时上下。跨市打车可能加价，先谈好。',
          '住古城或老城附近，晚上还能再出去走一圈，是这类城市最值回票价的部分。',
        ],
      },
    ],
    route: {
      intro: '同一批点位按天数排三种走法：两天二选一，三天串成线。',
      segments: [
        {
          label: '2 天 A · 古城＋老城',
          area: '潮州 → 汕头',
          stops: [
            { label: '潮州古城' },
            { label: '汕头老城', note: '返程' },
          ],
        },
        {
          label: '2 天 B · 老城＋海岛',
          area: '汕头 → 南澳',
          stops: [
            { label: '汕头老城' },
            { label: '南澳岛', note: '环岛' },
          ],
        },
        {
          label: '3 天 · 三地各一天',
          area: '潮州 → 汕头 → 南澳',
          stops: [
            { label: '潮州古城' },
            { label: '汕头老城' },
            { label: '南澳岛', note: '放最后一天' },
          ],
        },
      ],
    },
    food: [
      { glyph: 'hotpot', name: '牛肉火锅', note: '安排在汕头或潮州的那一顿' },
      { glyph: 'kwayteow', name: '粿条', note: '赶路日子的早餐' },
      { glyph: 'oyster', name: '蚝烙', note: '晚上加一个菜' },
      { glyph: 'tea', name: '工夫茶', note: '等车、等人的时候' },
    ],
    photos: [CHAOZHOU_ALLEY, KANGHU_TEA],
    cautions: [
      '班次与票价以当天公告为准，本文只给顺序。',
      '节假日过桥车流明显增加，海岛日要留缓冲。',
      '每天换城市时，先确认行李寄存点。',
      '天气预警期间，海岛段优先调整。',
    ],
    evidenceIds: [
      'guide-6860fc69000000001c033f46',
      'guide-6897480b0000000022021a2d',
      'guide-67dbecb0000000001e007e24',
      'guide-6a50c462000000001c0249d5',
      'guide-69ce81f5000000001a0267d5',
      'guide-699d0efc000000000903a4c0',
    ],
  },
  {
    id: 'chaoshan-food',
    city: '潮汕',
    theme: '美食',
    eyebrow: '吃 · 点单顺序',
    title: '潮汕美食怎么点：牛肉、粿条、卤鹅、蚝烙与夜粥',
    dek: '一顿火锅、一碗粿条、半只卤鹅、一盘蚝烙，再加一泡茶——把这几样的顺序吃对，比多吃几家有用。',
    duration: '按顿安排',
    season: '全年',
    cover: CUISINE_TABLE,
    facts: [
      {
        label: '牛肉丸',
        value: '手打工艺在 2018 年列入广东省第七批省级非物质文化遗产代表性项目',
      },
      { label: '粿条', value: '大米磨浆、摊薄蒸熟后切条的米制主食，汤、炒、干拌都常见' },
      {
        label: '潮州卤鹅',
        value: '以光鹅配南姜、鱼露与酱油卤制；《潮州卤鹅及其制品》团体标准在 2023 年底发布实施',
      },
      { label: '工夫茶', value: '三只小杯一轮，茶汤浓，配油腻的菜正好' },
    ],
    sections: [
      {
        heading: '牛肉火锅：先认部位，再谈时间',
        body: [
          '潮汕牛肉火锅按部位分开点，盘子上会标名称。肉切得薄，下锅几秒就变色。',
          '涮多久各家说法不同，听店里的；汤底别一直滚，越滚越咸。',
        ],
        link: { to: '/museum/food', label: '站内美食条目：牛肉丸、粿条与卤鹅的做法与来源' },
      },
      {
        heading: '粿条：一碗汤里的主食',
        body: [
          '粿条是米做的，比面条软，吸汤。汤粿条、炒粿条、干拌都常见。',
          '早餐来一碗最顶饱，配一点辣椒酱或沙茶。',
        ],
      },
      {
        heading: '卤鹅：切一盘，配蒜泥醋',
        body: [
          '卤鹅在潮州是日常卤味，鹅肉、鹅肝、鹅掌可以分开点。',
          '蘸料通常是蒜泥加醋，用来解腻；鹅皮是最好吃的部分，别错过。',
        ],
      },
      {
        heading: '蚝烙：地瓜粉、蚝与蛋',
        body: [
          '蚝烙在铁板上摊开煎，边缘脆、中间软。',
          '趁热吃，凉了会返油；一桌人分一盘刚好。',
        ],
      },
      {
        heading: '夜粥与小炒',
        body: [
          '夜里还有白粥配杂咸、炒花甲、炒薄壳这类小炒。粥是底，菜才是主角。',
          '生腌海鲜属生食，肠胃敏感的人要谨慎。',
        ],
      },
      {
        heading: '收尾：一泡工夫茶',
        body: [
          '吃完饭坐下来喝一轮茶，是潮汕人收尾的方式。三个小杯、一个盖碗，茶汤浓，别一口闷。',
          '茶配油腻的菜最合适，也顺便把一顿饭的时间拉长。',
        ],
      },
    ],
    route: {
      intro: '不是地理路线，是一天里的点单顺序：早上轻、中午重、下午茶、晚上再重一次。',
      segments: [
        {
          label: '一天的点单顺序',
          area: '按时间排',
          stops: [
            { label: '早：粿条汤' },
            { label: '午：牛肉火锅', note: '11 点后到店更好坐' },
            { label: '下午：工夫茶' },
            { label: '晚：卤鹅与蚝烙' },
            { label: '夜：白粥小炒' },
          ],
        },
      ],
    },
    food: [
      { glyph: 'hotpot', name: '牛肉火锅', note: '按部位点，盘上有名字' },
      { glyph: 'beefball', name: '牛肉丸', note: '省级非遗的手打工艺' },
      { glyph: 'kwayteow', name: '粿条', note: '米浆蒸出的主食' },
      { glyph: 'goose', name: '卤鹅', note: '南姜、鱼露与酱油' },
      { glyph: 'oyster', name: '蚝烙', note: '地瓜粉、蚝与蛋' },
      { glyph: 'porridge', name: '夜粥', note: '白粥配杂咸' },
      { glyph: 'tea', name: '工夫茶', note: '三个小杯一轮' },
    ],
    photos: [BRAISED_GOOSE, OYSTER_OMELETTE, BEEF_KWAY_TEOW],
    cautions: [
      '生腌属于生食，肠胃敏感的人谨慎尝试。',
      '牛肉火锅的涮煮时间以店家提示为准，不要凭感觉。',
      '饭点前后半小时是排队高峰，错峰更省时间。',
      '非遗与做法信息来自站内已登记条目；价格与营业情况以门店为准。',
    ],
    evidenceIds: [
      'guide-6a56133c000000001702e06b',
      'guide-6a1c24fe0000000008002808',
      'guide-68272733000000002102f017',
      'guide-6ac0f9910000000018013b86',
      'guide-65cd9710000000000b00de02',
      'guide-6a538ca40000000011019aa1',
    ],
    stationRefs: ['food-beef-ball', 'food-kway-teow', 'food-braised-goose'],
  },
]

export const guideById = new Map(guideArticles.map((article) => [article.id, article]))
