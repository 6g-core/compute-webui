import assert from 'node:assert/strict';

const { createObjectUrlStore } = await import('./objectUrlStore.js');

const revokedUrls = [];
let nextId = 0;
const urlApi = {
  createObjectURL() {
    nextId += 1;
    return `blob:test-${nextId}`;
  },
  revokeObjectURL(url) {
    revokedUrls.push(url);
  },
};

const store = createObjectUrlStore(urlApi);

store.clear();
assert.deepEqual(revokedUrls, []);

const firstUrl = store.replace({});
assert.equal(firstUrl, 'blob:test-1');
assert.equal(store.currentUrl, firstUrl);
assert.deepEqual(revokedUrls, []);

const secondUrl = store.replace({});
assert.equal(secondUrl, 'blob:test-2');
assert.equal(store.currentUrl, secondUrl);
assert.deepEqual(revokedUrls, [firstUrl]);

store.clear();
assert.equal(store.currentUrl, '');
assert.deepEqual(revokedUrls, [firstUrl, secondUrl]);
