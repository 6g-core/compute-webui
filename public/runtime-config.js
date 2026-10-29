(() => {
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const host = window.location.hostname;
  const sysAgentBase = `${protocol}//${host}:9100`;
  const sandboxBase = `${protocol}//${host}:8787`;

  window.__RUNTIME_CONFIG__ = {
    ...(window.__RUNTIME_CONFIG__ || {}),
    sysAgentApiUrl: sysAgentBase,
    stageApiUrl: `${sysAgentBase}/api/stage`,
    arStatusApiUrl: `${sysAgentBase}/api/v1/system/ar/status`,
    sandboxApiUrl: sandboxBase,
    sandboxHealthApiUrl: `${sandboxBase}/api/health`,
    latencyApiUrl: `${sandboxBase}/api/latency`,
    qosPushChannelUrl: `${sandboxBase}/api/v1/qos/events`,
    intentStatusApiUrl: `${sandboxBase}/api/v1/intent/status`,
    webRtcSignalUrl: `${sandboxBase}/api/v1/web/sdp/offer`,
    dogWebRtcSignalUrl: `${sandboxBase}/api/v1/web/sdp/offer`,
    dogEnhancedWebRtcSignalUrl: `${sandboxBase}/api/v1/web/sdp/offer`,
  };
})();
