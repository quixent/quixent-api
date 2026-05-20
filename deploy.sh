#!/bin/bash

set -e

IMAGE_NAME="quixent-api"
CONTAINER_NAME="quixent-api-container"
ENV_FILE=".env"
HOST_PORT=8000
CONTAINER_PORT=8000

echo "🔍 Checking .env file..."
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env file not found!"
  exit 1
fi

echo "🛑 Stopping existing container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

echo "🚀 Building Docker image..."
docker build -t $IMAGE_NAME .

echo "▶️ Running container..."
docker run -d \
  --name $CONTAINER_NAME \
  --env-file $ENV_FILE \
  -p $HOST_PORT:$CONTAINER_PORT \
  --restart unless-stopped \
  $IMAGE_NAME

echo "✅ Deployment successful!"