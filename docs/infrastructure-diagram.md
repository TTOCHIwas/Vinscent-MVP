# Vinscent MVP Infrastructure Diagram

## Phase 1: MVP Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CI/CD PIPELINE                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  👨‍💻 Developer ──push──► 🐙 GitHub ──trigger──► ⚡ GitHub Actions ──deploy──► 🚀 Vercel        │
│                                    │                     │                             │
│                                    │                     └─── Environment Variables     │
│                                    │                                                   │
│                                    └─── Source Code Repository                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 HOSTING & COMPUTE                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│                              🚀 Vercel Platform                                        │
│                                                                                         │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                              │
│   │      Dev     │    │   Staging    │    │  Production  │                              │
│   │              │    │              │    │              │                              │
│   │  Next.js 15  │    │  Next.js 15  │    │  Next.js 15  │                              │
│   │  App Router  │    │  App Router  │    │  App Router  │                              │
│   │              │    │              │    │              │                              │
│   └──────────────┘    └──────────────┘    └──────────────┘                              │
│          │                     │                     │                                 │
│          └─────────────────────┼─────────────────────┘                                 │
│                                │                                                       │
└────────────────────────────────┼───────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DATA LAYER                                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│                            🗄️ PlanetScale MySQL                                         │
│                                                                                         │
│   ┌──────────────────────────────────────────────────────────────────────────────────┐   │
│   │                            Database Branches                                     │   │
│   │                                                                                  │   │
│   │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                          │   │
│   │  │    dev      │    │   staging   │    │    main     │                          │   │
│   │  │             │    │             │    │             │                          │   │
│   │  │ - brands    │    │ - brands    │    │ - brands    │                          │   │
│   │  │ - magazines │    │ - magazines │    │ - magazines │                          │   │
│   │  │ - products  │    │ - products  │    │ - products  │                          │   │
│   │  │ - images    │    │ - images    │    │ - images    │                          │   │
│   │  └─────────────┘    └─────────────┘    └─────────────┘                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 STORAGE LAYER                                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│                              📦 AWS S3 Bucket                                          │
│                                                                                         │
│   ┌──────────────────────────────────────────────────────────────────────────────────┐   │
│   │                         vinscent-mvp-images                                      │   │
│   │                                                                                  │   │
│   │  📁 brands/           📁 magazines/         📁 products/                         │   │
│   │  ├── brand-1.jpg      ├── mag-1-1.jpg      ├── prod-1-1.jpg                    │   │
│   │  ├── brand-2.jpg      ├── mag-1-2.jpg      ├── prod-1-2.jpg                    │   │
│   │  └── ...              ├── mag-2-1.jpg      └── ...                             │   │
│   │                       └── ...                                                  │   │
│   │                                                                                  │   │
│   │  🔐 IAM Role: vercel-s3-access                                                   │   │
│   │  📝 CORS Policy: api.vinscent-mvp.com                                            │   │
│   └──────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   USER JOURNEY                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  👤 User Request                                                                        │
│       │                                                                                 │
│       ▼                                                                                 │
│  🌐 Browser                                                                             │
│       │                                                                                 │
│       │ HTTPS Request                                                                   │
│       ▼                                                                                 │
│  🚀 Vercel Edge Network                                                                 │
│       │                                                                                 │
│       │ Route to Next.js App                                                           │
│       ▼                                                                                 │
│  ⚡ Next.js Server Component (SSR)                                                      │
│       │                                                                                 │
│       │ Database Query                                                                  │
│       ▼                                                                                 │
│  🗄️ PlanetScale MySQL                                                                   │
│       │                                                                                 │
│       │ Return Data                                                                     │
│       ▼                                                                                 │
│  ⚡ Next.js (Render HTML)                                                               │
│       │                                                                                 │
│       │ Fetch Images                                                                    │
│       ▼                                                                                 │
│  📦 AWS S3 (Image URLs)                                                                 │
│       │                                                                                 │
│       │ Complete HTML + Assets                                                          │
│       ▼                                                                                 │
│  👤 User (Rendered Page)                                                                │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Admin Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                ADMIN CONTENT MANAGEMENT                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  👨‍💼 Admin User                                                                          │
│       │                                                                                 │
│       │ Access /control?token=xxx                                                       │
│       ▼                                                                                 │
│  🔐 Middleware (Token Validation)                                                       │
│       │                                                                                 │
│       │ Valid Token ✓                                                                   │
│       ▼                                                                                 │
│  📝 Admin Dashboard (Client Component)                                                  │
│       │                                                                                 │
│       │ Upload Images + Create Post                                                     │
│       ▼                                                                                 │
│  📤 Image Upload API                                                                    │
│       │                                                                                 │
│       │ Store in S3                                                                     │
│       ▼                                                                                 │
│  📦 AWS S3 Bucket                                                                       │
│       │                                                                                 │
│       │ Return Image URLs                                                               │
│       ▼                                                                                 │
│  💾 Save to Database                                                                    │
│       │                                                                                 │
│       ▼                                                                                 │
│  🗄️ PlanetScale MySQL                                                                   │
│       │                                                                                 │
│       │ Success Response                                                                │
│       ▼                                                                                 │
│  ✅ Admin Dashboard (Updated)                                                            │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Environment Configuration

### Development Environment
```
Environment: feature-branch.vercel.app
Database: dev branch (PlanetScale)
Storage: vinscent-mvp-images-dev (S3)
Auth: Development tokens
```

### Staging Environment  
```
Environment: staging.vinscent-mvp.com
Database: staging branch (PlanetScale) 
Storage: vinscent-mvp-images-staging (S3)
Auth: Staging tokens
```

### Production Environment
```
Environment: vinscent-mvp.com
Database: main branch (PlanetScale)
Storage: vinscent-mvp-images-prod (S3)
Auth: Production tokens
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                  SECURITY LAYERS                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  🌐 Public Routes (/magazines, /products)                                              │
│       │                                                                                 │
│       │ No Authentication Required                                                      │
│       ▼                                                                                 │
│  🚀 Vercel (Public Access)                                                             │
│                                                                                         │
│  🔒 Protected Routes (/control, /admin)                                                │
│       │                                                                                 │
│       │ Token Required                                                                  │
│       ▼                                                                                 │
│  🛡️ Next.js Middleware                                                                 │
│       │                                                                                 │
│       │ Validate Daily Token                                                           │
│       ▼                                                                                 │
│  ✅ Role-Based Access (developer/designer/marketing/pm)                                 │
│                                                                                         │
│  📡 API Routes (/api/control/*)                                                        │
│       │                                                                                 │
│       │ Token + Role Headers                                                           │
│       ▼                                                                                 │
│  🔐 Admin Operations (CRUD)                                                            │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Monitoring & Analytics

### Phase 1 Monitoring Stack
```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 MONITORING LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  📊 Vercel Analytics                                                                    │
│  ├── Page Views                                                                        │
│  ├── Performance Metrics                                                               │
│  └── Error Tracking                                                                    │
│                                                                                         │
│  🗄️ PlanetScale Insights                                                               │
│  ├── Query Performance                                                                 │
│  ├── Connection Stats                                                                  │
│  └── Resource Usage                                                                    │
│                                                                                         │
│  ☁️ AWS CloudWatch                                                                     │
│  ├── S3 Usage Statistics                                                               │
│  ├── Request Metrics                                                                   │
│  └── Cost Monitoring                                                                   │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Scaling Triggers

### User Growth Milestones
- **5-30 users**: Current architecture
- **50-500 users**: Add Redis caching
- **500-1000 users**: Implement CDN
- **1000+ users**: Enhanced monitoring

### Performance Thresholds
- **Page load time > 3s**: Optimize or add CDN
- **API response > 500ms**: Add caching layer
- **Database queries > 100ms**: Optimize queries
- **Storage costs > $20/month**: Implement lifecycle policies

This infrastructure provides a solid foundation for the Vinscent MVP while maintaining cost efficiency and scalability for future growth.