"""Resolve static fragments and the card lessons' explicit example routes."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re


class _Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids, self.scripts = set(), []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.add(attrs['id'])
        if tag == 'script' and 'src' in attrs:
            self.scripts.append(attrs['src'])


def fragment_exists(path, fragment):
    """A virtual example must name an ID in the page's own JSON card bank."""
    path = Path(path)
    page = _Page(path.read_text(encoding='utf-8'))
    fragment = unquote(fragment)
    if fragment in page.ids:
        return True
    match = re.fullmatch(r'(?:example|ornek)-(\d+)', fragment)
    if not match:
        return False
    for source in page.scripts:
        url = urlsplit(source)
        if url.scheme or url.netloc or Path(url.path).name != 'cards.js':
            continue
        text = (path.parent / unquote(url.path)).read_text(encoding='utf-8')
        declaration = re.search(r'\bconst\s+cards\s*=\s*', text)
        if declaration:
            cards, _ = json.JSONDecoder().raw_decode(text[declaration.end():])
            if any(card.get('id') == int(match[1]) for card in cards):
                return True
    return False
