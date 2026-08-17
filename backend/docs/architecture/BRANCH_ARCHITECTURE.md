# 1. Purpose

The Branch module defines a physical business location where daily operations occur.

A Branch is the operational boundary of the system.

Operational activities such as shifts, inventory, Mpesa transactions, expenses, transfers, and discrepancies occur within a Branch.

# 2. Module Responsibility

The Branch module is responsible for:

- Creating branches
- Managing branch information
- Managing branch operational settings
- Providing the operational boundary for all branch activities

The Branch module is **not responsible** for:

- Authentication
- User management
- Product management
- Inventory management
- Shift operations
- Stock movements
- Transfers
- Expenses
- Mpesa reconciliation
- Profit calculations
- Reporting

These responsibilities belong to their respective modules.

# 3. Module Dependencies

## Depends On

- Business Module
- Prisma
- Database

A Branch cannot exist without a Business.

## Used By

The Branch module is the foundation for:

- User Module
- Inventory Module
- Stock Location Module
- Shift Module
- Stock Movement Module
- Transfer Module
- Expense Module
- Mpesa Module
- Shift Payment Summary Module
- Discrepancy Module
- Reports Module

# 4. Design Principles

The Branch module follows these principles:

- Every Branch belongs to exactly one Business.
- A Branch is an operational boundary.
- Operational data is isolated per Branch.
- Branch stores configuration, not operational workflows.
- Branch does not calculate financial values.
- Other modules reference Branch instead of duplicating location ownership.
- Branch should remain lightweight and stable.

# 5. Module Skeleton

```
Branch
│
├── Branch Information
│   ├── Name
│   ├── Phone
│   ├── Address
│   └── Status
│
├── Operational Configuration
│   ├── Opening Hours
│   ├── Currency
│   └── Branch Settings
│
└── Operational Ownership
    ├── Users
    ├── Inventory
    ├── Shifts
    ├── Mpesa
    ├── Transfers
    ├── Expenses
    └── Reports
```

# 6. File Structure

```
backend/
├── src/
│   └── branches/
│       ├── branches.module.ts
│       ├── branches.controller.ts
│       ├── branches.service.ts
│       │
│       ├── dto/
│       │   ├── create-branch.dto.ts
│       │   └── update-branch.dto.ts
│       │
│       └── entities/
│           └── branch.entity.ts
│
└── prisma/
    └── schema.prisma
```

# 7. Entity Design

## Branch

### Fields

- id
- businessId
- name
- phone
- address
- createdAt
- updatedAt

### Relationships

Branch belongs to:

- Business

Branch owns:

- User[]
- StockLocation[]
- InventoryItem[]
- Shift[]
- StockMovement[]
- Transfer[]
- Expense[]
- MpesaAccount[]
- MpesaTransaction[]
- ShiftPaymentSummary[]
- Discrepancy[]
- Report[]

# 8. API Design

## Endpoints

### Create Branch

```
POST /branches
```

Creates a new Branch.

---

### Get All Branches

```
GET /branches
```

Returns all Branches.

---

### Get Branch

```
GET /branches/:id
```

Returns a single Branch.

---

### Update Branch

```
PATCH /branches/:id
```

Updates editable Branch information.

---

### Delete Branch

```
DELETE /branches/:id
```

Removes (or soft deletes) a Branch.

# 9. Workflow

```
Business exists
        │
        ▼
Create Branch
        │
        ▼
Branch is stored
        │
        ▼
Branch becomes an operational boundary
        │
        ├── Users
        ├── Stock Locations
        ├── Inventory
        ├── Shifts
        ├── Mpesa
        ├── Expenses
        ├── Transfers
        └── Reports
```

# 10. Integration Points

The Branch module integrates with:

- Business Module
- User Module
- Stock Location Module
- Inventory Module
- Shift Module
- Stock Movement Module
- Transfer Module
- Expense Module
- Mpesa Module
- Shift Payment Summary Module
- Discrepancy Module
- Reports Module

Every operational activity occurs within a Branch.

# 11. Business Rules

- Every Branch belongs to exactly one Business.
- A Business may own multiple Branches.
- Every operational record belongs to exactly one Branch.
- Branch ownership cannot change after operational data has been created.
- Branch defines the operational boundary of the system.

# 12. Implementation Order

1. Create Branch Prisma model.
2. Add Business → Branch relationship.
3. Generate Branch migration.
4. Generate Branch module.
5. Create DTOs.
6. Implement service.
7. Implement controller.
8. Add validation rules.
9. Test CRUD operations.
10. Verify Branch module before implementing Users.

# 13. Validation Rules

## Branch Creation

Validate:

- Business exists.
- Name is required.
- Required fields have valid formats.

## Branch Updates

Allowed:

- Update branch information.
- Update branch settings.

Restricted:

- Changing Business ownership.
- Removing a Branch with active operational data.

## Data Integrity

- Every Branch references an existing Business.
- Branch ID remains stable.
- Operational modules reference existing Branches only.

# 14. Database Design

## Prisma Model

```prisma
model Branch {
  id         String   @id @default(cuid())
  businessId String

  business Business @relation(fields: [businessId], references: [id])

  name    String
  phone   String?
  address String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Database Principles

- Branch is the operational foreign key.
- Operational modules reference Branch.
- Branch stores configuration, not operational data.

# 15. Testing Requirements

## Unit Tests

- Create Branch.
- Update Branch.
- Reject invalid Business references.

## Integration Tests

- Branch belongs to Business.
- Relationships load correctly.

## API Tests

Verify:

- POST /branches
- GET /branches
- GET /branches/:id
- PATCH /branches/:id
- DELETE /branches/:id

# 16. Out of Scope

The Branch module does not:

- Authenticate users.
- Manage products.
- Manage inventory.
- Execute shifts.
- Process transfers.
- Process expenses.
- Handle Mpesa reconciliation.
- Calculate profit.
- Detect discrepancies.
- Generate reports.

# 17. Possible Future Features

- Branch manager assignment.
- Branch operating hours.
- Branch contact information.
- Branch status (Active/Inactive).
- Branch-specific operational settings.
- Geolocation.
- Regional configuration.

# 18. Completion Criteria

The Branch module is complete when:

- Branch entity exists.
- Business relationship is implemented.
- CRUD operations work.
- Validation is implemented.
- Tests pass.
- Other operational modules can reference Branch.

# 19. Summary

The Branch module establishes the operational boundary of the Bar Operations Reconciliation & Profit System.

It provides:

- Business location.
- Operational ownership.
- Branch isolation.
- Parent relationship for all operational modules within a Business.

