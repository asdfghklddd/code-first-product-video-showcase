/**
 * 中文说明：历史 Three.js 实验：A 连续路径、B 聚焦镜、C 书签；包含真实三维几何。平面动画不引用此文件。
 * 完整命令与适用场景：docs/动画目录.md
 */
import React, {useLayoutEffect, useRef} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

export type Variant = 'A'|'B'|'C';
const cyan=0x23bdd9, ink=0x183446, gold=0xf2c863, pale=0xe4f1f2;
export const ramp=(t:number,a:number,b:number)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
const mix=THREE.MathUtils.lerp;
type Item={group:THREE.Group;bars:THREE.Mesh[];mark:THREE.Mesh};

function makeWorld(canvas:HTMLCanvasElement, variant:Variant){
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(1280,1080);renderer.setPixelRatio(1);
 renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.96;
 const scene=new THREE.Scene();
 const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();
 const env=pmrem.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.65;room.dispose();pmrem.dispose();
 const camera=new THREE.PerspectiveCamera(35,1280/1080,.1,100);
 const ambient=new THREE.HemisphereLight(0xe7faff,0x748a9a,1.1);scene.add(ambient);
 const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(-4,10,7);key.castShadow=true;
 key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;key.shadow.normalBias=.03;key.shadow.bias=-.00015;key.shadow.radius=4;scene.add(key);
 const fill=new THREE.DirectionalLight(0x8eeaff,1);fill.position.set(6,4,-6);scene.add(fill);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({opacity:.075}));ground.rotation.x=-Math.PI/2;ground.position.y=-.65;ground.receiveShadow=true;scene.add(ground);
 const world=new THREE.Group();scene.add(world);
 const mat=(color:number,metalness=.1,roughness=.28)=>new THREE.MeshPhysicalMaterial({color,metalness,roughness,clearcoat:.7,clearcoatRoughness:.2});
 const white=mat(0xffffff,.05,.32), blue=mat(cyan,.22,.22), amber=mat(gold,.25,.22), silver=mat(pale,.15,.3), dark=mat(ink,.22,.28);
 function box(w:number,h:number,d:number,material:THREE.Material,r=.08){const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,r),material);m.castShadow=true;m.receiveShadow=true;return m;}
 function sphere(r:number,material:THREE.Material){const m=new THREE.Mesh(new THREE.SphereGeometry(r,32,20),material);m.castShadow=true;return m;}
 function torus(r:number,t:number,material:THREE.Material){const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,16,96),material);m.castShadow=true;return m;}
 function tube(points:THREE.Vector3[],r:number,material:THREE.Material){const curve=new THREE.CatmullRomCurve3(points);const m=new THREE.Mesh(new THREE.TubeGeometry(curve,120,r,10,false),material);m.castShadow=true;return {mesh:m,curve};}
 function tile(w=2.25,d=2.65):Item{
  const group=new THREE.Group();group.add(box(w,.20,d,white,.09));
  const under=box(w-.08,.10,d-.08,silver,.05);under.position.y=-.13;group.add(under);
  const mark=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.075,48),blue);mark.position.set(-w*.29,.15,-d*.29);group.add(mark);
  const bars:THREE.Mesh[]=[];
  [0,1,2].forEach(i=>{const bar=box(w*(i===0?.62:i===1?.79:.47),.038,.09,i===0?dark:silver,.018);bar.position.set(-w*.015,.135,-d*.02+i*.31);group.add(bar);bars.push(bar);});
  const rail=box(w*.77,.035,.13,silver,.02);rail.position.set(0,.14,d*.34);group.add(rail);
  const progress=box(w*.54,.04,.13,blue,.02);progress.position.set(-w*.115,.16,d*.34);group.add(progress);bars.push(progress);
  return {group,bars,mark};
 }
 const orb=sphere(.21,blue);world.add(orb);
 const halo=torus(.39,.025,blue);halo.rotation.x=Math.PI/2;world.add(halo);
 const cards:Item[]=[];
 const rings:THREE.Mesh[]=[];
 let path:THREE.CatmullRomCurve3;
 let focus:THREE.Group|undefined;
 let bookmark:THREE.Group|undefined;
 if(variant==='A'){
  const pts=[[-5,.25,2.4],[-3.1,.45,.8],[-1.5,.45,-1.2],[.2,.45,0],[2,.45,1.25],[3.4,.45,-.5],[5,.45,-2.4]].map(p=>new THREE.Vector3(...p as [number,number,number]));
  const rail=tube(pts,.055,blue);world.add(rail.mesh);path=rail.curve;
  for(let i=0;i<3;i++){const c=tile();cards.push(c);world.add(c.group);}
  for(let i=0;i<3;i++){const ring=torus(.53,.045,i===1?amber:blue);ring.rotation.x=Math.PI/2;world.add(ring);rings.push(ring);}
  for(let i=0;i<9;i++){const s=sphere(.06,silver);s.position.set(-5+i*1.25,-.2,-2.8);world.add(s);}
 }else if(variant==='B'){
  const base=new THREE.Mesh(new THREE.CylinderGeometry(2.55,2.65,.28,96),white);base.position.y=-.25;base.receiveShadow=true;base.castShadow=true;world.add(base);
  const r=torus(2.43,.07,blue);r.rotation.x=Math.PI/2;r.position.y=-.06;world.add(r);rings.push(r);
  const inner=torus(1.34,.025,silver);inner.rotation.x=Math.PI/2;inner.position.y=-.04;world.add(inner);rings.push(inner);
  focus=new THREE.Group();const outer=torus(1.40,.12,blue);focus.add(outer);const rim=torus(1.20,.035,white);focus.add(rim);
  const handle=box(.22,1.55,.24,dark,.1);handle.position.set(.99,-1.63,0);handle.rotation.z=.56;focus.add(handle);world.add(focus);
  for(let i=0;i<5;i++){const c=tile(1.55,1.9);cards.push(c);world.add(c.group);}
  const pts=Array.from({length:49},(_,i)=>new THREE.Vector3(3.6*Math.cos(i/48*Math.PI*2),.6,3.05*Math.sin(i/48*Math.PI*2)));
  const rail=tube(pts,.022,silver);world.add(rail.mesh);path=rail.curve;
 }else{
  for(let i=0;i<3;i++){const c=tile(3.65,4.0);cards.push(c);world.add(c.group);}
  bookmark=new THREE.Group();
  const shape=new THREE.Shape();shape.moveTo(-.43,1.65);shape.lineTo(.43,1.65);shape.lineTo(.43,-1.6);shape.lineTo(0,-1.27);shape.lineTo(-.43,-1.6);shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.055,bevelThickness:.035});
  const ribbon=new THREE.Mesh(geo,blue);ribbon.castShadow=true;bookmark.add(ribbon);
  const badge=torus(.18,.035,white);badge.position.set(0,.9,.18);bookmark.add(badge);world.add(bookmark);
  const pts=[[-4,.1,3.1],[-2.8,.25,2.4],[0,.5,2.1],[2,.7,.6],[3.6,.4,-1],[4.6,.3,-2.4]].map(p=>new THREE.Vector3(...p as [number,number,number]));
  const rail=tube(pts,.045,blue);world.add(rail.mesh);path=rail.curve;
  for(let i=0;i<2;i++){const r=torus(.45+i*.18,.025,i===0?blue:silver);r.rotation.x=Math.PI/2;world.add(r);rings.push(r);}
 }
 const pos=new THREE.Vector3();
 const render=(t:number)=>{
  const enter=ramp(t,0,.9),attention=ramp(t,3.05,4.15),resume=ramp(t,6.55,8.0),ending=ramp(t,10.0,11.35);
  world.scale.setScalar(.84+enter*.16);world.position.y=(1-enter)*-.6;
  world.rotation.y=variant==='A'?-.18+Math.sin(t*.24)*.09:variant==='B'?.1+Math.sin(t*.22)*.08:-.25+Math.sin(t*.22)*.06;
  camera.position.set(variant==='C'?9.2:8.5,variant==='B'?10.6:9.0,variant==='B'?13.9:13.2);
  camera.position.x+=Math.sin(t*.19)*.6;camera.position.y+=ending*.4;
  camera.lookAt(0,.55,0);
  if(variant==='A'){
   const coords=[[-3,.8,-.5],[0,1.0,.1],[3,.75,-.6]];
   cards.forEach((c,i)=>{
    const active=i===0?1-attention:i===1?attention*(1-resume):resume;
    c.group.position.set(coords[i][0],coords[i][1]+active*.62+Math.sin(t*1.5+i)*.045,coords[i][2]);
    c.group.rotation.set(.04,[-.2,.08,.22][i],(1-enter)*.12);
    c.group.scale.setScalar(.83+active*.15+ending*.02);
    c.mark.material=i===1&&attention>.5&&resume<.5?amber:blue;
    c.bars[3].scale.x=.35+ramp(t,i*2.8,i*2.8+1.6)*.65;
    rings[i].position.set(coords[i][0],.48,coords[i][2]);rings[i].scale.setScalar(1+active*.4+Math.sin(t*2)*.04);rings[i].visible=enter>.2;
   });
   const progress=mix(.04,.30,ramp(t,.25,2.4))+attention*.21+resume*.35+ending*.08;
   path.getPoint(Math.min(.99,progress),pos);orb.position.copy(pos);orb.position.y+=.25;
  }else if(variant==='B'){
   cards.forEach((c,i)=>{
    const angle=i/5*Math.PI*2+t*.11*(1-attention)+.4;
    const select=i===0?attention:0;
    const spread=mix(3.55,3.9,attention)*(1-ending*.12);
    const x=Math.cos(angle)*spread,z=Math.sin(angle)*spread*.78;
    c.group.position.set(mix(x,0,select*.94),mix(.45+Math.sin(t+i)*.12,1.35,select),mix(z,.15,select*.94));
    c.group.rotation.set(0,mix(-angle*.1,0,select),0);c.group.scale.setScalar(i===0?1+attention*.28:1-attention*.18);
    c.mark.material=i===0&&attention>.3&&resume<.4?amber:blue;
    c.bars[3].scale.x=.35+ramp(t,7,9.9)*.65;
   });
   if(focus){focus.position.set(mix(1.8,.03,attention),mix(3.7,2.75,attention),mix(-.8,.35,attention));focus.rotation.set(mix(-.5,-.85,attention),-.12+Math.sin(t*.45)*.1,-.24+resume*.22);focus.scale.setScalar(.8+attention*.22-ending*.10);}
   path.getPoint((.12+t*.055)%1,pos);orb.position.copy(pos);orb.position.y+=.25;
   rings[0].rotation.z=t*.1;
  }else{
   const close=ramp(t,5.45,6.5)*(1-ramp(t,7.05,8.05));
   cards.forEach((c,i)=>{
    const fan=(1-close)*(.48+enter*.52);
    c.group.position.set((i-1)*.67*fan,(i*.60+.2)*(1-close*.74)+Math.sin(t*1.1+i)*.025,-i*.20*fan);
    c.group.rotation.set(.01,((i-1)*.18)*(1-close),0);
    c.mark.material=i===2&&attention>.3&&resume<.3?amber:blue;
    c.bars[3].scale.x=.35+ramp(t,7.35,9.4)*.65;
   });
   if(bookmark){bookmark.position.set(.68,3.0-attention*.60+close*.25,-.35);bookmark.rotation.set(-.22,.12+Math.sin(t*.25)*.10,-.13);bookmark.scale.setScalar(.8+attention*.12);}
   const progress=mix(.05,.40,ramp(t,.3,2.8))+resume*.40+ending*.14;
   path.getPoint(progress,pos);orb.position.copy(pos);orb.position.y+=.20;
   rings.forEach((r,i)=>{r.position.copy(orb.position);r.position.y-=.2;r.scale.setScalar(1+Math.sin(t*2-i)*.08);});
  }
  halo.position.copy(orb.position);halo.position.y-=.1;halo.scale.setScalar(1+Math.sin(t*3)*.10);
  renderer.render(scene,camera);
 };
 return {render,dispose:()=>{scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});env.dispose();renderer.dispose();}};
}

export const Scene:React.FC<{variant:Variant;t:number}>=({variant,t})=>{
 const canvas=useRef<HTMLCanvasElement>(null);
 const world=useRef<ReturnType<typeof makeWorld>|null>(null);
 useLayoutEffect(()=>{world.current=makeWorld(canvas.current!,variant);return ()=>{world.current?.dispose();world.current=null;};},[variant]);
 useLayoutEffect(()=>{world.current?.render(t);},[t,variant]);
 return <canvas ref={canvas} width={1280} height={1080} style={{width:1280,height:1080,display:'block'}}/>;
};
