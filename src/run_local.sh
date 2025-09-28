#!/usr/bin/env bash
export ALLOWED_ORIGINS="*"
export MODELS_DIR="$(pwd)/models"
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
