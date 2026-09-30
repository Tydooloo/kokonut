"""Create a Blender-readable instance of the site's OFL-licensed variable font."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root = Path(__file__).resolve().parents[1]
font = TTFont(root / 'dist/assets/fonts/dm-sans-latin.woff2')
if 'fvar' in font:
    font = instantiateVariableFont(font, {'wght': 850}, inplace=True)
font.flavor = None
target = root / 'art/fonts'
target.mkdir(parents=True, exist_ok=True)
font.save(target / 'dm-sans-wordmark.ttf')
print('Prepared the licensed DM Sans wordmark font.')
