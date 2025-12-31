# Aizora Backend

This folder contains the Django backend for Aizora.

## Purpose

- Provides REST API endpoints for the frontend
- Handles authentication, log uploads, bug analysis, code patching, validation, and GitHub integration

## Initial Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install Django and Django REST Framework:
   ```bash
   pip install django djangorestframework
   ```
3. Start a new Django project:
   ```bash
   django-admin startproject bugsquash .
   ```
4. Add your apps and configuration as needed.

## Structure

- `bugsquash/` - Django project settings
- `apps/` - (Recommended) Place for Django apps (to be created)
- `manage.py` - Django management script

## Next Steps

- Create Django apps for authentication, logs, bugs, patches, validation, and GitHub integration.
- Set up Django REST Framework and CORS.
- Implement models, serializers, and views as per the API contract.
