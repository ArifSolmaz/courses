#!/usr/bin/env python3
"""Build the canonical Skiena-aligned course. Earlier sources remain as Python support."""
import build_legacy as template
from aligned.build import build
if __name__ == '__main__':
    build(template)
