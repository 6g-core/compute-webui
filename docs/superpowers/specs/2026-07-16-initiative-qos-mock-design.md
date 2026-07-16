# Initiative QoS Mock Demo compute-webui 设计

## 背景

compute-webui 当前的拓扑蓝线和分段时延主要由前端配置驱动，不是直接来自 sandbox metrics。网络保障 demo 应继续保持这个模式：sandbox 只通过 `/api/health.networkRecoveryDemo.phase` 提供状态，web 在本地决定 Stage 8 哪些链路变红、哪些控制面链路高亮，以及提示文案显示在哪里。

## 目标

1. 只在 Stage 8 显示“模拟网络拥塞恢复”按钮，Stage 9 后按钮消失。
2. 点击按钮后调用 sandbox `/api/v1/network_recovery_demo/start`，请求体带 `{ "stage": 8 }`。
3. 请求未返回前禁用按钮；收到 `ok:true` 后立即本地加锁，直到 `phase` 回到 `idle` 才解锁。
4. 轮询 sandbox `/api/health`，读取 `networkRecoveryDemo.phase`。
5. `congested` 和必要的 `optimizing` 期间，Stage 8 的用户面链路显示高时延并超过阈值变红。
6. `optimizing` 期间，在 Computing Agent / CMF 附近显示“检测到网络恶化，保障策略应用中”，并高亮三条控制面优化路径。
7. `guaranteed` 期间，在 RAN 和 UPF 附近显示“网络保障中”，直到 reset。
8. Stage 8 右侧面板展示 sandbox 下发的保障带宽折线图：`idle=1.2Mbps`、`congested/optimizing=0.8Mbps`、`guaranteed=1.5Mbps`，允许小幅波动。

## 非目标

1. 不让 sandbox 下发链路集合。
2. 不修改其他 stage 的拓扑线语义。
3. 不改造 Stage 8 右侧端到端时延折线图的数据来源。
4. 不引入新的全局状态管理库。

## sandbox health 载荷

web 只依赖以下字段：

```json
{
  "networkRecoveryDemo": {
    "phase": "idle",
    "updatedAtMs": 0,
    "sampledAtMs": 0,
    "bandwidthBaseMbps": 1.2,
    "bandwidthMbps": 1.2,
    "bandwidthUnit": "Mbps"
  }
}
```

缺失、未知或请求失败时，前端按 `idle` 处理，避免 demo 状态污染正常演示。

## 保障带宽折线图

web 在 Stage 8 轮询 sandbox health，并把 `networkRecoveryDemo.bandwidthMbps` 追加到本地最近 24 个采样点中。sandbox 不返回带宽字段时，web 按 phase 回退到默认基准值：

- `idle`: `1.2Mbps`
- `congested`: `0.8Mbps`
- `optimizing`: `0.8Mbps`
- `guaranteed`: `1.5Mbps`

带宽图放在右侧 `L3级通信保障` 面板内，位于端到端时延图下方。图表只用于 demo 展示，不参与拓扑链路颜色、按钮禁用或 RAYNEO 提示逻辑。

## Stage 8 用户面链路

以下链路在本地维护，与现有 `topologyFlowConfig` 的配置风格一致：

- `UE->gNB`
- `RobotDog->gNB`
- `gNB->UPF`
- `UPF->Gateway`

`congested` 期间使用稳定的高时延覆盖值，例如 45ms、52ms、64ms、58ms。阈值建议为 `30ms`：

- `latency >= 30ms`：红线；
- `latency < 30ms`：蓝线。

`guaranteed` 期间恢复原有随机低时延。

## optimizing 控制面展示

`optimizing` 期间高亮三条控制面路径：

- `Computing->SystemAgent`，使用现有路径 `SystemAgent->Computing` 反向显示；
- `SystemAgent->SRF`，使用现有路径 `SRF->SystemAgent` 反向显示；
- `SRF->gNB`，使用现有路径 `gNB->SRF` 反向显示。

提示文案锚定在 Computing Agent / CMF 下方：

```text
检测到网络恶化，保障策略应用中
```

## guaranteed 保障展示

`guaranteed` 期间：

- RAN 节点下方显示 `网络保障中`；
- UPF 节点下方显示 `网络保障中`；
- 用户面链路恢复蓝色和低时延；
- 提示保持到 sandbox reset 后 health phase 回到 `idle`。

## 交互与错误处理

- `/start` 请求 pending 时按钮禁用。
- `/start` 返回 `ok:true` 后立即设置本地锁，避免下一次 health 轮询前重复点击。
- `/start` 返回 `ok:false` 时解除按钮锁，并展示 `reason`。
- health 轮询失败时保留页面可用性，不触发红线或保障文案。
- Stage 离开 8 后按钮消失，拓扑不再渲染 Stage 8 的 demo 覆盖。

## 测试策略

1. 纯函数测试：phase 归一化、按钮禁用条件、用户面覆盖值、控制面高亮集合、带宽 payload 归一化和采样点追加。
2. build 校验：`npm run build`。
3. 手工联调：Stage 8 点击按钮，观察四条用户面红线、CMF 文案、控制面高亮、RAN/UPF 保障标签。
