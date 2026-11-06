# 美食模块素材登记（ASSETS）

页面上的食物图在 `public/media/food/white/`。gpt-image-2.6 按馆内实拍改成白底 1:1，画面里没有人、手、脸、字和水印。
有步骤的食谱，每步一张，再拼成同目录下的 GIF。
原实拍仍留在 `public/media/photos/`，不删除；作者、许可与原始页面登记在
`public/media/photos/registry.json`。
`illus-*.webp`、`dish-*.svg`、`step-*.svg` 不再给页面用。

## 当前白底图

| 文件 | 画面 | 依据的实拍 |
|---|---|---|
| `white/food-beef-ball.webp` | 一碗牛肉丸汤 | `food-beef-ball-soup.jpg` |
| `white/food-beef-ball/step-01.webp` … `step-05.webp` | 手打牛肉丸条目正文里的工序 | 同上 |
| `white/food-beef-ball.gif` | 上面 5 步连播 | 同上 |
| `white/food-kway-teow.webp` | 切好的宽粿条与两张粉皮 | `food-kway-teow.jpg` |
| `white/food-kway-teow/step-01.webp` … `step-06.webp` | 粿条条目正文里的浸泡、蒸制、切条和煮汤 | 同上 |
| `white/food-kway-teow.gif` | 上面 6 步连播 | 同上 |
| `white/recipe-beef-kway-teow-soup/step-01.webp` … `step-06.webp` | 牛肉粿条汤的 6 个步骤 | `food-beef-kway-teow.jpg` |
| `white/recipe-beef-kway-teow-soup.gif` | 上面 6 步连播 | 同上 |
| `white/recipe-chaozhou-beef-ball/step-01.webp` … `step-08.webp` | 潮州牛肉丸的 8 个步骤 | `food-beef-ball-soup.jpg` |
| `white/recipe-chaozhou-beef-ball.gif` | 上面 8 步连播 | 同上 |
| `white/recipe-chaoshan-hao-lao/step-01.webp` … `step-07.webp` | 潮汕蚝烙的 7 个步骤 | `food-oyster-omelette.jpg` |
| `white/recipe-chaoshan-hao-lao.gif` | 上面 7 步连播 | 同上 |
| `white/recipe-chaozhou-braised-goose/step-01.webp` … `step-07.webp` | 潮州卤鹅的 7 个步骤 | `food-braised-goose.jpg` |
| `white/recipe-chaozhou-braised-goose.gif` | 上面 7 步连播 | 同上 |

- 首页点选写在 `foodStage.ts`。卡片图写在 `assets.ts` 的 `DISH_IMAGES`。
- 改绘沿用原图许可。CC BY-SA 4.0 的几张须保留署名并使用同一许可。

## 菜品实拍照片（保留，页面不再引用）

| 文件 | 内容 | 作者 | 许可 | 原始页面 |
|---|---|---|---|---|
| `food-beef-ball-soup.jpg` | 牛肉丸汤实拍 | DragonSamYU | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Beef_Ball_Soup_-_20170301.jpg |
| `food-kway-teow.jpg` | 粿条汤实拍 | 沈澄心 | CC0 | https://commons.wikimedia.org/wiki/File:%E7%8F%A0%E6%B5%B7%E7%89%A9%E7%A2%97%E7%B2%BF%E6%9D%A1_%E6%9F%A0%E6%AA%AC%E7%8C%AA%E8%82%9A%E7%8C%AA%E6%9D%82%E7%B2%BF%E6%9D%A1.jpg |
| `food-braised-goose.jpg` | 潮汕非遗卤鹅实拍 | 0754Hombee | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:%E6%BD%AE%E6%B1%95%E9%9D%9E%E9%81%97%E5%8D%A4%E9%B9%85.jpg |
| `food-beef-kway-teow.jpg` | 潮汕牛肉丸粿条汤实拍 | N509FZ | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Chaoshan-style_beef_ball_kway_teow_soup_at_a_restaurant_in_Yongwai,_Beijing_(20240115131947).jpg |
| `food-oyster-omelette.jpg` | 蚝烙实拍 | 水餃喵 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Oyster_omelette_%E8%9A%9D%E7%83%99.jpg |

- 这些原图只保留作改绘依据与署名。页面卡片不再直接展示它们。

## 旧的分步示意图（不再引用）

`public/media/food/step-01-cut.svg` … `step-06-serve.svg` 是本站自绘 SVG。
食谱页现在用 `white/` 里对应步骤的白底图。许可：随本仓库发布（CC0-1.0 精神）。

## 旧的自绘菜品插画（不再引用）

| 文件 | 内容 | 作者 | 许可 |
|---|---|---|---|
| `public/media/food/dish-beef-ball.svg` | 一碗手打牛肉丸 | 本站 | CC0-1.0 |
| `public/media/food/dish-kway-teow.svg` | 叠放的粿条薄片与切条刀 | 本站 | CC0-1.0 |
| `public/media/food/dish-braised-goose.svg` | 切片卤鹅与蒜泥醋小碟 | 本站 | CC0-1.0 |
| `public/media/food/dish-beef-kway-teow-soup.svg` | 一碗牛肉粿条汤 | 本站 | CC0-1.0 |
| `public/media/food/dish-hao-lao.svg` | 一盘蚝烙 | 本站 | CC0-1.0 |

这些 SVG 文件保留在仓库里，美食卡片不再使用。

## 交互参考（只借交互结构，不引入代码与依赖）

- **Sid-CodeX/ChefMate** — MIT License, Copyright (c) 2025 Sidharth。
  仅参考 `frontend/src/components/CookingBox.tsx` 的「当前步骤下标 + 步骤进度 + 上一/下一步 + 计时」
  这一交互结构；没有复制其代码，也没有引入其 UI 组件库、鉴权、积分（gamification）或任何后端。
  本模块的计时改为「结束时间戳 + localStorage 恢复」，与其基于 `setInterval` 累加的计时不同。
- **ShreyPan/chefMate**、**Anirudh77715/ai-agent-for-voice-cooking-assistant** — 只阅读 README 与
  交互说明，用于确认「逐步引导 + 内置计时 + 上一步/下一步」的通用模式。
  两者以语音识别/语音播报与第三方食谱 API 为核心，本模块**不引入**语音、TTS、后端或外部 API。

## 文字内容

菜品简介与食谱用量不是素材，而是逐条摘录自 `content/sources.food.json` 里登记的来源
（政府门户网站与潮州市烹调协会团体标准）；每条内容都挂 `sourceIds`，可在 `/sources` 核对。
弹窗里的材料与步骤直接读 `content/recipes.food.json`，没有另写一份。
