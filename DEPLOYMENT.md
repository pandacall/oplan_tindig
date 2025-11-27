# Deployment Guide - Big One Dashboard

## Prerequisites

- Google Cloud Platform account
- `gcloud` CLI installed and authenticated
- Docker installed locally (for testing)
- Project ID configured in GCP

## Local Testing with Docker

### Build Docker image:
```bash
docker build -t big-one-dashboard .
```

### Run locally:
```bash
docker run -p 8080:80 big-one-dashboard
```

Visit `http://localhost:8080` to test.

## Google Cloud Run Deployment

### Option 1: Automated with Cloud Build (Recommended)

1. **Enable required APIs:**
```bash
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com
```

2. **Set your project:**
```bash
gcloud config set project YOUR_PROJECT_ID
```

3. **Deploy using Cloud Build:**
```bash
gcloud builds submit --config cloudbuild.yaml
```

This will:
- Build the Docker image
- Push to Container Registry
- Deploy to Cloud Run in `asia-southeast1` region
- Configure auto-scaling (0-100 instances)
- Enable unauthenticated access

### Option 2: Manual Deployment

1. **Build and tag image:**
```bash
docker build -t gcr.io/YOUR_PROJECT_ID/big-one-dashboard:latest .
```

2. **Push to Container Registry:**
```bash
docker push gcr.io/YOUR_PROJECT_ID/big-one-dashboard:latest
```

3. **Deploy to Cloud Run:**
```bash
gcloud run deploy big-one-dashboard \
  --image gcr.io/YOUR_PROJECT_ID/big-one-dashboard:latest \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 100 \
  --min-instances 0
```

## Post-Deployment

### Get service URL:
```bash
gcloud run services describe big-one-dashboard --region asia-southeast1 --format 'value(status.url)'
```

### View logs:
```bash
gcloud run logs read big-one-dashboard --region asia-southeast1
```

### Update service:
```bash
gcloud builds submit --config cloudbuild.yaml
```

## Configuration

### Environment Variables (if needed):
```bash
gcloud run services update big-one-dashboard \
  --region asia-southeast1 \
  --set-env-vars "NODE_ENV=production"
```

### Custom Domain:
```bash
gcloud run domain-mappings create \
  --service big-one-dashboard \
  --domain yourdomain.com \
  --region asia-southeast1
```

## Monitoring

### Set up alerts:
- Navigate to Cloud Console > Cloud Run > big-one-dashboard
- Configure alerts for:
  - Request latency > 3s
  - Error rate > 5%
  - CPU utilization > 80%

### Performance metrics:
- View in Cloud Console > Cloud Run > big-one-dashboard > Metrics

## Cost Optimization

### Current configuration:
- **Memory**: 512Mi (sufficient for static content + map tiles)
- **CPU**: 1 vCPU (adequate for nginx serving)
- **Scaling**: 0-100 instances
- **Min instances**: 0 (scales to zero when idle - no cost)

### Expected costs:
- **Idle**: $0 (scales to zero)
- **Light load** (100 requests/day): ~$0.50/month
- **Heavy load** (10K concurrent users): ~$50-100/month

## Rollback

### Rollback to previous version:
```bash
# List revisions
gcloud run revisions list --service big-one-dashboard --region asia-southeast1

# Rollback to specific revision
gcloud run services update-traffic big-one-dashboard \
  --region asia-southeast1 \
  --to-revisions REVISION_NAME=100
```

## Security

### HTTPS:
- Automatic HTTPS enabled by default
- Custom domains get automatic SSL certificates

### Access Control:
```bash
# Restrict access (remove public access)
gcloud run services remove-iam-policy-binding big-one-dashboard \
  --region asia-southeast1 \
  --member="allUsers" \
  --role="roles/run.invoker"

# Grant access to specific users
gcloud run services add-iam-policy-binding big-one-dashboard \
  --region asia-southeast1 \
  --member="user:email@example.com" \
  --role="roles/run.invoker"
```

## Troubleshooting

### Build fails:
- Check `cloudbuild.yaml` syntax
- Verify Docker can build locally first
- Check Cloud Build logs in Console

### Deployment fails:
- Verify APIs are enabled
- Check IAM permissions
- Review Cloud Run logs

### App not loading:
- Check nginx configuration
- Verify static files in `/usr/share/nginx/html`
- Test Docker image locally first

### Performance issues:
- Increase memory/CPU allocation
- Add CDN in front of Cloud Run
- Optimize assets (already done in build)

## CI/CD Integration

### GitHub Actions example:
```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - uses: google-github-actions/setup-gcloud@v0
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      
      - run: gcloud builds submit --config cloudbuild.yaml
```

## Support

For issues:
1. Check Cloud Run logs
2. Test Docker image locally
3. Review nginx access/error logs
4. Verify static assets are built correctly
