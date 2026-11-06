# 老爷保号

潮汕文化互动馆。文化事实只写在 `content/`，页面只展示这些文件里已有的说法。

## 每次改动

1. 事实、读音、菜谱、日期写进对应的 `content/<集合>.json` 或 `content/<集合>.<模块>.json`，并挂已有 `sourceIds`。两种文件名合成同一集合，合并规则在 `server/content.ts` 的 `collectionFiles`。来源编号全站唯一。
2. 新页面放进 `src/features/<module>/`，由该目录 `index.tsx` 导出路由，`src/features/registry.ts` 汇总。
3. 问一问的检索、引用和降级在 `server/ask.ts` 与 `server/ask-index.ts`。
4. 改内容后 `npm run validate` 通过。改类型或问答后 `npm run typecheck` 与 `npm test` 通过。

## 按任务打开

- 部署、密钥、容器：`docs/DEPLOY.md`
- 问答评测：`docs/AGENT-EVAL.md`
- 外链与媒体署名：`docs/EXTERNAL-LINKS.md`，以及对应模块的 `ASSETS.md`
- 产品范围原文：`docs/PRD.txt`
- 路由、脚本、字段说明：`README.md` 与 `package.json`

视觉任务只打开相关页面和它的 `ASSETS.md`。视频、wasm、字体、木疙瘩离线包留在磁盘上。

## 页面核对

版式、字体、动效或页面上的字有改动，结束前用 `ego-browser` 核对。先跑 `ego-browser skill`，按它打印的指南操作。本仓库的页面核对用它。Cursor 自带浏览器和 computer-use 不作为默认。找不到 `ego-browser` 就说明，不要跳过核对。
