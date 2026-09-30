"""Run: blender --background --python art/build_scene.py

Four original product sculptures, looped animation, GLB exports and PNG fallbacks.
No external Blender add-ons are required. Screen art is explicitly illustrative.
"""
import bpy
import math
import sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist' / 'assets' / '3d'
OUT.mkdir(parents=True, exist_ok=True)
RENDERS = ROOT / 'art' / 'renders'
RENDERS.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def mat(name, color, metal=0, rough=.35):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    # Input colors are converted from display sRGB to linear values.
    def linear(v):
        return v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4
    rgb = [int(color[i:i+2], 16)/255 for i in (1,3,5)]
    bs.inputs['Base Color'].default_value = (*[linear(v) for v in rgb], 1)
    bs.inputs['Metallic'].default_value = metal
    bs.inputs['Roughness'].default_value = rough
    return m

ink = mat('Graphite ceramic', '#242924', .35, .25)
silver = mat('Brushed aluminium', '#dfe3d9', .88, .24)
ivory = mat('Warm porcelain', '#e7e9da', .18, .28)
lime = mat('SideQuest acid enamel', '#d7f84a', .2, .22)
orange = mat('Haste tangerine enamel', '#ff9657', .2, .25)
lilac = mat('Revisen lavender enamel', '#b9a3ef', .3, .24)
blue = mat('Pedal ultramarine enamel', '#345ee2', .35, .3)
white = mat('Screen printing', '#f5f5eb', .05, .4)

def attach(obj, parent, material):
    obj.parent = parent
    if material:
        obj.data.materials.append(material)
    return obj

def box(name, loc, dims, bevel, material, parent):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mod = o.modifiers.new('Machined edges', 'BEVEL')
    mod.width = bevel
    mod.segments = 5
    o.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    return attach(o, parent, material)

def cylinder(name, loc, radius, depth, material, parent):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=radius, depth=depth, location=loc, rotation=(math.pi/2, 0, 0))
    o = bpy.context.object
    o.name = name
    bevel = o.modifiers.new('Rounded metal', 'BEVEL')
    bevel.width = .035
    bevel.segments = 3
    o.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    for p in o.data.polygons:
        p.use_smooth = True
    return attach(o, parent, material)

def torus(name, loc, major, minor, material, parent, rotation=(math.pi/2,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=80, minor_segments=16, location=loc, rotation=rotation)
    o = bpy.context.object
    o.name = name
    for p in o.data.polygons:
        p.use_smooth = True
    return attach(o, parent, material)

def face(name, texture, loc, width, height, radius, parent):
    verts = []
    for cx, cz, start in [(width/2-radius, height/2-radius, 0), (-width/2+radius,height/2-radius,90), (-width/2+radius,-height/2+radius,180), (width/2-radius,-height/2+radius,270)]:
        for i in range(13):
            a = math.radians(start + i*90/12)
            verts.append((cx+radius*math.cos(a), 0, cz+radius*math.sin(a)))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], [list(range(len(verts)))])
    mesh.uv_layers.new(name='UVMap')
    for poly in mesh.polygons:
        for idx in poly.loop_indices:
            v = mesh.vertices[mesh.loops[idx].vertex_index].co
            mesh.uv_layers.active.data[idx].uv = (v.x/width+.5, v.z/height+.5)
    ob = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(ob)
    ob.location = loc
    m = mat(name+' print', '#ffffff', 0, .55)
    nt = m.node_tree
    tex = nt.nodes.new('ShaderNodeTexImage')
    tex.image = bpy.data.images.load(str(ROOT/'art'/'textures'/texture))
    tex.image.pack()
    nt.links.new(tex.outputs['Color'], nt.nodes.get('Principled BSDF').inputs['Base Color'])
    bs = nt.nodes.get('Principled BSDF')
    nt.links.new(tex.outputs['Color'], bs.inputs['Emission Color'])
    bs.inputs['Emission Strength'].default_value = .15
    bs.inputs['Specular IOR Level'].default_value = .12
    return attach(ob, parent, m)

def root(name):
    ob = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(ob)
    return ob

def phone(name, accent):
    r = root(name)
    box('Aluminium unibody', (0,0,0), (2.30,.30,4.70), .19, silver, r)
    box('Enamel back', (0,.145,0), (2.20,.035,4.59), .17, accent, r)
    box('Black glass surround', (0,-.161,0), (2.24,.04,4.63), .18, ink, r)
    face('Illustrative '+name+' interface', name+'.png', (0,-.187,0), 2.10,4.40,.14,r)
    box('Speaker island', (0,-.198,2.04), (.50,.018,.105), .049, ink, r)
    box('Power key', (1.16,-.005,.52), (.065,.125,.51), .025, silver, r)
    box('Volume key', (-1.16,-.005,.7), (.065,.12,.69), .025, silver, r)
    # A collectible enamel token beside each object gives a physical, studio-made identity.
    if name == 'sidequest':
        tag = box('Adventure tag', (-1.52,-.05,-1.20), (.96,.15,1.12), .14, lime, r)
        tag.rotation_euler[1] = -.32
        torus('Carabiner', (-1.50,0,-.45), .27,.045,silver,r)
        for x in [-1.66,-1.38]:
            bar = box('Plus engraving', (x,-.14,-1.2), (.10,.025,.49), .03, ink,r)
            bar.rotation_euler[1] = -.32
        bar = box('Crossbar', (-1.52,-.147,-1.2), (.63,.025,.10), .03,ink,r)
    elif name == 'haste':
        torus('Tangerine loop', (1.32,.20,-.82), .64,.19,orange,r, (math.pi/2,.36,.2))
        torus('Small steel ring', (-1.37,0,1.4), .25,.055,silver,r)
    else:
        tile = box('Study tile', (1.42,-.02,-1.2), (1.05,.24,1.07), .13,lilac,r)
        tile.rotation_euler[1]=.3
        for z in [-1.08,-1.32]:
            box('Equals inlay', (1.42,-.17,z), (.56,.03,.085), .025,white,r)
        torus('Study loop', (-1.32,.08,1.25), .30,.07,silver,r)
    return r

objects = [phone('sidequest',lime), phone('haste',orange), phone('revisen',lilac)]
r = root('pedal')
box('Cast aluminium stompbox', (0,0,0), (3.12,.78,4.34), .20,blue,r)
box('Base plate', (0,.37,0), (2.98,.08,4.15), .13,ink,r)
face('Concept pedal faceplate', 'pedal.png',(0,-.402,0),2.96,4.15,.13,r)
for x in [-.93,0,.93]:
    cylinder('Knob metal collar',(x,-.435,.99),.33,.08,silver,r)
    cylinder('Knurled control',(x,-.59,.99),.277,.24,ink,r)
    marker=box('Dial indicator',(x,-.72,1.14),(.045,.022,.15),.014,white,r)
    for i in range(20):
        a=i*math.pi/10
        rib=box('Knob grip',(x+math.sin(a)*.267,-.586,.99+math.cos(a)*.267),(.024,.17,.028),.007,ink,r)
cylinder('Footswitch washer',(0,-.448,-1.39),.30,.055,silver,r)
cylinder('Mechanical footswitch',(0,-.56,-1.39),.17,.19,silver,r)
cylinder('LED bezel',(.75,-.436,-1.40),.073,.035,ink,r)
cylinder('LED',(.75,-.46,-1.40),.044,.03,lime,r)
for x in [-1.29,1.29]:
    for z in [-1.84,1.84]:
        cylinder('Faceplate screw',(x,-.429,z),.062,.03,silver,r)
for x in [-1.59,1.59]:
    j = cylinder('Audio jack',(x,0,.30),.15,.15,silver,r)
    j.rotation_euler=(0,math.pi/2,0)
objects.append(r)

scene=bpy.context.scene
scene.frame_start=1
scene.frame_end=145
scene.render.fps=24
for i, r in enumerate(objects):
    for f in [1,37,73,109,145]:
        t=(f-1)/144*math.tau
        r.location=(0,0,.07*math.sin(t))
        r.rotation_euler=(.10+.035*math.sin(t), -.17+.025*math.sin(t+.8), (-.22 if i%2==0 else .18)+.035*math.cos(t))
        r.keyframe_insert(data_path='location',frame=f)
        r.keyframe_insert(data_path='rotation_euler',frame=f)
    r.animation_data.action.name=r.name+' / suspended six-second loop'

scene.frame_set(1)
# Export each model independently, including its animation and packed texture.
for r in objects:
    bpy.ops.object.select_all(action='DESELECT')
    for o in [r]+list(r.children_recursive):
        o.select_set(True)
    bpy.context.view_layer.objects.active=r
    bpy.ops.export_scene.gltf(filepath=str(OUT/(r.name+'.glb')),export_format='GLB',use_selection=True,export_animations=True,export_apply=True,export_frame_range=True)

def area(name, location, energy, size, color):
    data=bpy.data.lights.new(name,'AREA')
    data.energy=energy
    data.shape='DISK'
    data.size=size
    data.color=color
    ob=bpy.data.objects.new(name,data)
    bpy.context.collection.objects.link(ob)
    ob.location=location
    ob.rotation_euler=(Vector((0,0,0))-ob.location).to_track_quat('-Z','Y').to_euler()

area('Large softbox',(-4,-6,7),900,6,(1,.96,.88))
area('Cool fill',(5,-2,3),700,5,(.88,.93,1))
area('Edge strip',(0,4,4),1000,4,(1,1,1))
scene.world.color=(.35,.35,.35)
bpy.ops.object.camera_add(location=(0,-13,.25))
camera=bpy.context.object
camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO'
camera.data.ortho_scale=6.25
scene.camera=camera
scene.render.engine='CYCLES'
scene.cycles.samples=24
scene.cycles.use_denoising=True
scene.render.resolution_x=940
scene.render.resolution_y=1000
scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.view_settings.view_transform='AgX'
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGBA'
for r in objects:
    for other in objects:
        for ob in other.children_recursive:
            ob.hide_render = other != r
    scene.render.filepath=str(RENDERS/(r.name+'.png'))
    bpy.ops.render.render(write_still=True)

# Save an editable, sensibly arranged source scene for handoff.
for i,r in enumerate(objects):
    r.animation_data_clear()
    for f in [1,37,73,109,145]:
        t=(f-1)/144*math.tau
        r.location=((i-1.5)*5.5,0,.07*math.sin(t))
        r.rotation_euler=(.10+.035*math.sin(t),-.17+.025*math.sin(t+.8),(-.22 if i%2==0 else .18)+.035*math.cos(t))
        r.keyframe_insert(data_path='location',frame=f)
        r.keyframe_insert(data_path='rotation_euler',frame=f)
    r.animation_data.action.name=r.name+' / collection layout loop'
    for ob in r.children_recursive:
        ob.hide_render=False
scene.frame_set(1)
camera.location=(0,-25,7)
camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.ortho_scale=25
scene.render.resolution_x=1920
scene.render.resolution_y=700
# Both the exported solo loops and the arranged collection loops remain editable.
for action in bpy.data.actions:
    action.use_fake_user=True
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art'/'kokonut-collection.blend'))
print('Kokonut: exported four animated GLBs, four PNG fallbacks, and the editable Blender scene.')
