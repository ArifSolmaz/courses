"""Approved English Predict / Run / Change activities for Week 10."""
import json


def activity(number, title, explanation, predict, code, change, old, new,
             expected, changed_expected):
    return dict(number=str(number), title=title, explanation=explanation,
                predict=predict, code=code.strip() + '\n', change=change,
                old=old, new=new, expected=expected,
                changed_expected=changed_expected, optional=number >= 13)


ACTIVITIES = [
    activity(1, 'Review: calculation inside a function',
        'The function calculates an average and returns it.',
        'What average will the three readings produce?',
        '''def average_reading(a, b, c):
    total = a + b + c
    return total / 3

result = average_reading(20, 24, 22)
print("Average:", result)''',
        'Change the last reading in the call from 22 to 28.',
        'average_reading(20, 24, 22)', 'average_reading(20, 24, 28)',
        'Average: 22.0\n', 'Average: 24.0\n'),
    activity(2, 'Reading a variable defined outside',
        'A function can read a variable defined outside it. A variable defined at this outer level is called a global variable.',
        'Which unit will the function print?',
        '''unit = "C"

def show_unit():
    print("Unit:", unit)

show_unit()''',
        'Change unit = "C" to unit = "F".', 'unit = "C"', 'unit = "F"',
        'Unit: C\n', 'Unit: F\n'),
    activity(3, 'The same name, two separate values',
        'An assignment inside a function normally creates a local variable.',
        'Will the final line print 20 or 30?',
        '''reading = 20

def show_reading():
    reading = 30
    print("Inside:", reading)

show_reading()
print("Outside:", reading)''',
        'Change the inside value from 30 to 40. Check whether the outside value changes.',
        'reading = 30', 'reading = 40',
        'Inside: 30\nOutside: 20\n', 'Inside: 40\nOutside: 20\n'),
    activity(4, 'Changing a local parameter',
        'The function calculates a new number. The original number outside stays unchanged.',
        'What will number and result contain?',
        '''def double(value):
    value = value * 2
    return value

number = 10
result = double(number)
print("Original number:", number)
print("Returned result:", result)''',
        'Change value * 2 to value * 3.', 'value * 2', 'value * 3',
        'Original number: 10\nReturned result: 20\n', 'Original number: 10\nReturned result: 30\n'),
    activity(5, 'Each call starts its own work',
        'The local counter starts again whenever the function is called.',
        'Will the second countdown start at 2 or continue from the first countdown?',
        '''def count_down(start):
    counter = start
    while counter > 0:
        print(counter)
        counter = counter - 1
    print("Go!")

count_down(2)
count_down(2)''',
        'Change only the second call to count_down(3).',
        'count_down(2)\ncount_down(2)', 'count_down(2)\ncount_down(3)',
        '2\n1\nGo!\n2\n1\nGo!\n', '2\n1\nGo!\n3\n2\n1\nGo!\n'),
    activity(6, 'Passing information openly',
        'The function receives the greeting it needs through a parameter. It does not need to look for a greeting stored elsewhere.',
        'Which greeting will appear?',
        '''def make_greeting(greeting, name):
    return greeting + ", " + name + "!"

message = make_greeting("Hello", "Alex")
print(message)''',
        'Change "Hello" in the call to "Welcome".', '"Hello"', '"Welcome"',
        'Hello, Alex!\n', 'Welcome, Alex!\n'),
    activity(7, 'A function can change a shared list',
        'The function receives the existing list. append() changes that list. A local parameter does not automatically create a private copy of a list.',
        'Will the outside list contain the new reading?',
        '''def add_reading(readings):
    readings.append(30)

temperatures = [20, 24]
add_reading(temperatures)
print("Outside list:", temperatures)''',
        'Change append(30) to append(40).', 'append(30)', 'append(40)',
        'Outside list: [20, 24, 30]\n', 'Outside list: [20, 24, 40]\n'),
    activity(8, 'Giving a local name a different list',
        'Assigning a new list to the local name is different from changing the original list.',
        'Will the two printed lists be the same?',
        '''def use_another_list(readings):
    readings = [99]
    print("Inside list:", readings)

temperatures = [20, 24]
use_another_list(temperatures)
print("Outside list:", temperatures)''',
        'Change [99] inside the function to [100].', '[99]', '[100]',
        'Inside list: [99]\nOutside list: [20, 24]\n', 'Inside list: [100]\nOutside list: [20, 24]\n'),
    activity(9, 'Making a copy before changing a list',
        'The function makes a separate list and returns the updated copy. This example uses a flat list of numbers.',
        'Which list will contain 30?',
        '''def add_to_copy(readings):
    updated = readings.copy()
    updated.append(30)
    return updated

temperatures = [20, 24]
new_temperatures = add_to_copy(temperatures)
print("Original:", temperatures)
print("New list:", new_temperatures)''',
        'Change append(30) to append(40).', 'append(30)', 'append(40)',
        'Original: [20, 24]\nNew list: [20, 24, 30]\n', 'Original: [20, 24]\nNew list: [20, 24, 40]\n'),
    activity(10, 'One function, two sensors',
        'Each sensor passes its own calibration settings to the function. Returned forces are in newtons. This teaching model assumes finite inputs, positive gain, and a linear calibration over 0–100 N. None means outside the calibrated range.',
        'Both sensors report 2.5 V. Will their calculated forces be the same?',
        '''def sensor_force(voltage, offset, gain):
    if not offset <= voltage <= offset + 100 / gain:
        return None
    return (voltage - offset) * gain

offset_a = 0.5
offset_b = 1.0
print("Sensor A:", sensor_force(2.5, offset_a, 25))
print("Sensor B:", sensor_force(2.5, offset_b, 25))
print("Sensor A again:", sensor_force(2.5, offset_a, 25))''',
        'Change offset_b from 1.0 to 1.5. Check whether either Sensor A result changes.',
        'offset_b = 1.0', 'offset_b = 1.5',
        'Sensor A: 50.0\nSensor B: 37.5\nSensor A again: 50.0\n',
        'Sensor A: 50.0\nSensor B: 25.0\nSensor A again: 50.0\n'),
    activity(11, 'A function calling another function',
        'One small function can use another small function.',
        'What is the square of 3, plus 1?',
        '''def square(number):
    return number * number

def adjusted_value(number):
    return square(number) + 1

print("Result:", adjusted_value(3))''',
        'Change the input in the final call from 3 to 4.', 'adjusted_value(3)', 'adjusted_value(4)',
        'Result: 10\n', 'Result: 17\n'),
    activity(12, 'A small conversion toolbox',
        'A mini-library is a collection of related functions.',
        'What will 20 C become in Fahrenheit? What will 68 F become in Celsius?',
        '''def c_to_f(celsius):
    return celsius * 9 / 5 + 32

def f_to_c(fahrenheit):
    return (fahrenheit - 32) * 5 / 9

print("Fahrenheit:", c_to_f(20))
print("Celsius:", f_to_c(68))''',
        'Change c_to_f(20) to c_to_f(0). Check which output line changes.',
        'c_to_f(20)', 'c_to_f(0)',
        'Fahrenheit: 68.0\nCelsius: 20.0\n', 'Fahrenheit: 32.0\nCelsius: 20.0\n'),
    activity(13, 'Deliberately changing a global variable',
        'global allows the function to assign a new value to the outside variable. The function changes data outside its own local workspace.',
        'What will the counter contain after two calls?',
        '''counter = 0

def add_one():
    global counter
    counter = counter + 1

add_one()
add_one()
print("Counter:", counter)''',
        'Change the starting counter from 0 to 10.', 'counter = 0', 'counter = 10',
        'Counter: 2\n', 'Counter: 12\n'),
    activity(14, 'Updating through a returned value',
        'The caller can choose to store a returned result.',
        'What will the counter contain?',
        '''def add_one(value):
    return value + 1

counter = 0
counter = add_one(counter)
counter = add_one(counter)
print("Counter:", counter)''',
        'Change only the final update line from counter = add_one(counter) to add_one(counter). The function still calculates a result, but that final call no longer stores it.',
        'counter = add_one(counter)\ncounter = add_one(counter)',
        'counter = add_one(counter)\nadd_one(counter)',
        'Counter: 2\n', 'Counter: 1\n'),
    activity(15, 'A local variable used too early',
        'The assignment inside the function makes value a local name. The earlier print() tries to read it before it has a value. The error-handling syntax is a preview of next week.',
        'Will the function print 10 or the error message?',
        '''value = 10

def show_value():
    try:
        print(value)
        value = 20
    except UnboundLocalError:
        print("Local value was used before assignment.")

show_value()''',
        'Move value = 20 above print(value) inside the try block.',
        '        print(value)\n        value = 20',
        '        value = 20\n        print(value)',
        'Local value was used before assignment.\n', '20\n'),
    activity(16, 'Combining two calculations',
        'Each helper performs one calculation.', 'What is 3² + 4²?',
        '''def square(number):
    return number * number

def add(a, b):
    return a + b

def sum_of_squares(a, b):
    return add(square(a), square(b))

print("Result:", sum_of_squares(3, 4))''',
        'Change the first input in the final call from 3 to 6.',
        'sum_of_squares(3, 4)', 'sum_of_squares(6, 4)',
        'Result: 25\n', 'Result: 52\n'),
    activity(17, 'A small mathematics library',
        'The greatest common divisor is the largest positive integer dividing both inputs. The least common multiple uses that result. Use positive integers for this activity.',
        'What is the greatest common divisor of 12 and 8?',
        '''def gcd(a, b):
    while b != 0:
        a, b = b, a % b
    return a

def lcm(a, b):
    return a * b // gcd(a, b)

print("Greatest common divisor:", gcd(12, 8))
print("Least common multiple:", lcm(12, 8))''',
        'Change the second input in the lcm() call from 8 to 6.', 'lcm(12, 8)', 'lcm(12, 6)',
        'Greatest common divisor: 4\nLeast common multiple: 24\n',
        'Greatest common divisor: 4\nLeast common multiple: 12\n'),
    activity(18, 'A small text library',
        'The palindrome helper uses the cleaning helper before comparing the text with its reverse. This example ignores letter case and ordinary spaces. It keeps punctuation.',
        'Will "Never odd or even" pass the check?',
        '''def clean_text(text):
    return text.lower().replace(" ", "")

def is_palindrome(text):
    cleaned = clean_text(text)
    return cleaned == cleaned[::-1]

print("Cleaned:", clean_text("Never odd or even"))
print("Palindrome:", is_palindrome("Never odd or even"))''',
        'Change the text in the final is_palindrome() call to "Motor ready".',
        'is_palindrome("Never odd or even")', 'is_palindrome("Motor ready")',
        'Cleaned: neveroddoreven\nPalindrome: True\n', 'Cleaned: neveroddoreven\nPalindrome: False\n'),
    activity(19, 'A small statistics library',
        'The median helper sorts a copy, keeping the original list unchanged. Keep at least one number in the list.',
        'What are the mean and median of these readings?',
        '''def mean(numbers):
    return sum(numbers) / len(numbers)

def median(numbers):
    ordered = sorted(numbers)
    middle = len(ordered) // 2
    if len(ordered) % 2 == 1:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2

readings = [20, 30, 22]
print("Mean:", mean(readings))
print("Median:", median(readings))
print("Original:", readings)''',
        'Change 30 in the list to 60. Which statistic changes?', '[20, 30, 22]', '[20, 60, 22]',
        'Mean: 24.0\nMedian: 22\nOriginal: [20, 30, 22]\n',
        'Mean: 34.0\nMedian: 22\nOriginal: [20, 60, 22]\n'),
    activity(20, 'A small geometry library',
        'The functions share a clearly named constant. Use non-negative dimensions in the same unit. Areas use the corresponding square unit.',
        'What is the area of the rectangle?',
        '''PI = 3.14159

def circle_area(radius):
    return PI * radius * radius

def rectangle_area(width, height):
    return width * height

def triangle_area(base, height):
    return base * height / 2

print(f"Circle: {circle_area(5):.2f}")
print("Rectangle:", rectangle_area(4, 6))
print("Triangle:", triangle_area(3, 8))''',
        'Change the rectangle width in its call from 4 to 5.', 'rectangle_area(4, 6)', 'rectangle_area(5, 6)',
        'Circle: 78.54\nRectangle: 24\nTriangle: 12.0\n',
        'Circle: 78.54\nRectangle: 30\nTriangle: 12.0\n'),
    activity(21, 'Moving a calculation into a function',
        'Both versions perform the same calculation. Moving it into a function lets us reuse it. This classroom rule gives a 10% discount only when the price is strictly above 200.',
        'Will the two prices be equal?',
        '''price = 250
if price > 200:
    inline_result = price * 0.9
else:
    inline_result = price

def discounted_price(price):
    if price > 200:
        return price * 0.9
    return price

print("Inline calculation:", inline_result)
print("Function calculation:", discounted_price(price))''',
        'Change the starting price from 250 to 200.', 'price = 250', 'price = 200',
        'Inline calculation: 225.0\nFunction calculation: 225.0\n',
        'Inline calculation: 200\nFunction calculation: 200\n'),
    activity(22, 'Collecting validation messages',
        'Each check is a small function. The final function collects problems. Use an ordinary numeric age and a string ID. IDs must contain exactly ten digits from 0 to 9.',
        'Will the starting record produce an empty list of errors?',
        '''def valid_age(age):
    return 0 <= age <= 150

def valid_id(student_id):
    return (
        len(student_id) == 10
        and all(character in "0123456789" for character in student_id)
    )

def check_record(age, student_id):
    errors = []
    if not valid_age(age):
        errors.append("Invalid age")
    if not valid_id(student_id):
        errors.append("Invalid ID")
    return errors

print("Errors:", check_record(21, "0123456789"))''',
        'Change the age in the final call from 21 to -2.',
        'check_record(21, "0123456789")', 'check_record(-2, "0123456789")',
        'Errors: []\n', "Errors: ['Invalid age']\n"),
    activity(23, 'A sequence of small steps',
        'The program adds an adjustment and then keeps the result within a chosen range. This is a demonstration of an adjustment rule. The range is deliberately limited to 0–100.',
        'Will the final value be 105 or 100?',
        '''def add_adjustment(value, adjustment):
    return value + adjustment

def clamp(value, lower, upper):
    return max(lower, min(value, upper))

def process_value(value, adjustment):
    updated = add_adjustment(value, adjustment)
    return clamp(updated, 0, 100)

print("Result:", process_value(95, 10))''',
        'Change the adjustment in the final call from 10 to 2.', 'process_value(95, 10)', 'process_value(95, 2)',
        'Result: 100\n', 'Result: 97\n'),
    activity(24, 'Building a short grade report',
        'One helper calculates a score. Another uses it to build the report. The calculation uses 50% midterm and 50% final. Use scores from 0 to 100.',
        'What score will Alex receive?',
        '''def course_score(midterm, final):
    return 0.5 * midterm + 0.5 * final

def student_report(name, midterm, final):
    score = course_score(midterm, final)
    return f"{name}: {score:.1f}"

print(student_report("Alex", 60, 80))
print(student_report("Sam", 80, 90))''',
        'Change Alex\'s final-exam score from 80 to 100.',
        'student_report("Alex", 60, 80)', 'student_report("Alex", 60, 100)',
        'Alex: 70.0\nSam: 85.0\n', 'Alex: 80.0\nSam: 85.0\n'),
    activity(25, 'Combining physics calculations',
        'This model describes a cart starting from rest and accelerating constantly in a straight line, with no reversal. Use finite inputs, non-negative mass and distance, and positive time. The reported force is the net force along the motion.',
        'If the cart covers 100 m in 5 s, is its average speed equal to its final speed?',
        '''def average_speed(distance, time):
    return distance / time

def final_speed_from_rest(distance, time):
    return 2 * average_speed(distance, time)

def net_force(mass, acceleration):
    return mass * acceleration

def motion_report(mass, distance, time):
    average = average_speed(distance, time)
    final = final_speed_from_rest(distance, time)
    acceleration = final / time
    force = net_force(mass, acceleration)
    print("Average speed:", average, "m/s")
    print("Final speed:", final, "m/s")
    print("Acceleration:", acceleration, "m/s²")
    print("Net force:", force, "N")

motion_report(10, 100, 5)''',
        'Change the mass in the final call from 10 to 20. Which result changes?',
        'motion_report(10, 100, 5)', 'motion_report(20, 100, 5)',
        'Average speed: 20.0 m/s\nFinal speed: 40.0 m/s\nAcceleration: 8.0 m/s²\nNet force: 80.0 N\n',
        'Average speed: 20.0 m/s\nFinal speed: 40.0 m/s\nAcceleration: 8.0 m/s²\nNet force: 160.0 N\n'),
    activity(26, 'A text-analysis toolbox',
        'Two small helpers contribute to one summary. This counts punctuation marks; it does not interpret sentence meaning.',
        'How many words and question marks will be reported?',
        '''def count_words(text):
    return len(text.split())

def count_questions(text):
    return text.count("?")

def text_report(text):
    print("Words:", count_words(text))
    print("Question marks:", count_questions(text))

text_report("Motor ready? Sensor ready?")''',
        'Change the supplied text to "Motor ready. Sensor ready?".',
        'Motor ready? Sensor ready?', 'Motor ready. Sensor ready?',
        'Words: 4\nQuestion marks: 2\n', 'Words: 4\nQuestion marks: 1\n'),
    activity(27, 'A sensor report using settings',
        'Each sensor has its own settings dictionary. The report reads those settings without changing them. As in Example 10, assume finite inputs, positive gain, and a linear calibration over 0–100 N.',
        'Will the two Sensor A reports agree?',
        '''def sensor_force(voltage, offset, gain):
    if not offset <= voltage <= offset + 100 / gain:
        return None
    return (voltage - offset) * gain

def sensor_report(name, voltage, settings):
    force = sensor_force(
        voltage,
        settings["offset"],
        settings["gain"]
    )
    if force is None:
        return name + ": outside calibrated range"
    return f"{name}: {force:.1f} N"

sensor_a = {"offset": 0.5, "gain": 25}
sensor_b = {"offset": 1.0, "gain": 25}
print(sensor_report("A", 2.5, sensor_a))
print(sensor_report("B", 2.5, sensor_b))
print(sensor_report("A", 2.5, sensor_a))''',
        'Change Sensor B\'s offset from 1.0 to 1.5. Check whether Sensor A\'s results change.',
        'sensor_b = {"offset": 1.0, "gain": 25}', 'sensor_b = {"offset": 1.5, "gain": 25}',
        'A: 50.0 N\nB: 37.5 N\nA: 50.0 N\n', 'A: 50.0 N\nB: 25.0 N\nA: 50.0 N\n'),
    activity(28, 'Preview of next week: handling an error',
        'Dividing distance by zero time cannot produce a valid speed. The program catches that error and prints a message. Catching an error does not turn an undefined calculation into a valid measurement.',
        'Will the program print a speed or the error message?',
        '''def average_speed(distance, time):
    return distance / time

try:
    speed = average_speed(100, 0)
    print("Average speed:", speed, "m/s")
except ZeroDivisionError:
    print("Cannot calculate speed with zero time.")''',
        'Change the time in the function call from 0 to 5.', 'average_speed(100, 0)', 'average_speed(100, 5)',
        'Cannot calculate speed with zero time.\n', 'Average speed: 20.0 m/s\n'),
]


def prepare(root):
    """Create the standalone guided edition without rewriting Colab notebooks."""
    nb = json.loads((root / 'notebooks/Week_10.ipynb').read_text())
    nb['cells'] = []
    nb['metadata']['cp1'] = {'week': 10, 'kind': 'lesson',
                             'offline_activities': len(ACTIVITIES),
                             'main_activities': 12, 'format': 'predict-run-change'}
    nb['metadata']['cp1_offline_week'] = 10

    def markdown(source, **metadata):
        nb['cells'].append(dict(cell_type='markdown', metadata=metadata,
                                source=source.splitlines(keepends=True)))

    markdown('''# Week 10: Scope and Small Function Libraries

Computer Programming I · Dr. Arif Solmaz

**Your goal:** Understand which values a function uses, notice whether it changes existing data,
and use a few small functions together.
You do not need to write a new program from scratch.

Use the same three steps for every example:

1. **Predict:** Say what you think will happen before running the code.
2. **Run:** Press Run on the supplied code and compare the result with your prediction.
3. **Change one thing:** Make the requested change, predict again, and rerun the same cell.

Each example includes its own data and function definitions and runs independently. Use **Undo last change** to
step back one edit in that cell. Use **Restore original code** to return to the starting
example. These buttons change the code only; press Run again to update the output.
You can also undo a restore. Ctrl/Cmd+Z works in the code editor.

Examples 1–12 are the main activities. Examples 13–28 are optional.
You do not need to complete every example in one lesson.
''', offline_anchor='overview')
    markdown('''## Main activities

Start here. Talk to a partner if your prediction differs from the result.
''', offline_anchor='main-activities')
    for item in ACTIVITIES:
        if item['number'] == '13':
            markdown('''## Optional activities

These activities combine ideas or introduce an additional technique.
Your teacher may choose one or two. You do not need to complete them all.
''', offline_anchor='optional-activities')
        tag = dict(number=item['number'], optional=item['optional'])
        prefix = 'Optional example' if item['optional'] else 'Example'
        markdown(f"## {prefix} {item['number']}: {item['title']}\n\n"
                 f"{item['explanation']}\n\n"
                 f"### Predict\n\n{item['predict']}\n\n"
                 '### Run\n\nPress **Run** on the code cell below. Compare the output with your prediction.\n',
                 offline_anchor='example-' + item['number'],
                 cp1_activity={**tag, 'step': 'predict-run'})
        nb['cells'].append(dict(cell_type='code', execution_count=None,
            metadata={'cp1_activity': {**tag, 'step': 'code'}}, outputs=[],
            source=item['code'].splitlines(keepends=True)))
        markdown('### Change one thing\n\n' + item['change'] +
                 '\n\nPredict the new result, then press **Run** on the same code cell again. '
                 'What changed in the result?\n',
                 cp1_activity={**tag, 'step': 'change'})
    markdown('''## Before you finish

Choose one main example. Tell a partner what you changed and what happened to the output.
Save your notebook to keep your edited code and results.

### Teacher guidance

Pause for a prediction, run the code, and ask for the single change.
Finish with: **What changed in the result?** Short spoken answers are enough.
Ask: **Did the function only calculate a result, or did it also change something outside?**
Give most classroom time to local variables, shared lists, explicit inputs, and using
two small functions together. Keep longer libraries and reports optional.

### Participation and assessment

These activities are ungraded practice. No weekly submission is required.
Assessment remains the midterm exam (50%) and final exam (50%).
''', offline_anchor='finish')
    for index, cell in enumerate(nb['cells']):
        cell['id'] = f'w10-guided-{index:03d}'
    from guided_support import attach_guidance
    attach_guidance(nb, ACTIVITIES)
    from practice_support import restore_practice
    return restore_practice(nb, root, 10)
