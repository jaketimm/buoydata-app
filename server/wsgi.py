# wsgi.py
from app import app  # Flask variable
application = app   # Gunicorn expects 'application' 
