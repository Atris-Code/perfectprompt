#!/bin/bash

# Nexo Monitoring Startup Script

echo "🚀 Starting Nexo Sinérgico Monitoring Stack..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed."
    exit 1
fi

# Start the monitoring stack
echo "📊 Starting Prometheus, Grafana, and Node Exporter..."
docker-compose -f docker-compose.monitoring.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose -f docker-compose.monitoring.yml ps | grep -q "Up"; then
    echo "✅ Monitoring stack started successfully!"
    echo ""
    echo "📈 Access URLs:"
    echo "   Grafana:    http://localhost:3002 (admin/admin123)"
    echo "   Prometheus: http://localhost:9090"
    echo "   Node Exp:   http://localhost:9100"
    echo ""
    echo "🔗 API Metrics: http://localhost:8000/metrics"
    echo ""
    echo "💡 Make sure your Nexo backend is running on port 8000"
    echo "   to see application metrics in Grafana."
else
    echo "❌ Failed to start monitoring stack. Check Docker logs."
    exit 1
fi