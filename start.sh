#!/bin/bash

echo "🚀 Starting Wellness Store Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start the application with Docker Compose
echo "📦 Starting containers..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services started successfully!"
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:5000"
    echo "   MongoDB: localhost:27017"
    echo ""
    echo "👤 To create an admin account:"
    echo "   1. Go to http://localhost:3000/login"
    echo "   2. Register a new account"
    echo "   3. Update user role to 'admin' in MongoDB"
    echo ""
    echo "📝 To stop the application: docker-compose down"
else
    echo "❌ Failed to start services. Check Docker logs:"
    docker-compose logs
fi