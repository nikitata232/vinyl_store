FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app/backend
ENV DJANGO_SETTINGS_MODULE=backend.settings

CMD ["python", "/app/backend/manage.py", "runserver", "0.0.0.0:8000"]
