"""Approved English Predict / Run / Change activities for Week 9."""
import json


def activity(number, title, explanation, predict, code, change, old, new,
             expected, changed_expected):
    return dict(number=str(number), title=title, explanation=explanation,
                predict=predict, code=code.strip() + '\n', change=change,
                old=old, new=new, expected=expected,
                changed_expected=changed_expected, optional=number >= 13)


ACTIVITIES = [
    activity(1, 'Define once, use twice',
        'def gives a name to a block of code. The indented code runs when we call the function.',
        'How many times will the message appear?',
        '''def show_message():
    print("Motor ready.")

show_message()
show_message()''',
        'Remove the second show_message() call. Keep the function definition.',
        'show_message()\nshow_message()', 'show_message()',
        'Motor ready.\nMotor ready.\n', 'Motor ready.\n'),
    activity(2, 'Giving a function a sensor name',
        'The function receives a name and uses it in its message.',
        'Which sensor name will appear?',
        '''def show_sensor(name):
    print("Selected sensor:", name)

show_sensor("T1")''',
        'Change "T1" to "T2" in the function call.', '"T1"', '"T2"',
        'Selected sensor: T1\n', 'Selected sensor: T2\n'),
    activity(3, 'A function that returns a number',
        'return sends a result back to the code that called the function.',
        'What number will be stored in answer?',
        '''def double(number):
    return number * 2

answer = double(5)
print("Answer:", answer)''',
        'Change double(5) to double(8).', 'double(5)', 'double(8)',
        'Answer: 10\n', 'Answer: 16\n'),
    activity(4, 'Using the returned result',
        'A returned number can be used in another calculation.',
        'What will the final result be?',
        '''def double(number):
    return number * 2

answer = double(5)
final_result = answer + 3
print("Returned number:", answer)
print("Final result:", final_result)''',
        'Change answer + 3 to answer + 10.', 'answer + 3', 'answer + 10',
        'Returned number: 10\nFinal result: 13\n', 'Returned number: 10\nFinal result: 20\n'),
    activity(5, 'Two inputs: rectangle area',
        'The function receives a width and a height. Both dimensions use the same unit.',
        'What is the area of a rectangle that is 5 cm wide and 3 cm high?',
        '''def rectangle_area(width, height):
    return width * height

area = rectangle_area(5, 3)
print("Area:", area, "square cm")''',
        'Change the width in the call from 5 to 10. Keep the height at 3.',
        'rectangle_area(5, 3)', 'rectangle_area(10, 3)',
        'Area: 15 square cm\n', 'Area: 30 square cm\n'),
    activity(6, 'Input order matters',
        'The first argument becomes a. The second becomes b.',
        'Will these two calls return the same result?',
        '''def subtract(a, b):
    return a - b

print("First result:", subtract(10, 3))
print("Second result:", subtract(3, 10))''',
        'Change the second call to subtract(10, 3).', 'subtract(3, 10)', 'subtract(10, 3)',
        'First result: 7\nSecond result: -7\n', 'First result: 7\nSecond result: 7\n'),
    activity(7, 'Naming the inputs',
        'Keyword arguments identify inputs by name. The argument names show which dimension each number represents.',
        'What area will this call return?',
        '''def rectangle_area(width, height):
    return width * height

area = rectangle_area(height=3, width=5)
print("Area:", area)''',
        'Change width=5 to width=8.', 'width=5', 'width=8',
        'Area: 15\n', 'Area: 24\n'),
    activity(8, 'A default input',
        'A default is used when the caller leaves that argument out.',
        'Which unit will appear on each line?',
        '''def show_reading(value, unit="C"):
    print("Reading:", value, unit)

show_reading(24)
show_reading(75, "F")''',
        'Change the default unit in the definition from "C" to "degrees C". Check which output line changes.',
        'unit="C"', 'unit="degrees C"',
        'Reading: 24 C\nReading: 75 F\n', 'Reading: 24 degrees C\nReading: 75 F\n'),
    activity(9, 'Returning text',
        'A function can return text as well as numbers.',
        'What text will be stored in message?',
        '''def greet(name):
    return "Hello, " + name + "!"

message = greet("Alex")
print(message)''',
        'Change "Alex" to "Sam" in the call.', '"Alex"', '"Sam"',
        'Hello, Alex!\n', 'Hello, Sam!\n'),
    activity(10, 'Printing and returning are different',
        'print() displays something. return gives a value back to the caller. A function that finishes without returning a value gives back None.',
        'Will first_result and second_result contain the same value?',
        '''def double_print(number):
    print(number * 2)

def double_return(number):
    return number * 2

first_result = double_print(5)
second_result = double_return(5)
print("First result:", first_result)
print("Second result:", second_result)''',
        'Change print(number * 2) inside the first function to return number * 2.',
        'print(number * 2)', 'return number * 2',
        '10\nFirst result: None\nSecond result: 10\n', 'First result: 10\nSecond result: 10\n'),
    activity(11, 'Converting temperature',
        'The function converts Celsius to Fahrenheit.',
        'What Fahrenheit temperature corresponds to 20 C?',
        '''def celsius_to_fahrenheit(celsius):
    return celsius * 9 / 5 + 32

fahrenheit = celsius_to_fahrenheit(20)
print("Temperature:", fahrenheit, "F")''',
        'Change the input from 20 to 0.', 'celsius_to_fahrenheit(20)', 'celsius_to_fahrenheit(0)',
        'Temperature: 68.0 F\n', 'Temperature: 32.0 F\n'),
    activity(12, 'Calculating a circle\'s area',
        'The function performs the calculation. The print() line controls how the result looks. Use a non-negative radius for this activity.',
        'If the radius doubles, will the area double or become four times larger?',
        '''def circle_area(radius):
    return 3.14159 * radius * radius

area = circle_area(5)
print(f"Area: {area:.2f}")''',
        'Change the radius in the call from 5 to 10.', 'circle_area(5)', 'circle_area(10)',
        'Area: 78.54\n', 'Area: 314.16\n'),
    activity(13, 'Converting a sensor voltage into force',
        'For this teaching sensor, 0.5 V means 0 N and 4.5 V means 100 N. We assume a linear response between those points. A reading outside the calibrated range is not reported as zero force. Use finite numeric inputs in this activity.',
        'What force corresponds to 2.5 V?',
        '''def voltage_to_force(voltage):
    if voltage < 0.5 or voltage > 4.5:
        return None
    return (voltage - 0.5) * 25

force = voltage_to_force(2.5)
if force is None:
    print("Outside calibrated range.")
else:
    print("Force:", force, "N")''',
        'Change the input voltage from 2.5 to 5.0.', 'voltage_to_force(2.5)', 'voltage_to_force(5.0)',
        'Force: 50.0 N\n', 'Outside calibrated range.\n'),
    activity(14, 'Estimating wheel travel',
        'One wheel rotation travels approximately one circumference. Assume a positive diameter, non-negative rotations, and rolling without slipping.',
        'If the number of rotations doubles, what happens to the estimated distance?',
        '''def wheel_distance(rotations, diameter_mm):
    distance = rotations * 3.14159 * diameter_mm / 1000
    return round(distance, 2)

distance = wheel_distance(100, 65)
print("Distance:", distance, "m")''',
        'Change the number of rotations from 100 to 200.', 'wheel_distance(100, 65)', 'wheel_distance(200, 65)',
        'Distance: 20.42 m\n', 'Distance: 40.84 m\n'),
    activity(15, 'Returning the larger reading',
        'A function can choose its result using a condition.',
        'Which reading will the function return?',
        '''def larger_reading(first, second):
    if first >= second:
        return first
    return second

print("Larger reading:", larger_reading(24, 28))''',
        'Change the first reading in the call from 24 to 30.', 'larger_reading(24, 28)', 'larger_reading(30, 28)',
        'Larger reading: 28\n', 'Larger reading: 30\n'),
    activity(16, 'Returning True or False',
        'An even integer has no remainder when divided by two. % gives the remainder. Use an integer input.',
        'Will the result be True or False?',
        '''def is_even(number):
    return number % 2 == 0

print("Even:", is_even(8))''',
        'Change the input from 8 to 9.', 'is_even(8)', 'is_even(9)',
        'Even: True\n', 'Even: False\n'),
    activity(17, 'Returning two results',
        'The function returns the lowest and highest readings together. Keep at least one reading in the list.',
        'What will be stored in lowest and highest?',
        '''def reading_range(readings):
    return min(readings), max(readings)

temperatures = [20, 24, 22]
lowest, highest = reading_range(temperatures)
print("Lowest:", lowest)
print("Highest:", highest)''',
        'Change 24 to 30 inside the list.', '[20, 24, 22]', '[20, 30, 22]',
        'Lowest: 20\nHighest: 24\n', 'Lowest: 20\nHighest: 30\n'),
    activity(18, 'An average with a missing-data check',
        'An empty list has no average. This function returns None when there are no readings. Missing data is different from a measured average of zero.',
        'What average will the starting list produce?',
        '''def average(readings):
    if not readings:
        return None
    return sum(readings) / len(readings)

result = average([20, 24, 22])
if result is None:
    print("No readings available.")
else:
    print("Average:", result)''',
        'Replace [20, 24, 22] in the call with [].', '[20, 24, 22]', '[]',
        'Average: 22.0\n', 'No readings available.\n'),
    activity(19, 'Multiplying inside a function',
        'Factorial means multiplying the integers from 1 up to the input number. Use a non-negative integer. For input 0, the loop makes no changes and the result remains 1.',
        'What is 1 × 2 × 3 × 4?',
        '''def factorial(number):
    result = 1
    for factor in range(1, number + 1):
        result = result * factor
    return result

print("Factorial:", factorial(4))''',
        'Change the input from 4 to 5.', 'factorial(4)', 'factorial(5)',
        'Factorial: 24\n', 'Factorial: 120\n'),
    activity(20, 'Checking a prime number',
        'A prime number is greater than 1 and has no positive divisors other than 1 and itself. Use an integer input.',
        'Will 7 pass the check?',
        '''def is_prime(number):
    if number < 2:
        return False
    for divisor in range(2, number):
        if number % divisor == 0:
            return False
    return True

print("Prime:", is_prime(7))''',
        'Change the input from 7 to 9.', 'is_prime(7)', 'is_prime(9)',
        'Prime: True\n', 'Prime: False\n'),
    activity(21, 'Repeated multiplication',
        'The function multiplies by the base once for each repetition. Use a non-negative integer exponent.',
        'What is 2 × 2 × 2?',
        '''def power(base, exponent):
    result = 1
    for repetition in range(exponent):
        result = result * base
    return result

print("Result:", power(2, 3))''',
        'Change the exponent in the call from 3 to 4.', 'power(2, 3)', 'power(2, 4)',
        'Result: 8\n', 'Result: 16\n'),
    activity(22, 'Reusing last week\'s vowel counter',
        'The counting steps now belong to a function. This activity counts the five English vowels a, e, i, o, and u.',
        'How many vowels are in "Motor"?',
        '''def count_vowels(text):
    count = 0
    for character in text:
        if character.lower() in "aeiou":
            count = count + 1
    return count

print("Vowels:", count_vowels("Motor"))''',
        'Change "Motor" to "Temperature".', '"Motor"', '"Temperature"',
        'Vowels: 2\n', 'Vowels: 5\n'),
    activity(23, 'Calculating dynamic pressure',
        'For this calculation, density is in kg/m³ and velocity is in m/s. The result is in pascals. Use finite numeric inputs. This calculates dynamic pressure, not pipe pressure loss.',
        'If velocity doubles, will pressure double or become four times larger?',
        '''def dynamic_pressure(density, velocity):
    if density < 0:
        return None
    return 0.5 * density * velocity ** 2

pressure = dynamic_pressure(1.225, 10)
if pressure is None:
    print("Invalid density.")
else:
    print(f"Dynamic pressure: {pressure:.2f} Pa")''',
        'Change the velocity in the call from 10 to 20.', 'dynamic_pressure(1.225, 10)', 'dynamic_pressure(1.225, 20)',
        'Dynamic pressure: 61.25 Pa\n', 'Dynamic pressure: 245.00 Pa\n'),
    activity(24, 'A small calculator',
        'Each helper function performs one operation. calculate() selects the helper to use. This program returns either a number or an error message. Here, the caller simply prints the result.',
        'What result will the starting operation produce?',
        '''def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def multiply(a, b):
    return a * b

def divide(a, b):
    if b == 0:
        return "Cannot divide by zero."
    return a / b

def calculate(a, operation, b):
    if operation == "+":
        return add(a, b)
    if operation == "-":
        return subtract(a, b)
    if operation == "*":
        return multiply(a, b)
    if operation == "/":
        return divide(a, b)
    return "Unknown operation."

print("Result:", calculate(10, "+", 5))''',
        'Change "+" to "*" in the final function call.',
        'calculate(10, "+", 5)', 'calculate(10, "*", 5)',
        'Result: 15\n', 'Result: 50\n'),
    activity(25, 'Describing a function',
        'A docstring is a short explanation inside a function, immediately after its definition.',
        'Will the program print the description, the calculated area, or both?',
        '''def rectangle_area(width, height):
    """Return rectangle area using dimensions in centimetres."""
    return width * height

print(rectangle_area.__doc__)
print("Area:", rectangle_area(5, 3), "square cm")''',
        'Change "Return rectangle area" to "Calculate rectangle area" inside the docstring. Does changing the description change the calculated result?',
        'Return rectangle area', 'Calculate rectangle area',
        'Return rectangle area using dimensions in centimetres.\nArea: 15 square cm\n',
        'Calculate rectangle area using dimensions in centimetres.\nArea: 15 square cm\n'),
    activity(26, 'Preview of next week: variables inside a function',
        'The variable reading inside this function is separate from the variable with the same name outside it.',
        'Will the final line print 20 or 30?',
        '''reading = 20

def show_reading():
    reading = 30
    print("Inside the function:", reading)

show_reading()
print("Outside the function:", reading)''',
        'Change the value inside the function from 30 to 40. Check whether the outside value changes.',
        'reading = 30', 'reading = 40',
        'Inside the function: 30\nOutside the function: 20\n',
        'Inside the function: 40\nOutside the function: 20\n'),
]


def prepare(root):
    """Create the standalone guided edition without rewriting Colab notebooks."""
    nb = json.loads((root / 'notebooks/Week_09.ipynb').read_text())
    nb['cells'] = []
    nb['metadata']['cp1'] = {'week': 9, 'kind': 'lesson',
                             'offline_activities': len(ACTIVITIES),
                             'main_activities': 12, 'format': 'predict-run-change'}
    nb['metadata']['cp1_offline_week'] = 9

    def markdown(source, **metadata):
        nb['cells'].append(dict(cell_type='markdown', metadata=metadata,
                                source=source.splitlines(keepends=True)))

    markdown('''# Week 9: Using Functions

Computer Programming I · Dr. Arif Solmaz

**Your goal:** Use a ready-made function, identify its input and output, and make one small change.
You do not need to write a new program from scratch.

Use the same three steps for every example:

1. **Predict:** Say what you think will happen before running the code.
2. **Run:** Press Run on the supplied code and compare the result with your prediction.
3. **Change one thing:** Make the requested change, predict again, and rerun the same cell.

Each example includes its function definition and runs independently. Use **Undo last change** to
step back one edit in that cell. Use **Restore original code** to return to the starting
example. These buttons change the code only; press Run again to update the output.
You can also undo a restore. Ctrl/Cmd+Z works in the code editor.

Examples 1–12 are the main activities. Examples 13–26 are optional.
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
Ask: **What goes into the function, and what comes back?**
Give most classroom time to function calls, inputs, returned values, and the
difference between print() and return. Students can use supplied functions
successfully before learning to write their own from scratch.

### Participation and assessment

These activities are ungraded practice. No weekly submission is required.
Assessment remains the midterm exam (50%) and final exam (50%).
''', offline_anchor='finish')
    for index, cell in enumerate(nb['cells']):
        cell['id'] = f'w09-guided-{index:03d}'
    return nb, len(nb['cells'])
