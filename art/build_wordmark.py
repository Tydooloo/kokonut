"""Build the original extruded Kokonut wordmark for the live orbital scene."""
import bpy
import math
from pathlib import Path
from mathutils import Vector

root = Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, hex, metallic, roughness):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    rgb = [int(hex[i:i+2],16)/255 for i in (0,2,4)]
    linear = lambda c: c/12.92 if c <= .04045 else ((c+.055)/1.055)**2.4
    p.inputs['Base Color'].default_value = (*[linear(c) for c in rgb],1)
    p.inputs['Metallic'].default_value = metallic
    p.inputs['Roughness'].default_value = roughness
    return m

front = material('Electric peel / face', 'D1FF31', .18, .3)
side = material('Deep olive / extrusion', '566B20', .28, .32)
bpy.ops.object.text_add()
word = bpy.context.object
word.name = 'Kokonut / extruded DM Sans'
word.data.body = 'Kokonut'
word.data.font = bpy.data.fonts.load(str(root/'art/fonts/dm-sans-wordmark.ttf'))
word.data.align_x = 'CENTER'
word.data.align_y = 'CENTER'
word.data.extrude = .23
word.data.bevel_depth = .022
word.data.bevel_resolution = 3
word.data.resolution_u = 10
word.rotation_euler.x = math.pi/2
bpy.ops.object.convert(target='MESH')
word.data.materials.append(side)
word.data.materials.append(front)
for face in word.data.polygons:
    face.material_index = 1 if face.normal.z > .7 else 0
scale = 7.6 / word.dimensions.x
word.scale = (scale,scale,scale)
bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
center = sum((Vector(v) for v in word.bound_box),Vector())/8
for vertex in word.data.vertices:
    vertex.co -= center
word.location = (0,0,0)
bpy.ops.export_scene.gltf(filepath=str(root/'dist/assets/3d/kokonut.glb'),export_format='GLB',use_selection=True,export_apply=True)

scene = bpy.context.scene
for name,loc,power,size in [('Softbox',(-4,-5,6),800,5),('Rim',(5,1,4),1000,4)]:
    lamp = bpy.data.lights.new(name,'AREA')
    lamp.energy = power
    lamp.shape = 'DISK'
    lamp.size = size
    ob = bpy.data.objects.new(name,lamp)
    bpy.context.collection.objects.link(ob)
    ob.location=loc
    ob.rotation_euler=(Vector((0,0,0))-ob.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(0,-12,1))
camera = bpy.context.object
camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO'
camera.data.ortho_scale=8
scene.camera=camera
scene.world.color=(.4,.4,.4)
scene.render.engine='CYCLES'
scene.cycles.samples=24
scene.render.film_transparent=True
scene.render.resolution_x=1500
scene.render.resolution_y=500
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGBA'
scene.render.filepath=str(root/'art/renders/kokonut.png')
scene.view_settings.view_transform='AgX'
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(root/'art/kokonut-wordmark.blend'))
print('Exported original Kokonut wordmark GLB, render and editable Blender file.')
