# 1. Purpose

The Product module defines the items the business buys, stores, transfers, and sells.

A Product represents a sellable inventory item and serves as the foundation for inventory tracking, stock movements, transfers, sales, and profit calculation.

---

# 2. Module Responsibility

The Product module is responsible for:

- Creating products
- Managing product information
- Managing selling prices
- Managing product availability
- Providing the product identity used throughout the system

The Product module is **not responsible** for:

- Product cost history
- Product units
- Inventory quantities
- Stock movements
- Shift calculations
- Transfers
- Expenses
- Profit calculations

These responsibilities belong to their respective modules.

---

# 3. Module Dependencies

## Depends On

- Business Module
- Prisma
- Database

A Product cannot exist without a Business.

## Used By

The Product module is used by:

- Product Unit Module
- Product Cost History Module
- Inventory Module
- Stock Movement Module
- Shift Module
- Transfer Module
- Expense Module
- Reports Module

Every inventory operation

# 6. File Structure

```
backend/
├── src/
│   └── products/
│       ├── products.module.ts
│       ├── products.controller.ts
│       ├── products.service.ts
│       │
│       ├── dto/
│       │   ├── create-product.dto.ts
│       │   └── update-product.dto.ts
│       │
│       └── entities/
│           └── product.entity.ts
│
└── prisma/
    └── schema.prisma
```

---

# 7. Entity Design

## Product

### Fields

- id
- businessId
- name
- sku
- barcode
- description
- status
- createdAt
- updatedAt

### Relationships

Product belongs to:

- Business

Product is referenced by:

- ProductUnit[]
- ProductCostHistory[]
- InventoryItem[]
- StockMovement[]
- ShiftStockItem[]
- TransferItem[]
- Report[]

---

# 8. API Design

## Endpoints

### Create Product

```
POST /products
```

Creates a new Product.

---

### Get All Products

```
GET /products
```

Returns all Products.

---

### Get Product

```
GET /products/:id
```

Returns a single Product.

---

### Update Product

```
PATCH /products/:id
```

Updates editable Product information.

---

### Delete Product

```
DELETE /products/:id
```

Removes (or soft deletes) a Product.

---

# 9. Workflow

```
Business exists
        │
        ▼
Create Product
        │
        ▼
Product is stored
        │
        ▼
Configure Product Units
        │
        ▼
Configure Cost History
        │
        ▼
Product becomes available for
        │
        ├── Inventory
        ├── Stock Movements
        ├── Shifts
        ├── Transfers
        └── Reports
```

---

# 10. Integration Points

The Product module integrates with:

- Business Module
- Product Unit Module
- Product Cost History Module
- Inventory Module
- Stock Movement Module
- Shift Module
- Transfer Module
- Reports Module

Every stock-related operation references a Product.

# 11. Business Rules

- Every Product belongs to exactly one Business.
- Product identity remains stable throughout its lifetime.
- A Product may have multiple Product Units.
- A Product may have multiple historical cost records.
- Products do not store inventory quantities.
- Products do not store stock locations.
- Products do not store historical costs directly.
- Operational modules reference Products instead of duplicating product information.
- Historical operational records must remain linked to the original Product.
- Products with historical operational records should not be physically deleted.

---

# 12. Implementation Order

1. Create Product Prisma model.
2. Add Business → Product relationship.
3. Generate Product migration.
4. Generate Products module.
5. Create DTOs.
6. Implement service.
7. Implement controller.
8. Add validation rules.
9. Test CRUD operations.
10. Verify Product module before implementing Product Units.

---

# 13. Validation Rules

## Product Creation

Validate:

- Business exists.
- Name is required.
- SKU is unique (if used).
- Barcode is unique (if used).

## Product Updates

Allowed:

- Update product information.
- Activate or deactivate Product.
- Update description.

Restricted:

- Changing Business ownership.
- Deleting Products with operational history.

## Data Integrity

- Every Product references an existing Business.
- Product ID remains stable.
- Operational modules reference existing Products only.

---

# 14. Database Design

## Prisma Model

```prisma
model Product {
  id String @id @default(cuid())

  businessId String
  business Business @relation(fields: [businessId], references: [id])

  name String

  sku String?
  barcode String?
  description String?

  status ProductStatus

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Database Principles

- Product is the inventory identity.
- Operational modules reference Product.
- Product stores descriptive information only.
- Quantity, location, and historical cost belong to dedicated modules.

---

# 15. Testing Requirements

## Unit Tests

- Create Product.
- Update Product.
- Reject invalid Business references.
- Reject duplicate SKU or Barcode (when provided).

## Integration Tests

- Product belongs to Business.
- Relationships load correctly.

## API Tests

Verify:

- POST /products
- GET /products
- GET /products/:id
- PATCH /products/:id
- DELETE /products/:id

---

# 16. Out of Scope

The Product module does not:

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

- Product images.
- Product categories.
- Brand information.
- Manufacturer details.
- Search keywords.
- Product tags.
- Product archival.
- Product import/export.

---

# 18. Completion Criteria

The Product module is complete when:

- Product entity exists.
- Business relationship is implemented.
- CRUD operations work.
- Validation is implemented.
- Tests pass.
- Product can be referenced by Product Units, Cost History, Inventory, and other operational modules.

---

# 19. Summary

The Product module establishes the inventory identity of the Bar Operations Reconciliation & Profit System.

It provides:

- Product identity.
- Product information.
- Business ownership.
- The foundation for inventory, costing, stock movement, and operational workflows.
