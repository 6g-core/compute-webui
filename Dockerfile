FROM node:22-bookworm-slim AS frontend-build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js postcss.config.js tailwind.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM python:3.11-slim-bookworm

ENV PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 \
  && rm -rf /var/lib/apt/lists/*

COPY requirements-webrtc.txt ./
RUN pip install --no-cache-dir -r requirements-webrtc.txt

COPY --from=frontend-build /app/dist ./dist
COPY server ./server
COPY fixed_camera_moving_personmp_.mp4 dog.mp4 dog_enhanced.mp4 ./
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 28449 28448 28450 28451 28452

ENTRYPOINT ["docker-entrypoint.sh"]
