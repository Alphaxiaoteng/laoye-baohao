# 攻略页配图与许可

`/guide` 现在有 12 篇站内指南。图片分两类：**结构用 SVG**（线路、食物小图谱、没有实拍时的头图），
**现场用实拍**。实拍一律取自站内已登记、许可可查的文件，**没有**使用 `content/guides.json` 里的第三方封面，
也没有对照片做 AI 修改或生成式替换；只做 CSS 裁切展示。

## 使用的实拍

| 本地文件 | 用在 | 原作品 / 作者 | 许可 | 来源页 |
|---|---|---|---|---|
| `public/media/home/chaozhou-guangji-bridge-20191211-2.webp` | 潮州古城一天（现场）、广济桥与广济楼（题图） | Chaozhou Guangji Bridge 20191211 2 / Akira CA | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Chaozhou_Guangji_Bridge_20191211_2.jpg |
| `public/media/home/chaozhou-jiadiwan.webp` | 潮州古城一天（题图）、牌坊街（题图）、广济桥（现场）、2–3 天怎么排（现场） | Chaozhou Jiadiwan / Sgnpkd | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Chaozhou_Jiadiwan.jpg |
| `public/media/home/teochew-kanghu-tea.webp` | 潮州古城一天、牌坊街、2–3 天怎么排（现场）；工夫茶（题图）；第一次来潮汕（现场） | Teochew Kanghu tea / Kandukuru Nagarjun | CC BY 2.0 | https://commons.wikimedia.org/wiki/File:Teochew_Kanghu_tea.jpg |
| `public/media/home/chaoshan-cuisine3.webp` | 潮汕美食怎么点（题图）、2–3 天怎么排（题图）、第一次来潮汕（现场） | Chaoshan Cuisine3 / Clarayyt | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Chaoshan_Cuisine3.jpg |
| `public/media/photos/food-braised-goose.jpg` | 潮汕美食怎么点（现场） | 潮汕非遗卤鹅 / 0754Hombee | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:%E6%BD%AE%E6%B1%95%E9%9D%9E%E9%81%97%E5%8D%A4%E9%B9%85.jpg |
| `public/media/photos/food-oyster-omelette.jpg` | 潮汕美食怎么点（现场） | Oyster omelette 蚝烙 / 水餃喵 | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Oyster_omelette_%E8%9A%9D%E7%83%99.jpg |
| `public/media/photos/food-beef-kway-teow.jpg` | 潮汕美食怎么点（现场） | Chaoshan-style beef ball kway teow soup / N509FZ | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Chaoshan-style_beef_ball_kway_teow_soup_at_a_restaurant_in_Yongwai,_Beijing_(20240115131947).jpg |
| `public/media/photos/food-beef-ball-soup.jpg` | 汕头老城（现场） | Beef Ball Soup / DragonSamYU | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Beef_Ball_Soup_-_20170301.jpg |
| `public/media/photos/yingge-performance.jpg` | 汕头老城（现场）、英歌怎么看（现场） | 潮汕英歌舞表演 / Zoemonday | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:%E6%BD%AE%E6%B1%95%E8%8B%B1%E6%AD%8C%E8%88%9E%E8%A1%A8%E6%BC%94.jpg |
| `public/media/photos/yingge-parade.jpg` | 汕头老城（题图）、英歌怎么看（题图） | 英歌队街头行进 / Zoemonday | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:%E6%BD%AE%E6%B1%95%E8%8B%B1%E6%AD%8C%E8%88%9E%E8%A1%A8%E6%BC%94.jpg |
| `public/media/photos/yinglaoye-procession.jpg` | 揭阳古城（题图）、普宁营老爷（题图） | 潮汕营老爷 / Zoemonday | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:%E6%BD%AE%E6%B1%95%E8%90%A5%E8%80%81%E7%88%B7.jpg |

许可文本：CC BY 2.0 <https://creativecommons.org/licenses/by/2.0>，
CC BY-SA 4.0 <https://creativecommons.org/licenses/by-sa/4.0>。
页面里的署名是纯文本，不做外链跳转。

## 明确没有配图的篇目

- `南澳岛看海`：站内没有可用的南澳海岸实拍（`public/media/home/gdstwhg/parade-nanao.webp`
  实际是文化馆的公众号二维码海报，画面与南澳无关，未使用）。只用 SVG 结构图，并在页面上说明原因。
- `揭阳古城半日`、`普宁营老爷`、`工夫茶`、`广济桥与广济楼`：题图已是站内唯一可用的对应实拍，
  没有第二张同主题照片，页面写明「不再重复放图」，不用 AI 图或他站图片补位。

## SVG 的边界

- `RouteSketch.tsx`：按点位顺序画节点、连线与编号，**不是地理地图**，不表示实际距离与走向。
- `FoodGlyphs.tsx`：抽象线稿，只区分「牛肉火锅 / 牛肉丸 / 粿条 / 卤鹅 / 蚝烙 / 工夫茶 / 夜粥 / 肠粉」，
  不是菜品照片，也不做写实描摹。
- `GuidePage.tsx` 里的 `CoverArt`：没有实拍时的纸面示意头图，`aria-hidden`，不宣称是现场。

## 内容溯源

每篇指南在 `src/features/guide/knowledge.ts` 里用 `evidenceIds`（对应 `content/guides.json` 的条目 id）
与 `stationRefs`（对应 `content/entries.*.json` 的条目 id）记录依据；这两个字段不渲染给用户，
由 `tests/guide-render.test.ts` 校验其存在性。
`工夫茶` 一篇没有 guides.json 条目，依据全部来自 `content/entries.tea.json`（stationRefs）。
