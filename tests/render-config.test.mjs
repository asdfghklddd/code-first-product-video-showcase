import test from 'node:test';
import assert from 'node:assert/strict';
import {valueTiming} from '../studies/value-summary/config.mjs';
test('剪辑时间码按工程帧率计算，而非把最后两位当毫秒',()=>{
 for(const [fps,frames] of [[25,343],[30,413],[60,833]]){
  const t=valueTiming({ANCHOR_EDIT_FPS:String(fps)});assert.equal(t.frames,frames);assert.equal(t.seconds,frames/fps);
 }
 assert.throws(()=>valueTiming({ANCHOR_EDIT_FPS:'29.97'}));
});
