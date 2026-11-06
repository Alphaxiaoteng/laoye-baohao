# 联调验收记录

日期：2026-11-05。以下为实际执行结果，不代表未执行的项目已经通过。

## 已通过

- `npm run typecheck`：exit 0。
- `npm test`：14 个测试文件、127 项测试通过（后续新增测试需重新计数）。
- `npm run validate`：exit 0；美食故事链已从占位条目改为 `food-beef-ball` / `food-kway-teow`。
- `npm run build`：exit 0；手势库单独分包。
- 生产式服务 `PORT=5191 npx tsx server/index.ts`：
  - `GET /api/health` 返回 HTTP 200，模型为 `deepseek-v4-1-flash-261017`。
  - 未配置密钥时 `POST /api/ask` 返回 SSE `error`，code `no_key`。
- 首页（ego lite，390px）：无横向溢出，11 个首页媒体实例均成功解码；模块图片在真实视口中显示正常。
- 移动端路由 `/museum/tea/brew`、`/recipe/recipe-beef-kway-teow-soup`、`/museum/yinglaoye/cases`、`/listen`：390px 下 `scrollWidth === innerWidth`。
- 工夫茶分步：点击下一步到第 2 步，问一问顶部显示「正在了解：工夫茶／第 2 步 · 取茶」。
- 问一问：发送问题后无密钥降级文案、重试与来源入口可见；关闭后焦点回到「问一问」按钮。
- 听潮：8 条真实授权音频；子代理实测新播停旧、切页停止、失败不自动重发。
- 美食：真实牛肉粿条汤食谱与 6 步 GUI；份量换算、计时恢复有单元测试。

## 首页设计检查

- 方向：`page-is-the-object`，seed `1052026939`；保留 PRD 品牌色与字体。
- 设计句：一夜巡境的故事路线成为一张可进入、可继续的「文化路引」。
- 实时元素：首页显示真实章节进度，并从下一未体验章节继续。
- `lint.mjs src/routes/Home.tsx src/routes/Home.css src/routes/homeMedia.ts`：0 FAIL、0 WARN。
- 因本机浏览器约定，未运行依赖系统 Chrome 的 `inspect.mjs`；已用 ego lite 截图检查 1440px 与 390px，并修复首页图片懒加载在整页截图中出现空白的问题（首页媒体改为直接加载）。

## 待完成 / 未验证

- 英歌模块最终联调与媒体来源检查。
- 真实 DeepSeek 上游回答质量、429 与 20 秒超时行为（等待 `LLM_API_KEY`，不在仓库保存密钥）。
- Docker `linux/amd64` 构建和魔搭创空间无痕访问。
- 微信内置浏览器与 320px 全页面回归。
- 摄像头手势未在真实人手前实测。
- 本地文化审核与 TeaDemo / 英歌复用素材授权确认。

## 主要截图

本地 `.taste-skill/`（不入库）：首页桌面与移动端、工夫茶、食谱、营老爷、听潮、问一问及无密钥降级。
