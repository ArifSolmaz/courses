# logger.py - CSV data logger class

import csv

class Logger:
    """A simple CSV logger for saving sensor data."""

    def __init__(self, filename="output.csv"):
        """
        Create a new logger.

        Args:
            filename: Name of the CSV file to write (default: output.csv)
        """
        self.filename = filename

    def save(self, data, headers=None):
        """
        Save a list of rows to a CSV file.

        Args:
            data: List of lists (each inner list is a row)
            headers: Optional list of column headers
        """
        with open(self.filename, "w", newline="") as f:
            writer = csv.writer(f)
            if headers:
                writer.writerow(headers)
            for row in data:
                writer.writerow(row)

        print(f"Data saved to '{self.filename}' ({len(data)} rows)")

    def save_two_columns(self, raw, filtered):
        """
        Save raw and filtered data side by side.

        Args:
            raw: List of raw sensor readings
            filtered: List of filtered readings
        """
        headers = ["index", "raw", "filtered"]
        rows = []
        for i in range(len(raw)):
            raw_val = raw[i]
            filt_val = filtered[i] if i < len(filtered) else ""
            rows.append([i, raw_val, filt_val])

        self.save(rows, headers=headers)

    def __str__(self):
        return f"Logger(filename='{self.filename}')"
