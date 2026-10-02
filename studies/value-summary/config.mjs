// 时间码末位为帧数：01:51:13 - 01:37:20 = 14 * fps - 7；终点不含尾帧。
export function valueTiming(env=process.env){
 const fps=Number(env.ANCHOR_EDIT_FPS||60);
 if(![25,30,60].includes(fps))throw new Error('ANCHOR_EDIT_FPS must be 25, 30 or 60');
 return {fps,frames:14*fps-7,seconds:(14*fps-7)/fps};
}
export const names={A:'Flat-Journey',B:'Shared-Frame',C:'Slice-Flow'};
