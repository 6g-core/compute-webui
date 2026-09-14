# PPT 首页与正确分支的集成

基线为 `origin/fix/qos-reset-clears-dialog-cache`（迁移时为 `ee1080c`）。沿用该分支的 React/Vite、阶段配置、原 `LeftPanel`、视频 hooks 和 QoS SSE/缓存重置逻辑。

## 页面行为

- 首页默认展示 PPT。Stage 1 左侧为横向 `image001.png`；其他阶段直接使用该分支原三栏布局中的左栏，置于竖向区域。
- 保留阶段 1、2、4、5、6、7、8、9、10、21、22、23、24；后端阶段 3 仍按原规则映射到 2。
- 默认跟随后端。`?stage=9`、阶段选择框、左右方向键和 PPT 底部导航可在本地切换；“恢复跟随后端”退出手动查看。
- 原三栏网络视图保留在 `?view=network`，继续提供网络动画、QoS 曲线和关键步骤。
- 首页右侧使用同一份 PPT 素材，所有阶段保持一致。
- 默认浏览器比例下等比适配窗口，浏览器自身的放大、缩小继续生效。放大后可滚动查看超出视口的部分，基准像素比保存在当前标签页会话中。
- 宽屏两侧和缩小后的空余区域使用原始 PPT 背景沿边缘镜像平铺。

## 原稿素材

`public/assets/ppt/presentation.svg` 内嵌 PowerPoint 原生渲染的无损 3840×2160 图形层，以及 PDF 导出的矢量字形，保留原稿位置和字体轮廓。`background-tile.svg` 只延展原始背景。

`image001.png` 使用用户提供的 905×588 文件，等比显示并通过 CSS 裁去边缘选框点。素材来源及阶段列表记录在 `source.json`。

需要重新生成时，将原 PPTX 和 `image001.png` 放在项目父目录，使用本机 PowerPoint 和 PyMuPDF：

```powershell
.venv/Scripts/python.exe -m pip install pymupdf pillow
./scripts/export-ppt.ps1
.venv/Scripts/python.exe scripts/build-ppt-assets.py
```

导出只修改内存中的幻灯片，不保存源 PPTX。删除左侧占位分组后导出图形，再按原坐标叠回 PDF 字形。

## 本地运行

前端使用本分支的依赖锁文件：

```powershell
npm ci
npm run dev -- --port 3000 --strictPort
```

另开终端运行独立的本地演示适配器：

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements-webrtc.txt
.venv/Scripts/python.exe scripts/presentation_demo_server.py
```

适配器在 8787 端口复用原 `webui_api_server` 的阶段与 QoS 服务，补充本地 Sandbox 健康状态与空 AR 语音状态，并启动三个视频源：28450 机械臂、28451 原始机器狗、28452 增强机器狗。SDP 网关根据 `streamType` 转发到对应源。退出适配器时一并关闭其启动的视频进程。

`server/webrtc_mp4_server.py` 同时接受原来的平铺 SDP 和当前前端的 `sdp_offer` 包装格式，响应与请求格式对应。生产运行地址仍由本分支的 `public/runtime-config.js` 或 Docker 运行配置提供。本地适配器不替代生产 Sandbox。

## 验证

```powershell
npm run build
npm run test:js
.venv/Scripts/python.exe -m unittest discover -s test -p 'test_*.py'
node scripts/verify-presentation.mjs
node scripts/verify-presentation-viewport.mjs
.venv/Scripts/python.exe scripts/compare-ppt.py
```

浏览器脚本需要 Playwright 与 Chrome，可用 `PLAYWRIGHT_MODULE` 指定现有 Playwright 包路径。执行前启动本地演示适配器。验证脚本只修改本地演示服务的测试阶段与对话，结束时阶段恢复为 1。

- `browser-report.json`：全部 13 个阶段、视频播放、跟随后端、真实 QoS SSE 对话、reset 后缓存清空及重连验证。
- `viewport-report.json`：50%–200% 共 11 种浏览器布局缩放模拟、滚动可达性、刷新及高 DPI 适配。
- `visual-report.json`：与独立 PowerPoint 4K 导出图的右侧像素比较，以及 13 个阶段右侧逐像素一致检查。
- `stage-*.png`、`wide-2560.png`、`browser-zoom-*.png` 和 `right-comparison.png`：页面截图与对比。

截图、日志和原稿导出位于被 Git 忽略的 `artifacts/` 与 `.reference/`。PowerPoint 与浏览器的文字边缘存在抗锯齿差异；阶段间的右侧比较要求逐像素一致。
