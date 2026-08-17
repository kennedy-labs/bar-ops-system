# 1. Purpose

The Product Unit module defines the measurable units in which a Product is purchased, stocked, transferred, and sold.

It standardizes how products are represented throughout the system and enables a single Product to exist in multiple unit variations.

---

# 2. Module Responsibility

The Product Unit module is responsible for:

- Defining units for Products
- Managing unit information
- Identifying the operational unit used by inventory and stock movements
- Providing unit identity for operational modules

The Product Unit module is **not responsible** for:

- Product information
- Product pricing
- Product cost history
- Inventory quantities
- Stock movements
- Transfers
- Profit calculations

These responsibilities belong to their respective modules.

---

# 3. Module Dependencies

## Depends On

- Product Module
- Business Module
- Prisma
- Database

A Product Unit cannot exist without a Product.

## Used By

The Product Unit module is used by:

- Product Cost History Module
- Inventory Module
- Stock Movement Module
- Shift Module
- Transfer Module
- Reports Module

Every inventory operation references a Product Unit.

---

# 4. Design Principles

The Product Unit module follows these principles:

- Every Product Unit belongs to one Product.
- A Product may have multiple units.
- Product Units describe measurement, not inventory.
- Units remain stable throughout operational history.
- Operational modules reference Product Units instead of storing measurement information.
- Product Units do not store quantities or costs.

---

# 5. Module Skeleton

```
Product Unit
│
├── Unit Information
│   ├── Name
│   ├── Symbol
│   ├── Quantity
│   └── Status
│
├── Ownership
│   └── Product
│
└── Operational References
    ├── Product Cost History
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
│   └── product-units/
│       ├── product-units.module.ts
│       ├── product-units.controller.ts
│       ├── product-units.service.ts
│       │
│       ├── dto/
│       │   ├── create-product-unit.dto.ts
│       │   └── update-product-unit.dto.ts
│       │
│       └── entities/
│           └── product-unit.entity.ts
│
└── prisma/
    └── schema.prisma
```

---

# 7. Entity Design

## Product Unit

### Fields

- id
- productId
- name
- symbol
- quantity
- isDefault
- status
- createdAt
- updatedAt

### Relationships

Product Unit belongs to:

- Product

Product Unit is referenced by:

- ProductCostHistory[]
- InventoryItem[]
- StockMovement[]
- ShiftStockItem[]
- TransferItem[]
- Report[]

---

# 8. API Design

## Endpoints

### Create Product Unit

```
POST /product-units
```

Creates a new Product Unit.

---

### Get All Product Units

```
GET /product-units
```

Returns all Product Units.

---

### Get Product Unit

```
GET /product-units/:id
```

Returns a single Product Unit.

---

### Update Product Unit

```
PATCH /product-units/:id
```

Updates editable Product Unit information.

---

### Delete Product Unit

```
DELETE /product-units/:id
```

Removes (or soft deletes) a Product Unit.

---

# 9. Workflow

```
Product exists
        │
        ▼
Create Product Unit
        │
        ▼
Assign Unit Information
        │
        ▼
(Optional) Set Default Unit
        │
        ▼
Product Unit becomes available for
        │
        ├── Product Cost History
        ├── Inventory
        ├── Stock Movements
        ├── Shifts
        ├── Transfers
        └── Reports
```

---

# 10. Integration Points

The Product Unit module integrates with:

- Product Module
- Product Cost History Module
- Inventory Module
- Stock Movement Module
- Shift Module
- Transfer Module
- Reports Module

Every inventory-related operation references a Product Unit.

# 11. Business Rules

- Every Product Unit belongs to exactly one Product.
- A Product may have multiple Product Units.
- A Product must have one default Product Unit.
- Product Unit identity remains stable throughout its lifetime.
- Product Units define measurement, not inventory.
- Product Units do not store quantities or costs.
- Historical operational records must remain linked to the original Product Unit.
- Product Units with operational history should not be physically deleted.

---

# 12. Implementation Order

1. Create Product Unit Prisma model.
2. Add Product → Product Unit relationship.
3. Generate Product Unit migration.
4. Generate Product Units module.
5. Create DTOs.
6. Implement service.
7. Implement controller.
8. Add validation rules.
9. Test CRUD operations.
10. Verify Product Unit module before implementing Product Cost History.

---

# 13. Validation Rules

## Product Unit Creation

Validate:

- Product exists.
- Name is required.
- Symbol is required.
- Quantity is greater than zero.
- Only one default Product Unit exists per Product.

## Product Unit Updates

Allowed:

- Update unit information.
- Change default unit.
- Activate or deactivate Product Unit.

Restricted:

- Changing Product ownership.
- Deleting Product Units with operational history.

## Data Integrity

- Every Product Unit references an existing Product.
- Product Unit ID remains stable.
- Operational modules reference existing Product Units only.

---

# 14. Database Design

## Prisma Model

```prisma
model ProductUnit {
  id String @id @default(cuid())

  productId String
  product Product @relation(fields: [productId], references: [id])

  name String
  symbol String

  quantity Decimal

  isDefault Boolean @default(false)

  status ProductUnitStatus

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Database Principles

- Product Unit is the measurement identity.
- Operational modules reference Product Unit.
- Product Unit stores measurement information only.
- Quantity on hand and costs belong to dedicated modules.

---

# 15. Testing Requirements

## Unit Tests

- Create Product Unit.
- Update Product Unit.
- Reject invalid Product references.
- Enforce one default Product Unit per Product.

## Integration Tests

- Product Unit belongs to Product.
- Relationships load correctly.

## API Tests

Verify:

- POST /product-units
- GET /product-units
- GET /product-units/:id
- PATCH /product-units/:id
- DELETE /product-units/:id

---

# 16. Out of Scope

The Product Unit module does not:

- Store inventory quantities.
- Store stock locations.
- Store historical costs.
- Execute stock movements.
- Perform transfers.
- Calculate profit.
- Reconcile inventory.
- Generate reports.

---

# 17. Possible Future Features

- Unit conversion rules.
- Packaging hierarchy (Bottle → Crate → Pallet).
- Barcode per unit.
- Display ordering.
- Unit-specific images.
- Unit archival.

---

# 18. Completion Criteria

The Product Unit module is complete when:

- Product Unit entity exists.
- Product relationship is implemented.
- CRUD operations work.
- Validation is implemented.
- Tests pass.
- Product Units can be referenced by Product Cost History, Inventory, Stock Movement, and other operational modules.

---

# 19. Summary

The Product Unit module establishes the measurement identity of Products within the Bar Operations Reconciliation & Profit System.

It provides:

- Product measurement.
- Unit identity.
- Product relationship.
- The foundation for costing, inventory, stock movement, and operational workflows.

