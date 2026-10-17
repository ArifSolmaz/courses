"""Stage and verify the sealed CP1 review; publish only after its UTC release time."""
import base64, gzip, json, os, subprocess, tempfile
from datetime import datetime, timezone
from pathlib import Path

RELEASE = datetime(2026, 10, 18, 21, tzinfo=timezone.utc)
FILES = {'index.html','template.html','questions.json','build.py','verify.py','verify.cjs','README.md','links.json'}
ROOT = Path(__file__).resolve().parents[2]

def main():
    mode = os.environ.get('RELEASE_MODE', 'release')
    now = datetime.now(timezone.utc)
    if mode != 'validate' and now < RELEASE:
        print('Not due: publication is blocked until 19 October 00:00 Istanbul.')
        return
    bundle = json.loads(gzip.decompress(base64.b64decode(os.environ['CP1_REVIEW_BUNDLE'])))
    if set(bundle) != FILES:
        raise ValueError('Unexpected release bundle files')
    with tempfile.TemporaryDirectory() as directory:
        stage = Path(directory)
        for name, content in bundle.items():
            (stage/name).write_text(content)
        for command in [['python3','build.py'],['python3','verify.py'],['node','verify.cjs']]:
            subprocess.run(command,cwd=stage,check=True)
        links = json.loads(bundle['links.json'])
        allowed = {'fall/cp1/tools/templates/dashboard.html','fall/cp1/web/CP1_Course_Dashboard.html','fall/cp1/tools/render_experiences.py','fall/cp1/web/Week_06.html'}
        if set(links) != allowed:
            raise ValueError('Unexpected link target')
        updates = {}
        for name, values in links.items():
            content = (ROOT/name).read_text()
            if values['waiting'] in content:
                updates[name] = content.replace(values['waiting'], values['release'])
            elif values['release'] not in content:
                raise ValueError('Course link changed; refusing to overwrite: '+name)
        if mode == 'validate':
            print('Bundle and course links validated. No files published.')
            return
        target = ROOT/'fall/cp1/review'
        for name in FILES-{'links.json'}:
            (target/name).write_text((stage/name).read_text())
        for name, content in updates.items():
            (ROOT/name).write_text(content)
        print('Timed review staged after the release deadline.')

if __name__ == '__main__':
    main()
