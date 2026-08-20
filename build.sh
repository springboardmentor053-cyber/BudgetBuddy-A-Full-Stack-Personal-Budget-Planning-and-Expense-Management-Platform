#!/usr/bin/env bash
# Exit on error
set -o errexit

echo ">>> Installing dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

echo ">>> Collecting static files..."
python backend/manage.py collectstatic --no-input

echo ">>> Applying database migrations..."
python backend/manage.py migrate --no-input

echo ">>> Build completed successfully!"
