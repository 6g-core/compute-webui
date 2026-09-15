"""Build web artwork from native PowerPoint exports without redrawing the slide.

Run export-ppt.ps1 first. PowerPoint renders its own graphical effects to a
lossless 4K plate. Its PDF supplies exact vector glyph outlines, avoiding
font substitution on other PCs. Nothing is manually redrawn or repositioned.
"""
from __future__ import annotations

import base64
import copy
import json
import shutil
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

import pymupdf
from PIL import Image

PROJECT = Path(__file__).resolve().parents[1]
REFERENCE = PROJECT / '.reference'
OUTPUT = PROJECT / 'public/assets/ppt'
SVG = 'http://www.w3.org/2000/svg'
XLINK = 'http://www.w3.org/1999/xlink'
ET.register_namespace('', SVG)
ET.register_namespace('xlink', XLINK)


def data_uri(data: bytes) -> str:
    return 'data:image/png;base64,' + base64.b64encode(data).decode('ascii')


def build() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    source = next(PROJECT.parent.glob('*.pptx'))
    # Mirror only the original background, never the slide's text or diagrams.
    # Repeating this tile continues either edge without letterbox seams.
    with zipfile.ZipFile(source) as deck:
        background = deck.read('ppt/media/image1.png')
    tile = ET.Element(f'{{{SVG}}}svg', {'viewBox': '0 0 3840 2160', 'width': '3840', 'height': '2160'})
    tile_defs = ET.SubElement(tile, f'{{{SVG}}}defs')
    ET.SubElement(tile_defs, f'{{{SVG}}}image', {
        'id': 'background', 'width': '1920', 'height': '1080',
        f'{{{XLINK}}}href': data_uri(background)
    })
    for transform in ['', 'translate(3840 0) scale(-1 1)', 'translate(0 2160) scale(1 -1)', 'translate(3840 2160) scale(-1 -1)']:
        ET.SubElement(tile, f'{{{SVG}}}use', {f'{{{XLINK}}}href': '#background', 'transform': transform})
    ET.ElementTree(tile).write(OUTPUT / 'background-tile.svg', encoding='utf-8', xml_declaration=True)
    native = ET.Element(f'{{{SVG}}}svg', {
        'viewBox': '0 0 960 540', 'width': '1920', 'height': '1080', 'role': 'img'
    })
    ET.SubElement(native, f'{{{SVG}}}image', {
        'x': '0', 'y': '0', 'width': '960', 'height': '540',
        'preserveAspectRatio': 'none', f'{{{XLINK}}}href': data_uri((REFERENCE / 'ppt-artwork.png').read_bytes())
    })

    page = pymupdf.open(REFERENCE / 'ppt-template.pdf')[0]
    pdf_svg = ET.fromstring(page.get_svg_image(text_as_path=True))
    definitions = ET.SubElement(native, f'{{{SVG}}}defs')
    glyphs = ET.SubElement(native, f'{{{SVG}}}g')
    for element in pdf_svg.iter():
        if element.get('id', '').startswith('font_'):
            definitions.append(copy.deepcopy(element))
        if 'data-text' in element.attrib:
            glyphs.append(copy.deepcopy(element))

    ET.ElementTree(native).write(OUTPUT / 'presentation.svg', encoding='utf-8', xml_declaration=True)
    shutil.copy2(PROJECT.parent / 'image001.png', OUTPUT / 'image001.png')
    # Keep the reviewed clean background checked in. Labels are rendered as
    # SVG text in React; rebuilding PPT assets must not restore raster labels.
    stage1_image = 'image001-background.png'
    with Image.open(OUTPUT / stage1_image) as edited_image:
        stage1_resolution = list(edited_image.size)
    manifest = {
        'source': source.name, 'slide': 1, 'canvas': {'width': 1920, 'height': 1080},
        'text': 'PowerPoint PDF vector glyph outlines',
        'graphics': 'Lossless 3840 x 2160 PowerPoint rendering with original graphical effects',
        'backgroundResolution': [3840, 2160], 'backgroundExtension': 'Original PPT background, mirrored at its edges',
        'stage1ImageResolution': stage1_resolution,
        'stage1Image': stage1_image,
        'stage1ImageEdit': {'source': 'image001-acn.png', 'change': 'Remove raster labels for browser-rendered vector text', 'metadata': 'image001-background.edit.json'},
        'stage1Text': 'Inline SVG text in PptPresentation.jsx, aligned to a 1556 x 1011 viewBox',
        'removedPlaceholderShapeId': 75,
        'baseBranch': 'fix/qos-reset-clears-dialog-cache',
        'stages': [1, 2, 4, 5, 6, 7, 8, 9, 10, 21, 22, 23, 24]
    }
    (OUTPUT / 'source.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Built {OUTPUT / "presentation.svg"}')


if __name__ == '__main__':
    build()
