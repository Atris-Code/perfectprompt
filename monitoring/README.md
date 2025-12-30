# Grafana Monitoring Setup for Nexo Sinérgico

This directory contains the monitoring setup for the Nexo Sinérgico FastAPI backend using Grafana and Prometheus.

## Architecture

- **Prometheus**: Collects metrics from the FastAPI application and system
- **Grafana**: Visualizes metrics with dashboards
- **Node Exporter**: Collects system-level metrics (CPU, memory, disk, etc.)

## Quick Start

### 1. Install Dependencies

First, install the required Python packages:

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Monitoring Stack

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

This will start:
- Prometheus on http://localhost:9090
- Grafana on http://localhost:3002 (admin/admin123)
- Node Exporter on http://localhost:9100

### 3. Start the Nexo Backend

```bash
cd backend
python main.py
```

Or using uvicorn:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Access the Dashboards

- **Grafana**: http://localhost:3002 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **API Metrics**: http://localhost:8000/metrics

## Metrics Collected

### Application Metrics

- **Request Count**: Total API requests by method, endpoint, and status
- **Request Latency**: Response time histograms for all endpoints
- **Insight Generations**: Success/failure rates and latency for content generation
- **Active Requests**: Current number of concurrent requests
- **Gemini API Calls**: Usage statistics for AI service calls
- **Feedback Submissions**: User feedback statistics by sentiment

### System Metrics

- **CPU Usage**: System CPU utilization
- **Memory Usage**: RAM usage percentage
- **Disk I/O**: Storage performance metrics
- **Network I/O**: Network traffic statistics

## Dashboard Features

The pre-configured dashboard includes:

1. **API Performance**: Request rates and response times
2. **Success Rates**: Insight generation success percentages
3. **Resource Usage**: System resource monitoring
4. **AI Service Usage**: Gemini API call statistics
5. **User Feedback**: Sentiment analysis of user interactions

## Configuration

### Prometheus Configuration

Located in `monitoring/prometheus.yml`:
- Scrape interval: 15 seconds
- Custom metrics endpoint: `/metrics`
- Node exporter integration

### Grafana Configuration

- Auto-provisioned datasource for Prometheus
- Pre-loaded dashboard for Nexo monitoring
- Default admin credentials: admin/admin123

## Custom Metrics

You can add custom metrics to your FastAPI endpoints:

```python
from prometheus_client import Counter, Histogram

# Define metrics
CUSTOM_COUNTER = Counter('my_custom_counter', 'Description', ['label'])
CUSTOM_HISTOGRAM = Histogram('my_custom_histogram', 'Description', ['label'])

# Use in endpoints
@app.get("/my-endpoint")
async def my_endpoint():
    CUSTOM_COUNTER.labels(label='value').inc()
    with CUSTOM_HISTOGRAM.labels(label='value').time():
        # Your logic here
        return {"result": "success"}
```

## Troubleshooting

### Backend Not Appearing in Grafana

1. Check if the backend is running on port 8000
2. Verify the `/metrics` endpoint is accessible: http://localhost:8000/metrics
3. Check Prometheus targets: http://localhost:9090/targets

### Dashboard Not Loading

1. Ensure Grafana can connect to Prometheus
2. Check Grafana logs: `docker logs nexo_grafana`
3. Verify dashboard JSON is valid

### High Resource Usage

- Adjust scrape intervals in `prometheus.yml`
- Reduce retention time for Prometheus data
- Scale the monitoring stack if needed

## Production Deployment

For production environments:

1. **Security**: Change default Grafana admin password
2. **Persistence**: Configure proper volume mounts for data persistence
3. **Scaling**: Consider using Prometheus federation for multiple instances
4. **Alerting**: Set up Alertmanager for notifications
5. **Backup**: Regular backups of Grafana dashboards and Prometheus data

## Development

To modify dashboards:

1. Edit the JSON files in `monitoring/grafana/dashboards/`
2. Restart Grafana or use the UI to import changes
3. Export modified dashboards back to JSON for version control

## Stopping the Monitoring Stack

```bash
docker-compose -f docker-compose.monitoring.yml down
```

To also remove volumes (data):

```bash
docker-compose -f docker-compose.monitoring.yml down -v
```