# Business Module Architecture

> Defines the Business module — the ownership root of the entire system.

---
# 1. Purpose

The Business module defines the organization that owns and operates the system.

It establishes the ownership boundary for all operational data.

Every operational record in the system belongs to exactly one Business, making it the root entity from which all other modules derive ownership.

# 2. Module Responsibility

The Business module is responsible for:

- Creating businesses
- Managing business information
- Managing business-wide settings and configuration
- Providing the ownership root for all other modules

The Business module is **not responsible** for:

- Authentication
- Branch management
- User management
- Inventory management
- Shift operations
- Stock movements
- Transfers
- Expenses
- Mpesa operations
- Reconciliation
- Profit calculations
- Reporting

These responsibilities belong to their respective modules.

# 3. Module Dependencies

## Depends On

- Prisma
- Database

This module does not depend on any other business module.

## Used By

The Business module is the foundation for:

- Branch Module
- User Module
- Product Module
- Product Cost History Module
- Product Unit Module
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

# 4. Design Principles

The Business module follows these principles:

- Business is the ownership root of the system.
- Every operational record must belong to exactly one Business.
- Business contains ownership and configuration only.
- Business does not contain operational workflows.
- Business does not contain reconciliation logic.
- Business does not contain inventory logic.
- Business does not calculate financial values.
- Other modules reference Business instead of duplicating ownership.
- Business should remain lightweight and stable.

# 4. Design Principles

The Business module follows these principles:

- Business is the ownership root of the system.
- Every operational record must belong to exactly one Business.
- Business contains ownership and configuration only.
- Business does not contain operational workflows.
- Business does not contain reconciliation logic.
- Business does not contain inventory logic.
- Business does not calculate financial values.
- Other modules reference Business instead of duplicating ownership.
- Business should remain lightweight and stable.

# 5. Module Skeleton

```
Business
│
├── Business Information
│   ├── Name
│   ├── Phone
│   ├── Email
│   └── Status
│
├── Business Configuration
│   ├── Currency
│   ├── Timezone
│   └── Operational Settings
│
└── Ownership
    └── Parent of all business modules
```

# 6. File Structure

```
backend/
├── src/
│   └── businesses/
│       ├── businesses.module.ts
│       ├── businesses.controller.ts
│       ├── businesses.service.ts
│       │
│       ├── dto/
│       │   ├── create-business.dto.ts
│       │   └── update-business.dto.ts
│       │
│       └── entities/
│           └── business.entity.ts
│
└── prisma/
    └── schema.prisma
```

# 7. Entity Design

## Business

### Fields

- id
- name
- phone
- email
- currency
- timezone
- createdAt
- updatedAt

### Relationships

Business owns:

- Branch[]
- User[]
- Product[]
- ProductCostHistory[]
- ProductUnit[]
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

### Create Business

```
POST /businesses
```

Creates a new Business.

---

### Get All Businesses

```
GET /businesses
```

Returns all Businesses.

---

### Get Business

```
GET /businesses/:id
```

Returns a single Business.

---

### Update Business

```
PATCH /businesses/:id
```

Updates editable Business information.

---

### Delete Business

```
DELETE /businesses/:id
```

Removes (or soft deletes) a Business.


# 9. Workflow

```
Create Business
        │
        ▼
Business is stored
        │
        ▼
Business becomes the ownership root
        │
        ▼
Other modules reference the Business
        │
        ├── Branchs
        ├── Users
        ├── Products
        ├── Shifts
        ├── Inventory
        ├── Mpesa
        ├── Transfers
        ├── Expenses
        └── Reports
```

# 10. Integration Points

The Business module integrates with:

- Branch Module
- User Module
- Product Module
- Product Cost History Module
- Product Unit Module
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

Every integration uses the Business as the ownership boundary.

No operational module should exist without an associated Business.

# 11. Business Rules

- Every Business is uniquely identified by its `id`.
- Every Branch belongs to exactly one Business.
- Every User belongs to exactly one Business.
- Every Product belongs to exactly one Business.
- Every operational record must belong to exactly one Business.
- A Business cannot depend on any operational module to exist.
- Business ownership cannot change after related operational data has been created.
- The Business module acts only as the ownership root and configuration provider; it does not participate in operational workflows.


# 12. Implementation Order

The Business module is implemented first because it is the ownership foundation for the entire system.

Implementation steps:

1. Create Business Prisma model.
2. Add Business migration.
3. Generate Business module. //Not exist yet//
4. Create Business DTOs: //Not exist yet//
   - CreateBusinessDto
   - UpdateBusinessDto
5. Implement Business service.
6. Implement Business controller.
7. Add validation rules. //not exist yet//  
8. Test Business CRUD operations.
9. Verify Business module before implementing dependent modules.

After completion, other modules can reference Business as their ownership root.

# 13. Validation Rules

## Business Creation

Validate:

- Name is required.
- Required fields have valid formats.
- Currency is supported.
- Timezone is valid.

## Business Updates

Allowed:

- Update business information.
- Update configurable settings.

Restricted:

- Changing ownership relationships.
- Removing a Business with active operational data.

## Data Integrity

- Business ID must remain stable.
- All child records must reference an existing Business.
- Business deletion must respect dependent data constraints.

# 14. Database Design

## Prisma Model

```prisma
model Business {
  id String @id @default(cuid())

  name String

  phone String?
  email String?

  currency String @default("KES")
  timezone String @default("Africa/Nairobi")

  branches Branch[]
  users User[]
  products Product[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Database Principles

- Business is the root foreign key for operational isolation.
- Child modules reference Business using relations.
- Business records should not store calculated operational data.
- Historical operational records remain independent from business configuration changes.

# 15. Testing Requirements

The Business module should verify:

## Unit Tests

- Business service creates a Business.
- Business service updates Business information.
- Invalid data is rejected.

## Integration Tests

- Business can be stored in the database.
- Related modules can reference Business.
- Business relationships load correctly.

## API Tests

Verify:

- POST /businesses
- GET /businesses
- GET /businesses/:id
- PATCH /businesses/:id
- DELETE /businesses/:id

# 16. Out of Scope

The Business module does not:

- Authenticate users.
- Manage user permissions.
- Manage branches.
- Manage products.
- Track inventory.
- Process shifts.
- Handle Mpesa transactions.
- Calculate revenue.
- Calculate profit.
- Detect discrepancies.
- Generate reports.

These responsibilities belong to specialized modules.

# 17. Possible Future Features

Potential future additions:

- Business logo and branding.
- Business profile information.
- Subscription management.
- Billing information.
- Feature configuration.
- Multiple currency support.
- Notification preferences.
- Custom business operational rules.

# 18. Completion Criteria

The Business module is complete when:

- Business entity exists.
- Database migration succeeds.
- CRUD operations work.
- Validation is implemented.
- Tests pass.
- Dependent modules can reference Business successfully.

# 19. Summary

The Business module establishes the ownership foundation of the Bar Operations Reconciliation & Profit System.

It provides:

- Business identity.
- Data ownership boundaries.
- Configuration foundation.
- Parent relationship for all operational modules.

All future modules build on this foundation.
