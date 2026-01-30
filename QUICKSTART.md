# Quick Start Guide

Get your Vigor application up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ installed (or use Docker)
- Git installed

## Development Setup (5 minutes)

### 1. Install Dependencies

```bash
# Backend
cd vigor-backend
npm install

# Frontend
cd ../vigor-admin-dashboard
npm install
```

### 2. Setup Environment

```bash
# Backend - Copy example env file
cd vigor-backend
cp .env.example .env

# Generate secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('COOKIE_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Update .env with the generated values
```

### 3. Setup Database

**Option A: Using Docker (Easiest)**

```bash
# Start PostgreSQL
docker run --name vigor-postgres \
  -e POSTGRES_DB=vigor_db \
  -e POSTGRES_USER=vigor_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15-alpine
```

**Option B: Local PostgreSQL**

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE vigor_db;
CREATE USER vigor_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE vigor_db TO vigor_user;
\q
```

### 4. Run Migrations

```bash
cd vigor-backend
npm run migrate
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd vigor-backend
npm run dev

# Terminal 2 - Frontend
cd vigor-admin-dashboard
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### 7. Create Admin User

```bash
# Register via API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123!",
    "full_name": "Admin User"
  }'
```

## Production Deployment (Docker)

### 1. Build Frontend

```bash
cd vigor-admin-dashboard
npm install
npm run build
```

### 2. Setup Environment

```bash
# Copy and edit environment file
cp .env.example .env
# Edit .env with production values
```

### 3. Setup SSL Certificates

```bash
# Using Let's Encrypt
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*
```

### 4. Deploy with Docker

```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migrate

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Verify Deployment

```bash
# Health check
curl https://yourdomain.com/health

# Create admin user
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecurePass123!",
    "full_name": "Admin User"
  }'
```

## Common Commands

### Development

```bash
# Start backend
cd vigor-backend && npm run dev

# Start frontend
cd vigor-admin-dashboard && npm run dev

# Run migrations
cd vigor-backend && npm run migrate

# View database
psql -U vigor_user -d vigor_db
```

### Production (Docker)

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Restart service
docker-compose restart [service_name]

# Run migrations
docker-compose exec backend npm run migrate

# Backup database
docker-compose exec postgres pg_dump -U vigor_user vigor_production > backup.sql

# Restore database
docker-compose exec -T postgres psql -U vigor_user vigor_production < backup.sql
```

## Troubleshooting

### Backend won't start

```bash
# Check if port 5000 is in use
lsof -ti:5000

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Check database connection
psql -U vigor_user -d vigor_db
```

### Database connection failed

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check credentials in .env file
cat vigor-backend/.env
```

### Frontend can't connect to backend

```bash
# Check VITE_API_BASE_URL in .env.local
echo $VITE_API_BASE_URL

# Verify backend is running
curl http://localhost:5000/health
```

## Next Steps

1. **Read the Documentation**
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
   - [SECURITY.md](SECURITY.md) - Security features and best practices
   - [walkthrough.md](.gemini/antigravity/brain/4cfe3870-6f93-402b-a577-7a6af3a3a277/walkthrough.md) - Implementation details

2. **Configure for Production**
   - Update all environment variables with production values
   - Setup SSL certificates
   - Configure domain and DNS
   - Setup monitoring and backups

3. **Test the Application**
   - Test authentication flows
   - Test API endpoints
   - Perform security audit
   - Load testing

4. **Deploy to Production**
   - Follow the Docker deployment steps
   - Verify all services are running
   - Create admin user
   - Monitor logs for errors

## Support

For detailed information, see:

- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
- [SECURITY.md](SECURITY.md) - Security documentation
- [Walkthrough](.gemini/antigravity/brain/4cfe3870-6f93-402b-a577-7a6af3a3a277/walkthrough.md) - Implementation walkthrough
