# 1. Purpose

The Stock Location module defines the physical locations where inventory is stored within a Business.

It provides the location identity used for inventory management, stock movements, transfers, and shift operations.

---

# 2. Module Responsibility

The Stock Location module is responsible for:

- Creating stock locations
- Managing stock location information
- Identifying where inventory is physically stored
- Providing location identity for inventory operations

The Stock Location module is **not responsible** for:

- Inventory quantities
- Product information
- Stock movements
- Transfers
- Shift calculations
- Profit calculations

These responsibilities belong to their respective modules.

---

# 3. Module Dependencies

## Depends On

- Business Module
- Branch Module
- Prisma
- Database

A Stock Location cannot exist without a Business.

## Used By

The Stock Location module is used by:

- Inventory Module
- Stock Movement Module
- Shift Module
- Transfer Module
- Reports Module

Every inventory operation references a Stock Location.

---

# 4. Design Principles

The Stock Location module follows these principles:

- Every Stock Location belongs to one Business.
- A Business may have multiple Stock Locations.
- Stock Locations represent physical storage areas.
- Stock Locations do not store inventory quantities.
- Operational modules reference Stock Locations instead of duplicating location information.
- Location identity remains stable throughout operational history.

---

# 5. Module Skeleton

```
Stock Location
│
├── Location Information
│   ├── Name
│   ├── Type
│   ├── Description
│   └── Status
│
├── Ownership
│   └── Business
│
└── Operational References
    ├── Inventory
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
│   └── stock-locations/
│       ├── stock-locations.module.ts
│       ├── stock-locations.controller.ts
│       ├── stock-locations.service.ts
│       │
│       ├── dto/
│       │   ├── create-stock-location.dto.ts
│       │   └── update-stock-location.dto.ts
│       │
│       └── entities/
│           └── stock-location.entity.ts
│
└── prisma/
    └── schema.prisma
```

---

# 7. Entity Design

## Stock Location

### Fields

- id
- businessId
- name
- type
- description
- status
- createdAt
- updatedAt

### Relationships

Stock Location belongs to:

- Business

Referenced by:

- InventoryItem[]
- StockMovement[]
- Transfer[]
- ShiftStockItem[]
- Report[]

# 8. API Design

## Endpoints

### Create Stock Location

```
POST /stock-locations
```

Creates a new Stock Location.

---

### Get All Stock Locations

```
GET /stock-locations
```

Returns all Stock Locations.

---

### Get Stock Location

```
GET /stock-locations/:id
```

Returns a single Stock Location.

---

### Update Stock Location

```
PATCH /stock-locations/:id
```

Updates editable Stock Location information.

---

### Delete Stock Location

```
DELETE /stock-locations/:id
```

Removes (or soft deletes) a Stock Location.

---

# 9. Workflow

```
Business exists
        │
        ▼
Create Stock Location
        │
        ▼
Location becomes available
        │
        ▼
Inventory is assigned
        │
        ▼
Operational modules use the location
        │
        ├── Inventory
        ├── Stock Movements
        ├── Shifts
        ├── Transfers
        └── Reports
```

---

# 10. Integration Points

The Stock Location module integrates with:

- Business Module
- Branch Module
- Inventory Module
- Stock Movement Module
- Shift Module
- Transfer Module
- Reports Module

Every inventory-related operation references a Stock Location.

---

# 11. Business Rules

- Every Stock Location belongs to exactly one Business.
- A Business may contain multiple Stock Locations.
- Stock Locations represent physical storage areas only.
- Stock Locations do not store inventory quantities.
- Historical operational records remain linked to the original Stock Location.
- Stock Locations with operational history should not be physically deleted.

---

# 12. Implementation Order

1. Create Stock Location Prisma model.
2. Add Business → Stock Location relationship.
3. Generate migration.
5. Generate Stock Location module.
6. Create DTOs.
7. Implement service.
8. Implement controller.
9. Add validation rules.
10. Test CRUD operations.
11. Verify Stock Location module before implementing Inventory.

---

# 13. Validation Rules

## Stock Location Creation

Validate:

- Business exists.
- Name is required.
- Type is valid.

## Stock Location Updates

Allowed:

- Update location information.
- Activate or deactivate Stock Location.

Restricted:

- Changing Business ownership.
- Deleting Stock Locations with operational history.

## Data Integrity

- Every Stock Location references an existing Business.
- Stock Location ID remains stable.
- Operational modules reference existing Stock Locations only.

# 14. Database Design

## Prisma Model

```prisma
model StockLocation {
  id String @id @default(cuid())

  businessId String
  business Business @relation(fields: [businessId], references: [id])

  name String

  type StockLocationType

  description String?

  status StockLocationStatus

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Database Principles

- Stock Location is the physical storage identity.
- Operational modules reference Stock Location.
- Stock Location stores location information only.
- Inventory quantities belong to the Inventory module.

---

# 15. Testing Requirements

## Unit Tests

- Create Stock Location.
- Update Stock Location.
- Reject invalid Business references.

## Integration Tests

- Stock Location belongs to Business.
- Relationships load correctly.

## API Tests

Verify:

- POST /stock-locations
- GET /stock-locations
- GET /stock-locations/:id
- PATCH /stock-locations/:id
- DELETE /stock-locations/:id

---

# 16. Out of Scope

The Stock Location module does not:

- Store inventory quantities.
- Store products.
- Execute stock movements.
- Perform transfers.
- Calculate inventory balances.
- Calculate profit.
- Generate reports.

---

# 17. Possible Future Features

- Location hierarchy.
- Warehouse zones.
- Shelf and bin management.
- QR code labels.
- Capacity tracking.
- Location restrictions.
- Location archival.

---

# 18. Completion Criteria

The Stock Location module is complete when:

- Stock Location entity exists.
- Business relationship is implemented.
- CRUD operations work.
- Validation is implemented.
- Tests pass.
- Inventory and operational modules can reference Stock Locations.

---

# 19. Summary

The Stock Location module establishes the physical storage structure of the Bar Operations Reconciliation & Profit System.

It provides:

- Physical storage identity.
- Business ownership.
- Location organization.
- The foundation for inventory, stock movement, transfers, and operational workflows.