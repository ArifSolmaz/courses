"""Small reversible edits for Weeks 1–5, with all original practice and checks intact."""
import ast
from guided_support import line_help

# Original lesson cell index -> exact edit and an English prediction prompt.
LESSON = {
1: {
12: ('Hello, World!', 'Hello, Python!', 'Change the greeting. Predict the new message.'),
16: ('print(42)', 'print(84)', 'Double the displayed integer from 42 to 84.'),
20: ('sep=", "', 'sep=" | "', 'Use a vertical bar between the names in the second line.'),
24: ('end=" "', 'end=" - "', 'Put a dash between Hello and World in the joined message.'),
28: (r'First line\nSecond line', r'First line\tSecond line', 'Replace the first line break with a tab. Predict which text will share a line.'),
32: ('Dear Mehmet,', 'Dear students,', 'Address the message to students instead of Mehmet.'),
39: ('width = 5', 'width = 7', 'Increase the rectangle width from 5 to 7. Predict its area.'),
43: ('Comments help us write better code!', 'Comments explain our code!', 'Change only the printed message. The comments still do not run.'),
48: ('age = 19', 'age = 20', 'Change the age from 19 to 20. Predict which line changes.'),
53: ('first = "Mehmet"', 'first = "Deniz"', 'Change the first name before the swap. Predict the two name orders.'),
57: ('score = 92', 'score = 100', 'Change the updated score to 100. The starting score stays 85.'),
66: ('print(type(42))', 'print(type(42.0))', 'Use 42.0 instead of 42. Predict its Python type.'),
70: ('print(type(5))', 'print(type("5"))', 'Put quotes around 5 in the first line. Predict the type.'),
77: ('print("5 + 3 =", 5 + 3)', 'print("5 + 4 =", 5 + 4)', 'Add 4 instead of 3 in the first calculation.'),
81: ('result1 = 2 + 3 * 4\nprint("2 + 3 * 4 =", result1)', 'result1 = (2 + 3) * 4\nprint("(2 + 3) * 4 =", result1)', 'Group 2 + 3 before multiplying. The printed label follows the expression.'),
85: ('speed = 60', 'speed = 80', 'Increase the speed to 80 km/h. Predict the travelled distance.'),
94: ('student_name = "Ali"', 'student_name = "Deniz"', 'Change the stored student name while keeping its variable spelling.'),
156: ('{score:.1f}', '{score:.2f}', 'Show the score with two decimal places instead of one.'),
},
2: {
10: ('is_student = True', 'is_student = False', 'Change the student flag to False. Predict its value and type.'),
15: ('print("10 / 3 =", 10 / 3)', 'print("10 / 4 =", 10 / 4)', 'Divide 10 by 4 in the first calculation.'),
19: ('number = 17', 'number = 18', 'Start with 18 instead of 17. Predict the first remainder.'),
26: ('ali_score = 85', 'ali_score = 95', 'Raise Ali\'s score to 95. Predict the comparison with Ayse.'),
30: ('age = 20', 'age = 17', 'Try age 17 in the chained comparison.'),
34: ('score = 100', 'score = 90', 'Start the sequence of updates from 90 instead of 100.'),
37: ('balance = 5000', 'balance = 6000', 'Start with a balance of 6000. Predict the final balance.'),
44: ('t = 3', 't = 4', 'Use a time of 4 seconds in the final-velocity calculation.'),
48: ('print(int(3.7))', 'print(int(8.7))', 'Convert 8.7 to an integer in the first line.'),
52: ('print(int("42"))       # 42', 'print(int("84"))       # 84', 'Convert the integer text 84 instead of 42.'),
57: ('print(bool(0))', 'print(bool(2))', 'Test bool(2) instead of bool(0) in the first line.'),
67: ('In 5 years you will be {age + 5}', 'In 10 years you will be {age + 10}', 'Predict the age ten years ahead instead of five. Keep the supplied input.'),
70: ('{bmi:.2f}', '{bmi:.1f}', 'Display the calculated BMI with one decimal place.'),
74: ('width = 12', 'width = 15', 'Increase the rectangle width to 15. Predict the reported area.'),
78: ('{voltage:.1f}', '{voltage:.2f}', 'Display voltage with two decimal places.'),
84: ('success_rate = 0.856', 'success_rate = 0.926', 'Use a success rate of 0.926. Predict its percentage display.'),
88: ('line = "=" * 40', 'line = "=" * 20', 'Make both report-border lines half as long.'),
92: ('text = "Python"', 'text = "Coding"', 'Try Coding as the text. Predict the indexed characters.'),
96: ('"Python", "engineers"', '"Python", "students"', 'Replace Python with students in the derived string.'),
145: ('temperature = 35', 'temperature = 15', 'Try 15 C and predict which weather branch will run.'),
},
3: {
10: ('age = 19', 'age = 20', 'Change the age to 20. Predict the age next year.'),
15: ('y = 7', 'y = 10', 'Make y equal to x. Predict the equality and ordering results.'),
18: ('is_student = True', 'is_student = False', 'Change the student flag to False.'),
21: ('name1 = "Ahmet"', 'name1 = "ahmet"', 'Use the same lowercase spelling for both names.'),
28: ('temperature = 35', 'temperature = 25', 'Lower the temperature to 25. Predict which messages disappear.'),
31: ('temperature = 20', 'temperature = 35', 'Raise the temperature to 35. Predict which messages appear.'),
34: ('score = 85', 'score = 55', 'Make the first score 55. Predict the first pass/fail check.'),
39: ('number = 17', 'number = 18', 'Use 18 instead of 17. Predict even or odd.'),
42: ('score = 55', 'score = 65', 'Raise the score to 65. Predict PASS or FAIL.'),
45: ('x = -15', 'x = 15', 'Try positive 15. Predict the absolute value and branch.'),
52: ('score = 78', 'score = 88', 'Try a score of 88. Predict the selected grade.'),
55: ('score = 95', 'score = 75', 'Compare both branch orders using score 75.'),
58: ('temp = 22', 'temp = 5', 'Try 5 C. Predict the temperature description.'),
62: ('has_license = True', 'has_license = False', 'Remove the licence flag while keeping the age 20.'),
65: ('day = "Saturday"', 'day = "Monday"', 'Try Monday. Predict the weekday/weekend branch.'),
68: ('is_raining = False', 'is_raining = True', 'Turn the rain flag on. Predict the suggested activity.'),
72: ('x = 0', 'x = 2', 'Try x equal to 2. Predict whether the division is evaluated and the condition is met.'),
80: ('score = 85', 'score = 105', 'Try score 105 in the validity check.'),
84: ('is_student = True', 'is_student = False', 'Keep age 15 but turn off the student flag. Predict the ticket price.'),
87: ('is_student = True', 'is_student = False', 'Keep age 15 but turn off the student flag in the flat branch version.'),
91: ('age = 25', 'age = 160', 'Try age 160. Predict the validation message.'),
94: ('user_input = "42"', 'user_input = "4.2"', 'Try decimal text in the non-negative integer check.'),
98: ('name = "Murat"', 'name = ""', 'Try an empty name in the first check.'),
107: ('score = 95', 'score = 92', 'Compare the branch orders using score 92.'),
115: ('score = 85', 'score = 65', 'Try score 65 and compare separate if statements with an exclusive category.'),
},
4: {
10: ('print(10)', 'print(11)', 'Change the final displayed number to 11.'),
14: ('range(1, 11)', 'range(1, 6)', 'Stop after 5 instead of 10. Remember that the range stop is excluded.'),
19: ('"Omer"]', '"Omer", "Ada"]', 'Add Ada to the names. Predict how many greetings will print.'),
22: ('"blue"]', '"blue", "yellow"]', 'Add yellow to the colour list. Predict the final loop value.'),
25: ('numbers = [3, 7, 2, 9, 5]', 'numbers = [4, 7, 2, 9, 5]', 'Change the first input number to 4. Predict its double and square.'),
45: ('name = "Python"', 'name = "Coding"', 'Loop through Coding instead of Python.'),
48: ('name = "Abdulkadir"', 'name = "Deniz"', 'Count the English vowels in Deniz.'),
51: ('message = "hello world"', 'message = "hello class"', 'Convert hello class to uppercase.'),
58: ('range(1, 11)', 'range(1, 6)', 'Accumulate 1 through 5 instead of 1 through 10.'),
62: ('score >= 60', 'score >= 70', 'Raise the pass threshold to 70. Predict the count and pass rate.'),
65: ('n = 5', 'n = 4', 'Calculate 4 factorial instead of 5 factorial.'),
70: ('range(1, 21)', 'range(1, 11)', 'Search for even numbers from 1 through 10.'),
73: ('numbers = [4, -3, 7, -1, 8, -5, 2]', 'numbers = [4, 3, 7, -1, 8, -5, 2]', 'Turn the first negative reading into positive 3. Predict the positive total.'),
76: ('grades = [72, 85, 91, 68, 45, 93, 78]', 'grades = [72, 85, 91, 68, 45, 99, 78]', 'Raise the highest input grade from 93 to 99.'),
83: ('for i in range(1, 4):', 'for i in range(1, 3):', 'Run two outer-loop iterations instead of three. Keep three inner iterations.'),
90: ('rows = 5', 'rows = 3', 'Draw a triangle with three rows instead of five.'),
93: ('rows = 5', 'rows = 3', 'Use three rows for the inverted-triangle demonstrations.'),
104: ('scores = [85, 92, 78, 95, 88, 76, 90]', 'scores = [100, 92, 78, 95, 88, 76, 90]', 'Raise the first score to 100. Predict the average.'),
161: ('start = 10', 'start = 5', 'Start the countdown at 5 instead of 10.'),
},
5: {
10: ('range(1, 6)', 'range(1, 4)', 'Print 1 through 3 instead of 1 through 5.'),
13: ('range(1, 11)', 'range(1, 6)', 'Add 1 through 5 instead of 1 through 10.'),
18: ('count <= 5', 'count <= 3', 'Stop the while loop after printing 3. Predict the final count.'),
21: ('while i <= 5:', 'while i <= 3:', 'Shorten only the while-loop version to three iterations.'),
29: ('countdown = 10', 'countdown = 5', 'Start the countdown at 5.'),
38: ('power < 1000', 'power < 100', 'Stop printing powers of two once the next power reaches 100.'),
46: ('while x <= 5:', 'while x <= 3:', 'Stop this safe loop after three iterations.'),
53: ('number = 50', 'number = 60', 'Start searching at 60. Predict the first multiple of 7 found.'),
59: ('numbers = [3, 7, 11, 4, 9, 2, 8]', 'numbers = [3, 7, 11, 6, 9, 2, 8]', 'Replace the first even input 4 with 6.'),
64: ('i % 2 != 0', 'i % 2 == 0', 'Skip even numbers instead of odd numbers.'),
67: ('i % 3 == 0', 'i % 4 == 0', 'Skip multiples of 4 instead of multiples of 3.'),
96: ('simulated_inputs = [5, 12, 8, 3, 0]', 'simulated_inputs = [10, 12, 8, 3, 0]', 'Change the first simulated input to 10. Keep the stopping zero.'),
}}


ANSWER = {3: {
27: ('price = 30\n    print(f"Age: {age} -> Ticket price: {price} TL")', 'price = 30\n    print(f"Result: age {age} -> Ticket price: {price} TL")', 'Add a Result: label to the child-ticket branch. The price and its checks stay the same.'),
51: ('{soc:.1f}', '{soc:.2f}', 'Display the battery percentage with two decimal places. The computed value stays the same.'),
69: ('{result:.4f}', '{result:.3f}', 'Display the calculator result with three decimal places instead of four.'),
}}


def display_change(source):
    """Give worked answers a display-only edit, preserving their numeric checks."""
    tree=ast.parse(source)
    direct={id(n.value) for n in tree.body if isinstance(n,ast.Expr)}
    for node in sorted(ast.walk(tree),key=lambda n:(id(n) not in direct,getattr(n,'lineno',0))):
        if not isinstance(node,ast.Call) or not isinstance(node.func,ast.Name) or node.func.id!='print' or not node.args:
            continue
        old=ast.get_source_segment(source,node)
        if not old or not old.startswith('print(') or source.count(old)!=1:continue
        return old,old.replace('print(', 'print("Result:", ',1),'Add a Result: label to this printed line. The calculation and its checks stay the same.'
    return None


def attach_early_changes(nb,week,lesson_count):
    for i,cell in enumerate(nb['cells']):
        if cell['cell_type']!='code':continue
        source=''.join(cell['source'])
        if source.startswith(('_checkpoint_results','checkpoint_','practiced_exercises')):continue
        item=LESSON[week].get(i) if i<lesson_count else ANSWER.get(week,{}).get(i-lesson_count)
        if item is None:
            item=display_change(source)
        if item is None:continue  # Blank exercises, assertion cells and commented error examples stay intact.
        old,new,instruction=item
        assert source.count(old)==1,(week,i,old)
        changed=source.replace(old,new,1);ast.parse(changed)
        help=line_help(changed)
        original_help=nb['cells'][i+1]['metadata']['cp1_line_walkthrough']
        if original_help.get('comment_help'):
            help['comment_help']=dict(original_help['comment_help'])
        for n,(before,after) in enumerate(zip(source.splitlines(),changed.splitlines()),1):
            if before!=after and str(n) in help['line_focus']:
                help['line_focus'][str(n)]='Suggested change: '+instruction+' '+help['line_focus'][str(n)]
        assert len(source.splitlines())==len(changed.splitlines()),(week,i,'Keep line numbering stable')
        cell['metadata']['cp1_guided_change']={'old':old,'new':new,'source':changed,'help':help,'instruction':instruction,'prerequisites':'Run earlier setup cells in this section first if needed. After comparing, restore the original code and Run it again before continuing.'}
    nb['cells'][0]['source'].append('\n**Change one thing:** Predict the new result, use **Apply suggested change**, then Run. The preview shows the exact edit. Undo and Restore are available; restore and Run again before continuing to a later dependent example. Exercises and worked answers remain below.\n')
