export const getRuntimeConfig = () => window.__RUNTIME_CONFIG__ || {};

export const buildHttpUrl = (port, path, host) => {
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  return `${protocol}//${host || window.location.hostname}:${port}${path}`;
};

export const buildRuntimeBackendUrl = (baseKey, portKey, defaultPort, path, hostKey = "backendHost") => {
  const runtimeConfig = getRuntimeConfig();
  const configuredBase = runtimeConfig[baseKey];
  if (configuredBase) {
    return `${String(configuredBase).replace(/\/$/, "")}${path}`;
  }
  return buildHttpUrl(runtimeConfig[portKey] || defaultPort, path, runtimeConfig[hostKey]);
};

export const getStageApiUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  return runtimeConfig.stageApiUrl
    || import.meta.env.VITE_STAGE_API_URL
    || buildRuntimeBackendUrl("sysAgentApiUrl", "sysAgentPort", 8000, "/api/stage");
};

export const getArStatusApiUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  return runtimeConfig.arStatusApiUrl
    || import.meta.env.VITE_AR_STATUS_API_URL
    || buildRuntimeBackendUrl("sysAgentApiUrl", "sysAgentPort", 9100, "/api/v1/system/ar/status");
};

export const getLatencyApiUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  return runtimeConfig.latencyApiUrl
    || import.meta.env.VITE_LATENCY_API_URL
    || buildRuntimeBackendUrl("sandboxApiUrl", "sandboxPort", 8787, "/api/latency", "sandboxHost");
};

export const getSandboxHealthApiUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  return runtimeConfig.sandboxHealthApiUrl
    || import.meta.env.VITE_SANDBOX_HEALTH_API_URL
    || buildRuntimeBackendUrl("sandboxApiUrl", "sandboxPort", 8787, "/api/health", "sandboxHost");
};

export const getVideoResolutionTestResultsApiUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  return runtimeConfig.videoResolutionTestResultsApiUrl
    || import.meta.env.VITE_VIDEO_RESOLUTION_TEST_RESULTS_API_URL
    || buildRuntimeBackendUrl("sandboxApiUrl", "sandboxPort", 8787, "/api/v1/video-resolution-test/results", "sandboxHost");
};

export const normalizeStage = (value) => {
  const parsed = Number(value);
  if (parsed === 3) {
    return 2;
  }
  return [1, 2, 4, 5, 6, 7, 8, 9].includes(parsed) ? parsed : null;
};
