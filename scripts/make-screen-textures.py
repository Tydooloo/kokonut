"""Create the explicitly illustrative UI textures used by the Blender product models."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'art' / 'textures'
OUT.mkdir(parents=True, exist_ok=True)
W, H = 720, 1450
INK = '#20251e'

def font(size, bold=False):
    return ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf', size)

def text(draw, xy, value, size=28, fill=INK, bold=False, spacing=10):
    draw.multiline_text(xy, value, font=font(size, bold), fill=fill, spacing=spacing)

def base(name, color):
    im = Image.new('RGB', (W, H), '#f8f8f1')
    d = ImageDraw.Draw(im)
    text(d, (44, 40), '9:41', 25, bold=True)
    d.rounded_rectangle((588, 43, 642, 64), 5, fill=INK)
    d.rectangle((647, 49, 651, 58), fill=INK)
    text(d, (42, 125), name, 33, bold=True)
    d.ellipse((616, 122, 671, 177), fill=color)
    text(d, (636, 131), '+', 29)
    d.line((42, 215, 678, 215), fill='#d5d8ce', width=2)
    return im, d

def bottom(d, active):
    d.line((40, 1302, 680, 1302), fill='#d5d8ce', width=2)
    for i, name in enumerate(['Today', 'Explore', 'Saved']):
        x = 75 + i * 220
        d.ellipse((x+18, 1330, x+38, 1350), fill=INK if i == active else '#b5b9ac')
        text(d, (x, 1370), name, 23, fill=INK if i == active else '#71776d', bold=i == active)

im, d = base('SideQuest', '#dcf55a')
text(d, (43, 260), 'LESS GROUP CHAT.', 20, fill='#69735d', bold=True)
text(d, (40, 305), 'More out\nthere.', 91, bold=True, spacing=0)
photo = ImageOps.fit(Image.open(ROOT / 'dist/assets/camp.jpg').convert('RGB'), (630, 400))
mask = Image.new('L', photo.size, 0)
ImageDraw.Draw(mask).rounded_rectangle((0, 0, 630, 400), 25, fill=255)
im.paste(photo, (45, 540), mask)
d = ImageDraw.Draw(im)
d.rounded_rectangle((67, 562, 311, 605), 21, fill='#dcf55a')
text(d, (85, 572), 'YOUR NEXT ADVENTURE', 17, bold=True)
text(d, (46, 980), 'A night under the stars', 38, bold=True)
text(d, (46, 1037), 'Your people. A little fresh air.', 26, fill='#69735d')
for i, (a, c) in enumerate([('A', '#dcf55a'), ('J', '#e7af85'), ('M', '#c6c1ec')]):
    x = 45 + i * 52
    d.ellipse((x, 1103, x+60, 1163), fill=c, outline='#f8f8f1', width=4)
    text(d, (x+21, 1121), a, 23, bold=True)
text(d, (222, 1120), 'Make a plan together', 25)
d.rounded_rectangle((45, 1200, 675, 1265), 30, fill=INK)
text(d, (246, 1219), 'Find your next thing', 24, fill='#f8f8f1', bold=True)
bottom(d, 1)
im.save(OUT / 'sidequest.png', optimize=True)

im, d = base('Haste', '#ffab76')
text(d, (43, 260), 'A LITTLE LESS FOOD ADMIN', 20, fill='#797368', bold=True)
text(d, (40, 306), 'Eat. Log.\nGet on with it.', 76, bold=True, spacing=5)
d.rounded_rectangle((44, 535, 676, 812), 28, fill='#f9ab76')
text(d, (77, 574), 'YOUR JOURNAL', 20, bold=True)
text(d, (77, 626), 'Room for real life.', 42, bold=True)
text(d, (77, 701), 'A photo, a few words,\nor the details you already know.', 27)
text(d, (45, 860), 'Today', 34, bold=True)
for y, title, desc, c in [(925, 'Breakfast', 'Yoghurt, berries & granola', '#ecc8e5'), (1055, 'Lunch', 'Chicken, rice & the good sauce', '#e0e8a2')]:
    d.rounded_rectangle((44, y, 137, y+93), 19, fill=c)
    d.ellipse((65, y+21, 116, y+72), outline=INK, width=3)
    text(d, (165, y+5), title, 29, bold=True)
    text(d, (165, y+47), desc, 23, fill='#797368')
d.rounded_rectangle((45, 1200, 675, 1265), 30, fill=INK)
text(d, (268, 1219), '+  Log a meal', 24, fill='#f8f8f1', bold=True)
bottom(d, 0)
im.save(OUT / 'haste.png', optimize=True)

im, d = base('Revisen', '#cbbcef')
text(d, (43, 260), 'ONE QUESTION AT A TIME', 20, fill='#716c80', bold=True)
text(d, (40, 309), 'Oh. Now\nI get it.', 87, bold=True, spacing=0)
d.rounded_rectangle((44, 535, 676, 894), 28, fill='#d3c6f0')
text(d, (78, 574), 'PICK UP WHERE YOU LEFT OFF', 20, bold=True)
text(d, (78, 636), 'The chain rule', 46, bold=True)
text(d, (82, 719), 'y = (3x + 2)²', 61)
text(d, (78, 824), 'Back to the bit that matters.', 26)
for y, n, title, desc in [(955, '01', 'Keep the question', 'Your working, in one place.'), (1080, '02', 'Connect the dots', 'Link it back to your course.')]:
    text(d, (46, y), n, 22, fill='#716c80')
    text(d, (118, y-5), title, 30, bold=True)
    text(d, (118, y+38), desc, 24, fill='#716c80')
d.rounded_rectangle((45, 1200, 675, 1265), 30, fill=INK)
text(d, (234, 1219), 'Keep practising', 24, fill='#f8f8f1', bold=True)
bottom(d, 0)
im.save(OUT / 'revisen.png', optimize=True)

# A concept faceplate, deliberately unnamed until the pedal's identity is supplied.
im = Image.new('RGB', (900, 1200), '#3059d9')
d = ImageDraw.Draw(im)
text(d, (55, 55), 'KOKONUT / AUDIO', 28, '#f4f4eb', True)
d.rounded_rectangle((57, 535, 843, 730), 18, fill='#16251f')
text(d, (91, 565), 'LIVE SET  /  01', 25, '#d7f84a', True)
text(d, (91, 619), 'YOUR PLUG-INS. ON STAGE.', 33, '#f4f4eb', True)
text(d, (55, 772), 'VST HOST', 85, '#f4f4eb', True, 0)
text(d, (58, 1140), 'KOKONUT  /  HARDWARE CONCEPT', 25, '#d1dcff', True)
for x, t in [(92, 'DRIVE'), (388, 'TONE'), (681, 'LEVEL')]:
    text(d, (x, 455), t, 28, '#e2e8ff', True)
im.save(OUT / 'pedal.png', optimize=True)
print('Created four original illustrative textures in art/textures.')
