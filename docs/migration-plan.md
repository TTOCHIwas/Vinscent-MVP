# Vinscent MVP - Migration Plan

## Overview

This document provides a step-by-step migration plan from the current local development setup to a production-ready deployment architecture. The migration is designed to be zero-downtime and reversible.

## Current State Analysis

### **Existing Setup**
```
Local Development Environment:
├── Next.js 15.3.4 (localhost:3000)
├── MySQL Database (localhost:3306)
├── Cloudinary (image storage)
├── Custom authentication system
├── TanStack Query (client-side state)
└── Git repository (magazineUpdate branch)
```

### **Migration Target**
```
Production Architecture:
├── Vercel (Next.js hosting)
├── PlanetScale MySQL (database)
├── AWS S3 (image storage)
├── GitHub Actions (CI/CD)
├── Multiple environments (dev/staging/prod)
└── Enhanced monitoring
```

## Pre-Migration Checklist

### **Prerequisites**
- [ ] Git repository properly set up with main/staging/develop branches
- [ ] All local changes committed and pushed
- [ ] Database schema documented and tested
- [ ] Environment variables inventory completed
- [ ] Backup of current database created
- [ ] Team access permissions defined

### **Account Setup Required**
- [ ] PlanetScale account created
- [ ] AWS account with S3 access
- [ ] Vercel account connected to GitHub
- [ ] Domain registration (optional for MVP)

## Phase 1: Infrastructure Setup (Week 1)

### **Day 1: Database Migration Setup**

#### **1.1 PlanetScale Setup**
```bash
# Install PlanetScale CLI
npm install -g @planetscale/cli

# Login to PlanetScale
pscale auth login

# Create new database
pscale database create vinscent-mvp

# Create development branch
pscale branch create vinscent-mvp dev
```

#### **1.2 Export Current Database**
```bash
# Create database dump
mysqldump -u root -p vinscent_mvp > backup/vinscent_mvp_backup.sql

# Document current schema
npx drizzle-kit generate:mysql
```

### **Day 2: AWS S3 Configuration**

#### **2.1 S3 Bucket Creation**
```bash
# Create S3 bucket (via AWS CLI or Console)
aws s3 mb s3://vinscent-mvp-images-prod
aws s3 mb s3://vinscent-mvp-images-staging
aws s3 mb s3://vinscent-mvp-images-dev
```

#### **2.2 IAM Configuration**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::vinscent-mvp-images-*/*"
    }
  ]
}
```

### **Day 3: Vercel Project Setup**

#### **3.1 Connect Repository**
1. Import GitHub repository to Vercel
2. Configure build settings for Next.js
3. Set up environment variables

#### **3.2 Environment Variables Setup**
```bash
# Production Environment
DATABASE_URL=mysql://...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=vinscent-mvp-images-prod
PROJECT_SECRET=...

# Staging Environment  
DATABASE_URL=mysql://...staging...
AWS_BUCKET_NAME=vinscent-mvp-images-staging
```

## Phase 2: Database Migration (Week 2)

### **Step 1: Schema Migration**

#### **2.1 Update Drizzle Configuration**
```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

#### **2.2 Create Migration Scripts**
```bash
# Generate migration files
npx drizzle-kit generate:mysql

# Apply migrations to PlanetScale
npx drizzle-kit push:mysql
```

### **Step 2: Data Migration**

#### **2.1 Export Data from Local MySQL**
```sql
-- Export brands
SELECT * FROM brand INTO OUTFILE '/tmp/brands.csv' 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n';

-- Export magazines
SELECT * FROM magazine INTO OUTFILE '/tmp/magazines.csv' 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n';

-- Export products and images similarly
```

#### **2.2 Import Data to PlanetScale**
```bash
# Use PlanetScale import feature or custom script
node scripts/migrate-data.js
```

#### **2.3 Data Migration Script**
```typescript
// scripts/migrate-data.ts
import { db } from '../src/lib/db';
import { brands, magazines, products } from '../src/lib/db/schema';
import * as fs from 'fs';
import * as csv from 'csv-parser';

async function migrateData() {
  // Read CSV files and insert into PlanetScale
  const brandsData = await readCSV('./backup/brands.csv');
  await db.insert(brands).values(brandsData);
  
  console.log('Data migration completed successfully');
}
```

### **Step 3: Validation**

#### **3.1 Data Integrity Check**
```typescript
// scripts/validate-migration.ts
async function validateMigration() {
  const localCount = await getLocalCounts();
  const planetscaleCount = await getPlanetscaleCounts();
  
  console.log('Migration validation:', {
    brands: localCount.brands === planetscaleCount.brands,
    magazines: localCount.magazines === planetscaleCount.magazines,
    products: localCount.products === planetscaleCount.products
  });
}
```

## Phase 3: Image Migration (Week 3)

### **Step 1: AWS S3 Integration**

#### **3.1 Update Image Upload Logic**
```typescript
// src/lib/storage/s3-client.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: File, key: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Body: await file.arrayBuffer(),
    ContentType: file.type,
  });

  await s3Client.send(command);
  return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`;
}
```

### **Step 2: Migrate Existing Images**

#### **3.2 Cloudinary to S3 Migration Script**
```typescript
// scripts/migrate-images.ts
import { downloadFromCloudinary, uploadToS3 } from '../src/lib/storage';

async function migrateImages() {
  const images = await getAllImageUrls(); // From database
  
  for (const image of images) {
    if (image.url.includes('cloudinary')) {
      const buffer = await downloadFromCloudinary(image.url);
      const newUrl = await uploadToS3(buffer, `migrated/${image.id}.jpg`);
      
      // Update database with new URL
      await updateImageUrl(image.id, newUrl);
    }
  }
}
```

### **Step 3: Update API Routes**

#### **3.3 Replace Cloudinary API Calls**
```typescript
// Before: Cloudinary upload
const result = await cloudinary.uploader.upload(image);

// After: S3 upload
const s3Key = `magazines/${Date.now()}-${file.name}`;
const url = await uploadToS3(file, s3Key);
```

## Phase 4: CI/CD Implementation (Week 4)

### **Step 1: GitHub Actions Setup**

#### **4.1 Workflow Configuration**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main, staging, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### **Step 2: Environment-Specific Deployments**

#### **4.2 Branch-Based Deployment Strategy**
```yaml
# Deploy staging
- name: Deploy Staging
  if: github.ref == 'refs/heads/staging'
  run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
  env:
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_STAGING }}

# Deploy production
- name: Deploy Production  
  if: github.ref == 'refs/heads/main'
  run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
  env:
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_PROD }}
```

## Testing Strategy

### **Pre-Deployment Testing**

#### **Test Environment Setup**
```bash
# Create test database branch
pscale branch create vinscent-mvp test

# Deploy to Vercel preview
git push origin feature/migration-test

# Run end-to-end tests
npm run test:e2e
```

#### **Critical Test Cases**
1. **User Authentication**: Admin login with tokens
2. **CRUD Operations**: Create, read, update, delete magazines
3. **Image Upload**: S3 upload and display functionality
4. **Database Queries**: All existing queries work correctly
5. **Performance**: Page load times under 3 seconds

### **Rollback Plan**

#### **Emergency Rollback Procedure**
1. **Revert Vercel deployment** to previous version
2. **Switch database branch** back to previous state
3. **Update DNS** if custom domain in use
4. **Restore image references** to Cloudinary URLs

#### **Rollback Script**
```bash
#!/bin/bash
# rollback.sh

echo "Initiating emergency rollback..."

# Revert Vercel deployment
vercel rollback --token $VERCEL_TOKEN

# Switch PlanetScale branch
pscale branch switch vinscent-mvp main-backup

echo "Rollback completed"
```

## Post-Migration Checklist

### **Immediate Verification (Day 1)**
- [ ] Website loads correctly on all environments
- [ ] Admin authentication works
- [ ] CRUD operations function properly  
- [ ] Images display correctly
- [ ] Database connections stable
- [ ] No critical errors in logs

### **Week 1 Monitoring**
- [ ] Performance metrics within acceptable ranges
- [ ] Cost tracking shows expected usage
- [ ] User feedback collected and addressed
- [ ] Database performance optimized
- [ ] Image loading times acceptable

### **Month 1 Optimization**
- [ ] Cost optimization opportunities identified
- [ ] Performance bottlenecks resolved
- [ ] Monitoring dashboards configured
- [ ] Team training completed
- [ ] Documentation updated

## Risk Mitigation

### **High-Risk Areas**

| Risk | Impact | Mitigation Strategy |
|------|--------|-------------------|
| Data loss during migration | High | Multiple backups, staged migration |
| Broken image references | Medium | URL mapping table, gradual migration |
| Authentication issues | High | Parallel token validation, quick rollback |
| Performance degradation | Medium | Load testing, monitoring alerts |
| Cost overruns | Low | Usage limits, cost alerts |

### **Contingency Plans**

1. **Database Migration Failure**
   - Restore from backup
   - Debug schema differences
   - Re-run migration with fixes

2. **Image Migration Issues**
   - Keep Cloudinary as fallback
   - Migrate in batches
   - Implement dual-source support temporarily

3. **Deployment Failures**
   - Use Vercel rollback feature
   - Check environment variables
   - Verify build process

## Success Criteria

### **Technical Metrics**
- ✅ Zero data loss during migration
- ✅ Page load time < 3 seconds
- ✅ API response time < 500ms  
- ✅ 99.9% uptime achieved
- ✅ All tests passing

### **Business Metrics**
- ✅ No user-facing downtime
- ✅ Admin workflow uninterrupted
- ✅ Cost within $40/month budget
- ✅ Scalability targets met
- ✅ Team productivity maintained

## Timeline Summary

| Week | Focus | Key Deliverables |
|------|-------|-----------------|
| **Week 1** | Infrastructure Setup | PlanetScale, AWS S3, Vercel configuration |
| **Week 2** | Database Migration | Schema and data migration completed |
| **Week 3** | Image Migration | S3 integration and image transfer |
| **Week 4** | CI/CD & Testing | Automated deployment and validation |

**Total Timeline**: 4 weeks for complete migration
**Rollback Window**: Available until Week 6
**Full Optimization**: Complete by Week 8

This migration plan ensures a smooth transition from development to production while maintaining data integrity, system performance, and cost efficiency.