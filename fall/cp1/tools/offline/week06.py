"""English, guided Week 6 activities for the standalone offline edition.

The notebook and web-course editions keep their existing exercise sequence.
Each record contains one complete program and one small, executable change.
"""
import json
from pathlib import Path


def activity(number, title, explanation, predict, code, change, old, new,
             expected, changed_expected, optional=False):
    return dict(number=number, title=title, explanation=explanation,
                predict=predict, code=code.strip() + '\n', change=change,
                old=old, new=new, expected=expected,
                changed_expected=changed_expected, optional=optional)


ACTIVITIES = [
    activity('1', 'A list of temperature readings',
        'A list keeps several readings together, in order.',
        'How many readings will the program print?',
        '''temperatures = [20, 22, 25, 21]
print("Temperatures:", temperatures)
print("Number of readings:", len(temperatures))''',
        'Add 24 to the end of the list inside the brackets. Run again.',
        '[20, 22, 25, 21]', '[20, 22, 25, 21, 24]',
        'Temperatures: [20, 22, 25, 21]\nNumber of readings: 4\n',
        'Temperatures: [20, 22, 25, 21, 24]\nNumber of readings: 5\n'),
    activity('2', 'First and last readings',
        'Python counts positions from 0. The position -1 means the last item.',
        'Which two temperatures will appear?',
        '''temperatures = [20, 22, 25, 21]
print("First reading:", temperatures[0])
print("Last reading:", temperatures[-1])''',
        'Change temperatures[0] to temperatures[1]. Predict the new first line before running.',
        'temperatures[0]', 'temperatures[1]',
        'First reading: 20\nLast reading: 21\n',
        'First reading: 22\nLast reading: 21\n'),
    activity('3', 'Selecting part of a list',
        'A slice selects part of a list. In [0:3], positions 0, 1, and 2 are included.',
        'Which readings will appear in the selected list?',
        '''speeds = [0, 500, 1000, 1500, 1502, 1498]
selected = speeds[0:3]
print("All readings:", speeds)
print("Selected readings:", selected)''',
        'Change [0:3] to [3:]. This selects readings from position 3 to the end.',
        '[0:3]', '[3:]',
        'All readings: [0, 500, 1000, 1500, 1502, 1498]\nSelected readings: [0, 500, 1000]\n',
        'All readings: [0, 500, 1000, 1500, 1502, 1498]\nSelected readings: [1500, 1502, 1498]\n'),
    activity('4', 'Correcting and adding readings',
        'We can correct an item using its position. append() adds one item at the end.',
        'What will the final list contain?',
        '''temperatures = [20, 22, 99, 21]
temperatures[2] = 25
temperatures.append(24)
print(temperatures)''',
        'Change the number inside append() from 24 to 26.',
        'append(24)', 'append(26)',
        '[20, 22, 25, 21, 24]\n', '[20, 22, 25, 21, 26]\n'),
    activity('5', 'Adding one item or several items',
        'insert() adds an item at a chosen position. extend() adds several items.',
        'Which temperature will become the first item?',
        '''temperatures = [22, 25]
temperatures.insert(0, 20)
temperatures.extend([21, 24])
print(temperatures)
print("Number of readings:", len(temperatures))''',
        'Replace extend with append. Look at the brackets in the result: append([21, 24]) adds the small list as one item.',
        'extend', 'append',
        '[20, 22, 25, 21, 24]\nNumber of readings: 5\n',
        '[20, 22, 25, [21, 24]]\nNumber of readings: 4\n'),
    activity('6', 'Removing an item',
        'remove() deletes the first matching item. pop() removes the last item and gives it back.',
        'Which part will be stored in removed_part?',
        '''parts = ["bolt", "nut", "washer", "nut", "pin"]
parts.remove("nut")
removed_part = parts.pop()
print("Removed last part:", removed_part)
print("Remaining parts:", parts)''',
        'Change remove("nut") to remove("washer"). Notice that remove("nut") removes only the first "nut".',
        'remove("nut")', 'remove("washer")',
        "Removed last part: pin\nRemaining parts: ['bolt', 'washer', 'nut']\n",
        "Removed last part: pin\nRemaining parts: ['bolt', 'nut', 'nut']\n"),
    activity('7', 'Reading items one at a time',
        'A for loop visits each item. enumerate() also gives each item a number.',
        'What number will appear beside the first reading?',
        '''temperatures = [20, 22, 25, 21]
for number, temperature in enumerate(temperatures, start=1):
    print("Reading", number, ":", temperature)''',
        'Change start=1 to start=0. The temperatures stay the same; their displayed numbers change.',
        'start=1', 'start=0',
        'Reading 1 : 20\nReading 2 : 22\nReading 3 : 25\nReading 4 : 21\n',
        'Reading 0 : 20\nReading 1 : 22\nReading 2 : 25\nReading 3 : 21\n'),
    activity('8', 'Adding lengths',
        'The variable total remembers the running total.',
        'What is the total length? Calculate it by hand first.',
        '''lengths = [100, 200, 300]
total = 0
for length in lengths:
    total = total + length
print("Number of parts:", len(lengths))
print("Total length:", total, "mm")''',
        'Change the last length from 300 to 400. Before running, predict how much the total will increase.',
        '300', '400',
        'Number of parts: 3\nTotal length: 600 mm\n',
        'Number of parts: 3\nTotal length: 700 mm\n'),
    activity('9', 'Counting readings above a limit',
        'The counter increases by one whenever a reading is above the limit.',
        'How many temperatures are above 23?',
        '''temperatures = [20, 22, 25, 21]
limit = 23
count = 0
for temperature in temperatures:
    if temperature > limit:
        count = count + 1
print("Readings above the limit:", count)''',
        'Change the limit from 23 to 21. A temperature equal to the limit does not count as above it.',
        'limit = 23', 'limit = 21',
        'Readings above the limit: 1\n', 'Readings above the limit: 2\n'),
    activity('10', 'Calculating an average',
        'First add the readings. Then divide the total by the number of readings.',
        'Will the average be below, equal to, or above 22?',
        '''temperatures = [20, 22, 24, 22]
total = 0
for temperature in temperatures:
    total = total + temperature
if temperatures:
    average = total / len(temperatures)
    print("Average temperature:", average)
else:
    print("No readings available.")''',
        'Change 24 to 28. Predict whether the average will increase or decrease.',
        '24', '28',
        'Average temperature: 22.0\n', 'Average temperature: 23.0\n'),
    activity('11', 'Finding the highest and lowest readings',
        'Start with the first reading. Replace the stored value when a higher or lower reading is found. Keep at least one reading in this list.',
        'What are the highest and lowest values? At which positions do they occur?',
        '''signal = [12, 15, 9, 21, 4]
highest = signal[0]
lowest = signal[0]
high_position = 0
low_position = 0
for position, value in enumerate(signal):
    if value > highest:
        highest = value
        high_position = position
    if value < lowest:
        lowest = value
        low_position = position
print("Highest:", highest, "at position", high_position)
print("Lowest:", lowest, "at position", low_position)
print("Difference:", highest - lowest)''',
        'Change 21 to 30. Check which results change.', '21', '30',
        'Highest: 21 at position 3\nLowest: 4 at position 4\nDifference: 17\n',
        'Highest: 30 at position 3\nLowest: 4 at position 4\nDifference: 26\n'),
    activity('12', 'Finding the first reading above a limit',
        'break stops the search when the first matching reading is found. Here, -1 means "not found yet".',
        'Which position will the program report? Remember that positions start at 0.',
        '''currents = [2, 3, 5, 4, 6]
limit = 4
first_position = -1
for position, current in enumerate(currents):
    if current > limit:
        first_position = position
        break
if first_position == -1:
    print("No reading above the limit.")
else:
    print("First position above the limit:", first_position)''',
        'Change the limit from 4 to 5.', 'limit = 4', 'limit = 5',
        'First position above the limit: 2\n', 'First position above the limit: 4\n'),
    activity('13', 'Keeping only the readings we want',
        'Filtering means selecting items that meet a condition.',
        'Which lengths will be included in long_parts?',
        '''lengths = [1200, 850, 60, 2400, 15]
long_parts = []
for length in lengths:
    if length >= 1000:
        long_parts.append(length)
print("All lengths:", lengths)
print("Long parts:", long_parts)''',
        'Change the limit from 1000 to 800. Predict which additional item will appear.',
        '1000', '800',
        'All lengths: [1200, 850, 60, 2400, 15]\nLong parts: [1200, 2400]\n',
        'All lengths: [1200, 850, 60, 2400, 15]\nLong parts: [1200, 850, 2400]\n'),
    activity('14', 'Converting millimetres to metres',
        'Each length is divided by 1000. The converted values go into a new list.',
        'What will 1200 mm become in metres?',
        '''lengths_mm = [1200, 850, 60]
lengths_m = []
for length in lengths_mm:
    lengths_m.append(length / 1000)
print("Millimetres:", lengths_mm)
print("Metres:", lengths_m)''',
        'Change the first length from 1200 to 2000. Check that the original list still contains millimetre values.',
        '1200', '2000',
        'Millimetres: [1200, 850, 60]\nMetres: [1.2, 0.85, 0.06]\n',
        'Millimetres: [2000, 850, 60]\nMetres: [2.0, 0.85, 0.06]\n'),
    activity('15', 'Keeping the original order',
        'Sorting changes the order of a list. Make a copy first when the original order matters. sort() changes the list and returns None; use it on its own line.',
        'Will original stay in its measurement order?',
        '''original = [3, 1, 2]
ordered = original.copy()
ordered.sort()
print("Original:", original)
print("Sorted copy:", ordered)''',
        'Replace ordered = original.copy() with ordered = original. Both names will refer to the same list. Run again and compare both lines.',
        'original.copy()', 'original',
        'Original: [3, 1, 2]\nSorted copy: [1, 2, 3]\n',
        'Original: [1, 2, 3]\nSorted copy: [1, 2, 3]\n', True),
    activity('16', 'Counting parts outside tolerance',
        'An acceptable diameter is between 9.95 and 10.05 mm, including both limits.',
        'How many diameters are outside this range?',
        '''diameters = [10.02, 9.97, 10.08, 9.93]
lower_limit = 9.95
upper_limit = 10.05
outside = 0
for diameter in diameters:
    if diameter < lower_limit or diameter > upper_limit:
        outside = outside + 1
print("Outside tolerance:", outside)
print("Inside tolerance:", len(diameters) - outside)''',
        'Change 10.08 to 10.05. Does a reading exactly on the limit count as outside?',
        '10.08', '10.05',
        'Outside tolerance: 2\nInside tolerance: 2\n',
        'Outside tolerance: 1\nInside tolerance: 3\n', True),
    activity('17', 'Ignoring the warm-up readings',
        'The first two readings were taken while the motor was accelerating.',
        'Which readings will remain after the warm-up is removed?',
        '''speeds = [0, 500, 1490, 1500, 1510]
warm_up = 2
steady_speeds = speeds[warm_up:]
total = 0
for speed in steady_speeds:
    total = total + speed
print("Selected readings:", steady_speeds)
if steady_speeds:
    print("Average speed:", total / len(steady_speeds))
else:
    print("No readings remain.")''',
        'Change warm_up from 2 to 3. Predict which reading will be removed next.',
        'warm_up = 2', 'warm_up = 3',
        'Selected readings: [1490, 1500, 1510]\nAverage speed: 1500.0\n',
        'Selected readings: [1500, 1510]\nAverage speed: 1505.0\n', True),
    activity('18', 'Smoothing readings with a moving average',
        'Take three neighbouring readings, calculate their average, and move one position forward. sum() adds the readings in each group.',
        'The first three readings are 20, 22, and 24. What is their average?',
        '''temperatures = [20, 22, 24, 26, 28]
window = 3
smoothed = []
for start in range(len(temperatures) - window + 1):
    group = temperatures[start:start + window]
    average = sum(group) / window
    smoothed.append(round(average, 1))
print("Original:", temperatures)
print("Smoothed:", smoothed)''',
        'Change window from 3 to 2. Look at how many results the program produces.',
        'window = 3', 'window = 2',
        'Original: [20, 22, 24, 26, 28]\nSmoothed: [22.0, 24.0, 26.0]\n',
        'Original: [20, 22, 24, 26, 28]\nSmoothed: [21.0, 23.0, 25.0, 27.0]\n', True),
    activity('19', 'A shorter way to filter a list',
        'This is a shorter version of Example 13. You may continue using the longer loop; you do not need to memorise this form.',
        'Will this produce the same long parts as Example 13 before its change?',
        '''lengths = [1200, 850, 60, 2400, 15]
long_parts = [length for length in lengths if length >= 1000]
print("Long parts:", long_parts)''',
        'Change 1000 to 800.', '1000', '800',
        'Long parts: [1200, 2400]\n', 'Long parts: [1200, 850, 2400]\n', True),
    activity('20A', 'The second largest different value',
        'Repeated readings do not create a new different value. Keep at least one reading in this list.',
        'In [340, 890, 890, 780], is the second largest different value 890 or 780?',
        '''pressures = [340, 890, 890, 780]
largest = pressures[0]
second = None
for pressure in pressures:
    if pressure > largest:
        second = largest
        largest = pressure
    elif pressure < largest:
        if second is None or pressure > second:
            second = pressure
print("Largest:", largest)
if second is None:
    print("No second different value.")
else:
    print("Second largest different value:", second)''',
        'Change 780 to 850.', '780', '850',
        'Largest: 890\nSecond largest different value: 780\n',
        'Largest: 890\nSecond largest different value: 850\n', True),
    activity('20B', 'Consecutive high temperatures',
        'We want to count high readings that occur next to each other.',
        'What is the longest group of consecutive temperatures above 80?',
        '''temperatures = [70, 85, 86, 75, 90, 91, 92]
current_run = 0
longest_run = 0
start_position = -1
for position, temperature in enumerate(temperatures):
    if temperature > 80:
        current_run = current_run + 1
        if current_run > longest_run:
            longest_run = current_run
            start_position = position - current_run + 1
    else:
        current_run = 0
print("Longest group:", longest_run, "readings")
print("Starting position:", start_position)''',
        'Change 75 to 85. Predict whether the two groups will join together.',
        '75', '85',
        'Longest group: 3 readings\nStarting position: 4\n',
        'Longest group: 6 readings\nStarting position: 1\n', True),
    activity('20C', 'A short sensor report',
        'A report combines several questions about the same readings. These are readings at specific hours; two high readings do not establish two continuous hours of high temperature.',
        'Which hour has the highest temperature?',
        '''hours = [0, 1, 2, 3]
temperatures = [20, 22, 28, 26]
total = 0
hot_readings = 0
highest = temperatures[0]
lowest = temperatures[0]
high_hour = hours[0]
low_hour = hours[0]
for position, temperature in enumerate(temperatures):
    total = total + temperature
    if temperature > 25:
        hot_readings = hot_readings + 1
    if temperature > highest:
        highest = temperature
        high_hour = hours[position]
    if temperature < lowest:
        lowest = temperature
        low_hour = hours[position]
print("Lowest:", lowest, "at hour", low_hour)
print("Highest:", highest, "at hour", high_hour)
print("Average:", total / len(temperatures))
print("Range:", highest - lowest)
print("Readings above 25:", hot_readings)''',
        'Change the final temperature from 26 to 30. Check which lines in the report change.',
        '26', '30',
        'Lowest: 20 at hour 0\nHighest: 28 at hour 2\nAverage: 24.0\nRange: 8\nReadings above 25: 2\n',
        'Lowest: 20 at hour 0\nHighest: 30 at hour 3\nAverage: 25.0\nRange: 10\nReadings above 25: 2\n', True),
    activity('21A', 'Detecting an OFF-to-ON transition',
        '0 means OFF and 1 means ON. A transition occurs when a 0 is followed by a 1. Start at position 1 because each reading needs a previous reading for comparison. This counts observed transitions; events between samples may be missed.',
        'How many OFF-to-ON transitions can you see?',
        '''signal = [0, 0, 1, 1, 0, 1]
transitions = []
for position in range(1, len(signal)):
    if signal[position - 1] == 0 and signal[position] == 1:
        transitions.append(position)
print("Transition positions:", transitions)
print("Number of transitions:", len(transitions))''',
        'Change the final 1 in the signal list to 0.',
        '[0, 0, 1, 1, 0, 1]', '[0, 0, 1, 1, 0, 0]',
        'Transition positions: [2, 5]\nNumber of transitions: 2\n',
        'Transition positions: [2]\nNumber of transitions: 1\n', True),
    activity('21B', 'Finding a sensor by name',
        'Each small list contains a sensor name and its reading. None means that no matching sensor has been found yet.',
        'What value belongs to sensor "T2"?',
        '''sensors = [["T1", 23.5], ["T2", 24.1], ["T3", 22.8]]
wanted = "T2"
found = None
for name, value in sensors:
    if name == wanted:
        found = value
        break
if found is None:
    print("Sensor not found.")
else:
    print(wanted, ":", found)''',
        'Change "T2" to "T3" in the wanted line only.',
        'wanted = "T2"', 'wanted = "T3"',
        'T2 : 24.1\n', 'T3 : 22.8\n', True),
]


def prepare(root):
    """Use the notebook shell, with offline-specific English teaching content."""
    nb = json.loads((root / 'notebooks/Week_06.ipynb').read_text())
    nb['cells'] = []
    nb['metadata']['cp1'] = {'week': 6, 'kind': 'lesson',
                             'offline_activities': len(ACTIVITIES),
                             'main_activities': 14, 'format': 'predict-run-change'}
    nb['metadata']['cp1_offline_week'] = 6

    def markdown(source, **metadata):
        nb['cells'].append(dict(cell_type='markdown', metadata=metadata,
                                source=source.splitlines(keepends=True)))

    markdown('''# Week 6: Lists and Readings

Computer Programming I · Dr. Arif Solmaz

**Your goal:** Understand what a short program does and make one small change.
You do not need to write a new program from scratch.

Use the same three steps for every example:

1. **Predict:** Say or write what you think will happen before running the code.
2. **Run:** Press Run on the code cell. Compare the result with your prediction.
3. **Change one thing:** Edit only the item requested, predict again, and rerun the same cell.

Each program includes its own data. You can run an example on its own or rerun it after a change.
Use **Undo last change** to step back one edit in that cell. Use **Restore original code**
to return to the starting example. These buttons change the code only; press Run again
to update the output. You can also undo a restore.

Examples 1–14 are the main activities. The remaining activities are optional.
Work at your own pace; you do not need to finish every example in one lesson.
''', offline_anchor='overview')
    markdown('''## Main activities

Start here. Talk to a partner if your prediction differs from the result.
''', offline_anchor='main-activities')
    for item in ACTIVITIES:
        if item['number'] == '15':
            markdown('''## Optional activities

Try these only when you are comfortable with the main examples.
Your teacher may choose just one activity. You do not need to complete them all.
''', offline_anchor='optional-activities')
        tag = dict(number=item['number'], optional=item['optional'])
        prefix = 'Optional example' if item['optional'] else 'Example'
        markdown(f"## {prefix} {item['number']}: {item['title']}\n\n"
                 f"{item['explanation']}\n\n"
                 f"### Predict\n\n{item['predict']}\n\n"
                 '### Run\n\nPress **Run** on the code cell below. Compare the output with your prediction.\n',
                 offline_anchor='example-' + item['number'].lower(),
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

Give students about 30 seconds to predict individually. Let them run the code and compare
with a partner. Ask for only the stated change, then ask: **What changed in the result?**
Short spoken answers are enough. Completing fewer examples with participation is sufficient.

### Participation and assessment

These activities are ungraded practice. No weekly submission is required.
Assessment remains the midterm exam (50%) and final exam (50%).
''', offline_anchor='finish')
    for index, cell in enumerate(nb['cells']):
        cell['id'] = f'w06-guided-{index:03d}'
    from guided_support import attach_guidance
    attach_guidance(nb, ACTIVITIES)
    return nb, len(nb['cells'])
