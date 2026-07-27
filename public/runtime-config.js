(() => {
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const host = window.location.hostname;

  const sysAgentBase = `${protocol}//${host}:9100`;
  const sandboxBase = `${protocol}//${host}:8787`;

  window.__RUNTIME_CONFIG__ = {
    ...(window.__RUNTIME_CONFIG__ || {}),

    sysAgentApiUrl: sysAgentBase,
    afSysAgentApiUrl: sysAgentBase,

    sandboxApiUrl: sandboxBase,

    stageApiUrl: `${sysAgentBase}/api/stage`,
    arStatusApiUrl: `${sysAgentBase}/api/v1/system/ar/status`,

    sandboxHealthApiUrl: `${sandboxBase}/api/health`,
    latencyApiUrl: `${sandboxBase}/api/latency`,

    webRtcSignalUrl: `${sandboxBase}/api/v1/web/sdp/offer`,
    dogWebRtcSignalUrl: `${sandboxBase}/api/v1/web/sdp/offer`,
    dogEnhancedWebRtcSignalUrl: `${sandboxBase}/api/v1/web/sdp/offer`,
  };
})();