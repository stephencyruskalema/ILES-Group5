#!/usr/bin/env python
"""Wrapper manage.py so running `py manage.py ...` from the repo root works.

This forwards execution to the real `backend/manage.py` script.
"""
import runpy
import os
import sys


ROOT = os.path.dirname(__file__)
TARGET = os.path.join(ROOT, "backend", "manage.py")

if not os.path.exists(TARGET):
    sys.stderr.write(f"Error: backend/manage.py not found at {TARGET}\n")
    sys.exit(2)

# Run the backend/manage.py as __main__ so Django sees it like a normal manage.py
runpy.run_path(TARGET, run_name="__main__")
