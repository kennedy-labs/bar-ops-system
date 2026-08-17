# 1. Purpose

The Shift module establishes temporary operational ownership within a Branch.

A Shift assigns responsibility for stock, cash, Mpesa activity, expenses, and operational events to a specific User during a defined period.

It serves as the primary accountability boundary of the system.

---

# 2. Module Responsibility

The Shift module is responsible for:

- Opening shifts
- Closing shifts
- Assigning operational ownership
- Recording opening and closing times
- Associating operational events with a responsible User
- Tracking the operational lifecycle of a shift

The Shift module is **not responsible** for:

- Inventory management
- Stock movements
- Transfer execution
- Expense calculations
- Mpesa ingestion
- Profit calculations
- Discrepancy detection

These responsibilities belong to their respective modules.

---

# 3. Module Dependencies

## Depends On

- Business Module
- Branch Module
- User Module
- Prisma
- Database

A Shift cannot exist without a Branch and a User.

## Used By

The Shift module is used by:

- Shift Stock Item Module
- Stock Movement Module
- Transfer Module
- Expense Module
- Mpesa Transaction Module
- Shift Payment Summary Module
- Discrepancy Module
- Reports Module

Every operational event belongs to a Shift.

---

# 4. Design Principles

The Shift module follows these principles:

- Every Shift belongs to one Branch.
- Every Shift belongs to one User.
- Only one active Shift is allowed per User.
- Operational ownership exists only while a Shift is active.
- Every operational event references a Shift.
- Shifts become immutable after closing.

---

# 5. Module Skeleton

```
Shift
│
├── Shift Information
│   ├── Status
│   ├── Opening Time
│   ├── Closing Time
│   └── Notes
│
├── Ownership
│   ├── Business
│   ├── Branch
│   └── User
│
└── Operational References
    ├── Shift Stock Items
    ├── Stock Movements
    ├── Transfers
    ├── Expenses
    ├── Mpesa Transactions
    ├── Shift Payment Summary
    ├── Discrepancies
    └── Reports
```

---

# 6. File Structure

```
backend/
├── src/
│   └── shifts/
│       ├── shifts.module.ts
│       ├── shifts.controller.ts
│       ├── shifts.service.ts
│       │
│       ├── dto/
│       │   ├── open-shift.dto.ts
│       │   ├── close-shift.dto.ts
│       │   └── update-shift.dto.ts
│       │
│       └── entities/
│           └── shift.entity.ts
│
└── prisma/
    └── schema.prisma
```

---

# 7. Entity Design

## Shift

### Fields

- id
- businessId
- branchId
- userId
- status
- openedAt
- closedAt
- notes
- createdAt
- updatedAt

### Relationships

Shift belongs to:

- Business
- Branch
- User

Referenced by:

- ShiftStockItem[]
- StockMovement[]
- Transfer[]
- Expense[]
- MpesaTransaction[]
- ShiftPaymentSummary
- Discrepancy[]
- Report[]

---

# 8. API Design

## Endpoints

### Open Shift

```
POST /shifts/open
```

Creates a new active Shift.

---

### Close Shift

```
POST /shifts/:id/close
```

Closes an active Shift.

---

### Get Active Shift

```
GET /shifts/active
```

Returns the active Shift.

---

### Get Shift

```
GET /shifts/:id
```

Returns a single Shift.

---

### Search Shifts

```
GET /shifts
```

Supports filtering by:

- User
- Branch
- Status
- Date Range

---

# 9. Workflow

```
Worker starts work
        │
        ▼
Open Shift
        │
        ▼
Operational ownership begins
        │
        ├── Stock Movements
        ├── Transfers
        ├── Expenses
        ├── Mpesa Transactions
        │
        ▼
Close Shift
        │
        ▼
Operational ownership ends
        │
        ▼
Reconciliation modules execute
```

---

# 10. Integration Points

The Shift module integrates with:

- Business Module
- Branch Module
- User Module
- Shift Stock Item Module
- Stock Movement Module
- Transfer Module
- Expense Module
- Mpesa Transaction Module
- Shift Payment Summary Module
- Discrepancy Module
- Reports Module

The Shift module is the operational ownership layer of the system. Every operational event is associated with exactly one Shift.

# 11. Business Rules

- Every Shift belongs to exactly one Business.
- Every Shift belongs to exactly one Branch.
- Every Shift belongs to exactly one User.
- A User can have only one active Shift at a time.
- A Branch may have multiple active Shifts if multiple workers are operating simultaneously.
- Every operational event must belong to an active Shift.
- A Shift must be opened before operational activities begin.
- A Shift must be closed before reconciliation begins.
- Closed Shifts are immutable.
- Operational ownership begins when a Shift opens and ends when it closes.

---

# 12. Implementation Order

1. Create Shift Prisma model.
2. Add Business, Branch, and User relationships.
3. Generate migration.
4. Generate Shifts module.
5. Create DTOs.
6. Implement open Shift logic.
7. Implement close Shift logic.
8. Implement Shift validation.
9. Test Shift lifecycle.
10. Verify Shift ownership before implementing Shift Stock Items.

---

# 13. Validation Rules

## Shift Opening

Validate:

- Business exists.
- Branch exists.
- User exists.
- User has no active Shift.
- Branch is active.

## Shift Closing

Validate:

- Shift exists.
- Shift is active.
- Shift belongs to the requesting User (or Manager/Owner).
- Shift has not already been closed.

## Data Integrity

- Every Shift references existing Business, Branch, and User records.
- Only one active Shift exists per User.
- Closed Shifts cannot be modified.

---

# 14. Database Design

## Prisma Model

```prisma
model Shift {
  id String @id @default(cuid())

  businessId String
  business Business @relation(fields: [businessId], references: [id])

  branchId String
  branch Branch @relation(fields: [branchId], references: [id])

  userId String
  user User @relation(fields: [userId], references: [id])

  status ShiftStatus

  openedAt DateTime

  closedAt DateTime?

  notes String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Database Principles

- Shift is the operational ownership record.
- Operational modules reference Shift.
- Shifts are immutable after closing.
- Every operational event must be traceable to a Shift.

---

# 15. Testing Requirements

## Unit Tests

- Open Shift.
- Close Shift.
- Reject multiple active Shifts for the same User.
- Reject closing an already closed Shift.

## Integration Tests

- Shift belongs to Business.
- Shift belongs to Branch.
- Shift belongs to User.
- Operational modules can reference Shift.

## API Tests

Verify:

- POST /shifts/open
- POST /shifts/:id/close
- GET /shifts/active
- GET /shifts/:id
- GET /shifts

---

# 16. Out of Scope

The Shift module does not:

- Track inventory.
- Record stock movements.
- Execute transfers.
- Record expenses.
- Process Mpesa transactions.
- Calculate reconciliation.
- Detect discrepancies.
- Generate reports.

---

# 17. Possible Future Features

- Scheduled shifts.
- Shift handover workflow.
- Break tracking.
- Attendance integration.
- GPS verification.
- Shift templates.
- Multiple role assignments.
- Shift notes history.

---

# 18. Completion Criteria

The Shift module is complete when:

- Shift entity exists.
- Business, Branch, and User relationships are implemented.
- Shift opening works.
- Shift closing works.
- Validation rules are implemented.
- Tests pass.
- Operational modules can safely reference active and closed Shifts.

---

# 19. Summary

The Shift module establishes the operational ownership layer of the Bar Operations Reconciliation & Profit System.

It provides:

- Worker accountability.
- Operational ownership.
- Shift lifecycle management.
- The foundation for stock operations, transfers, expenses, Mpesa reconciliation, discrepancy detection, and reporting.
