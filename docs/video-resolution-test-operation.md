# 网页视频分辨率测试操作文档

## 1. 测试目的

验证机器狗视频经过以下链路后，在网页前端是否清晰、流畅、不卡顿：

```text
dog 摄像头采集
-> dog WebRTC 发送
-> sandbox WebRTC 接收
-> raw 或 enhanced 视频处理
-> sandbox WebRTC 发送
-> compute-webui 浏览器播放
```

测试结论以 `compute-webui` 浏览器页面实际收到的视频指标为准，包括分辨率、FPS、码率、丢帧、丢包、jitter 和 freeze。

## 2. 测试档位

第一版内置 5 个分辨率/FPS 档位：

| 档位 | 分辨率 | FPS |
| --- | --- | --- |
| 1 | 640x480 | 15 |
| 2 | 1280x720 | 15 |
| 3 | 1280x720 | 30 |
| 4 | 1920x1080 | 15 |
| 5 | 1920x1080 | 30 |

每个档位都要分别测试两路：

| streamType | 含义 |
| --- | --- |
| `raw` | dog 原始视频经过 sandbox raw relay 到网页 |
| `enhanced` | dog 视频经过 sandbox YOLO/画框/overlay 后到网页 |

所以完整测试共 10 个 case：

```text
640x480@15/raw
640x480@15/enhanced
1280x720@15/raw
1280x720@15/enhanced
1280x720@30/raw
1280x720@30/enhanced
1920x1080@15/raw
1920x1080@15/enhanced
1920x1080@30/raw
1920x1080@30/enhanced
```

## 3. 启动前检查

确认代码分支：

```bash
git branch --show-current
```

推荐都在：

```text
personal/zxy/speed-test
```

确认服务地址：

| 服务 | 默认地址 |
| --- | --- |
| dog | `http://<dog-ip>:8890` |
| sandbox | `http://<sandbox-ip>:8787` |
| compute-webui | `http://<webui-ip>:<webui-port>` |

确认 sandbox 可访问：

```bash
curl http://<sandbox-ip>:8787/api/health
```

确认 dog 可访问：

```bash
curl http://<dog-ip>:8890/api/health
```

## 4. 配置测试档位

打开 `compute-webui` 页面，找到“网页视频分辨率测试”面板。

选择要测试的档位后，面板会生成类似下面的环境变量：

```bash
export DOG_CAMERA_WIDTH=1280
export DOG_CAMERA_HEIGHT=720
export DOG_CAMERA_FPS=15
export SANDBOX_VIDEO_OUTPUT_FPS=15
export SANDBOX_YOLO_INPUT_SIZE=1280,720
```

关键要求：

- `DOG_CAMERA_WIDTH` 和 `DOG_CAMERA_HEIGHT` 控制 dog 摄像头采集分辨率。
- `DOG_CAMERA_FPS` 控制 dog 摄像头采集 FPS。
- `SANDBOX_VIDEO_OUTPUT_FPS` 控制 sandbox 输出 FPS。
- `SANDBOX_YOLO_INPUT_SIZE` 必须和分辨率一致，格式是 `<width>,<height>`。

例如测试 `1920x1080@30`：

```bash
export DOG_CAMERA_WIDTH=1920
export DOG_CAMERA_HEIGHT=1080
export DOG_CAMERA_FPS=30
export SANDBOX_VIDEO_OUTPUT_FPS=30
export SANDBOX_YOLO_INPUT_SIZE=1920,1080
```

## 5. 重启服务

第一版网页只生成配置命令，不会自动修改 dog/sandbox 环境变量，也不会自动重启服务。

现场需要手动执行：

```text
1. 在 dog 运行环境设置 DOG_CAMERA_WIDTH / DOG_CAMERA_HEIGHT / DOG_CAMERA_FPS。
2. 重启 dog 服务。
3. 在 sandbox 运行环境设置 SANDBOX_VIDEO_OUTPUT_FPS / SANDBOX_YOLO_INPUT_SIZE。
4. 重启 sandbox 服务。
5. 刷新或等待 compute-webui 视频恢复。
```

如果需要指定结果保存目录，在 sandbox 运行环境额外设置：

```bash
export SANDBOX_VIDEO_TEST_RESULTS_DIR=/abs/path/video-resolution-test-results
```

未设置时，默认保存到：

```text
video-resolution-test-results
```

## 6. 网页采样

每个档位按下面顺序采样：

```text
1. 确认网页视频已经恢复。
2. 在测试面板确认当前档位。
3. 为 raw 填写或确认 clarity / smoothness / notes。
4. 点击 raw 的开始按钮。
5. 默认采样 120 秒，等待自动结束，或手动停止。
6. 为 enhanced 填写或确认 clarity / smoothness / notes。
7. 点击 enhanced 的开始按钮。
8. 默认采样 120 秒，等待自动结束，或手动停止。
9. 进入下一个分辨率/FPS 档位。
```

注意：

- `raw` 和 `enhanced` 是分别采样、分别保存的两个 case。
- 同一个档位下，两路使用同一组 dog/sandbox 参数。
- 如果切换档位，必须重新设置环境变量并重启 dog/sandbox。
- 当前实现会在 case 停止或倒计时结束时立即提交结果，因此主观评价需要在当前 case 结束前填好。

## 7. 结果保存

每个 case 停止或倒计时结束后，前端会自动 POST 到 sandbox：

```text
POST /api/v1/video-resolution-test/results
```

sandbox 保存文件格式：

```text
<runId>.jsonl
```

每个 case 一行 JSON，不覆盖之前结果。

前端也可以手动下载：

| 按钮 | 作用 |
| --- | --- |
| 下载 JSON | 下载当前 run 的完整 JSON 结果 |
| 下载 CSV | 下载当前 run 的表格汇总 |

## 8. 结果判断

单个 case 推荐通过标准：

| 指标 | 建议标准 |
| --- | --- |
| 实际分辨率 | 接近或等于目标分辨率 |
| 平均 FPS | `avgFps >= target.fps * 0.95` |
| 丢帧率 | 小于 1% |
| freeze | 无明显连续冻结 |
| smoothness | 不为 `bad` |

一个档位通过标准：

```text
同一个 width/height/fps 下 raw 和 enhanced 都通过，才认为该档位通过。
```

最终结论：

```text
最高通过档位 = 当前网络、dog、sandbox、YOLO 和网页前端条件下的最大可用分辨率/FPS。
```

## 9. 问题定位

| 现象 | 优先排查 |
| --- | --- |
| raw 卡，enhanced 也卡 | dog 采集、网络、WebRTC、浏览器解码 |
| raw 稳，enhanced 卡 | sandbox YOLO 推理、画框、overlay、输出 FPS |
| raw/enhanced 都低于目标分辨率 | dog 参数未生效、摄像头不支持、WebRTC 协商降级 |
| enhanced FPS 明显低于 raw | YOLO 输入尺寸过大或推理后端压力过高 |
| 1080p enhanced 失败 | 记录失败，不强行认为链路异常，优先回退到 720p |

## 10. 推荐现场顺序

建议从中间档位开始：

```text
1. 1280x720@15
2. 1280x720@30
3. 1920x1080@15
4. 1920x1080@30
5. 如果 720p 也不稳，再回测 640x480@15
```

如果目标是找“最大稳定档位”，推荐每个 case 至少采样 `120s`。如果现场网络波动明显，可以增加到 `300s`。
