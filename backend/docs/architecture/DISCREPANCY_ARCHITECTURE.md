# Discrepancy Architecture

> Defines how the system records, classifies, and exposes differences between expected operational truth and observed reality.

# 1. Purpose

The Discrepancy module identifies and records operational mismatches discovered during reconciliation.

It provides a permanent, traceable record of problems such as:

- Stock shortages
- Cash shortages
- Mpesa mismatches
- Transfer mismatches
- Unconfirmed stock additions

A discrepancy does not silently correct the underlying records. It records the difference so the responsible parties can investigate it.

# 2. Requirements: Functional and Non-functional

## Functional Requirements

The module must:

- Create discrepancies from reconciliation results.
- Classify discrepancy types.
- Record expected and actual values.
- Calculate the variance.
- Associate discrepancies with their Business and operational context.
- Associate discrepancies with a Shift when applicable.
- Track discrepancy status.
- Retrieve and filter discrepancies.
- Preserve discrepancy history.
- Prevent duplicate discrepancies for the same reconciliation event.

## Non-functional Requirements

The module must provide:

- Immutable evidence of detected discrepancies.
- Business-level data isolation.
- Deterministic discrepancy creation.
- Exact financial and quantity calculations.
- Auditability.
- Referential integrity.
- Reliable historical records.
- Transaction-safe creation.

# 3. Module Dependencies

## Depends On

- Business Module
- Branch Module
- Shift Module
- Inventory Module
- Stock Movement Module
- Shift Stock Item Module
- Shift Payment Summary Module
- Mpesa Transaction Module
- Transfer Module
- Prisma
- PostgreSQL

## Used By

- Reports Module
- Dashboard Module
- Reconciliation workflows
- Management/owner workflows

The Discrepancy module consumes reconciliation results from operational modules.

# 4. Design Principles

The module follows these principles:

- A discrepancy represents a difference, not the underlying transaction.
- The original operational records must remain intact.
- Every discrepancy must identify what was expected and what was observed.
- Every discrepancy must have a defined type.
- Discrepancies are never silently deleted.
- Financial variances use exact decimal arithmetic.
- Discrepancies remain traceable to their operational context.
- A discrepancy cannot be created without a detectable variance.
- Resolving a discrepancy must not rewrite historical operational records.

# 5. Module Skeleton

````text
Discrepancy
│
├── Classification
│   ├── Type
│   └── Status
│
├── Variance
│   ├── Expected Value
│   ├── Actual Value
│   └── Difference
│
├── Ownership
│   ├── Business
│   ├── Branch
│   └── Shift
│
├── Source Context
│   ├── Stock
│   ├── Payment
│   ├── Mpesa
│   └── Transfer
│
└── Investigation
    ├── Notes
    └── Resolution
6. File Structure
backend/
├── src/
│   └── discrepancies/
│       ├── discrepancies.module.ts
│       ├── discrepancies.controller.ts
│       ├── discrepancies.service.ts
│       │
│       ├── dto/
│       │   ├── create-discrepancy.dto.ts
│       │   └── update-discrepancy.dto.ts
│       │
│       └── entities/
│           └── discrepancy.entity.ts
│
└── prisma/
    └── schema.prisma
7. Entity Design
Discrepancy
Fields
id
businessId
branchId
shiftId
type
status
expectedValue
actualValue
variance
description
sourceReference
resolution
createdAt
updatedAt
Relationships
Discrepancy belongs to:
Business
Branch
Shift (optional)
Discrepancy Types
STOCK_SHORTAGE
CASH_SHORTAGE
MPESA_MISMATCH
TRANSFER_MISMATCH
UNCONFIRMED_ADDITION
Discrepancy Status
OPEN
RESOLVED
Ownership
Business
   │
   └── Branch
          │
          └── Shift
                 │
                 └── Discrepancy
The Discrepancy is the permanent record of a detected operational variance.

# 8. API Design

## Create Discrepancy

```http
POST /discrepancies
Creates a discrepancy from a verified reconciliation result.
Manual creation must not bypass discrepancy validation.
Get Discrepancies
GET /discrepancies
Supports filtering by:
Business
Branch
Shift
Type
Status
Date range
Get Discrepancy
GET /discrepancies/:id
Returns one discrepancy within the authorized Business.
Resolve Discrepancy
POST /discrepancies/:id/resolve
Marks an open discrepancy as resolved and records the resolution.
9. Discrepancy Lifecycle
Reconciliation
      │
      ▼
Expected Value
      │
      ├──── Actual Value
      │
      ▼
Compare Values
      │
      ├── No Difference → No Discrepancy
      │
      └── Difference
             │
             ▼
       Create Discrepancy
             │
             ▼
            OPEN
             │
             ▼
        Investigation
             │
             ▼
          RESOLVED
The original stock, payment, Mpesa, or transfer records remain unchanged.
10. Integration Points
The Discrepancy module integrates with:
Business Module
Branch Module
Shift Module
Inventory Module
Stock Movement Module
Shift Stock Item Module
Shift Payment Summary Module
Mpesa Transaction Module
Transfer Module
Reports Module
Integration Boundary
Operational modules establish what happened.
Reconciliation establishes what should have happened.
Discrepancy records the difference.
Reports expose the resulting problems.
11. Business Rules
Every discrepancy belongs to exactly one Business.
Every discrepancy belongs to exactly one Branch.
A discrepancy may belong to one Shift.
A discrepancy must represent a non-zero variance.
Expected and actual values must use compatible units.
Financial variances use exact decimal arithmetic.
A discrepancy cannot modify its source records.
An OPEN discrepancy may be resolved.
A RESOLVED discrepancy cannot return to OPEN through normal update operations.
Historical discrepancies must remain available.
Cross-Business discrepancy access is prohibited.
Duplicate discrepancies for the same reconciliation event must be prevented.
12. Validation Rules
Creation
Validate:
Business exists.
Branch exists.
Shift exists when supplied.
Source reference exists.
Discrepancy type is valid.
Expected value is valid.
Actual value is valid.
Expected and actual values use compatible units.
Variance is non-zero.
The same reconciliation event has not already produced a discrepancy.
Resolution
Validate:
Discrepancy exists.
Discrepancy belongs to the authorized Business.
Status is OPEN.
Resolution information is provided.
Data Integrity
The system must calculate:
Variance = Actual Value - Expected Value
The client must not be trusted to supply an independently calculated variance.
13. Database Design
enum DiscrepancyType {
  STOCK_SHORTAGE
  CASH_SHORTAGE
  MPESA_MISMATCH
  TRANSFER_MISMATCH
  UNCONFIRMED_ADDITION
}

enum DiscrepancyStatus {
  OPEN
  RESOLVED
}

model Discrepancy {
  id String @id @default(cuid())

  businessId String
  business Business @relation(
    fields: [businessId],
    references: [id]
  )

  branchId String
  branch Branch @relation(
    fields: [branchId],
    references: [id]
  )

  shiftId String?
  shift Shift? @relation(
    fields: [shiftId],
    references: [id]
  )

  type DiscrepancyType

  status DiscrepancyStatus @default(OPEN)

  expectedValue Decimal

  actualValue Decimal

  variance Decimal

  description String?

  sourceReference String

  resolution String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([businessId, status])
  @@index([branchId, createdAt])
  @@index([shiftId])
  @@index([sourceReference])
}
Database Principles
businessId establishes ownership.
sourceReference identifies the reconciliation source.
variance represents the calculated difference.
Status represents investigation state.
Historical discrepancy records remain stored.
14. Testing Requirements
Unit Tests
Verify:
Valid discrepancy creation.
Zero-variance rejection.
Correct variance calculation.
Invalid discrepancy type rejection.
Invalid source rejection.
Duplicate discrepancy prevention.
Resolution of an OPEN discrepancy.
Rejection of invalid resolution.
Integration Tests
Verify:
Business → Branch → Shift → Discrepancy relationships.
Stock reconciliation can create a discrepancy.
Payment reconciliation can create a discrepancy.
Mpesa reconciliation can create a discrepancy.
Source records remain unchanged.
Cross-Business access is rejected.
API Tests
Verify:
POST /discrepancies
GET  /discrepancies
GET  /discrepancies/:id
POST /discrepancies/:id/resolve
Reconciliation Example
Expected Mpesa:
10,000
Actual Mpesa:
9,500
System calculates:
Variance = 9,500 - 10,000
         = -500
Result:
Type: MPESA_MISMATCH
Status: OPEN
Variance: -500
No Mpesa transaction is deleted or modified to make the numbers match.

# 15. Implementation Algorithm

> Deterministic implementation procedure for the Discrepancy module.
> Follow this sequence exactly. Do not invent reconciliation behavior where the architecture already defines it.

## Step 1 — Verify Prerequisites

Confirm these modules exist and currently work:

- Business
- Branch
- Shift
- Inventory
- Stock Movement
- Shift Stock Item
- Shift Payment Summary
- Mpesa Account
- Mpesa Transaction
- Transfer

Also confirm:

```text
npx prisma validate
npm run build
If either fails:
STOP.
Report the exact failure.
Do not implement Discrepancy.
Step 2 — Create Enums
Add exactly:
enum DiscrepancyType {
  STOCK_SHORTAGE
  CASH_SHORTAGE
  MPESA_MISMATCH
  TRANSFER_MISMATCH
  UNCONFIRMED_ADDITION
}

enum DiscrepancyStatus {
  OPEN
  RESOLVED
}
Do not introduce additional types or statuses without an explicit requirement.
Step 3 — Create Prisma Model
Create Discrepancy with:
id
businessId
branchId
shiftId
type
status
expectedValue
actualValue
variance
description
sourceReference
resolution
createdAt
updatedAt
Relationships:
Discrepancy → Business
Discrepancy → Branch
Discrepancy → Shift
Use:
Decimal
for all financial/quantity values requiring exact arithmetic.

Step 4 — Establish Source Identification
sourceReference must identify the reconciliation event that produced the discrepancy.
Before creating a discrepancy:
Receive source reference
        ↓
Search existing discrepancy
        ↓
If already exists
        ↓
Reject duplicate creation
The same reconciliation event must never create multiple discrepancies.
Step 5 — Validate Schema and Migrate
Run:
npx prisma format
npx prisma validate
Then:
npx prisma migrate dev --name add_discrepancy
Verify that the migration succeeds.
If it fails:
STOP.
Fix the exact schema/migration error.
Do not continue.
Step 6 — Create Module Structure
Create:
src/discrepancies/
├── discrepancies.module.ts
├── discrepancies.controller.ts
├── discrepancies.service.ts
│
├── dto/
│   ├── create-discrepancy.dto.ts
│   └── resolve-discrepancy.dto.ts
│
└── entities/
    └── discrepancy.entity.ts
Do not place reconciliation calculations from other modules inside this module.
Step 7 — Implement Discrepancy Creation
Implement:
create()
Algorithm:
Reconciliation result received
        ↓
Resolve Business
        ↓
Verify Business ownership
        ↓
Verify Branch
        ↓
Verify Shift if supplied
        ↓
Validate discrepancy type
        ↓
Validate source reference
        ↓
Calculate variance
        ↓
If variance = 0 → reject
        ↓
Check duplicate source reference
        ↓
Create discrepancy
        ↓
status = OPEN
        ↓
Return discrepancy
The system calculates:
Variance = Actual Value - Expected Value
Never trust a client-supplied variance.

Step 8 — Enforce Business Isolation
Every query must include the authorized Business.
Never retrieve a discrepancy using only:
id
The effective condition must include:
id
AND businessId = authorizedBusinessId
This applies to:
Creation
Retrieval
Filtering
Resolution
Cross-Business access must fail.
Step 9 — Implement Retrieval
Implement:
findAll()
findOne()
Supported filters:
branchId
shiftId
type
status
date range
Every result must belong to the authorized Business.
Step 10 — Implement Resolution
Implement:
resolve()
Algorithm:
Receive discrepancy ID
        ↓
Resolve authorized Business
        ↓
Find discrepancy
        ↓
Verify Business ownership
        ↓
Verify status = OPEN
        ↓
Validate resolution
        ↓
Store resolution
        ↓
Set status = RESOLVED
        ↓
Return discrepancy
Do not modify:
expectedValue
actualValue
variance
sourceReference
type
Resolution records what happened during investigation; it does not rewrite the original discrepancy.
Step 11 — Prevent Invalid State Transitions
Allowed:
OPEN → RESOLVED
Not allowed:
RESOLVED → OPEN
Not allowed:
OPEN → deleted
Historical discrepancies must remain available.
Step 12 — Implement Controller
Expose only:
POST /discrepancies
GET /discrepancies
GET /discrepancies/:id
POST /discrepancies/:id/resolve
The controller must:
Validate input.
Enforce authentication/authorization through the existing system.
Delegate business logic to the service.
Never calculate reconciliation values itself.
Never directly access Prisma.
Step 13 — Test Stock Discrepancy
Example:
Expected stock = 50
Actual stock   = 45
System calculates:
Variance = 45 - 50
         = -5
Expected result:
type   = STOCK_SHORTAGE
status = OPEN
The original Inventory Item and Stock Movements remain unchanged.
Step 14 — Test Mpesa Discrepancy
Example:
Expected Mpesa = 10,000
Actual Mpesa   = 9,500
System calculates:
Variance = 9,500 - 10,000
         = -500
Expected result:
type   = MPESA_MISMATCH
status = OPEN
No Mpesa Transaction is modified or deleted.
Step 15 — Test Complete Lifecycle
Run this scenario:
Shift closes
      ↓
Reconciliation compares expected vs actual
      ↓
Variance detected
      ↓
Discrepancy created
      ↓
Status = OPEN
      ↓
Manager investigates
      ↓
Resolution recorded
      ↓
Status = RESOLVED
Then verify:
Original operational records = unchanged
Discrepancy history          = preserved
Resolution                   = recorded
Step 16 — Completion Gate
The module is complete only when:
✓ Prisma model exists
✓ Enums exist
✓ Relationships work
✓ Migration succeeds
✓ Business isolation works
✓ Discrepancy creation works
✓ Variance is system-calculated
✓ Zero variance is rejected
✓ Duplicate discrepancies are prevented
✓ Retrieval works
✓ Filtering works
✓ Resolution works
✓ RESOLVED cannot reopen normally
✓ Source records remain unchanged
✓ Tests pass
✓ Application builds
Only after this gate passes should implementation proceed to the next module in the overall architecture.
````
