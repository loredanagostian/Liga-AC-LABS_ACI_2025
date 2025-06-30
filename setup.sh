#!/bin/bash

# setup.sh

set -e

echo "🚀 Setup started..."

# 1. Instalează Docker dacă nu există
if ! [ -x "$(command -v docker)" ]; then
  echo "🛠️ Installing Docker..."
  curl -fsSL https://get.docker.com | sh
fi

# 2. Instalează Docker Compose dacă nu există
if ! [ -x "$(command -v docker-compose)" ]; then
  echo "🛠️ Installing Docker Compose..."
  sudo apt-get update
  sudo apt-get install -y docker-compose
fi

# 3. Adaugă userul la grupul docker
sudo usermod -aG docker $USER

# 4. Build Spring Boot jar dacă nu există deja
if [ ! -f target/*.jar ]; then
  echo "📦 Building Spring Boot project..."
  ./mvnw clean install -DskipTests
fi

# 5. Build și run containere
echo "🐳 Building and starting containers..."
docker-compose up --build -d

echo "✅ Setup complete!"
echo "🌐 Angular: http://localhost:4200"
echo "🛠️ Spring: http://localhost:8080"
