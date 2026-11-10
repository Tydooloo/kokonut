"""Copy Haste's current brand assets into the website.

Usage (needs Pillow, fontTools and brotli):
    python scripts/prepare-haste-assets.py ../Haste

Sources, all from the Haste repository:
  assets/brand/aaron-supplied-icon (512x512).png   -> app icon
  docs/screens/ios-*.png                             -> real app screens (synthetic demo data)
  assets/fonts/BricolageGrotesque.ttf                -> display typeface (SIL OFL)
"""
import shutil
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
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

fonts = site / 'dist' / 'assets' / 'fonts'
options = subset.Options()
options.flavor = 'woff2'
options.layout_features = ['*']
options.name_IDs = ['*']
subsetter = subset.Subsetter(options)
font = TTFont(haste / 'assets' / 'fonts' / 'BricolageGrotesque.ttf', lazy=False)
# Keep the weight axis only: display headings use the default width and optical size.
instancer.instantiateVariableFont(font, {'wdth': 100, 'opsz': 96, 'wght': (300, 800)}, inplace=True)
subsetter.populate(unicodes=list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x2190, 0x2192, 0x2197, 0x2193, 0x00B7])
subsetter.subset(font)
subset.save_font(font, str(fonts / 'bricolage-latin.woff2'), options)
shutil.copyfile(haste / 'assets' / 'fonts' / 'BricolageGrotesque-OFL.txt', site / 'docs' / 'licenses' / 'bricolage-grotesque-OFL.txt')

for path in sorted(out.iterdir()) + [fonts / 'bricolage-latin.woff2']:
    print(f'{path.relative_to(site)}  {path.stat().st_size // 1024} KB')
