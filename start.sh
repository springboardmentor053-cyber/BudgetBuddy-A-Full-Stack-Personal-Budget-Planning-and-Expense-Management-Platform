#!/usr/bin/env bash
set -o errexit

echo "Running migrations..."
python manage.py migrate --noinput

echo "Starting gunicorn..."
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
