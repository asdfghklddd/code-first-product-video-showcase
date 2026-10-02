# 中文说明：20 秒组合：6 秒投锚入水 + 14 秒实体片尾；程序化海面与定向水花，不是流体求解。工程 60 fps，正式输出隔帧采样为 30 fps。
# 完整命令与适用场景：docs/动画目录.md
import os
"""Blender-native ocean insert and approved-layout ending.

All animation is baked into the saved .blend. The private identity is supplied
by local textures; existing promo entries and exports are not modified.
"""
import argparse
import math
import random
import sys
import time
from pathlib import Path

import bpy
from mathutils import Vector

P = argparse.ArgumentParser()
P.add_argument('--animation', action='store_true')
P.add_argument('--review', action='store_true')
P.add_argument('--samples', type=int, default=48)
P.add_argument('--width', type=int, default=1920)
P.add_argument('--start', type=int, default=1)
P.add_argument('--end', type=int)
P.add_argument('--only', choices=['ocean','ending'])
args=P.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
PROJECT=Path(__file__).resolve().parents[2]
OUT=Path(os.environ.get('ANCHOR_DELIVERABLES_ROOT',str(PROJECT.parent/'Deliverables')))/'EndingOcean-20261001'
TEX=OUT/'Textures'
FPS=60
for d in ['OceanFrames','EndingFrames','Review']:
    (OUT/d).mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)

def clamp(x):
    return max(0,min(1,x))

def bezier(x,a,b,c,d):
    x=clamp(x)
    lo,hi=0.0,1.0
    for _ in range(16):
        q=(lo+hi)/2
        bx=3*(1-q)**2*q*a+3*(1-q)*q*q*c+q**3
        if bx<x: lo=q
        else: hi=q
    q=(lo+hi)/2
    return 3*(1-q)**2*q*b+3*(1-q)*q*q*d+q**3

def ramp(t,a,b,mode='out'):
    p=clamp((t-a)/(b-a))
    return bezier(p,*{'out':(.16,1,.3,1),'inout':(.65,0,.35,1),'in':(.65,0,1,.45),'linear':(0,0,1,1)}[mode])

def spring(t,damping,stiffness,mass=1):
    if t<=0: return 0
    w=math.sqrt(stiffness/mass)
    z=damping/(2*math.sqrt(stiffness*mass))
    if z<1:
        wd=w*math.sqrt(1-z*z)
        return 1-math.exp(-z*w*t)*(math.cos(wd*t)+z*w/wd*math.sin(wd*t))
    return 1-math.exp(-w*t)*(1+w*t)

def track(t,keys):
    if t<=keys[0][0]: return keys[0][1]
    for (a,x),(b,y) in zip(keys,keys[1:]):
        if t<=b:
            p=clamp((t-a)/(b-a))
            return x+(y-x)*p
    return keys[-1][1]

def configure(scene,frames,view='Standard'):
    scene.render.engine='BLENDER_EEVEE'
    scene.eevee.taa_render_samples=args.samples
    scene.eevee.use_raytracing=True
    scene.render.resolution_x=args.width
    scene.render.resolution_y=round(args.width*9/16)
    scene.render.resolution_percentage=100
    scene.render.fps=FPS
    scene.frame_start=1
    scene.frame_end=frames
    scene.render.image_settings.file_format='PNG'
    scene.render.image_settings.color_mode='RGBA'
    scene.render.film_transparent=False
    scene.view_settings.view_transform=view
    scene.view_settings.look='None'
    scene.view_settings.exposure=0
    scene.world=bpy.data.worlds.new(scene.name+' world')
    scene.world.use_nodes=True
    scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.015,.037,.054,1)
    scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.35

def set_scene(scene):
    bpy.context.window.scene=scene

def mat(name,color,metallic=0,roughness=.35):
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metallic
    p.inputs['Roughness'].default_value=roughness
    return m

def translucent(m):
    nodes=m.node_tree.nodes
    out=nodes.get('Material Output')
    original=out.inputs['Surface'].links[0].from_socket
    trans=nodes.new('ShaderNodeBsdfTransparent')
    mix=nodes.new('ShaderNodeMixShader')
    opacity=nodes.new('ShaderNodeValue')
    opacity.name='Animated opacity'
    opacity.outputs[0].default_value=1
    m.node_tree.links.new(opacity.outputs[0],mix.inputs[0])
    m.node_tree.links.new(trans.outputs[0],mix.inputs[1])
    m.node_tree.links.new(original,mix.inputs[2])
    m.node_tree.links.new(mix.outputs[0],out.inputs['Surface'])
    m.surface_render_method='BLENDED'
    return opacity.outputs[0]

def texture_mat(name,file,emission=1,physical=False):
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    n=m.node_tree.nodes
    n.clear()
    tex=n.new('ShaderNodeTexImage')
    tex.image=bpy.data.images.load(str(TEX/file),check_existing=True)
    if physical:
        sh=n.new('ShaderNodeBsdfPrincipled')
        sh.inputs['Roughness'].default_value=.23
        sh.inputs['Coat Weight'].default_value=.28
        sh.inputs['Emission Strength'].default_value=emission
        m.node_tree.links.new(tex.outputs['Color'],sh.inputs['Base Color'])
        m.node_tree.links.new(tex.outputs['Color'],sh.inputs['Emission Color'])
    else:
        sh=n.new('ShaderNodeEmission')
        sh.inputs['Strength'].default_value=emission
        m.node_tree.links.new(tex.outputs['Color'],sh.inputs['Color'])
    trans=n.new('ShaderNodeBsdfTransparent')
    mix=n.new('ShaderNodeMixShader')
    value=n.new('ShaderNodeValue')
    value.name='Animated opacity'
    value.outputs[0].default_value=1
    mult=n.new('ShaderNodeMath');mult.operation='MULTIPLY'
    m.node_tree.links.new(tex.outputs['Alpha'],mult.inputs[0])
    m.node_tree.links.new(value.outputs[0],mult.inputs[1])
    m.node_tree.links.new(mult.outputs[0],mix.inputs[0])
    m.node_tree.links.new(trans.outputs[0],mix.inputs[1])
    m.node_tree.links.new(sh.outputs[0],mix.inputs[2])
    out=n.new('ShaderNodeOutputMaterial')
    m.node_tree.links.new(mix.outputs[0],out.inputs['Surface'])
    m.surface_render_method='BLENDED'
    return m,value.outputs[0]

def mesh(name,vertices,faces,material,parent=None):
    data=bpy.data.meshes.new(name)
    data.from_pydata(vertices,[],faces)
    data.update()
    ob=bpy.data.objects.new(name,data)
    bpy.context.collection.objects.link(ob)
    ob.data.materials.append(material)
    ob.parent=parent
    return ob

def smooth(ob):
    for p in ob.data.polygons:p.use_smooth=True
    return ob

def bevel(ob,width=.03,segments=3):
    m=ob.modifiers.new('Rounded manufactured edges','BEVEL');m.width=width;m.segments=segments
    ob.modifiers.new('Weighted face normals','WEIGHTED_NORMAL')
    return ob

def group(name):
    ob=bpy.data.objects.new(name,None)
    bpy.context.collection.objects.link(ob)
    return ob

def box(name,dimensions,location,material,radius=.025,parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1,location=location)
    ob=bpy.context.object;ob.name=name;ob.dimensions=dimensions
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    ob.data.materials.append(material);ob.parent=parent
    return bevel(ob,radius)

def rounded(name,w,h,d,r,material,parent=None):
    outline=[]
    for cx,cz,a in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
        for j in range(17):
            angle=math.radians(a+j*90/16)
            outline.append((cx+r*math.cos(angle),cz+r*math.sin(angle)))
    n=len(outline)
    verts=[(x,y,z) for y in [-d/2,d/2] for x,z in outline]
    faces=[tuple(range(n)),tuple(range(2*n-1,n-1,-1))]
    faces += [(i,i+n,(i+1)%n+n,(i+1)%n) for i in range(n)]
    return bevel(mesh(name,verts,faces,material,parent),.022,3)

def plane(name,w,h,material,parent=None,y=0):
    ob=mesh(name,[(-w/2,y,-h/2),(w/2,y,-h/2),(w/2,y,h/2),(-w/2,y,h/2)],[(0,1,2,3)],material,parent)
    uv=ob.data.uv_layers.new()
    for i,xy in enumerate([(0,0),(1,0),(1,1),(0,1)]):uv.data[i].uv=xy
    return ob

def curve(name,points,radius,material,parent=None,cyclic=False):
    data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D'
    data.resolution_u=24;data.bevel_depth=radius;data.bevel_resolution=3
    s=data.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
    for p,co in zip(s.bezier_points,points):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
    s.use_cyclic_u=cyclic
    ob=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(ob)
    ob.data.materials.append(material);ob.parent=parent
    return ob

def light(name,location,energy,color,size,target,kind='AREA'):
    bpy.ops.object.light_add(type=kind,location=location)
    ob=bpy.context.object;ob.name=name;ob.data.energy=energy;ob.data.color=color
    if kind=='AREA':ob.data.shape='DISK';ob.data.size=size
    else:ob.data.spot_size=size;ob.data.spot_blend=.65
    ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler()
    return ob

def camera(name):
    bpy.ops.object.camera_add()
    ob=bpy.context.object;ob.name=name
    bpy.context.scene.camera=ob;ob.data.clip_end=180
    ob.data.dof.use_dof=True
    return ob

def pose_key(ob,f):
    for p in ['location','rotation_euler','scale']:ob.keyframe_insert(p,frame=f)

def value_key(socket,value,f):
    socket.default_value=value;socket.keyframe_insert('default_value',frame=f)

def visibility(ob,visible,f):
    ob.hide_render=not visible;ob.keyframe_insert('hide_render',frame=f)

def loop_mesh(name,rx,rz,tube,material,parent=None):
    verts=[];faces=[];N=48;M=8
    for i in range(N):
        a=2*math.pi*i/N
        for j in range(M):
            q=2*math.pi*j/M
            verts.append(((rx+tube*math.cos(q))*math.cos(a),tube*math.sin(q),(rz+tube*math.cos(q))*math.sin(a)))
    for i in range(N):
        for j in range(M):faces.append((i*M+j,((i+1)%N)*M+j,((i+1)%N)*M+(j+1)%M,i*M+(j+1)%M))
    return smooth(mesh(name,verts,faces,material,parent))

# ---- Six-second photorealistic-style ocean insert ----
ocean=bpy.context.scene;ocean.name='01 — Cast anchor / ocean'
configure(ocean,360,'AgX')
set_scene(ocean)
ocean.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.065,.13,.18,1)
ocean.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.42
steel=mat('Forged steel • roughened, wet, lightly oxidised',(.24,.28,.30),.93,.26)
n=steel.node_tree.nodes;links=steel.node_tree.links;p=n.get('Principled BSDF')
noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=8;noise.inputs['Detail'].default_value=5
coords=n.new('ShaderNodeTexCoord');links.new(coords.outputs['Object'],noise.inputs['Vector'])
r=n.new('ShaderNodeValToRGB');r.color_ramp.elements[0].position=.18;r.color_ramp.elements[0].color=(.055,.079,.085,1)
r.color_ramp.elements[1].position=.82;r.color_ramp.elements[1].color=(.40,.43,.44,1)
links.new(noise.outputs['Fac'],r.inputs[0]);links.new(r.outputs['Color'],p.inputs['Base Color'])
micro=n.new('ShaderNodeTexNoise');micro.inputs['Scale'].default_value=150;micro.inputs['Detail'].default_value=3
links.new(coords.outputs['Object'],micro.inputs['Vector'])
bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.22;bump.inputs['Distance'].default_value=.015
links.new(micro.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],p.inputs['Normal'])
rough=n.new('ShaderNodeMapRange');rough.inputs['From Min'].default_value=0;rough.inputs['From Max'].default_value=1
rough.inputs['To Min'].default_value=.18;rough.inputs['To Max'].default_value=.37
links.new(noise.outputs['Fac'],rough.inputs[0]);links.new(rough.outputs[0],p.inputs['Roughness'])
anchor=group('ANCHOR — forged Admiralty form')
shank=mesh('Tapered solid steel shank',[
    (-.105,-.095,.20),(.105,-.095,.20),(.105,.095,.20),(-.105,.095,.20),
    (-.125,-.085,2.28),(.125,-.085,2.28),(.125,.085,2.28),(-.125,.085,2.28)],
    [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],steel,anchor)
bevel(shank,.022,4)
box('Crown collar',(.37,.29,.26),(0,0,.31),steel,.08,anchor)
for sign in [-1,1]:
    curve('Forged curved arm',[(0,0,.30),(sign*.34,0,.35),(sign*.68,0,.57),(sign*.93,0,.95)],.105,steel,anchor)
    v=[(sign*.83,-.22,.75),(sign*1.16,-.12,1.35),(sign*.65,-.12,1.01),
       (sign*.83,.22,.75),(sign*1.16,.12,1.35),(sign*.65,.12,1.01)]
    bevel(mesh('Sharpened triangular fluke',v,[(0,2,1),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)],steel,anchor),.018,3)
stock=curve('Solid cross-stock',[(-1.22,0,1.85),(0,0,1.85),(1.22,0,1.85)],.066,steel,anchor)
for x in [-1.18,1.18]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=.10,location=(x,0,1.85))
    ob=bpy.context.object;ob.name='Stock end cap';ob.parent=anchor;ob.scale=(1.25,1,1);ob.data.materials.append(steel);smooth(ob)
ring=loop_mesh('Forged shackle ring',.22,.26,.052,steel,anchor);ring.location=(0,0,2.53)
box('Shackle neck',(.16,.17,.16),(0,0,2.28),steel,.025,anchor)
chain=[]
for i in range(21):
    ob=loop_mesh(f'Interlocking chain link {i+1:02}',.091,.148,.024,steel,anchor)
    ob.location=(0,0,2.87+i*.235);ob.rotation_euler.z=math.pi/2*(i%2)
    chain.append(ob)

water=mat('Ocean water • IOR 1.333',(.16,.35,.39),0,.13)
wp=water.node_tree.nodes.get('Principled BSDF')
wp.inputs['IOR'].default_value=1.333;wp.inputs['Transmission Weight'].default_value=1
wp.inputs['Coat Weight'].default_value=.15
# Keep the above-water Fresnel surface, but remove the artificial images of
# analytical area lights on its underside when the tracking camera submerges.
wn=water.node_tree.nodes
geo=wn.new('ShaderNodeNewGeometry');transparent=wn.new('ShaderNodeBsdfTransparent');wmix=wn.new('ShaderNodeMixShader')
water.node_tree.links.new(geo.outputs['Backfacing'],wmix.inputs[0])
water.node_tree.links.new(wp.outputs[0],wmix.inputs[1]);water.node_tree.links.new(transparent.outputs[0],wmix.inputs[2])
water.node_tree.links.new(wmix.outputs[0],wn.get('Material Output').inputs['Surface'])
bpy.ops.mesh.primitive_plane_add()
surface=bpy.context.object;surface.name='Moving physical ocean surface';surface.data.materials.append(water)
om=surface.modifiers.new('Ocean waves','OCEAN');om.geometry_mode='GENERATE';om.resolution=7;om.viewport_resolution=5
om.spatial_size=35;om.wave_scale=.23;om.choppiness=.60;om.wind_velocity=9
om.time=0;om.keyframe_insert('time',frame=1);om.time=1.1;om.keyframe_insert('time',frame=360)
smooth(surface)
volume=bpy.data.materials.new('Underwater suspended particles and blue-green absorption');volume.use_nodes=True
vn=volume.node_tree.nodes;vn.clear();vo=vn.new('ShaderNodeOutputMaterial');vs=vn.new('ShaderNodeVolumePrincipled')
vs.inputs['Density'].default_value=.039;vs.inputs['Color'].default_value=(.21,.43,.55,1);vs.inputs['Anisotropy'].default_value=.35
volume.node_tree.links.new(vs.outputs['Volume'],vo.inputs['Volume'])
box('Continuous underwater volume',(95,95,70),(0,0,-35),volume,.005)
ground=mat('Dark submerged silt',(.036,.072,.073),0,.90)
gn=ground.node_tree.nodes;gnoise=gn.new('ShaderNodeTexNoise');gnoise.inputs['Scale'].default_value=20
gb=gn.new('ShaderNodeBump');gb.inputs['Distance'].default_value=.06;gb.inputs['Strength'].default_value=.55
ground.node_tree.links.new(gnoise.outputs['Fac'],gb.inputs['Height']);ground.node_tree.links.new(gb.outputs['Normal'],gn.get('Principled BSDF').inputs['Normal'])
box('Distant sea bed',(90,90,.3),(0,0,-65),ground,.01)
light('Overcast silver surface key',(-4,-7,9),2600,(.72,.85,.91),7,(0,0,0))
light('Surface rim reflection',(6,4,7),2200,(.50,.77,.82),5,(0,0,1))
underfill=light('Submerged soft camera fill',(-4,-5,-2),1500,(.28,.60,.67),6,(0,0,-4))
underfill.data.specular_factor=.12
for i in range(6):
    light(f'Physical underwater sun shaft {i+1}',(-5+i*1.7,4+i*.55,5),2200,(.58,.80,.78),.17+i*.022,
      (-1+i*.85,0,-8),kind='SPOT')
beam_mat=bpy.data.materials.new('Soft localised underwater light shafts');beam_mat.use_nodes=True
bn=beam_mat.node_tree.nodes;bn.clear();bo=bn.new('ShaderNodeOutputMaterial');bs=bn.new('ShaderNodeVolumePrincipled')
bs.inputs['Density'].default_value=.010;bs.inputs['Color'].default_value=(.45,.72,.77,1)
bs.inputs['Emission Color'].default_value=(.08,.25,.32,1);bs.inputs['Emission Strength'].default_value=.07
beam_mat.node_tree.links.new(bs.outputs[0],bo.inputs['Volume'])
for i in range(4):
    start=Vector((-6+i*3.2,8+i*.7,.4));end=start+Vector((4,-1.4,-18))
    bpy.ops.mesh.primitive_cone_add(vertices=32,radius1=.77,radius2=.035,depth=(end-start).length,location=(start+end)/2)
    ob=bpy.context.object;ob.name='Spatial underwater beam';ob.rotation_euler=(start-end).to_track_quat('Z','Y').to_euler();ob.data.materials.append(beam_mat)

cam=camera('Ocean camera — fall, waterline, descent');cam.data.lens=43;cam.data.dof.aperture_fstop=4.0
focus=group('Anchor tracking focus');cam.data.dof.focus_object=focus

# Radial liquid sheet with baked shape keys. The sheet opens, rises, and falls.
N=72;R=6;verts=[];faces=[]
for i in range(N):
    a=2*math.pi*i/N
    for j in range(R):verts.append((.32*math.cos(a),.32*math.sin(a),.03))
for i in range(N):
    for j in range(R-1):faces.append((i*R+j,((i+1)%N)*R+j,((i+1)%N)*R+j+1,i*R+j+1))
crown=smooth(mesh('Entry splash — curved liquid crown',verts,faces,water))
crown.shape_key_add(name='Basis')
for k,age in enumerate([0,.08,.16,.28,.42,.60,.82,1.05]):
    key=crown.shape_key_add(name=f'Liquid sheet phase {k}')
    for i in range(N):
        a=2*math.pi*i/N
        for j in range(R):
            q=j/(R-1);rad=.31+age*.95+q*.20
            height=max(0,(2.6*age-3.2*age*age))*(q**1.6)*(1+.28*math.sin(a*11)+.15*math.sin(a*19))
            key.data[i*R+j].co=(rad*math.cos(a),rad*math.sin(a),.045+height)
    f0=1+round((1.57+age)*FPS)
    key.value=0;key.keyframe_insert('value',frame=f0-7)
    key.value=1;key.keyframe_insert('value',frame=f0)
    key.value=0;key.keyframe_insert('value',frame=f0+9)
crown.hide_render=True;crown.keyframe_insert('hide_render',frame=1)
crown.hide_render=False;crown.keyframe_insert('hide_render',frame=95)
crown.hide_render=True;crown.keyframe_insert('hide_render',frame=160)

rng=random.Random(46)
spray=[]
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1)
base=bpy.context.object;base.name='Spray drop base';base.data.materials.append(water);smooth(base)
for i in range(132):
    ob=base if i==0 else bpy.data.objects.new(f'Ballistic water drop {i+1}',base.data)
    if i>0:bpy.context.collection.objects.link(ob)
    spray.append((ob,rng.uniform(0,math.tau),rng.uniform(1.2,3.4),rng.uniform(1.8,4.0),rng.uniform(.010,.035),rng.uniform(-.07,.13)))

bubble_mat=mat('Clear entrained air',(.63,.88,.90),0,.08)
bubble_mat.node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value=.92
bubble_mat.node_tree.nodes.get('Principled BSDF').inputs['IOR'].default_value=1.10
bubbles=[]
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=1)
base=bpy.context.object;base.name='Bubbles base';base.data.materials.append(bubble_mat);smooth(base)
for i in range(96):
    ob=base if i==0 else bpy.data.objects.new(f'Entrained rising bubble {i+1}',base.data)
    if i>0:bpy.context.collection.objects.link(ob)
    bubbles.append((ob,rng.uniform(-1,1),rng.uniform(-.45,.75),rng.uniform(0,2.5),rng.uniform(.014,.049),rng.uniform(1.70,2.45)))

ont=bpy.data.node_groups.new('Ocean light-field dissolve','CompositorNodeTree')
ont.interface.new_socket(name='Image',in_out='OUTPUT',socket_type='NodeSocketColor')
ocean.compositing_node_group=ont;cn=ont.nodes
rl=cn.new('CompositorNodeRLayers');rl.scene=ocean
plate=cn.new('CompositorNodeImage');plate.image=bpy.data.images.load(str(TEX/'background.png'),check_existing=True)
mix=cn.new('ShaderNodeMix');mix.data_type='RGBA';mix.blend_type='MIX';mix.inputs[0].default_value=0
ont.links.new(rl.outputs['Image'],mix.inputs[6]);ont.links.new(plate.outputs['Image'],mix.inputs[7])
co=cn.new('NodeGroupOutput');ont.links.new(mix.outputs[2],co.inputs['Image'])

def bake_ocean(f):
    t=(f-1)/FPS
    z=track(t,[(0,5.2),(.5,4.4),(1,2.9),(1.5,.4),(1.7,-.30),(2.25,-1.7),(3.5,-3.7),(5.2,-6.8),(5.65,-7.42),(6,-7.40)])
    anchor.location=(math.sin(t*.9)*.13,.12+math.sin(t*.6)*.08,z)
    anchor.rotation_euler=(.035*math.sin(t*2),.045*math.sin(t*1.7),.32+math.sin(t*.75)*.22)
    pose_key(anchor,f)
    for i,ob in enumerate(chain):
        ob.location=(.045*math.sin(t*1.2+i*.32)*i/12,.03*math.sin(t+i*.45),2.87+i*.235)
        ob.rotation_euler=(.05*math.sin(t+i*.3),.06*math.sin(t*.7+i*.5),math.pi/2*(i%2))
        pose_key(ob,f)
    cx=track(t,[(0,-2.5),(1.3,-2.1),(2.4,-1.1),(4.5,.9),(6,.55)])
    cy=track(t,[(0,-11),(1.3,-10),(2.4,-8.8),(4.5,-8),(6,-7.8)])
    cz=track(t,[(0,3.8),(1.3,3),(2.4,-1.0),(4.5,-3.8),(6,-4.7)])
    target=Vector((0,.15,track(t,[(0,1),(1.3,1),(2.4,-1),(4.5,-3.6),(6,-5.7)])))
    cam.location=(cx,cy,cz);cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();pose_key(cam,f)
    focus.location=(0,0,z+1.3);pose_key(focus,f)
    for ob,a,speed,vz,size,delay in spray:
        age=t-1.57-delay
        ob.location=((.35+speed*age)*math.cos(a),(.35+speed*age)*math.sin(a),.06+vz*age-5.3*age*age)
        ob.scale=(size,size,size*(1.8+abs(vz-10.6*age)*.2));pose_key(ob,f)
        visibility(ob,0<age<.85 and ob.location.z>.03,f)
    for ob,x,y,delay,size,born in bubbles:
        age=t-born
        ob.location=(x+math.sin(age*2+delay)*.09,y,z+1.9+delay+max(0,age)*.95)
        ob.scale=(size,size,size*1.1);pose_key(ob,f)
        visibility(ob,age>0 and -.05>ob.location.z>-7.5,f)
    value_key(mix.inputs[0],ramp(t,5.24,5.99,'inout'),f)

for f in list(range(1,361,2))+[360]:bake_ocean(f)
print('OCEAN_BAKED',flush=True)

# ---- Fourteen-second ending: physical page panels, paper card, ceramic icon ----
ending=bpy.data.scenes.new('02 — Approved ending / physical stage')
configure(ending,840,'Standard');set_scene(ending)
ending.eevee.use_raytracing=False
ending.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.12
ecam=camera('Ending camera — matched framing with physical focus')
ecam.location=(0,-21,0);ecam.rotation_euler=(math.pi/2,0,0);ecam.data.lens=39.375
ecam.data.dof.aperture_fstop=2.1

def screen_pos(x,y,depth=0):
    factor=(21+depth)/21
    return ((x-960)*.01*factor,depth,(540-y)*.01*factor)

def pix_plane(name,file,x,y,w,h,depth=-1,physical=False):
    m,alpha=texture_mat(name+' material',file,1 if not physical else .65,physical)
    factor=(21+depth)/21
    ob=plane(name,w*.01*factor,h*.01*factor,m)
    ob.location=screen_pos(x+w/2,y+h/2,depth)
    return ob,alpha

back_m,_=texture_mat('Original-inspired teal light field','background.png')
back=plane('Curved visual backdrop',19.2*31/21,10.8*31/21,back_m)
back.location=(0,10,0);back.scale=(1.025,1,1.025)
paper=mat('Warm-white satin paper',(.89,.91,.85),.02,.28)
paper.node_tree.nodes.get('Principled BSDF').inputs['Coat Weight'].default_value=.16
paper.node_tree.nodes.get('Principled BSDF').inputs['Emission Color'].default_value=(.89,.91,.85,1)
paper.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=.76
paper_alpha=translucent(paper)
paper.surface_render_method='DITHERED'
silver=mat('Satin blue-grey panel frame',(.32,.45,.46),.72,.24);silver_alpha=translucent(silver)
mac=group('Native Mac panel — physical rounded frame')
rounded('Mac rounded frame',10.92,7.005,.16,.24,silver,mac)
mac_mat,mac_alpha=texture_mat('Mac native interface','mac-screen.png',.95)
mac_plane=plane('Mac native pixels',10.80,6.885,mac_mat,mac,y=-.085)
phone=group('Native phone panel — physical rounded frame')
phone_silver=mat('Phone satin edge',(.32,.45,.46),.72,.24);phone_body_alpha=translucent(phone_silver)
rounded('Phone rounded frame',3.60,7.66,.18,.46,phone_silver,phone)
phone_mat,phone_alpha=texture_mat('Phone native interface','phone-screen.png',.95)
plane('Phone native pixels',3.46,3.46*2622/1206,phone_mat,phone,y=-.098)
card=group('Work card — physical push through camera')
rounded('Work card solid satin body',10.1,5.22,.16,.34,paper,card)
card_decal=[]
for i,file in enumerate(['card-header.png','card-row0.png','card-row1.png','card-row2.png']):
    m,a=texture_mat(file,file)
    m.surface_render_method='DITHERED'
    ob=plane('Transparent typesetting '+file,10.1,5.22,m,card,y=-.087-i*.001)
    card_decal.append((ob,a))

ceramic=mat('Pearl ceramic icon body',(.90,.95,.92),.09,.22)
ceramic.node_tree.nodes.get('Principled BSDF').inputs['Coat Weight'].default_value=.32
ceramic_alpha=translucent(ceramic)
ceramic.surface_render_method='DITHERED'
logo=group('Physical icon — extruded rounded ceramic')
rounded('Rounded ceramic tile',3.32,3.32,.24,.81,ceramic,logo)
lm,la=texture_mat('Unchanged app icon face','logo-face.png',.63,True)
lm.surface_render_method='DITHERED'
plane('Exact icon face decal',3.32,3.32,lm,logo,y=-.126)
# Raise the blue mark itself from the face, preserving its exact raster contour.
im=bpy.data.images.load(str(TEX/'logo-face.png'),check_existing=True)
pixels=list(im.pixels);iw,ih=im.size;S=332;verts=[];faces=[]
mask={}
for j in range(S):
    for i in range(S):
        k=(min(ih-1,int((j+.5)*ih/S))*iw+min(iw-1,int((i+.5)*iw/S)))*4
        r,g,b,a=pixels[k:k+4]
        if b>.50 and r<.40 and b>r*1.7 and a>.8:mask[i,j]=True
for i,j in mask:
    x0=(i/S-.5)*3.32;x1=((i+1)/S-.5)*3.32;z0=(j/S-.5)*3.32;z1=((j+1)/S-.5)*3.32
    k=len(verts);verts.extend([(x0,-.160,z0),(x1,-.160,z0),(x1,-.160,z1),(x0,-.160,z1)])
    faces.append((k,k+1,k+2,k+3))
    for side,nb in enumerate([(i,j-1),(i+1,j),(i,j+1),(i-1,j)]):
        if nb not in mask:
            a0=[(x0,z0),(x1,z0),(x1,z1),(x0,z1)][side]
            a1=[(x1,z0),(x1,z1),(x0,z1),(x0,z0)][side]
            k=len(verts);verts.extend([(a0[0],-.127,a0[1]),(a1[0],-.127,a1[1]),(a1[0],-.160,a1[1]),(a0[0],-.160,a0[1])]);faces.append((k,k+1,k+2,k+3))
blue,blue_alpha=texture_mat('Raised exact blue brand mark','logo-face.png',.85,True)
blue.surface_render_method='DITHERED'
mark=mesh('Physically raised blue brand mark',verts,faces,blue,logo)
uv=mark.data.uv_layers.new()
for poly in mark.data.polygons:
    for li in poly.loop_indices:
        co=mark.data.vertices[mark.data.loops[li].vertex_index].co
        uv.data[li].uv=(co.x/3.32+.5,co.z/3.32+.5)

name,name_a=pix_plane('Brand name','name.png',757,346,800,70)
line1,line1_a=pix_plane('Slogan first line','slogan-1.png',752,405,900,145)
line2,line2_a=pix_plane('Slogan second line','slogan-2.png',752,536.72,1000,160)
footer,footer_a=pix_plane('Original identity footer','footer.png',0,949,1920,70)
top,top_a=pix_plane('Top label','top-label.png',75,48,600,50)
refl,refl_a=pix_plane('Diffuse floating reflection','soft-reflection.png',328,691,332,50,-.7)
gold=mat('Warm yellow brand underline',(.96,.68,.11),.10,.32)
gold.node_tree.nodes.get('Principled BSDF').inputs['Emission Color'].default_value=(.96,.68,.11,1)
gold.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=.65
underline=box('Fine yellow underline',(.88,.014,.04),screen_pos(796,707,-1.0),gold,.006)
guide=mat('Fine mint elliptical guide',(.31,.60,.48),.05,.42)
guide.node_tree.nodes.get('Principled BSDF').inputs['Emission Color'].default_value=(.31,.60,.48,1)
guide.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=.65
guide_a=translucent(guide)
guide_ob=curve('Physical thin elliptical orbit',[(2.08*math.cos(i*math.tau/64),.22*math.sin(i*math.tau/64),-1.55+.65*math.sin(i*math.tau/64)) for i in range(64)],.004,guide,logo,True)
key=light('Large soft card key',(-5,-9,7),520,(.83,.96,.94),8,(0,-2,0))
light('Soft teal edge bounce',(8,-3,5),340,(.26,.62,.65),7,(0,-1,0))
sweep=light('Moving real specular sweep',(-8,-5,4),230,(1,.98,.84),3,(-4,-1,0))
card_sweep=light('Diagonal reflection across work card',(-8,-5,4),0,(1,.99,.94),.8,(0,-2,0))
card_sweep.data.shape='RECTANGLE';card_sweep.data.size_y=7
ent=bpy.data.node_groups.new('Ending soft highlight grade','CompositorNodeTree')
ent.interface.new_socket(name='Image',in_out='OUTPUT',socket_type='NodeSocketColor')
ending.compositing_node_group=ent;n=ent.nodes
rl=n.new('CompositorNodeRLayers');rl.scene=ending
glare=n.new('CompositorNodeGlare')
glare.inputs['Type'].default_value='Fog Glow'
glare.inputs['Quality'].default_value='Medium'
glare.inputs['Threshold'].default_value=1.5
glare.inputs['Strength'].default_value=.03
ent.links.new(rl.outputs['Image'],glare.inputs[0])
co=n.new('NodeGroupOutput');ent.links.new(glare.outputs[0],co.inputs['Image'])

def card_pose(t):
    en=spring(t-2.55,19,100,.9);rev=ramp(t,2.55,3.5);push=ramp(t,6.64,7.37,'in');out=ramp(t,7.30,7.72,'inout')
    depth=-2-push*15.8
    card.location=screen_pos(960+math.sin(t*.9)*16-push*92,529-math.sin(t*.7)*10-push*15,depth)
    s=(.63+en*.37)*19/21;card.scale=(s,s,s)
    card.rotation_euler=(math.radians((1-rev)*8),math.radians((1-rev)*3-math.sin(t*.6)*.22),math.radians((1-rev)*-19+push*2.4))
    return rev*(1-out)

def bake_ending(f):
    t=(f-1)/FPS
    spread=ramp(t,.35,2.8,'inout');focus=ramp(t,2.45,3.55,'inout');fade=1-ramp(t,6.4,7.16,'inout')
    visible=(1-focus*.76)*fade*ramp(t,0,.68)
    drift=math.sin(t*.45)*22
    mac.location=screen_pos(280-spread*470+drift+540,255-spread*39-t*4+344.25,spread*2.1)
    mac.rotation_euler=(math.radians(3),math.radians(spread*8),math.radians(spread*15));pose_key(mac,f)
    phone.location=screen_pos(1370+spread*138-drift*.4+(346+spread*78)/2,125+spread*25-t*9+(346+spread*78)*2622/1206/2,spread*.6)
    phone.rotation_euler=(math.radians(-2),math.radians(-spread*7),math.radians(-spread*12));phone.scale=(1+spread*78/346,)*3;pose_key(phone,f)
    for a in [mac_alpha,silver_alpha,phone_alpha,phone_body_alpha]:value_key(a,visible,f)
    ca=card_pose(t);pose_key(card,f);value_key(paper_alpha,ca,f)
    for i,(ob,a) in enumerate(card_decal):
        p=1 if i==0 else ramp(t,3.70+(i-1)*.24,4.24+(i-1)*.24)
        ob.location.z=-(1-p)*.16;pose_key(ob,f);value_key(a,ca*p,f)
    p=spring(t-7.48,15,88);enter=ramp(t,7.48,8.3);bob=math.sin((t-8.6)*1.15)*4*ramp(t,8.6,10)
    logo.location=screen_pos(494,496+(1-p)*52+bob,-1.6)
    s=(.61+p*.39)*19.4/21;logo.scale=(s,s,s)
    logo.rotation_euler=(math.radians((1-enter)*9+3.5),math.radians((1-enter)*7-math.sin(t*.4)*-1.2),math.radians((1-enter)*-20+math.sin(t*.5)*-3.2))
    pose_key(logo,f)
    for a in [ceramic_alpha,la,blue_alpha]:value_key(a,enter,f)
    value_key(guide_a,ramp(t,8.7,9.55)*.26,f)
    value_key(refl_a,enter*.54,f)
    for ob,a,start,baseY,h in [(name,name_a,8.25,346,70),(line1,line1_a,8.48,405,145),(line2,line2_a,8.67,536.72,160)]:
        p=ramp(t,start,start+.73)
        value_key(a,ramp(t,start,start+.34),f)
        initial=12 if ob==name else h*1.05
        ob.location.z=screen_pos(0,baseY+h/2+(1-p)*initial,-1)[2];pose_key(ob,f)
    value_key(footer_a,ramp(t,10.25,11.05),f)
    value_key(top_a,ramp(t,0,.7),f)
    u=ramp(t,9.1,10.15);underline.scale.x=max(.001,u);underline.location=screen_pos(752+44*u,707,-1);pose_key(underline,f)
    visibility(underline,t>9.1,f)
    sp=ramp(t,9.05,10.3,'inout');sweep.location=(-8+sp*10,-5,4)
    sweep.rotation_euler=(Vector(logo.location)-sweep.location).to_track_quat('-Z','Y').to_euler();pose_key(sweep,f)
    sweep.data.energy=230+math.sin(sp*math.pi)*210;sweep.data.keyframe_insert('energy',frame=f)
    cs=ramp(t,3.75,5.05,'inout')
    card_sweep.location=(-8+cs*17,-5,4-cs*3)
    card_sweep.rotation_euler=(Vector(card.location)-card_sweep.location).to_track_quat('-Z','Y').to_euler();pose_key(card_sweep,f)
    card_sweep.data.energy=190*math.sin(cs*math.pi);card_sweep.data.keyframe_insert('energy',frame=f)
    ecam.data.dof.focus_distance=21-focus*2
    if t>6.65:ecam.data.dof.focus_distance=19
    if t>7.43:ecam.data.dof.focus_distance=8+ramp(t,7.48,8.3)*11.4
    ecam.data.dof.keyframe_insert('focus_distance',frame=f)
    ecam.data.dof.aperture_fstop=1.5 if 2.5<t<8.3 else 3.2
    ecam.data.dof.keyframe_insert('aperture_fstop',frame=f)
    back.location.x=math.sin(t*.22)*.06;back.location.z=-t*.007;pose_key(back,f)

for f in list(range(1,841,2))+[840]:bake_ending(f)
print('ENDING_BAKED',flush=True)

# A third scene provides a complete, playable 20-second Blender timeline.
final=bpy.data.scenes.new('00 — Complete 20 second film')
configure(final,1200,'Standard');set_scene(final)
final.render.use_sequencer=True
ed=final.sequence_editor_create()
o=ed.strips.new_scene('01 • Real anchor / ocean',ocean,channel=1,frame_start=1)
o.scene_input='CAMERA';o.frame_final_duration=360
e=ed.strips.new_scene('02 • Approved motion translated to 3D',ending,channel=1,frame_start=361)
e.scene_input='CAMERA';e.frame_final_duration=840
for sc in [ocean,ending]:
    sc.render.filepath=str(OUT/('OceanFrames' if sc==ocean else 'EndingFrames')/'frame-')
# Pack typography, native captures and the icon face into the editable scene.
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Anchor-ocean-and-ending-20s.blend'))
print('BLEND_SAVED',flush=True)

if args.review:
    for sc,frames,label in [(ocean,[55,90,106,150,230,300],'ocean'),(ending,[60,180,300,420,444,480,570,750],'ending')]:
        if args.only and args.only!=label:continue
        set_scene(sc)
        for f in frames:
            sc.frame_set(f);sc.render.filepath=str(OUT/'Review'/f'{label}-{f:04}.png')
            t=time.time();bpy.ops.render.render(write_still=True)
            print('REVIEW',label,f,'SECONDS',round(time.time()-t,2),flush=True)
elif args.animation:
    targets=[(ocean,'ocean'),(ending,'ending')]
    for sc,label in targets:
        if args.only and args.only!=label:continue
        set_scene(sc);sc.frame_start=args.start;sc.frame_end=args.end or (360 if sc==ocean else 840)
        sc.frame_step=2
        sc.render.filepath=str(OUT/('OceanFrames' if sc==ocean else 'EndingFrames')/'frame-')
        bpy.ops.render.render(animation=True)
