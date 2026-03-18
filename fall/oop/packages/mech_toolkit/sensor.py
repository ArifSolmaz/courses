# sensor.py - Simulated Sensor class

import random

class Sensor:
    """A simulated sensor that generates random readings."""

    def __init__(self, name, min_val=0.0, max_val=100.0):
        """
        Create a new sensor.

        Args:
            name: Name of the sensor (e.g., "Temperature")
            min_val: Minimum possible reading
            max_val: Maximum possible reading
        """
        self.name = name
        self.min_val = min_val
        self.max_val = max_val
        self.readings = []   # Store all readings here

    def generate(self, n=10):
        """
        Generate n random readings and add them to the readings list.

        Args:
            n: Number of readings to generate (default 10)

        Returns:
            List of newly generated readings
        """
        new_readings = []
        for i in range(n):
            # Generate a random value within the sensor range
            value = random.uniform(self.min_val, self.max_val)
            # Round to 2 decimal places
            value = round(value, 2)
            new_readings.append(value)

        # Add new readings to the full list
        self.readings.extend(new_readings)
        return new_readings

    def get_readings(self):
        """Return all collected readings."""
        return self.readings.copy()

    def get_last(self):
        """Return the last reading, or None if no readings exist."""
        if len(self.readings) == 0:
            return None
        return self.readings[-1]

    def __str__(self):
        """Return a string description of the sensor."""
        count = len(self.readings)
        return f"Sensor('{self.name}', range=[{self.min_val}, {self.max_val}], readings={count})"
