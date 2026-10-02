# 中文说明：历史续渲队列，仅顺序生成 B、C。首次完整制作仍需先单独渲染 A；不用于浏览器平面转场。
# 完整命令与适用场景：docs/动画目录.md
"""Render the remaining studios sequentially in one native Blender process."""
import runpy, sys
from pathlib import Path
script=Path(__file__).resolve().with_name('blender-hero.py')
for variant in ['B', 'C']:
    sys.argv=[str(script), '--', '--variant', variant]
    runpy.run_path(str(script), run_name='__main__')
