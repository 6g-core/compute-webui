import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { buildSync } from 'esbuild';

test('each rejection paints its own speech before flashing and retains it after flash expiry', () => {
  const code = buildSync({ entryPoints: ['src/hooks/useRejectionPresentation.js'], bundle:true, write:false, format:'cjs', external:['react'] }).outputFiles[0].text;
  const states=[], effects=[], frames=new Map();
  let cursor, dirty, nextFrame=0;
  const react={
    useState(initial) { const i=cursor++; if (!(i in states)) states[i]=initial;
      return [states[i], v=>{ states[i]=v; dirty=true; }]; },
    useEffect(fn,deps) { const i=cursor++; const old=effects[i];
      if (!old || deps.some((v,j)=>v!==old.deps[j])) { old?.cleanup?.(); effects[i]={deps,cleanup:fn()}; } },
  };
  const module={exports:{}};
  vm.runInNewContext(code,{module,exports:module.exports,require:()=>react,window:{
    requestAnimationFrame(fn){ frames.set(++nextFrame,fn); return nextFrame; },
    cancelAnimationFrame(id){frames.delete(id);},
  }});
  const render=(props)=>{let r;do {cursor=0;dirty=false;r=module.exports.useRejectionPresentation(props);}while(dirty);return r;};
  const frame=()=>{const pending=[...frames.values()]; frames.clear(); pending.forEach(fn=>fn());};
  const props={stage:9,arLastWhisper:'Destroy the server.',rejectedSpeechText:'',rejectionEventId:0,rejectFlashVisible:false};
  render(props);
  for (const [id,text] of [[1,'Destroy the server.'],[2,'Discharge the server.']]) {
    Object.assign(props,{rejectionEventId:id,rejectedSpeechText:text,rejectFlashVisible:true});
    let r=render(props);assert.equal(r.arSpeechText,text);assert.equal(r.intentRejectVisible,false);
    frame();assert.equal(render(props).intentRejectVisible,false);
    frame();assert.equal(render(props).intentRejectVisible,true);
    props.rejectFlashVisible=false;r=render(props);assert.equal(r.arSpeechText,text);assert.equal(r.intentRejectVisible,false);
  }
  props.arLastWhisper='Find the yellow blind box.';
  assert.equal(render(props).arSpeechText,props.arLastWhisper);
});
