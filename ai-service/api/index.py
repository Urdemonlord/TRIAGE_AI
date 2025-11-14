"""
Vercel Serverless Handler for TRIAGE.AI FastAPI Application

This module wraps the FastAPI app for deployment on Vercel as serverless functions.
"""

import sys
import os

# Add parent directory to path to import app module
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.main import app

# Vercel expects a variable named 'app' or a handler function
# FastAPI app can be used directly with Vercel's Python runtime
handler = app

# For compatibility with different Vercel Python runtime versions
__all__ = ['app', 'handler']
