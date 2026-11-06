# 营老爷·游神 · 素材说明

页面画册与案例使用的四张实拍图在 `public/media/photos/`，来自 Wikimedia Commons（CC BY-SA 4.0），署名见页面底部和 `registry.json`。另保留四段参考短动图于 `public/media/yinglaoye/`。

| 实拍图 | 衍生动图（留档） | 原图文件名 | 作者 |
| --- | --- | --- | --- |
| `/media/photos/yinglaoye-chaoyang-sedan.jpg` | `hero.gif` | 潮阳双忠营老爷2.jpg | 0754Hombee |
| `/media/photos/yinglaoye-procession.jpg` | `chaozhou.gif` | 潮汕营老爷.jpg | Zoemonday |
| `/media/photos/yinglaoye-chaoyang-walk.jpg` | `shantou.gif` | 潮阳双忠营老爷1.jpg | 0754Hombee |
| `/media/photos/yinglaoye-yingge.jpg` | `jieyang.gif` | 潮汕营老爷英歌舞现场.jpg | Zoemonday |

首页这一场的模型在 `models/`，油画素底在 `paint/`。素底用 `gpt-image-2.6` 按神轿、行进和灯笼实拍改画，再由 Tripo P 系列（`tripo-p2`）做成网页用 GLB。它们是示意模型，不是实拍，也不代替上面的署名照片。

| 模型 | 素底 |
| --- | --- |
| `models/carrier.glb` | `paint/carrier.webp` |
| `models/sedan.glb` | `paint/sedan.webp` |
| `models/lord.glb` | `paint/lord.webp` |
| `models/flag.glb` | `paint/flag.webp` |
| `models/lantern.glb` | `paint/lantern.webp` |

队伍分页里的手写 SVG（`ProcessionFigure.tsx`）仍在，和这一场模型分开。
