# filter.py - Data filtering class

class Filter:
    """A simple data filter for smoothing sensor readings."""

    def __init__(self, window_size=3):
        """
        Create a new filter.

        Args:
            window_size: Number of values to average together (default 3)
        """
        if window_size < 1:
            window_size = 1
        self.window_size = window_size

    def moving_average(self, data):
        """
        Apply a moving average filter to the data.

        Args:
            data: List of numbers to filter

        Returns:
            List of filtered (smoothed) values
        """
        if len(data) == 0:
            return []

        result = []
        for i in range(len(data)):
            # Get the window of values around position i
            start = max(0, i - self.window_size // 2)
            end = min(len(data), start + self.window_size)
            # Adjust start if we are near the end
            start = max(0, end - self.window_size)

            window = data[start:end]
            avg = sum(window) / len(window)
            result.append(round(avg, 2))

        return result

    def median_filter(self, data):
        """
        Apply a median filter to the data.

        Args:
            data: List of numbers to filter

        Returns:
            List of filtered values
        """
        if len(data) == 0:
            return []

        result = []
        for i in range(len(data)):
            start = max(0, i - self.window_size // 2)
            end = min(len(data), start + self.window_size)
            start = max(0, end - self.window_size)

            window = sorted(data[start:end])
            mid = len(window) // 2
            median_val = window[mid]
            result.append(round(median_val, 2))

        return result

    def __str__(self):
        return f"Filter(window_size={self.window_size})"
