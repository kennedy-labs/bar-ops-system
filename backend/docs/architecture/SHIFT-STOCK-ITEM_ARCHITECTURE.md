# 1. Purpose

The Shift Stock Item module captures the inventory state of each Product Unit for a specific Shift.

It records opening stock, stock received during the shift, closing stock, and the calculated quantities sold. It forms the foundation for shift reconciliation and gross profit calculation.

---

# 2. Module Responsibility

The Shift Stock Item module is responsible for:

- Recording opening stock
- Recording stock additions during a Shift
- Recording closing stock
- Calculating quantity sold
- Providing shift-level inventory reconciliation

The Shift Stock Item module is **not responsible** for:

- Product management
- Inventory management
- Recording Stock Movements
- Product cost history
- Expense calculations
- Profit reporting

These responsibilities belong to their respective modules.

---

# 3. Module Dependencies

## Depends On

- Business Module
- Branch Module
- Shift Module
- Product Module
- Product Unit Module
- Inventory Item Module
- Prisma
- Database

A Shift Stock Item cannot exist without a Shift.

## Used By

The Shift Stock Item module is used by:

- Shift Payment Summary Module
- Discrepancy Module
- Reports Module

Shift reconciliation depends on Shift Stock Items.

---

# 4. Design Principles

The Shift Stock Item module follows these principles:

- Every Shift Stock Item belongs to one Shift.
- Every Product Unit appears only once per Shift.
- Opening stock is captured when the Shift begins.
- Closing stock is captured when the Shift ends.
- Quantity sold is system calculated.
- Shift Stock Items become immutable after Shift closure.

---

# 5. Module Skeleton

```
Shift Stock Item
│
├── Stock Information
│   ├── Opening Quantity
│   ├── Added Quantity
│   ├── Closing Quantity
│   ├── Sold Quantity
│   ├── Revenue
│   ├── Cost
│   └── Gross Profit
│
├── Ownership
│   ├── Business
│   ├── Branch
│   ├── Shift
│   ├── Product
│   └── Product Unit
│
└── Operational References
    ├── Inventory
    ├── Stock Movements
    ├── Shift Payment Summary
    ├── Discrepancies
    └── Reports
```

---

# 6. File Structure

```
backend/
├── src/
│   └── shift-stock-items/
│       ├── shift-stock-items.module.ts
│       ├── shift-stock-items.controller.ts
│       ├── shift-stock-items.service.ts
│       │
│       ├── dto/
│       │   ├── create-shift-stock-item.dto.ts
│       │   └── update-shift-stock-item.dto.ts
│       │
│       └── entities/
│           └── shift-stock-item.entity.ts
│
└── prisma/
    └── schema.prisma
```

---

# 7. Entity Design

## Shift Stock Item

### Fields

- id
- businessId
- branchId
- shiftId
- productId
- productUnitId
- openingQuantity
- addedQuantity
- closingQuantity
- soldQuantity
- revenue
- cost
- grossProfit
- createdAt
- updatedAt

### Relationships

Shift Stock Item belongs to:

- Business
- Branch
- Shift
- Product
- Product Unit

Referenced by:

- ShiftPaymentSummary
- Discrepancy
- Reports

---

# 8. API Design

## Endpoints

### Create Shift Stock Item

```
POST /shift-stock-items
```

Creates a Shift Stock Item.

---

### Get Shift Stock Items

```
GET /shift-stock-items
```

Returns Shift Stock Items.

---

### Get Shift Stock Item

```
GET /shift-stock-items/:id
```

Returns a single Shift Stock Item.

---

### Update Closing Stock

```
PATCH /shift-stock-items/:id
```

Updates closing quantity before the Shift is closed.

---

### Get Shift Stock Summary

```
GET /shift-stock-items/shift/:shiftId
```

Returns all Shift Stock Items for a Shift.

---

# 9. Workflow

```
Open Shift
      │
      ▼
Capture Opening Stock
      │
      ▼
Record Stock Additions
      │
      ▼
Capture Closing Stock
      │
      ▼
System Calculates
      │
      ├── Sold Quantity
      ├── Revenue
      ├── Cost
      └── Gross Profit
      │
      ▼
Shift Reconciliation
```

---

# 10. Integration Points

The Shift Stock Item module integrates with:

- Business Module
- Branch Module
- Shift Module
- Product Module
- Product Unit Module
- Inventory Item Module
- Stock Movement Module
- Product Cost History Module
- Shift Payment Summary Module
- Discrepancy Module
- Reports Module

The Shift Stock Item module is the operational reconciliation layer between live inventory and financial reconciliation.

# 11. Business Rules

- Every Shift Stock Item belongs to exactly one Business.
- Every Shift Stock Item belongs to exactly one Branch.
- Every Shift Stock Item belongs to exactly one Shift.
- Every Shift Stock Item belongs to exactly one Product.
- Every Shift Stock Item belongs to exactly one Product Unit.
- A Product Unit can appear only once within the same Shift.
- Opening Quantity is captured when the Shift opens.
- Added Quantity is accumulated from Stock Movements during the Shift.
- Closing Quantity is entered when the Shift closes.
- Sold Quantity is calculated by the system.

```
Sold Quantity =
Opening Quantity
+ Added Quantity
− Closing Quantity
```

- Revenue is calculated by the system.
- Cost is calculated using the historical Product Cost active during the sale.
- Gross Profit is calculated by the system.
- Shift Stock Items become immutable after the Shift is closed.

---

# 12. Implementation Order

1. Create Shift Stock Item Prisma model.
2. Add relationships to Business, Branch, Shift, Product, and Product Unit.
3. Generate migration.
4. Generate Shift Stock Items module.
5. Create DTOs.
6. Implement service.
7. Implement controller.
8. Implement automatic calculations.
9. Add validation rules.
10. Test Shift Stock calculations.
11. Verify reconciliation before implementing Shift Payment Summary.

---

# 13. Validation Rules

## Shift Stock Item Creation

Validate:

- Business exists.
- Branch exists.
- Shift exists.
- Product exists.
- Product Unit exists.
- Product Unit has not already been added to the Shift.
- Opening Quantity is greater than or equal to zero.

## Shift Stock Updates

Allowed:

- Update Closing Quantity while Shift is active.

Restricted:

- Editing Opening Quantity after Shift starts.
- Editing records after Shift closes.
- Editing calculated fields.

## Data Integrity

- Every Shift Stock Item references existing Business, Branch, Shift, Product, and Product Unit records.
- Sold Quantity cannot be negative.
- Revenue, Cost, and Gross Profit are system-calculated only.

---

# 14. Database Design

## Prisma Model

```prisma
model ShiftStockItem {
  id String @id @default(cuid())

  businessId String
  business Business @relation(fields: [businessId], references: [id])

  branchId String
  branch Branch @relation(fields: [branchId], references: [id])

  shiftId String
  shift Shift @relation(fields: [shiftId], references: [id])

  productId String
  product Product @relation(fields: [productId], references: [id])

  productUnitId String
  productUnit ProductUnit @relation(fields: [productUnitId], references: [id])

  openingQuantity Decimal

  addedQuantity Decimal @default(0)

  closingQuantity Decimal?

  soldQuantity Decimal

  revenue Decimal

  cost Decimal

  grossProfit Decimal

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([shiftId, productUnitId])
}
```

## Database Principles

- Shift Stock Item represents inventory for one Product Unit within one Shift.
- Financial values are snapshots calculated during reconciliation.
- Historical Shift data is immutable.
- One Product Unit appears only once per Shift.

---

# 15. Testing Requirements

## Unit Tests

- Create Shift Stock Item.
- Calculate Sold Quantity.
- Calculate Revenue.
- Calculate Cost.
- Calculate Gross Profit.
- Reject duplicate Product Units within the same Shift.

## Integration Tests

- Shift Stock Item belongs to Business.
- Shift Stock Item belongs to Branch.
- Shift Stock Item belongs to Shift.
- Shift Stock Item belongs to Product.
- Shift Stock Item belongs to Product Unit.
- Product Cost History integrates correctly.

## API Tests

Verify:

- POST /shift-stock-items
- GET /shift-stock-items
- GET /shift-stock-items/:id
- PATCH /shift-stock-items/:id
- GET /shift-stock-items/shift/:shiftId

---

# 16. Out of Scope

The Shift Stock Item module does not:

- Manage inventory.
- Record Stock Movements.
- Process payments.
- Detect discrepancies.
- Record expenses.
- Generate reports.

---

# 17. Possible Future Features

- Partial stock counting.
- Blind stock counting.
- Variance analysis.
- Expected vs Actual comparison.
- Batch counting.
- Barcode-assisted counting.
- Mobile counting workflow.

---

# 18. Completion Criteria

The Shift Stock Item module is complete when:

- Shift Stock Item entity exists.
- Relationships are implemented.
- Automatic calculations work.
- Validation rules are implemented.
- Tests pass.
- Shift reconciliation correctly calculates sales and gross profit.

---

# 19. Summary

The Shift Stock Item module establishes the inventory reconciliation layer of the Bar Operations Reconciliation & Profit System.

It provides:

- Opening inventory.
- Closing inventory.
- Quantity sold calculations.
- Revenue calculations.
- Historical cost application.
- Gross profit calculations.
- The foundation for Shift reconciliation and financial accountability.

