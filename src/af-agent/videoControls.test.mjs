import assert from 'node:assert/strict';

const {
  requestElementFullscreen,
  toggleVideoMuted,
  toggleVideoPlayback,
} = await import('./videoControls.js');

const pausedVideo = {
  paused: true,
  ended: false,
  playCalls: 0,
  pauseCalls: 0,
  async play() {
    this.playCalls += 1;
    this.paused = false;
  },
  pause() {
    this.pauseCalls += 1;
    this.paused = true;
  },
};

assert.equal(await toggleVideoPlayback(pausedVideo), true);
assert.equal(pausedVideo.playCalls, 1);
assert.equal(pausedVideo.pauseCalls, 0);

assert.equal(await toggleVideoPlayback(pausedVideo), false);
assert.equal(pausedVideo.playCalls, 1);
assert.equal(pausedVideo.pauseCalls, 1);

const mutedVideo = { muted: false };
assert.equal(toggleVideoMuted(mutedVideo), true);
assert.equal(mutedVideo.muted, true);
assert.equal(toggleVideoMuted(mutedVideo), false);
assert.equal(mutedVideo.muted, false);

const fullscreenElement = {
  requestCalls: 0,
  async requestFullscreen() {
    this.requestCalls += 1;
  },
};

assert.equal(await requestElementFullscreen(fullscreenElement), true);
assert.equal(fullscreenElement.requestCalls, 1);
assert.equal(await requestElementFullscreen({}), false);
