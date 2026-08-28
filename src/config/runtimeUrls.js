const getBrowserWindow = () => (
  typeof globalThis.window === "undefined" ? null : globalThis.window
);

const getViteEnv = () => import.meta.env || {};

export const getRuntimeConfig = () => getBrowserWindow()?.__RUNTIME_CONFIG__ || {};

export const buildHttpUrl = (port, path, host) => {
  const location = getBrowserWindow()?.location;
  const protocol = location?.protocol === "https:" ? "https:" : "http:";
  const hostname = host || location?.hostname || "localhost";
  return `${protocol}//${hostname}:${port}${path}`;
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
    || getViteEnv().VITE_STAGE_API_URL
    || buildRuntimeBackendUrl("sysAgentApiUrl", "sysAgentPort", 8000, "/api/stage");
};

export const getArStatusApiUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  return runtimeConfig.arStatusApiUrl
    || getViteEnv().VITE_AR_STATUS_API_URL
    || buildRuntimeBackendUrl("sysAgentApiUrl", "sysAgentPort", 9100, "/api/v1/system/ar/status");
};

export const getLatencyApiUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  return runtimeConfig.latencyApiUrl
    || getViteEnv().VITE_LATENCY_API_URL
    || buildRuntimeBackendUrl("sandboxApiUrl", "sandboxPort", 8787, "/api/latency", "sandboxHost");
};

export const getSandboxHealthApiUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  return runtimeConfig.sandboxHealthApiUrl
    || getViteEnv().VITE_SANDBOX_HEALTH_API_URL
    || buildRuntimeBackendUrl("sandboxApiUrl", "sandboxPort", 8787, "/api/health", "sandboxHost");
};

export const getQosPushChannelUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  return runtimeConfig.qosPushChannelUrl
    || getViteEnv().VITE_QOS_PUSH_CHANNEL_URL
    || buildRuntimeBackendUrl("sandboxApiUrl", "sandboxPort", 8787, "/api/v1/qos/events", "sandboxHost");
};

export const normalizeStage = (value) => {
  const parsed = Number(value);
  if (parsed === 3) {
    return 2;
  }
  return [1, 2, 4, 5, 6, 7, 8, 9, 10, 21, 22, 23, 24].includes(parsed) ? parsed : null;
};
