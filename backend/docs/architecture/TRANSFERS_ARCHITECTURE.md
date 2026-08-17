# 1. Purpose

The Transfer module manages the movement of stock between Branches or Stock Locations while preserving accountability between the sender and receiver.

It creates a traceable chain of custody for inventory movement and eliminates disputes about quantities transferred, received, or missing.

---

# 2. Module Responsibility

The Transfer module is responsible for:

- Creating stock transfer requests
- Tracking transfer lifecycle
- Recording sender confirmation
- Recording receiver confirmation
- Creating transfer-related stock movements
- Maintaining transfer accountability

The Transfer module is **not responsible** for:

- Inventory management
- Stock quantity calculations
- Product management
- Shift ownership
- Profit calculations
- Expense management

These responsibilities belong to their respective modules.

---

# 3. Module Dependencies

## Depends On

- Business Module
- Branch Module
- User Module
- Product Module
- Product Unit Module
- Inventory Item Module
- Stock Location Module
- Stock Movement Module
- Prisma
- Database

A Transfer cannot exist without a sender location and receiver location.

## Used By

The Transfer module is used by:

- Inventory Module
- Stock Movement Module
- Shift Module
- Discrepancy Module
- Reports Module

---

# 4. Design Principles

The Transfer module follows these principles:

- Every Transfer has a sender and receiver.
- Transfers require confirmation from both parties.
- Stock leaves the sender only after dispatch confirmation.
- Stock enters the receiver only after receiving confirmation.
- Transfer history is immutable.
- Every transfer creates Stock Movement records.
- Transfer responsibility remains traceable.

---

# 5. Module Skeleton

```
Transfer
│
├── Transfer Information
│   ├── Status
│   ├── Created Date
│   ├── Dispatched Date
│   ├── Received Date
│   └── Notes
│
├── Ownership
│   ├── Business
│   ├── Sender Branch
│   ├── Receiver Branch
│   ├── Sender User
│   └── Receiver User
│
├── Transfer Items
│   ├── Product
│   ├── Product Unit
│   └── Quantity
│
└── Operational References
    ├── Stock Movements
    ├── Discrepancies
    └── Reports
```

---

# 6. File Structure

```
backend/
├── src/
│   └── transfers/
│       ├── transfers.module.ts
│       ├── transfers.controller.ts
│       ├── transfers.service.ts
│       │
│       ├── dto/
│       │   ├── create-transfer.dto.ts
│       │   ├── dispatch-transfer.dto.ts
│       │   └── receive-transfer.dto.ts
│       │
│       └── entities/
│           ├── transfer.entity.ts
│           └── transfer-item.entity.ts
│
└── prisma/
    └── schema.prisma
```

---

# 7. Entity Design

## Transfer

### Fields

- id
- businessId
- senderBranchId
- receiverBranchId
- senderUserId
- receiverUserId
- status
- notes
- dispatchedAt
- receivedAt
- createdAt
- updatedAt

---

## Transfer Item

### Fields

- id
- transferId
- productId
- productUnitId
- quantity
- createdAt

---

## Relationships

Transfer belongs to:

- Business
- Sender Branch
- Receiver Branch
- Sender User
- Receiver User

Transfer has:

- Transfer Items[]
- Stock Movements[]

---

# 8. API Design

## Create Transfer

```
POST /transfers
```

Creates a new transfer request.

---

## Add Transfer Items

```
POST /transfers/:id/items
```

Adds products and quantities to the transfer.

---

## Dispatch Transfer

```
POST /transfers/:id/dispatch
```

Sender confirms stock leaving location.

Actions:

- Validate available stock.
- Create OUT Stock Movements.
- Change status.

---

## Receive Transfer

```
POST /transfers/:id/receive
```

Receiver confirms arrival.

Actions:

- Validate received quantities.
- Create IN Stock Movements.
- Complete transfer.

---

## Get Transfers

```
GET /transfers
```

Filters:

- Branch
- Status
- Date
- User

---

## Get Transfer

```
GET /transfers/:id
```

Returns transfer details.

---

# 9. Workflow

```
Sender creates transfer
        │
        ▼
Add transfer items
        │
        ▼
Pending dispatch
        │
        ▼
Sender confirms dispatch
        │
        ▼
Stock Movement OUT created
        │
        ▼
Transfer in transit
        │
        ▼
Receiver confirms receipt
        │
        ▼
Stock Movement IN created
        │
        ▼
Transfer completed
```

---

# 10. Integration Points

The Transfer module integrates with:

- Business Module
- Branch Module
- User Module
- Product Module
- Product Unit Module
- Inventory Item Module
- Stock Location Module
- Stock Movement Module
- Shift Module
- Discrepancy Module
- Reports Module

Transfers provide the chain of custody layer for inventory movement between locations.

# 11. Business Rules

- Every Transfer belongs to exactly one Business.
- Sender and receiver must belong to the same Business.
- Sender and receiver cannot be the same location.
- Every Transfer must contain at least one Transfer Item.
- Only authorized users can create transfers.
- Only sender-side users can dispatch transfers.
- Only receiver-side users can confirm receipt.
- Stock cannot leave sender inventory without dispatch confirmation.
- Stock cannot enter receiver inventory without receive confirmation.
- Completed Transfers cannot be modified.
- Transfer history is immutable.
- Every completed Transfer must have matching OUT and IN Stock Movements.

---

# 12. Implementation Order

1. Create Transfer Prisma model.
2. Create Transfer Item Prisma model.
3. Add Business relationships.
4. Add Branch relationships.
5. Add Product and Product Unit relationships.
6. Generate migration.
7. Generate Transfers module.
8. Create DTOs.
9. Implement transfer creation.
10. Implement transfer item management.
11. Implement dispatch workflow.
12. Implement receive workflow.
13. Create Stock Movement integration.
14. Add validation rules.
15. Test transfer lifecycle.

---

# 13. Validation Rules

## Transfer Creation

Validate:

- Business exists.
- Sender Branch exists.
- Receiver Branch exists.
- Sender and receiver are different.
- User has permission to create transfers.

## Dispatch Validation

Validate:

- Transfer exists.
- Transfer status is pending.
- Sender has enough inventory.
- Transfer items are valid.
- Sender user is authorized.

## Receive Validation

Validate:

- Transfer exists.
- Transfer has been dispatched.
- Receiver user is authorized.
- Received quantities are valid.

## Data Integrity

- Transfer records cannot be deleted after dispatch.
- Stock Movements are created transactionally.
- Transfer quantities cannot change after completion.

---

# 14. Database Design

## Prisma Model

```prisma
model Transfer {
  id String @id @default(cuid())

  businessId String
  business Business @relation(fields: [businessId], references: [id])

  senderBranchId String
  senderBranch Branch @relation("SenderTransfers", fields: [senderBranchId], references: [id])

  receiverBranchId String
  receiverBranch Branch @relation("ReceiverTransfers", fields: [receiverBranchId], references: [id])

  senderUserId String
  senderUser User @relation("SenderTransfers", fields: [senderUserId], references: [id])

  receiverUserId String?
  receiverUser User? @relation("ReceiverTransfers", fields: [receiverUserId], references: [id])

  status TransferStatus

  notes String?

  dispatchedAt DateTime?

  receivedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  items TransferItem[]
}
```

---

# 15. Testing Requirements

## Unit Tests

- Create Transfer.
- Add Transfer Items.
- Dispatch Transfer.
- Receive Transfer.
- Reject invalid quantities.

## Integration Tests

- Transfer creates Stock Movement OUT.
- Transfer creates Stock Movement IN.
- Inventory updates correctly.
- Sender and receiver accountability works.

## API Tests

Verify:

- POST /transfers
- POST /transfers/:id/items
- POST /transfers/:id/dispatch
- POST /transfers/:id/receive
- GET /transfers
- GET /transfers/:id

---

# 16. Out of Scope

The Transfer module does not:

- Manage inventory balances directly.
- Replace Stock Movements.
- Calculate profit.
- Handle supplier deliveries.
- Handle customer sales.
- Process payments.

---

# 17. Possible Future Features

- Transfer approval workflow.
- Transfer expiry.
- Partial receiving.
- Transfer tracking.
- Barcode scanning.
- Transfer cost calculation.
- Inter-company transfers.

---

# 18. Completion Criteria

The Transfer module is complete when:

- Transfer entity exists.
- Transfer Items exist.
- Dispatch workflow works.
- Receive workflow works.
- Stock Movements are generated correctly.
- Inventory updates correctly.
- Accountability between sender and receiver is preserved.

---

# 19. Summary

The Transfer module establishes controlled inventory movement between operational locations.

It provides:

- Sender accountability.
- Receiver accountability.
- Stock movement traceability.
- Transfer lifecycle management.
- Discrepancy detection foundation.
- Reliable inventory chain of custody.