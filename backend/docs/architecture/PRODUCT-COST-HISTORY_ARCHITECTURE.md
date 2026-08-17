# 1. Purpose

The Product Cost History module records the purchase cost of a Product Unit over time.

It preserves historical cost changes so operational records and profit calculations always use the cost that was active when an event occurred.

---

# 2. Module Responsibility

The Product Cost History module is responsible for:

- Recording product cost changes
- Preserving historical cost records
- Providing historical cost for operational calculations
- Maintaining a chronological cost timeline

The Product Cost History module is **not responsible** for:

- Product information
- Product Units
- Inventory quantities
- Stock movements
- Shift operations
- Profit calculations
- Supplier management

These responsibilities belong to their respective modules.

---

# 3. Module Dependencies

## Depends On

- Business Module
- Product Module
- Product Unit Module
- Prisma
- Database

A Product Cost History record cannot exist without a Product and Product Unit.

## Used By

The Product Cost History module is used by:

- Inventory Module
- Stock Movement Module
- Shift Module
- Transfer Module
- Reports Module

Every profit-related operation retrieves historical cost from this module.

---

# 4. Design Principles

The Product Cost History module follows these principles:

- Every cost record belongs to one Product.
- Every cost record belongs to one Product Unit.
- Cost records are immutable.
- Cost changes create new records instead of updating existing ones.
- Historical operational records always reference the cost active at that time.
- Cost history exists independently from inventory.

---

# 5. Module Skeleton

```
Product Cost History
│
├── Cost Information
│   ├── Cost Price
│   ├── Effective Date
│   └── Status
│
├── Ownership
│   ├── Product
│   └── Product Unit
│
└── Operational References
    ├── Inventory
    ├── Stock Movements
    ├── Shifts
    ├── Transfers
    └── Reports
```

# 6. File Structure

```
backend/
├── src/
│   └── product-cost-history/
│       ├── product-cost-history.module.ts
│       ├── product-cost-history.controller.ts
│       ├── product-cost-history.service.ts
│       │
│       ├── dto/
│       │   ├── create-product-cost-history.dto.ts
│       │   └── update-product-cost-history.dto.ts
│       │
│       └── entities/
│           └── product-cost-history.entity.ts
│
└── prisma/
    └── schema.prisma
```

---

# 7. Entity Design

## Product Cost History

### Fields

- id
- businessId
- productId
- productUnitId
- costPrice
- effectiveFrom
- effectiveTo
- createdByUserId
- createdAt

### Relationships

Product Cost History belongs to:

- Business
- Product
- Product Unit
- User (createdBy)

Referenced by:

- Shift Stock Item[]
- Stock Movement[]
- Reports[]

---

# 8. API Design

## Endpoints

### Create Cost Record

```
POST /product-cost-history
```

Creates a new Product Cost record.

---

### Get Cost History

```
GET /product-cost-history
```

Returns historical cost records.

---

### Get Cost Record

```
GET /product-cost-history/:id
```

Returns a single cost record.

---

### Update Cost Record

```
PATCH /product-cost-history/:id
```

Only allowed before activation (if supported).

---

### Delete Cost Record

```
DELETE /product-cost-history/:id
```

Removes an unused cost record only.

---

# 9. Workflow

```
Product exists
        │
        ▼
Product Unit exists
        │
        ▼
Record Cost Price
        │
        ▼
Cost becomes effective
        │
        ▼
Operational modules retrieve
the active historical cost
        │
        ├── Inventory
        ├── Stock Movements
        ├── Shifts
        ├── Transfers
        └── Reports
```

---

# 10. Integration Points

The Product Cost History module integrates with:

- Business Module
- Product Module
- Product Unit Module
- Inventory Module
- Stock Movement Module
- Shift Module
- Transfer Module
- Reports Module

Every profit calculation should obtain historical cost from this module.

---

# 11. Business Rules

- Every cost record belongs to exactly one Business.
- Every cost record belongs to exactly one Product.
- Every cost record belongs to exactly one Product Unit.
- Cost history is immutable after becoming effective.
- Cost changes create new records instead of modifying existing ones.
- Only one active cost record may exist for a Product Unit at a given time.
- Historical operations always use the cost active at the event time.
- Cost history should never be physically deleted after use.

---

# 12. Implementation Order

1. Create Product Cost History Prisma model.
2. Add Product → Product Cost History relationship.
3. Add Product Unit → Product Cost History relationship.
4. Add User → Product Cost History relationship.
5. Generate migration.
6. Generate Product Cost History module.
7. Create DTOs.
8. Implement service.
9. Implement controller.
10. Add validation rules.
11. Test CRUD operations.
12. Verify historical cost retrieval before implementing Inventory.

# 13. Validation Rules

## Cost Record Creation

Validate:

- Business exists.
- Product exists.
- Product Unit exists.
- User exists.
- Cost price is greater than zero.
- Effective date is valid.
- No overlapping active cost period exists for the same Product Unit.

## Cost Record Updates

Allowed:

- Update a record only before it becomes effective (if supported).

Restricted:

- Changing Product ownership.
- Changing Product Unit ownership.
- Editing historical cost records.
- Editing cost records already used by operational events.

## Data Integrity

- Every Product Cost History record references an existing Business.
- Every record references an existing Product.
- Every record references an existing Product Unit.
- Every record references the User who created it.
- Historical cost records remain immutable after activation.

---

# 14. Database Design

## Prisma Model

```prisma
model ProductCostHistory {
  id String @id @default(cuid())

  businessId String
  business Business @relation(fields: [businessId], references: [id])

  productId String
  product Product @relation(fields: [productId], references: [id])

  productUnitId String
  productUnit ProductUnit @relation(fields: [productUnitId], references: [id])

  createdByUserId String
  createdBy User @relation(fields: [createdByUserId], references: [id])

  costPrice Decimal

  effectiveFrom DateTime
  effectiveTo DateTime?

  createdAt DateTime @default(now())
}
```

## Database Principles

- Cost history is append-only.
- Historical records are immutable.
- Operational modules reference historical costs instead of storing editable values.
- Only one active cost record should exist per Product Unit at any given time.

---

# 15. Testing Requirements

## Unit Tests

- Create Product Cost History record.
- Reject invalid Business references.
- Reject invalid Product references.
- Reject invalid Product Unit references.
- Reject overlapping active cost periods.

## Integration Tests

- Cost record belongs to Business.
- Cost record belongs to Product.
- Cost record belongs to Product Unit.
- Historical cost retrieval returns the correct active record.

## API Tests

Verify:

- POST /product-cost-history
- GET /product-cost-history
- GET /product-cost-history/:id
- PATCH /product-cost-history/:id
- DELETE /product-cost-history/:id

---

# 16. Out of Scope

The Product Cost History module does not:

- Store inventory quantities.
- Store stock locations.
- Execute stock movements.
- Manage suppliers.
- Calculate profit.
- Reconcile inventory.
- Generate reports.

---

# 17. Possible Future Features

- Supplier-specific costs.
- Bulk cost imports.
- Scheduled future cost changes.
- Cost approval workflow.
- Purchase invoice references.
- Reason for cost changes.
- Currency support.

---

# 18. Completion Criteria

The Product Cost History module is complete when:

- Product Cost History entity exists.
- Business, Product, Product Unit, and User relationships are implemented.
- CRUD operations work.
- Validation is implemented.
- Tests pass.
- Historical cost retrieval works correctly.
- Other operational modules can retrieve historical costs.

---

# 19. Summary

The Product Cost History module establishes the historical costing foundation of the Bar Operations Reconciliation & Profit System.

It provides:

- Historical cost records.
- Immutable cost history.
- Accurate historical pricing.
- The foundation for inventory valuation, stock costing, and profit calculations.