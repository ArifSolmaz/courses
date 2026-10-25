"""Approved English Predict / Run / Change activities for Week 11."""
import json


def activity(number, title, explanation, predict, code, change, old, new,
             expected, changed_expected):
    return dict(number=str(number), title=title, explanation=explanation,
                predict=predict, code=code.strip() + '\n', change=change,
                old=old, new=new, expected=expected,
                changed_expected=changed_expected, optional=number >= 13)


ACTIVITIES = [
    activity(1, 'A program can run and still calculate incorrectly',
        'Some mistakes produce a wrong answer without stopping the program.',
        'Which calculation gives the rectangle\'s area?',
        '''width = 5
height = 3
first_result = width + height
second_result = width * height
print("First result:", first_result)
print("Second result:", second_result)''',
        'Change width + height to width * height.', 'width + height', 'width * height',
        'First result: 8\nSecond result: 15\n', 'First result: 15\nSecond result: 15\n'),
    activity(2, 'Handling division by zero',
        'The try block contains the calculation. The matching except block handles the error.',
        'Will the program print a result or an error message?',
        '''distance = 100
time = 0
try:
    speed = distance / time
    print("Average speed:", speed, "m/s")
except ZeroDivisionError:
    print("Time cannot be zero.")''',
        'Change time from 0 to 5.', 'time = 0', 'time = 5',
        'Time cannot be zero.\n', 'Average speed: 20.0 m/s\n'),
    activity(3, 'Converting text into a number',
        'float() converts numeric text. Text such as "ERROR" cannot be converted.',
        'Will the conversion succeed?',
        '''text = "24.5"
try:
    reading = float(text)
    print("Converted number:", reading)
except ValueError:
    print("The text is not a number.")''',
        'Change "24.5" to "ERROR".', '"24.5"', '"ERROR"',
        'Converted number: 24.5\n', 'The text is not a number.\n'),
    activity(4, 'An empty field is missing data',
        'An empty string does not represent a measured zero.',
        'Will the empty text become zero or produce the message?',
        '''text = ""
try:
    reading = float(text)
    print("Converted number:", reading)
except ValueError:
    print("No numeric reading was supplied.")''',
        'Change text from "" to "0". Compare the two outcomes.', 'text = ""', 'text = "0"',
        'No numeric reading was supplied.\n', 'Converted number: 0.0\n'),
    activity(5, 'Keeping zero separate from failure',
        'This function returns None when conversion fails. Use is None to identify failure. A numeric zero is a different result.',
        'Will "0" be reported as a reading or as missing data?',
        '''def read_number(text):
    try:
        return float(text)
    except ValueError:
        return None

reading = read_number("0")
if reading is None:
    print("No numeric reading available.")
else:
    print("Reading:", reading)''',
        'Change "0" in the function call to "ERROR".', 'read_number("0")', 'read_number("ERROR")',
        'Reading: 0.0\n', 'No numeric reading available.\n'),
    activity(6, 'Negative temperatures can be valid',
        'A minus sign does not automatically make a temperature invalid.',
        'Can Python convert "-12.5"?',
        '''text = "-12.5"
try:
    temperature = float(text)
    print("Temperature:", temperature, "C")
except ValueError:
    print("Cannot read this temperature.")''',
        'Change "-12.5" to "0".', '"-12.5"', '"0"',
        'Temperature: -12.5 C\n', 'Temperature: 0.0 C\n'),
    activity(7, 'A number can be outside the sensor\'s range',
        'This teaching sensor accepts temperatures from −50 to 60 C, including both endpoints.',
        'Will 61 be accepted?',
        '''temperature = 61
if temperature < -50 or temperature > 60:
    print("Outside the sensor range.")
else:
    print("Accepted temperature:", temperature, "C")''',
        'Change temperature from 61 to 60.', 'temperature = 61', 'temperature = 60',
        'Outside the sensor range.\n', 'Accepted temperature: 60 C\n'),
    activity(8, 'Conversion alone is not enough',
        'Python can convert "nan" into a special floating-point value. It is not a usable finite measurement. math is included with Python; no extra installation is needed.',
        'Will this value pass the finite-number check?',
        '''import math

text = "nan"
reading = float(text)
if math.isfinite(reading):
    print("Finite number:", reading)
else:
    print("Reading must be finite.")''',
        'Change "nan" to "24".', '"nan"', '"24"',
        'Reading must be finite.\n', 'Finite number: 24.0\n'),
    activity(9, 'Handling a missing list position',
        'A list has only the positions that exist in it. Remember that positions start at 0.',
        'Does position 5 exist in this list?',
        '''readings = [20, 24, 22]
position = 5
try:
    print("Reading:", readings[position])
except IndexError:
    print("That position is not available.")''',
        'Change position from 5 to 1.', 'position = 5', 'position = 1',
        'That position is not available.\n', 'Reading: 24\n'),
    activity(10, 'Handling a missing sensor name',
        'A dictionary lookup can fail when the requested name is absent.',
        'Will the program find sensor "T3"?',
        '''readings = {"T1": 20, "T2": 24}
wanted = "T3"
try:
    print("Reading:", readings[wanted])
except KeyError:
    print("No reading for", wanted)''',
        'Change wanted from "T3" to "T2".', 'wanted = "T3"', 'wanted = "T2"',
        'No reading for T3\n', 'Reading: 24\n'),
    activity(11, 'Integer text and decimal text are different',
        'int() accepts integer text such as "25". It does not directly accept "3.5".',
        'Will this conversion succeed?',
        '''text = "3.5"
try:
    quantity = int(text)
    print("Quantity:", quantity)
except ValueError:
    print("Enter a whole number.")''',
        'Change "3.5" to "25".', '"3.5"', '"25"',
        'Enter a whole number.\n', 'Quantity: 25\n'),
    activity(12, 'Different errors can have different messages',
        'The program distinguishes division by zero from using an unsuitable data type.',
        'Which error message will appear?',
        '''denominator = "two"
try:
    result = 10 / denominator
    print("Result:", result)
except ZeroDivisionError:
    print("The denominator cannot be zero.")
except TypeError:
    print("The denominator must be a number.")''',
        'Change denominator = "two" to denominator = 0. Use the number 0, without quotation marks.',
        'denominator = "two"', 'denominator = 0',
        'The denominator must be a number.\n', 'The denominator cannot be zero.\n'),
    activity(13, 'Run extra code only after success',
        'The else block runs when the conversion finishes successfully.',
        'Will the doubled value be printed?',
        '''text = "12"
try:
    number = float(text)
except ValueError:
    print("Cannot convert the text.")
else:
    print("Doubled value:", number * 2)''',
        'Change "12" to "ERROR".', '"12"', '"ERROR"',
        'Doubled value: 24.0\n', 'Cannot convert the text.\n'),
    activity(14, 'A final message in both cases',
        'During normal execution, finally runs whether this division succeeds or its error is caught.',
        'Will "Attempt finished." appear when the denominator is zero?',
        '''denominator = 0
try:
    print("Result:", 10 / denominator)
except ZeroDivisionError:
    print("Cannot divide by zero.")
finally:
    print("Attempt finished.")''',
        'Change the denominator from 0 to 2. Check which message appears in both runs.',
        'denominator = 0', 'denominator = 2',
        'Cannot divide by zero.\nAttempt finished.\n', 'Result: 5.0\nAttempt finished.\n'),
    activity(15, 'Putting the blocks together',
        'Each block has a separate job.',
        'Which messages will appear for the starting input?',
        '''text = "ERROR"
try:
    number = float(text)
except ValueError:
    print("Conversion failed.")
else:
    print("Conversion succeeded:", number)
finally:
    print("This attempt is complete.")''',
        'Change "ERROR" to "20".', '"ERROR"', '"20"',
        'Conversion failed.\nThis attempt is complete.\n',
        'Conversion succeeded: 20.0\nThis attempt is complete.\n'),
    activity(16, 'Reading the error message',
        'as error gives the caught error a name so we can inspect its message. Exact error-message wording can differ between Python versions.',
        'Will the program report a successful conversion or an explanation of the error?',
        '''text = "Motor"
try:
    number = int(text)
    print("Number:", number)
except ValueError as error:
    print("Error type:", type(error).__name__)
    print("Details:", error)''',
        'Change "Motor" to "42".', '"Motor"', '"42"',
        "Error type: ValueError\nDetails: invalid literal for int() with base 10: 'Motor'\n", 'Number: 42\n'),
    activity(17, 'A function can reject an invalid value',
        'raise deliberately reports a problem. Use finite numeric inputs for this activity.',
        'Will the function accept the starting temperature?',
        '''def check_temperature(value):
    if value < -50 or value > 60:
        raise ValueError("Outside the sensor range.")
    return value

try:
    print("Temperature:", check_temperature(70))
except ValueError as error:
    print("Rejected:", error)''',
        'Change the input from 70 to 25.', 'check_temperature(70)', 'check_temperature(25)',
        'Rejected: Outside the sensor range.\n', 'Temperature: 25\n'),
    activity(18, 'Trying another supplied response',
        'The function tries the supplied strings in order and stops at the first valid integer. An unsuccessful attempt does not automatically become zero.',
        'Which response will be returned?',
        '''def first_integer(responses, max_attempts):
    for text in responses[:max_attempts]:
        try:
            return int(text)
        except ValueError:
            print("Not an integer:", text)
    return None

responses = ["ERROR", "3.5", "25"]
result = first_integer(responses, 3)
print("Result:", result)''',
        'Change the maximum attempts in the call from 3 to 2.',
        'first_integer(responses, 3)', 'first_integer(responses, 2)',
        'Not an integer: ERROR\nNot an integer: 3.5\nResult: 25\n',
        'Not an integer: ERROR\nNot an integer: 3.5\nResult: None\n'),
    activity(19, 'Converting several values',
        'One failed conversion does not prevent the remaining strings from being checked.',
        'Which strings will become integers?',
        '''texts = ["1", "2.5", "ERROR", "4"]
converted = []
failed = 0
for text in texts:
    try:
        number = int(text)
    except ValueError:
        print("Rejected:", text)
        failed = failed + 1
    else:
        converted.append(number)
print("Converted:", converted)
print("Succeeded:", len(converted))
print("Failed:", failed)''',
        'Change "2.5" in the list to "2".', '"2.5"', '"2"',
        'Rejected: 2.5\nRejected: ERROR\nConverted: [1, 4]\nSucceeded: 2\nFailed: 2\n',
        'Rejected: ERROR\nConverted: [1, 2, 4]\nSucceeded: 3\nFailed: 1\n'),
    activity(20, 'Averaging only accepted readings',
        'This program accepts finite numbers between −50 and 60 C. Rejected records are reported and kept out of the average.',
        'Will the zero reading be included?',
        '''import math

texts = ["0", "20", "ERROR"]
accepted = []
for text in texts:
    try:
        reading = float(text)
    except ValueError:
        print("Rejected text:", text)
        continue
    if not math.isfinite(reading):
        print("Rejected nonfinite reading:", text)
    elif not -50 <= reading <= 60:
        print("Rejected out-of-range reading:", text)
    else:
        accepted.append(reading)
print("Accepted:", accepted)
if accepted:
    print("Average:", sum(accepted) / len(accepted))
else:
    print("No accepted readings; average unavailable.")''',
        'Change "ERROR" to "40". Compare the new average with the original average.', '"ERROR"', '"40"',
        'Rejected text: ERROR\nAccepted: [0.0, 20.0]\nAverage: 10.0\n',
        'Accepted: [0.0, 20.0, 40.0]\nAverage: 20.0\n'),
    activity(21, 'Converting temperature after validation',
        'The function checks the number before converting Celsius to Kelvin. Use a string input. Absolute zero itself is permitted.',
        'Will −300 C produce a converted temperature or a rejection message?',
        '''import math

def celsius_to_kelvin(text):
    try:
        value = float(text)
    except ValueError:
        return "Not a number."
    if not math.isfinite(value):
        return "Temperature must be finite."
    if value < -273.15:
        return "Below absolute zero."
    return value + 273.15

print("Result:", celsius_to_kelvin("-300"))''',
        'Change the input string from "-300" to "0".', '"-300"', '"0"',
        'Result: Below absolute zero.\n', 'Result: 273.15\n'),
    activity(22, 'A calculator that explains failures',
        'This simplified calculator divides two supplied numeric strings.',
        'Which message will the starting inputs produce?',
        '''import math

def divide_text(first, second):
    try:
        a = float(first)
        b = float(second)
    except ValueError:
        return "Both inputs must be numeric text."
    if not math.isfinite(a) or not math.isfinite(b):
        return "Both numbers must be finite."
    try:
        result = a / b
    except ZeroDivisionError:
        return "Cannot divide by zero."
    if not math.isfinite(result):
        return "Result is not finite."
    return result

print("Result:", divide_text("10", "0"))''',
        'Change the second input string from "0" to "2".', 'divide_text("10", "0")', 'divide_text("10", "2")',
        'Result: Cannot divide by zero.\n', 'Result: 5.0\n'),
    activity(23, 'Skipping a failed division',
        'For this classroom exercise, an invalid divisor is skipped after printing a warning. Skipping a divisor is an explicit rule for this exercise. It changes which operations are performed.',
        'Will the program stop at the zero divisor?',
        '''result = 100
divisors = [2, 0, 5]
for divisor in divisors:
    try:
        result = result / divisor
    except ZeroDivisionError:
        print("Skipped a zero divisor.")
    except TypeError:
        print("Skipped a non-number.")
print("Final result:", result)''',
        'Change the zero inside divisors to 2.', '[2, 0, 5]', '[2, 2, 5]',
        'Skipped a zero divisor.\nFinal result: 10.0\n', 'Final result: 5.0\n'),
    activity(24, 'Checking grade entries',
        'A successful conversion is followed by a range check. The endpoints 0 and 100 are accepted.',
        'Which grades will be accepted?',
        '''texts = ["85", "ERROR", "110", "0"]
accepted = []
for text in texts:
    try:
        grade = int(text)
    except ValueError:
        print("Not an integer:", text)
        continue
    if 0 <= grade <= 100:
        accepted.append(grade)
    else:
        print("Outside 0–100:", text)
print("Accepted grades:", accepted)
if accepted:
    print("Average:", sum(accepted) / len(accepted))
else:
    print("No accepted grades.")''',
        'Change "110" to "100".', '"110"', '"100"',
        'Not an integer: ERROR\nOutside 0–100: 110\nAccepted grades: [85, 0]\nAverage: 42.5\n',
        'Not an integer: ERROR\nAccepted grades: [85, 100, 0]\nAverage: 61.666666666666664\n'),
    activity(25, 'Explaining a problem in a record',
        'The function checks a name and an integer quantity stored as text. Use a dictionary with string values in this activity.',
        'Will the starting record produce a quantity or an error message?',
        '''def describe_record(record):
    try:
        name = record["name"]
        quantity = int(record["quantity"])
    except KeyError:
        return "A required field is missing."
    except ValueError:
        return "Quantity must contain integer text."
    return f"{name}: {quantity}"

record = {"name": "bolt", "quantity": "ERROR"}
print(describe_record(record))''',
        'Change the quantity text from "ERROR" to "10".', '"quantity": "ERROR"', '"quantity": "10"',
        'Quantity must contain integer text.\n', 'bolt: 10\n'),
    activity(26, 'A validator that returns a decision and a reason',
        'The function returns two values: whether the input passed, and either its converted value or a message. Use a string input.',
        'Will "-5" pass the positive-integer rule?',
        '''def validate_positive_integer(text):
    try:
        value = int(text)
    except ValueError:
        return False, "Not an integer."
    if value <= 0:
        return False, "Must be positive."
    return True, value

valid, result = validate_positive_integer("-5")
print("Accepted:", valid)
print("Value or reason:", result)''',
        'Change "-5" to "5".', '"-5"', '"5"',
        'Accepted: False\nValue or reason: Must be positive.\n', 'Accepted: True\nValue or reason: 5\n'),
    activity(27, 'Processing records without stopping at one bad record',
        'The helper converts and validates both exam scores before calculating a result. This activity uses dictionaries containing text fields. Scores use 50% midterm and 50% final.',
        'Which student will receive a numeric score?',
        '''import math

def student_result(record):
    try:
        name = record["name"]
        midterm = float(record["midterm"])
        final = float(record["final"])
    except KeyError:
        return "Rejected: missing field."
    except ValueError:
        return "Rejected: score is not numeric text."
    if not math.isfinite(midterm) or not math.isfinite(final):
        return name + ": scores must be finite."
    if not 0 <= midterm <= 100 or not 0 <= final <= 100:
        return name + ": scores must be between 0 and 100."
    score = 0.5 * midterm + 0.5 * final
    return f"{name}: {score:.1f}"

records = [
    {"name": "Alex", "midterm": "60", "final": "80"},
    {"name": "Sam", "midterm": "ERROR", "final": "90"}
]
for record in records:
    print(student_result(record))''',
        'Change Sam\'s midterm text from "ERROR" to "70".', '"midterm": "ERROR"', '"midterm": "70"',
        'Alex: 70.0\nRejected: score is not numeric text.\n', 'Alex: 70.0\nSam: 80.0\n'),
    activity(28, 'Preview of next week: a missing file',
        'The setup creates one small teaching file in a temporary folder. The program then tries to read the selected filename. The temporary folder and its teaching file are removed when the example finishes.',
        'Will the starting filename be found?',
        '''from pathlib import Path
from tempfile import TemporaryDirectory

with TemporaryDirectory() as folder:
    sample = Path(folder) / "readings.txt"
    sample.write_text("20,24,22", encoding="utf-8")
    filename = "missing.txt"
    try:
        text = (Path(folder) / filename).read_text(encoding="utf-8")
        print("File contents:", text)
    except FileNotFoundError:
        print("The selected file does not exist.")''',
        'Change filename from "missing.txt" to "readings.txt".', 'filename = "missing.txt"', 'filename = "readings.txt"',
        'The selected file does not exist.\n', 'File contents: 20,24,22\n'),
]


def prepare(root):
    """Create the standalone guided edition without rewriting Colab notebooks."""
    nb = json.loads((root / 'notebooks/Week_11.ipynb').read_text())
    nb['cells'] = []
    nb['metadata']['cp1'] = {'week': 11, 'kind': 'lesson',
                             'offline_activities': len(ACTIVITIES),
                             'main_activities': 12, 'format': 'predict-run-change'}
    nb['metadata']['cp1_offline_week'] = 11

    def markdown(source, **metadata):
        nb['cells'].append(dict(cell_type='markdown', metadata=metadata,
                                source=source.splitlines(keepends=True)))

    markdown('''# Week 11: Handling Errors and Missing Readings

Computer Programming I · Dr. Arif Solmaz

**Your goal:** Recognize an invalid input, show a useful message, and keep missing data
separate from a valid zero reading.
You do not need to write a new program from scratch.

Use the same three steps for every example:

1. **Predict:** Say what you think will happen before running the code.
2. **Run:** Press Run on the supplied code and compare the result with your prediction.
3. **Change one thing:** Make the requested change, predict again, and rerun the same cell.

Each example runs independently. Sample inputs are already in the code; you do not
need to type responses into a prompt. Use **Undo last change** to
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
Ask: **Is this a valid reading, or do we need an explanation of what went wrong?**
Give most classroom time to conversion errors, valid zero readings, sensor limits,
and clear messages. Keep retries, longer processors, and file examples optional.

**A failed reading must not silently become zero.**

### Participation and assessment

These activities are ungraded practice. No weekly submission is required.
Assessment remains the midterm exam (50%) and final exam (50%).
''', offline_anchor='finish')
    for index, cell in enumerate(nb['cells']):
        cell['id'] = f'w11-guided-{index:03d}'
    return nb, len(nb['cells'])
