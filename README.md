# Professional Self Assessment

My journey through the Computer Science program has solidified my transition from a senior program manager in the aviation industry to a capable and confident software engineer focused on solving complex, real-world problems. Throughout the program, I’ve strengthened my foundational knowledge, expanded my technical skills, and developed a portfolio that demonstrates not only what I’ve learned, but how I apply it in practice.

As someone already working in a regulated industry reliant on legacy systems, I’ve seen firsthand the urgent need for modern, secure, and maintainable software solutions. This program enabled me to refine those skills while aligning with my career goal: to build and modernize software platforms for aviation and related industries. Developing the ePortfolio has given me a structured way to showcase that evolution, helping me reflect on how far I’ve come and where I want to go next.

I’ve applied what I’ve learned beyond the classroom. For example, I used my understanding of software design and version control to lead internal application development at work using technologies like Power Apps, PostgreSQL, and Python. I’ve built data automation utilities, reporting pipelines, and user-facing tools that solve real business problems—experience that’s directly informed my coursework.

Collaborating in team environments has been central to both my professional and academic experiences. I’ve coordinated cross-functional development efforts, worked with stakeholders to define software requirements, and integrated feedback from diverse technical and non-technical audiences. These communication and collaboration skills have strengthened my ability to deliver robust solutions that align with user and business needs.

Throughout the program, I’ve built and optimized data structures and algorithms, especially in performance-sensitive environments such as inventory and forecasting tools. My experience with software engineering and database development includes designing normalized schemas, managing application logic, and deploying secure, cloud-connected systems. Security principles such as input validation, access control, and secure database interaction—especially using tools like Prisma ORM—have been essential in both academic projects and workplace tools I’ve built.

The artifacts presented in my ePortfolio represent a cross-section of my capabilities across software design, algorithms, databases, and security. Together, they tell the story of my growth as a developer and my readiness to build scalable, secure, and maintainable software. Each artifact has been enhanced with documentation and narrative to illustrate the decisions behind the implementation, demonstrating not just what I built, but how and why I built it the way I did.

This portfolio is more than a capstone deliverable—it’s a launching point. It reflects both who I am as a professional and where I’m going next: deeper into software engineering, with a clear focus on quality, modern development practices, and continuous improvement.

---

# Asset Component Lifecycle Tracking System

**CS499 Capstone Project**

A full-stack web application that tracks asset component service lifecycles across multiple repair vendors. Designed to be industry-agnostic for tracking any repairable component through a defined service cycle.

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Technical Stack](#technical-stack)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [The Lifecycle Algorithm](#the-lifecycle-algorithm)
- [Project Structure](#project-structure)
- [Demonstrated Skills](#demonstrated-skills)

## Problem Statement

Many industries have repairable components that must follow a strict service cycle:

- **Visits 1-4**: Standard service (inspection, consumable replacement, minor repairs)
- **Visit 5**: Complete overhaul (full teardown, NDT inspection, rebuild)
- After overhaul, the cycle resets to position 1

Currently, no centralized system tracks where each asset is in its lifecycle. Multiple vendors perform repairs but don't share data. This means every time an asset arrives at a vendor, someone must manually research its history to determine what service is required.

**This application provides a centralized, vendor-neutral tracking system.**

## Solution Overview

This application provides:

1. **Centralized Asset Registry**: Track all asset components with their part numbers, serial numbers, and current lifecycle positions
2. **Service Recording**: Record completed services with full details (vendor, work performed, inspector, findings)
3. **Lifecycle Enforcement**: Automatically validate and enforce the 5-position service cycle
4. **Vendor-Neutral Lookup**: Any vendor can look up an asset by part/serial number to determine required service
5. **Complete Audit Trail**: Every change is logged for regulatory compliance

## Technical Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Runtime**: Node.js

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Download or unzip the project**

2. **Open a terminal in the project directory**

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```
   This will:
   - Generate the Prisma client
   - Create the SQLite database
   - Run the seed script to populate sample data

## Running the Application

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to: **http://localhost:3000**

### Other Commands

- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:reset` - Reset database and re-seed
- `npm run db:studio` - Open Prisma Studio (database GUI)

## API Documentation

All API endpoints return JSON with a consistent structure:

```typescript
{
  success: boolean,
  data?: T,
  error?: string,
  message?: string
}
```

### Assets API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assets` | List all assets (optional `?status=` filter) |
| GET | `/api/assets/[id]` | Get single asset with full service history |
| GET | `/api/assets/lookup?partNumber=X&serialNumber=Y` | Lookup by composite key |
| POST | `/api/assets` | Create new asset component |
| PUT | `/api/assets/[id]` | Update asset status/notes |

### Services API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List services (optional `?assetId=` filter) |
| POST | `/api/services` | Record new service (**enforces lifecycle rules**) |

### Vendors API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vendors` | List all vendors with service counts |
| POST | `/api/vendors` | Create new vendor |

### Audit API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit` | Get audit log entries with pagination |

### Testing with Postman

1. Import the following example requests:

**Create a new asset:**
```
POST http://localhost:3000/api/assets
Content-Type: application/json

{
  "partNumber": "B737-800-MW-002",
  "serialNumber": "TEST001"
}
```

**Look up an asset:**
```
GET http://localhost:3000/api/assets/lookup?partNumber=B737-800-MW-001&serialNumber=SN10001
```

**Record a service:**
```
POST http://localhost:3000/api/services
Content-Type: application/json

{
  "assetComponentId": 1,
  "vendorId": 1,
  "serviceType": "STANDARD",
  "serviceDate": "2024-12-01",
  "workPerformed": "Standard inspection and consumable replacement",
  "inspectorName": "John Doe"
}
```

## The Lifecycle Algorithm

The core business logic is a state machine that enforces the 5-position service cycle.

### State Diagram

```
Position 1 ──STANDARD──> Position 2 ──STANDARD──> Position 3
                                                      │
                                                  STANDARD
                                                      │
                                                      ▼
Position 5 <──STANDARD── Position 4 <─────────────────┘
    │
 OVERHAUL
    │
    └──────────────────> Position 1 (cycle resets)
```

### Validation Rules

```typescript
function validateServiceType(lifecyclePhase, serviceType):
    if lifecyclePhase == 5 and serviceType != "OVERHAUL":
        return error "Overhaul required at position 5"
    if lifecyclePhase < 5 and serviceType != "STANDARD":
        return error "Standard service required at positions 1-4"
    return valid
```

### Position Calculation

```typescript
function calculateNextPosition(currentPosition, serviceType):
    if serviceType == "OVERHAUL":
        return 1  // Reset after overhaul
    else:
        return currentPosition + 1
```

### Implementation

The lifecycle logic is implemented in [`src/lib/lifecycle.ts`](src/lib/lifecycle.ts) and enforced by the [`POST /api/services`](src/app/api/services/route.ts) endpoint.

## Project Structure

```
asset-tracker/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Sample data script
├── src/
│   ├── app/
│   │   ├── api/            # REST API routes
│   │   │   ├── assets/     # Assets CRUD
│   │   │   ├── services/   # Service records
│   │   │   ├── vendors/    # Vendor management
│   │   │   └── audit/      # Audit log
│   │   ├── assets/         # Asset pages
│   │   ├── lookup/         # Asset lookup page
│   │   ├── service/        # Record service page
│   │   ├── vendors/        # Vendors page
│   │   ├── audit/          # Audit trail page
│   │   └── page.tsx        # Dashboard
│   ├── components/         # Reusable UI components
│   ├── lib/                # Core utilities
│   │   ├── prisma.ts       # Database client
│   │   ├── lifecycle.ts    # Lifecycle state machine
│   │   └── audit.ts        # Audit logging
│   └── types/              # TypeScript definitions
├── package.json
└── README.md
```

## Demonstrated Skills

This project demonstrates competency in three key areas:

### 1. Software Design/Engineering

- Clean separation of concerns (API routes, business logic, UI components)
- TypeScript for type safety and better developer experience
- Reusable components following DRY principles
- Server and client component architecture (Next.js App Router)
- Progressive enhancement (forms work without JavaScript)

### 2. Algorithms & Data Structures

- **Lifecycle State Machine**: The core algorithm that enforces service cycles
- **Composite Key Lookups**: Efficient asset identification using part number + serial number
- **Audit Trail Design**: Efficient storage and retrieval of change history
- **Data Validation**: Input validation and business rule enforcement

### 3. Databases

- **Schema Design**: Normalized relational schema with proper constraints
- **Composite Unique Keys**: Handling serial number uniqueness rules
- **Referential Integrity**: Foreign key relationships between tables
- **Audit Logging**: Complete change tracking for compliance
- **Query Optimization**: Using Prisma's include and select for efficient queries

## Sample Data

The seed script creates:

- **4 Vendors**: Apex Maintenance Solutions, Precision Component Services, GlobalTech Repair Center, Summit Industrial Maintenance
- **10 Asset Components** in various states:
  - Position 1 (new asset)
  - Position 2 (1 service completed)
  - Position 3 (2 services completed)
  - Position 4 (3 services completed)
  - Position 5 (due for overhaul)
  - Assets at vendor for service
  - Retired asset
  - BER (Beyond Economical Repair) asset

## License

This project was created for educational purposes as part of CS499 Capstone.

---

**Author**: William Herwig
**Course**: CS499 Computer Science Capstone
