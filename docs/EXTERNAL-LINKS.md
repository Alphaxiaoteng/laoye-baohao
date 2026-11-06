# 外链审查与本地化记录

扫描时间：2026-11-06
范围：`src/**/*.tsx`、`src/**/*.ts`、`public/exhibits/**/*.html`（含 `public/exhibits/yingge/*.js` 中与导航相关的 1 处外链）
排除：`public/exhibits/yingge/mugeda/**`（由另一子代理并行处理）、`server/**`、`content/**`

扫描命令：

```bash
grep -rhoE 'https?://[a-zA-Z0-9._-]+' src/ | sort | uniq -c
grep -rn 'href="https\?://' public/exhibits/yingge/*.html
grep -rn 'mgd5\|wenjian' src public/exhibits/yingge/*.html public/exhibits/yingge/*.js
```

## 分类规则

| 类别 | 处理 |
| --- | --- |
| 内容型外链（第三方 H5 / 演示站 / 图片站） | 改为站内镜像或本地路由，删掉直接跳出站外的出口 |
| 来源署名外链（政府官网、非遗名录、高校披露、Wikimedia Commons、CC 许可） | 保留，但文案标注「来源：」，不作为内容终点 |
| CDN / 字体 / JS 库 | 全部本地托管，无需外链 |

## 改动清单

| 文件 | 改动 |
| --- | --- |
| `public/exhibits/yingge/index.html` | 首屏导航「云游英歌」由第三方 H5 地址改为站内镜像 `mugeda/index.html`，去掉 `target="_blank"` |
| `public/exhibits/yingge/framework.html` | 「查看更多」改为 `mugeda/index.html`；页尾新增外链守卫脚本，把运行期被还原的绝对 http(s) 链接改写回站内镜像 |
| `public/exhibits/yingge/app.js` | 移动端导航数组与英文文案表各 1 处：第三方地址改为 `mugeda/index.html`；补 6 条「来源：」文案的英文对照 |
| `public/exhibits/yingge/regions.html` | 3 条 ihchina 项目页链接文案改为「来源：国家级非遗项目页」，`rel` 补 `noopener` |
| `public/exhibits/yingge/learn.html` | 5 条来源链接文案统一加「来源：」前缀，`rel` 补 `noopener` |
| `src/features/yingge-static/index.ts` | 新增 `YINGGE_JOURNEY_LOCAL` 常量，React 侧只允许用它跳「云游英歌」镜像 |
| `src/components/Footer.tsx` | 新增「外部链接只作来源署名与核对入口」说明；新增「云游英歌（本地镜像）」站内入口 |
| `src/routes/Sources.tsx` | 头部说明改为来源边界表述；每条来源标题前加「来源：」标签 |
| `src/features/yingge/pages/Home.tsx` | 三个申报地区项目页链接文案改为「来源：查看项目页 [Sxxx] ↗」 |
| `src/routes/Home.tsx` | 原始资料照片署名行加「来源：」标签 |

内容型外链共移除 **2 处**（`5.mgd5.com` 在 `index.html` 与 `framework.html`），另 **2 处** 同一地址出现在 `app.js` 的导航数据与文案表。站内已无 `wenjian.asia`、`5.mgd5.com` 作为导航终点。

## 保留的署名外链（不作为内容终点）

| 域名 | 数量 | 用途 | 落点 |
| --- | --- | --- | --- |
| `www.ihchina.cn` | 3（src）+ 7（展馆 HTML） | 国家级非遗名录项目页，事实核对 | 「来源：…项目页」 |
| `www.stpt.edu.cn` | 1 | 公开队伍资料，个案核对 | 「来源：队伍资料」 |
| `commons.wikimedia.org` | 6 | 首页与实拍素材原始文件页（许可要求） | 照片署名行「来源：」+ `/sources` |
| `creativecommons.org` | 8 | CC0 / CC BY / CC BY-SA 4.0 许可全文 | 「许可全文」链接 |

`content/sources.*.json` 里登记的来源域名（政府站、党报、百科、词典等）只经 `/sources` 页渲染，全部为署名与核对入口，本条任务不改 `content/**`。

## CDN / 字体 / 库

- 字体：`public/fonts` 自托管（思源宋体/思源黑体），无 Google Fonts 引用。
- JS：`three`、`gsap`、`minisearch` 走 npm 打包；展馆用 `public/exhibits/yingge/vendor/`。
- 样式：`public/exhibits/yingge/*.css` 无 `@import url(http…)`、无外部字体或图片。
- 结论：无需新增 TODO。

## 遗留与边界

1. `public/exhibits/yingge/mugeda/**` 内部的 `public_path`、`og:image` 等仍指向原第三方地址，由并行子代理负责。
2. `public/exhibits/yingge/_next/static/chunks/35x24vgauid6l.js` 是抓取页面自带的打包产物，内部仍含原地址字符串；运行时由 `framework.html` 的外链守卫改写，源文件不改（属于构建产物，手改会破坏完整性）。
3. `public/exhibits/yingge/exhibit-depth.js` 动态插入的队伍资料链接仍指向 `www.stpt.edu.cn`，属署名类来源，保留不改。
4. `app.js` 不在最初声明的可改后缀内，但两处均为导航外链，且不改会留下外部内容终点，故一并处理（已在上表标注）。

## 验证

```bash
npm run typecheck   # exit 0
npm test            # exit 0，17 个文件 / 154 条用例全部通过
npm run build       # exit 0
npm run validate    # exit 0，未发现阻断性内容问题
```

静态检查：

```bash
grep -rn 'mgd5\|wenjian' src public/exhibits/yingge/*.html public/exhibits/yingge/*.js   # 无输出
node --check public/exhibits/yingge/app.js                                               # 语法通过
```
