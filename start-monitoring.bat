@echo off
REM Nexo Monitoring Startup Script for Windows

echo 🚀 Starting Nexo Sinérgico Monitoring Stack...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose version >nul 2>&1
if errorlevel 1 (
    echo ❌ docker-compose is not installed.
    pause
    exit /b 1
)

REM Start the monitoring stack
echo 📊 Starting Prometheus, Grafana, and Node Exporter...
docker-compose -f docker-compose.monitoring.yml up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
docker-compose -f docker-compose.monitoring.yml ps | findstr "Up" >nul
if errorlevel 1 (
    echo ❌ Failed to start monitoring stack. Check Docker logs.
    pause
    exit /b 1
) else (
    echo ✅ Monitoring stack started successfully!
    echo.
    echo 📈 Access URLs:
    echo    Grafana:    http://localhost:3002 (admin/admin123)
    echo    Prometheus: http://localhost:9090
    echo    Node Exp:   http://localhost:9100
    echo.
    echo 🔗 API Metrics: http://localhost:8000/metrics
    echo.
    echo 💡 Make sure your Nexo backend is running on port 8000
    echo    to see application metrics in Grafana.
)

pause