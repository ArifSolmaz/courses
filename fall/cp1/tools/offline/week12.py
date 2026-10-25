"""Approved English Predict / Run / Change activities for Week 12."""
import json

ACTIVITIES = [{'number': '1',
  'title': 'Create a file and read it back',
  'explanation': 'Write mode creates a file. Read mode reads its contents.',
  'predict': 'What message will appear?',
  'code': 'with open("w12_ex01.txt", "w", encoding="utf-8") as file:\n'
          "    file.write('Motor ready.')\n"
          'with open("w12_ex01.txt", "r", encoding="utf-8") as file:\n'
          '    message = file.read()\n'
          'print(message)\n',
  'change': 'Change Motor ready. to Sensor ready.',
  'old': 'Motor ready.',
  'new': 'Sensor ready.',
  'expected': 'Motor ready.\n',
  'changed_expected': 'Sensor ready.\n',
  'optional': False},
 {'number': '2',
  'title': 'Starting a new line',
  'explanation': 'Writing text does not automatically start a new line. The characters \\n mark a '
                 'line ending.',
  'predict': 'Will T1 and T2 appear together or on separate lines?',
  'code': 'with open("w12_ex02.txt", "w", encoding="utf-8") as file:\n'
          '    file.write("T1")\n'
          '    file.write("T2\\n")\n'
          'with open("w12_ex02.txt", "r", encoding="utf-8") as file:\n'
          '    print(file.read())\n',
  'change': 'Add \\n after T1 in the first write.',
  'old': 'file.write("T1")',
  'new': 'file.write("T1\\n")',
  'expected': 'T1T2\n\n',
  'changed_expected': 'T1\nT2\n\n',
  'optional': False},
 {'number': '3',
  'title': 'Reading the first line',
  'explanation': 'readline() reads one line. rstrip("\\n") removes its ending before printing.',
  'predict': 'Which message will appear?',
  'code': 'with open("w12_ex03.txt", "w", encoding="utf-8") as file:\n'
          "    file.write('Motor ready.\\nSensor ready.\\n')\n"
          'with open("w12_ex03.txt", "r", encoding="utf-8") as file:\n'
          '    first_line = file.readline()\n'
          'print(first_line.rstrip("\\n"))\n',
  'change': 'Swap the two messages in the text being written.',
  'old': 'Motor ready.\\nSensor ready.',
  'new': 'Sensor ready.\\nMotor ready.',
  'expected': 'Motor ready.\n',
  'changed_expected': 'Sensor ready.\n',
  'optional': False},
 {'number': '4',
  'title': 'Reading lines into a list',
  'explanation': 'readlines() keeps line endings and returns a list.',
  'predict': 'How many items will the list contain?',
  'code': 'with open("w12_ex04.txt", "w", encoding="utf-8") as file:\n'
          "    file.write('20\\n24\\n22\\n')\n"
          'with open("w12_ex04.txt", "r", encoding="utf-8") as file:\n'
          '    lines = file.readlines()\n'
          'print("Lines:", lines)\n'
          'print("Number of lines:", len(lines))\n',
  'change': 'Add a fourth line containing 26.',
  'old': '20\\n24\\n22\\n',
  'new': '20\\n24\\n22\\n26\\n',
  'expected': "Lines: ['20\\n', '24\\n', '22\\n']\nNumber of lines: 3\n",
  'changed_expected': "Lines: ['20\\n', '24\\n', '22\\n', '26\\n']\nNumber of lines: 4\n",
  'optional': False},
 {'number': '5',
  'title': 'Reading one line at a time',
  'explanation': 'A loop reads a file one line at a time.',
  'predict': 'How many Reading messages will appear?',
  'code': 'with open("w12_ex05.txt", "w", encoding="utf-8") as file:\n'
          "    file.write('20\\n24\\n22\\n')\n"
          'with open("w12_ex05.txt", "r", encoding="utf-8") as file:\n'
          '    for line in file:\n'
          '        print("Reading:", line.rstrip("\\n"))\n',
  'change': 'Change the middle reading from 24 to 30.',
  'old': '24\\n',
  'new': '30\\n',
  'expected': 'Reading: 20\nReading: 24\nReading: 22\n',
  'changed_expected': 'Reading: 20\nReading: 30\nReading: 22\n',
  'optional': False},
 {'number': '6',
  'title': 'The file closes after the with block',
  'explanation': 'The with block closes the file when the block ends.',
  'predict': 'When will file.closed become True?',
  'code': 'with open("w12_ex06.txt", "w", encoding="utf-8") as file:\n'
          '    file.write("Test complete.")\n'
          '    print("Closed inside block:", file.closed)\n'
          'print("Closed after block:", file.closed)\n',
  'change': 'Change Test complete. to Measurement complete. Does the closed status change?',
  'old': 'Test complete.',
  'new': 'Measurement complete.',
  'expected': 'Closed inside block: False\nClosed after block: True\n',
  'changed_expected': 'Closed inside block: False\nClosed after block: True\n',
  'optional': False},
 {'number': '7',
  'title': 'Write mode replaces existing contents',
  'explanation': 'Opening an existing file with w replaces its contents.',
  'predict': 'Will both messages remain?',
  'code': 'with open("w12_ex07.txt", "w", encoding="utf-8") as file:\n'
          '    file.write("First message.\\n")\n'
          'with open("w12_ex07.txt", "w", encoding="utf-8") as file:\n'
          '    file.write("Second message.\\n")\n'
          'with open("w12_ex07.txt", "r", encoding="utf-8") as file:\n'
          '    print(file.read())\n',
  'change': 'Change Second message. to New result.',
  'old': 'Second message.',
  'new': 'New result.',
  'expected': 'Second message.\n\n',
  'changed_expected': 'New result.\n\n',
  'optional': False},
 {'number': '8',
  'title': 'Append mode adds to the end',
  'explanation': 'Append mode a adds text. The first block resets this demonstration file on every '
                 'run.',
  'predict': 'Will the output contain one message or two?',
  'code': 'with open("w12_ex08.txt", "w", encoding="utf-8") as file:\n'
          '    file.write("Motor started.\\n")\n'
          'with open("w12_ex08.txt", "a", encoding="utf-8") as file:\n'
          '    file.write("Measurement saved.\\n")\n'
          'with open("w12_ex08.txt", "r", encoding="utf-8") as file:\n'
          '    print(file.read())\n',
  'change': 'Change only the second open mode from a to w.',
  'old': 'open("w12_ex08.txt", "a"',
  'new': 'open("w12_ex08.txt", "w"',
  'expected': 'Motor started.\nMeasurement saved.\n\n',
  'changed_expected': 'Measurement saved.\n\n',
  'optional': False},
 {'number': '9',
  'title': 'Writing a list of lines',
  'explanation': 'writelines() writes the supplied strings, including their line endings.',
  'predict': 'Will there be three lines?',
  'code': 'lines = ["T1\\n", "T2\\n", "T3\\n"]\n'
          'with open("w12_ex09.txt", "w", encoding="utf-8") as file:\n'
          '    file.writelines(lines)\n'
          'with open("w12_ex09.txt", "r", encoding="utf-8") as file:\n'
          '    print(file.read())\n',
  'change': 'Add "T4\\n" to the list.',
  'old': '"T3\\n"]',
  'new': '"T3\\n", "T4\\n"]',
  'expected': 'T1\nT2\nT3\n\n',
  'changed_expected': 'T1\nT2\nT3\nT4\n\n',
  'optional': False},
 {'number': '10',
  'title': 'Reading numbers and adding them',
  'explanation': 'Each sample line contains an integer. int() converts its text into a number.',
  'predict': 'What total do you expect?',
  'code': 'total = 0\n'
          'with open("w12_ex10.txt", "w", encoding="utf-8") as file:\n'
          "    file.write('10\\n20\\n30\\n')\n"
          'with open("w12_ex10.txt", "r", encoding="utf-8") as file:\n'
          '    for line in file:\n'
          '        total += int(line)\n'
          'print("Total:", total)\n',
  'change': 'Change 30 to 40 in the sample file.',
  'old': '30\\n',
  'new': '40\\n',
  'expected': 'Total: 60\n',
  'changed_expected': 'Total: 70\n',
  'optional': False},
 {'number': '11',
  'title': 'Saving and reading CSV rows',
  'explanation': 'CSV stores rows of fields. csv.reader returns each field as text.',
  'predict': 'Will the readings be strings or numbers?',
  'code': 'import csv\n'
          '\n'
          "rows = [['T1', 20], ['T2', 24]]\n"
          'with open("w12_ex11.csv", "w", newline="", encoding="utf-8") as file:\n'
          '    csv.writer(file).writerows(rows)\n'
          'with open("w12_ex11.csv", "r", newline="", encoding="utf-8") as file:\n'
          '    for row in csv.reader(file):\n'
          '        print(row)\n',
  'change': 'Change the T2 reading from 24 to 28.',
  'old': "['T2', 24]",
  'new': "['T2', 28]",
  'expected': "['T1', '20']\n['T2', '24']\n",
  'changed_expected': "['T1', '20']\n['T2', '28']\n",
  'optional': False},
 {'number': '12',
  'title': 'A CSV header names the columns',
  'explanation': 'next(reader) reads the header before the data loop starts.',
  'predict': 'Will sensor appear as a data row?',
  'code': 'import csv\n'
          '\n'
          "rows = [['sensor', 'temperature_c'], ['T1', 20], ['T2', 24]]\n"
          'with open("w12_ex12.csv", "w", newline="", encoding="utf-8") as file:\n'
          '    csv.writer(file).writerows(rows)\n'
          'with open("w12_ex12.csv", "r", newline="", encoding="utf-8") as file:\n'
          '    reader = csv.reader(file)\n'
          '    header = next(reader)\n'
          '    print("Columns:", header)\n'
          '    for row in reader:\n'
          '        print("Data:", row)\n',
  'change': 'Change the sensor label T2 to T3.',
  'old': "['T2', 24]",
  'new': "['T3', 24]",
  'expected': "Columns: ['sensor', 'temperature_c']\nData: ['T1', '20']\nData: ['T2', '24']\n",
  'changed_expected': "Columns: ['sensor', 'temperature_c']\n"
                      "Data: ['T1', '20']\n"
                      "Data: ['T3', '24']\n",
  'optional': False},
 {'number': '13',
  'title': 'Converting a CSV field into a number',
  'explanation': 'Use float() before adding a numeric adjustment to a CSV reading.',
  'predict': 'What is 24 plus the adjustment?',
  'code': 'import csv\n'
          '\n'
          "rows = [['T1', 24]]\n"
          'with open("w12_ex13.csv", "w", newline="", encoding="utf-8") as file:\n'
          '    csv.writer(file).writerows(rows)\n'
          'with open("w12_ex13.csv", "r", newline="", encoding="utf-8") as file:\n'
          '    row = next(csv.reader(file))\n'
          'sensor = row[0]\n'
          'temperature = float(row[1])\n'
          'print(sensor, "adjusted reading:", temperature + 1)\n',
  'change': 'Change the saved reading from 24 to 30.',
  'old': "['T1', 24]",
  'new': "['T1', 30]",
  'expected': 'T1 adjusted reading: 25.0\n',
  'changed_expected': 'T1 adjusted reading: 31.0\n',
  'optional': False},
 {'number': '14',
  'title': 'A comma can belong inside a field',
  'explanation': 'The CSV writer and reader preserve a comma inside a label.',
  'predict': 'Will the row contain two fields or three?',
  'code': 'import csv\n'
          '\n'
          "rows = [['Arm, left', 20]]\n"
          'with open("w12_ex14.csv", "w", newline="", encoding="utf-8") as file:\n'
          '    csv.writer(file).writerows(rows)\n'
          'with open("w12_ex14.csv", "r", newline="", encoding="utf-8") as file:\n'
          '    row = next(csv.reader(file))\n'
          'print("Label:", row[0])\n'
          'print("Reading text:", row[1])\n'
          'print("Number of fields:", len(row))\n',
  'change': 'Change Arm, left to Arm, right.',
  'old': 'Arm, left',
  'new': 'Arm, right',
  'expected': 'Label: Arm, left\nReading text: 20\nNumber of fields: 2\n',
  'changed_expected': 'Label: Arm, right\nReading text: 20\nNumber of fields: 2\n',
  'optional': False},
 {'number': '15',
  'title': 'Copying text to another file',
  'explanation': 'Read the source text, write a copy, and compare what was saved.',
  'predict': 'Will the copied text match?',
  'code': 'with open("w12_ex15_source.txt", "w", encoding="utf-8") as file:\n'
          '    file.write("Motor ready.\\n")\n'
          'with open("w12_ex15_source.txt", "r", encoding="utf-8") as file:\n'
          '    original = file.read()\n'
          'with open("w12_ex15_copy.txt", "w", encoding="utf-8") as file:\n'
          '    file.write(original)\n'
          'with open("w12_ex15_copy.txt", "r", encoding="utf-8") as file:\n'
          '    copied = file.read()\n'
          'print("Same text:", copied == original)\n',
  'change': 'Change the source message to Sensor ready.',
  'old': 'Motor ready.',
  'new': 'Sensor ready.',
  'expected': 'Same text: True\n',
  'changed_expected': 'Same text: True\n',
  'optional': True},
 {'number': '16',
  'title': 'Searching a file',
  'explanation': 'Compare lowercase versions to find a word regardless of letter case. Use a '
                 'nonempty keyword.',
  'predict': 'Which line numbers contain motor?',
  'code': 'keyword = "motor"\n'
          'with open("w12_ex16.txt", "w", encoding="utf-8") as file:\n'
          "    file.write('Motor started.\\nSensor ready.\\nMOTOR stopped.\\n')\n"
          'with open("w12_ex16.txt", "r", encoding="utf-8") as file:\n'
          '    for number, line in enumerate(file, start=1):\n'
          '        if keyword.lower() in line.lower():\n'
          '            print("Line", number, ":", line.rstrip("\\n"))\n',
  'change': 'Change the keyword from motor to sensor.',
  'old': 'keyword = "motor"',
  'new': 'keyword = "sensor"',
  'expected': 'Line 1 : Motor started.\nLine 3 : MOTOR stopped.\n',
  'changed_expected': 'Line 2 : Sensor ready.\n',
  'optional': True},
 {'number': '17',
  'title': 'An average from a text file',
  'explanation': 'Blank lines are skipped; a blank line is not a zero reading. Other sample lines '
                 'contain finite numbers.',
  'predict': 'How many readings will be included?',
  'code': 'readings = []\n'
          'with open("w12_ex17.txt", "w", encoding="utf-8") as file:\n'
          "    file.write('20\\n\\n24\\n22\\n')\n"
          'with open("w12_ex17.txt", "r", encoding="utf-8") as file:\n'
          '    for line in file:\n'
          '        if line.strip():\n'
          '            readings.append(float(line))\n'
          'print("Readings:", readings)\n'
          'if readings:\n'
          '    print("Average:", sum(readings) / len(readings))\n'
          'else:\n'
          '    print("No readings.")\n',
  'change': 'Change 24 to 30.',
  'old': '24\\n',
  'new': '30\\n',
  'expected': 'Readings: [20.0, 24.0, 22.0]\nAverage: 22.0\n',
  'changed_expected': 'Readings: [20.0, 30.0, 22.0]\nAverage: 24.0\n',
  'optional': True},
 {'number': '18',
  'title': 'Handling a missing file',
  'explanation': 'This temporary folder contains readings.txt. The selected missing.txt does not '
                 'exist.',
  'predict': 'Will we see contents or a missing-file message?',
  'code': 'from pathlib import Path\n'
          'from tempfile import TemporaryDirectory\n'
          '\n'
          'with TemporaryDirectory() as folder:\n'
          '    sample = Path(folder) / "readings.txt"\n'
          '    sample.write_text("20,24,22", encoding="utf-8")\n'
          '    filename = "missing.txt"\n'
          '    try:\n'
          '        text = (Path(folder) / filename).read_text(encoding="utf-8")\n'
          '        print("Contents:", text)\n'
          '    except FileNotFoundError:\n'
          '        print("Selected file not found.")\n',
  'change': 'Change filename to readings.txt.',
  'old': 'filename = "missing.txt"',
  'new': 'filename = "readings.txt"',
  'expected': 'Selected file not found.\n',
  'changed_expected': 'Contents: 20,24,22\n',
  'optional': True},
 {'number': '19',
  'title': 'A file inside a folder',
  'explanation': 'Path joins a folder and a filename. mkdir creates the demonstration folder.',
  'predict': 'What folder and filename will appear?',
  'code': 'from pathlib import Path\n'
          '\n'
          'folder = Path("w12_ex19_data")\n'
          'folder.mkdir(exist_ok=True)\n'
          'path = folder / "readings.txt"\n'
          'path.write_text("20\\n24\\n", encoding="utf-8")\n'
          'print("Folder:", path.parent)\n'
          'print("Filename:", path.name)\n'
          'print("Exists:", path.exists())\n',
  'change': 'Change readings.txt to temperatures.txt.',
  'old': '"readings.txt"',
  'new': '"temperatures.txt"',
  'expected': 'Folder: w12_ex19_data\nFilename: readings.txt\nExists: True\n',
  'changed_expected': 'Folder: w12_ex19_data\nFilename: temperatures.txt\nExists: True\n',
  'optional': True},
 {'number': '20',
  'title': 'Checking a CSV round trip',
  'explanation': 'A round trip checks whether saving and reading preserves the fields. It does not '
                 'check measurement accuracy.',
  'predict': 'Will the restored rows match the original?',
  'code': 'import csv\n'
          '\n'
          "rows = [['sensor', 'reading'], ['Arm, left', '20'], ['T2', '24']]\n"
          'with open("w12_ex20.csv", "w", newline="", encoding="utf-8") as file:\n'
          '    csv.writer(file).writerows(rows)\n'
          'with open("w12_ex20.csv", "r", newline="", encoding="utf-8") as file:\n'
          '    restored = list(csv.reader(file))\n'
          'print("Same rows:", restored == rows)\n'
          'print("Restored:", restored)\n',
  'change': 'Change Arm, left to Arm, right.',
  'old': 'Arm, left',
  'new': 'Arm, right',
  'expected': 'Same rows: True\n'
              "Restored: [['sensor', 'reading'], ['Arm, left', '20'], ['T2', '24']]\n",
  'changed_expected': 'Same rows: True\n'
                      "Restored: [['sensor', 'reading'], ['Arm, right', '20'], ['T2', '24']]\n",
  'optional': True},
 {'number': '21',
  'title': 'Saving an inventory',
  'explanation': 'Convert saved quantity and unit price before calculating stock value.',
  'predict': 'What is the value of the bolts?',
  'code': 'import csv\n'
          '\n'
          "rows = [['part', 'quantity', 'unit_price'], ['bolt', 10, 2.5], ['nut', 20, 1.0]]\n"
          'with open("w12_ex21.csv", "w", newline="", encoding="utf-8") as file:\n'
          '    csv.writer(file).writerows(rows)\n'
          'with open("w12_ex21.csv", "r", newline="", encoding="utf-8") as file:\n'
          '    reader = csv.reader(file)\n'
          '    next(reader)\n'
          '    for part, quantity_text, price_text in reader:\n'
          '        value = int(quantity_text) * float(price_text)\n'
          '        print(f"{part}: stock value {value:.2f}")\n',
  'change': 'Change the bolt quantity from 10 to 15.',
  'old': "['bolt', 10, 2.5]",
  'new': "['bolt', 15, 2.5]",
  'expected': 'bolt: stock value 25.00\nnut: stock value 20.00\n',
  'changed_expected': 'bolt: stock value 37.50\nnut: stock value 20.00\n',
  'optional': True},
 {'number': '22',
  'title': 'Saving a grade report',
  'explanation': 'Sample scores are finite numbers from 0 to 100. Midterm and final each '
                 'contribute 50%.',
  'predict': 'What score will Alex receive?',
  'code': 'import csv\n'
          '\n'
          'rows = [["name", "midterm", "final"], ["Alex", 60, 80], ["Sam", 80, 90]]\n'
          'with open("w12_ex22_input.csv", "w", newline="", encoding="utf-8") as file:\n'
          '    csv.writer(file).writerows(rows)\n'
          'results = [["name", "score"]]\n'
          'with open("w12_ex22_input.csv", "r", newline="", encoding="utf-8") as file:\n'
          '    reader = csv.reader(file)\n'
          '    next(reader)\n'
          '    for name, midterm, final in reader:\n'
          '        score = 0.5 * float(midterm) + 0.5 * float(final)\n'
          '        results.append([name, f"{score:.1f}"])\n'
          'with open("w12_ex22_report.csv", "w", newline="", encoding="utf-8") as file:\n'
          '    csv.writer(file).writerows(results)\n'
          'with open("w12_ex22_report.csv", "r", encoding="utf-8") as file:\n'
          '    print(file.read())\n',
  'change': "Change only Alex's final score from 80 to 100.",
  'old': '["Alex", 60, 80]',
  'new': '["Alex", 60, 100]',
  'expected': 'name,score\nAlex,70.0\nSam,85.0\n\n',
  'changed_expected': 'name,score\nAlex,80.0\nSam,85.0\n\n',
  'optional': True},
 {'number': '23',
  'title': 'A temperature report from CSV',
  'explanation': 'Read the header, convert the sample finite readings, and calculate a short '
                 'report.',
  'predict': 'What will the lowest, highest, and average values be?',
  'code': 'readings = []\n'
          'import csv\n'
          '\n'
          "rows = [['sensor', 'temperature_c'], ['T1', 20], ['T2', 24], ['T3', 22]]\n"
          'with open("w12_ex23.csv", "w", newline="", encoding="utf-8") as file:\n'
          '    csv.writer(file).writerows(rows)\n'
          'with open("w12_ex23.csv", "r", newline="", encoding="utf-8") as file:\n'
          '    reader = csv.reader(file)\n'
          '    next(reader)\n'
          '    for sensor, temperature in reader:\n'
          '        readings.append(float(temperature))\n'
          'if readings:\n'
          '    print("Lowest:", min(readings))\n'
          '    print("Highest:", max(readings))\n'
          '    print("Average:", sum(readings) / len(readings))\n'
          'else:\n'
          '    print("No readings available.")\n',
  'change': 'Change the T2 reading from 24 to 30.',
  'old': "['T2', 24]",
  'new': "['T2', 30]",
  'expected': 'Lowest: 20.0\nHighest: 24.0\nAverage: 22.0\n',
  'changed_expected': 'Lowest: 20.0\nHighest: 30.0\nAverage: 24.0\n',
  'optional': True},
 {'number': '24',
  'title': 'Numbering appended log entries',
  'explanation': 'Each entry gets the next number. The first block clears this teaching log on '
                 'every run.',
  'predict': 'What numbers will the two messages have?',
  'code': 'filename = "w12_ex24.log"\n'
          'with open(filename, "w", encoding="utf-8") as file:\n'
          '    file.write("")\n'
          '\n'
          'def add_entry(message):\n'
          '    with open(filename, "r", encoding="utf-8") as file:\n'
          '        number = len(file.readlines()) + 1\n'
          '    with open(filename, "a", encoding="utf-8") as file:\n'
          '        file.write(f"[{number}] {message}\\n")\n'
          '\n'
          'add_entry("Motor started.")\n'
          'add_entry("Reading saved.")\n'
          'with open(filename, "r", encoding="utf-8") as file:\n'
          '    print(file.read())\n',
  'change': 'Change the second message to Motor stopped.',
  'old': 'Reading saved.',
  'new': 'Motor stopped.',
  'expected': '[1] Motor started.\n[2] Reading saved.\n\n',
  'changed_expected': '[1] Motor started.\n[2] Motor stopped.\n\n',
  'optional': True},
 {'number': '25',
  'title': 'Save accepted readings and rejection reasons',
  'explanation': 'Keep raw demonstration data separate from accepted readings and rejection '
                 'reasons. Zero is valid. This sample has the expected header and two fields per '
                 'record. Record numbers count data records, not physical lines.',
  'predict': 'Which reading is accepted, and why are the others rejected?',
  'code': 'import csv\n'
          'import math\n'
          '\n'
          'rows = [["sensor", "temperature_c"], ["T1", "0"], ["T2", "ERROR"], ["T3", "61"]]\n'
          'with open("w12_ex25_raw_demo.csv", "w", newline="", encoding="utf-8") as file:\n'
          '    csv.writer(file).writerows(rows)\n'
          'accepted = []\n'
          'rejected = []\n'
          'with open("w12_ex25_raw_demo.csv", "r", newline="", encoding="utf-8") as file:\n'
          '    reader = csv.reader(file)\n'
          '    next(reader)\n'
          '    for record_number, row in enumerate(reader, start=1):\n'
          '        sensor, text = row\n'
          '        try:\n'
          '            value = float(text)\n'
          '        except ValueError:\n'
          '            reason = "Not a number."\n'
          '        else:\n'
          '            if not math.isfinite(value):\n'
          '                reason = "Reading must be finite."\n'
          '            elif not -50 <= value <= 60:\n'
          '                reason = "Outside sensor range."\n'
          '            else:\n'
          '                accepted.append([sensor, value])\n'
          '                continue\n'
          '        rejected.append([record_number, sensor, text, reason])\n'
          'with open("w12_ex25_clean.csv", "w", newline="", encoding="utf-8") as file:\n'
          '    writer = csv.writer(file)\n'
          '    writer.writerow(["sensor", "temperature_c"])\n'
          '    writer.writerows(accepted)\n'
          'with open("w12_ex25_rejected.csv", "w", newline="", encoding="utf-8") as file:\n'
          '    writer = csv.writer(file)\n'
          '    writer.writerow(["record", "sensor", "original_text", "reason"])\n'
          '    writer.writerows(rejected)\n'
          'print("Accepted:", accepted)\n'
          'print("Rejected:", rejected)\n',
  'change': "Change only T2's raw text from ERROR to 22.",
  'old': '["T2", "ERROR"]',
  'new': '["T2", "22"]',
  'expected': "Accepted: [['T1', 0.0]]\n"
              "Rejected: [[2, 'T2', 'ERROR', 'Not a number.'], [3, 'T3', '61', 'Outside sensor "
              "range.']]\n",
  'changed_expected': "Accepted: [['T1', 0.0], ['T2', 22.0]]\n"
                      "Rejected: [[3, 'T3', '61', 'Outside sensor range.']]\n",
  'optional': True},
 {'number': '26',
  'title': 'Preview of next week: preparing columns',
  'explanation': 'Read two numeric columns into separate lists. These lists can be used for a plot '
                 'next week.',
  'predict': 'How many times and temperatures will be stored?',
  'code': 'times = []\n'
          'temperatures = []\n'
          'import csv\n'
          '\n'
          "rows = [['time_s', 'temperature_c'], [0, 20], [10, 24], [20, 22]]\n"
          'with open("w12_ex26.csv", "w", newline="", encoding="utf-8") as file:\n'
          '    csv.writer(file).writerows(rows)\n'
          'with open("w12_ex26.csv", "r", newline="", encoding="utf-8") as file:\n'
          '    reader = csv.reader(file)\n'
          '    next(reader)\n'
          '    for time_text, temperature_text in reader:\n'
          '        times.append(float(time_text))\n'
          '        temperatures.append(float(temperature_text))\n'
          'print("Times:", times)\n'
          'print("Temperatures:", temperatures)\n',
  'change': 'Change the final temperature from 22 to 28.',
  'old': '[20, 22]',
  'new': '[20, 28]',
  'expected': 'Times: [0.0, 10.0, 20.0]\nTemperatures: [20.0, 24.0, 22.0]\n',
  'changed_expected': 'Times: [0.0, 10.0, 20.0]\nTemperatures: [20.0, 24.0, 28.0]\n',
  'optional': True}]


def prepare(root):
    """Create the standalone guided edition without rewriting Colab notebooks."""
    nb = json.loads((root / 'notebooks/Week_12.ipynb').read_text())
    nb['cells'] = []
    nb['metadata']['cp1'] = {'week': 12, 'kind': 'lesson',
                             'offline_activities': len(ACTIVITIES),
                             'main_activities': 14, 'format': 'predict-run-change'}
    nb['metadata']['cp1_offline_week'] = 12

    def markdown(source, **metadata):
        nb['cells'].append(dict(cell_type='markdown', metadata=metadata,
                                source=source.splitlines(keepends=True)))

    markdown('''# Week 12: Reading and Writing Files

Computer Programming I · Dr. Arif Solmaz

**Your goal:** Save a small result, read it back, and understand the difference between
replacing a file and adding to it.
You do not need to write a new program from scratch.

Use the same three steps for every example:

1. **Predict:** Say what you think will happen before running the code.
2. **Run:** Press Run on the supplied code and compare the result with your prediction.
3. **Change one thing:** Make the requested change, predict again, and rerun the same cell.

Each example runs independently and creates its own demonstration files.
Filenames beginning with w12_ex keep the examples separate. Run recreates sample
files, so repeated runs give a fresh starting point. Files exist only in the current
Python session. Download important files separately from **Python files in this session**;
saving the notebook does not include these files.

Use **Undo last change** to step back one edit in that cell. Use **Restore original code**
to return to the starting example. These buttons change code only, not files or output;
press Run again to recreate files and update the output. You can also undo a restore.
Ctrl/Cmd+Z works in the code editor.

Examples 1–14 are the main activities. Examples 15–26 are optional.
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
Ask: **Which file are we reading, and which file are we changing?**
Give most classroom time to reading, writing, appending, line endings, and simple CSV rows.
Keep longer reports, data cleaning, and the plotting preview optional.

### Participation and assessment

These activities are ungraded practice. No weekly submission is required.
Assessment remains the midterm exam (50%) and final exam (50%).
''', offline_anchor='finish')
    for index, cell in enumerate(nb['cells']):
        cell['id'] = f'w12-guided-{index:03d}'
    from guided_support import attach_guidance
    attach_guidance(nb, ACTIVITIES)
    from practice_support import restore_practice
    return restore_practice(nb, root, 12)
