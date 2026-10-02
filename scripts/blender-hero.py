# 中文说明：Blender 真实几何片头：A 图标分层装配，B 微距拉远，C 深色摄影棚环绕。输出帧序列与可编辑工程；--review 仅抽样，不等于完整动画。
# 完整命令与适用场景：docs/动画目录.md
import os
"""Native 3D brand geometry traced from the actual Anchor alpha silhouette."""
import bpy, math, json, sys, argparse, time
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
p=argparse.ArgumentParser();p.add_argument('--variant',default='A');p.add_argument('--review',action='store_true');p.add_argument('--frames');a=p.parse_args(args)
project=Path(__file__).resolve().parent.parent
out=Path(os.environ.get('ANCHOR_DELIVERABLES_ROOT',str(project.parent/'Deliverables')))/'HeroRebuild-20261001'/'Blender'
media=project/'public/local-assets/2026-10-01/hero'
out.mkdir(parents=True,exist_ok=True)
variant=a.variant
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=1920;scene.render.resolution_y=1080;scene.render.resolution_percentage=100
scene.render.fps=24 if variant=='C' else 30;scene.frame_start=1;scene.frame_end={'A':300,'B':270,'C':360}[variant]
def timed(f):return max(1,f*.8) if variant=='C' else f
scene.eevee.taa_render_samples=16;scene.eevee.use_raytracing=False;scene.eevee.use_fast_gi=False
scene.eevee.shadow_ray_count=1;scene.render.use_motion_blur=True;scene.render.motion_blur_shutter=.42
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB';scene.render.image_settings.color_depth='8'
scene.view_settings.view_transform='Standard';scene.view_settings.exposure=0
scene.render.film_transparent=False

def rgba(h):
 h=h.strip('#');rgb=[int(h[i:i+2],16)/255 for i in (0,2,4)]
 return tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in rgb)+(1,)
def material(name,color,metal=0,rough=.3,emission=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes.get('Principled BSDF');n.inputs['Base Color'].default_value=rgba(color);n.inputs['Metallic'].default_value=metal;n.inputs['Roughness'].default_value=rough
 n.inputs['Coat Weight'].default_value=.26;n.inputs['Coat Roughness'].default_value=.12
 if emission:n.inputs['Emission Color'].default_value=rgba(color);n.inputs['Emission Strength'].default_value=emission
 return m
blue=material('Anchor cobalt enamel','#1688E8',.4,.22)
side=material('Deep-blue anodised edge','#0B4C7B',.6,.22)
ceramic=material('Porcelain icon shell','#F5F8F7',.15,.2)
sky=material('Sky polished inlay','#62C7FF',.6,.21)
night=variant=='C'
background=material('Studio floor','#06131D' if night else '#E9F0EF',.18 if night else .05,.32)
world=bpy.data.worlds.new('Anchor studio world');scene.world=world;world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=rgba('#143B51' if night else '#D7E4E8');world.node_tree.nodes['Background'].inputs[1].default_value=.28 if night else .65
profile=[(-100,-.03),(6,-.03)]
for i in range(1,25):
 ang=-math.pi/2+(math.pi/2)*i/24;profile.append((6+5*math.cos(ang),4.97+5*math.sin(ang)))
profile.append((11,100))
verts=[(x,y,z) for x in [-100,100] for y,z in profile];n=len(profile);faces=[(i,n+i,n+i+1,i+1) for i in range(n-1)]
mesh=bpy.data.meshes.new('Curved seamless studio');mesh.from_pydata(verts,[],faces);mesh.update();floor=bpy.data.objects.new('Seamless studio cyclorama',mesh);scene.collection.objects.link(floor);floor.data.materials.append(background)
for face in floor.data.polygons:face.use_smooth=True
root=bpy.data.objects.new('Hero assembly',None);scene.collection.objects.link(root);root.location=(1.7,0,2.9)
curve=bpy.data.curves.new('Exact Anchor outline with interior cutouts','CURVE');curve.dimensions='2D';curve.resolution_u=12;curve.fill_mode='BOTH';curve.extrude=.16;curve.bevel_depth=.029;curve.bevel_resolution=4
for points in json.loads((project/'public/brand/logo-contours.json').read_text()):
 s=curve.splines.new('POLY');s.points.add(len(points)-1)
 for point,(x,y) in zip(s.points,points):point.co=(x,y,0,1)
 s.use_cyclic_u=True
logo=bpy.data.objects.new('Anchor extruded silhouette',curve);scene.collection.objects.link(logo);logo.parent=root;logo.rotation_euler=(math.pi/2,0,0);logo.data.materials.append(blue)
logo.location=(0,-.27,0);logo.scale=(.81,.81,.81) if variant=='A' else (1,1,1)

def plate(name,loc,scale,mat,parent=root,bevel=.28):
 w,h=scale[0]*2,scale[2]*2;r=min(w,h)*.2
 c=bpy.data.curves.new(name+' rounded outline','CURVE');c.dimensions='2D';c.fill_mode='BOTH';c.extrude=scale[1];c.bevel_depth=.045;c.bevel_resolution=4
 pts=[]
 for cx,cy,start in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
  for i in range(16):
   ang=math.radians(start+i*90/15);pts.append((cx+r*math.cos(ang),cy+r*math.sin(ang)))
 sp=c.splines.new('POLY');sp.points.add(len(pts)-1)
 for pt,(x,y) in zip(sp.points,pts):pt.co=(x,y,0,1)
 sp.use_cyclic_u=True;o=bpy.data.objects.new(name,c);scene.collection.objects.link(o);o.data.materials.append(mat);o.parent=parent;o.location=loc;o.rotation_euler=(math.pi/2,0,0)
 return o
if variant=='A':
 shell=plate('App icon ceramic body',(0,0,0),(2.38,.19,2.38),ceramic,bevel=.37)
 rear1=plate('Floating cobalt layer',(-.45,.72,.35),(2.31,.12,2.31),sky,bevel=.34)
 rear2=plate('Floating porcelain layer',(.4,1.22,.55),(2.28,.13,2.28),ceramic,bevel=.33)
 for obj,key in [(rear1,[(-1.6,2.3,.9),(-.4,.8,.3),(-.45,.72,.35)]),(rear2,[(1.9,3.2,1.5),(.45,1.4,.65),(.4,1.22,.55)])]:
  for f,loc in zip([1,60,130],key):obj.location=loc;obj.keyframe_insert(data_path='location',frame=f)
elif variant=='C':
 bpy.ops.mesh.primitive_cylinder_add(vertices=128,radius=2.7,depth=.16,location=(1.7,0,.10));ped=bpy.context.object;ped.name='Hero plinth';ped.data.materials.append(side);be=ped.modifiers.new('Plinth rounded edge','BEVEL');be.width=.05;be.segments=4
 for poly in ped.data.polygons:poly.use_smooth=True
 # True curved 3D forms; the hero has visible thickness, reflections and contact shadows.
 for j in range(2):
  c=bpy.data.curves.new('Orbit architecture','CURVE');c.dimensions='3D';c.bevel_depth=.035 if j==0 else .018;c.bevel_resolution=4
  sp=c.splines.new('NURBS');sp.points.add(96)
  for i,pt in enumerate(sp.points):
   ang=2*math.pi*i/96;pt.co=(1.7+(3.2+j*.25)*math.cos(ang),.6+(2.1+j*.3)*math.sin(ang),1.1+j*.45+.36*math.sin(ang*2),1)
  sp.order_u=4;sp.use_endpoint_u=True;o=bpy.data.objects.new('Spatial orbit '+str(j),c);scene.collection.objects.link(o);o.data.materials.append(sky if j==0 else side)

bpy.ops.object.empty_add(type='PLAIN_AXES',location=(1.7,0,2.9));focus=bpy.context.object;focus.name='Logo focus target'
bpy.ops.object.camera_add(location=(2,-15,5));cam=bpy.context.object;cam.name='Hero camera';scene.camera=cam;cam.data.lens=50;cam.data.sensor_width=36
cam.data.dof.use_dof=True;cam.data.dof.focus_object=focus;cam.data.dof.aperture_fstop=4.2 if variant=='B' else 5.6

def camera_key(f,pos,target,lens):
 cam.location=pos;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=lens
 cam.keyframe_insert(data_path='location',frame=timed(f));cam.keyframe_insert(data_path='rotation_euler',frame=timed(f));cam.data.keyframe_insert(data_path='lens',frame=timed(f))
if variant=='A':keys=[(1,(7,-11,6.2),(1,0,3),51),(58,(3.6,-15.4,5.7),(-1.2,0,3),48),(110,(1,-16,5),(-1.2,0,3),48),(160,(2.5,-16,5.5),(-1.2,0,3),48),(230,(.5,-16.8,5.2),(-1.1,0,3),49),(300,(2.4,-16.3,5.5),(-1.1,0,3),49)]
elif variant=='B':keys=[(1,(3.6,-3.5,3.6),(2.1,0,3.2),67),(48,(5.6,-8.4,5.1),(1.2,0,3),56),(94,(2,-14,4.5),(-.4,0,3),53),(160,(.6,-15,4.4),(-.5,0,3),54),(215,(-1,-14.8,4.8),(-.4,0,3),54),(270,(1.2,-14.6,4.5),(-.4,0,3),54)]
else:keys=[(1,(4,-3.8,3.5),(2,0,3.4),72),(52,(6,-7.5,5.6),(1.4,0,3.2),58),(112,(3.8,-13,5.2),(0,0,2.9),54),(190,(-1.2,-13.6,4.7),(-.6,0,3),51),(280,(2,-15,4.8),(-.5,0,3),52),(360,(3,-15.5,5),(-.5,0,3),52),(450,(1.2,-15,4.7),(-.5,0,3),52)]
for key in keys:camera_key(*key)
for f,ang in [(1,-28),(50,18),(110,-7),(160,7),(260,-4),(360,5),(450,-5)]:
 if timed(f)>scene.frame_end:continue
 root.rotation_euler=(math.radians(3),math.radians(-4),math.radians(ang));root.keyframe_insert(data_path='rotation_euler',frame=timed(f))
for f,z in [(1,2.95),(70,3.08),(160,2.94),(260,3.08),(360,2.95),(450,3.06)]:
 if timed(f)>scene.frame_end:continue
 root.location.z=z;root.keyframe_insert(data_path='location',frame=timed(f))

def area(name,loc,energy,size,color,target=(1,0,2.6),size_y=None):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=energy;o.data.shape='RECTANGLE';o.data.size=size;o.data.size_y=size_y or size;o.data.color=rgba(color)[:3];o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
key=area('Moving studio softbox',(-4,-6,8),1900 if night else 1250,5,'#FFFFFF',size_y=2.1)
fill=area('Sky fill',(5,-3,7),1500 if night else 1000,4,'#62C7FF',size_y=6)
rim=area('Rear edge strip',(2,4,6),2200 if night else 1700,4,'#D8F1FF',size_y=1.2)
area('Low reflected fill',(-4,-2,2),300,3,'#1688E8')
for f,x in [(1,-5),(65,4),(160,-2),(260,3),(360,-3),(450,2)]:
 if timed(f)>scene.frame_end:continue
 key.location.x=x;key.rotation_euler=(Vector((1,0,2.7))-key.location).to_track_quat('-Z','Y').to_euler();key.keyframe_insert(data_path='location',frame=timed(f));key.keyframe_insert(data_path='rotation_euler',frame=timed(f))
scene.render.filepath=str(out/f'{variant}-frames'/'hero-');(out/f'{variant}-frames').mkdir(exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(out/f'Anchor-{variant}-hero.blend'))
frames=[80] if a.review else (list(map(int,a.frames.split(','))) if a.frames else range(1,scene.frame_end+1))
start=time.time()
for n,f in enumerate(frames):
 scene.frame_set(f);scene.render.filepath=str(out/f'{variant}-frames'/f'hero-{f:04}.png');bpy.ops.render.render(write_still=True)
 print(f'ANCHOR_HERO {variant} {n+1}/{len(frames)} frame={f} elapsed={time.time()-start:.1f}s',flush=True)
