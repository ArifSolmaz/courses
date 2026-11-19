#!/usr/bin/env python3
"""Read-only checks for the sensor capstone's static paper/model contract.

Run with Python's standard library and Node (no browser or packages required).
The browser workflow is tested separately. This check compares the authored
paper questions, options, code, criteria and answer keys with model metadata;
it does not grade a student's explanation or duplicate the model's algorithms.
"""
from collections import Counter
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import hashlib
import json
import re
import subprocess


ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
CAPSTONE = ROOT / 'bridge/capstone'
ENTRY_START = b'<!-- AA:CAPSTONE-ENTRY:START -->'
ENTRY_END = b'<!-- AA:CAPSTONE-ENTRY:END -->'
DIMENSIONS = {
    'code': 'Kodları ve döngüleri takip etmek',
    'math': 'Matematiksel ifadeleri anlamak',
    'purpose': 'Konuların ne işe yaradığını görmek',
    'links': 'Konular arasındaki bağlantıları kurmak',
}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr'}


class Element:
    def __init__(self, tag, attrs=(), parent=None):
        self.tag, self.attrs, self.parent = tag, dict(attrs), parent
        self.children = []

    def text(self):
        return ''.join(child if isinstance(child, str) else child.text()
                       for child in self.children)

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Element):
                yield from child.walk()


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = Element('document')
        self.stack = [self.root]
        self.feed(source)
        self.close()

    def handle_starttag(self, tag, attrs):
        node = Element(tag, attrs, self.stack[-1])
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


class Verification:
    def __init__(self):
        self.assertions = 0

    def ensure(self, condition, message):
        self.assertions += 1
        if not condition:
            raise AssertionError(message)

    def equal(self, actual, expected, message):
        self.ensure(actual == expected, f'{message}: {actual!r} != {expected!r}')

    def one(self, scope, *, tag=None, attribute=None, value=None):
        found = [node for node in scope.walk()
                 if (tag is None or node.tag == tag)
                 and (attribute is None or attribute in node.attrs
                      and (value is None or node.attrs[attribute] == value))]
        self.equal(len(found), 1, f'Expected one {tag or "element"} {attribute}={value}')
        return found[0]


def hidden(node):
    while node is not None:
        if 'hidden' in node.attrs or 'inert' in node.attrs:
            return True
        node = node.parent
    return False


def model_metadata():
    script = ('const m=require(process.argv[1]);'
              'process.stdout.write(JSON.stringify({DIMENSIONS:m.DIMENSIONS,PHASES:m.PHASES}));')
    process = subprocess.run(['node', '-e', script, str(CAPSTONE / 'model.js')],
                             capture_output=True, text=True, check=True)
    return json.loads(process.stdout)


def strip_entry(source, check):
    starts, ends = source.count(ENTRY_START), source.count(ENTRY_END)
    check.equal(starts, ends, 'Bridge entry marker pair count')
    check.ensure(starts in (0, 1), 'Expected at most one capstone entry block')
    if not starts:
        return source
    start, end = source.index(ENTRY_START), source.index(ENTRY_END)
    check.ensure(start < end, 'Bridge entry markers are out of order')
    return source[:start] + source[end + len(ENTRY_END):]


def verify():
    check = Verification()
    report = {'scope': 'Static authored HTML/model contract and additive Bridge preservation; browser workflow is separate.',
              'started_at_utc': datetime.now(timezone.utc).isoformat()}
    try:
        model = model_metadata()
        check.equal({item['id']: item['title'] for item in model['DIMENSIONS']}, DIMENSIONS,
                    'The four named learning difficulties')
        check.equal(len(model['DIMENSIONS']), 4, 'Four dimensions without duplicates')
        document = Document((CAPSTONE / 'index.html').read_text(encoding='utf-8')).root
        elements = list(document.walk())
        identifiers = [node.attrs['id'] for node in elements if 'id' in node.attrs]
        duplicate_ids = [name for name, count in Counter(identifiers).items() if count != 1]
        check.ensure(all(identifiers), 'HTML IDs must not be empty')
        check.equal(duplicate_ids, [], 'Unique HTML IDs')
        by_id = {node.attrs['id']: node for node in elements if 'id' in node.attrs}
        label_count = 0
        labelable = {'input', 'select', 'textarea', 'button', 'meter', 'output', 'progress'}
        for label in (node for node in elements if node.tag == 'label'):
            if 'for' in label.attrs:
                target = by_id.get(label.attrs['for'])
                check.ensure(target is not None and target.tag in labelable
                             and target.attrs.get('type') != 'hidden', 'Label must target a labelable element')
            else:
                controls = [node for node in label.walk() if node.tag in labelable]
                check.equal(len(controls), 1, 'An implicit label must contain one control')
            label_count += 1

        counters = {'prompts': 0, 'options': 0, 'code_blocks': 0, 'rubric_criteria': 0,
                    'model_key_answers': 0, 'print_key_answers': 0}
        for phase in ('pre', 'post'):
            spec = model['PHASES'][phase]
            check.equal([question['id'] for question in spec['questions']], list(DIMENSIONS),
                        phase + ' dimension order')
            context = check.one(document, attribute='data-context', value=phase)
            check.equal(context.text(), spec['context'], phase + ' context')
            form = check.one(document, tag='form', attribute='id', value=phase + '-form')
            check.ensure(not hidden(form), phase + ' native paper form must exist without JavaScript')
            questions = [node for node in form.walk() if 'data-question' in node.attrs]
            check.equal([node.attrs['data-question'] for node in questions], list(DIMENSIONS),
                        phase + ' static question inventory')
            for question_index, question in enumerate(spec['questions'], 1):
                field = check.one(form, tag='fieldset', attribute='data-question', value=question['id'])
                check.ensure(not hidden(field), 'Question must be available without JavaScript')
                legend = check.one(field, tag='legend')
                check.equal(legend.text(), f'{question_index}. {question["title"]}', 'Question title')
                prompt = check.one(field, attribute='data-prompt')
                check.equal(prompt.text(), question['prompt'], phase + '/' + question['id'] + ' prompt')
                counters['prompts'] += 1
                option_nodes = [node for node in field.walk() if 'data-option' in node.attrs]
                check.equal([node.attrs['data-option'] for node in option_nodes],
                            [option['value'] for option in question['options']], 'Static option inventory')
                radios = [node for node in field.walk() if node.tag == 'input' and node.attrs.get('type') == 'radio']
                check.equal([node.attrs.get('value') for node in radios],
                            [option['value'] for option in question['options']], 'Native option values')
                for node in radios:
                    check.equal(node.attrs.get('name'), phase + '-' + question['id'], 'Native radio group name')
                    check.ensure('required' in node.attrs and not hidden(node), 'Native radio option must be available')
                for option in question['options']:
                    node = check.one(field, attribute='data-option', value=option['value'])
                    check.equal(node.text(), option['label'], 'Option text matches model')
                    counters['options'] += 1
                code_nodes = [node for node in field.walk() if 'data-code' in node.attrs]
                check.equal(len(code_nodes), 1 if 'code' in question else 0, 'Python excerpt inventory')
                if 'code' in question:
                    check.equal(code_nodes[0].text(), question['code'], 'Visible Python excerpt matches model')
                    counters['code_blocks'] += 1
                reason = check.one(field, tag='textarea', attribute='id',
                                   value=phase + '-' + question['id'] + '-reason')
                check.ensure(not hidden(reason) and 'required' in reason.attrs, 'Paper explanation field is required and present')
                check.equal(reason.attrs.get('maxlength'), '1200', 'Explanation character limit')

        check.equal([q['rubric'] for q in model['PHASES']['pre']['questions']],
                    [q['rubric'] for q in model['PHASES']['post']['questions']], 'Equivalent pre/post criteria')
        for question in model['PHASES']['pre']['questions']:
            dimension = question['id']
            field = check.one(document, tag='fieldset', attribute='data-dimension', value=dimension)
            check.ensure(not hidden(field), 'Paper rubric must be available without JavaScript')
            check.equal(check.one(field, tag='legend').text(), DIMENSIONS[dimension], 'Named paper rubric dimension')
            criteria = check.one(field, tag='ol')
            check.equal(criteria.attrs.get('start'), '0', 'Rubric numbering begins at zero')
            items = [node for node in criteria.children if isinstance(node, Element) and node.tag == 'li']
            check.equal([node.text() for node in items],
                        [re.sub(r'^\d:\s*', '', text) for text in question['rubric']], 'Static rubric text')
            counters['rubric_criteria'] += len(items)
            for phase in ('pre', 'post'):
                select = check.one(field, tag='select', attribute='id', value=f'rubric-{phase}-{dimension}')
                options = [node for node in select.walk() if node.tag == 'option']
                check.equal([node.attrs.get('value') for node in options], ['', '0', '1', '2'],
                            'Unselected manual score stays distinct from zero')

        key = check.one(document, attribute='id', value='model-key')
        check.ensure(key.tag == 'details' and not hidden(key), 'Native paper answer key must be accessible as details')
        # Identify the printable duplicate by its semantic two-phase structure,
        # so a presentation-class change cannot break the content contract.
        print_keys = []
        for node in elements:
            sections = [child for child in node.children if isinstance(child, Element) and child.tag == 'section']
            if node.tag == 'section' and len(sections) == 2 and all(
                    sum(isinstance(child, Element) and child.tag == 'article' for child in section.children) == 4
                    for section in sections):
                print_keys.append(node)
        check.equal(len(print_keys), 1, 'One printable answer key')
        for container, counter in ((key, 'model_key_answers'), (print_keys[0], 'print_key_answers')):
            sections = [node for node in container.children if isinstance(node, Element) and node.tag == 'section']
            check.equal(len(sections), 2, 'Both phases appear in the answer key')
            for phase, section in zip(('pre', 'post'), sections):
                articles = [node for node in section.children if isinstance(node, Element) and node.tag == 'article']
                check.equal(len(articles), 4, phase + ' answer key inventory')
                for question, article in zip(model['PHASES'][phase]['questions'], articles):
                    heading = check.one(article, tag='h4')
                    check.equal(heading.text(), question['title'], 'Answer key title')
                    paragraphs = [node for node in article.children if isinstance(node, Element) and node.tag == 'p']
                    check.equal(len(paragraphs), 2, 'Answer key expected option and explanation')
                    expected = next(option['label'] for option in question['options'] if option['value'] == question['correct'])
                    check.equal(paragraphs[0].text(), 'Beklenen seçenek: ' + expected, 'Answer key expected option')
                    check.equal(paragraphs[1].text(), question['explanation'], 'Answer key explanation')
                    counters[counter] += 1

        schedules = []
        for node in elements:
            if node.tag != 'ol':
                continue
            items = [item for item in node.children if isinstance(item, Element) and item.tag == 'li']
            values = []
            for item in items:
                strongs = [child for child in item.walk() if child.tag == 'strong']
                if len(strongs) == 1 and re.fullmatch(r'\d+ dk', strongs[0].text()):
                    values.append(int(strongs[0].text().split()[0]))
            if len(values) == 4:
                schedules.append(values)
        check.equal(schedules, [[4, 10, 6, 5]], 'The four-part time plan')
        check.equal(sum(schedules[0]), 25, 'Total planned minutes')

        target_documents = {}
        links, dependencies = [], []
        for node in elements:
            for attr in ('href', 'src'):
                if attr not in node.attrs:
                    continue
                address = node.attrs[attr]
                url = urlsplit(address)
                if url.scheme or url.netloc:
                    check.ensure(url.scheme in ('https', 'http'), 'Unsupported external URL scheme')
                    continue
                target = (CAPSTONE / unquote(url.path)).resolve() if url.path else CAPSTONE / 'index.html'
                if target.is_dir():
                    target /= 'index.html'
                check.ensure(target.is_relative_to(ROOT), 'Local link must stay within AA')
                check.ensure(target.is_file(), 'Missing local link or asset: ' + address)
                if url.fragment:
                    if target not in target_documents:
                        target_documents[target] = Document(target.read_text(encoding='utf-8')).root
                    ids = {entry.attrs['id'] for entry in target_documents[target].walk() if 'id' in entry.attrs}
                    check.ensure(unquote(url.fragment) in ids, 'Missing local fragment: ' + address)
                entry = {'url': address, 'target': target.relative_to(ROOT).as_posix(), 'fragment': url.fragment}
                (links if node.tag == 'a' else dependencies).append(entry)
        dependency_paths = {entry['target'] for entry in dependencies}
        check.ensure({'bridge/capstone/style.css', 'bridge/capstone/model.js', 'bridge/capstone/app.js'} <= dependency_paths,
                     'The complete local enhancement assets are linked')

        bridge = (ROOT / 'bridge/index.html').read_bytes()
        check.equal(bridge.count(ENTRY_START), 1, 'The Bridge has one additive capstone entry')
        entry_html = bridge.split(ENTRY_START, 1)[1].split(ENTRY_END, 1)[0].decode('utf-8')
        entry = Document(entry_html).root
        entry_link = check.one(entry, tag='a')
        check.equal(entry_link.attrs.get('href'), 'capstone/', 'Bridge entry opens the integrated lab')
        committed = subprocess.run(['git', '-C', str(REPO), 'show', 'HEAD:aa/bridge/index.html'],
                                   capture_output=True, check=True).stdout
        original, current = strip_entry(committed, check), strip_entry(bridge, check)
        check.equal(current, original, 'Bridge prototype bytes outside its marked entry are preserved')
        report.update({'status': 'passed', 'dimensions': list(DIMENSIONS), 'schedule_minutes': schedules[0],
                       **counters, 'unique_ids': len(identifiers), 'valid_labels': label_count,
                       'local_links': links, 'local_dependencies': dependencies,
                       'bridge_prototype_preserved': True,
                       'bridge_without_entry_sha256': hashlib.sha256(current).hexdigest()})
    except (AssertionError, OSError, ValueError, KeyError, subprocess.SubprocessError) as error:
        report.update({'status': 'failed', 'error': str(error)})
    report['assertions'] = check.assertions
    report['completed_at_utc'] = datetime.now(timezone.utc).isoformat()
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report', type=Path, help='Optional JSON report path outside the AA source tree.')
    args = parser.parse_args()
    if args.report and args.report.resolve().is_relative_to(ROOT):
        parser.error('--report must be outside the AA source tree')
    result = verify()
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result['status'] == 'passed' else 1)
