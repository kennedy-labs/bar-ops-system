# 1. Purpose

The Stock Movement module records every inventory change that occurs within the system.

It is the permanent operational history of inventory and the single source of truth from which inventory can always be reconstructed.

---

# 2. Module Responsibility

The Stock Movement module is responsible for:

- Recording inventory events
- Maintaining immutable inventory history
- Updating Inventory Items
- Providing complete inventory traceability
- Supporting inventory reconstruction

The Stock Movement module is **not responsible** for:

- Product information
- Product units
- Inventory state
- Shift reconciliation
- Profit calculations
- Reporting

These responsibilities belong to their respective modules.

---

# 3. Module Dependencies

## Depends On

- Business Module
- Branch Module
- User Module
- Product Module
- Product Unit Module
- Stock Location Module
- Inventory Item Module
- Prisma
- Database

A Stock Movement cannot exist without an Inventory Item.

## Used By

The Stock Movement module is used by:

- Inventory Module
- Shift Module
- Transfer Module
- Expense Module
- Discrepancy Module
- Reports Module

Every inventory change originates from a Stock Movement.

---

# 4. Design Principles

The Stock Movement module follows these principles:

- Every inventory change creates a Stock Movement.
- Stock Movements are immutable.
- Inventory is derived from Stock Movements.
- Inventory Items represent current state only.
- Operational history is never modified.
- Every Stock Movement is attributable to a User.
- Every Stock Movement has a business reason.

---

# 5. Module Skeleton

```
Stock Movement
│
├── Movement Information
│   ├── Type
│   ├── Quantity
│   ├── Direction
│   ├── Reason
│   └── Timestamp
│
├── Ownership
│   ├── Business
│   ├── Branch
│   ├── User
│   ├── Product
│   ├── Product Unit
│   ├── Inventory Item
│   └── Stock Location
│
└── Operational References
    ├── Shift
    ├── Transfer
    ├── Expense
    ├── Discrepancy
    └── Reports
```

---

# 6. File Structure

```
backend/
├── src/
│   └── stock-movements/
│       ├── stock-movements.module.ts
│       ├── stock-movements.controller.ts
│       ├── stock-movements.service.ts
│       │
│       ├── dto/
│       │   ├── create-stock-movement.dto.ts
│       │   └── update-stock-movement.dto.ts
│       │
│       └── entities/
│           └── stock-movement.entity.ts
│
└── prisma/
    └── schema.prisma
```

---

# 7. Entity Design

## Stock Movement

### Fields

- id
- businessId
- branchId
- inventoryItemId
- productId
- productUnitId
- stockLocationId
- userId
- shiftId
- type
- direction
- quantity
- reason
- referenceId
- createdAt

### Relationships

Stock Movement belongs to:

- Business
- Branch
- User
- Product
- Product Unit
- Inventory Item
- Stock Location
- Shift (optional)

Referenced by:

- Transfer
- Expense
- Discrepancy
- Reports

---

# 8. API Design

## Endpoints

### Create Stock Movement

```
POST /stock-movements
```

Creates a Stock Movement.

---

### Get All Stock Movements

```
GET /stock-movements
```

Returns Stock Movements.

---

### Get Stock Movement

```
GET /stock-movements/:id
```

Returns a single Stock Movement.

---

### Search Stock Movements

```
GET /stock-movements/search
```

Supports filtering by:

- Product
- Branch
- Shift
- User
- Type
- Date Range

---

### Delete Stock Movement

```
DELETE /stock-movements/:id
```

Not supported.

Stock Movements are immutable.

---

# 9. Workflow

```
Operational Event Occurs
        │
        ▼
Validate Request
        │
        ▼
Create Stock Movement
        │
        ▼
Update Inventory Item
        │
        ▼
Inventory State Changes
        │
        ▼
Operational History Preserved
        │
        ├── Shift
        ├── Transfer
        ├── Reports
        └── Reconciliation
```

---

# 10. Integration Points

The Stock Movement module integrates with:

- Business Module
- Branch Module
- User Module
- Product Module
- Product Unit Module
- Stock Location Module
- Inventory Item Module
- Shift Module
- Transfer Module
- Expense Module
- Discrepancy Module
- Reports Module

The Stock Movement module is the operational backbone of the inventory system. Every inventory change is recorded here before the Inventory Item is updated.

# 11. Business Rules

- Every Stock Movement belongs to exactly one Business.
- Every Stock Movement belongs to exactly one Branch.
- Every Stock Movement belongs to exactly one Inventory Item.
- Every Stock Movement belongs to exactly one Product.
- Every Stock Movement belongs to exactly one Product Unit.
- Every Stock Movement belongs to exactly one Stock Location.
- Every Stock Movement is performed by exactly one User.
- Every Stock Movement has one Movement Type.
- Every Stock Movement has one inventory Direction (IN or OUT).
- Stock Movements are immutable.
- Stock Movements cannot be updated or deleted.
- Every inventory quantity change must originate from a Stock Movement.
- Inventory Items must be updated immediately after a Stock Movement is successfully recorded.

---

# 12. Implementation Order

1. Create Stock Movement Prisma model.
2. Add relationships to Business, Branch, User, Product, Product Unit, Inventory Item, and Stock Location.
3. Generate migration.
4. Generate Stock Movements module.
5. Create DTOs.
6. Implement service.
7. Implement controller.
8. Implement Inventory update logic.
9. Add validation rules.
10. Test Stock Movement creation.
11. Verify Inventory synchronization.
12. Verify immutable history before implementing Shift.

---

# 13. Validation Rules

## Stock Movement Creation

Validate:

- Business exists.
- Branch exists.
- User exists.
- Inventory Item exists.
- Product exists.
- Product Unit exists.
- Stock Location exists.
- Movement Type is valid.
- Direction is valid.
- Quantity is greater than zero.
- OUT movements cannot reduce inventory below zero.

## Stock Movement Updates

Not allowed.

Stock Movements are immutable.

## Data Integrity

- Every Stock Movement references existing records.
- Inventory update succeeds within the same transaction.
- Inventory cannot become negative.
- Every inventory change has exactly one Stock Movement.

---

# 14. Database Design

## Prisma Model

```prisma
model StockMovement {
  id String @id @default(cuid())

  businessId String
  business Business @relation(fields: [businessId], references: [id])

  branchId String
  branch Branch @relation(fields: [branchId], references: [id])

  inventoryItemId String
  inventoryItem InventoryItem @relation(fields: [inventoryItemId], references: [id])

  productId String
  product Product @relation(fields: [productId], references: [id])

  productUnitId String
  productUnit ProductUnit @relation(fields: [productUnitId], references: [id])

  stockLocationId String
  stockLocation StockLocation @relation(fields: [stockLocationId], references: [id])

  userId String
  user User @relation(fields: [userId], references: [id])

  shiftId String?
  shift Shift? @relation(fields: [shiftId], references: [id])

  type StockMovementType

  direction MovementDirection

  quantity Decimal

  reason String?

  referenceId String?

  createdAt DateTime @default(now())
}
```

## Database Principles

- Stock Movement is the source of inventory history.
- Stock Movements are append-only.
- Inventory state is derived from Stock Movements.
- Operational history is never modified.

---

# 15. Testing Requirements

## Unit Tests

- Create Stock Movement.
- Reject invalid relationships.
- Reject invalid movement types.
- Reject negative inventory.
- Verify Inventory update.

## Integration Tests

- Stock Movement belongs to all parent entities.
- Inventory updates correctly.
- Database transaction succeeds atomically.

## API Tests

Verify:

- POST /stock-movements
- GET /stock-movements
- GET /stock-movements/:id
- GET /stock-movements/search

---

# 16. Out of Scope

The Stock Movement module does not:

- Store Product information.
- Store inventory state.
- Manage Product Costs.
- Calculate profit.
- Generate reports.
- Manage Transfers.
- Reconcile Shifts.

---

# 17. Possible Future Features

- Batch Stock Movements.
- Reversal Movements.
- Approval workflow.
- Movement attachments.
- Barcode scanning.
- Offline synchronization.
- Inventory snapshots.
- Audit exports.

---

# 18. Completion Criteria

The Stock Movement module is complete when:

- Stock Movement entity exists.
- All relationships are implemented.
- Inventory updates automatically.
- Validation rules are implemented.
- Transactions are atomic.
- Tests pass.
- Inventory can be fully reconstructed from Stock Movements.

---

# 19. Summary

The Stock Movement module establishes the immutable inventory history of the Bar Operations Reconciliation & Profit System.

It provides:

- Complete inventory history.
- Immutable operational events.
- Automatic inventory updates.
- Full inventory traceability.
- The foundation for transfers, shifts, reconciliation, discrepancy detection, and inventory auditing.
