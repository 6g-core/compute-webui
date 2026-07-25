FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY identity-requirements.txt .
RUN pip install --no-cache-dir -r identity-requirements.txt

COPY identity_control.py .

EXPOSE 3002

CMD ["uvicorn", "identity_control:app", "--host", "0.0.0.0", "--port", "3002"]
