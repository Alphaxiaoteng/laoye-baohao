# 英歌模块素材登记（内部溯源）

本文件只作内部溯源，不在公开页面展示。所有复用素材的授权状态一律记为 **待确认**，
上线前需由项目方与素材提供方核对后再决定是否保留。

素材来源目录：`/Users/albert/Documents/Antigravity/laoyebaohao`（本地参考项目快照，
不是上线站点；仓库内不出现其域名与站名）。

## 1. 器物图标（6 张）

| 本地文件 | 原路径 | 处理 | 说明 | 授权 |
|---|---|---|---|---|
| `public/media/yingge/objects/icon-clubs.webp` | `assets/elements/icon-clubs.webp` | 原样复制（10.3 KB） | 双槌，参考项目的概念器物图标 | 待确认 |
| `public/media/yingge/objects/icon-command-flag.webp` | `assets/elements/icon-command-flag.webp` | 原样复制（8.0 KB） | 令旗 | 待确认 |
| `public/media/yingge/objects/icon-drum.webp` | `assets/elements/icon-drum.webp` | 原样复制（13.1 KB） | 鼓 | 待确认 |
| `public/media/yingge/objects/icon-gong.webp` | `assets/elements/icon-gong.webp` | 原样复制（11.9 KB） | 锣钹 | 待确认 |
| `public/media/yingge/objects/icon-headpiece.webp` | `assets/elements/icon-headpiece.webp` | 原样复制（13.7 KB） | 头饰（盔头） | 待确认 |
| `public/media/yingge/objects/icon-painted-face.webp` | `assets/elements/icon-painted-face.webp` | 原样复制（14.6 KB） | 脸谱 | 待确认 |

这些图标在参考项目中即作为「概念器物图」使用，不是某支队伍的文物照片；
公开页面标注为「概念器物图」。

## 2. 器物合影

| 本地文件 | 原路径 | 处理 | 说明 | 授权 |
|---|---|---|---|---|
| `public/media/yingge/objects/objects-archive.webp` | `assets/objects-archive.png`（2.5 MB） | 缩放到 1400px 宽，WebP q82（132 KB） | 鼓、双槌、锣、头冠、戏服的概念静物图 | 待确认 |

页面说明写「概念器物图」，不称其为实物档案。

## 3. 影像

| 本地文件 | 原路径 | 处理 | 说明 | 授权 |
|---|---|---|---|---|
| `public/media/yingge/watch/yingge-square-720p.mp4` | `assets/curation/xunji-400-years-xiaochui-yingge.mp4`（293.0 MB，1920×1080，145 s） | 取 96–122 s（26 s），裁掉画面下部 242 px（原片右下角标与烧录字幕所在区域），缩放 1648×720，H.264 CRF 23、preset slow、`+faststart`，去音轨；成品约 16 MB | 真实演出实录（街区巡游、巷道表演、祠堂前广场列队） | 待确认 |
| `public/media/yingge/watch/yingge-square-poster.webp` | 同上，成品视频第 13 s 截图 | WebP q84，1648×720（108 KB） | 视频封面 | 待确认 |
| `public/media/yingge/watch/thailand-2024-performance.webp` | `assets/curation/thailand-2024-performance-close.jpg`（208 KB，1440×812） | 缩放到 1400px 宽，WebP q82（244 KB） | 户外演出现场；文件名标注 2024 年泰国场次 | 待确认 |
| `public/media/yingge/roles/performer-alley.webp` | 参考片源第 110 s 截图 | 裁掉画面下部 242 px，缩放 1280×559，WebP q82（84 KB） | 巷道中的挥槌动作 | 待确认 |
| `public/media/yingge/roles/second-club.webp` | 参考片源第 97.2 s 截图 | 同上（28 KB） | 黑面黑须队员举槌 | 待确认 |

未采用的素材与原因：

- `assets/opening-film.mp4`（7.15 s / 9.4 MB）：片尾出现原站的 AI 吉祥物形象，
  按模块要求（去掉该形象与 AI 人设）未采用。
- `assets/film-01.png`、`film-02.png`、`opening-film-final.webp`、`assets/jiaque.png`：
  均为同一角色形象，未采用。
- 原始 145 s 纪录片未整段使用：全片由该角色串场、带原站角标与烧录字幕，
  会同时违反「去角色形象」和「去原站标识」两条要求；只保留其中真实队员的演出片段。
- 原片音轨全部去掉：片中含角色旁白，避免把虚构叙事带进页面。

## 4. 文字与事实来源

页面文案只依据 `content/sources.yingge.json` 的 S100–S104，均为可公开访问的机构页面：

- S100 / S101 / S102：中国非物质文化遗产网三个英歌项目页（潮阳、普宁、甲子）。
- S103：汕头市地方标准 DB 4405/T 315—2025《非物质文化遗产 潮阳英歌》PDF。
- S104：汕头职业技术学院英歌舞专题站的「潮阳英歌地方标准」栏目页（仅用于定位 S103）。

原参考项目首页 `S1`（交互参考，非事实来源）已从来源表删除，依赖它的两条条目正文已重写。

## 5. 未复用的原站元素

原站导航、页脚、馆徽、`museum-mark`、角色形象、AI 助手话术、暗色整页主题均未复用；
页面版式在 `src/features/yingge` 内重新实现，配色沿用本项目 Tailwind 的 cream / brick / ink。
