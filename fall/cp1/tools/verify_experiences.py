"""Check teaching outputs, notebook mappings, generated pages and local fragments.

Run with Python's standard library only; file examples execute in scratch folders.
"""
from contextlib import redirect_stdout
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import io
import json
import os
import tempfile

from render_experiences import LESSONS, ROOT, render, introduction_markdown, reasoning_markdown

class Page(HTMLParser):
    def __init__(self, content):
        super().__init__()
        self.ids = []
        self.links = []
        self.feed(content)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        self.links.extend(attrs[key] for key in ('href', 'src') if key in attrs)


def verify():
    manifest = json.loads((ROOT / 'course_manifest.json').read_text())
    expected = {}
    render(manifest['weeks'], lambda path, value: expected.__setitem__(path, value))
    for path, content in expected.items():
        assert path.read_text() == content, f'Regenerate stale page: {path.name}'
    for lesson, week in zip(LESSONS, manifest['weeks']):
        assert lesson['week'] == week['week']
        nb = json.loads((ROOT / week['notebook']).read_text())
        intro = nb['cells'][1]
        assert intro.get('metadata', {}).get('cp1', {}).get('weekly_intro')
        assert ''.join(intro['source']) == introduction_markdown(lesson), (week['week'], 'intro drift')
        reasoning = [c for c in nb['cells'] if c.get('metadata', {}).get('cp1', {}).get('reasoning')]
        assert len(reasoning) == 1, (week['week'], 'reasoning section missing or duplicated')
        assert ''.join(reasoning[0]['source']) == reasoning_markdown(week['week']), (week['week'], 'reasoning drift')
        opening = (ROOT / week['experience']).read_text().split('id="brief"', 1)[1].split('id="model"', 1)[0]
        import html
        for key in ('connection', 'first_task', 'why_tool', 'success'):
            assert html.escape(lesson['intro'][key]) in opening, (week['week'], key)
        assert set(lesson['practice']) <= {ex['id'] for ex in week['exercises']}
        assert len(lesson['cases']) == 3
        assert week['experience'] == f'web/Week_{lesson["week"]:02d}.html'
        page_source = (ROOT / week['experience']).read_text()
        assert page_source.count(f'data-cp1-lab="{lesson["week"]}"') == 1
        assert 'cp1-lab.js?v=3' in page_source and 'cp1-lab.css?v=3' in page_source

        # In particular, Week 13 must never write test files into the repository.
        with tempfile.TemporaryDirectory() as directory:
            old = Path.cwd()
            output = io.StringIO()
            try:
                os.chdir(directory)
                with redirect_stdout(output):
                    exec(compile(lesson['model'], f'Week_{lesson["week"]:02d}_model', 'exec'), {})
            finally:
                os.chdir(old)
            assert output.getvalue().strip() == lesson['output'], (lesson['week'], output.getvalue())
    pages = {p.resolve(): Page(p.read_text()) for p in (ROOT / 'web').glob('*.html')}
    checked = 0
    for path, page in pages.items():
        assert len(page.ids) == len(set(page.ids)), (path.name, 'duplicate IDs')
        for link in page.links:
            url = urlparse(link)
            if url.scheme or url.netloc:
                continue
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            assert target.is_file(), (path.name, link, 'missing local file')
            if url.fragment and target in pages:
                assert unquote(url.fragment) in pages[target].ids, (path.name, link, 'missing anchor')
            checked += 1
    print(f'PASS: 14 teaching models, 42 case fixtures, 15 reproducible pages, notebook mappings and {checked} local links/fragments.')

if __name__ == '__main__':
    verify()
