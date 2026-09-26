"""One lesson folder supplies a content page and a separate interactive page."""
import json
import re
from datetime import date
from html import escape
import bleach
import markdown
from docx_lessons import read_report


def read_package(folder):
    match = re.match(r'^(\d{3})-.+', folder.name)
    if not match:
        raise ValueError(f'{folder.name}: 資料夾名稱需使用 002-topic 格式')
    week = int(match[1])
    data = json.loads((folder / 'lesson.json').read_text(encoding='utf-8-sig'))
    if data.get('published', True) is False:
        return None
    title, day = data['title'].strip(), data['date']
    date.fromisoformat(day)
    if not title:
        raise ValueError(f'{folder.name}: title 不可空白')
    kind = data.get('interactive', 'custom')
    if kind not in ('custom', 'kmeans'):
        raise ValueError(f'{folder.name}: interactive 請使用 custom 或 kmeans')
    assets = {}
    report = folder / 'report.docx'
    content = folder / 'content.md'
    if content.exists() and report.exists():
        raise ValueError(f'{folder.name}: content.md 與 report.docx 請擇一，避免內容來源不明')
    if report.exists():
        article = read_report(report, week=week, day=day)
        body = article['body_html']
        assets.update(article['assets'])
    elif content.exists():
        body = markdown.markdown(content.read_text(encoding='utf-8-sig'), extensions=['fenced_code', 'tables'])
        body = bleach.clean(body, tags=['p','br','h1','h2','h3','h4','h5','h6','pre','code','strong','em','ul','ol','li','blockquote','a','img','table','thead','tbody','tr','th','td','hr'],
                            attributes={'a':['href','title'], 'img':['src','alt','title'], 'code':['class']},
                            protocols=['http','https','mailto'], strip=True)
        for file in (folder / 'assets').rglob('*') if (folder / 'assets').exists() else []:
            if file.is_file() and file.suffix.lower() in ('.png','.jpg','.jpeg','.gif','.webp'):
                name = f'static/reports/{week}/assets/{file.relative_to(folder / "assets").as_posix()}'
                assets[name] = file.read_bytes()
        body = body.replace('src="assets/', f'src="/static/reports/{week}/assets/')
        body = body.replace('<table>', '<div class="report-table"><table>').replace('</table>', '</table></div>')
    else:
        raise ValueError(f'{folder.name}: 缺少 content.md 或 report.docx')
    if kind == 'custom':
        experiment = folder / 'interactive.html'
        if not experiment.exists():
            raise ValueError(f'{folder.name}: 缺少 interactive.html，無法產生互動頁')
        assets[f'static/experiments/{week}/index.html'] = experiment.read_bytes()

    def code(filename):
        path = folder / filename
        return path.read_text(encoding='utf-8-sig') if path.exists() else ''

    return dict(id=week, week=week, lesson_date=day, title=title, published=True,
                summary=data.get('summary', ''), author=data.get('author', ''),
                class_name=data.get('class_name', ''), body_html=body, assets=assets,
                source='report.docx' if report.exists() else 'content.md',
                matlab_code=code('matlab.m'), python_code=code('python.py'),
                interactive=kind, reflection='', experiment_title=data.get('experiment_title', title+'互動實驗室'))
