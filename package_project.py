"""Package only the source files required for GitHub's automatic publishing."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parent
FILES = ['build_static.py', 'docx_lessons.py', 'course_packages.py', 'preview_local.py',
         'package_project.py', 'requirements-pages.txt', 'README.md', 'GITHUB_PAGES.md', '.gitignore']
FOLDERS = ['.github', 'lessons', 'static']
TEMPLATES = ['base.html','home.html','labs.html','detail.html','report.html','lab.html','custom_lab.html','kmeans_lab.html']


def package():
    files = [ROOT / file for file in FILES]
    files.extend(ROOT / 'templates' / file for file in TEMPLATES)
    files.extend((ROOT / 'content').glob('lesson-*.json'))
    for folder in FOLDERS:
        files.extend(file for file in (ROOT / folder).rglob('*') if file.is_file()
                     and '__pycache__' not in file.parts and file.suffix != '.pyc')
    destination = ROOT / 'github-project-ready.zip'
    with ZipFile(destination, 'w', ZIP_DEFLATED) as archive:
        for file in sorted(set(files)):
            archive.write(file, file.relative_to(ROOT))
    print(f'Ready: {destination} ({len(set(files))} source files)')
    return destination


if __name__ == '__main__':
    package()
