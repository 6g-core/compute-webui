import assert from 'node:assert/strict';

global.window = {
  location: {
    protocol: 'http:',
    hostname: 'localhost',
  },
  __RUNTIME_CONFIG__: {},
};

const {
  UnsupportedCapabilityError,
  extractCapabilityInfo,
  resolveCapabilityApiUrl,
} = await import('./afAgentApi.js');

const capabilityInfo = extractCapabilityInfo({
  status: 'success',
  payload: {
    host: '192.168.1.10',
    port: 8787,
    api_desc: [{ name: 'visual_recog' }],
  },
});

assert.equal(capabilityInfo.apiDescriptions[0].name, 'visual_recog');
assert.equal(
  resolveCapabilityApiUrl(capabilityInfo, 'visual_recog'),
  'http://192.168.1.10:8787/api/v1/visual_recog',
);
assert.equal(
  resolveCapabilityApiUrl({ host: 'http://192.168.1.11', port: 8787 }, 'visual_recog'),
  'http://192.168.1.11:8787/api/v1/visual_recog',
);
assert.equal(
  resolveCapabilityApiUrl({ host: 'http://192.168.1.12:9000', port: 8787 }, 'visual_recog'),
  'http://192.168.1.12:9000/api/v1/visual_recog',
);

assert.throws(
  () => extractCapabilityInfo({ status: 'fail', reason: 'capability_not_supported', payload: {} }),
  UnsupportedCapabilityError,
);
