# Vinscent MVP - Environment Setup Guide

## Overview

This guide provides step-by-step instructions for setting up development, staging, and production environments for the Vinscent MVP project. It covers both local development setup and cloud infrastructure configuration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Image Storage Configuration](#image-storage-configuration)
6. [Deployment Setup](#deployment-setup)
7. [Team Onboarding](#team-onboarding)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### **Required Software**
```bash
# Node.js (v18 or higher)
node --version  # Should be v18+

# npm (comes with Node.js)
npm --version

# Git
git --version

# Optional but recommended
# pnpm (faster alternative to npm)
npm install -g pnpm
```

### **Required Accounts**
- **GitHub Account**: For version control and CI/CD
- **Vercel Account**: For hosting (free tier available)
- **PlanetScale Account**: For database (free tier available)
- **AWS Account**: For S3 storage (free tier available)

## Local Development Setup

### **Step 1: Repository Setup**

#### **1.1 Clone Repository**
```bash
# Clone the repository
git clone https://github.com/yourusername/vinscent-mvp.git
cd vinscent-mvp

# Install dependencies
npm install
# or
pnpm install
```

#### **1.2 Branch Structure**
```bash
# Create and switch to develop branch
git checkout -b develop

# Understand branch structure
# main      (production)
# staging   (pre-production)
# develop   (integration)
# feature/* (individual features)
```

### **Step 2: Environment Files Setup**

#### **2.1 Create Environment Files**
```bash
# Create environment files
cp .env.example .env.local
cp .env.example .env.development
cp .env.example .env.production
```

#### **2.2 Local Environment Configuration**
```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_APP_NAME="Vinscent MVP (Local)"
NEXT_PUBLIC_APP_VERSION="1.0.0-dev"

# Database (Local MySQL for development)
DATABASE_URL="mysql://root:vinscent@localhost:3306/vinscent_mvp"

# Authentication
PROJECT_SECRET="local_development_secret_key"
DEV_BIRTH="19950315"
DEV_PHONE="1234"
DESIGN_BIRTH="19960720"
DESIGN_PHONE="5678"

# Image Storage (temporary local setup)
# Will be replaced with S3 in production
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### **Step 3: Database Setup (Local)**

#### **3.1 MySQL Local Setup**
```bash
# Install MySQL (if not already installed)
# macOS
brew install mysql
brew services start mysql

# Windows
# Download and install MySQL from official website

# Linux (Ubuntu/Debian)
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

#### **3.2 Database Creation**
```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE vinscent_mvp;

-- Create user (optional, for security)
CREATE USER 'vinscent'@'localhost' IDENTIFIED BY 'vinscent';
GRANT ALL PRIVILEGES ON vinscent_mvp.* TO 'vinscent'@'localhost';
FLUSH PRIVILEGES;
```

#### **3.3 Run Migrations**
```bash
# Generate Drizzle migration files
npx drizzle-kit generate:mysql

# Apply migrations
npx drizzle-kit push:mysql

# Verify database structure
npx drizzle-kit introspect:mysql
```

### **Step 4: Development Server**

#### **4.1 Start Development Server**
```bash
# Start the development server
npm run dev
# or
pnpm dev

# Server will be available at:
# http://localhost:3000
```

#### **4.2 Verify Setup**
- ✅ Website loads at `http://localhost:3000`
- ✅ Database connection successful
- ✅ Admin authentication works with test tokens
- ✅ Image upload functionality works
- ✅ No console errors

## Environment Configuration

### **Development Environment**

#### **Purpose**: Feature development and testing
```bash
# .env.development
NODE_ENV=development
NEXT_PUBLIC_BASE_URL="https://dev-vinscent-mvp.vercel.app"

# PlanetScale Development Branch
DATABASE_URL="mysql://username:password@host/vinscent-mvp?sslaccept=strict&ssl_ca=/etc/ssl/certs/ca-certificates.crt"

# AWS S3 Development Bucket
AWS_ACCESS_KEY_ID="your-dev-access-key"
AWS_SECRET_ACCESS_KEY="your-dev-secret-key"
AWS_BUCKET_NAME="vinscent-mvp-images-dev"
AWS_REGION="us-east-1"
```

### **Staging Environment**

#### **Purpose**: Pre-production testing and client review
```bash
# .env.staging
NODE_ENV=production
NEXT_PUBLIC_BASE_URL="https://staging-vinscent-mvp.vercel.app"

# PlanetScale Staging Branch
DATABASE_URL="mysql://username:password@host/vinscent-mvp?sslaccept=strict&ssl_ca=/etc/ssl/certs/ca-certificates.crt"

# AWS S3 Staging Bucket
AWS_BUCKET_NAME="vinscent-mvp-images-staging"

# Staging-specific secrets
PROJECT_SECRET="staging_secret_key_different_from_prod"
```

### **Production Environment**

#### **Purpose**: Live application for end users
```bash
# .env.production
NODE_ENV=production
NEXT_PUBLIC_BASE_URL="https://vinscent-mvp.com"

# PlanetScale Production Branch (main)
DATABASE_URL="mysql://username:password@host/vinscent-mvp?sslaccept=strict&ssl_ca=/etc/ssl/certs/ca-certificates.crt"

# AWS S3 Production Bucket
AWS_BUCKET_NAME="vinscent-mvp-images-prod"

# Production secrets (never commit these!)
PROJECT_SECRET="super_secure_production_secret"
DEV_BIRTH="actual_birth_date"
DEV_PHONE="actual_phone_digits"
```

## Database Setup

### **PlanetScale Configuration**

#### **Step 1: Install PlanetScale CLI**
```bash
# Install PlanetScale CLI
npm install -g @planetscale/cli

# Login to PlanetScale
pscale auth login

# Verify connection
pscale database list
```

#### **Step 2: Database Creation**
```bash
# Create main database
pscale database create vinscent-mvp

# Create development branch
pscale branch create vinscent-mvp dev

# Create staging branch
pscale branch create vinscent-mvp staging

# List branches to verify
pscale branch list vinscent-mvp
```

#### **Step 3: Connection Setup**
```bash
# Get connection string for development
pscale connect vinscent-mvp dev --port 3309

# In another terminal, update .env.local
DATABASE_URL="mysql://root@127.0.0.1:3309/vinscent-mvp"
```

#### **Step 4: Schema Migration**
```bash
# Push schema to PlanetScale
npx drizzle-kit push:mysql

# Verify schema
pscale shell vinscent-mvp dev
> SHOW TABLES;
> DESCRIBE brand;
```

## Image Storage Configuration

### **AWS S3 Setup**

#### **Step 1: Create S3 Buckets**
```bash
# Install AWS CLI (optional)
pip install awscli

# Configure AWS credentials
aws configure

# Create buckets
aws s3 mb s3://vinscent-mvp-images-dev
aws s3 mb s3://vinscent-mvp-images-staging  
aws s3 mb s3://vinscent-mvp-images-prod
```

#### **Step 2: IAM User Creation**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::vinscent-mvp-images-*",
        "arn:aws:s3:::vinscent-mvp-images-*/*"
      ]
    }
  ]
}
```

#### **Step 3: CORS Configuration**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://dev-vinscent-mvp.vercel.app",
      "https://staging-vinscent-mvp.vercel.app",
      "https://vinscent-mvp.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

#### **Step 4: Update Application Code**
```typescript
// src/lib/storage/s3-client.ts (already exists)
// Verify the S3 client configuration works
import { uploadToS3 } from '@/lib/storage/s3-client';

// Test upload
const testUpload = async () => {
  const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
  const url = await uploadToS3(testFile, 'test/test.txt');
  console.log('Test upload successful:', url);
};
```

## Deployment Setup

### **Vercel Configuration**

#### **Step 1: Connect GitHub Repository**
1. Visit [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import repository: `yourusername/vinscent-mvp`
4. Configure deployment settings

#### **Step 2: Environment Variables Setup**
```bash
# Via Vercel CLI
npm install -g vercel
vercel login

# Set production environment variables
vercel env add DATABASE_URL production
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add AWS_BUCKET_NAME production
vercel env add PROJECT_SECRET production

# Set staging environment variables
vercel env add DATABASE_URL preview
# ... repeat for all staging variables
```

#### **Step 3: Domain Configuration**
```bash
# Add custom domain (optional)
vercel domains add vinscent-mvp.com
vercel domains add staging.vinscent-mvp.com

# Configure DNS settings
# A record: @ -> 76.76.19.61
# CNAME: www -> cname.vercel-dns.com
```

### **GitHub Actions Setup**

#### **Step 1: Create Workflow File**
```yaml
# .github/workflows/deploy.yml (already created in migration plan)
# Verify the workflow file exists and is configured correctly
```

#### **Step 2: Configure Secrets**
```bash
# In GitHub repository settings > Secrets and variables > Actions
# Add the following secrets:

# Vercel Configuration
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# Database (for CI testing)
DATABASE_URL=your_test_database_url
```

## Team Onboarding

### **New Developer Setup Checklist**

#### **Phase 1: Access Setup**
- [ ] GitHub repository access granted
- [ ] Vercel team member invited
- [ ] PlanetScale organization access
- [ ] AWS IAM user created (if needed)
- [ ] Slack/Discord channel access

#### **Phase 2: Local Environment**
- [ ] Repository cloned successfully
- [ ] Dependencies installed
- [ ] Environment files configured
- [ ] Local database connected
- [ ] Development server running
- [ ] Admin authentication working

#### **Phase 3: Development Workflow**
- [ ] Branch strategy understood
- [ ] Code style guidelines reviewed
- [ ] Testing procedures understood
- [ ] Deployment process familiar
- [ ] First feature branch created and merged

### **Team Roles and Permissions**

#### **Developer Role**
```yaml
Permissions:
  - GitHub: Write access to feature branches
  - Vercel: Preview deployments
  - PlanetScale: Dev branch access
  - AWS S3: Development bucket only

Access Level:
  - Can create feature branches
  - Can deploy to preview environments
  - Cannot deploy to production
  - Cannot modify main/staging branches directly
```

#### **Lead Developer/Admin Role**
```yaml
Permissions:
  - GitHub: Admin access to all branches
  - Vercel: Production deployment access
  - PlanetScale: All branches access
  - AWS S3: All buckets access

Access Level:
  - Can merge to main/staging branches
  - Can deploy to all environments
  - Can manage team member access
  - Can modify infrastructure settings
```

## Troubleshooting

### **Common Issues and Solutions**

#### **Database Connection Issues**
```bash
# Issue: Cannot connect to PlanetScale
# Solution 1: Check connection string format
DATABASE_URL="mysql://username:password@host/database?sslaccept=strict"

# Solution 2: Use PlanetScale connection helper
pscale connect vinscent-mvp dev --port 3309
# Then use: mysql://root@127.0.0.1:3309/vinscent-mvp

# Solution 3: Check firewall/network settings
ping aws.connect.psdb.cloud
```

#### **Image Upload Issues**
```bash
# Issue: S3 upload fails with CORS error
# Solution: Verify CORS configuration in S3 bucket

# Issue: Access denied errors
# Solution: Check IAM permissions and policy

# Issue: Environment variables not loading
# Solution: Restart development server after changing .env files
```

#### **Deployment Issues**
```bash
# Issue: Build fails on Vercel
# Solution 1: Check build logs in Vercel dashboard
# Solution 2: Verify all environment variables are set
# Solution 3: Test build locally
npm run build

# Issue: Environment variables not available
# Solution: Check Vercel environment variable configuration
vercel env ls
```

#### **Authentication Issues**
```bash
# Issue: Admin tokens not working
# Solution 1: Verify PROJECT_SECRET is correct
# Solution 2: Check token generation logic
node scripts/generate-token.js developer

# Issue: Middleware blocking requests
# Solution: Check middleware.ts configuration and token format
```

### **Debugging Tools**

#### **Local Development**
```bash
# Database debugging
npx drizzle-kit introspect:mysql

# API testing
curl http://localhost:3000/api/magazines

# Log debugging
console.log('Debug info:', { variable, timestamp: new Date() });
```

#### **Production Debugging**
```bash
# Vercel logs
vercel logs --app vinscent-mvp

# PlanetScale query insights
# Use PlanetScale dashboard to monitor queries

# AWS CloudWatch
# Monitor S3 usage and errors in AWS Console
```

## Environment Maintenance

### **Regular Tasks**

#### **Weekly Tasks**
- [ ] Monitor cost usage across all services
- [ ] Review deployment logs for errors
- [ ] Check database performance metrics
- [ ] Verify backup procedures
- [ ] Update dependencies (patch versions)

#### **Monthly Tasks**
- [ ] Security audit of access permissions
- [ ] Performance optimization review
- [ ] Cost optimization opportunities
- [ ] Database cleanup and optimization
- [ ] Documentation updates

#### **Quarterly Tasks**
- [ ] Major dependency updates
- [ ] Infrastructure scaling review
- [ ] Disaster recovery testing
- [ ] Team access audit
- [ ] Compliance and security review

### **Monitoring and Alerts**

#### **Cost Monitoring**
```bash
# Set up cost alerts for each service
# Vercel: Monitor bandwidth usage
# PlanetScale: Monitor row reads/storage
# AWS S3: Monitor storage and requests
```

#### **Performance Monitoring**
```bash
# Key metrics to monitor:
# - Page load time < 3 seconds
# - API response time < 500ms
# - Database query time < 100ms
# - Image load time < 2 seconds
```

## Quick Reference

### **Essential Commands**
```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run lint                   # Run ESLint
npm run lint:css              # Run Stylelint

# Database
npx drizzle-kit generate:mysql # Generate migrations
npx drizzle-kit push:mysql     # Apply migrations
pscale connect vinscent-mvp dev # Connect to PlanetScale

# Deployment
vercel --prod                  # Deploy to production
vercel logs                    # View deployment logs
git push origin main          # Trigger production deployment
```

### **Important URLs**
- **Local Development**: http://localhost:3000
- **Storybook**: http://localhost:6006
- **Development**: https://dev-vinscent-mvp.vercel.app
- **Staging**: https://staging-vinscent-mvp.vercel.app
- **Production**: https://vinscent-mvp.com

This environment setup guide provides everything needed to get started with Vinscent MVP development and deployment. For additional help, refer to the specific service documentation or reach out to the development team.