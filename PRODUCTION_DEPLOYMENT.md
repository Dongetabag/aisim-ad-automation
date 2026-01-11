# Production Deployment Guide

This guide covers deploying the AISim Ad Automation platform to production environments.

## 🔒 Security Checklist

Before deploying to production, ensure you have:

- [ ] **Removed all hardcoded API keys** from source code
- [ ] **Generated strong secrets** for JWT_SECRET (min 32 chars) and ENCRYPTION_KEY (min 32 chars)
- [ ] **Configured environment variables** properly in your hosting platform
- [ ] **Set up HTTPS/SSL certificates** for all domains
- [ ] **Enabled database backups** with appropriate retention policies
- [ ] **Configured firewall rules** to restrict database access
- [ ] **Set up monitoring and alerting** for critical errors
- [ ] **Implemented log aggregation** for troubleshooting
- [ ] **Configured rate limiting** (already included in app)
- [ ] **Reviewed and tested error handling** to ensure no sensitive data leaks
- [ ] **Set up secret rotation** policies for API keys and tokens
- [ ] **Enabled security headers** (already configured via Helmet)

## 📋 Prerequisites

### Required API Keys

1. **Stripe** (Payment Processing)
   - Get from: https://dashboard.stripe.com
   - Required: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
   - Note: Use live keys for production (starts with `sk_live_`)

2. **Google Cloud** (AI & Services)
   - Get from: https://console.cloud.google.com
   - Required: `GOOGLE_API_KEY`
   - Enable: Places API, YouTube Data API v3, Generative AI API
   - Set up API restrictions and quotas

3. **Brave Search** (Lead Generation - Optional)
   - Get from: https://brave.com/search/api
   - Optional: `BRAVE_API_KEY`

### Strong Secrets Generation

Generate secure secrets using one of these methods:

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 🚀 Deployment Options

### Option 1: Docker Compose (Self-Hosted)

Best for: VPS, dedicated servers, or cloud VMs

#### 1. Prepare the Server

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com | sh
sudo apt-get install docker-compose-plugin

# Clone repository
git clone https://github.com/yourusername/aisim-ad-automation.git
cd aisim-ad-automation
```

#### 2. Configure Environment

```bash
# Copy and edit environment file
cp env.example .env
nano .env

# Set all required variables (see Environment Variables section)
```

#### 3. Deploy with Docker Compose

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# View running containers
docker-compose -f docker-compose.prod.yml ps
```

#### 4. Set Up SSL with Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

### Option 2: Cloud Platforms

#### Railway

1. **Backend Deployment**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and initialize
   railway login
   cd backend
   railway init
   
   # Set environment variables (do this in Railway dashboard for security)
   railway variables set NODE_ENV=production
   # ... set all other required variables
   
   # Deploy
   railway up
   ```

2. **Frontend Deployment (Vercel)**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   cd frontend
   vercel --prod
   
   # Set environment variables in Vercel dashboard
   # NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   # NEXT_PUBLIC_STRIPE_KEY=pk_live_...
   ```

#### AWS (ECS/Fargate)

1. **Build and push Docker images**
   ```bash
   # Build images
   docker build -t aisim-backend:latest ./backend
   docker build -t aisim-frontend:latest ./frontend
   
   # Tag and push to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL
   docker tag aisim-backend:latest YOUR_ECR_URL/aisim-backend:latest
   docker tag aisim-frontend:latest YOUR_ECR_URL/aisim-frontend:latest
   docker push YOUR_ECR_URL/aisim-backend:latest
   docker push YOUR_ECR_URL/aisim-frontend:latest
   ```

2. **Deploy with ECS**
   - Create ECS cluster
   - Create task definitions for backend and frontend
   - Create services with load balancers
   - Configure environment variables in task definitions
   - Set up RDS for PostgreSQL and ElastiCache for Redis

#### Google Cloud Run

```bash
# Backend
cd backend
gcloud run deploy aisim-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets=STRIPE_SECRET_KEY=stripe_key:latest,GOOGLE_API_KEY=google_key:latest

# Frontend
cd frontend
gcloud run deploy aisim-frontend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=https://aisim-backend-xxx.run.app
```

## 🔐 Environment Variables

### Required Variables

```bash
# Database (if not using managed service URL)
DB_PASSWORD=your_very_strong_password_here

# Database URL (alternative to separate DB vars)
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis
REDIS_URL=redis://host:6379

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_live_...  # Use live key for production
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Services
GOOGLE_API_KEY=your_actual_google_api_key

# Application Security
JWT_SECRET=your_32_plus_character_jwt_secret_here
ENCRYPTION_KEY=your_32_plus_character_encryption_key_here

# URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Environment
NODE_ENV=production
PORT=3000
```

### Optional Variables

```bash
# Brave Search (for enhanced lead generation)
BRAVE_API_KEY=BSA...

# Anthropic (if using Claude instead of Google AI)
ANTHROPIC_API_KEY=sk-ant-...
```

## 📊 Database Setup

### PostgreSQL

#### Managed Services (Recommended)
- **AWS RDS**: Automated backups, high availability
- **Railway**: Simple setup, automatic backups
- **Google Cloud SQL**: Integrated with Cloud Run
- **DigitalOcean Managed Databases**: Cost-effective

#### Self-Hosted Setup

```bash
# Initialize database
docker-compose -f docker-compose.prod.yml up -d postgres

# Database is auto-initialized with init-db.sql on first run
# Tables are created automatically by the application

# Create manual backup
docker exec aisim-postgres-prod pg_dump -U aisim aisim_ads > backup.sql

# Restore from backup
docker exec -i aisim-postgres-prod psql -U aisim aisim_ads < backup.sql
```

### Redis

#### Managed Services (Recommended)
- **AWS ElastiCache**: High performance, automatic failover
- **Railway**: Simple Redis instance
- **Redis Cloud**: Official Redis managed service

## 🔍 Monitoring & Logging

### Health Checks

The application includes health check endpoints:

```bash
# Backend health
curl https://api.yourdomain.com/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "2024-01-11T00:00:00.000Z",
#   "uptime": 12345
# }
```

### Logging

Application logs are written to stdout/stderr and include:
- Request/response logging with timing
- Error logging with stack traces (dev only)
- Security event logging
- Rate limit violations

Configure log aggregation:
- **Datadog**: Full-featured APM and logging
- **Logtail**: Simple log aggregation
- **CloudWatch** (AWS): Native AWS logging
- **Google Cloud Logging**: Native GCP logging

### Monitoring Setup

1. **Prometheus** (included in docker-compose.prod.yml)
   ```bash
   # Access Prometheus UI
   http://your-server:9090
   ```

2. **Custom Monitoring**
   - Set up alerts for:
     - High error rates (>5% of requests)
     - Slow response times (>2s average)
     - High memory usage (>80%)
     - Failed health checks
     - Database connection errors

## 🔒 Security Hardening

### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH (restrict to your IP)
sudo ufw enable

# Block direct database access from outside
# PostgreSQL (5432) and Redis (6379) should only be accessible from backend
```

### Regular Security Tasks

- [ ] **Weekly**: Review security logs and alerts
- [ ] **Monthly**: Update dependencies (`npm audit`, `npm update`)
- [ ] **Monthly**: Review API key usage and restrictions
- [ ] **Quarterly**: Rotate secrets (JWT_SECRET, ENCRYPTION_KEY)
- [ ] **Quarterly**: Review and update SSL certificates
- [ ] **Annually**: Security audit and penetration testing

## 🚨 Troubleshooting

### Common Issues

#### Application won't start
```bash
# Check environment variables
docker-compose -f docker-compose.prod.yml config

# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Common causes:
# - Missing required environment variables
# - Invalid API keys
# - Database connection issues
```

#### Database connection errors
```bash
# Check database is running
docker-compose -f docker-compose.prod.yml ps postgres

# Check connection
docker exec aisim-postgres-prod pg_isready -U aisim

# Check DATABASE_URL format
# postgresql://user:password@host:5432/database
```

#### High memory usage
```bash
# Check container stats
docker stats

# Adjust memory limits in docker-compose.prod.yml
# services:
#   backend:
#     deploy:
#       resources:
#         limits:
#           memory: 512M
```

## 📞 Support

For production deployment support:
- Documentation: https://docs.aisim.com
- Email: support@aisim.com
- GitHub Issues: https://github.com/yourusername/aisim-ad-automation/issues

## 📋 Post-Deployment Checklist

After deployment, verify:

- [ ] Application is accessible via HTTPS
- [ ] Health check endpoint returns 200 OK
- [ ] Can create an account and log in
- [ ] Can generate an ad successfully
- [ ] Payment processing works (test with Stripe test mode first)
- [ ] Analytics are being tracked
- [ ] Logs are being collected
- [ ] Monitoring alerts are configured
- [ ] Backups are running automatically
- [ ] SSL certificate is valid and will auto-renew
- [ ] Rate limiting is working (test with multiple requests)
- [ ] Error pages don't expose sensitive information
