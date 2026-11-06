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

## AI 生成素材（hero/）

`hero/` 下的首页画卷为 AI 生成，非真实摄影、非文物图像，仅作视觉氛围，不作为文化事实依据。

| 本地文件 | 生成方式 | 用途 |
|---|---|---|
| `hero/panorama-master.png` / `.webp` | `gpt-image-2.6`（zexapi），提示词见 `scripts/gen-hero-assets.mjs` | 首页整幅横屏画卷母图，四栏 CSS 切片共用 |
| `hero/yingge.gif` / `tea.gif` / `food.gif` / `yinglaoye.gif` | `gpt-image-2.6-gif`（zexapi） | 四栏悬停叠播动图；移动端直接展示 |

画面中的英歌脸谱、茶具、菜品与神轿均为模型绘制的示意形象，不对应某一真实队伍、村落或场次。
