"""One student route per week; retain all source teaching and reference sections."""
from html.parser import HTMLParser
from pathlib import PurePosixPath
import html
import re


def sections(source):
    class Splitter(HTMLParser):
        def __init__(self):
            super().__init__(convert_charrefs=False)
            self.depth = 0
            self.start = 0
            self.spans = []
            self.offsets = [0]
            for line in source.splitlines(keepends=True):
                self.offsets.append(self.offsets[-1] + len(line))
        def pos(self):
            line, col = self.getpos()
            return self.offsets[line - 1] + col
        def handle_starttag(self, tag, attrs):
            if tag == 'section':
                if self.depth == 0: self.start = self.pos()
                self.depth += 1
        def handle_endtag(self, tag):
            if tag == 'section':
                self.depth -= 1
                if self.depth == 0: self.spans.append((self.start, self.pos() + len('</section>')))
    parser = Splitter(); parser.feed(source)
    return [source[a:b] for a,b in parser.spans]


def heading(block):
    match = re.search(r'<h2[^>]*>(.*?)</h2>', block, re.S)
    if not match: return ''
    return html.unescape(re.sub('<[^>]*>', '', re.sub(r'<span class="num">.*?</span>', '', match[1]))).strip()


def inline_guide(num):
    import build_guide as G
    spec = next(spec for spec in G.guide_page_specs() if spec.key == f'w{num:02d}')
    markdown = G._strip_first_h1(G._page_source(spec))
    markdown = re.sub(r'^\[Original lesson\].*$', '', markdown, flags=re.M)
    records = G._heading_records(markdown)
    content = G.Renderer(PurePosixPath(f'w{num}/index.html'), {r[2] for r in records}, G._anchor_routes(G.guide_page_specs())).render(markdown)
    # Isolate embedded guide anchors from existing lesson and widget IDs.
    ids = re.findall(r'\bid="([^"]+)"', content)
    for ident in ids:
        content = content.replace(f'id="{ident}"', f'id="help-{ident}"').replace(f'href="#{ident}"', f'href="#help-{ident}"')
    return '<details class="path-reference" id="extra-explanation"><summary>Need a slower explanation? English + Türkçe</summary><div class="inline-guide">' + content + '</div></details>'


def meaning_section(num):
    """One authored explanation feeds both the weekly lesson and detailed guide."""
    import build_guide as G
    markdown = G.meaning_source(num).read_text(encoding='utf-8')
    records = G._heading_records(markdown)
    content = G.Renderer(PurePosixPath(f'w{num}/index.html'), {r[2] for r in records},
                         G._anchor_routes(G.guide_page_specs())).render(markdown)
    # Preserve a prediction before revealing the trace, code and model answer.
    content, count = re.subn(r'(<h3[^>]*>Worked reasoning</h3>)(.*?)(?=<p><strong>Change one thing\.</strong>)',
                            r'<details class="solution"><summary>Worked reasoning — after your prediction</summary>\1\2</details>',
                            content, flags=re.S)
    assert count == 1, f'Week {num}: reasoning answer must be folded'
    return '<section class="meaning-lesson" id="meaning-before-analysis">' + content + '</section>'


def staged_lesson(num, body, studio, bridge=""):
    buckets = {'understand': [], 'investigate': [], 'check': []}
    objectives = ''
    blocks = sections(body)
    remaining = body
    for block in blocks:
        remaining = remaining.replace(block, '', 1)
    assert not re.sub(r'<!--.*?-->', '', remaining, flags=re.S).strip(), f'Week {num}: content outside lesson sections'
    for block in blocks:
        title = heading(block)
        if not title:
            objectives += block
            continue
        lower = title.lower()
        if 'optional studio extension' in lower:
            block = re.sub(r'Due before week[^<]*', 'Optional practice · no submission or deadline', block, flags=re.I)
            buckets['check'].append('<details class="path-reference"><summary>Optional extra practice</summary><div>' + block + '</div></details>')
        elif 'self-check' in lower or 'words from' in lower:
            buckets['check'].append(block)
        elif 'chapter problem set' in lower or 'where to go next' in lower:
            buckets['check'].append('<details class="path-reference"><summary>' + html.escape(title) + '</summary><div>' + block + '</div></details>')
        elif any(label in lower for label in ('try it yourself','workshop tasks','counting practice','final project —')):
            buckets['investigate'].append(block)
        else:
            buckets['understand'].append(block)
    assert all(buckets.values()), f'Week {num}: missing lesson stage'
    from skiena_material import weekly_material
    notes, focus, optional = weekly_material(num)
    original = {key: list(value) for key, value in buckets.items()}
    # The selected source problem leads the class workshop; existing tasks remain reference.
    buckets['investigate'] = [focus, '<details class="path-reference" open><summary>Animations &amp; workshop tasks</summary><div>' + '\n'.join(buckets['investigate']) + '</div></details>']
    buckets['check'].append(optional)
    # Each explanation stays available without presenting the whole chapter at once.
    explanations = []
    for block in buckets['understand']:
        explanations.append('<details class="path-reference teaching-part"><summary>' + html.escape(heading(block)) + '</summary><div>' + block + '</div></details>')
    buckets['understand'] = [meaning_section(num), notes] + explanations + [inline_guide(num), '<details class="path-resources"><summary>Learning goals & class plan</summary><div>' + objectives + studio + '</div></details>']
    if num == 1:
        # Week 1 visual-first pilot: one explanation per concept on the main route.
        # Keep the source material available without duplicating the lesson above it.
        buckets['understand'] = [block for block in blocks if 'w1-lesson' in block] + [
            '<details class="path-reference"><summary>Optional depth · correctness and counterexamples</summary><div>' + notes + '</div></details>',
            '<details class="path-resources"><summary>Learning goals & class plan</summary><div>' + objectives + studio + '</div></details>',
            '<p class="w1-reference">Need a longer explanation? <a href="../guide/w01/">Open the English + Türkçe reference guide</a>.</p>'
        ]
        practice = [block for block in blocks if 'Try it yourself' in heading(block)]
        buckets['investigate'] = practice + ['<details class="path-reference"><summary>Optional textbook workshop · correctness</summary><div>' + focus + '</div></details>']
    if num > 1:
        from visual_lessons import lesson, practice
        def folded(title, content):
            return '<details class="path-reference"><summary>' + title + '</summary><div>' + content + '</div></details>'
        buckets['understand'] = [lesson(num), folded('Optional depth · full technical reference', '\n'.join(original['understand']) + notes),
            folded('Learning goals &amp; class plan', objectives + studio),
            f'<p class="vl-reference">Need a slower explanation? <a href="../guide/w{num:02d}/">Open the English + Türkçe reference guide</a>.</p>']
        buckets['investigate'] = [practice(num), folded('Explore the animations &amp; more worked tasks', '\n'.join(original['investigate'])),
            folded('Optional textbook workshop', focus)]
        buckets['check'] = [block if 'self-check' in heading(block).lower() or block.startswith('<details') else folded('Optional reference · ' + html.escape(heading(block) or 'extra practice'), block)
                            for block in original['check']] + [optional]
    # A lesson is a single reading surface. Keep old section IDs for bookmarks.
    extra, panels = [], []
    for key, label in [('understand', 'Lesson'), ('investigate', 'Practice'), ('check', 'Check your understanding')]:
        main = []
        for block in buckets[key]:
            if (block.startswith('<details') and 'Explore the animations' not in block) or block.startswith(('<p class="vl-reference"', '<p class="w1-reference"')):
                extra.append(block)
            else:
                main.append(block)
        panels.append(f'<section id="{key}" class="lesson-part"><h2 class="path-stage-title">{label}</h2>' + '\n'.join(main) + '</section>')
    if bridge:
        extra.append(bridge)
    return '<div class="continuous-lesson">' + '\n'.join(panels) + '<details class="path-resources" id="lesson-resources"><summary>Extra material &amp; reference</summary><div>' + '\n'.join(extra) + '</div></details></div>'
