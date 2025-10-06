# Vinscent MVP - Deployment Architecture

## Overview

This document outlines the deployment architecture for Vinscent MVP, a Next.js-based perfume/beauty platform. The architecture is designed to be cost-effective (~$40/month budget), scalable, and suitable for a growing team.

## Current State Analysis

### **Existing Stack**
- **Framework**: Next.js 15.3.4 with App Router
- **Database**: MySQL with Drizzle ORM (localhost development)
- **Images**: Cloudinary integration
- **Authentication**: Custom token-based system
- **State Management**: TanStack Query

### **Current Limitations**
- Development environment only (localhost MySQL)
- Single environment setup
- No CI/CD pipeline
- No production deployment strategy

## Recommended Architecture

### **Phase 1: MVP Launch (0-500 users)**

```
┌─────────────────────────────────────────────────────────────────────┐
│                           DEVELOPMENT FLOW                          │
├─────────────────────────────────────────────────────────────────────┤
│  Developer → GitHub → GitHub Actions → Vercel → Production          │
│                           ↓                                         │
│                    PlanetScale MySQL                                │
│                           ↓                                         │
│                       AWS S3 Storage                               │
└─────────────────────────────────────────────────────────────────────┘
```

#### **Infrastructure Components**

1. **Frontend Hosting: Vercel**
   - **Why**: Optimal for Next.js, built-in CI/CD, excellent developer experience
   - **Environments**: 
     - Development (feature branches)
     - Staging (staging branch)
     - Production (main branch)
   - **Features**: Auto-deployments, preview URLs, edge functions

2. **Database: PlanetScale MySQL**
   - **Why**: Serverless MySQL, branching like Git, cost-effective
   - **Configuration**: 
     - Development database
     - Production database
     - Automatic scaling
   - **Migration**: Easy migration from current Drizzle setup

3. **Image Storage: AWS S3**
   - **Why**: Cost-effective, reliable, integrates well
   - **Setup**:
     - S3 bucket for image storage
     - IAM roles for secure access
     - Eventually add CloudFront CDN

4. **CI/CD: GitHub Actions**
   - **Why**: Free for public repos, excellent Next.js integration
   - **Workflow**:
     - Automated testing
     - Database migration checks
     - Multi-environment deployments

### **Phase 2: Growth (500+ users)**

```
┌─────────────────────────────────────────────────────────────────────┐
│                          SCALED ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────┤
│  Developer → GitHub → GitHub Actions → Vercel (Pro)                 │
│                           ↓                                         │
│                    PlanetScale (Scaled)                             │
│                           ↓                                         │
│                    Redis Cache Layer                               │
│                           ↓                                         │
│               AWS S3 + CloudFront CDN                              │
│                           ↓                                         │
│                  Monitoring (Vercel Analytics + DataDog)           │
└─────────────────────────────────────────────────────────────────────┘
```

#### **Additional Components**
- **Redis**: For caching magazine data and session management
- **CDN**: CloudFront for global image delivery
- **Monitoring**: Enhanced logging and performance monitoring

## Detailed Implementation Plan

### **Step 1: Database Setup (PlanetScale)**

**Why PlanetScale over other options:**
- **Cost**: Free tier for development, scales with usage
- **Features**: Database branching, automatic scaling, no connection limits
- **Migration**: Direct compatibility with Drizzle ORM

**Setup Steps:**
1. Create PlanetScale account
2. Create development and production databases
3. Update database connection strings
4. Migrate existing schema using Drizzle

### **Step 2: Image Storage Migration (AWS S3)**

**Migration from Cloudinary to S3:**
- **Immediate benefits**: Lower costs, more control
- **S3 Configuration**: 
  - Public read access for images
  - Proper CORS configuration
  - Lifecycle policies for cost optimization

**Implementation:**
```typescript
// Update image upload to use S3 instead of Cloudinary
const uploadToS3 = async (file: File) => {
  // S3 upload logic
};
```

### **Step 3: Deployment Pipeline (GitHub Actions)**

**Workflow Configuration:**
```yaml
name: Deploy
on:
  push:
    branches: [main, staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
```

### **Step 4: Environment Configuration**

**Environment Variables Setup:**
```bash
# Database
DATABASE_URL=mysql://...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...

# Authentication
PROJECT_SECRET=...
```

## Cost Analysis

### **Phase 1 Estimated Monthly Costs**

| Service | Tier | Monthly Cost | Usage |
|---------|------|--------------|-------|
| Vercel | Hobby/Pro | $0-20 | Up to 100GB bandwidth |
| PlanetScale | Starter | $10 | 10GB storage, 1B row reads |
| AWS S3 | Standard | $5-10 | Image storage & transfer |
| GitHub Actions | Free | $0 | Public repository |
| **Total** | | **$15-40** | **Well within budget** |

### **Phase 2 Scaling Costs**

| Service | Addition | Monthly Cost |
|---------|----------|--------------|
| Redis (Upstash) | Cache layer | $5-10 |
| CloudFront | CDN | $5-15 |
| Monitoring | DataDog/New Relic | $10-20 |
| **Total** | | **$35-85** |

## Migration Plan

### **Week 1: Infrastructure Setup**
1. Create PlanetScale account and databases
2. Set up AWS S3 bucket
3. Configure Vercel project

### **Week 2: Database Migration**
1. Update Drizzle configuration for PlanetScale
2. Run migrations on production database
3. Test data integrity

### **Week 3: Image Migration**
1. Implement S3 upload functionality
2. Migrate existing images (if needed)
3. Update image references

### **Week 4: Deployment Pipeline**
1. Set up GitHub Actions workflow
2. Configure environment variables
3. Test deployment process

## Security Considerations

### **Phase 1 Security**
- Environment variables properly configured
- S3 bucket permissions correctly set
- Database connections encrypted
- Custom authentication system maintained

### **Future Security Enhancements**
- Add rate limiting
- Implement proper error handling
- Add request logging
- Consider moving to NextAuth.js for authentication

## Monitoring Strategy

### **Phase 1: Basic Monitoring**
- Vercel built-in analytics
- PlanetScale query insights
- AWS CloudWatch for S3

### **Phase 2: Enhanced Monitoring**
- Custom error tracking
- Performance monitoring
- User behavior analytics
- Database performance optimization

## Team Collaboration Setup

### **Git Workflow**
```
main (production)
├── staging (pre-production testing)
├── develop (integration)
└── feature branches (individual features)
```

### **Environment Access**
- **Developers**: Access to development and staging
- **Admin**: Full access to all environments
- **Future team members**: Role-based access control

## Scaling Roadmap

### **User Milestones**
- **5-30 users (Alpha)**: Current architecture sufficient
- **50-500 users (Beta)**: Add Redis caching
- **500-1000 users (Launch)**: Add CDN and enhanced monitoring
- **1000+ users (Growth)**: Consider microservices architecture

## Success Metrics

### **Performance Targets**
- **Page Load Time**: < 3 seconds
- **API Response Time**: < 500ms
- **Uptime**: 99.9%
- **Image Load Time**: < 2 seconds

### **Cost Efficiency**
- **Cost per user**: < $0.05/month
- **Infrastructure cost**: < 10% of revenue
- **Scaling efficiency**: Linear cost increase with user growth

## Conclusion

This architecture provides:
- **Cost-effective solution** within $40/month budget
- **Scalable foundation** for growth to 1000+ users
- **Developer-friendly** setup for solo and team development
- **Clear upgrade path** for future requirements

The phased approach ensures immediate deployment capability while planning for future growth and team expansion.