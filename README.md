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
| `LLM_BASE_URL` | OpenAI 兼容上游，默认 `https://api.openai-next.com/v1`；也可直接写完整 `/chat/completions` 地址 |
| `LLM_MODEL` | 默认 `deepseek-v4-1-flash-261017`；兼容旧的 `MODEL_ID` |
| `LLM_API_KEY` | 只在服务端读取；缺失时 `/api/ask` 返回 SSE `error`（code `no_key`），其余页面不受影响；兼容旧的 `MODELSCOPE_API_KEY` |
| `PORT` | 可选，默认 `7860`，监听 `0.0.0.0` |

本地开发可在项目根目录建 `.env`（不要提交）；服务端启动时会自动读取，且不覆盖已注入的环境变量。仓库只保留 `.env.example`。

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
content/                 内容 JSON；entries/recipes/audio/sources 可按模块拆成 <类型>.<模块>.json
server/index.ts          静态托管、/api/health、/api/ask、SPA fallback
server/ask.ts            提示词拼装、引用与导航校验、并发队列、IP 限流
server/ask-index.ts      minisearch 内存索引、上下文加权与消歧（不引入向量库）
server/ask-env.ts        本地 .env 读取（仅服务端，不打印值）
server/content.ts        服务端只读取 content/ 用于问答
scripts/validate-content.ts  内容门禁（纯函数 + CLI）
src/types/content.ts     内容模型（前后端共用）
src/lib/                 内容读取与兜底、本地存储、问答客户端、手记生成
src/store/               progress / journal / askContext / audio
src/components/          AskDrawer、AudioCard、AudioPlayerProvider、StepPager、SourceBadge、VerifyBadge、Nav、自绘 SVG
src/routes/              首页、故事、文化馆、通用条目、手记、来源、关于
src/features/            各模块专属页面与路由；registry.ts 统一登记，优先于通用页
tests/                   vitest + qa-cases.json 问答评测集
public/audio/test-tone.mp3  程序生成的 1 秒 440Hz 纯音（播放器自检，非方言）
```

## 路由表

通用路由集中在 `src/App.tsx`；模块专属路由在各 `src/features/<module>/index.tsx`，由 `src/features/registry.ts` 汇总并优先匹配。

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

模块专属页面：

| 模块 | 路由与入口 |
|---|---|
| 英歌 `yingge` | `src/features/yingge/`：阵形、角色器物、影像、锣鼓等专属页 |
| 工夫茶 `tea` | `/museum/tea`、`/museum/tea/brew`、`/museum/tea/gesture`；入口 `src/features/tea/` |
| 美食 `food` | `/museum/food`、`/museum/food/menu`、`/recipe/:id`；入口 `src/features/food/` |
| 营老爷 `yinglaoye` | `/museum/yinglaoye`、`/procession`、`/cases`；入口 `src/features/yinglaoye/` |
| 听潮 | `/listen`、`/listen/:category`；入口 `src/features/listen/` |
| 问一问 `ask` | 全站浮层：`src/components/AskDrawer.tsx`、`server/ask-index.ts` |

### 模块扩展约定（可插拔）

1. 新页面放在对应 `src/features/<module>/`，在该目录 `index.tsx` 导出路由数组；不要改其他模块。
2. 页面内复用 `usePageContext`（上报问一问上下文）、`VerifyBadge` / `SourceList`、`useProgressStore` / `useJournalStore`。
3. 内容写入本模块自己的 `content/<类型>.<模块>.json`，前端、服务端和内容门禁会合并读取；来源 ID 全站唯一。
4. 改内容后必须跑 `npm run validate`；交付前跑 `npm run typecheck && npm test && npm run build`。

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
- 响应为 SSE：`delta`（增量文本）、`done`（最终文本 + `citations` + `navs` + `uncertain`，澄清/浏览回顾还会带 `clarify` / `direct`）、`error`（`{code, message}`）。
- 检索：服务端用 `minisearch` 对 `content/` 的条目、食谱、听潮词条与故事章节建内存索引（中文按单字 + 相邻二字切分），按当前 module / entryId / step 大幅加权；当前条目优先给全文，跨模块只召回少量相关摘要或节选，不会把整站正文塞进提示词。
- 消歧：`这个 / 这一步 / 刚才看的` 先按当前页面，再按 `history` 与真实 `visited` 解析；仍不确定时服务端直接返回澄清问题，不调用模型。
- 会话回顾：只根据 `visited` 列真实打开过的条目，没有记录就直说没有，不编造浏览历史。
- 服务端在流结束后校验：不存在的 `[S#]` 与 `[[nav:id]]` 会被删除；`citations` 只包含真实来源，`navs` 只包含真实条目 / 食谱（路径 `/museum/:module/:entryId`、`/recipe/:id`）；来源没有 URL 时前端只显示标题，不生成假链接。
- 保护：全局并发 2、排队上限 10（超出 503）、按 IP 每分钟 6 次（超出 429）、上游 20 秒超时、输出上限 4000 字符。
- 无 `LLM_API_KEY` 时返回 `error` 事件，code `no_key`，前端提示「暂时无法回答，你仍可继续浏览」并提供重试与来源页入口。

## 边界（写进产品，不只是文档）

- 媒体不热链：使用的图片、视频和音频均自托管，并在页面或对应 `ASSETS.md` 登记作者、原链接与许可；示意图标注「示意图，非某地标准」。
- 听潮使用 Wikimedia Commons 的 CC BY-SA 4.0 录音并完整署名；没有授权的文件不会上线，不做 TTS、不做跟读评分。
- 故事为原创虚构串联，章节里的事实信息一律由条目页的来源支撑。
- 不写运势、神谕、保平安承诺，不模拟神明发言，不使用任何 AI 人设名。
- 密钥只在服务端环境变量；仓库只有 `.env.example`。

## 容器与魔搭创空间

```bash
docker build --platform linux/amd64 -t laoye-baohao .
docker run --rm -p 7860:7860 \
  -e LLM_BASE_URL=https://api.openai-next.com/v1 \
  -e LLM_MODEL=deepseek-v4-1-flash-261017 \
  -e LLM_API_KEY=... laoye-baohao
```

魔搭选择 **Docker 创空间**：根目录 `Dockerfile`，服务监听 `0.0.0.0:7860`，基础镜像支持 amd64。`LLM_API_KEY` 配置为创空间「空间密钥」，不要写入 Git；前端请求不得使用 `Authorization`、`X-modelscope-*`、`X-studio-*` 头。创建 Docker 创空间前，账号需按平台要求完成阿里云绑定与实名。部署后用无痕窗口分别验证平台页和独立 `*.ms.show` 地址，并在演示前提前唤醒休眠实例。

## 已知限制

- 听潮已有 8 条 Wikimedia Commons CC BY-SA 4.0 录音，但尚未请潮汕母语者逐条复核词义与口音。
- 牛肉粿条汤食谱依据 T/CZSPTXH 001-2018 整理；展馆步骤只是「了解制作」，不替代火候、熟度与食品安全判断。
- 多数文化条目仍是 `draft-needs-local-review`，上线前需本地文化审核。
- TeaDemo 仓库未声明 LICENSE；手势模型与wasm已自托管，发布前需复核上游 MediaPipe 模型许可。复用参考项目的内部溯源见各模块 `ASSETS.md`。
- 不提供任何实时活动、人流或票务信息；问一问尚未做真实上游评测，未配置 `LLM_API_KEY` 时会明确降级。
- 潮剧与工艺（P1）只在来源页列出，没有独立体验页。
