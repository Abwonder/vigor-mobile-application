# Deployment Guide

This guide provides step-by-step instructions for deploying the Vigor application with production-ready security.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [SSL/TLS Configuration](#ssltls-configuration)
5. [Docker Deployment](#docker-deployment)
6. [Manual Deployment](#manual-deployment)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- **Server**: Linux server (Ubuntu 20.04+ recommended) with at least 2GB RAM
- **Docker**: Docker 20.10+ and Docker Compose 1.29+
- **Domain**: A registered domain name pointing to your server
- **Node.js**: Version 18+ (for manual deployment)
- **PostgreSQL**: Version 15+ (for manual deployment)

## Environment Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd MASTER-FOLDER-VIGOR
```

### 2. Create Environment Files

#### Backend Environment (`.env`)

Create `vigor-backend/.env`:

```bash
# Environment
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vigor_production
DB_USER=vigor_user
DB_PASSWORD=<STRONG_PASSWORD_HERE>

# JWT Configuration
JWT_SECRET=<GENERATE_STRONG_SECRET_32_CHARS>
JWT_REFRESH_SECRET=<GENERATE_STRONG_SECRET_32_CHARS>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Encryption
ENCRYPTION_KEY=<GENERATE_STRONG_KEY_32_CHARS>

# Cookie Secret
COOKIE_SECRET=<GENERATE_STRONG_SECRET>
```

**Generate Strong Secrets:**

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate cookie secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Frontend Environment

Create `vigor-admin-dashboard/.env.production`:

```bash
VITE_API_BASE_URL=https://yourdomain.com/api
```

#### Docker Compose Environment

Create `.env` in the root directory:

```bash
# Database
DB_NAME=vigor_production
DB_USER=vigor_user
DB_PASSWORD=<STRONG_PASSWORD_HERE>
DB_PORT=5432

# JWT
JWT_SECRET=<YOUR_JWT_SECRET>
JWT_REFRESH_SECRET=<YOUR_JWT_REFRESH_SECRET>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Encryption
ENCRYPTION_KEY=<YOUR_ENCRYPTION_KEY>
COOKIE_SECRET=<YOUR_COOKIE_SECRET>
```

## Database Setup

### Option 1: Using Docker (Recommended)

The Docker Compose configuration includes PostgreSQL. Skip to [Docker Deployment](#docker-deployment).

### Option 2: Manual PostgreSQL Setup

#### Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Create Database and User

```bash
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE vigor_production;
CREATE USER vigor_user WITH ENCRYPTED PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE vigor_production TO vigor_user;
\q
```

#### Run Migrations

```bash
cd vigor-backend
npm install
npm run migrate
```

## SSL/TLS Configuration

### Option 1: Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com

# Certificates will be in:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Option 2: Self-Signed Certificate (Development Only)

```bash
# Create SSL directory
mkdir -p ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=yourdomain.com"
```

### Copy Certificates for Docker

```bash
# Create ssl directory
mkdir -p ssl

# Copy Let's Encrypt certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*
```

## Docker Deployment

### 1. Build Frontend

```bash
cd vigor-admin-dashboard
npm install
npm run build
cd ..
```

### 2. Start Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Run Database Migrations

```bash
# Execute migrations in backend container
docker-compose exec backend npm run migrate

# Optional: Seed initial data
docker-compose exec backend npm run seed
```

### 4. Verify Deployment

```bash
# Check health endpoints
curl http://localhost/health
curl https://yourdomain.com/health
```

## Manual Deployment

### 1. Install Dependencies

```bash
# Backend
cd vigor-backend
npm install --production
npm run build

# Frontend
cd ../vigor-admin-dashboard
npm install
npm run build
```

### 2. Setup Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start backend
cd vigor-backend
pm2 start dist/server.js --name vigor-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

### 3. Setup Nginx

```bash
# Install Nginx
sudo apt install nginx

# Copy configuration
sudo cp nginx.conf /etc/nginx/nginx.conf

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 4. Setup Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

## Post-Deployment

### 1. Create Admin User

```bash
# Using Docker
docker-compose exec backend node -e "
const { UserModel } = require('./dist/models/User.model');
UserModel.create({
  email: 'admin@yourdomain.com',
  password: 'ChangeThisPassword123!',
  full_name: 'Admin User',
  role: 'admin'
}).then(() => console.log('Admin user created')).catch(console.error);
"

# Or manually via API
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "ChangeThisPassword123!",
    "full_name": "Admin User"
  }'
```

### 2. Security Checklist

- [ ] All environment variables use strong, unique values
- [ ] SSL/TLS certificates are properly configured
- [ ] Firewall is enabled and configured
- [ ] Database has strong password
- [ ] Default admin password has been changed
- [ ] CORS is configured for your domain only
- [ ] Rate limiting is enabled
- [ ] Logs are being collected
- [ ] Backups are configured

### 3. Setup Monitoring

```bash
# View application logs
docker-compose logs -f backend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Monitor system resources
docker stats
```

### 4. Setup Automated Backups

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker-compose exec -T postgres pg_dump -U vigor_user vigor_production > $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup.sh") | crontab -
```

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database connection failed
#    - Verify DB credentials in .env
#    - Ensure PostgreSQL is running

# 2. Port already in use
#    - Change PORT in .env
#    - Kill process using port: sudo lsof -ti:5000 | xargs kill -9
```

### Database Connection Issues

```bash
# Test database connection
docker-compose exec postgres psql -U vigor_user -d vigor_production

# Reset database
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run migrate
```

### SSL Certificate Issues

```bash
# Verify certificate files exist
ls -l ssl/

# Test SSL configuration
openssl s_client -connect yourdomain.com:443

# Renew Let's Encrypt certificates
sudo certbot renew
```

### Frontend Not Loading

```bash
# Rebuild frontend
cd vigor-admin-dashboard
npm run build

# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### High Memory Usage

```bash
# Check container stats
docker stats

# Restart services
docker-compose restart

# Increase server resources if needed
```

## Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Run migrations if needed
docker-compose exec backend npm run migrate
```

### Monitor Security Events

```bash
# View security audit logs
docker-compose exec backend node -e "
const db = require('./dist/database').default;
db.query('SELECT * FROM audit_logs WHERE action IN (\'failed_login\', \'account_locked\') ORDER BY created_at DESC LIMIT 20')
  .then(r => console.table(r.rows));
"
```

## Support

For issues or questions:

- Check logs: `docker-compose logs -f`
- Review security events in the admin dashboard
- Consult the [Security Guide](SECURITY.md)
- Check the [API Documentation](API.md)
