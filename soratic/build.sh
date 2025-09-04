#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Build React app
cd ../client
npm ci
npm run build
cd ../soratic

# Django setup
python manage.py collectstatic --no-input
python manage.py migrate
python manage.py load_subjects