import { sourceById } from '../../lib/content'

/**
 * 英歌模块的数据层：只放「页面怎么呈现」，不放没来源的史实。
 * 每条文字都能对应到 content/sources.yingge.json 里的来源编号：
 * - S101 中国非物质文化遗产网 · 英歌（普宁英歌）
 * - S103 汕头市地方标准 DB 4405/T 315—2025《非物质文化遗产 潮阳英歌》
 */

export type FormationId =
  | 'double'
  | 'square'
  | 'dragon'
  | 'spiral'
  | 'wheat'
  | 'seas'
  | 'bagua'

export interface FormationDef {
  id: FormationId
  name: string
  /** 一句话说明这种空间关系 */
  summary: string
  /** 走位要点，用于右侧说明卡 */
  route: string
  sourceIds: string[]
}

export const FORMATIONS: FormationDef[] = [
  {
    id: 'double',
    name: '双列队形',
    summary: '两列队伍平行对称向前流动，是最基础的巡游队形。',
    route: '两列等距并排，纵向间距保持一致，整队同向推进。',
    sourceIds: ['S103'],
  },
  {
    id: 'square',
    name: '方形阵',
    summary: '以两列为一组、两组并排，组织成方形。',
    route: '两列成一组，两组横向并排，前后排对齐成方块。',
    sourceIds: ['S103'],
  },
  {
    id: 'dragon',
    name: '双龙出海',
    summary: '两列或四列同向移动，再从队伍中间分裂向左右展开。',
    route: '由中间起分，逐段向两侧张开，形成两条弧线。',
    sourceIds: ['S103', 'S101'],
  },
  {
    id: 'spiral',
    name: '田螺阵',
    summary: '全队合成一列，由队首向里或向外盘旋成圈。',
    route: '单列沿螺旋线绕行，半径逐圈收放。',
    sourceIds: ['S103', 'S101'],
  },
  {
    id: 'wheat',
    name: '麦穗花阵',
    summary: '一列首尾相接成大圆，另一列以小圆反向穿插流动。',
    route: '大圆顺时针，小圆逆时针，两股队伍持续交错。',
    sourceIds: ['S103', 'S101'],
  },
  {
    id: 'seas',
    name: '四海升平',
    summary: '四列人数均等，各自接成圆圈，按十字方位对称。',
    route: '四个圆分居四角，同步转动，保持十字对称。',
    sourceIds: ['S103'],
  },
  {
    id: 'bagua',
    name: '八卦阵',
    summary: '内外两圈相套，乐队以 S 型站在内圈，整体形成八卦图案。',
    route: '外圈单向行进，内圈反向；乐队沿 S 形排开。',
    sourceIds: ['S103'],
  },
]

export interface TeamRole {
  name: string
  duty: string
}

/** 潮阳英歌队伍构成（S103 地方标准 4.1.1 表 1） */
export const TEAM_ROLES: TeamRole[] = [
  { name: '队长', duty: '队务与外出表演安排、人员调度。' },
  { name: '教练（师父）', duty: '培训与节目编排，也负责表演与脸谱化妆的教学。' },
  { name: '化妆师', duty: '演出时的脸谱化妆与服装指导。' },
  { name: '指挥', duty: '用鼓点发出号令，把控行进速度与队形、套路的改变。' },
  { name: '引舞', duty: '在队伍前开路打场、协助指挥；最常见由耍蛇的时迁担任。' },
  { name: '领舞（头槌、二槌）', duty: '执行指挥号令，位置在队伍最前两边。' },
  { name: '舞队', duty: '配合领舞号令完成对应套路动作。' },
  { name: '乐队', duty: '担任演出的音乐伴奏。' },
]

export interface ObjectCard {
  id: string
  name: string
  image: string
  /** 图片说明：概念器物图 / 实拍帧 */
  imageKind: '概念器物图' | '实拍帧'
  summary: string
  detail: string
  facts: { label: string; value: string }[]
  sourceIds: string[]
}

export const OBJECTS: ObjectCard[] = [
  {
    id: 'clubs',
    name: '双槌（英歌槌）',
    image: '/media/yingge/objects/icon-clubs.webp',
    imageKind: '概念器物图',
    summary: '成对使用，是英歌最基本的道具。',
    detail:
      '硬木做成，敲击能发出清脆的声音，槌身多为黑色或红色，两端槌头与槌身可添加花纹图案。舞者每人各执一对，随锣鼓节奏上下左右对击。',
    facts: [
      { label: '材质', value: '硬木，敲击清脆' },
      { label: '常见颜色', value: '槌身黑或红，可加花纹' },
      { label: '长度', value: '随种类不同，标准给 40～61cm' },
    ],
    sourceIds: ['S103', 'S100'],
  },
  {
    id: 'flag',
    name: '令旗',
    image: '/media/yingge/objects/icon-command-flag.webp',
    imageKind: '概念器物图',
    summary: '队伍里的信号道具，一般用三角旗。',
    detail: '标准把令旗写作三角令旗，由扮演公孙胜的人执旗。旗色、尺寸与用法要看具体队伍。',
    facts: [
      { label: '形制', value: '一般为三角令旗' },
      { label: '执旗者', value: '扮演公孙胜的人' },
    ],
    sourceIds: ['S103'],
  },
  {
    id: 'drum',
    name: '大鼓（南堂鼓）',
    image: '/media/yingge/objects/icon-drum.webp',
    imageKind: '概念器物图',
    summary: '牛皮鼓面，红色，整支队伍的节拍中枢。',
    detail:
      '鼓面外沿常用红色绸缎装饰，一般用木架固定在推车上，或由专人抬鼓。标准另列中鼓：鼓面直径约 50cm，挂在鼓手身上演奏。',
    facts: [
      { label: '鼓面', value: '牛皮，红色，直径约 60cm' },
      { label: '安放', value: '木架推车，或专人抬鼓' },
    ],
    sourceIds: ['S103'],
  },
  {
    id: 'gong',
    name: '锣与钹',
    image: '/media/yingge/objects/icon-gong.webp',
    imageKind: '概念器物图',
    summary: '突出重音与段落层次，常在高潮处叠加。',
    detail:
      '大锣直径约 30cm，有麻绳提手，可敲锣心或锣边，声音不同；大钹为铜制圆片一副两个，中间凸起，对击演奏，多用于音乐高潮处；小钹（镲）形制相似而体型更小。另有钦仔锣（又称肚前锣）与云锣。',
    facts: [
      { label: '大锣', value: '直径约 30cm，手提敲击' },
      { label: '大钹', value: '铜制一副两个，对击' },
      { label: '其他', value: '钦仔锣、云锣、小钹（镲）' },
    ],
    sourceIds: ['S103'],
  },
  {
    id: 'headpiece',
    name: '头饰（盔头）',
    image: '/media/yingge/objects/icon-headpiece.webp',
    imageKind: '概念器物图',
    summary: '冠帽决定远处的辨识度，品种按人物分配。',
    detail:
      '盔头又称将盔，是武将所戴的冠帽，上缀绒球，后有披，有的插雉尾翎；品种有尖英、大龙、过龙、太子盔等。关胜戴「尖英」，史进戴「硬老包」。另有罗帽、草帽圈、头巾、发套与英雄箭等。',
    facts: [
      { label: '通称', value: '盔头（将盔）' },
      { label: '装饰', value: '绒球、后披、雉尾翎' },
      { label: '举例', value: '关胜「尖英」、史进「硬老包」' },
    ],
    sourceIds: ['S103'],
  },
  {
    id: 'face',
    name: '脸谱',
    image: '/media/yingge/objects/icon-painted-face.webp',
    imageKind: '概念器物图',
    summary: '红、黑、白是基色，但颜色不能单独说明人物身份。',
    detail:
      '标准把脸谱分戏面与鬼面两类：戏面借鉴戏曲妆容，多呈现水浒人物；鬼面以黑白两色为主，忌讳狰狞恐怖。画法有勾脸与揉脸，勾画顺序是先眉，再眼窝、鼻窝、嘴角、脸膛，最后勾脸纹。一般只有队伍前几位表演者有特定的、为人熟悉的人物形象，其余多不确定身份。',
    facts: [
      { label: '基色', value: '红、黑、白；辅色蓝、绿、黄' },
      { label: '两类', value: '戏面脸谱 / 鬼面脸谱' },
      { label: '画法', value: '勾脸、揉脸' },
    ],
    sourceIds: ['S103'],
  },
]

export interface Instrument {
  name: string
  note: string
}

/** 常用乐器（S103 表 3 摘录，仅保留可读要点） */
export const INSTRUMENTS: Instrument[] = [
  { name: '大鼓（南堂鼓）', note: '牛皮鼓面、直径约 60cm，红色，木架推车或专人抬。' },
  { name: '中鼓', note: '直径约 50cm，挂在鼓手身上演奏。' },
  { name: '钦仔锣', note: '又称肚前（脐）锣，铜制，锣心半球形凸起。' },
  { name: '大锣', note: '直径约 30cm，麻绳提手，敲锣心与锣边声音不同。' },
  { name: '云锣', note: '传统形制由十面铜制小锣组成，架于木架。' },
  { name: '大钹', note: '铜制一副两个，中间凸起，对击，多用于高潮。' },
  { name: '小钹（镲）', note: '形制与大钹相似而更小，中央系巾，可手握。' },
  { name: '螺号', note: '海螺壳制成，声音低沉；快板、中板常伴螺号声。' },
  { name: '牛角号', note: '牛角所制，音色饱满洪亮。' },
]

export interface TempoDef {
  id: 'slow' | 'mid' | 'fast'
  name: string
  /** 标准里「司鼓几下鼓点为一循环」 */
  cycle: number
  /** 合成示意的间隔，单位毫秒，不是实测速度 */
  interval: number
  hint: string
}

export const TEMPOS: TempoDef[] = [
  { id: 'slow', name: '慢板', cycle: 3, interval: 520, hint: '3 下鼓点为一循环（S103）' },
  { id: 'mid', name: '中板', cycle: 5, interval: 400, hint: '5 下鼓点为一循环（S103）' },
  { id: 'fast', name: '快板', cycle: 7, interval: 290, hint: '7 下鼓点为一循环（S103）' },
]

/** 只显示真实存在的来源，避免凭空写编号 */
export function validSources(ids: string[]) {
  return ids.map((id) => sourceById(id)).filter((s): s is NonNullable<typeof s> => Boolean(s))
}

export const MEDIA = {
  video: '/media/yingge/watch/yingge-square-720p.mp4',
  poster: '/media/yingge/watch/yingge-square-poster.webp',
  thailand: '/media/yingge/watch/thailand-2024-performance.webp',
  performerAlley: '/media/yingge/roles/performer-alley.webp',
  secondClub: '/media/yingge/roles/second-club.webp',
  objectsArchive: '/media/yingge/objects/objects-archive.webp',
} as const
