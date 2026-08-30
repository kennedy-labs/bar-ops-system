# 1. Purpose

The Inventory Item module represents the current quantity of a Product Unit at a specific Stock Location.

It provides the live inventory state used by operational modules while the complete inventory history is preserved by the Stock Movement module.

---

# 2. Module Responsibility

The Inventory Item module is responsible for:

- Maintaining current inventory balances
- Associating Products with Stock Locations
- Providing real-time stock availability
- Supporting inventory queries

The Inventory Item module is **not responsible** for:

- Product information
- Product units
- Historical cost
- Recording stock movements
- Shift reconciliation
- Profit calculations

These responsibilities belong to their respective modules.

---

# 3. Module Dependencies

## Depends On

- Business Module
- Branch Module
- Product Module
- Product Unit Module
- Stock Location Module
- Prisma
- Database

An Inventory Item cannot exist without a Product Unit and a Stock Location.

## Used By

The Inventory Item module is used by:

- Stock Movement Module
- Shift Module
- Transfer Module
- Reports Module

Every inventory operation reads or updates Inventory Items.

---

# 4. Design Principles

The Inventory Item module follows these principles:

- Every Inventory Item belongs to one Business.
- Every Inventory Item belongs to one Branch.
- Every Inventory Item represents one Product Unit at one Stock Location.
- Inventory represents the current state only.
- Inventory changes only through Stock Movements.
- Inventory history is never stored in this module.

---

# 5. Module Skeleton

```
Inventory Item
│
├── Inventory State
│   ├── Current Quantity
│   ├── Reserved Quantity
│   └── Available Quantity
│
├── Ownership
│   ├── Business
│   ├── Branch
│   ├── Product
│   ├── Product Unit
│   └── Stock Location
│
└── Operational References
    ├── Stock Movements
    ├── Shifts
    ├── Transfers
    └── Reports
```

---

# 6. File Structure

```
backend/
├── src/
│   └── inventory-items/
│       ├── inventory-items.module.ts
│       ├── inventory-items.controller.ts
│       ├── inventory-items.service.ts
│       │
│       ├── dto/
│       │   ├── create-inventory-item.dto.ts
│       │   └── update-inventory-item.dto.ts
│       │
│       └── entities/
│           └── inventory-item.entity.ts
│
└── prisma/
    └── schema.prisma
```

---

# 7. Entity Design

## Inventory Item

### Fields

- id
- businessId
- branchId
- productId
- productUnitId
- stockLocationId
- quantity
- reservedQuantity
- createdAt
- updatedAt

### Relationships

Inventory Item belongs to:

- Business
- Branch
- Product
- Product Unit
- Stock Location

Referenced by:

- StockMovement[]
- ShiftStockItem[]
- TransferItem[]
- Report[]

# 8. API Design

## Endpoints

### Create Inventory Item

```
POST /inventory-items
```

Creates an Inventory Item.

---

### Get All Inventory Items

```
GET /inventory-items
```

Returns all Inventory Items.

---

### Get Inventory Item

```
GET /inventory-items/:id
```

Returns a single Inventory Item.

---

### Update Inventory Item

```
PATCH /inventory-items/:id
```

Updates an Inventory Item.

> **Note:** Normal inventory quantity changes should occur through the Stock Movement module, not this endpoint.

---

### Delete Inventory Item

```
DELETE /inventory-items/:id
```

Removes (or soft deletes) an Inventory Item.

---

# 9. Workflow

```
Business exists
        │
        ▼
Branch exists
        │
        ▼
Stock Location exists
        │
        ▼
Product Unit exists
        │
        ▼
Create Inventory Item
        │
        ▼
Inventory available
        │
        ▼
Stock Movements update inventory
        │
        ▼
Operational modules consume inventory
        │
        ├── Shifts
        ├── Transfers
        ├── Reports
        └── Reconciliation
```

---

# 10. Integration Points

The Inventory Item module integrates with:

- Business Module
- Branch Module
- Product Module
- Product Unit Module
- Stock Location Module
- Stock Movement Module
- Shift Module
- Transfer Module
- Reports Module

Inventory Items provide the live stock state used throughout the system.

---

# 11. Business Rules

- Every Inventory Item belongs to exactly one Business.
- Every Inventory Item belongs to exactly one Branch.
- Every Inventory Item belongs to exactly one Product.
- Every Inventory Item belongs to exactly one Product Unit.
- Every Inventory Item belongs to exactly one Stock Location.
- A Product Unit can exist only once within the same Product and Stock Location.
- Inventory quantity cannot become negative.
- Inventory quantities are modified only by Stock Movements.
- Inventory represents the current stock state only.

---

# 12. Implementation Order

1. Create Inventory Item Prisma model.
2. Add relationships to Business, Branch, Product, Product Unit, and Stock Location.
3. Generate migration.
4. Generate Inventory Items module.
5. Create DTOs.
6. Implement service.
7. Implement controller.
8. Implement inventory adjustment logic.
9. Add validation rules.
10. Test CRUD operations.
11. Verify Inventory before implementing Stock Movements.

---

# 13. Validation Rules

## Inventory Item Creation

Validate:

- Business exists.
- Branch exists.
- Product exists.
- Product Unit exists.
- Stock Location exists.
- Inventory Item does not already exist for the same Product Unit and Stock Location.

## Inventory Updates

Allowed:

- Administrative inventory corrections.
- Reserved quantity updates.

Restricted:

- Manual stock additions.
- Manual stock deductions.
- Direct inventory edits that bypass Stock Movements.

## Data Integrity

- Every Inventory Item references existing Business, Branch, Product, Product Unit, and Stock Location records.
- Only one Inventory Item exists per Product, Product Unit, and Stock Location combination.
- Inventory quantity must never be negative.
- Inventory state must always be derivable from Stock Movements.

# 14. Database Design

## Prisma Model

```prisma
model InventoryItem {
  id String @id @default(cuid())

  businessId String
  business Business @relation(fields: [businessId], references: [id])

  branchId String
  branch Branch @relation(fields: [branchId], references: [id])

  productId String
  product Product @relation(fields: [productId], references: [id])

  productUnitId String
  productUnit ProductUnit @relation(fields: [productUnitId], references: [id])

  stockLocationId String
  stockLocation StockLocation @relation(fields: [stockLocationId], references: [id])

  quantity Decimal @default(0)

  reservedQuantity Decimal @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([productId, productUnitId, stockLocationId])
}
```

## Database Principles

- Inventory Item stores the current inventory state.
- Inventory history is stored in Stock Movements.
- Inventory quantities are derived through Stock Movement processing.
- One Inventory Item exists per Product Unit per Stock Location.

---

# 15. Testing Requirements

## Unit Tests

- Create Inventory Item.
- Update Inventory Item.
- Reject duplicate Product Unit + Stock Location combinations.
- Reject invalid Business, Branch, Product, Product Unit, and Stock Location references.

## Integration Tests

- Inventory Item belongs to Business.
- Inventory Item belongs to Branch.
- Inventory Item belongs to Product.
- Inventory Item belongs to Product Unit.
- Inventory Item belongs to Stock Location.
- Relationships load correctly.

## API Tests

Verify:

- POST /inventory-items
- GET /inventory-items
- GET /inventory-items/:id
- PATCH /inventory-items/:id
- DELETE /inventory-items/:id

---

# 16. Out of Scope

The Inventory Item module does not:

- Record stock movement history.
- Store product information.
- Store historical costs.
- Execute transfers.
- Perform shift reconciliation.
- Calculate profit.
- Generate reports.

---

# 17. Possible Future Features

- Inventory reservations.
- Batch/Lot tracking.
- Expiry dates.
- Minimum stock levels.
- Maximum stock levels.
- Automatic replenishment.
- Inventory snapshots.
- Cycle counting support.

---

# 18. Completion Criteria

The Inventory Item module is complete when:

- Inventory Item entity exists.
- All relationships are implemented.
- CRUD operations work.
- Validation rules are implemented.
- Tests pass.
- Inventory accurately represents the current stock state.
- Stock Movement module can update Inventory Items correctly.

---

# 19. Summary

The Inventory Item module establishes the live inventory state of the Bar Operations Reconciliation & Profit System.

It provides:

- Current inventory quantities.
- Product-to-location inventory mapping.
- Real-time stock availability.
- The foundation for stock movements, transfers, shift reconciliation, and inventory reporting.
