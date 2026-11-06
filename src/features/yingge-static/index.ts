/**
 * 8787 英歌静态站（原样挂载在 /exhibits/yingge/）的薄封装。
 *
 * 只负责「去哪里」：真正的页面、css、js、素材全部来自 8787 目录的原样拷贝，
 * 本项目不改写其中任何内容。React 侧只需要这些链接常量，不要在这里复刻版式。
 */

export const YINGGE_EXHIBIT_ROOT = '/exhibits/yingge/'

export interface YinggeExhibitLink {
  id: string
  /** 静态站内的原生页面（相对 public/ 的绝对路径） */
  href: string
  title: string
  note: string
}

export const YINGGE_EXHIBIT_HOME = `${YINGGE_EXHIBIT_ROOT}index.html`

/**
 * 「云游英歌」轻量 H5 已随静态站本地镜像（public/exhibits/yingge/mugeda/）。
 * React 侧只允许用这个常量跳转，禁止直接写第三方域名 —— 原外链不是内容终点。
 */
export const YINGGE_JOURNEY_LOCAL = `${YINGGE_EXHIBIT_ROOT}mugeda/index.html`

export const YINGGE_EXHIBITS: YinggeExhibitLink[] = [
  {
    id: 'formation',
    href: `${YINGGE_EXHIBIT_ROOT}formation.html`,
    title: '阵法与队形',
    note: '七种基础队形与走位',
  },
  {
    id: 'characters',
    href: `${YINGGE_EXHIBIT_ROOT}characters.html`,
    title: '角色与器物',
    note: '头槌、二槌、脸谱与槌',
  },
  {
    id: 'watch',
    href: `${YINGGE_EXHIBIT_ROOT}watch.html`,
    title: '声音与影像',
    note: '完整演出与观看提示',
  },
  {
    id: 'sound',
    href: `${YINGGE_EXHIBIT_ROOT}sound.html`,
    title: '锣鼓节拍',
    note: '鼓、锣、钹如何协同',
  },
  {
    id: 'regions',
    href: `${YINGGE_EXHIBIT_ROOT}regions.html`,
    title: '地域与队伍',
    note: '按地区与队伍看差异',
  },
  {
    id: 'archive',
    href: `${YINGGE_EXHIBIT_ROOT}archive.html`,
    title: '文献研究',
    note: '资料类型与证据边界',
  },
]

export function yinggeExhibitHref(id: string): string {
  return YINGGE_EXHIBITS.find((item) => item.id === id)?.href ?? YINGGE_EXHIBIT_HOME
}
