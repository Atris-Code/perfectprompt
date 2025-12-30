<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ucfpJg4bQbC5b9wq7TtLp6j_sjJKpDsV

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Monitoring & Observability

The application includes comprehensive monitoring with Grafana and Prometheus.

### Quick Start Monitoring

1. **Start the monitoring stack:**
   ```bash
   # Linux/Mac
   ./start-monitoring.sh
   
   # Windows
   start-monitoring.bat
   ```

2. **Access the dashboards:**
   - **Grafana**: http://localhost:3002 (admin/admin123)
   - **Prometheus**: http://localhost:9090

### What Gets Monitored

- **API Performance**: Request rates, response times, error rates
- **AI Service Usage**: Gemini API calls and success rates
- **User Feedback**: Sentiment analysis and interaction metrics
- **System Resources**: CPU, memory, and disk usage
- **Business Metrics**: Insight generation statistics

See [monitoring/README.md](monitoring/README.md) for detailed setup instructions.
