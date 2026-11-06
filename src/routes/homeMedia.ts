export interface HomeMedia {
  id: string
  src: string
  width: number
  height: number
  alt: string
  title: string
  creator: string
  license: string
  licenseUrl: string
  page: string
}

/** 首页真实图片。统一自托管；裁切/转码后的版本沿用原许可。 */
export const HOME_MEDIA: Record<string, HomeMedia> = {
  yingge: {
    id: 'yingge',
    src: '/media/home/yingge-dance-1.webp',
    width: 1600,
    height: 1200,
    alt: '街巷中行进的英歌队，舞者手持双槌，前方有锣鼓手',
    title: 'Yingge Dance 1',
    creator: 'H2v5o68z',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.en',
    page: 'https://commons.wikimedia.org/wiki/File:Yingge_Dance_1.jpg',
  },
  procession: {
    id: 'procession',
    src: '/media/home/yingge-dance-2.webp',
    width: 1600,
    height: 1200,
    alt: '游神队伍经过街道，标旗与神轿在人群中央',
    title: 'Yingge Dance 2',
    creator: 'H2v5o68z',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.en',
    page: 'https://commons.wikimedia.org/wiki/File:Yingge_Dance_2.jpg',
  },
  tea: {
    id: 'tea',
    src: '/media/home/teochew-kanghu-tea.webp',
    width: 1440,
    height: 900,
    alt: '俯视木质茶盘上的茶壶与几只小茶杯',
    title: 'Teochew Kanghu tea',
    creator: 'Kandukuru Nagarjun',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    page: 'https://commons.wikimedia.org/wiki/File:Teochew_Kanghu_tea.jpg',
  },
  food: {
    id: 'food',
    src: '/media/home/chaoshan-cuisine3.webp',
    width: 1280,
    height: 960,
    alt: '圆桌上的潮汕牛肉火锅与分盘摆放的食材',
    title: 'Chaoshan Cuisine3',
    creator: 'Clarayyt',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Chaoshan_Cuisine3.jpg',
  },
  bridge: {
    id: 'bridge',
    src: '/media/home/chaozhou-guangji-bridge-20191211-2.webp',
    width: 1600,
    height: 1221,
    alt: '潮州广济桥的浮桥段，红色木船依次连成桥面',
    title: 'Chaozhou Guangji Bridge 20191211 2',
    creator: 'Akira CA',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Chaozhou_Guangji_Bridge_20191211_2.jpg',
  },
  alley: {
    id: 'alley',
    src: '/media/home/chaozhou-jiadiwan.webp',
    width: 1600,
    height: 1200,
    alt: '潮州甲第巷的传统民居与骑摩托车经过的居民',
    title: 'Chaozhou Jiadiwan',
    creator: 'Sgnpkd',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    page: 'https://commons.wikimedia.org/wiki/File:Chaozhou_Jiadiwan.jpg',
  },
}

/** 首屏主视觉：沿用授权的英歌实拍，不额外引入新素材。 */
export const HOME_HERO = HOME_MEDIA.yingge

export const HOME_MODULE_MEDIA: Record<string, HomeMedia> = {
  yingge: HOME_MEDIA.yingge,
  tea: HOME_MEDIA.tea,
  food: HOME_MEDIA.food,
  yinglaoye: HOME_MEDIA.procession,
}

/** 原始资料照片：仅作为授权资料记录，全部来自 Wikimedia Commons。 */
export const HOME_RAW_PHOTOS: HomeMedia[] = [
  HOME_MEDIA.yingge,
  HOME_MEDIA.procession,
  HOME_MEDIA.tea,
  HOME_MEDIA.food,
  HOME_MEDIA.bridge,
  HOME_MEDIA.alley,
]
