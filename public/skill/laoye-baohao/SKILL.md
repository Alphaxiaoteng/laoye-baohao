---
name: laoye-baohao
description: 查询「老爷保号」潮汕文化互动馆的站内资料（英歌舞、工夫茶、潮汕美食、营老爷、潮汕攻略、听潮、文献），返回带 [S#] 来源引用的答案；资料里没有就说没有。
---

# laoye-baohao · 老爷保号站内资料问答

这个 skill 让 agent 用一个 HTTP 接口或一行 CLI，查询本站已经整理好的潮汕文化资料，
并拿到带来源编号（`[S103]` 这种）的回答。**它不是通用知识库，也不是搜索引擎**：
答案只允许来自站内 `content/*.json`，站内没有的就说「资料里没有」。

站点两种形态都支持：

- 已部署线上站点：把下面命令里的 `$LAOYE_BASE` 换成站点域名（本站前端页面 `/skill` 页会显示当前 origin）。
- 本地起服务：`npm start`（默认 `http://127.0.0.1:7860`）。

```sh
LAOYE_BASE="http://127.0.0.1:7860"   # 或 https://你的部署域名
```

---

## 1. 站点内容总览（真实数据，来自 `/api/health`）

| 模块 id | 页面名 | 站内路由 | 内容量 |
| --- | --- | --- | --- |
| `yingge` | 英歌舞 | `/museum/yingge`、`/museum/yingge/:entry` | 8 条条目（项目与地区、看什么、角色位置、阵形、器物服饰、慢中快板、锣鼓、游神场合） |
| `tea` | 工夫茶 | `/museum/tea`、`/museum/tea/:entry` | 5 条条目（名录信息、流传范围与茶品、茶具、冲泡环节、关公巡城与韩信点兵） |
| `food` | 潮汕美食 | `/museum/food`、`/recipe/:id` | 3 条条目 + 4 份分步食谱（牛肉粿条汤、潮州牛肉丸、潮汕蚝烙、潮州卤鹅） |
| `yinglaoye` | 营老爷·游神 | `/museum/yinglaoye`、`/museum/yinglaoye/:entry` | 11 条条目（称呼、巡境、队伍、时间、4 个地区案例、社区参与、观礼提示） |
| `story` | 故事线 | `/story`、`/story/:chapter` | 5 章（原创虚构串联，标注 `fiction`） |
| `listen` | 听潮 | `/listen` | 21 条潮州话词条（问候、礼貌、茶食、文化四类，含读音与释义） |
| `guide` | 潮汕攻略 | `/guide` | 49 条小红书图文清洗稿（行程攻略 30 / 美食合集 9 / 家常做法 10，均为 `reference-only`） |
| 文献 | 历史介绍 | `/docs`、`/sources` | 按主题读站内正文（/docs）+ 完整来源表 99 条（/sources） |

健康检查里的实际计数：

```json
{"entries":27,"story":5,"recipes":4,"audio":21,"sources":99}
```

每条条目/食谱/来源都带 `verify` 核验状态：`verified`（已核验）、`draft-needs-local-review`（待本地核验）、
`fetched`（已抓取核对）、`index-only`（仅辅助索引）、`reference-only`（仅作参考）、`fiction`（虚构串联）。

---

## 2. HTTP API

### 2.1 `GET /api/health`

无参数，返回服务与内容概况。**不含任何密钥**，`ai.endpoint` 只有上游主机名。

```sh
curl -s "$LAOYE_BASE/api/health"
```

```json
{
  "status": "ok",
  "service": "laoye-baohao",
  "time": "2026-11-06T02:28:04.275Z",
  "ai": { "keyConfigured": true, "model": "deepseek-v4-1-flash-261017", "endpoint": "api.openai-next.com" },
  "content": { "entries": 27, "story": 5, "recipes": 4, "audio": 21, "sources": 99 },
  "limits": { "running": 0, "queued": 0 }
}
```

`ai.keyConfigured=false` 时问答会返回 `error: no_key`（见 2.3）。

### 2.2 `POST /api/ask`（SSE 流式）

请求头：`content-type: application/json`。

```json
{
  "question": "英歌有哪些阵形？",
  "context": { "module": "yingge", "entryId": "yingge-formation", "step": 1, "visited": ["yingge-intro"] },
  "history": [{ "role": "user", "content": "上一轮问题" }, { "role": "assistant", "content": "上一轮回答" }]
}
```

- `question` 必填，**最多 300 字**；空或超长 → `400 invalid_question`。
- `context` 全部可选：`module`（模块 id）、`entryId`（条目/食谱 id，用来消解「这个 / 我刚才看的」）、
  `step`（分步食谱第几步）、`visited`（本次会话打开过的条目 id，最多 30 个）。
- `history` 最多保留最后 12 条，每条 `content` 截断到 2000 字。
- 请求体超过 32 KB → `413 invalid_question`。

响应是 `text/event-stream`，事件为 `delta` / `done` / `error`：

```
event: delta
data: {"text":"据"}

event: delta
data: {"text":"汕头市地方标准的记载，潮阳英歌的基础队形有七种 [S103]"}

event: done
data: {"text":"完整回答（含 [S103] 标记）","citations":[{"id":"S103","title":"汕头市地方标准 DB 4405/T 315—2025《非物质文化遗产 潮阳英歌》","url":"https://..."}],"navs":[{"entryId":"yingge-formation","title":"阵形：名称、路线与边界","path":"/museum/yingge/yingge-formation"}],"uncertain":false,"truncated":false}
```

- `delta.text` 是可以直接拼接显示的增量文本；服务端会把没写完的 `[S` 尾巴先扣住，不会吐半个引用。
- `done.text` 是最终全文（可能被 `sanitizeAnswer` 清理过），`citations` 是白名单校验后的来源，
  `navs` 是站内条目导航（`path` 是站内相对路径，加 `$LAOYE_BASE` 才是完整 URL）。
- `uncertain=true` 表示回答里包含「资料里没有 / 不确定 / 待核验」这类限定，展示时不要丢掉这个提示。
- `truncated=true` 表示输出被 4000 字上限截断。
- 有些问题不发模型、直接返回 `done`（`direct: true`，`citations` 为空）：
  实时类（今天几点、票价多少、人多不多、天气）返回「本站没有实时活动数据」；
  「这个」没有指代对象时返回澄清；「我刚才看过什么」按真实浏览记录回答；点名条目的导航问题直接给站内路径。

### 2.3 错误与限流（必须处理）

| 情况 | HTTP | 内容 |
| --- | --- | --- |
| 限流：同一 IP **每分钟 6 次** | `429` | `{"error":{"code":"rate_limited","message":"提问有点频繁，请等一分钟再试"}}` |
| 并发满：并发 2 + 排队 10 | `503` | `{"error":{"code":"busy","message":"当前提问较多，请稍后再试"}}` |
| 请求体不是 JSON / 字段不合法 | `400` | `{"error":{"code":"invalid_question","message":"..."}}` |
| 请求体过大 | `413` | `{"error":{"code":"invalid_question","message":"请求体过大"}}` |
| 服务端没配模型密钥 | `200` + SSE `error` | `event: error` / `data: {"error":{"code":"no_key","message":"服务端未配置模型密钥，问答暂不可用"}}` |
| 上游超时（20 秒） | `200` + SSE `error` | `code: "timeout"` |
| 上游报错 | `200` + SSE `error` | `code: "upstream"` 或 `"rate_limited"`（已脱敏，不会带 key） |

**遇到 429 请等 60 秒以上再重试一次**；不要连发，也不要并发打这个接口。
其他 `/api/agent*`、`/api/voice*`、`/api/site-content` 一律返回 `503 not_available`，不要调用。

---

## 3. CLI（零依赖，POSIX sh）

```sh
# 流式提问，结束后打印 [S#] 来源列表
curl -fsSL "$LAOYE_BASE/skill/laoye-baohao/laoye.sh" | sh -s -- ask "英歌有哪些阵形？"

# 或下载后再用
curl -fsSL "$LAOYE_BASE/skill/laoye-baohao/laoye.sh" -o laoye.sh && chmod +x laoye.sh
./laoye.sh ask "工夫茶有哪几道工序？"
./laoye.sh health
LAOYE_BASE=https://你的域名 ./laoye.sh ask "营老爷的队伍里都有什么？"
```

- 子命令只有 `ask` 与 `health`。
- `ask` 内部就是 `POST /api/ask`，把 `delta` 直接打到标准输出，`done` 之后打印来源清单；
  遇 `429` 自动等 62 秒重试一次，`503` 等 8 秒重试一次。
- 环境变量 `LAOYE_BASE` 覆盖服务地址，默认 `http://127.0.0.1:7860`。

---

## 4. 回答约定（照抄这套，不要自己发挥）

本站的系统提示词已经约束了模型，agent 侧要守住同样的边界：

1. **引用必须落在 `[S#]` 上**：只能在句末标来源编号，编号必须是回答里 `citations` 给出的那些。
   站外信息、你自己的常识、推测都不能挂 `[S#]`。
2. **资料没有就说没有**：史实、年份、村落、人物、菜谱比例、读音、仪式细节，站内资料没写的，
   直接回答「资料里没有」，不要补常识、不要「一般来说」。
3. **没有实时数据**：票价、今天/今年活动时间、几点开始、人多不多、天气，一律「资料里没有实时信息」。
4. **写清适用范围**：地区、村落、年份必须带出来，不能把某村某年的做法说成全潮汕通则；
   旧日期要说明是旧日期。
5. **核验状态要保留**：`draft-needs-local-review`、`reference-only`、`fiction` 的内容被引用时要点明，
   不要把待核验内容说成定论。故事线是原创虚构串联，不是仪式记录。
6. **跨模块别编因果**：资料没有直接把两者联系起来时，就说「资料里没有把两者直接联系起来的说明」。
7. **不写运势、神谕、保佑承诺，不编禁忌**；也不给未经核验的参与建议（如触碰神像、穿越队伍）。
8. **别改写成 Markdown 标题/表格**：站内回答是纯文本短句，默认 3-5 句。
9. 需要指路时可以带上 `navs` 里的站内路径（`$LAOYE_BASE` + `path`），不要编造站外链接。

---

## 5. 最小调用示例（agent 可直接跑）

```sh
# 1. 先确认服务活着
curl -s "$LAOYE_BASE/api/health" | head -c 200

# 2. 提问（拿最终答案与引用；-N 关闭缓冲，保证流式）
curl -sN -X POST "$LAOYE_BASE/api/ask" \
  -H 'content-type: application/json' \
  --data '{"question":"英歌有哪些阵形？","context":{}}'

# 3. 只想看最终结果与引用，可以过滤 done 事件
curl -sN -X POST "$LAOYE_BASE/api/ask" \
  -H 'content-type: application/json' \
  --data '{"question":"营老爷的时间一般怎么说？","context":{"module":"yinglaoye"}}' \
  | awk '/^event: done/{f=1;next} f&&/^data: /{sub(/^data: /,"");print}'
```

本地没有服务时 `curl` 会连接失败（exit 7），这属于「服务未启动」，不要当成资料缺失。

---

## 6. 不要做的事

- 不要抓取或重建站内页面当语料：直接问 `/api/ask`，它已经把检索做完了。
- 不要把 `/api/ask` 的返回包装成「权威结论」；它只是站内资料的复述，非遗内容以官方发布与传承人说法为准。
- 不要在客户端保存、打印或转述任何密钥；`/api/health` 里没有密钥，也不需要密钥即可调用。
- 不要并发压测这个接口：限流 6 次/分钟，并发上限 2。
