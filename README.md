# 备注
用于测速，修改sandbox和webui。详细信息参考/home/aicor/compute_network/sandbox-demo/compute-webui/web_video_resolution_tuning_runbook.md

# 描述
该分支用于机器狗视频选择不同分辨率和fps测速。网端仅需要修改/home/aicor/compute_network/sandbox-demo/core_network/services/cmf/images/visual-recog/.env中的FPS参数SANDBOX_VIDEO_OUTPUT_FPS=30，视频分辨率会随着狗侧视频分辨率变化而变化，修改后需要在docker-simple执行./start_all.sh --kill后再执行./start_all.sh。YOLO的分辨率仅用于YOLO识别，可以不修改，会自动下采样去YOLO识别，再放回原视频。

# 问题
1280*720最大只能到15fps，原因定位为机器狗使用的是USB2.0的type-c口和数据线，传输流量上限为480M。
