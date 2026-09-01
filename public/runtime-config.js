(() => {
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const host = window.location.hostname;
  const mockBase = `${protocol}//${host}:8787`;

  window.__RUNTIME_CONFIG__ = {
    ...(window.__RUNTIME_CONFIG__ || {}),
    sysAgentApiUrl: mockBase,
    sandboxApiUrl: mockBase,
    stageApiUrl: `${mockBase}/api/stage`,
    arStatusApiUrl: `${mockBase}/api/v1/system/ar/status`,
    sandboxHealthApiUrl: `${mockBase}/api/health`,
    latencyApiUrl: `${mockBase}/api/latency`,
    qosPushChannelUrl: `${mockBase}/api/v1/qos/events`,
    mockStage9Dialogs: true,
    webRtcSignalUrl: `${protocol}//${host}:28450/offer`,
    dogWebRtcSignalUrl: `${mockBase}/api/v1/web/sdp/offer`,
    dogEnhancedWebRtcSignalUrl: `${mockBase}/api/v1/web/sdp/offer`,
  };
})();
