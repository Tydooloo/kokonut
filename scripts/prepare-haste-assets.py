"""Copy Haste's current brand assets into the website.

Usage (needs Pillow):
    python scripts/prepare-haste-assets.py ../Haste

Sources, all from the Haste repository:
  assets/brand/aaron-supplied-icon (512x512).png   -> app icon
  docs/screens/ios-*.png                             -> real app screens (synthetic demo data)
"""
import sys
from pathlib import Path

from PIL import Image

haste = Path(sys.argv[1] if len(sys.argv) > 1 else '../Haste').resolve()
site = Path(__file__).resolve().parent.parent
out = site / 'dist' / 'assets' / 'haste'
out.mkdir(parents=True, exist_ok=True)

icon = Image.open(haste / 'assets' / 'brand' / 'aaron-supplied-icon (512x512).png').convert('RGB')
icon.resize((256, 256), Image.LANCZOS).save(out / 'icon.webp', quality=90, method=6)
icon.resize((512, 512), Image.LANCZOS).save(out / 'icon-512.jpg', quality=90, optimize=True)

screens = {'capture': 'ios-1-capture.png', 'journal': 'ios-2-journal.png', 'progress': 'ios-3-progress.png'}
for name, file in screens.items():
    image = Image.open(haste / 'docs' / 'screens' / file).convert('RGB')
    # Phone textures: 660 x 1434 keeps text crisp on a 2x display at the rendered size.
    image.resize((660, 1434), Image.LANCZOS).save(out / f'screen-{name}.webp', quality=84, method=6)


for path in sorted(out.iterdir()):
    print(f'{path.relative_to(site)}  {path.stat().st_size // 1024} KB')
