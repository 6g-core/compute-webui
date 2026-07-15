import { buildRuntimeBackendUrl, getRuntimeConfig } from '../config/runtimeUrls.js';

const CAPABILITY_EXPOSURE_PATH = '/api/v1/capability_exposure';

export class UnsupportedCapabilityError extends Error {
  constructor() {
    super('当前能力开放平台不支持该能力');
    this.name = 'UnsupportedCapabilityError';
  }
}

export const getCapabilityExposureUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  const configuredBase = runtimeConfig.afSysAgentApiUrl || import.meta.env?.VITE_AF_SYS_AGENT_API_URL;
  if (configuredBase) {
    return `${String(configuredBase).replace(/\/$/, '')}${CAPABILITY_EXPOSURE_PATH}`;
  }
  return buildRuntimeBackendUrl('sysAgentApiUrl', 'sysAgentPort', 9100, CAPABILITY_EXPOSURE_PATH);
};

export const extractCapabilityInfo = (responseBody) => {
  if (responseBody?.status && responseBody.status !== 'success') {
    if (responseBody.reason === 'capability_not_supported') {
      throw new UnsupportedCapabilityError();
    }
    throw new Error(responseBody.reason || '能力申请失败');
  }

  const payload = responseBody?.payload && Object.keys(responseBody.payload).length > 0
    ? responseBody.payload
    : responseBody;
  const apiDescriptions = Array.isArray(payload?.api_desc)
    ? payload.api_desc
    : Array.isArray(payload?.api)
      ? payload.api
      : [];

  return {
    ...payload,
    apiDescriptions,
  };
};

export const requestCapabilityExposure = async (intentPayload) => {
  const response = await fetch(getCapabilityExposureUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent_payload: intentPayload,
    }),
  });
  const responseBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(responseBody.reason || `能力申请失败: HTTP ${response.status}`);
  }
  return extractCapabilityInfo(responseBody);
};

export const resolveCapabilityApiUrl = (capabilityInfo, apiName) => {
  const host = String(capabilityInfo?.host || '').trim();
  if (!host) {
    throw new Error('能力描述缺少 host');
  }
  const port = capabilityInfo?.port ? String(capabilityInfo.port).trim() : '';
  const protocol = typeof window !== 'undefined' && window.location?.protocol === 'https:' ? 'https:' : 'http:';
  const baseUrl = new URL(/^https?:\/\//i.test(host) ? host : `${protocol}//${host}`);
  if (port && !baseUrl.port) {
    baseUrl.port = port;
  }
  return `${baseUrl.origin}/api/v1/${encodeURIComponent(apiName)}`;
};

export const invokeVisualRecogApi = async ({ capabilityInfo, apiName, videoFile, target }) => {
  const formData = new FormData();
  formData.append('video', videoFile);
  formData.append('target', target);

  const response = await fetch(resolveCapabilityApiUrl(capabilityInfo, apiName), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.reason || `识别失败: HTTP ${response.status}`);
  }

  return response.blob();
};
