# 工夫茶模块 · 复用与素材记录

## 复用自 TeaDemo 的文件

参考项目：`/Users/albert/Documents/project/apps/TeaDemo`（React + TS + Vite demo）。

| TeaDemo 文件 | 本站对应文件 | 改动 |
|---|---|---|
| `src/components/TeaScene.tsx` | `src/features/tea/TeaScene.tsx` | 改为本站五步状态（stepIndex/done），移除组件内音效副作用，增加“茶席示意”说明 |
| `src/components/StepGuide.tsx` | `src/features/tea/StepGuide.tsx` | 去掉祝福语与随机文案；按钮始终可用；增加“项目页对应环节” |
| `src/utils/steps.ts` | `src/features/tea/steps.ts` | 步骤事实重新按 `content/entries.tea.json` 的 `tea-steps`（S2）归并；手势仅作演示映射 |
| `src/utils/SoundManager.ts` | `src/features/tea/sound.ts` | 默认关闭；只有用户手动开启后才创建 AudioContext；文案标注“合成音效” |
| `src/utils/gestures.ts` | `src/features/tea/gestures.ts` | 保留纯函数分类逻辑；新增 `GESTURE_LABELS`、`gestureFromHands` |
| `src/utils/gestures.test.ts` | `tests/tea-gestures.test.ts` | 从 `node:test` 改为 Vitest 断言，补 0 手与双手折叠用例 |
| `src/utils/HandTracker.ts` | `src/features/tea/handTracker.ts` | 去掉 CDN 回退，只加载本站 `public/media/tea/models`；动态 import 识别库；GPU 失败回退 CPU |
| `src/hooks/useHandGesture.ts` | `src/features/tea/useHandGesture.ts` | 增加显式 start/stop、加载/错误状态、严格时间戳、卸载清理与连续失败保护 |
| `src/components/CameraView.tsx` | `src/features/tea/GesturePanel.tsx` | 改为可选面板；权限/无设备/模型失败均给替代说明；加入实验功能与隐私提示 |
| `src/index.css`（茶席部分） | `src/features/tea/tea.css` | 配色改为 cream / brick / ink；选择器全部收在 `.tea-stage` 下；增加响应式与 `prefers-reduced-motion` 由全局样式接管 |

未复制：TeaDemo 的 `StartScreen.tsx`、`App.tsx`、Google Fonts 外链、原项目的牌面命名与文案。

## 许可证状态

- **TeaDemo 仓库根目录没有 LICENSE 文件**：其代码许可证**未声明**。本目录中的移植代码按“内部参考/待确认”处理，发布前应与原作者确认授权，不能假定为 MIT 或其他许可证。
- `@mediapipe/tasks-vision@0.10.22-rc.20250304`：`package.json` 的 `license` 字段为 **Apache-2.0**。
- `hand_landmarker.task`：从 TeaDemo 的 `public/models/hand_landmarker.task` 复制；TeaDemo 未单独声明该模型文件的许可证，上游 MediaPipe 模型资产需在发布前复核。
- 本模块没有下载或热链任何外部图片、视频、音频；茶席为纯 CSS 绘制，音效为 Web Audio 实时合成。

## 本地模型文件

目录：`public/media/tea/models/`

| 文件 | 大小 | 说明 |
|---|---:|---|
| `hand_landmarker.task` | 7.5 MB | HandLandmarker 模型，来自 TeaDemo |
| `wasm/vision_wasm_internal.js` | 199 KB | SIMD loader（来自本机 `@mediapipe/tasks-vision` 包） |
| `wasm/vision_wasm_internal.wasm` | 9.1 MB | SIMD wasm |
| `wasm/vision_wasm_nosimd_internal.js` | 199 KB | 无 SIMD 浏览器回退 loader |
| `wasm/vision_wasm_nosimd_internal.wasm` | 9.0 MB | 无 SIMD 浏览器回退 wasm |

合计约 **26 MB**；现代浏览器首次识别约加载 16.8 MB（模型 + SIMD pair），旧浏览器才会再取 non-SIMD 版本。所有文件都由本站静态托管，不向第三方请求，也不上传视频帧。

## 步骤事实边界

- 五步的 `sourceStage` 必须能在 `content/entries.tea.json` 的 `tea-steps` 正文中找到（`tests/tea-steps.test.ts` 会校验）。
- 项目页没有给出时长、温度、次数，页面与步骤文案不补。
- “关公巡城 / 韩信点兵”只作为来源中出现过的一种分茶说法，条目原文已注明“不作唯一标准”，演示界面不把它写成必要动作或唯一标准。
