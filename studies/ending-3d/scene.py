# 中文说明：历史 12 秒片尾的前 6 秒：真实设备拉远、移开并穿过环形结构。Cycles 输出 180 帧 720p30，随后交给 render.mjs 合成。
# 完整命令与适用场景：docs/动画目录.md
import os
"""Independent, real-3D ending camera study. Run with Blender in background.

Existing promo sources and exports are never overwritten. Screens use the
September 30 native captures; identity information is intentionally not guessed.
"""
import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

parser = argparse.ArgumentParser()
parser.add_argument('--frame', type=int)
parser.add_argument('--animation', action='store_true')
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
project = Path(__file__).resolve().parents[2]
delivery = Path(os.environ.get('ANCHOR_DELIVERABLES_ROOT',str(project.parent/'Deliverables'))) / 'Ending3D-20261001'
frames = delivery / 'Frames'
frames.mkdir(parents=True, exist_ok=True)
assets = project / 'public' / 'local-assets' / '2026-09-30' / 'real'

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 12
scene.cycles.use_denoising = True
scene.cycles.device = 'CPU'
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.fps = 30
scene.frame_start = 1
scene.frame_end = 180
scene.render.image_settings.file_format = 'PNG'
scene.view_settings.view_transform = 'Standard'
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.017, 0.042, 0.066, 1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.4

def material(name, color, metallic=0, roughness=0.4, emission=0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    p = mat.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metallic
    p.inputs['Roughness'].default_value = roughness
    if emission:
        p.inputs['Emission Color'].default_value = (*color, 1)
        p.inputs['Emission Strength'].default_value = emission
    return mat

metal = material('Midnight aluminum', (0.08, 0.13, 0.19), 0.82, 0.25)
rim = material('Machined silver edge', (0.36, 0.49, 0.60), 0.8, 0.2)
glass = material('Screen border', (0.008, 0.016, 0.022), 0.25, 0.22)
floor_mat = material('Blue harbor floor', (0.009, 0.027, 0.047), 0.2, 0.36)
cyan = material('Anchor blue guide', (0.06, 0.39, 0.74), 0.6, 0.24, 1.8)
soft_cyan = material('Outer guide', (0.023, 0.09, 0.18), 0.45, 0.38, 0.5)
white = material('Icon ceramic shell', (0.87, 0.93, 0.98), 0.12, 0.25)

def box(name, size, location, mat, bevel=0.1, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    ob = bpy.context.object
    ob.name = name
    ob.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    ob.data.materials.append(mat)
    modifier = ob.modifiers.new('Physical rounded edge', 'BEVEL')
    modifier.width = bevel
    modifier.segments = 5
    ob.modifiers.new('Face normals', 'WEIGHTED_NORMAL')
    ob.parent = parent
    return ob

def screen(name, image_path, width, height, depth, parent):
    # Front faces point towards -Y. UVs retain native screenshot proportions.
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([(-width/2, depth, -height/2), (width/2, depth, -height/2),
                      (width/2, depth, height/2), (-width/2, depth, height/2)], [], [(0,1,2,3)])
    mesh.uv_layers.new()
    for index, uv in enumerate([(0,0),(1,0),(1,1),(0,1)]):
        mesh.uv_layers.active.data[index].uv = uv
    ob = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(ob)
    ob.parent = parent
    mat = bpy.data.materials.new(name + ' native pixels')
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    image = nodes.new('ShaderNodeTexImage')
    image.image = bpy.data.images.load(str(image_path), check_existing=True)
    shader = nodes.new('ShaderNodeEmission')
    shader.inputs['Strength'].default_value = 1
    output = nodes.new('ShaderNodeOutputMaterial')
    mat.node_tree.links.new(image.outputs['Color'], shader.inputs['Color'])
    mat.node_tree.links.new(shader.outputs[0], output.inputs['Surface'])
    ob.data.materials.append(mat)
    return ob

def group(name, location):
    ob = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(ob)
    ob.location = location
    return ob

mac = group('Native Mac workspace', (-1.65, 0, 3.0))
native_mac = bpy.data.images.load(str(assets/'mac-closing.png'), check_existing=True)
mac_h = 7.00 * native_mac.size[1] / native_mac.size[0]
box('Mac aluminum body', (7.25, .24, mac_h+.20), (0,0,0), metal, .16, mac)
box('Mac polished bezel', (7.22, .10, mac_h+.17), (0,-.13,0), rim, .14, mac)
box('Mac screen inset', (7.10,.04,mac_h+.10), (0,-.19,0), glass, .13, mac)
screen('Mac genuine captured window', assets/'mac-closing.png', 7.00, mac_h, -.215, mac)

phone = group('Native iPhone dashboard', (3.15,-.55,2.65))
box('iPhone silver frame', (1.95,.31,4.20), (0,0,0), rim, .16, phone)
box('iPhone black display surround', (1.89,.06,4.14), (0,-.17,0), glass, .15, phone)
screen('iPhone genuine capture', assets/'iphone-home.png', 1.77, 1.77*2622/1206, -.209, phone)

icon = group('Current app icon', (0,8.8,4.22))
icon.scale = (.65,.65,.65)
box('App icon physical ceramic body', (1.62,.24,1.62), (0,0,0), white, .24, icon)
screen('Unchanged current app icon', Path(os.environ.get('ANCHOR_APP_ICON',str(project/'public/brand/anchor-project-logo.png'))), 1.58, 1.58, -.135, icon)

for radius, depth, thickness, mat in [(3.23,3.50,.028,cyan),(3.45,3.83,.012,soft_cyan),(3.68,4.16,.008,soft_cyan)]:
    bpy.ops.mesh.primitive_torus_add(major_radius=radius, minor_radius=thickness,
        major_segments=128, minor_segments=10, location=(0,depth,3.6), rotation=(math.pi/2,0,0))
    bpy.context.object.name = 'Physical guide ring'
    bpy.context.object.data.materials.append(mat)
    for polygon in bpy.context.object.data.polygons:
        polygon.use_smooth = True

box('Harbor ground', (160,160,.15), (0,20,-.20), floor_mat, .01)

def light(name, location, power, color, size, target):
    bpy.ops.object.light_add(type='AREA', location=location)
    ob = bpy.context.object
    ob.name = name
    ob.data.energy = power
    ob.data.color = color
    ob.data.shape = 'DISK'
    ob.data.size = size
    ob.rotation_euler = (Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler()

light('Large soft key', (-5,-6,10), 1500, (.55,.75,1), 9, (0,0,3))
light('Cool right edge', (8,2,7), 1900, (.20,.52,1), 7, (0,0,3))
light('Soft icon key', (-2,4,7), 650, (.68,.85,1), 6, (0,7.5,4.2))
light('Harbor pool', (0,3,9), 900, (.08,.40,1), 5, (0,3,0))

bpy.ops.object.camera_add()
camera = bpy.context.object
camera.name = 'Continuous ending camera'
scene.camera = camera
camera.data.lens = 40
camera.data.clip_end = 300
camera.data.dof.use_dof = False

keys = [
    (1,(-1.65,-7.0,3.0),(-1.65,0,3.0),40),
    (40,(-.4,-16.5,5.4),(0,0,3.1),40),
    (80,(5.0,-15.5,5.9),(0,0.7,3.2),40),
    (112,(2.0,-12.0,4.4),(0,4,3.5),40),
    (152,(0,-1.0,3.8),(0,8.8,3.75),40),
    (180,(0,2.2,3.8),(0,8.8,3.65),40),
]
for frame, position, target, lens in keys:
    camera.location = position
    camera.rotation_euler = (Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.lens = lens
    camera.keyframe_insert('location', frame=frame)
    camera.keyframe_insert('rotation_euler', frame=frame)
    camera.data.keyframe_insert('lens', frame=frame)

for ob, values in [(mac,[(1,(-1.65,0,3),0),(80,(-1.65,0,3),-.08),(112,(-4.8,0,3),-.24),(145,(-8,0,3),-.36)]),
                   (phone,[(1,(3.15,-.55,2.65),-.09),(80,(3.15,-.55,2.65),-.16),(112,(5.1,0,2.65),-.28),(145,(8,0,2.65),-.34)])]:
    for frame, location, angle in values:
        ob.location = location
        ob.rotation_euler = (0,0,angle)
        ob.keyframe_insert('location',frame=frame)
        ob.keyframe_insert('rotation_euler',frame=frame)

for frame, angle in [(1,-.16),(130,-.16),(168,0),(180,0)]:
    icon.rotation_euler = (0,0,angle)
    icon.keyframe_insert('rotation_euler',frame=frame)

scene.render.filepath = str(frames / 'frame-')
# Pack all native textures into the editable study, so the scene is portable.
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(delivery / 'Anchor-ending-3D-study.blend'))
if args.animation:
    bpy.ops.render.render(animation=True)
elif args.frame:
    scene.frame_set(args.frame)
    scene.render.filepath = str(delivery / 'Review' / f'3d-{args.frame:04}.png')
    bpy.ops.render.render(write_still=True)
