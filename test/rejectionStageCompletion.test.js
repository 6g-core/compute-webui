import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import * as React from 'react';
import { buildSync } from 'esbuild';

const code = buildSync({ entryPoints: ['src/hooks/useEffectiveStageConfig.js'], bundle: true,
  write: false, format: 'cjs', platform: 'node', external: ['react'] }).outputFiles[0].text;

function harness() {
  const states = [];
  let cursor = 0, dirty = false;
  const module = { exports: {} };
  const react = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], value => {
        states[index] = typeof value === 'function' ? value(states[index]) : value;
        dirty = true;
      }];
    },
    useEffect() {},
  };
  vm.runInNewContext(code, { module, exports: module.exports, require: () => react });
  return (stage, rejectionEventId) => {
    let result;
    do {
      dirty = false; cursor = 0;
      result = module.exports.useEffectiveStageConfig(stage, { rejectionEventId, stage5VideoReady: false });
    } while (dirty);
    return result;
  };
}

for (const stage of [2,4,5,6,7,9,10]) {
  test(`rejection immediately completes stage ${stage} and stays complete after flash`, () => {
    const render = harness();
    render(stage, 0);
    const result = render(stage, 1);
    assert.equal(result.stageAnimationDone, true);
    assert.equal(render(stage, 1).stageAnimationDone, true);
    assert.equal(render(stage, 2).stageAnimationDone, true);
    // A subsequent stage must not inherit a consumed rejection.
    assert.equal(render(stage === 2 ? 4 : 2, 2).stageAnimationDone, false);
  });
}
