"""Compare browser screenshots with PowerPoint's independent 4K reference."""
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageStat

root = Path(__file__).resolve().parents[1]
out = root / 'artifacts/presentation'
reference = Image.open(root / '.reference/ppt-original.png').convert('RGB')
browser = Image.open(out / 'stage-1-3840.png').convert('RGB')
assert reference.size == browser.size == (3840, 2160)
right = (1920, 0, 3840, 2160)
expected, actual = reference.crop(right), browser.crop(right)
delta = ImageChops.difference(expected, actual)
mean = sum(ImageStat.Stat(delta).mean) / 3
max_channel = ImageChops.lighter(ImageChops.lighter(*delta.split()[:2]), delta.split()[2])
histogram = max_channel.histogram()
within_16 = sum(histogram[:17]) / (1920 * 2160)
stage_ids = [1, 2, 4, 5, 6, 7, 8, 9, 10, 21, 22, 23, 24]
stages = [Image.open(out / f'stage-{stage}.png').convert('RGB').crop((960, 0, 1920, 1080)) for stage in stage_ids]
identical = all(ImageChops.difference(stages[0], stage).getbbox() is None for stage in stages[1:])
report = {
    'reference': 'PowerPoint 3840 x 2160 PNG export of the supplied PPTX',
    'region': 'right half, including title, network diagram, benefits and navigation',
    'meanAbsoluteChannelDifferenceOutOf255': round(mean, 4),
    'pixelsWithin16LevelsPercent': round(within_16 * 100, 3),
    'rightSideIdenticalAcrossStages': identical,
    'validatedStages': stage_ids,
    'note': 'Vector text uses browser antialiasing; slight edge differences from PowerPoint are expected.'
}
(out / 'visual-report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
# Requested side-by-side screenshot comparison: PowerPoint left, browser right.
comparison = Image.new('RGB', (1920, 960))
comparison.paste(expected.crop((0, 240, 1920, 2160)).resize((960, 960), Image.Resampling.LANCZOS), (0, 0))
comparison.paste(actual.crop((0, 240, 1920, 2160)).resize((960, 960), Image.Resampling.LANCZOS), (960, 0))
comparison.save(out / 'right-comparison.png')
delta.save(out / 'right-difference-4k.png')
print(json.dumps(report, indent=2))
assert identical, 'The right-hand artwork must never change with stage'
assert mean < 2 and within_16 > 0.97, 'Visual mismatch with the supplied PPT'
