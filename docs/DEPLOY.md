# 部署与密钥安全

本文只写「怎么把服务跑起来、密钥怎么进容器、怎么确认没有泄露」。本地开发命令、API 契约与内容模型见根目录 `README.md`，不在这里重复。

## 1. 运行形态

- 单进程 Node + Hono：`server/index.ts` 同时托管 `dist/` 静态页面与 `/api/*`。
- 监听 `0.0.0.0:7860`（`PORT` 可覆盖），时区无关，不依赖任何数据库或外部存储。
- 构建产物 `dist/` 由 `npm run build` 生成，仓库与镜像里都不应出现 `.env`。

## 2. 环境变量（只列名称）

| 变量 | 必需 | 说明 |
|---|---|---|
| `LLM_API_KEY` | 是 | OpenAI 兼容上游密钥。只在服务端读取；缺失时 `/api/ask` 返回 SSE `error`，code `no_key`，其余页面正常 |
| `LLM_BASE_URL` | 否 | 默认 `https://api.openai-next.com/v1`（14 号供应商）；也可直接写完整 `/chat/completions` 地址 |
| `LLM_MODEL` | 否 | 默认 `deepseek-v4-1-flash-261017`；兼容旧变量 `MODEL_ID` |
| `PORT` | 否 | 默认 `7860` |

兼容别名：`MODELSCOPE_API_KEY` 仅在未设置 `LLM_API_KEY` 时作为回退读取。

仓库里只保留 `.env.example`（只有变量名与默认地址，不含任何真实值）。真实 `.env` 已被 `.gitignore` 忽略，`npm run build` 也不会把服务端环境变量注入前端 bundle。

## 3. 密钥注入路径

### 3.1 本地开发

```bash
cp .env.example .env     # 然后只在本地填入 LLM_API_KEY
npm run dev:server
```

`server/ask-env.ts` 只读取项目根目录 `.env`，不覆盖已经注入的环境变量，不打印、不回传任何值。不要提交 `.env`。

### 3.2 Docker

```bash
npm run build
docker build --platform linux/amd64 -t laoye-baohao .

docker run --rm -p 7860:7860 \
  -e LLM_BASE_URL=https://api.openai-next.com/v1 \
  -e LLM_MODEL=deepseek-v4-1-flash-261017 \
  -e LLM_API_KEY='<YOUR_KEY>' \
  laoye-baohao
```

- 密钥只能通过 `-e` / `--env-file`（该文件不入库）/ 编排平台的 Secret 注入。
- 不要把密钥写进 `Dockerfile`、`ARG`、`ENV`、构建参数或 `docker build --build-arg`：这些都会留在镜像层与构建缓存里。
- `.dockerignore` 已排除 `.env`、`.env.*`（保留 `.env.example`）、`dist`、`.git`、`tests`、`docs` 与本地素材目录。

### 3.3 魔搭创空间

1. 选择 **Docker 创空间**，根目录 `Dockerfile`，端口 `7860`。
2. 在创空间设置里把 `LLM_API_KEY` 配成「空间密钥 / Secret」，不要写进仓库或 `Dockerfile`。
3. 前端不得发送 `Authorization`、`X-modelscope-*`、`X-studio-*` 头；浏览器只发 `content-type: application/json`，密钥只在服务端拼进上游请求。
4. 创建前按平台要求完成账号绑定与实名；演示前提前唤醒休眠实例。

### 3.4 自有主机（systemd 示例）

```ini
# /etc/laoye-baohao.env 权限 600，属主为运行服务的账号
LLM_API_KEY=<YOUR_KEY>
LLM_BASE_URL=https://api.openai-next.com/v1
LLM_MODEL=deepseek-v4-1-flash-261017
```

`EnvironmentFile=` 指向该文件，`ExecStart=` 使用 `node --import tsx server/index.ts`。不要把密钥写进单元文件后提交到任何仓库。

## 4. 三道保险

1. **不进 Git**：`.gitignore` 忽略 `.env` / `.env.local`；提交前用 `git status --porcelain` 确认没有 `.env`。
2. **不进镜像**：`.dockerignore` 排除 `.env*`；构建阶段不读取密钥，运行阶段才注入。
3. **不进前端**：密钥只在 `server/**` 读取；Vite 构建不会把 `process.env.LLM_API_KEY` 注入客户端代码。

服务端额外做了两层收敛：

- `/api/health` 只返回 `keyConfigured: true/false`、模型名与上游主机名（不含路径与凭据）。
- 上游异常会先经过 `redactSecrets()`，把 `Bearer …`、`sk-…`、`api_key=…`、`authorization: …` 替换成 `***` 再写进 SSE `error` 事件与日志。

## 5. 部署后验收

```bash
# 1) 服务活着
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:7860/api/health       # 期望 200

# 2) 密钥状态只暴露布尔值，不返回 key
curl -s http://127.0.0.1:7860/api/health | grep -o '"keyConfigured":[a-z]*'
curl -s http://127.0.0.1:7860/api/health | grep -i 'sk-\|bearer\|api_key' || echo 'no key in health'

# 3) 无密钥时按契约降级（去掉 -e LLM_API_KEY 再启动一次）
curl -N -s -X POST http://127.0.0.1:7860/api/ask \
  -H 'content-type: application/json' \
  -d '{"question":"工夫茶是什么？","context":{},"history":[]}'
# 期望：event: error；data: {"error":{"code":"no_key",...}}

# 4) 构建产物不含密钥
grep -rIl -E 'sk-[A-Za-z0-9]{10,}|LLM_API_KEY[[:space:]]*=[[:space:]]*[^[:space:]]+' dist/ || echo 'dist clean'
```

日志检查：启动日志只应出现 `key=configured` 或 `key=missing`，不应出现密钥、完整 `Authorization` 或上游请求体。

## 6. 轮换与失效处理

1. 在上游控制台新建 key，先在测试环境注入并跑一次最小提问。
2. 更新部署平台的 Secret / `EnvironmentFile`，重启服务。
3. 确认 `/api/health` 的 `keyConfigured` 为 `true`，再删除旧 key。
4. 如果只看到 `no_key`，先检查变量名是否拼成 `LLM_API_KEY`（不是 `LLM_KEY`），以及容器里是否真的注入了该变量。

## 7. 已知边界

- 本站不提供实时活动、人流、票务信息；上游只用于站内资料问答。
- 服务端并发 2、排队上限 10、按 IP 每分钟 6 次；上游 20 秒超时，输出上限 4000 字符。这些都在代码常量里，不需要环境变量。
- 未做真实上游质量评测与压力测试；上线前需用真实 key 跑一遍问答评测集 `tests/qa-cases.json`。

## 8. 攻略数据与自维护

```bash
# 抓取小红书攻略（本机跑一次即可；需要 TIKHUB_API_KEY）
TIKHUB_API_KEY=... npm run fetch:guide
# 产出：content/guides.json、content/sources.guide.json、public/media/guide/*.webp

# 每日体检（不调用模型、不产生费用）
npm run maintain
# 产出：docs/maintenance-report.json；校验不通过时非零退出
```

crontab 示例（每天 08:10 体检，每周一刷新攻略）：

```cron
10 8 * * *  cd /srv/laoye-baohao && /usr/bin/npm run maintain >> /var/log/laoye-maintain.log 2>&1
30 3 * * 1  cd /srv/laoye-baohao && TIKHUB_API_KEY=$(cat /etc/laoye/tikhub.key) /usr/bin/npm run fetch:guide >> /var/log/laoye-guide.log 2>&1
```

规则：
- `maintain` 只报告、不改内容；校验失败时保留上一版，人工处理后再发布。
- 抓取在本地完成，抓取结果进 git 前必须人工过一遍；不要把 API Key 写进仓库。
- 站外检索兜底需要 `WEB_SEARCH_URL`（可选 `WEB_SEARCH_KEY`），不配置即关闭。

## 9. Agent 评测

```bash
npm run eval:agent    # 59 条离线用例，不调用模型、不产生费用
```

当前基线见 `docs/AGENT-EVAL.md`。拿到模型 Key 后，需要补一次端到端抽检：每个模块 20 条真实提问，
人工核对「有没有答到点上、有没有编、引用对不对」；这一步不能用手工构造的检索指标替代。
