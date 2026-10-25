"""Line help and a reversible, exact edit for the approved guided activities."""
import ast
import hashlib


def expr(node):
    """Explain common operations with the names used in the example."""
    code = ast.unparse(node)
    if isinstance(node, ast.Constant):
        return f'the starting value `{code}`'
    if isinstance(node, ast.List):
        return f'a list containing {len(node.elts)} items'
    if isinstance(node, ast.ListComp):
        return f'a new list built by `{code}`; visit each input item and keep any stated condition'
    if isinstance(node, ast.Tuple):
        return f'the grouped values in `{code}`'
    if isinstance(node, ast.UnaryOp):
        return f'the value after applying `{code}`'
    if isinstance(node, ast.BoolOp):
        return f'the combined logical result of `{code}`'
    if isinstance(node, ast.Dict):
        return f'a dictionary containing {len(node.keys)} key–value pairs'
    if isinstance(node, ast.Compare):
        return f'the True/False result of `{code}`'
    if isinstance(node, ast.Subscript):
        return f'the item or slice selected by `{code}`; list and text positions start at zero, while dictionaries use keys'
    if isinstance(node, ast.BinOp):
        return f'the result of `{code}` using the current values'
    if isinstance(node, ast.Call):
        name = ast.unparse(node.func)
        args = ', '.join(ast.unparse(a) for a in node.args)
        help = {
            'len': 'the number of items or characters', 'sum': 'the total of the numbers',
            'float': 'a decimal number converted from the supplied value',
            'int': 'an integer converted from the supplied value',
            'min': 'the smallest supplied value', 'max': 'the largest supplied value',
            'enumerate': 'each item together with its running position',
            'range': 'a sequence of integers; the stop value is excluded',
            'round': 'the number rounded to the requested precision',
            'sorted': 'a new sorted list, leaving the input unchanged',
            'next': 'the next item from the reader or iterator',
            'list': 'a list of all items from the supplied iterable',
            'type': 'the type of the supplied value',
            'ord': 'the numeric character code', 'chr': 'the character for a numeric code',
            'all': 'True only if every supplied test is true',
            'math.isfinite': 'True for a finite number, and False for infinity or NaN',
            'csv.reader': 'a CSV reader that returns rows of text fields',
            'csv.writer': 'a CSV writer for the open file',
            'Path': 'a path describing the file or folder',
        }
        if name in help:
            return help[name] + (f' (`{args}`)' if args else '')
        if isinstance(node.func, ast.Attribute):
            obj = ast.unparse(node.func.value)
            method = node.func.attr
            methods = {
                'read': 'all remaining text from the open file',
                'readline': 'the next line from the open file, including its line ending',
                'readlines': 'a list of the remaining file lines, including line endings',
                'read_text': 'the text stored at this path',
                'split': 'a list of text pieces separated at the chosen separator (whitespace by default)',
                'splitlines': 'a list of the text lines',
                'strip': 'a copy of the text with the specified characters removed from both ends (whitespace by default)',
                'rstrip': 'a copy with the specified characters removed from the right end (whitespace by default)',
                'lower': 'a lowercase copy of the text', 'upper': 'an uppercase copy of the text',
                'copy': 'a separate shallow copy of the collection',
                'get': 'the dictionary value for the key, or the supplied default if it is missing',
                'items': 'the dictionary key–value pairs', 'values': 'the dictionary values',
                'find': 'the first matching position, or -1 if the text is absent',
                'count': 'the number of occurrences', 'replace': 'a copy with the requested text replacement',
                'startswith': 'True if the text begins with the supplied prefix',
                'endswith': 'True if the text ends with the supplied suffix',
                'join': 'one string made by joining the supplied text items',
                'isdigit': 'True if every character is a digit and the text is nonempty',
                'isalpha': 'True if every character is a letter and the text is nonempty',
                'isalnum': 'True if every character is a letter or digit and the text is nonempty',
                'isspace': 'True if every character is whitespace and the text is nonempty',
                'isupper': 'True if the cased letters are uppercase',
                'islower': 'True if the cased letters are lowercase',
                'exists': 'True if this path exists',
                'pop': 'the removed item; the collection also changes',
            }
            if method in methods:
                return methods[method] + f' from `{obj}`'
        return f'the value returned by `{name}({args})`; the function runs with these arguments'
    return f'the current value of `{code}`'


def describe(node):
    if isinstance(node, ast.Assign):
        return f'Store {expr(node.value)} in ' + ', '.join(f'`{ast.unparse(t)}`' for t in node.targets) + '.'
    if isinstance(node, ast.AugAssign):
        return f'Update `{ast.unparse(node.target)}` using `{ast.unparse(node)}`; the previous value contributes to the new value.'
    if isinstance(node, ast.FunctionDef):
        return f'Define `{node.name}` with parameters `{ast.unparse(node.args)}`. Its indented body runs when the function is called.'
    if isinstance(node, ast.Return):
        return ('Send ' + expr(node.value) + ' back to the caller and end this function call.') if node.value else 'End this function call and return None.'
    if isinstance(node, ast.For):
        return f'Take each item from `{ast.unparse(node.iter)}` in turn, store it in `{ast.unparse(node.target)}`, and run the indented block.'
    if isinstance(node, ast.While):
        return f'Repeat the indented block while `{ast.unparse(node.test)}` is true; check the condition before every repetition.'
    if isinstance(node, ast.If):
        return f'Test `{ast.unparse(node.test)}`. Run this indented branch only when the condition is true.'
    if isinstance(node, ast.With):
        contexts = []
        for item in node.items:
            call = item.context_expr
            if isinstance(call, ast.Call) and isinstance(call.func, ast.Name) and call.func.id == 'open':
                mode = call.args[1].value if len(call.args)>1 and isinstance(call.args[1], ast.Constant) else 'r'
                meaning = {'w': 'write mode: create the file or replace its contents', 'r': 'read mode: the file must already exist', 'a': 'append mode: add text at the end'}.get(mode, f'mode {mode}')
                contexts.append(f'Open `{ast.unparse(call.args[0])}` in {meaning}. Use `{ast.unparse(item.optional_vars)}` inside the block. The file closes when the block ends.')
            else:
                contexts.append('Enter the temporary-folder context. Its files are removed when the block ends.')
        return ' '.join(contexts)
    if isinstance(node, ast.Try):
        return 'Try the indented operations. If a matching error occurs, move to its except block.'
    if isinstance(node, ast.ExceptHandler):
        return f'Handle `{ast.unparse(node.type) if node.type else "an error"}` here instead of stopping the example.'
    if isinstance(node, (ast.Import, ast.ImportFrom)):
        return f'Load the tools named in `{ast.unparse(node)}` so this example can use them.'
    if isinstance(node, ast.Continue): return 'Skip the rest of this loop iteration and move to the next item.'
    if isinstance(node, ast.Break): return 'Leave this loop immediately and continue after the loop.'
    if isinstance(node, ast.Global): return 'Use the module-level variable inside this function rather than creating a local variable.'
    if isinstance(node, ast.Raise): return 'Raise the stated error so the caller can handle an invalid value explicitly.'
    if isinstance(node, ast.Expr) and isinstance(node.value, ast.Call):
        call=node.value; name=ast.unparse(call.func)
        if name == 'print': return 'Display the supplied values in Output. Click this line after Run to highlight the text printed by it.'
        if isinstance(call.func, ast.Attribute):
            method=call.func.attr; obj=ast.unparse(call.func.value)
            effects={'write':'Write the supplied text exactly, including any explicit \\n line endings. This writes to the file, not to Output.',
                     'writelines':'Write the supplied strings to the file; no extra line endings are added.',
                     'writerow':'Save one CSV row. The writer handles commas and quoting inside fields.',
                     'writerows':'Save all supplied CSV rows. The writer handles commas and quoting inside fields.',
                     'append':f'Add the supplied item to the end of `{obj}`.',
                     'extend':f'Add every supplied item to the end of `{obj}`.',
                     'insert':f'Insert the supplied item at the requested position in `{obj}`.',
                     'remove':f'Remove the first matching item from `{obj}`.',
                     'sort':f'Sort `{obj}` itself; this changes the existing list.',
                     'mkdir':'Create the demonstration folder. exist_ok=True permits a folder that already exists.',
                     'write_text':'Write text to this path, replacing existing contents. This does not print the text.'}
            if method in effects:return effects[method]
        return f'Call `{name}` with the supplied arguments. Follow its function body to see the operations performed.'
    if isinstance(node, ast.Expr) and isinstance(node.value, ast.Constant):
        return 'This documentation string describes what the function does; it does not print a message.'
    raise ValueError('Missing line explanation: '+ast.dump(node))


def line_help(source):
    tree=ast.parse(source);focus={}
    for node in ast.walk(tree):
        if isinstance(node, (ast.stmt, ast.ExceptHandler)):
            focus[str(node.lineno)]=describe(node)
    alternatives = {}
    for node in ast.walk(tree):
        if isinstance(node, (ast.If, ast.For, ast.While, ast.Try)) and node.orelse:
            first = node.orelse[0].lineno
            for n in range(first - 1, 0, -1):
                if source.splitlines()[n - 1].strip() == 'else:':
                    alternatives[str(n)] = ('Run this block only if the try block completed without an error.' if isinstance(node, ast.Try) else 'Run this branch when the preceding condition is false.' if isinstance(node, ast.If) else 'Run this block when the loop finishes without break.')
                    break
    for n,line in enumerate(source.splitlines(),1):
        text=line.strip()
        if not text or text.startswith('#'):continue
        if text == 'else:':focus[str(n)]=alternatives.get(str(n), 'Run the alternative branch of this statement.')
        elif text == 'finally:':focus[str(n)]='Run this cleanup block whether the try block succeeded or raised an error.'
        elif str(n) not in focus:focus[str(n)]='Continue the statement that began above; brackets allow its values to span several lines.'
    return {'source_sha256':hashlib.sha256(source.encode()).hexdigest(), 'line_focus':dict(sorted(focus.items(),key=lambda p:int(p[0])))}


def attach_guidance(nb, activities):
    nb['cells'][0]['source'].append('\n**Reading and changing code:** Click a line number or the code text for an explanation.\nAfter Run, the same click highlights its printed output. Use **Apply suggested change**\nto make the requested edit without changing quotes or indentation, then Run again.\nUse **Edit code** when you want to make a custom edit.\n')
    by_number={str(a['number']):a for a in activities}
    for cell in nb['cells']:
        if cell['cell_type']!='code':continue
        item=by_number[str(cell['metadata']['cp1_activity']['number'])]
        source=''.join(cell['source']);assert source.count(item['old'])==1
        changed=source.replace(item['old'],item['new'],1)
        cell['metadata']['cp1_code_help']=line_help(source)
        cell['metadata']['cp1_guided_change']={'old':item['old'],'new':item['new'],'source':changed,'help':line_help(changed)}
    return nb
