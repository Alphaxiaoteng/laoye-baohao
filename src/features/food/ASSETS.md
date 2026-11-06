# 美食模块素材登记（ASSETS）

菜品图**全部改用实拍照片**，路径在 `public/media/photos/`，逐张登记在
`public/media/photos/registry.json`（含 author / license / source_page）。卡片上不再使用
`public/media/food/dish-*.svg` 这些自绘示意插画——它们不是照片，容易让人误以为是这道菜的真实样子。

## 菜品实拍照片（当前卡片在用）

| 文件 | 内容 | 作者 | 许可 | 原始页面 |
|---|---|---|---|---|
| `food-beef-ball-soup.jpg` | 牛肉丸汤实拍 | DragonSamYU | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Beef_Ball_Soup_-_20170301.jpg |
| `food-kway-teow.jpg` | 粿条汤实拍 | 沈澄心 | CC0 | https://commons.wikimedia.org/wiki/File:%E7%8F%A0%E6%B5%B7%E7%89%A9%E7%A2%97%E7%B2%BF%E6%9D%A1_%E6%9F%A0%E6%AA%AC%E7%8C%AA%E8%82%9A%E7%8C%AA%E6%9D%82%E7%B2%BF%E6%9D%A1.jpg |
| `food-braised-goose.jpg` | 潮汕非遗卤鹅实拍 | 0754Hombee | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:%E6%BD%AE%E6%B1%95%E9%9D%9E%E9%81%97%E5%8D%A4%E9%B9%85.jpg |
| `food-beef-kway-teow.jpg` | 潮汕牛肉丸粿条汤实拍 | N509FZ | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Chaoshan-style_beef_ball_kway_teow_soup_at_a_restaurant_in_Yongwai,_Beijing_(20240115131947).jpg |
| `food-oyster-omelette.jpg` | 蚝烙实拍 | 水餃喵 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Oyster_omelette_%E8%9A%9D%E7%83%99.jpg |

- 照片只做**降采样**（长边缩到展示尺寸），不裁不改内容；CC BY-SA 4.0 的图片保留署名与许可，
  转载时须沿用同一许可。
- 卡片 ↔ 图片的对应写在 `src/features/food/assets.ts` 的 `DISH_IMAGES`。

## 分步示意图（步骤页仍在用）

`public/media/food/step-01-cut.svg` … `step-06-serve.svg` 是本站自绘 SVG，用来指示动作与顺序，
**不是成品照片**，页面上也按「步骤示意图」标注。许可：随本仓库发布（CC0-1.0 精神）。

## 旧的自绘菜品插画（不再引用）

| 文件 | 内容 | 作者 | 许可 |
|---|---|---|---|
| `public/media/food/dish-beef-ball.svg` | 一碗手打牛肉丸 | 本站 | CC0-1.0 |
| `public/media/food/dish-kway-teow.svg` | 叠放的粿条薄片与切条刀 | 本站 | CC0-1.0 |
| `public/media/food/dish-braised-goose.svg` | 切片卤鹅与蒜泥醋小碟 | 本站 | CC0-1.0 |
| `public/media/food/dish-beef-kway-teow-soup.svg` | 一碗牛肉粿条汤 | 本站 | CC0-1.0 |
| `public/media/food/dish-hao-lao.svg` | 一盘蚝烙 | 本站 | CC0-1.0 |

文件保留在仓库里（可能被别处引用），但美食卡片不再使用，避免拿插画冒充实拍。

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
