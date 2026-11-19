"""Small, tested edits for Weeks 13–14; keep all original tasks and answers."""
from copy import deepcopy
import ast
import hashlib

# Keys are original notebook/answer cell indices. Exact matches detect source drift.
CHANGES = {
13: {
'lesson': {
10: ('[22.1, 21.8, 22.4]', '[23.1, 21.8, 22.4]', 'Raise the first Sensor A reading by 1 C. Predict which displayed values change.'),
14: ('range(3):\n    row', 'range(4):\n    row', 'Print the first four time steps instead of three. The column averages still use the whole table.'),
19: ('print("First two rows:")\nprint(a[:2])', 'print("First three rows:")\nprint(a[:3])', 'Display the first three array rows instead of two. The array itself stays the same.'),
22: ('print("a[2:5, 1] ->", a[2:5, 1])', 'print("a[2:6, 1] ->", a[2:6, 1])', 'Include one more row in the Sensor B slice. The stop position is excluded.'),
30: ('[0, 100, 200, 300, 400, 500]', '[0, 200, 400, 600, 800, 1000]', 'Double the load values. Predict what happens to the stiffness estimates; deflections stay the same.'),
33: ('np.mean(a):.2f', 'np.mean(a):.3f', 'Show three decimal places for the overall mean. This changes display precision, not the calculation.'),
41: ('limit = 4.0', 'limit = 2.2', 'Lower the current limit to 2.2 A. Predict how many readings will exceed it.'),
44: ('clipped = np.where(current > limit, limit, current)', 'clipped = np.where(current > 3.0, 3.0, current)', 'Clip current values at 3 A in this cell. The original current array is preserved.'),
51: ('file.read()[:80]', 'file.read()[:120]', 'Preview the first 120 file characters instead of 80. This reads more text without changing the file.'),
54: ('print("Header:", header)', 'print("Column names:", header)', 'Rename the printed header label. The parsed columns stay the same.'),
57: ('np.round(data2.mean(axis=0), 2)', 'np.round(data2.mean(axis=0), 3)', 'Display column means rounded to three decimal places instead of two.'),
62: ('marker="o"', 'marker="s"', 'Use square markers instead of circles. Predict whether the measured values or only the plot appearance change.'),
65: ('plt.grid(True)', 'plt.grid(False)', 'Hide the plot grid. The readings and threshold remain the same.'),
72: ('"ro", label="above limit"', '"rs", label="above limit"', 'Show above-limit points as red squares instead of red circles.'),
},
'solutions': {
3: ('{means[col]:.2f}', '{means[col]:.3f}', 'Display each sensor mean with three decimal places. The original calculation and checks still apply.'),
7: ('{m:.2f}', '{m:.3f}', 'Display each NumPy mean with three decimal places.'),
11: ('{d:>15.4f}', '{d:>15.5f}', 'Show five decimal places in the deflection column, so the small metre values are easier to compare.'),
15: ('print("Per sensor:",', 'print("Counts for A, B, C:",', 'Make the printed count label name the three sensor columns.'),
19: ('{current.max():.2f}', '{current.max():.3f}', 'Display the maximum current with three decimal places.'),
23: ('print("All:",', 'print("Moving averages:",', 'Give the printed list a more descriptive label.'),
27: ('marker="o"', 'marker="s"', 'Use square plot markers. The saved figure changes; the readings do not.'),
31: ('plt.grid(True)', 'plt.grid(False)', 'Hide the grid in the three-sensor plot.'),
35: ('f"{v:6.2f}" for v in z[0]', 'f"{v:6.3f}" for v in z[0]', 'Show the first normalized row with three decimal places. The second row keeps its original format.'),
39: ('k = 2.0', 'k = 2.5', 'Raise k to 2.5. Predict how the threshold changes and whether the same two abrupt steps are flagged.'),
43: ('{distance:.3f}', '{distance:.4f}', 'Display the loop distance with four decimal places. Its agreement with NumPy is still checked.'),
47: ('reading_v = 1.75', 'reading_v = 2.0', 'Convert a 2.0 V sensor reading using the same fitted calibration line.'),
51: ('print(f"Report:', 'print(f"Sensor summary:', 'Rename the printed report heading while keeping the saved data and means unchanged.'),
}},
14: {
'lesson': {
18: ('print("sensor_data.csv created:",', 'print("Sample data ready:",', 'Change the setup confirmation label. Keep the shared dataset unchanged for the later exercises.'),
22: ('if number == 3:', 'if number == 5:', 'Preview the first five raw records instead of three. This reads records before validation; it does not accept invalid readings.'),
},
'solutions': {
4: ('print("sensor_data.csv created:",', 'print("Sample data ready:",', 'Change the setup confirmation label. Keep the shared input unchanged so later pipeline checks still apply.'),
8: ('print("Total rows read:",', 'print("Data records read:",', 'Use a more descriptive label for the number of CSV data records.'),
12: ('{str(row):<42}', '{str(row):<48}', 'Make the printed input column wider so validation messages line up farther to the right.'),
16: ('print("Bad rows detail:")', 'print("Rejected records and reasons:")', 'Label rejected records and their reasons explicitly. No rejected value is replaced with zero.'),
20: ("{temp_stats['mean']:.2f}", "{temp_stats['mean']:.3f}", 'Display the temperature mean with three decimal places. Keep full precision in the statistics.'),
24: ('print("Sensor Statistics")', 'print("Accepted Sensor Readings")', 'Rename the statistics heading to emphasize that only accepted readings are included.'),
28: ('    SENSOR LOG SUMMARY REPORT', '    VALIDATED SENSOR SUMMARY', 'Change the report title. Counts, acceptance rate, and numeric summaries stay the same.'),
32: ('print("First 5 lines of clean file:")\n', 'print("First 3 lines of clean file:")\n', 'Preview three clean-file lines instead of five. The saved CSV still contains every accepted record.'),
36: ('print("--- sensor_report.txt ---")', 'print("--- Saved report contents ---")', 'Change the on-screen label for the saved report. The file contents stay the same.'),
40: ('print("Sensor Log Summary Tool")', 'print("Validated Sensor Report Tool")', 'Rename the progress heading. The six pipeline stages and saved-file checks stay the same.'),
44: ('{sensor:<9}', '{sensor:<12}', 'Widen the sensor-name column in the filtered data display. The time window stays the same.'),
48: ('values, "o", markersize=5', 'values, "s", markersize=5', 'Use square markers in all three sensor plots. The accepted reading counts stay the same.'),
}}}


def attach_science_changes(nb, week, lesson_count):
    for i,cell in enumerate(nb['cells']):
        if cell['cell_type']!='code':continue
        realm='lesson' if i<lesson_count else 'solutions'
        original_index=i if realm=='lesson' else i-lesson_count
        # Student starter data can be varied without supplying a worked answer.
        item=CHANGES[week][realm].get(original_index)
        if item is None and week==13 and realm=='lesson' and cell['metadata'].get('cp1_exercise'):
            source=''.join(cell['source'])
            if '[22.1, 21.8, 22.4]' in source:
                item=('[22.1, 21.8, 22.4]','[23.1, 21.8, 22.4]','Raise the first Sensor A input by 1 C. Complete your own solution and predict its effect.')
            elif 'load_n = [0, 100, 200, 300, 400, 500]' in source:
                item=('load_n = [0, 100, 200, 300, 400, 500]','load_n = [0, 200, 400, 600, 800, 1000]','Double the input load values, then use your own calculation to compare the results.')
            elif '6.5, 2.2' in source:
                item=('6.5, 2.2','7.5, 2.2','Raise the current peak from 6.5 A to 7.5 A. Predict how your own result will change.')
            elif 'v_ms = [0.0, 0.5' in source:
                item=('v_ms = [0.0, 0.5','v_ms = [0.0, 0.8','Change the second speed from 0.5 to 0.8 m/s. Complete your own distance calculation and compare.')
            elif 'reading_v = 1.75' in source:
                item=('reading_v = 1.75','reading_v = 2.0','Try a 2.0 V reading in your own calibration solution.')
            elif '0,22.1,21.8,22.4' in source:
                item=('0,22.1,21.8,22.4','0,23.1,21.8,22.4','Raise the first Sensor A CSV value by 1 C. Read the file using your own solution and compare.')
            else:raise ValueError(f'Missing suggested edit for Week 13 starter {original_index}')
        if item is None:continue  # Diagnostic helpers, reflections, and blank practice cells.
        old,new,instruction=item
        source=''.join(cell['source']);assert source.count(old)==1,(week,realm,original_index,old)
        changed=source.replace(old,new,1)
        if (week,realm,original_index)==(14,'solutions',32):
            # One teaching change spans the label and its matching preview slice.
            old='print("First 5 lines of clean file:")'+source.split('print("First 5 lines of clean file:")',1)[1].split('assert len(saved_lines)',1)[0]
            new=old.replace('First 5 lines','First 3 lines').replace('saved_lines[:5]','saved_lines[:3]')
            changed=source.replace(old,new,1)
        ast.parse(changed)
        walk=deepcopy(nb['cells'][i+1]['metadata']['cp1_line_walkthrough'])
        walk['source_sha256']=hashlib.sha256(changed.encode()).hexdigest()
        oldlines=source.splitlines();newlines=changed.splitlines()
        assert len(oldlines)==len(newlines),'Keep line numbers stable for authored scientific walkthroughs'
        for n,(before,after) in enumerate(zip(oldlines,newlines),1):
            if before!=after:
                walk['line_focus'][str(n)]='Suggested change: '+instruction
        cell['metadata']['cp1_guided_change']={'old':old,'new':new,'source':changed,'help':walk,'instruction':instruction,'prerequisites':'Run earlier setup cells in this section first. After comparing the change, restore the original code and Run it again before continuing to the next example.'}
    nb['cells'][0]['source'].append('\n**Change one thing:** Use **Apply suggested change** to try a small edit without changing quotes or indentation. Predict first, apply, then Run. Click a code line for its explanation and output links. Run earlier setup cells first; restore and Run again after comparing before continuing. Undo and Restore remain available.\n')
