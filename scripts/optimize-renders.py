"""Convert Blender's transparent PNG renders into lightweight website posters."""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[1]
for name in ['sidequest', 'haste', 'revisen', 'pedal']:
    source = root / 'art' / 'renders' / (name + '.png')
    target = root / 'dist' / 'assets' / '3d' / (name + '.webp')
    Image.open(source).save(target, 'WEBP', quality=87, method=6)
    print(f'{name}: {target.stat().st_size:,} bytes')
