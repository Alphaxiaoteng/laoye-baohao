# 英歌（yingge）展区静态资源登记

本文件登记 `public/exhibits/yingge/` 下所有第三方 / 外采素材的来源、许可与本地化方式。
新增素材请按同样格式追加，不要覆盖已有条目。

---

## 1. 木疙瘩 H5 离线包 — `mugeda/`

### 来源

| 项 | 值 |
|---|---|
| 原站 | `https://5.mgd5.com/c/oiru/8vtt/index.html` |
| 标题 | 云游英歌舞数字博物馆 |
| 描述 | 槌影翻飞，鼓韵回响。跟随英歌小槌，邂逅四百年中华战舞，线上解锁非遗英歌舞的世界。 |
| 制作平台 | 木疙瘩 Mugeda（H5 交互动画） |
| 播放器版本 | `0.4.13`（`_mrmcp.version`） |
| 发布版本 | `publishTime=1789790222273`（`Sat Sep 19 2026 11:57:02 GMT+0800`） |
| 抓取时间 | 2026-11-06 |
| 抓取方式 | 整站镜像（`index.html` + 相对路径资源树），非截图、非录屏 |

### 目录结构

```
mugeda/
├── index.html                                     # 入口（已做离线化改造，见下）
├── js/
│   ├── mugeda_smart_renderer_0.4.13.js            # 播放器内核（708 KB）
│   ├── mugeda_utils_0.4.13.js                     # 播放器工具库（214 KB）
│   ├── mugeda_smart_renderer_slateText_0.4.13.js  # 富文本渲染插件
│   ├── mugeda_smart_renderer_loadProcess_0.4.13.js# 加载进度插件
│   ├── card_common_0.4.13.js                      # 通用库（内含 Base64 实现）
│   ├── 6a45de2a14ff4e80ed02b1fd.js                # 作品数据（场景/图层/动画，575 KB）
│   ├── actions_6a45de2a14ff4e80ed02b1fd.js        # 作品交互逻辑（31 KB）
│   ├── publish_status.js                          # 发布状态角标
│   ├── review.js / mraid.js                       # 原站即为 0 字节占位，保留以对齐加载顺序
├── images/   201 个（44 MB，PNG/JPG/GIF，含场景美术与 logo）
├── audios/    10 个（1.9 MB，MP3，展厅旁白与音效）
├── videos/     1 个（22 MB，MP4）
└── fonts/    117 个（1.3 MB，TTF，作品内嵌字体切片）
```

合计 **342 个文件 / 71 MB**（其中 `videos/6a9259fa06574349030cc336.mp4` 单文件 22 MB）。

### 离线化改动

`index.html`：

- 所有 `https://5.mgd5.com/c/oiru/8vtt/...` 绝对地址改为相对路径（`og:image`、`og:url`、`_mrmcp.thumb`）。
- 删除 `card.mugeda.com/scripts/config.js`（只负责微信 `ticketUrl`／`appId` 分支，与播放无关）。
- 删除 `res.wx.qq.com/open/js/jweixin-1.6.0.js`（微信 JS-SDK，非微信环境本就不生效）。
- 删除 `card.mugeda.com/pv/*.gif` 三条 PV 统计脚本——**原逻辑是「命中即 `location.href` 跳转」到审核中/超限提示页，会劫持离线页**。
- `_mrmcp.stat_host` / `ga_url` / `track_bot` 置空或置为 `data:,`，杜绝统计请求；`data_server` 置空。
- 原 `public_path` 外链判断块改写为等价的 `window.mugedaOutsideStorage = false`。
- 顶部加入 HTML 注释，说明来源、改动与残留依赖。

`js/actions_6a45de2a14ff4e80ed02b1fd.js`：

- 移除对 `https://yinggemus.cn/mugeda-agent.js` 的注入（「英歌小槌」AI 导览，依赖在线接口，无法离线化），保留 `window.YINGGE_MUGEDA_AGENT_CONFIG` 占位。

### 已知残留 / 限制

| 项 | 说明 |
|---|---|
| `https://weika.mugeda.com` | 木疙瘩「微卡」数据服务，仅用于云端动态字体 `cloudfont.php` 与用户留言收集。本作品的文字与 117 个字体切片均已静态打包，实测加载全程**不发起任何请求**。 |
| 自动播放 | 浏览器 autoplay 策略会阻止未经用户交互的音频/视频，首次点击后恢复正常。原站行为一致。 |
| `file://` 直开 | 不支持。字体与图片经 `fetch`/`FontFace` 加载，被 `file://` 的 CORS 限制拦截，必须经 HTTP 提供（本地 `vite` 或线上静态服务）。 |
| 「英歌小槌」AI 导览 | 已移除（依赖 `yinggemus.cn` 在线服务）。如需保留，需另行接入本地实现。 |

### 使用方式

页面通过相对路径自包含，直接以静态文件方式暴露即可：

```
/exhibits/yingge/mugeda/index.html
```

无构建步骤、无环境变量、无服务端接口。
