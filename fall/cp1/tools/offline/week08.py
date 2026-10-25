"""Approved English Predict / Run / Change activities for Week 8."""
import json


def activity(number, title, explanation, predict, code, change, old, new,
             expected, changed_expected):
    return dict(number=str(number), title=title, explanation=explanation,
                predict=predict, code=code.strip() + '\n', change=change,
                old=old, new=new, expected=expected,
                changed_expected=changed_expected, optional=number >= 15)


ACTIVITIES = [
    activity(1, 'Text is a string',
        'Python uses strings to store text. Spaces count as characters too.',
        'How many characters are in "Motor ON"?',
        '''message = "Motor ON"
print("Message:", message)
print("Characters:", len(message))''',
        'Change "Motor ON" to "Motor OFF".', 'Motor ON', 'Motor OFF',
        'Message: Motor ON\nCharacters: 8\n', 'Message: Motor OFF\nCharacters: 9\n'),
    activity(2, 'First and last characters',
        'Character positions start at 0. Position -1 means the last character.',
        'Which two characters will appear?',
        '''sensor = "TEMP1"
print("First character:", sensor[0])
print("Last character:", sensor[-1])''',
        'Change [0] to [1] in the first print() line.', '[0]', '[1]',
        'First character: T\nLast character: 1\n', 'First character: E\nLast character: 1\n'),
    activity(3, 'Selecting part of a message',
        'A slice selects part of a string. The ending position is not included.',
        'Which part of the message will appear?',
        '''message = "TEMP:24"
label = message[:4]
print("Selected text:", label)''',
        'Change [:4] to [5:].', '[:4]', '[5:]',
        'Selected text: TEMP\n', 'Selected text: 24\n'),
    activity(4, 'Uppercase and lowercase',
        '.upper() and .lower() produce new versions of the text. The original string stays unchanged.',
        'How will the three printed lines differ?',
        '''status = "Motor On"
print("Original:", status)
print("Uppercase:", status.upper())
print("Lowercase:", status.lower())''',
        'Change "Motor On" to "Sensor Ready".', 'Motor On', 'Sensor Ready',
        'Original: Motor On\nUppercase: MOTOR ON\nLowercase: motor on\n',
        'Original: Sensor Ready\nUppercase: SENSOR READY\nLowercase: sensor ready\n'),
    activity(5, 'Removing spaces around a message',
        '.strip() removes spaces and other whitespace from the beginning and end.',
        'Will the space between "Motor" and "ON" disappear?',
        '''message = "   Motor ON   "
cleaned = message.strip()
print("Original: [" + message + "]")
print("Cleaned:  [" + cleaned + "]")''',
        'Change .strip() to .lstrip(). Look at the spaces before the closing bracket. .lstrip() cleans only the left end.',
        '.strip()', '.lstrip()',
        'Original: [   Motor ON   ]\nCleaned:  [Motor ON]\n',
        'Original: [   Motor ON   ]\nCleaned:  [Motor ON   ]\n'),
    activity(6, 'Checking whether text is present',
        'in checks whether one piece of text appears inside another. Uppercase and lowercase letters normally count as different characters.',
        'Will these two checks give the same result?',
        '''message = "Motor WARNING"
print("WARNING" in message)
print("warning" in message)''',
        'Change the second line of output to use print("warning" in message.lower()).',
        'print("warning" in message)', 'print("warning" in message.lower())',
        'True\nFalse\n', 'True\nTrue\n'),
    activity(7, 'Finding and counting text',
        '.find() gives the first matching position. .count() counts occurrences. A position of -1 means the text was not found.',
        'How many times does "ON" appear?',
        '''message = "ON OFF ON"
wanted = "ON"
print("First position:", message.find(wanted))
print("Number of matches:", message.count(wanted))''',
        'Change wanted from "ON" to "ERROR".', 'wanted = "ON"', 'wanted = "ERROR"',
        'First position: 0\nNumber of matches: 2\n', 'First position: -1\nNumber of matches: 0\n'),
    activity(8, 'Replacing text',
        '.replace() creates a new string.',
        'Will the original message change?',
        '''message = "Motor OFF"
updated = message.replace("OFF", "ON")
print("Original:", message)
print("Updated:", updated)''',
        'Change the replacement text from "ON" to "READY".', '"ON"', '"READY"',
        'Original: Motor OFF\nUpdated: Motor ON\n', 'Original: Motor OFF\nUpdated: Motor READY\n'),
    activity(9, 'Checking the beginning and end',
        'These methods answer simple questions about a message.',
        'Will both checks return True?',
        '''message = "TEMP:24 C"
print("Starts with TEMP:", message.startswith("TEMP"))
print("Ends with C:", message.endswith("C"))''',
        'Change the final C inside message to F.', '"TEMP:24 C"', '"TEMP:24 F"',
        'Starts with TEMP: True\nEnds with C: True\n', 'Starts with TEMP: True\nEnds with C: False\n'),
    activity(10, 'Splitting a sentence into words',
        '.split() without a separator splits text on whitespace.',
        'How many words will the program find?',
        '''message = "The motor is ready"
words = message.split()
print("Words:", words)
print("Number of words:", len(words))''',
        'Add several spaces between "motor" and "is". Does the word count change?',
        'motor is', 'motor    is',
        "Words: ['The', 'motor', 'is', 'ready']\nNumber of words: 4\n",
        "Words: ['The', 'motor', 'is', 'ready']\nNumber of words: 4\n"),
    activity(11, 'Splitting a device message',
        'This device sends three fields separated by commas: sensor name, reading, and unit. Keep exactly three fields in this example.',
        'What will be stored at position 1 in fields?',
        '''message = "T1,23.5,C"
fields = message.split(",")
print("Sensor:", fields[0])
print("Reading text:", fields[1])
print("Unit:", fields[2])''',
        'Change "T1" to "T2" inside message.', 'T1,23.5,C', 'T2,23.5,C',
        'Sensor: T1\nReading text: 23.5\nUnit: C\n', 'Sensor: T2\nReading text: 23.5\nUnit: C\n'),
    activity(12, 'Turning numeric text into a number',
        'Text must be converted before we use it for arithmetic. Adding strings joins their characters. Adding numbers performs arithmetic.',
        'Will the two results be the same?',
        '''reading_text = "24"
print("As text:", reading_text + "2")
print("As a number:", float(reading_text) + 2)''',
        'Change "24" to "30".', '"24"', '"30"',
        'As text: 242\nAs a number: 26.0\n', 'As text: 302\nAs a number: 32.0\n'),
    activity(13, 'Joining pieces of text',
        '.join() combines strings using a separator.',
        'What will appear between the sensor names?',
        '''sensors = ["T1", "T2", "T3"]
message = ", ".join(sensors)
print(message)''',
        'Change the separator from ", " to " | ".', 'message = ", ".join(sensors)', 'message = " | ".join(sensors)',
        'T1, T2, T3\n', 'T1 | T2 | T3\n'),
    activity(14, 'Checking a device message',
        'For this activity, we accept only sensor "T1" and unit "C". This checks the fields, sensor, and unit. It does not yet check whether nonempty reading text is a valid number.',
        'Will the starting message be accepted?',
        '''message = "T1,23.5,C"
fields = message.split(",")
if len(fields) != 3:
    print("Expected three fields.")
elif fields[0] != "T1":
    print("Unsupported sensor.")
elif fields[1].strip() == "":
    print("Reading is missing.")
elif fields[2] != "C":
    print("Unsupported unit.")
else:
    print("Message accepted.")''',
        'Change the unit inside message from C to F.', 'T1,23.5,C', 'T1,23.5,F',
        'Message accepted.\n', 'Unsupported unit.\n'),
    activity(15, 'Formatting a reading',
        'An f-string inserts values into a message. :.1f displays one decimal place. Only the displayed precision changes; the stored number stays the same.',
        'How will 23.456 appear?',
        '''sensor = "T1"
temperature = 23.456
print(f"Sensor {sensor}: {temperature:.1f} C")''',
        'Change :.1f to :.2f.', ':.1f', ':.2f',
        'Sensor T1: 23.5 C\n', 'Sensor T1: 23.46 C\n'),
    activity(16, 'Counting vowels',
        'The loop checks each character. Here, vowels mean the five English letters a, e, i, o, and u.',
        'How many vowels are in "Motor ON"?',
        '''message = "Motor ON"
count = 0
for character in message:
    if character.lower() in "aeiou":
        count = count + 1
print("Vowels:", count)''',
        'Change the message to "Motor OFF".', 'Motor ON', 'Motor OFF',
        'Vowels: 3\n', 'Vowels: 3\n'),
    activity(17, 'Building text without spaces',
        'The program copies every character except a space into a new string.',
        'What will the result look like?',
        '''message = "T 1 R E A D Y"
result = ""
for character in message:
    if character != " ":
        result = result + character
print(result)''',
        'Change the starting message to "M O T O R O N".', 'T 1 R E A D Y', 'M O T O R O N',
        'T1READY\n', 'MOTORON\n'),
    activity(18, 'Reversing text',
        'Each character is added to the beginning of the result.',
        'What is "STOP" backwards?',
        '''message = "STOP"
reversed_message = ""
for character in message:
    reversed_message = character + reversed_message
print("Original:", message)
print("Reversed:", reversed_message)''',
        'Change "STOP" to "MOTOR".', 'STOP', 'MOTOR',
        'Original: STOP\nReversed: POTS\n', 'Original: MOTOR\nReversed: ROTOM\n'),
    activity(19, 'A word that reads the same backwards',
        'A palindrome reads the same forwards and backwards. [::-1] produces the reversed text. This example ignores letter case. It keeps spaces and punctuation.',
        'Will "Level" pass the check?',
        '''word = "Level"
cleaned = word.lower()
if cleaned == cleaned[::-1]:
    print("Same forwards and backwards.")
else:
    print("Different forwards and backwards.")''',
        'Change "Level" to "Motor".', 'Level', 'Motor',
        'Same forwards and backwards.\n', 'Different forwards and backwards.\n'),
    activity(20, 'Capitalizing words',
        'This program makes the first letter of each word uppercase and the remaining letters lowercase.',
        'What will "motor control" become?',
        '''message = "motor control"
updated_words = []
for word in message.split():
    updated = word[0].upper() + word[1:].lower()
    updated_words.append(updated)
print(" ".join(updated_words))''',
        'Change the message to "TEMPERATURE SENSOR".', 'motor control', 'TEMPERATURE SENSOR',
        'Motor Control\n', 'Temperature Sensor\n'),
    activity(21, 'Counting letters',
        'This uses the dictionary counting pattern from Week 07. Spaces and punctuation are skipped because they are not letters.',
        'Which letter appears most often in "Motor"?',
        '''message = "Motor"
counts = {}
for character in message.lower():
    if character.isalpha():
        counts[character] = counts.get(character, 0) + 1
print(counts)''',
        'Change "Motor" to "Sensor".', 'Motor', 'Sensor',
        "{'m': 1, 'o': 2, 't': 1, 'r': 1}\n", "{'s': 2, 'e': 1, 'n': 1, 'o': 1, 'r': 1}\n"),
    activity(22, 'Making an acronym',
        'Take the first letter of each word and make it uppercase.',
        'What acronym will this phrase produce?',
        '''phrase = "central processing unit"
acronym = ""
for word in phrase.split():
    acronym = acronym + word[0].upper()
print("Acronym:", acronym)''',
        'Change the phrase to "printed circuit board".', 'central processing unit', 'printed circuit board',
        'Acronym: CPU\n', 'Acronym: PCB\n'),
    activity(23, 'Replacing digits',
        'The program replaces each digit with # and keeps other characters.',
        'What will happen to the hyphen?',
        '''message = "Device 123-45"
masked = ""
for character in message:
    if character.isdigit():
        masked = masked + "#"
    else:
        masked = masked + character
print(masked)''',
        'Change "Device 123-45" to "Sensor 7".', 'Device 123-45', 'Sensor 7',
        'Device ###-##\n', 'Sensor #\n'),
    activity(24, 'A basic email format check',
        'This checks four classroom rules: one @, text before it, a dot after it, and no ordinary spaces. Passing these rules does not prove that an address is fully valid or that its mailbox exists.',
        'Will the starting address pass?',
        '''email = "student@example.com"
position = email.find("@")
passes = (
    email.count("@") == 1
    and position > 0
    and "." in email[position + 1:]
    and " " not in email
)
print("Passes classroom rules:", passes)''',
        'Change the address to "student@example".', 'student@example.com', 'student@example',
        'Passes classroom rules: True\n', 'Passes classroom rules: False\n'),
    activity(25, 'Reading a small sensor log',
        'Each line contains a time, a sensor name, and a temperature in degrees Celsius. For this activity, each nonblank line must contain three unquoted fields and a valid numeric reading. Simple splitting is not suitable for fields containing quoted commas.',
        'Which sensor has the highest reading?',
        '''log = """08:00,T1,20
08:01,T2,24
08:02,T1,22"""
total = 0
count = 0
highest = None
for line in log.splitlines():
    if line.strip():
        time, sensor, reading_text = line.split(",")
        reading = float(reading_text)
        total = total + reading
        count = count + 1
        print(f"{time}  {sensor}  {reading:5.1f} C")
        if highest is None or reading > highest:
            highest = reading
            highest_sensor = sensor
            highest_time = time
print("Readings:", count)
if count:
    print("Average:", total / count)
    print("Highest:", highest_sensor, highest, "at", highest_time)
else:
    print("No readings available.")''',
        'Change the final reading from 22 to 28.', '08:02,T1,22', '08:02,T1,28',
        '08:00  T1   20.0 C\n08:01  T2   24.0 C\n08:02  T1   22.0 C\nReadings: 3\nAverage: 22.0\nHighest: T2 24.0 at 08:01\n',
        '08:00  T1   20.0 C\n08:01  T2   24.0 C\n08:02  T1   28.0 C\nReadings: 3\nAverage: 24.0\nHighest: T1 28.0 at 08:02\n'),
    activity(26, 'Shifting letters',
        'A Caesar cipher shifts letters through the alphabet. This is a character-processing exercise, not secure encryption. This simplified version shifts uppercase English letters only. Other characters stay unchanged.',
        'If the shift is 1, what will "ABC" become?',
        '''message = "ABC XYZ!"
shift = 1
result = ""
for character in message:
    if "A" <= character <= "Z":
        position = ord(character) - ord("A")
        shifted = (position + shift) % 26
        result = result + chr(ord("A") + shifted)
    else:
        result = result + character
print(result)''',
        'Change shift from 1 to 2.', 'shift = 1', 'shift = 2',
        'BCD YZA!\n', 'CDE ZAB!\n'),
    activity(27, 'Finding email-like text',
        'The program looks for words containing both @ and a dot. These are candidates found in text; the program does not validate email addresses.',
        'Which word will be selected?',
        '''message = "Contact support@example.com."
candidates = []
for word in message.split():
    cleaned = word.strip(".,!?;:")
    if "@" in cleaned and "." in cleaned:
        candidates.append(cleaned)
print("Candidates:", candidates)''',
        'Change the message to "Contact the support team.".',
        'Contact support@example.com.', 'Contact the support team.',
        "Candidates: ['support@example.com']\n", 'Candidates: []\n'),
    activity(28, 'Checking character categories',
        'This reports whether the sample contains uppercase letters, lowercase letters, digits, and symbols. This is a text exercise, not a password-strength test.',
        'Which categories are present in "Motor123"?',
        '''sample = "Motor123"
has_upper = False
has_lower = False
has_digit = False
has_symbol = False
for character in sample:
    if character.isupper():
        has_upper = True
    elif character.islower():
        has_lower = True
    elif character.isdigit():
        has_digit = True
    elif not character.isalnum() and not character.isspace():
        has_symbol = True
print("Uppercase:", has_upper)
print("Lowercase:", has_lower)
print("Digit:", has_digit)
print("Symbol:", has_symbol)''',
        'Change the sample to "Motor123!".', '"Motor123"', '"Motor123!"',
        'Uppercase: True\nLowercase: True\nDigit: True\nSymbol: False\n',
        'Uppercase: True\nLowercase: True\nDigit: True\nSymbol: True\n'),
    activity(29, 'Finding every matching position',
        'After finding a match, the search continues from the next position. Keep the search text nonempty for this activity.',
        'At which positions does "ON" begin? Remember that positions start at 0.',
        '''message = "ON OFF ON"
wanted = "ON"
positions = []
start = 0
while wanted:
    position = message.find(wanted, start)
    if position == -1:
        break
    positions.append(position)
    start = position + 1
print("Positions:", positions)''',
        'Change wanted from "ON" to "OFF".', 'wanted = "ON"', 'wanted = "OFF"',
        'Positions: [0, 7]\n', 'Positions: [3]\n'),
    activity(30, 'Preview of next week: a reusable function',
        'A function gives a name to a calculation so we can use it again.',
        'Which word will produce True?',
        '''def is_palindrome(word):
    cleaned = word.lower()
    return cleaned == cleaned[::-1]
print("Level:", is_palindrome("Level"))
print("Motor:", is_palindrome("Motor"))''',
        'Replace "Motor" with "Radar" in the second print() line, including its label.',
        'print("Motor:", is_palindrome("Motor"))', 'print("Radar:", is_palindrome("Radar"))',
        'Level: True\nMotor: False\n', 'Level: True\nRadar: True\n'),
]


def prepare(root):
    """Create the standalone guided edition without rewriting Colab notebooks."""
    nb = json.loads((root / 'notebooks/Week_08.ipynb').read_text())
    nb['cells'] = []
    nb['metadata']['cp1'] = {'week': 8, 'kind': 'lesson',
                             'offline_activities': len(ACTIVITIES),
                             'main_activities': 14, 'format': 'predict-run-change'}
    nb['metadata']['cp1_offline_week'] = 8

    def markdown(source, **metadata):
        nb['cells'].append(dict(cell_type='markdown', metadata=metadata,
                                source=source.splitlines(keepends=True)))

    markdown('''# Week 8: Working with Text

Computer Programming I · Dr. Arif Solmaz

**Your goal:** Read a short device message, find useful information, and make one small change.
You do not need to write a new program from scratch.

Use the same three steps for every example:

1. **Predict:** Say what you think will happen before running the code.
2. **Run:** Press Run on the supplied code and compare the result with your prediction.
3. **Change one thing:** Make the requested change, predict again, and rerun the same cell.

Each example includes its own data and runs independently. Use **Undo last change** to
step back one edit in that cell. Use **Restore original code** to return to the starting
example. These buttons change the code only; press Run again to update the output.
You can also undo a restore. Ctrl/Cmd+Z works in the code editor.

Examples 1–14 are the main activities. Examples 15–30 are optional.
You do not need to complete every example in one lesson.
''', offline_anchor='overview')
    markdown('''## Main activities

Start here. Talk to a partner if your prediction differs from the result.
''', offline_anchor='main-activities')
    for item in ACTIVITIES:
        if item['number'] == '15':
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
Give most classroom time to splitting a device message, identifying its fields,
and converting numeric text into a number. The longer loops and text-processing
puzzles can remain optional.

### Participation and assessment

These activities are ungraded practice. No weekly submission is required.
Assessment remains the midterm exam (50%) and final exam (50%).
''', offline_anchor='finish')
    for index, cell in enumerate(nb['cells']):
        cell['id'] = f'w08-guided-{index:03d}'
    return nb, len(nb['cells'])
