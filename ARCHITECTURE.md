# PayMaster Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PayMaster System                            │
│                    Data Collection & Payment Management              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        MOBILE APPLICATION                            │
│                    (React Native + Expo)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              PRESENTATION LAYER (UI)                        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │   │
│  │  │Dashboard │ │Suppliers │ │Collections│ │ Payments │     │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │   │
│  │  │ Products │ │  Rates   │ │  Reports │ │ Settings │     │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │   │
│  └────────────────────────────────────────────────────────────┘   │
│                            ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │           APPLICATION LAYER (Business Logic)                │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │   │
│  │  │Auth Service │ │Sync Service │ │Data Service │         │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘         │   │
│  │  ┌─────────────┐ ┌─────────────┐                          │   │
│  │  │State Mgmt   │ │Network Mgmt │                          │   │
│  │  │(Context API)│ │             │                          │   │
│  │  └─────────────┘ └─────────────┘                          │   │
│  └────────────────────────────────────────────────────────────┘   │
│                            ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │        INFRASTRUCTURE LAYER (External Systems)              │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │   │
│  │  │ API Client  │ │Local Storage│ │SecureStore  │         │   │
│  │  │(HTTP/REST)  │ │  (SQLite)   │ │  (Tokens)   │         │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘         │   │
│  └────────────────────────────────────────────────────────────┘   │
│                            ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │               DOMAIN LAYER (Entities)                       │   │
│  │  User │ Supplier │ Product │ Rate │ Collection │ Payment   │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/TLS
                              │ (Token Auth)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND API SERVER                           │
│                      (Laravel + PHP)                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │        PRESENTATION LAYER (HTTP Controllers)                │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │   │
│  │  │ Auth │ │Users │ │Supp. │ │Prod. │ │Coll. │ │Paym. │  │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │   │
│  │  ┌──────────────────┐ ┌──────────────────┐              │   │
│  │  │Middleware (Auth) │ │  Validation      │              │   │
│  │  └──────────────────┘ └──────────────────┘              │   │
│  └────────────────────────────────────────────────────────────┘   │
│                            ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │         APPLICATION LAYER (Use Cases & Services)            │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │   │
│  │  │Auth UseCase  │ │CRUD UseCases │ │Sync UseCase  │      │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘      │   │
│  │  ┌──────────────┐ ┌──────────────┐                        │   │
│  │  │ DTOs         │ │   Mappers    │                        │   │
│  │  └──────────────┘ └──────────────┘                        │   │
│  └────────────────────────────────────────────────────────────┘   │
│                            ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │          DOMAIN LAYER (Core Business Logic)                 │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │   │
│  │  │   Entities   │ │ Repositories │ │   Services   │      │   │
│  │  │(Pure Objects)│ │ (Interfaces) │ │(Business Logic)     │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘      │   │
│  │  • User          • Payment Calculation Service            │   │
│  │  • Supplier      • Rate Management Service                │   │
│  │  • Product       • Conflict Resolution Logic              │   │
│  │  • ProductRate   • Balance Calculation                    │   │
│  │  • Collection                                              │   │
│  │  • Payment                                                 │   │
│  └────────────────────────────────────────────────────────────┘   │
│                            ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │      INFRASTRUCTURE LAYER (External Concerns)               │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │   │
│  │  │Repositories  │ │Authentication│ │    Logging   │      │   │
│  │  │(MySQL Impl)  │ │  (Sanctum)   │ │              │      │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘      │   │
│  │  ┌──────────────┐ ┌──────────────┐                        │   │
│  │  │  Encryption  │ │    Events    │                        │   │
│  │  └──────────────┘ └──────────────┘                        │   │
│  └────────────────────────────────────────────────────────────┘   │
│                            ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                     DATABASE LAYER                          │   │
│  │                    (MySQL 8.0+)                             │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │   │
│  │  │Users │ │Supp. │ │Prod. │ │Rates │ │Coll. │ │Paym. │  │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │   │
│  │  ┌──────────────┐                                         │   │
│  │  │  Sync Logs   │                                         │   │
│  │  └──────────────┘                                         │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Online Collection Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Create Collection
     ▼
┌──────────────┐
│ Mobile App   │
└──────┬───────┘
       │ 2. Validate Input
       │ 3. Get Current Rate
       ▼
┌──────────────┐
│ API Client   │
└──────┬───────┘
       │ 4. POST /collections (HTTPS)
       ▼
┌──────────────┐
│ Backend API  │
└──────┬───────┘
       │ 5. Authenticate & Authorize
       │ 6. Validate Data
       │ 7. Apply Rate
       │ 8. Calculate Amount
       ▼
┌──────────────┐
│  Database    │
└──────┬───────┘
       │ 9. Save Collection
       │ 10. Return Result
       ▼
┌──────────────┐
│ Mobile App   │
└──────┬───────┘
       │ 11. Update Local DB
       │ 12. Update UI
       ▼
┌─────────┐
│  User   │
└─────────┘
```

### Offline Collection Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Create Collection (No Network)
     ▼
┌──────────────┐
│ Mobile App   │
└──────┬───────┘
       │ 2. Validate Input
       │ 3. Get Cached Rate
       │ 4. Calculate Amount
       ▼
┌──────────────┐
│ Local SQLite │
└──────┬───────┘
       │ 5. Save Collection
       │ 6. Mark as Pending Sync
       │ 7. Return Success
       ▼
┌──────────────┐
│ Mobile App   │
└──────┬───────┘
       │ 8. Update UI
       │ 9. Show Pending Badge
       ▼
┌─────────┐
│  User   │
└─────────┘

... Later when online ...

┌──────────────┐
│Network Detected│
└──────┬───────┘
       │ Trigger Auto-Sync
       ▼
┌──────────────┐
│ Sync Service │
└──────┬───────┘
       │ 1. Get Pending Items
       │ 2. Batch Collections
       ▼
┌──────────────┐
│ API Client   │
└──────┬───────┘
       │ 3. POST /collections/sync
       ▼
┌──────────────┐
│ Backend API  │
└──────┬───────┘
       │ 4. Validate Each Item
       │ 5. Detect Conflicts
       │ 6. Save to Database
       ▼
┌──────────────┐
│  Database    │
└──────┬───────┘
       │ 7. Return Results
       ▼
┌──────────────┐
│ Mobile App   │
└──────┬───────┘
       │ 8. Update Local Status
       │ 9. Remove Pending Badge
       ▼
┌─────────┐
│  User   │
└─────────┘
```

### Rate Version Management

```
Time: Month 1
┌────────────────┐
│ Rate: $50/kg   │
│ Effective: Jan │
│ Status: Active │
└────────────────┘
        │
        │ Collections use $50
        ▼
┌────────────────┐
│ Collections    │
│ • 100kg @ $50  │
│ • 150kg @ $50  │
└────────────────┘

Time: Month 2 (New Rate Created)
┌────────────────┐     ┌────────────────┐
│ Rate: $50/kg   │     │ Rate: $55/kg   │
│ Effective: Jan │     │ Effective: Feb │
│ Status:Inactive│     │ Status: Active │
│ To: Jan 31     │     │ To: NULL       │
└────────────────┘     └────────────────┘
        │                      │
        │ Old collections      │ New collections use $55
        │ still show $50       ▼
        ▼              ┌────────────────┐
┌────────────────┐    │ Collections    │
│ Collections    │    │ • 120kg @ $55  │
│ • 100kg @ $50  │    │ • 180kg @ $55  │
│ • 150kg @ $50  │    └────────────────┘
└────────────────┘

IMMUTABILITY: Historical collections永远保持原始rate
```

### Payment Calculation

```
Supplier: Supplier A
Period: February 2025

┌─────────────────────────────────────┐
│         COLLECTIONS                 │
├─────────────────────────────────────┤
│ Date       │ Quantity │ Rate │ Amt │
├────────────┼──────────┼──────┼─────┤
│ Feb 15     │ 25.5 kg  │ $55  │$1403│
│ Feb 16     │ 30.2 kg  │ $55  │$1661│
│ Feb 20     │ 28.8 kg  │ $55  │$1584│
├────────────┴──────────┴──────┼─────┤
│         TOTAL COLLECTED      │$4648│
└──────────────────────────────┴─────┘
                -
┌─────────────────────────────────────┐
│          PAYMENTS                   │
├─────────────────────────────────────┤
│ Date       │ Type     │    Amount   │
├────────────┼──────────┼─────────────┤
│ Feb 10     │ Advance  │    $1000    │
│ Feb 25     │ Partial  │    $1500    │
├────────────┴──────────┼─────────────┤
│         TOTAL PAID     │    $2500    │
└────────────────────────┴─────────────┘
                =
┌─────────────────────────────────────┐
│         BALANCE DUE                 │
│           $2,148.00                 │
└─────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: NETWORK SECURITY                              │
│  ┌────────────────────────────────────────────────┐    │
│  │ • HTTPS/TLS 1.3                                │    │
│  │ • Certificate Pinning                          │    │
│  │ • Firewall Rules                               │    │
│  └────────────────────────────────────────────────┘    │
│                        ▼                                 │
│  Layer 2: AUTHENTICATION                                │
│  ┌────────────────────────────────────────────────┐    │
│  │ • Token-based (Sanctum)                        │    │
│  │ • Bcrypt Password Hashing                      │    │
│  │ • Secure Token Storage                         │    │
│  │ • Session Management                           │    │
│  └────────────────────────────────────────────────┘    │
│                        ▼                                 │
│  Layer 3: AUTHORIZATION                                 │
│  ┌────────────────────────────────────────────────┐    │
│  │ • RBAC (Role-Based Access Control)             │    │
│  │ • ABAC (Attribute-Based Access Control)        │    │
│  │ • Permission Checks                            │    │
│  └────────────────────────────────────────────────┘    │
│                        ▼                                 │
│  Layer 4: INPUT VALIDATION                              │
│  ┌────────────────────────────────────────────────┐    │
│  │ • Server-side Validation                       │    │
│  │ • Client-side Validation                       │    │
│  │ • Sanitization                                 │    │
│  │ • Type Checking                                │    │
│  └────────────────────────────────────────────────┘    │
│                        ▼                                 │
│  Layer 5: DATA PROTECTION                               │
│  ┌────────────────────────────────────────────────┐    │
│  │ • SQL Injection Prevention                     │    │
│  │ • XSS Prevention                               │    │
│  │ • CSRF Protection                              │    │
│  │ • Encrypted Storage                            │    │
│  └────────────────────────────────────────────────┘    │
│                        ▼                                 │
│  Layer 6: AUDIT & MONITORING                            │
│  ┌────────────────────────────────────────────────┐    │
│  │ • Audit Logging                                │    │
│  │ • Security Monitoring                          │    │
│  │ • Anomaly Detection                            │    │
│  │ • Incident Response                            │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Language**: PHP 8.1+
- **Framework**: Laravel (LTS)
- **Database**: MySQL 8.0+ / MariaDB 10.5+
- **Authentication**: Laravel Sanctum
- **Architecture**: Clean Architecture
- **Patterns**: Repository, Service, DTO

### Frontend
- **Framework**: React Native 0.74
- **Platform**: Expo SDK 51
- **Language**: TypeScript
- **Local Storage**: SQLite + SecureStore
- **State Management**: Context API
- **Architecture**: Clean Architecture

### Infrastructure
- **Web Server**: Nginx / Apache
- **Container**: Docker (optional)
- **SSL/TLS**: Let's Encrypt
- **Monitoring**: Custom logging
- **Backup**: Automated MySQL dumps

## Key Design Decisions

### 1. Clean Architecture
- Clear separation of concerns
- Framework independence at domain level
- Testable business logic
- Maintainable codebase

### 2. Offline-First Design
- Local SQLite storage
- Event-driven synchronization
- Conflict resolution
- Zero data loss guarantee

### 3. Immutable Rate History
- Rates never modified after creation
- New rates create new versions
- Historical integrity guaranteed
- Accurate financial reporting

### 4. Optimistic Locking
- Version-based conflict detection
- Last-write-wins with notification
- Minimal blocking
- Better concurrency

### 5. Minimal Dependencies
- Use native capabilities
- Only essential libraries
- LTS-supported dependencies
- Reduced technical debt

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│            PRODUCTION ENVIRONMENT            │
├─────────────────────────────────────────────┤
│                                              │
│  ┌────────────┐      ┌────────────┐        │
│  │   Mobile   │      │   Mobile   │        │
│  │   App      │ ...  │   App      │        │
│  │ (Users)    │      │ (Users)    │        │
│  └─────┬──────┘      └─────┬──────┘        │
│        │                   │                │
│        └───────┬───────────┘                │
│                │ HTTPS                       │
│                ▼                             │
│  ┌────────────────────────────┐            │
│  │     Load Balancer          │            │
│  │    (Optional)              │            │
│  └─────────────┬──────────────┘            │
│                │                             │
│       ┌────────┴────────┐                  │
│       │                 │                  │
│       ▼                 ▼                  │
│  ┌─────────┐      ┌─────────┐            │
│  │Backend-1│      │Backend-2│            │
│  │  (API)  │      │  (API)  │            │
│  └────┬────┘      └────┬────┘            │
│       │                │                  │
│       └────────┬───────┘                  │
│                ▼                           │
│  ┌─────────────────────────┐             │
│  │   MySQL Database        │             │
│  │   (Master + Replicas)   │             │
│  └─────────────────────────┘             │
│                                            │
│  ┌─────────────────────────┐             │
│  │   Backup System         │             │
│  │   (Automated)           │             │
│  └─────────────────────────┘             │
└─────────────────────────────────────────────┘
```

## Performance Characteristics

### Response Times (Target)
- API Endpoints: < 200ms (average)
- Database Queries: < 50ms (average)
- Page Load: < 1s
- Sync Operation: < 5s (100 items)

### Scalability
- Support: 1000+ concurrent users
- Collections: Millions of records
- Sync: Thousands of pending items
- Database: Optimized indexes

### Availability
- Target Uptime: 99.9%
- Backup Frequency: Daily
- Recovery Time: < 1 hour
- Data Loss: Zero tolerance

---

**This architecture ensures a scalable, secure, and maintainable system for production use.**
