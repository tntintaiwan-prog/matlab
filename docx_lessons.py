"""Read Word reports as content, never as executable instructions."""
import re
from datetime import date
from html import escape
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
      'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
W = '{' + NS['w'] + '}'
R = '{' + NS['r'] + '}'
PATTERN = re.compile(r'^(\d{3})-(\d{4}-\d{2}-\d{2})-(.+)\.docx$', re.I)


def read_report(path, *, week=None, day=None):
    match = PATTERN.fullmatch(path.name)
    if week is None and not match:
        raise ValueError(f'{path.name}: 請使用 002-2026-09-30-課程名稱.docx 格式')
    if week is None:
        week, day = int(match[1]), match[2]
    fallback = match[3] if match else path.stem
    if not 1 <= week <= 999:
        raise ValueError(f'{path.name}: 課次必須在 001 到 999 之間')
    date.fromisoformat(day)
    assets = {}
    with ZipFile(path) as archive:
        if sum(info.file_size for info in archive.infolist()) > 100_000_000:
            raise ValueError(f'{path.name}: 解壓後超過 100 MB，請壓縮文件圖片')
        document = ET.fromstring(archive.read('word/document.xml'))
        rels = {}
        if 'word/_rels/document.xml.rels' in archive.namelist():
            rels = {r.get('Id'): (r.get('Target', ''), r.get('TargetMode', ''))
                    for r in ET.fromstring(archive.read('word/_rels/document.xml.rels'))}

        def text(element):
            return ''.join(t.text or '' for t in element.iter(W + 't'))

        def inline(element):
            tag = element.tag
            if tag == W + 't':
                return escape(element.text or '')
            if tag in (W + 'br', W + 'cr'):
                return '<br>'
            if tag == W + 'tab':
                return '    '
            if tag == '{' + NS['a'] + '}blip':
                target, mode = rels.get(element.get(R + 'embed'), ('', ''))
                if mode == 'External' or not target:
                    return ''
                member = str(Path('word', target)).replace('\\', '/')
                suffix = Path(target).suffix.lower()
                if suffix not in ('.png', '.jpg', '.jpeg', '.gif', '.webp'):
                    return '<span>（此圖片格式未提供網頁預覽）</span>'
                filename = f'static/reports/{week}/image-{len(assets) + 1}{suffix}'
                assets[filename] = archive.read(member)
                return f'<img src="/{filename}" alt="課程文件中的圖片" loading="lazy">'
            if tag == W + 'hyperlink':
                target, _ = rels.get(element.get(R + 'id'), ('', ''))
                body = ''.join(inline(child) for child in element)
                if target.startswith(('https://', 'http://')):
                    return f'<a href="{escape(target, quote=True)}" target="_blank" rel="noopener noreferrer">{body}</a>'
                return body
            if tag in (W + 'pPr', W + 'rPr', W + 'del'):
                return ''
            body = ''.join(inline(child) for child in element)
            if tag == W + 'r':
                if element.find('w:rPr/w:b', NS) is not None:
                    body = f'<strong>{body}</strong>'
                if element.find('w:rPr/w:i', NS) is not None:
                    body = f'<em>{body}</em>'
            return body

        def paragraph(element):
            raw = text(element).strip()
            body = inline(element)
            if not body:
                return ''
            style = element.find('w:pPr/w:pStyle', NS)
            style_name = style.get(W + 'val', '') if style is not None else ''
            if re.match(r'Heading[1-6]$', style_name, re.I) or re.match(r'^[一二三四五六七八九十]+[、．]', raw):
                return f'<h2>{body}</h2>'
            return f'<p>{body}</p>'

        elements = list(document.find('w:body', NS))
        title_element = next((el for el in elements if el.tag == W + 'p' and text(el).strip()), None)
        title = text(title_element).strip() if title_element is not None else fallback
        blocks, code = [], []

        def flush():
            if code:
                blocks.append('<pre><code>' + escape('\n'.join(code)) + '</code></pre>')
                code.clear()

        for element in elements:
            if element is title_element:
                # Keep any images attached to the title paragraph.
                for image in element.findall('.//a:blip', NS):
                    blocks.append(inline(image))
                continue
            if element.tag == W + 'p':
                raw = text(element)
                fonts = [font.get(W + 'ascii', '') for font in element.findall('.//w:rFonts', NS)]
                code_like = (any(f.lower() in ('consolas', 'courier new') for f in fonts)
                             or re.match(r'^\s*(?:clc\s*;|clear\s*;|close all|hold (?:on|off)|(?:figure|plot|title|legend|xlabel|ylabel|grid|print)\s*\(|(?:import|from|def|for|if|return)\s|[%#]|(?:\w+|\[[\w, ]+\])\s*=)', raw))
                if raw.strip() and code_like and not element.findall('.//a:blip', NS):
                    code.append(raw)
                else:
                    flush()
                    blocks.append(paragraph(element))
            elif element.tag == W + 'tbl':
                flush()
                rows = []
                for row in element.findall('w:tr', NS):
                    cells = []
                    for cell in row.findall('w:tc', NS):
                        span = cell.find('w:tcPr/w:gridSpan', NS)
                        colspan = int(span.get(W + 'val', '1')) if span is not None else 1
                        body = ''.join(paragraph(p) for p in cell.findall('w:p', NS))
                        cells.append(f'<td colspan="{colspan}">{body}</td>')
                    rows.append('<tr>' + ''.join(cells) + '</tr>')
                blocks.append('<div class="report-table"><table><tbody>' + ''.join(rows) + '</tbody></table></div>')
        flush()
    return dict(id=week, week=week, lesson_date=day, title=title, published=True,
                summary=f'{day} 的學習成果，收錄課程筆記、實作內容與文件圖表。',
                source=path.name, body_html='\n'.join(blocks), assets=assets,
                author='', class_name='', matlab_code='', python_code='', reflection='')
