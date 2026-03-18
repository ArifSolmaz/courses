# math_utils.py - Math helper functions

def average(numbers):
    """Calculate the average of a list of numbers."""
    if len(numbers) == 0:
        return 0
    return sum(numbers) / len(numbers)

def clamp(value, min_val, max_val):
    """Keep a value within a min/max range."""
    if value < min_val:
        return min_val
    if value > max_val:
        return max_val
    return value

def is_even(n):
    """Check if a number is even."""
    return n % 2 == 0
