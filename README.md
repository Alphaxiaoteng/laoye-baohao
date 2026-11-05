# 老爷保号｜跟着故事，走进潮汕文化

一座可以跟着故事逛、动手体验、随时提问的潮汕文化互动馆（比赛 Demo，V1）。

- 英歌舞、工夫茶、潮汕美食、营老爷·游神四个模块，各有一条可以完成的入门体验；
- 独立的「听潮」词句播放页；
- 全站悬浮「问一问」，带引用校验、站内导航与降级处理；
- 手记只汇总真实操作，不把「浏览步骤」写成「亲手完成」。

> 本仓库是产品实现，不是已完成的用户研究或文化论证。所有文化内容来自 `content/*.json`，每条都带来源编号与核验状态；未完成核验的内容显示「待核验 / 待补充来源 / 待本地审核」，不会用模型常识补写。

## 技术栈

| 层 | 选择 |
|---|---|
| 前端 | Vite + React 18 + TypeScript + Tailwind + react-router + zustand（localStorage，失败降级内存） |
| 后端 | Hono + @hono/node-server，托管 `dist/` 与 `/api/health`、`/api/ask` |
| 运行 | Node 20+，npm；`tsx` 直接运行 TypeScript 服务端 |
| 容器 | 多阶段构建 `node:20-slim`，监听 `0.0.0.0:7860` |

## 本地运行

```bash
npm install
npm run dev          # 前端 http://localhost:5173（/api 代理到 7860）
npm run dev:server   # 另开一个终端跑后端 http://localhost:7860
```

生产式运行：

```bash
npm run build
PORT=7860 npm start
# 打开 http://localhost:7860
```

环境变量（见 `.env.example`）：

| 变量 | 说明 |
|---|---|
| `MODELSCOPE_API_KEY` | 只在服务端读取；缺失时 `/api/ask` 返回 SSE `error`（code `no_key`），其余页面不受影响 |
| `MODEL_ID` | 可选，默认 `Qwen/Qwen3-235B-A22B-Instruct-2507` |
| `PORT` | 可选，默认 `7860`，监听 `0.0.0.0` |

## 脚本

| 命令 | 作用 |
|---|---|
| `npm run validate` | 内容门禁：来源引用、ID 唯一、verified 必须有来源、音频有文件必须有 license；失败 exit 1 |
| `npm run typecheck` | `tsc --noEmit`（前端 + 服务端 + 脚本 + 测试） |
| `npm test` | vitest：引用校验、导航校验、限流队列、音频单例、手记真实状态、内容门禁 |
| `npm run build` | 产出 `dist/` |
| `npm start` | 启动 Hono 服务（静态托管 + API） |

## 目录

```
content/                 六份内容 JSON（entries / story / recipes / audio / sources / media）
server/index.ts          静态托管、/api/health、/api/ask、SPA fallback
server/ask.ts            提示词拼装、引用与导航校验、并发队列、IP 限流
server/content.ts        服务端只读取 content/ 用于问答
scripts/validate-content.ts  内容门禁（纯函数 + CLI）
src/types/content.ts     内容模型（前后端共用）
src/lib/                 内容读取与兜底、本地存储、问答客户端、手记生成
src/store/               progress / journal / askContext / audio
src/components/          AskDrawer、AudioCard、AudioPlayerProvider、StepPager、SourceBadge、VerifyBadge、Nav、自绘 SVG
src/routes/              首页、故事、文化馆、模块、条目、食谱、听潮、手记、来源、关于
tests/                   vitest + qa-cases.json 问答评测集
public/audio/test-tone.mp3  程序生成的 1 秒 440Hz 纯音（播放器自检，非方言）
```

## 路由表

路由全部集中在 `src/App.tsx`（文件内按「骨架 / 文化馆 / 独立功能 / 模块扩展位」分组）。

| 路径 | 页面文件 |
|---|---|
| `/` | `src/routes/Home.tsx` |
| `/story` | `src/routes/StoryIndex.tsx` |
| `/story/:chapter` | `src/routes/StoryChapter.tsx` |
| `/museum` | `src/routes/MuseumIndex.tsx` |
| `/museum/:module` | `src/routes/ModulePage.tsx` |
| `/museum/:module/:entry` | `src/routes/EntryPage.tsx` |
| `/recipe/:id` | `src/routes/RecipePage.tsx` |
| `/listen` | `src/routes/Listen.tsx` |
| `/journal` | `src/routes/Journal.tsx` |
| `/sources` | `src/routes/Sources.tsx` |
| `/about` | `src/routes/About.tsx` |
| `*` | `src/App.tsx` 内联 404 |

模块页面的入口文件（后续模块 agent 从这里接手）：

| 模块 | 模块首页 | 条目页 | 专属组件 |
|---|---|---|---|
| 英歌 `yingge` | `src/routes/ModulePage.tsx` | `src/routes/EntryPage.tsx` | `src/components/interactions/YinggeInteractive.tsx`、`src/components/figures/FormationDiagram.tsx` |
| 工夫茶 `tea` | 同上 | 同上 | `src/components/interactions/TeaPour.tsx`、`src/components/figures/TeaSetDiagram.tsx` |
| 美食 `food` | 同上 | 同上 | `src/routes/RecipePage.tsx`、`src/components/StepPager.tsx` |
| 营老爷 `yinglaoye` | 同上 | 同上 | `src/components/figures/ProcessionDiagram.tsx` |
| 听潮 `tingchao` | `src/routes/Listen.tsx` | — | `src/components/AudioCard.tsx`、`src/components/AudioPlayerProvider.tsx`、`src/store/audio.ts` |
| 问一问 `ask` | 全站浮层 | — | `src/components/AskDrawer.tsx`、`src/lib/askClient.ts`、`server/ask.ts` |

### 模块扩展约定（可插拔）

1. 新页面放 `src/features/<module>/`（目录尚未创建，新 agent 自行新建），例如 `src/features/yingge/RolesPage.tsx`。
2. 在 `src/App.tsx` 的 `===== 模块扩展位 =====` 注释块里加**一行** `<Route path="/museum/yingge/roles" element={<RolesPage />} />`，不要改其他路由。
3. 页面内复用现成原语：`usePageContext`（上报问一问上下文）、`VerifyBadge` / `SourceBadges` / `SourceList`（核验与来源）、`StepPager`（分步）、`AudioCard`（播放）、`useProgressStore` / `useJournalStore`（真实进度与手记）。
4. 文化内容仍只从 `content/*.json` 读取，组件里不写死文化事实；自绘 SVG 必须标注「示意图，非某地标准」。
5. `npm run validate` 是内容门禁，改内容后必须跑；`npm run typecheck && npm test && npm run build` 是代码门禁。

## 内容模型

`content/entries.json`：`{id, module, title, summary, body, region, sourceIds[], verify}`
`content/story.json`：`{id, order, title, fiction, narrative, entryIds[], action}`
`content/recipes.json`：`{id, name, region, servings, ingredients[], tools[], steps[], safety[], sourceIds[], verify}`
`content/audio.json`：`{id, category, text, meaning, accent, pinyin?, file, recorder, license, sourceIds[]}`
`content/sources.json`：`{id, title, org, url, region, accessDate, verify, module}`
`content/media.json`：`{id, file, type, author, license}`（首版只有自绘 SVG，可为空）

枚举约定：

- `entries.verify`：`verified` / `draft-needs-local-review` / `pending-source`
- `sources.verify`：`fetched`（已抓取核对）/ `fetch-failed`（抓取失败）/ `index-only`（辅助索引）/ `reference-only`（仅作参考）
- `module`：`yingge` / `tea` / `food` / `yinglaoye`；来源表另有 `tingchao`（听潮）、`opera`（潮剧与工艺 P1）
- `story.action`：`beat` / `formation` / `pour` / `recipe` / `cards` / `none`
- `audio.category`：`greeting` / `tea-food` / `courtesy` / `culture`

前端对内容做了防御：条目 `verify` 不是 `verified` 时显示核验徽标；正文为空或为 `pending-source` 时显示「内容待补充可靠来源」；音频 `file` 为空时按钮禁用并显示「音频待授权录制」。

## /api/ask 契约

请求：

```json
{
  "question": "最多 300 字",
  "context": { "module": "tea", "entryId": "tea-steps", "step": 2, "visited": ["tea-intro"] },
  "history": [{ "role": "user", "content": "…" }]
}
```

- `history` 最多取最近 12 条消息（6 轮）；`context` 只保留结构字段。
- 前端只发送 `content-type`，不带 `Authorization` / `X-modelscope-*` / `X-studio-*` 头。
- 响应为 SSE：`delta`（增量文本）、`done`（最终文本 + `citations` + `navs` + `uncertain`）、`error`（`{code, message}`）。
- 服务端在流结束后校验：不存在的 `[S#]` 与 `[[nav:id]]` 会被删除；`citations` 只包含真实来源，`navs` 只包含真实条目（路径 `/museum/:module/:entryId`）。
- 保护：全局并发 2、排队上限 10（超出 503）、按 IP 每分钟 6 次（超出 429）、上游 20 秒超时、输出上限 4000 字符。
- 无 `MODELSCOPE_API_KEY` 时返回 `error` 事件，code `no_key`，前端提示「暂时无法回答，你仍可继续浏览」并提供重试与来源页入口。

## 边界（写进产品，不只是文档）

- 不下载、不热链任何外部图片/视频/音频；页面图示都是自绘 SVG，标注「示意图，非某地标准」，不画人物与神像。
- 听潮没有授权录音时按钮禁用，不做 TTS、不做跟读评分。
- 故事为原创虚构串联，章节里的事实信息一律由条目页的来源支撑。
- 不写运势、神谕、保平安承诺，不模拟神明发言，不使用任何 AI 人设名。
- 密钥只在服务端环境变量；仓库只有 `.env.example`。

## 容器

```bash
docker build --platform linux/amd64 -t laoye-baohao .
docker run --rm -p 7860:7860 -e MODELSCOPE_API_KEY=... laoye-baohao
```

## 已知限制

- 听潮暂无授权方言录音（`audio.json` 的 `file` 为空），页面只展示词句结构与「音频待授权录制」。
- 食谱内容为占位（`verify: pending-source`），只展示分步界面，不构成制作指导。
- 英歌角色与阵形细节、美食菜品条目仍在等本地文化审核者补充。
- 不提供任何实时活动、人流或票务信息。
- 潮剧与工艺（P1）只在来源页列出，没有独立体验页。
- 内容版权与媒体授权须在上线前逐项复核（`content/sources.json` 只是索引，不等于获得转载授权）。
