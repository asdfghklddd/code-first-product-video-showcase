# 中文说明：仅把已生成 Blender 工程的初始视图调到片尾镜头；不产生新动画，也不替代 prepare/render。
# 完整命令与适用场景：docs/动画目录.md
import os
"""Set a useful camera view in the packed editable file, without rendering."""
from pathlib import Path
import json
import bpy
out=Path(os.environ.get('ANCHOR_DELIVERABLES_ROOT',str(Path(__file__).resolve().parents[2].parent/'Deliverables')))/'EndingOcean-20261001'
file=out/'Anchor-ocean-and-ending-20s.blend'
bpy.ops.wm.open_mainfile(filepath=str(file))
scene=bpy.data.scenes['02 — Approved ending / physical stage']
bpy.context.window.scene=scene
scene.frame_set(751)
identity=json.loads((out/'original-ending-info.json').read_text())
for key in ['title','school','group']:
    scene[key]=identity[key]
scene['slogan']='与 AI 从容共事'
for name,events in {
    '01 — Cast anchor / ocean':[(1,'海面'),(60,'船锚下落'),(95,'入水'),(145,'水下镜头'),(230,'深海下沉'),(315,'衔接片尾')],
    '02 — Approved ending / physical stage':[(1,'APP 页面'),(154,'信息卡'),(223,'作品名'),(237,'学校'),(251,'组别'),(399,'卡片推近'),(450,'Logo 显现'),(510,'slogan'),(616,'信息页脚')],
    '00 — Complete 20 second film':[(1,'投锚'),(361,'原有片尾节奏'),(515,'作品信息'),(760,'推镜转场'),(811,'Logo'),(871,'slogan'),(977,'信息页脚')],
}.items():
    sc=bpy.data.scenes[name]
    for frame,label in events:
        if label not in sc.timeline_markers:
            sc.timeline_markers.new(label,frame=frame)
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            space=area.spaces.active
            space.region_3d.view_perspective='CAMERA'
            space.shading.type='MATERIAL'
            space.shading.use_scene_lights=True
            space.shading.use_scene_world=True
bpy.ops.wm.save_as_mainfile(filepath=str(file))
print('Packed Blender file opens on the final logo camera view.')
