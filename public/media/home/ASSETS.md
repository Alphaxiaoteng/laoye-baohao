# 首页图片来源与许可

所有文件均从 Wikimedia Commons 下载后自托管，使用 ffmpeg 仅做尺寸与 WebP 格式优化；裁切展示不改变原许可。代码中的署名与链接见 `src/routes/homeMedia.ts`，首页底部「首页图片与许可」也可见。

| 本地文件 | 原作品 | 作者 | 许可 | 来源页 |
|---|---|---|---|---|
| `yingge-dance-1.webp` | Yingge Dance 1 | H2v5o68z | CC0 | https://commons.wikimedia.org/wiki/File:Yingge_Dance_1.jpg |
| `yingge-dance-2.webp` | Yingge Dance 2 | H2v5o68z | CC0 | https://commons.wikimedia.org/wiki/File:Yingge_Dance_2.jpg |
| `teochew-kanghu-tea.webp` | Teochew Kanghu tea | Kandukuru Nagarjun | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Teochew_Kanghu_tea.jpg |
| `chaoshan-cuisine3.webp` | Chaoshan Cuisine3 | Clarayyt | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Chaoshan_Cuisine3.jpg |
| `chaozhou-guangji-bridge-20191211-2.webp` | Chaozhou Guangji Bridge 20191211 2 | Akira CA | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Chaozhou_Guangji_Bridge_20191211_2.jpg |
| `chaozhou-jiadiwan.webp` | Chaozhou Jiadiwan | Sgnpkd | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Chaozhou_Jiadiwan.jpg |

许可文本：
- CC0：https://creativecommons.org/publicdomain/zero/1.0/deed.en
- CC BY 2.0：https://creativecommons.org/licenses/by/2.0
- CC BY-SA 4.0：https://creativecommons.org/licenses/by-sa/4.0

CC BY-SA 图片的优化与展示版本继续按 CC BY-SA 4.0 分享。照片用于说明潮汕文化场景，不表示由本站团队拍摄。

## 汕头市文化馆官网素材（`gdstwhg/`）

这 8 张 WebP 均下载自 **汕头市文化馆官网** `https://www.gdstwhg.com/`（页面版权署名「2018 汕头市文化馆 版权所有」），
由本站转码为 WebP 后**本地自托管**，仅用于非商业文化展示引用，未做 AI 修改，裁切不改变原意。

| 本地文件 | 画面内容 | 首页用途 |
|---|---|---|
| `gdstwhg/yingge-stage.webp` | 潮阳英歌舞台展演 | 四章画册导览带「01 英歌」 |
| `gdstwhg/yingge-portrait.webp` | 英歌队员脸谱近景 | 英歌章节备用实拍 |
| `gdstwhg/yingge-village.webp` | 乡村英歌队行进 | 英歌章节备用实拍 |
| `gdstwhg/tea-salon.webp` | 潮州工夫茶艺非遗沙龙 | 四章画册导览带「02 工夫茶」 |
| `gdstwhg/food-beefball.webp` | 潮汕手打牛肉丸非遗传承现场 | 四章画册导览带「03 美食」 |
| `gdstwhg/food-goose.webp` | 潮汕卤鹅 | 美食章节备用实拍 |
| `gdstwhg/parade-nanao.webp` | 南澳元宵民俗巡游队伍 | 四章画册导览带「04 营老爷」 |
| `gdstwhg/parade-float.webp` | 民俗巡游的标旗/花车 | 营老爷章节备用实拍 |

来源：`https://www.gdstwhg.com/`。若权利人提出异议，可删除 `public/media/home/gdstwhg/` 下对应文件并不再引用。

## 汕头市文化馆首页横幅（`hero/banner-*.webp`）

来源页：汕头市文化馆官网首页 `https://www.gdstwhg.com/`。机构：汕头市文化馆。只取首页轮播接口 `/api/banner/getBanner` 返回的两张图，没有抓整站。原图经官网跳到超星图床后下载，再转成 WebP。

| 本地文件 | 官网原图 | 画面 |
|---|---|---|
| `hero/banner-yingge.webp` | `/upload/admin/20200923/f956645f6c8b1db9caf68255eb88b498.png`（1920×500） | 英歌队伍、亭台，书法「英歌舞」 |
| `hero/banner-chaoju.webp` | `/upload/admin/20200914/df72152e65d1a59fba01df6a110978ce.jpg`（1920×500） | 潮剧扮相、梅花，书法「潮剧」 |

印章：两张图上的红印原文都是「汕头文化」。为本站改成「潮汕文化」——用印章本身的红色盖住上排「汕头」，再写上白色的「潮汕」。下排「文化」、书法和照片其余部分没改。页面上读到的是改过的印章，不是文化馆原文。

## AI 生成素材（hero/）

下表这些 `hero/` 文件为 AI 生成，非真实摄影、非文物图像，仅作视觉氛围，不作为文化事实依据。上面的馆方横幅不在此列。

| 本地文件 | 生成方式 | 用途 |
|---|---|---|
| `hero/panel-yingge.webp` / `panel-tea.webp` / `panel-food.webp` / `panel-yinglaoye.webp` | `gpt-image-2.6`（zexapi），极简二次元写实风，提示词见 `scripts/gen-hero-assets.mjs` | 首页四个文化章节的拼贴主视觉与细节裁切来源 |
| `hero/yingge.gif` / `tea.gif` / `food.gif` / `yinglaoye.gif` | `gpt-image-2.6-gif`（zexapi），以对应板块图为参考做图生图 | 桌面悬停叠播同构图动图；移动端是否直接展示由各板块按流量策略决定 |
| `hero/panorama-master.png`、`slice-*.webp` | 早期四合一长卷方案 | 已弃用，仅留档 |

画面中的英歌脸谱、茶具、菜品与神轿均为模型绘制的示意形象，不对应某一真实队伍、村落或场次。

## 拼贴裁切素材（collage/）

这些文件是从本页已登记的实拍或示意图中做的局部裁切，只用于构图，不冒充另一张照片；原图的作者、许可与来源仍以上表和 `public/media/photos/registry.json` 为准。

| 本地文件 | 裁切来源 | 用途 |
|---|---|---|
| `collage/yingge/yingge-face-detail.webp` | `/media/photos/yingge-performance.jpg` | 英歌章节的脸谱方片 |
| `collage/food/bowl-beef-ball.webp` | `/media/photos/food-beef-ball-soup.jpg` 的碗口与筷子局部 | 美食章节的方形主图 |
| `collage/yinglaoye/lantern.webp`、`collage/yinglaoye/yingge-face.webp` | 营老爷板块示意图的灯笼与英歌局部 | 营老爷章节的细节贴图 |
| `collage/yingge/yingge-drum-detail.webp` | 英歌实拍的鼓面试裁 | 未引用，仅留档 |

## 首屏轮播横幅（202009）

| 本地文件 | 来源 | 用途 |
|---|---|---|
| `hero/banner-chaoju.webp` | https://www.gdstwhg.com/upload/admin/20200914/df72152e65d1a59fba01df6a110978ce.jpg | 汕头市文化馆官网潮剧首页横幅，1920×500；原始访问跳转至超星图床，转码为 WebP 本地自托管 |
| `hero/banner-yingge.webp` | https://www.gdstwhg.com/upload/admin/20200923/f956645f6c8b1db9caf68255eb88b498.png | 汕头市文化馆官网英歌舞首页横幅，1920×500；原始访问跳转至超星图床，转码为 WebP 本地自托管 |

红印不是原样保留：上排「汕头文化」已改成「潮汕文化」，说明见上一节。
