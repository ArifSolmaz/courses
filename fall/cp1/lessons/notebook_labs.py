"""Small executable adaptations of the weekly Colab teaching sections.

Cases change Python inputs, not pre-written animation answers. build_notebook_labs
records real Python execution, including scopes, containers, output and files.
"""
from textwrap import dedent
LABS = []
def lab(week, slug, title, parts, exercise, focus, code, cases):
    LABS.append(dict(week=week, id=slug, title=title, parts=parts, exercise=exercise,
                     focus=focus, code=dedent(code).strip(), cases=cases))
def case(label, **inputs):
    return dict(label=label, inputs=inputs)

lab(1,'names','Assignment: names follow values',[5], 'EX02',
    'Watch area stay unchanged when width is reassigned. An expression is calculated when its line runs.', r'''
    area = width * height
    old_width = width
    width = width + 2
    print("Stored area:", area)
    area = width * height
    print("Recalculated:", area)
    ''', [case('Rectangle 5 × 3',width=5,height=3),case('Zero width',width=0,height=3),case('Decimal dimensions',width=2.5,height=4)])
lab(1,'types','Values, types and overloaded operators',[3,6], 'EX14',
    'The same + and * symbols mean different things for numbers and text. Inspect the type beside each value.', r'''
    doubled = value * 2
    combined = value + value
    print(type(value).__name__)
    print(doubled)
    print(combined)
    ''',[case('Integer',value=12),case('Floating point',value=1.5),case('Text',value='12')])
lab(1,'precedence','Arithmetic: follow intermediate results',[7], 'EX07',
    'Compare the two expressions. Parentheses decide which intermediate value is formed first.', r'''
    product = b * c
    usual = a + b * c
    grouped = (a + b) * c
    print("a + b * c =", usual)
    print("(a + b) * c =", grouped)
    ''',[case('2, 3, 4',a=2,b=3,c=4),case('Negative a',a=-2,b=3,c=4),case('Zero multiplier',a=2,b=3,c=0)])
lab(1,'errors','Where execution stops',[8], 'EX04',
    'A runtime error prevents later lines from running. Compare division by zero with arithmetic on the wrong type.', r'''
    print("Starting calculation")
    speed = distance / time
    print("Speed:", speed)
    print("Calculation finished")
    ''',[case('Valid values',distance=100,time=5),case('Zero denominator',distance=100,time=0),case('Wrong type',distance='100',time=5)])
lab(2,'convert','Input text and conversion',[6,7], 'EX02',
    'input() supplies text. Compare converting directly to int with converting to float first; watch where an error stops execution.', r'''
    print("Raw input:", raw)
    value = float(raw)
    whole = int(value)
    print("Float:", value)
    print("Integer:", whole)
    direct = int(raw)
    print("Direct integer:", direct)
    ''',[case('Whole-number text',raw='12'),case('Decimal text',raw='12.8'),case('Invalid text',raw='twelve')])
lab(2,'divmod','Break a duration into parts',[2], 'EX03',
    'Integer division gives complete units; remainder carries what is left into the next calculation.', r'''
    hours = seconds // 3600
    remainder = seconds % 3600
    minutes = remainder // 60
    remaining_seconds = remainder % 60
    print(hours, minutes, remaining_seconds)
    print(hours * 3600 + minutes * 60 + remaining_seconds)
    ''',[case('3661 seconds',seconds=3661),case('Exactly one hour',seconds=3600),case('Under a minute',seconds=59)])
lab(2,'assignment','Comparison versus updating a variable',[3,4,5], 'EX01',
    'A comparison produces a Boolean; it does not change score. Augmented assignment does change the stored value.', r'''
    equal_before = score == target
    score += increment
    equal_after = score == target
    score *= 2
    print(equal_before, equal_after)
    print("Updated score:", score)
    ''',[case('Reach target',score=5,target=8,increment=3),case('Already equal',score=8,target=8,increment=3),case('No change',score=5,target=8,increment=0)])
lab(2,'receipt','Calculation versus formatted output',[8,9], 'EX04',
    'See numeric values and formatted strings side by side. Formatting changes the display, not the stored total.', r'''
    total = price * quantity
    label = item.upper()
    line = f"{label}: {quantity} x {price:.2f} = {total:.2f}"
    print(line)
    print("Unformatted total:", total)
    ''',[case('Normal receipt',item='pen',price=4.125,quantity=3),case('Zero quantity',item='motor',price=29.95,quantity=0),case('Longer name',item='temperature sensor',price=12.5,quantity=2)])
lab(3,'branches','Only one branch in an if/elif chain',[3,4,5], 'EX03',
    'Follow the highlighted line. After a true branch, later elif conditions are skipped.', r'''
    if score >= 85:
        grade = "A"
    elif score >= 70:
        grade = "B"
    elif score >= 50:
        grade = "C"
    else:
        grade = "F"
    print(grade)
    ''',[case('First branch',score=92),case('Exact boundary',score=70),case('Else branch',score=49)])
lab(3,'logic','Short-circuiting protects a division',[6], 'EX06',
    'AND skips its right side when the left side is false. OR does not provide the same protection here.', r'''
    if use_and:
        acceptable = denominator != 0 and numerator / denominator > 2
    else:
        acceptable = denominator != 0 or numerator / denominator > 2
    print("Acceptable:", acceptable)
    ''',[case('AND, nonzero',use_and=True,numerator=10,denominator=2),case('AND, zero',use_and=True,numerator=10,denominator=0),case('Faulty OR, zero',use_and=False,numerator=10,denominator=0)])
lab(3,'nested','Nested decisions and their boundaries',[7,8], 'EX05',
    'An outer decision determines whether an inner decision is even reached.', r'''
    if 0 <= age <= 120:
        if age < 12:
            price = 10
        elif age >= 65:
            price = 12
        else:
            price = 20
        print("Ticket:", price)
    else:
        print("Invalid age")
    ''',[case('Child',age=11),case('Adult boundary',age=12),case('Invalid input',age=-1)])
lab(3,'leap','Combine rules: leap-year logic',[6,10], 'EX04',
    'Test the century exception. Divisibility by 4 alone is not a complete rule.', r'''
    by_4 = year % 4 == 0
    by_100 = year % 100 == 0
    by_400 = year % 400 == 0
    leap = by_400 or (by_4 and not by_100)
    print(year, leap)
    ''',[case('Ordinary leap year',year=2024),case('Century exception',year=1900),case('400-year exception',year=2000)])
lab(4,'range','The cursor through range(start, stop, step)',[2,3,9], 'EX01',
    'Track the loop variable and printed sequence. The stop value is excluded; an incompatible direction gives no iterations.', r'''
    visited = []
    for i in range(start, stop, step):
        visited.append(i)
        print(i)
    print("Visited:", visited)
    ''',[case('Forward',start=1,stop=5,step=1),case('Countdown',start=5,stop=0,step=-1),case('Empty range',start=5,stop=0,step=1)])
lab(4,'factorial','Accumulation: the value carried between turns',[5], 'EX03',
    'Watch product evolve. Multiplication starts from 1; the empty loop for 0 preserves that identity.', r'''
    product = 1
    for factor in range(1, n + 1):
        product *= factor
    print("Factorial:", product)
    ''',[case('4 factorial',n=4),case('0 factorial',n=0),case('1 factorial',n=1)])
lab(4,'filter','A loop with a condition inside',[4,6], 'EX04',
    'Every value is visited, but only matching values change the accumulator.', r'''
    total = 0
    accepted = []
    for value in values:
        if value % 2 == 0:
            total += value
            accepted.append(value)
    print("Even values:", accepted)
    print("Sum:", total)
    ''',[case('Mixed values',values=[1,2,3,4,5]),case('No matches',values=[1,3,5]),case('Negative and zero',values=[-2,-1,0,2])])
lab(4,'nested','Nested loops: the inner loop restarts',[7], 'EX12',
    'Track i and j together. The list of visited pairs grows one inner iteration at a time.', r'''
    pairs = []
    for i in range(rows):
        for j in range(cols):
            pairs.append([i, j])
            print(i, j)
    print("Pairs:", len(pairs))
    ''',[case('2 × 3',rows=2,cols=3),case('3 × 1',rows=3,cols=1),case('Empty inner loop',rows=2,cols=0)])
lab(5,'while','A while loop must make progress',[2,4,9], 'EX01',
    'Compare a correct countdown with a missing update. The demonstration stops a runaway trace after a fixed step budget.', r'''
    while count > 0:
        print(count)
        if update:
            count -= 1
    print("Go!")
    ''',[case('Countdown',count=3,update=True),case('Already finished',count=0,update=True),case('Missing update',count=2,update=False)])
lab(5,'sentinel','Sentinel input: stop before adding zero',[3,7,8], 'EX02',
    'This list simulates successive inputs. Notice that values after the sentinel are never processed.', r'''
    total = 0
    index = 0
    while index < len(inputs):
        value = inputs[index]
        index += 1
        if value == 0:
            break
        total += value
    print("Total:", total)
    print("Inputs consumed:", index)
    ''',[case('Sentinel in middle',inputs=[3,4,0,99]),case('Sentinel first',inputs=[0,99]),case('No sentinel',inputs=[3,4,5])])
lab(5,'control','continue skips; break ends the loop',[5,6], 'EX10',
    'A negative value is skipped; zero stops the loop. Compare both with a normal iteration.', r'''
    kept = []
    for value in values:
        if value < 0:
            continue
        if value == 0:
            break
        kept.append(value)
    print(kept)
    ''',[case('Skip then stop',values=[2,-1,3,0,8]),case('Only skip',values=[-2,4,-1,5]),case('Stop immediately',values=[0,4])])
lab(5,'digits','Peel digits with remainder and integer division',[7], 'EX06',
    'Follow the shrinking number, the extracted digit and the running total.', r'''
    remaining = abs(number)
    total = 0
    while remaining > 0:
        digit = remaining % 10
        total += digit
        remaining //= 10
    print("Digit sum:", total)
    ''',[case('5072',number=5072),case('Negative input',number=-42),case('Zero',number=0)])
lab(6,'summary','Sum, count and average are different states',[2,3,5], 'EX05',
    'Watch total and count change together. Empty data requires a deliberate result instead of division by zero.', r'''
    total = 0
    count = 0
    for value in values:
        total += value
        count += 1
    average = total / count if count else None
    print("Total, count, average:", total, count, average)
    ''',[case('Mixed signs',values=[3,-1,7,3]),case('One reading',values=[8]),case('No readings',values=[])])
lab(6,'extremes','Min/max: why the initial value matters',[4], 'EX03',
    'Compare initializing from the first observation with a faulty zero when all values are negative.', r'''
    maximum = 0 if start_at_zero else values[0]
    minimum = values[0]
    for value in values:
        if value > maximum:
            maximum = value
        if value < minimum:
            minimum = value
    print("Min, max:", minimum, maximum)
    ''',[case('Mixed values',values=[3,8,-2],start_at_zero=False),case('All negative, correct',values=[-5,-2,-9],start_at_zero=False),case('All negative, faulty',values=[-5,-2,-9],start_at_zero=True)])
lab(6,'scan','Searching: found position or no match',[6], 'EX11',
    'Compare first-match search with counting all matches. A missing match keeps the sentinel position −1.', r'''
    position = -1
    matches = 0
    for i in range(len(values)):
        if values[i] == target:
            matches += 1
            if position == -1:
                position = i
    print("First position:", position)
    print("Match count:", matches)
    ''',[case('Repeated target',values=[2,4,2,6],target=2),case('Absent target',values=[2,4,2,6],target=9),case('Empty list',values=[],target=2)])
lab(6,'two-pass','Two passes: count values above the average',[7,8,9], 'EX06',
    'The threshold is not known until the first pass finishes. Keep the second pass separate.', r'''
    total = 0
    for value in values:
        total += value
    average = total / len(values)
    above = 0
    for value in values:
        if value > average:
            above += 1
    print("Average:", average)
    print("Above average:", above)
    ''',[case('Different values',values=[2,4,8,10]),case('All equal',values=[4,4,4]),case('Single value',values=[5])])
lab(7,'slices','Indexing and slicing a list',[2,3], 'EX04',
    'Indexes select one value; slices create a new list. Compare a clipped slice with an invalid index.', r'''
    part = values[start:stop]
    reverse = values[::-1]
    print("Slice:", part)
    print("Reverse:", reverse)
    selected = values[index]
    print("Selected:", selected)
    ''',[case('Middle slice',values=[10,20,30,40],start=1,stop=3,index=-1),case('Slice clips safely',values=[10,20],start=0,stop=9,index=1),case('Index out of range',values=[10,20],start=0,stop=9,index=9)])
lab(7,'mutate','List methods: in-place changes and returned values',[4,5,9], 'EX10',
    'append and sort change the same list and return None. pop both changes the list and returns a value.', r'''
    appended = values.append(new)
    removed = values.pop(0)
    sorted_result = values.sort()
    print("List:", values)
    print("append returned:", appended)
    print("pop returned:", removed)
    print("sort returned:", sorted_result)
    ''',[case('Three items',values=[3,1,2],new=4),case('Initially empty',values=[],new=7),case('Duplicate items',values=[2,2,1],new=2)])
lab(7,'alias','Aliasing versus copying',[4,6], 'EX11',
    'Object labels reveal whether two names point to one list. Editing an alias changes the original.', r'''
    original = [3, 1, 2]
    analysis = original.copy() if make_copy else original
    analysis.sort()
    analysis.append(9)
    print("Original:", original)
    print("Analysis:", analysis)
    ''',[case('Shared list',make_copy=False),case('Separate copy',make_copy=True)])
lab(7,'deduplicate','Build a new list while scanning the old one',[7,8], 'EX06',
    'Keep first occurrences in order. A duplicate takes a different branch without changing the result list.', r'''
    unique = []
    for value in values:
        if value not in unique:
            unique.append(value)
    print(unique)
    ''',[case('Repeated values',values=[3,1,3,2,1]),case('All same',values=[4,4,4]),case('Empty',values=[])])
lab(8,'row-column','Nested loops: row and column totals',[3,4,6], 'EX03',
    'Keep row totals separate from column totals. The same visited cell contributes to both.', r'''
    row_totals = [0] * len(grid)
    col_totals = [0] * len(grid[0])
    for row in range(len(grid)):
        for col in range(len(grid[0])):
            row_totals[row] += grid[row][col]
            col_totals[col] += grid[row][col]
    print(row_totals)
    print(col_totals)
    ''',[case('2 × 3',grid=[[1,2,3],[4,5,6]]),case('3 × 1',grid=[[2],[5],[8]]),case('Negative entries',grid=[[-1,2],[3,-4]])])
lab(8,'transpose','Transpose: swap the destination coordinates',[5,9], 'EX07',
    'Watch a rectangular matrix become a matrix of the opposite shape. Track row and col at each append.', r'''
    transposed = []
    for col in range(len(grid[0])):
        new_row = []
        for row in range(len(grid)):
            new_row.append(grid[row][col])
        transposed.append(new_row)
    print(transposed)
    ''',[case('2 × 3',grid=[[1,2,3],[4,5,6]]),case('One row',grid=[[10,20,30]]),case('Square',grid=[[1,2],[3,4]])])
lab(8,'diagonal','Select cells by their coordinates',[4,5], 'EX06',
    'Compare visiting every cell with accumulating only cells where row equals col.', r'''
    total = 0
    selected = []
    for row in range(len(grid)):
        for col in range(len(grid[row])):
            if row == col:
                total += grid[row][col]
                selected.append([row, col])
    print("Diagonal:", selected)
    print("Sum:", total)
    ''',[case('3 × 3',grid=[[1,2,3],[4,5,6],[7,8,9]]),case('2 × 2',grid=[[8,1],[2,9]]),case('Rectangular intersection',grid=[[1,2,3],[4,5,6]])])
lab(8,'rows','Building independent rows versus shared rows',[7], 'EX01',
    'Repeated references can make one cell assignment appear in every row. Watch the row object labels.', r'''
    if independent:
        grid = []
        for row in range(3):
            grid.append([0, 0, 0])
    else:
        grid = [[0, 0, 0]] * 3
    grid[0][1] = 9
    print(grid)
    ''',[case('Independent rows',independent=True),case('Shared row bug',independent=False)])
lab(9,'text','String methods return new strings',[1,2], 'EX05',
    'Compare a discarded method result with an assigned result. Strings do not change in place.', r'''
    raw.upper()
    print("Still raw:", raw)
    clean = raw.strip()
    upper = clean.upper()
    replaced = upper.replace(" ", "_")
    print("Clean:", clean)
    print("Label:", replaced)
    ''',[case('Spaces around words',raw='  sensor ready  '),case('Mixed case',raw='Motor A'),case('Empty after strip',raw='   ')])
lab(9,'split','Split, inspect fields, then join',[3,7], 'EX06',
    'A delimiter decides field boundaries. Compare explicit comma splitting with whitespace splitting.', r'''
    fields = text.split(separator)
    cleaned = []
    for field in fields:
        cleaned.append(field.strip())
    rebuilt = " | ".join(cleaned)
    print(fields)
    print(rebuilt)
    ''',[case('Comma record',text='T1, 23.5, C',separator=','),case('Missing field',text='T1,,C',separator=','),case('Whitespace',text='  one   two three  ',separator=None)])
lab(9,'frequency','Scan characters and count matches',[4,5], 'EX02',
    'Track the index, current character and vowel count. Case conversion is explicit.', r'''
    count = 0
    matches = []
    for index in range(len(text)):
        char = text[index].lower()
        if char in "aeiou":
            count += 1
            matches.append(index)
    print("Vowels:", count)
    print("Positions:", matches)
    ''',[case('Mixed case',text='Robot AI'),case('No vowels',text='rhythm'),case('Empty string',text='')])
lab(9,'palindrome','Normalize before comparing text',[2,8], 'EX04',
    'Removing spaces and lowercasing changes the comparison. Punctuation is deliberately retained in this version.', r'''
    clean = text.lower().replace(" ", "")
    reversed_text = clean[::-1]
    palindrome = clean == reversed_text
    print(clean)
    print(reversed_text)
    print(palindrome)
    ''',[case('Mixed case and spaces',text='Never odd or even'),case('Not a palindrome',text='robot'),case('Punctuation changes result',text='Never odd or even!')])
lab(10,'arguments','Arguments enter a new function frame',[2,3,5], 'EX01',
    'Watch parameters receive arguments, including the default parameter when it is omitted.', r'''
    def greet(name, greeting="Hello"):
        message = greeting + ", " + name
        return message

    first = greet(person)
    second = greet(person, custom)
    print(first)
    print(second)
    ''',[case('English / Turkish',person='Elif',custom='Merhaba'),case('Another caller',person='Can',custom='Welcome')])
lab(10,'return','Printing is not returning',[4,6], 'EX04',
    'Track output separately from the returned value. A function with no return statement returns None.', r'''
    def add_print(a, b):
        print(a + b)

    def add_return(a, b):
        return a + b

    printed = add_print(x, y)
    returned = add_return(x, y)
    print("Stored values:", printed, returned)
    ''',[case('3 + 4',x=3,y=4),case('Negative sum',x=-5,y=2)])
lab(10,'function-loop','A loop inside a reusable function',[4,7], 'EX06',
    'Each call starts a fresh local accumulator. The caller only receives the returned result.', r'''
    def factorial(n):
        """Return n! for a nonnegative integer."""
        product = 1
        for i in range(1, n + 1):
            product *= i
        return product

    result = factorial(number)
    print(result)
    ''',[case('4!',number=4),case('0!',number=0),case('2!',number=2)])
lab(10,'calculator','Dispatch to small functions',[8,9], 'EX12',
    'Follow the selected function call and its return path. Division by zero deliberately returns None.', r'''
    def add(a, b):
        return a + b

    def divide(a, b):
        if b == 0:
            return None
        return a / b

    if operation == "+":
        result = add(x, y)
    else:
        result = divide(x, y)
    print(result)
    ''',[case('Add',operation='+',x=10,y=2),case('Divide',operation='/',x=10,y=2),case('Zero denominator',operation='/',x=10,y=0)])
lab(11,'scope','Same name, different scope',[2,3,4,6], 'EX01',
    'Keep the global x visible while a local x shadows it inside the function.', r'''
    def change(x):
        x = x + 5
        print("Inside:", x)
        return x

    result = change(x)
    print("Outside:", x)
    print("Returned:", result)
    ''',[case('x = 10',x=10),case('x = −5',x=-5)])
lab(11,'global','Local assignment versus explicit global mutation',[5,6], 'EX02',
    'Compare changing a global variable with an accidental local assignment that reads before it is initialized.', r'''
    def safe_increment():
        global count
        count += 1

    def broken_increment():
        count += 1

    if use_global:
        safe_increment()
        safe_increment()
    else:
        broken_increment()
    print(count)
    ''',[case('Explicit global',count=0,use_global=True),case('Local scope error',count=0,use_global=False)])
lab(11,'composition','Functions calling functions',[7], 'EX10',
    'Watch the stack grow and shrink. Each caller waits for a return value before continuing its expression.', r'''
    def double(n):
        return n * 2

    def shift(n):
        return n + 3

    def transform(n):
        return shift(double(n))

    answer = transform(value)
    print(answer)
    ''',[case('Positive input',value=4),case('Negative input',value=-3)])
lab(11,'library','Refactor a report into a mini-library',[8,9,10], 'EX06',
    'The report calls reusable helpers. Follow where totals and means live instead of mixing them into global state.', r'''
    def mean(values):
        if not values:
            return None
        return sum(values) / len(values)

    def report(values):
        average = mean(values)
        return f"Count: {len(values)}, mean: {average}"

    summary = report(readings)
    print(summary)
    ''',[case('Three readings',readings=[2,4,9]),case('No readings',readings=[]),case('Valid zero',readings=[0])])
lab(12,'handlers','try / except / else / finally',[3,5,6], 'EX01',
    'A successful try reaches else; an error reaches its handler. finally runs on both paths.', r'''
    try:
        result = 10 / denominator
    except ZeroDivisionError:
        print("Cannot divide by zero")
    else:
        print("Result:", result)
    finally:
        print("Finished attempt")
    ''',[case('Success',denominator=2),case('Handled error',denominator=0)])
lab(12,'specific','Different errors need different handlers',[2,4], 'EX10',
    'Conversion happens before indexing. The error type tells you which operation failed.', r'''
    values = [10, 20, 30]
    try:
        index = int(text)
        result = values[index]
        print(result)
    except ValueError:
        print("Index must be an integer")
    except IndexError:
        print("Index outside list")
    ''',[case('Valid index',text='1'),case('Invalid text',text='one'),case('Out of range',text='7')])
lab(12,'retry','Retry without turning failure into a value',[7,10], 'EX11',
    'Simulated input attempts let you see failures and the first successful conversion. Later attempts remain unused.', r'''
    result = None
    for attempt in attempts:
        try:
            result = int(attempt)
        except ValueError:
            print("Retry:", attempt)
            continue
        break
    print("Accepted:", result)
    ''',[case('Failure then success',attempts=['bad','12','99']),case('Valid zero',attempts=['0','99']),case('All fail',attempts=['bad','2.5'])])
lab(12,'raise','Validation inside a function',[8,9], 'EX06',
    'An exception travels from the function to its caller. Distinguish conversion errors from a rejected numeric range.', r'''
    def validated(text):
        value = float(text)
        if not 0 <= value <= 100:
            raise ValueError("outside 0–100")
        return value

    try:
        result = validated(raw)
        print("Accepted:", result)
    except ValueError as error:
        print("Rejected:", str(error))
    ''',[case('Valid',raw='75'),case('Out of range',raw='101'),case('Not numeric',raw='bad')])
lab(13,'file-modes','File modes: append or overwrite',[2,3,4], 'EX11',
    'The file pane shows persisted contents after each line. Opening in w truncates immediately; a preserves existing text.', r'''
    with open("log.txt", "w") as file:
        file.write("first\n")
    with open("log.txt", mode) as file:
        file.write("second\n")
    with open("log.txt") as file:
        saved = file.read()
    print(saved, end="")
    ''',[case('Append',mode='a'),case('Overwrite',mode='w')])
lab(13,'cursor','Reading advances a file cursor',[2,5], 'EX02',
    'readline consumes one line. A later read starts at the current cursor rather than the beginning.', r'''
    with open("notes.txt", "w") as file:
        file.write(content)
    with open("notes.txt") as file:
        first = file.readline()
        rest = file.read()
        after_end = file.read()
    print(repr(first))
    print(repr(rest))
    print(repr(after_end))
    ''',[case('Three lines',content='one\ntwo\nthree\n'),case('One line',content='one\n'),case('Empty file',content='')])
lab(13,'csv','CSV fields and quoting',[6,7,8], 'EX07',
    'Compare naive splitting with csv.reader. A comma inside a quoted field is data, not a field boundary.', r'''
    import csv
    naive = line.split(",")
    parsed = next(csv.reader([line]))
    print("split:", naive)
    print("csv:", parsed)
    with open("copy.csv", "w", newline="") as file:
        csv.writer(file).writerow(parsed)
    ''',[case('Simple CSV',line='Elif,85,90'),case('Quoted comma',line='"Demir, Elif",85,90'),case('Empty field',line='Elif,,90')])
lab(13,'clean-file','Read, validate and write a new file',[5,7,8], 'EX12',
    'Keep raw input intact. Separate accepted numbers from rejected line numbers before writing the clean file.', r'''
    with open("raw.txt", "w") as file:
        file.write(content)
    clean = []
    rejected = []
    with open("raw.txt") as file:
        for line_number, line in enumerate(file, 1):
            try:
                value = float(line.strip())
            except ValueError:
                rejected.append(line_number)
                continue
            clean.append(value)
    with open("clean.txt", "w") as file:
        for value in clean:
            file.write(f"{value}\n")
    print("Rejected lines:", rejected)
    ''',[case('One bad line',content='20\nbad\n22\n'),case('Zero is valid',content='20\n0\n22\n'),case('All invalid',content='bad\n\n')])
lab(14,'parse-project','Project stage 1: parse the sensor CSV',[3,4], 'EX02',
    'Separate the header from data rows and preserve timestamp, sensor and value text for validation.', r'''
    import csv
    lines = content.splitlines()
    reader = csv.reader(lines)
    header = next(reader)
    rows = []
    for row in reader:
        rows.append(row)
    print("Header:", header)
    print("Data rows:", len(rows))
    ''',[case('Two sensors',content='timestamp,sensor,value\n09:00,temperature,22.5\n09:00,humidity,45\n'),case('Empty value preserved',content='timestamp,sensor,value\n09:00,temperature,\n'),case('Header only',content='timestamp,sensor,value\n')])
lab(14,'validate-project','Project stage 2: retain rows or record reasons',[5], 'EX04',
    'Every row must be accounted for. This focused model accepts finite temperature readings from −50 to 60 °C.', r'''
    import math
    clean = []
    rejected = []
    for row in rows:
        try:
            if len(row) != 3 or row[1] != "temperature":
                raise ValueError("bad structure or sensor")
            value = float(row[2])
            if not math.isfinite(value) or not -50 <= value <= 60:
                raise ValueError("invalid temperature")
        except ValueError as error:
            rejected.append([row, str(error)])
            continue
        clean.append([row[0], row[1], value])
    print("Retained:", len(clean), "Rejected:", len(rejected))
    assert len(clean) + len(rejected) == len(rows)
    ''',[case('Mixed quality',rows=[['09:00','temperature','22.5'],['09:01','temperature','bad'],['09:02','temperature','0']]),case('Nonfinite / range',rows=[['09:00','temperature','nan'],['09:01','temperature','61']]),case('Malformed row',rows=[['09:00','temperature']])])
lab(14,'stats-project','Project stage 3: group before summarising',[6], 'EX06',
    'Group by sensor so incompatible measurements are not averaged together. Inspect a separate list for each group.', r'''
    grouped = {}
    for timestamp, sensor, value in clean:
        if sensor not in grouped:
            grouped[sensor] = []
        grouped[sensor].append(value)
    stats = {}
    for sensor, values in grouped.items():
        stats[sensor] = [len(values), min(values), max(values), sum(values) / len(values)]
    print(stats)
    ''',[case('Two groups',clean=[['09:00','temperature',20],['09:01','humidity',40],['09:02','temperature',24]]),case('One observation',clean=[['09:00','temperature',0]]),case('No clean rows',clean=[])])
lab(14,'report-project','Project stage 4: write and reopen the outputs',[7,8,9,10], 'EX10',
    'Keep the clean CSV and report separate. Reopen both to verify what was actually saved, including a no-data case.', r'''
    import csv
    with open("clean.csv", "w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["timestamp", "sensor", "value"])
        writer.writerows(clean)
    total = len(clean) + rejected
    rate = 100 * len(clean) / total if total else 0
    report = f"Retained: {len(clean)}; rejected: {rejected}; retained rate: {rate:.1f}%"
    with open("report.txt", "w") as file:
        file.write(report)
    with open("clean.csv") as file:
        saved = list(csv.reader(file))
    with open("report.txt") as file:
        print(file.read())
    assert len(saved) - 1 == len(clean)
    ''',[case('Mixed quality',clean=[['09:00','temperature',22.5],['09:02','temperature',0]],rejected=1),case('All rejected',clean=[],rejected=3),case('No input',clean=[],rejected=0)])
