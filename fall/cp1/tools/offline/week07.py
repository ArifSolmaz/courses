"""Instructor-approved English Predict / Run / Change activities for Week 7."""
import json


def activity(number, title, explanation, predict, code, change, old, new,
             expected, changed_expected):
    return dict(number=str(number), title=title, explanation=explanation,
                predict=predict, code=code.strip() + '\n', change=change,
                old=old, new=new, expected=expected,
                changed_expected=changed_expected, optional=number >= 13)


ACTIVITIES = [
    activity(1, 'Finding a reading by sensor name',
        'Last week, we found readings by position. A dictionary lets us find a reading by name.',
        'What temperature belongs to sensor "T2"?',
        '''temperatures = {"T1": 20, "T2": 24, "T3": 22}
print("Temperature:", temperatures["T2"])''',
        'Change "T2" to "T3" in the print() line.',
        'temperatures["T2"]', 'temperatures["T3"]',
        'Temperature: 24\n', 'Temperature: 22\n'),
    activity(2, 'A dictionary of pin numbers',
        'Each name is a key. Its pin number is the value.',
        'How many entries are in this dictionary?',
        '''pins = {"LED": 13, "BUTTON": 2, "BUZZER": 9}
print("Pin map:", pins)
print("Number of entries:", len(pins))
print("LED pin:", pins["LED"])''',
        'Change the LED pin number from 13 to 12 inside the dictionary.',
        '"LED": 13', '"LED": 12',
        "Pin map: {'LED': 13, 'BUTTON': 2, 'BUZZER': 9}\nNumber of entries: 3\nLED pin: 13\n",
        "Pin map: {'LED': 12, 'BUTTON': 2, 'BUZZER': 9}\nNumber of entries: 3\nLED pin: 12\n"),
    activity(3, 'Checking whether a name exists',
        'in checks whether a key exists in a dictionary. This checks the names, not the pin numbers.',
        'Will the result be True or False?',
        '''pins = {"LED": 13, "BUTTON": 2}
wanted = "BUZZER"
print("Name exists:", wanted in pins)''',
        'Change wanted from "BUZZER" to "LED".',
        'wanted = "BUZZER"', 'wanted = "LED"',
        'Name exists: False\n', 'Name exists: True\n'),
    activity(4, 'Reading an unknown name safely',
        '.get() can return a message when a key is missing. Using messages["E05"] directly would cause a KeyError because that key is missing.',
        'Which message will appear?',
        '''messages = {
    "E01": "Sensor timeout",
    "E02": "Voltage low"
}
code = "E05"
print(messages.get(code, "Unknown code"))''',
        'Change code from "E05" to "E02".',
        'code = "E05"', 'code = "E02"',
        'Unknown code\n', 'Voltage low\n'),
    activity(5, 'Updating and adding entries',
        'Using an existing key changes its value. Using a new key adds an entry.',
        'What will the final bolt quantity be? How many different parts will appear?',
        '''stock = {"bolt": 10, "nut": 8}
stock["bolt"] = 15
stock["washer"] = 20
print("Stock:", stock)
print("Different parts:", len(stock))''',
        'Change stock["bolt"] = 15 to stock["bolt"] = 25.',
        'stock["bolt"] = 15', 'stock["bolt"] = 25',
        "Stock: {'bolt': 15, 'nut': 8, 'washer': 20}\nDifferent parts: 3\n",
        "Stock: {'bolt': 25, 'nut': 8, 'washer': 20}\nDifferent parts: 3\n"),
    activity(6, 'Removing an entry',
        'pop() removes an entry and gives back its value.',
        'Which quantity will be stored in removed_quantity?',
        '''stock = {"bolt": 10, "nut": 8, "washer": 20}
removed_quantity = stock.pop("washer")
print("Removed quantity:", removed_quantity)
print("Remaining stock:", stock)''',
        'Change "washer" to "nut" in the pop() line.',
        'pop("washer")', 'pop("nut")',
        "Removed quantity: 20\nRemaining stock: {'bolt': 10, 'nut': 8}\n",
        "Removed quantity: 8\nRemaining stock: {'bolt': 10, 'washer': 20}\n"),
    activity(7, 'The order of entries',
        'A dictionary remembers the order in which keys were added. Updating a value does not move its key.',
        'Which sensor name will appear first?',
        '''temperatures = {}
temperatures["T2"] = 24
temperatures["T1"] = 20
temperatures["T3"] = 22
temperatures["T2"] = 25
for name in temperatures:
    print(name)''',
        'Change the final temperature assignment from 25 to 30. Does changing a temperature change the order of the names?',
        '25', '30',
        'T2\nT1\nT3\n', 'T2\nT1\nT3\n'),
    activity(8, 'Printing names and values together',
        '.items() gives each key and its value together.',
        'How many lines will the loop print?',
        '''stock = {"bolt": 10, "nut": 8, "washer": 20}
for part, quantity in stock.items():
    print(part, ":", quantity)''',
        'Change the washer quantity from 20 to 5.',
        '"washer": 20', '"washer": 5',
        'bolt : 10\nnut : 8\nwasher : 20\n',
        'bolt : 10\nnut : 8\nwasher : 5\n'),
    activity(9, 'A tuple holds a small record',
        'A tuple can keep two related values together. Here, they are time and temperature. Editing the starting record and rerunning the program is allowed; an existing tuple does not support item replacement such as sample[1] = 28.',
        'Which number is the time? Which is the temperature?',
        '''sample = (10, 24)
print("Time:", sample[0], "seconds")
print("Temperature:", sample[1], "C")''',
        'Change 24 to 28 inside the tuple.', '24', '28',
        'Time: 10 seconds\nTemperature: 24 C\n',
        'Time: 10 seconds\nTemperature: 28 C\n'),
    activity(10, 'Giving tuple values meaningful names',
        'Unpacking gives a separate name to each value. The two names receive the values in the same order.',
        'What will time and temperature contain?',
        '''sample = (10, 24)
time, temperature = sample
print("Time:", time)
print("Temperature:", temperature)''',
        'Change the time inside sample from 10 to 20.', '10', '20',
        'Time: 10\nTemperature: 24\n', 'Time: 20\nTemperature: 24\n'),
    activity(11, 'Looking up a calibration factor',
        'A sensor must have a known calibration factor before this program corrects its reading. A missing factor means "not calibrated". We should not silently invent a factor for that sensor.',
        'Will the program calculate a corrected reading for "H1"?',
        '''factors = {"T1": 1.02, "T2": 0.98}
sensor = "H1"
raw_reading = 20
if sensor in factors:
    corrected = raw_reading * factors[sensor]
    print("Corrected reading:", corrected)
else:
    print("No calibration factor for", sensor)''',
        'Change sensor from "H1" to "T1".',
        'sensor = "H1"', 'sensor = "T1"',
        'No calibration factor for H1\n', 'Corrected reading: 20.4\n'),
    activity(12, 'Several time-temperature records',
        'A list can hold several tuples. Each tuple describes one observation.',
        'Which temperature was recorded at time 20?',
        '''samples = [(0, 20), (10, 24), (20, 22)]
for time, temperature in samples:
    print("Time:", time, "Temperature:", temperature)''',
        'Change the final tuple from (20, 22) to (20, 26).',
        '(20, 22)', '(20, 26)',
        'Time: 0 Temperature: 20\nTime: 10 Temperature: 24\nTime: 20 Temperature: 22\n',
        'Time: 0 Temperature: 20\nTime: 10 Temperature: 24\nTime: 20 Temperature: 26\n'),
    activity(13, 'Counting status codes',
        'The dictionary stores one counter for each status code.',
        'How many times does "OK" appear?',
        '''status_log = ["OK", "WARN", "OK", "ERR", "OK"]
counts = {}
for status in status_log:
    if status not in counts:
        counts[status] = 0
    counts[status] = counts[status] + 1
print("Counts:", counts)
print("Total codes:", sum(counts.values()))''',
        'Change "ERR" to "WARN" in status_log. Which two counts change?',
        '"ERR"', '"WARN"',
        "Counts: {'OK': 3, 'WARN': 1, 'ERR': 1}\nTotal codes: 5\n",
        "Counts: {'OK': 3, 'WARN': 2}\nTotal codes: 5\n"),
    activity(14, 'Finding the most frequent status',
        'The program compares the stored counts.',
        'Which status has the highest count?',
        '''counts = {"OK": 3, "WARN": 2, "ERR": 1}
most_common = None
highest_count = 0
for status, count in counts.items():
    if count > highest_count:
        most_common = status
        highest_count = count
print("Most frequent:", most_common)
print("Count:", highest_count)''',
        'Change the count for "WARN" from 2 to 4.',
        '"WARN": 2', '"WARN": 4',
        'Most frequent: OK\nCount: 3\n', 'Most frequent: WARN\nCount: 4\n'),
    activity(15, 'Grouping readings by sensor',
        'Each sensor name gets its own list of readings.',
        'Which two values belong to "T1"?',
        '''readings = [("T1", 20), ("T2", 24), ("T1", 22)]
groups = {}
for sensor, temperature in readings:
    if sensor not in groups:
        groups[sensor] = []
    groups[sensor].append(temperature)
print(groups)''',
        'Change the final record from ("T1", 22) to ("T2", 22). Which group receives the last reading now?',
        '("T1", 22)', '("T2", 22)',
        "{'T1': [20, 22], 'T2': [24]}\n", "{'T1': [20], 'T2': [24, 22]}\n"),
    activity(16, 'Average temperature for each sensor',
        'Each dictionary value is a list. We calculate an average for each list.',
        'Which sensor has the higher average?',
        '''groups = {"T1": [20, 22], "T2": [24, 26]}
warmest = None
highest_average = None
for sensor, readings in groups.items():
    if readings:
        average = sum(readings) / len(readings)
        print(sensor, "average:", average)
        if highest_average is None or average > highest_average:
            highest_average = average
            warmest = sensor
print("Highest average belongs to:", warmest)''',
        'Change the "T1" readings from [20, 22] to [28, 30].',
        '[20, 22]', '[28, 30]',
        'T1 average: 21.0\nT2 average: 25.0\nHighest average belongs to: T2\n',
        'T1 average: 29.0\nT2 average: 25.0\nHighest average belongs to: T1\n'),
    activity(17, 'A part record with named fields',
        'A dictionary can contain another dictionary. The outer key selects the part; the inner key selects a field.',
        'Which part has fewer than five pieces in stock?',
        '''parts = {
    "P1": {"name": "bearing", "quantity": 4, "unit_cost": 5},
    "P2": {"name": "bolt", "quantity": 10, "unit_cost": 1}
}
total_value = 0
for part_id, record in parts.items():
    value = record["quantity"] * record["unit_cost"]
    total_value = total_value + value
    print(part_id, record["name"], "stock value:", value)
    if record["quantity"] < 5:
        print("Low stock:", part_id)
print("Total stock value:", total_value)''',
        'Change the bearing quantity from 4 to 6. Check the stock value and the low-stock message.',
        '"quantity": 4', '"quantity": 6',
        'P1 bearing stock value: 20\nLow stock: P1\nP2 bolt stock value: 10\nTotal stock value: 30\n',
        'P1 bearing stock value: 30\nP2 bolt stock value: 10\nTotal stock value: 40\n'),
    activity(18, 'Finding a pin name from its number',
        'The original dictionary goes from name to number. The reverse dictionary goes from number to name. For this example, each name must have a different pin number.',
        'Which name belongs to pin 9?',
        '''pins = {"LED": 13, "BUTTON": 2, "BUZZER": 9}
names_by_pin = {}
for name, number in pins.items():
    names_by_pin[number] = name
wanted_pin = 9
print(names_by_pin.get(wanted_pin, "Not assigned"))''',
        'Change wanted_pin from 9 to 5.',
        'wanted_pin = 9', 'wanted_pin = 5',
        'BUZZER\n', 'Not assigned\n'),
    activity(19, 'Counting words in a message',
        '.split() separates this message into words. The dictionary counts them. Words are counted exactly as written: "WARN" and "warn" would be different.',
        'Which word appears more than once?',
        '''message = "WARN sensor WARN"
counts = {}
for word in message.split():
    counts[word] = counts.get(word, 0) + 1
for word, count in counts.items():
    if count > 1:
        print("Repeated word:", word, "Count:", count)
print("Different words:", len(counts))''',
        'Change the message to "WARN sensor OK".',
        '"WARN sensor WARN"', '"WARN sensor OK"',
        'Repeated word: WARN Count: 2\nDifferent words: 2\n', 'Different words: 3\n'),
    activity(20, 'Applying user settings',
        "Start with the default settings, then apply the user's choices.",
        'Will the final sampling rate be 10 or 20?',
        '''defaults = {"rate_hz": 10, "unit": "C"}
user_settings = {"rate_hz": 20}
settings = defaults.copy()
for name, value in user_settings.items():
    settings[name] = value
print("Defaults:", defaults)
print("Final settings:", settings)''',
        'Change the user sampling rate from 20 to 50. Check that the default settings remain unchanged.',
        'user_settings = {"rate_hz": 20}', 'user_settings = {"rate_hz": 50}',
        "Defaults: {'rate_hz': 10, 'unit': 'C'}\nFinal settings: {'rate_hz': 20, 'unit': 'C'}\n",
        "Defaults: {'rate_hz': 10, 'unit': 'C'}\nFinal settings: {'rate_hz': 50, 'unit': 'C'}\n"),
    activity(21, 'Finding the time of the highest temperature',
        'Each tuple contains a time and a temperature. When a higher temperature is found, both are saved. Keep at least one sample in this list.',
        'At what time does the highest temperature occur?',
        '''samples = [(0, 20), (10, 26), (20, 24)]
peak_time, peak_temperature = samples[0]
warm_count = 0
for time, temperature in samples:
    if temperature > peak_temperature:
        peak_time = time
        peak_temperature = temperature
    if temperature >= 24:
        warm_count = warm_count + 1
print("Highest temperature:", peak_temperature)
print("Time:", peak_time)
print("Readings at or above 24:", warm_count)''',
        'Change the final sample from (20, 24) to (20, 28).',
        '(20, 24)', '(20, 28)',
        'Highest temperature: 26\nTime: 10\nReadings at or above 24: 2\n',
        'Highest temperature: 28\nTime: 20\nReadings at or above 24: 2\n'),
    activity(22, 'Recording defects on a grid',
        'A (row, column) tuple can identify a location. This dictionary stores only locations with recorded defects. Both numbers in these coordinate tuples are integers, so the tuples can be dictionary keys.',
        'What is recorded at row 1, column 1?',
        '''defects = {
    (0, 2): "scratch",
    (1, 1): "dent"
}
position = (1, 1)
print("Location:", position)
print("Recorded defect:", defects.get(position, "No recorded defect"))''',
        'Change position from (1, 1) to (0, 0).',
        'position = (1, 1)', 'position = (0, 0)',
        'Location: (1, 1)\nRecorded defect: dent\n',
        'Location: (0, 0)\nRecorded defect: No recorded defect\n'),
    activity(23, 'Building a table of sensor limits',
        'The names and limits start in two lists. Matching positions belong together. For this example, the two starting lists must have equal lengths, and sensor names must be unique.',
        'What limit will the program store for "T2"?',
        '''sensor_names = ["T1", "T2"]
limits = [60, 75]
limit_by_sensor = {}
for position in range(len(sensor_names)):
    name = sensor_names[position]
    limit_by_sensor[name] = limits[position]
measurements = [("T1", 58), ("T2", 70), ("H1", 40)]
for sensor, reading in measurements:
    if sensor not in limit_by_sensor:
        print(sensor, ": no limit available")
    elif reading > limit_by_sensor[sensor]:
        print(sensor, ": OVER limit")
    else:
        print(sensor, ": within limit")''',
        'Change the "T2" limit from 75 to 65 in limits.', '75', '65',
        'T1 : within limit\nT2 : within limit\nH1 : no limit available\n',
        'T1 : within limit\nT2 : OVER limit\nH1 : no limit available\n'),
    activity(24, 'Keeping the latest reading',
        'A list can keep every observation. A dictionary can keep the latest value for each sensor.',
        'Which value will remain under "T1"?',
        '''readings = [("T1", 20), ("T2", 24), ("T1", 22)]
latest = {}
counts = {}
for sensor, temperature in readings:
    latest[sensor] = temperature
    counts[sensor] = counts.get(sensor, 0) + 1
print("All readings:", readings)
print("Latest readings:", latest)
print("Reading counts:", counts)''',
        'Change the final temperature from 22 to 28. Does the number of readings change?',
        '22', '28',
        "All readings: [('T1', 20), ('T2', 24), ('T1', 22)]\nLatest readings: {'T1': 22, 'T2': 24}\nReading counts: {'T1': 2, 'T2': 1}\n",
        "All readings: [('T1', 20), ('T2', 24), ('T1', 28)]\nLatest readings: {'T1': 28, 'T2': 24}\nReading counts: {'T1': 2, 'T2': 1}\n"),
    activity(25, 'Preview of next week: reading a device message',
        'A device message contains three fields separated by commas. Keep exactly three comma-separated fields. The middle field must be a number for this example.',
        'Which field contains the temperature?',
        '''message = "T1,23.5,OK"
fields = message.split(",")
record = {
    "sensor": fields[0],
    "temperature": float(fields[1]),
    "status": fields[2]
}
print("Sensor:", record["sensor"])
print("Temperature:", record["temperature"])
print("Status:", record["status"])''',
        'Change 23.5 to 28.0 inside the message.', '23.5', '28.0',
        'Sensor: T1\nTemperature: 23.5\nStatus: OK\n',
        'Sensor: T1\nTemperature: 28.0\nStatus: OK\n'),
]


def prepare(root):
    """Create the standalone guided edition without rewriting Colab notebooks."""
    nb = json.loads((root / 'notebooks/Week_07.ipynb').read_text())
    nb['cells'] = []
    nb['metadata']['cp1'] = {'week': 7, 'kind': 'lesson',
                             'offline_activities': len(ACTIVITIES),
                             'main_activities': 12, 'format': 'predict-run-change'}
    nb['metadata']['cp1_offline_week'] = 7

    def markdown(source, **metadata):
        nb['cells'].append(dict(cell_type='markdown', metadata=metadata,
                                source=source.splitlines(keepends=True)))

    markdown('''# Week 7: Dictionaries and Tuples

Computer Programming I · Dr. Arif Solmaz

**Your goal:** Find information by name, understand a short program, and make one small change.
You do not need to write a new program from scratch.

Use the same three steps for every example:

1. **Predict:** Say what you think will happen before running the code.
2. **Run:** Press Run on the supplied code and compare the result with your prediction.
3. **Change one thing:** Make the requested change, predict again, and rerun the same cell.

Each example includes its own data and runs independently. Use **Undo last change** to
step back one edit in that cell. Use **Restore original code** to return to the starting
example. These buttons change the code only; press Run again to update the output.
You can also undo a restore.

Examples 1–12 are the main activities. Examples 13–25 are optional.
You do not need to complete every example in one lesson.
''', offline_anchor='overview')
    markdown('''## Main activities

Start here. Talk to a partner if your prediction differs from the result.
''', offline_anchor='main-activities')
    for item in ACTIVITIES:
        if item['number'] == '13':
            markdown('''## Optional activities

These activities combine ideas. Your teacher may choose one or two when you are ready.
You do not need to complete them all.
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

Give students a short pause to predict, let them run the code, then ask for the single change.
Finish with: **What changed in the result?** Short spoken answers are enough.
The immediate aim is to connect a sensor name, a stored value, and the program's output.

### Participation and assessment

These activities are ungraded practice. No weekly submission is required.
Assessment remains the midterm exam (50%) and final exam (50%).
''', offline_anchor='finish')
    for index, cell in enumerate(nb['cells']):
        cell['id'] = f'w07-guided-{index:03d}'
    return nb, len(nb['cells'])
