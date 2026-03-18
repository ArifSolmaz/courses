# string_utils.py - String helper functions

def shout(text):
    """Convert text to uppercase with exclamation mark."""
    return text.upper() + "!"

def whisper(text):
    """Convert text to lowercase with ellipsis."""
    return text.lower() + "..."

def repeat(text, times=3):
    """Repeat text a given number of times."""
    return (text + " ") * times
