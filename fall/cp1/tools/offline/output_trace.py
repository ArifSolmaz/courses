"""Attribute stdout writes to active-cell statements without changing student code."""
import ast
import sys
from contextlib import contextmanager
from offline_output import emit


def statement_lines(source, filename):
    tree = ast.parse(source, filename=filename)
    owners = {}
    for node in ast.walk(tree):
        if not isinstance(node, ast.stmt):
            continue
        end = getattr(node, 'end_lineno', node.lineno)
        body = getattr(node, 'body', None)
        # A compound header owns its body's output, while each child statement
        # retains its own narrower attribution. Include multiline call lines.
        header_end = body[0].lineno - 1 if isinstance(body, list) and body else end
        header = set(range(node.lineno, max(node.lineno, header_end) + 1))
        for line in range(node.lineno, end + 1):
            owners.setdefault(line, set()).update(header)
    return owners


@contextmanager
def capture(source, filename):
    owners = statement_lines(source, filename)
    previous = sys.stdout

    class Output:
        def write(self, text):
            frame = sys._getframe(1)
            related = set()
            while frame:
                if frame.f_code.co_filename == filename:
                    related.update(owners.get(frame.f_lineno, {frame.f_lineno}))
                frame = frame.f_back
            if text:
                emit(text, ','.join(str(n) for n in sorted(related)))
            return len(text)

        def flush(self):
            pass

        def __getattr__(self, name):
            return getattr(previous, name)

    sys.stdout = Output()
    try:
        yield
    finally:
        sys.stdout = previous


def finish(context):
    context.__exit__(None, None, None)
